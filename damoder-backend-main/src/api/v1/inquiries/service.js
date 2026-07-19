// 📨 INQUIRIES SERVICE
// Business logic layer for inquiry operations

const logger = require('../../../utils/logger');
const { ObjectId } = require('mongodb');
const { connectToDB } = require('../../../config/database');
const { createError } = require('../../../utils/secure-error-handler');
const { sanitizeInput } = require('../../../utils/validation');
const { queueManager } = require('../../../config/queue');

// Create new inquiry
const createInquiry = async (userData, inquiryData) => {
  try {
    const { subject, message, phone } = inquiryData;

    // Validate inputs
    if (!subject || typeof subject !== 'string' || subject.trim().length < 5) {
      throw createError.invalidFormat('subject', 'At least 5 characters');
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      throw createError.invalidFormat('message', 'At least 10 characters');
    }

    // Sanitize inputs
    const sanitizedSubject = sanitizeInput(subject.trim().substring(0, 200));
    const sanitizedMessage = sanitizeInput(message.trim().substring(0, 2000));
    const sanitizedPhone = phone ? sanitizeInput(phone.trim().substring(0, 20)) : '';

    const inquiry = {
      userId: new ObjectId(userData.id),
      email: userData.email,
      name: userData.name,
      phone: sanitizedPhone,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const db = await connectToDB();
    const result = await db.collection('inquiries').insertOne(inquiry);

    // Send notification to admin (non-blocking)
    setImmediate(async () => {
      try {
        const emailQueue = queueManager.emailQueue;
        if (emailQueue) {
          await emailQueue.add('admin-notification', {
            to: process.env.ADMIN_EMAIL || 'admin@damoder.com',
            subject: `New Inquiry: ${sanitizedSubject}`,
            html: `
              <h3>New Customer Inquiry</h3>
              <p><strong>Name:</strong> ${userData.name}</p>
              <p><strong>Email:</strong> ${userData.email}</p>
              <p><strong>Phone:</strong> ${sanitizedPhone || 'Not provided'}</p>
              <p><strong>Subject:</strong> ${sanitizedSubject}</p>
              <p><strong>Message:</strong></p>
              <p>${sanitizedMessage}</p>
            `,
            templateType: 'admin-inquiry-notification'
          });
        }
      } catch (notificationErr) {
        logger.warn('Failed to send inquiry notification:', {
          inquiryId: result.insertedId,
          error: notificationErr.message
        });
      }
    });

    return {
      success: true,
      message: 'Inquiry received',
      id: result.insertedId,
      inquiryId: result.insertedId.toString()
    };
  } catch (err) {
    if (err.name === 'ValidationError') throw err;
    logger.error('Create inquiry service error:', {
      userId: userData.id,
      error: err.message,
      stack: err.stack
    });
    throw createError.internal('Inquiry submission service temporarily unavailable');
  }
};

// Get user's inquiries
const getUserInquiries = async (userId) => {
  try {
    const db = await connectToDB();

    const inquiries = await db.collection('inquiries')
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    return {
      success: true,
      data: inquiries.map(inquiry => ({
        id: inquiry._id.toString(),
        subject: inquiry.subject,
        status: inquiry.status,
        createdAt: inquiry.createdAt,
        updatedAt: inquiry.updatedAt
      }))
    };
  } catch (err) {
    logger.error('Get user inquiries service error:', {
      userId,
      error: err.message,
      stack: err.stack
    });
    throw createError.internal('Unable to fetch inquiries');
  }
};

// Get all inquiries (admin only)
const getAllInquiries = async () => {
  try {
    const db = await connectToDB();

    const inquiries = await db.collection('inquiries')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return {
      success: true,
      data: inquiries.map(inquiry => ({
        id: inquiry._id.toString(),
        userId: inquiry.userId.toString(),
        email: inquiry.email,
        name: inquiry.name,
        subject: inquiry.subject,
        status: inquiry.status,
        createdAt: inquiry.createdAt,
        updatedAt: inquiry.updatedAt
      }))
    };
  } catch (err) {
    logger.error('Get all inquiries service error:', {
      error: err.message,
      stack: err.stack
    });
    throw createError.internal('Unable to fetch inquiries');
  }
};

// Get inquiry by ID
const getInquiryById = async (inquiryId) => {
  try {
    if (!ObjectId.isValid(inquiryId)) {
      throw createError.badRequest('Invalid inquiry ID');
    }

    const db = await connectToDB();
    const inquiry = await db.collection('inquiries')
      .findOne({ _id: new ObjectId(inquiryId) });

    if (!inquiry) {
      throw createError.notFound('Inquiry not found');
    }

    return {
      success: true,
      data: {
        id: inquiry._id.toString(),
        userId: inquiry.userId.toString(),
        email: inquiry.email,
        name: inquiry.name,
        phone: inquiry.phone,
        subject: inquiry.subject,
        message: inquiry.message,
        status: inquiry.status,
        createdAt: inquiry.createdAt,
        updatedAt: inquiry.updatedAt
      }
    };
  } catch (err) {
    if (err.name === 'ValidationError') throw err;
    logger.error('Get inquiry by ID service error:', {
      inquiryId,
      error: err.message,
      stack: err.stack
    });
    throw createError.internal('Unable to fetch inquiry');
  }
};

// Update inquiry status
const updateInquiryStatus = async (inquiryId, status) => {
  try {
    if (!ObjectId.isValid(inquiryId)) {
      throw createError.badRequest('Invalid inquiry ID');
    }

    const validStatuses = ['new', 'in-progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      throw createError.badRequest('Invalid status value');
    }

    const db = await connectToDB();
    const result = await db.collection('inquiries').updateOne(
      { _id: new ObjectId(inquiryId) },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      throw createError.notFound('Inquiry not found');
    }

    return {
      success: true,
      message: 'Inquiry status updated successfully'
    };
  } catch (err) {
    if (err.name === 'ValidationError') throw err;
    logger.error('Update inquiry status service error:', {
      inquiryId,
      status,
      error: err.message,
      stack: err.stack
    });
    throw err;
  }
};

module.exports = {
  createInquiry,
  getUserInquiries,
  getAllInquiries,
  getInquiryById,
  updateInquiryStatus
};