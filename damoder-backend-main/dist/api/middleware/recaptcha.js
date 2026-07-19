"use strict";
const axios = require('axios');
const logger = require('../../utils/logger');
const { createError, sendErrorResponse } = require('../../utils/secure-error-handler');
/**
 * Middleware to verify Google reCAPTCHA v3 token
 * @param {string} action - Expected action name (e.g., 'login', 'register')
 */
const verifyRecaptcha = (action) => async (req, res, next) => {
    try {
        const recaptchaToken = req.body.recaptchaToken || req.headers['x-recaptcha-token'];
        if (!process.env.RECAPTCHA_SECRET_KEY) {
            logger.warn(`Bypassing reCAPTCHA verification for ${action} - RECAPTCHA_SECRET_KEY is missing from environment.`);
            return next();
        }
        if (!recaptchaToken) {
            return sendErrorResponse(res, createError.validation('reCAPTCHA token is missing'), req.requestId);
        }
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`);
        const data = response.data;
        if (!data.success) {
            logger.warn(`reCAPTCHA verification failed for ${action}`, {
                ip: req.ip,
                errorCodes: data['error-codes']
            });
            return sendErrorResponse(res, createError.validation('reCAPTCHA verification failed. Please try again.'), req.requestId);
        }
        if (data.score < 0.5) {
            logger.warn(`Low reCAPTCHA score (${data.score}) for ${action}`, {
                ip: req.ip,
                action: data.action
            });
            return sendErrorResponse(res, createError.forbidden('Request denied due to low trust score. Please try again.'), req.requestId);
        }
        if (data.action !== action) {
            logger.warn(`reCAPTCHA action mismatch. Expected ${action}, got ${data.action}`, {
                ip: req.ip
            });
            return sendErrorResponse(res, createError.validation('Invalid reCAPTCHA action.'), req.requestId);
        }
        next();
    }
    catch (error) {
        logger.error('reCAPTCHA verification error', error);
        return sendErrorResponse(res, createError.server('Error verifying reCAPTCHA'), req.requestId);
    }
};
module.exports = { verifyRecaptcha };
