"use strict";
const nodemailer = require('nodemailer');
const { queueManager } = require('./queue-manager');
const logger = require('../utils/logger');
const config = require('../config/env');
const { validateEmail } = require('../utils/validation');
// Create transporter for sending emails
const transporter = nodemailer.createTransport({
    service: config.EMAIL_SERVICE || 'gmail',
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // For self-signed certificates in development
    }
});
// Email templates
const emailTemplates = {
    'forgot-password': (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>You requested a password reset for your Damodar Traders account. Click the button below to reset it:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
      </div>
      <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} Damodar Traders. Industrial Supplies You Can Trust.</p>
    </div>
  `,
    'admin-inquiry-notification': (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #333;">New Customer Inquiry</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong></p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
        <p>${data.message}</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} Damodar Traders. Industrial Supplies You Can Trust.</p>
    </div>
  `,
    'welcome': (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #333;">Welcome to Damodar Traders!</h2>
      <p>Hello ${data.name},</p>
      <p>Thank you for registering with Damodar Traders. We're excited to have you as part of our community of industrial suppliers.</p>
      <p>Start exploring our wide range of industrial products and supplies today!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${config.FRONTEND_URL}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Visit Our Store</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} Damodar Traders. Industrial Supplies You Can Trust.</p>
    </div>
  `
};
// Render email template
const renderTemplate = (templateType, data) => {
    const template = emailTemplates[templateType];
    if (!template) {
        logger.warn(`Unknown email template: ${templateType}`);
        return data.html || data.text || '';
    }
    return template(data);
};
// Validate email job data
const validateEmailJob = (data) => {
    const errors = [];
    if (!data.to) {
        errors.push('Recipient email (to) is required');
    }
    else if (!validateEmail(data.to)) {
        errors.push('Invalid recipient email format');
    }
    if (!data.subject) {
        errors.push('Email subject is required');
    }
    if (!data.templateType && !data.html && !data.text) {
        errors.push('Either templateType or html/text content is required');
    }
    return errors;
};
// Initialize email worker
const emailWorker = queueManager.initWorker('email processing', async (job) => {
    const { to, subject, html, text, templateType, templateData = {}, attachments = [] } = job.data;
    try {
        // Validate job data
        const validationErrors = validateEmailJob(job.data);
        if (validationErrors.length > 0) {
            throw new Error(`Invalid email job data: ${validationErrors.join(', ')}`);
        }
        logger.info('Processing email job', {
            jobId: job.id,
            to,
            subject,
            templateType,
            attempts: job.attemptsMade
        });
        // Render template if templateType is provided
        let emailHtml = html;
        let emailText = text;
        if (templateType) {
            emailHtml = renderTemplate(templateType, {
                ...templateData,
                resetLink: html, // For backward compatibility
                name: templateData.name || 'Customer',
                email: to,
                subject: subject
            });
        }
        const mailOptions = {
            from: config.EMAIL_FROM || config.EMAIL_USER,
            to,
            subject,
            html: emailHtml,
            text: emailText,
            attachments: attachments.length > 0 ? attachments : undefined
        };
        const result = await transporter.sendMail(mailOptions);
        logger.info('Email sent successfully', {
            jobId: job.id,
            to,
            messageId: result.messageId,
            response: result.response
        });
        return {
            success: true,
            messageId: result.messageId,
            response: result.response
        };
    }
    catch (error) {
        logger.error('Email sending failed', {
            jobId: job.id,
            to,
            error: error.message,
            stack: error.stack,
            attempts: job.attemptsMade
        });
        // Log failed email to database for manual review
        try {
            const db = require('../config/database').connectToDB;
            const dbConn = await db();
            await dbConn.collection('failed_emails').insertOne({
                jobId: job.id,
                to,
                subject,
                error: error.message,
                failedAt: new Date(),
                attempts: job.attemptsMade
            });
        }
        catch (dbError) {
            logger.error('Failed to log email failure to database', {
                jobId: job.id,
                dbError: dbError.message
            });
        }
        throw error;
    }
}, {
    concurrency: 3, // Reduced concurrency to avoid rate limiting
    settings: {
        backoffStrategy: 'exponential',
        backoffDelay: 5000 // Start with 5 second delay
    }
});
module.exports = emailWorker;
