"use strict";
const rateLimit = require('express-rate-limit');
const logger = require('./logger');
const config = require('../config/env');
// 🔐 SIMPLE RATE LIMITING WITHOUT REDIS DEPENDENCY
// 🔧 RATE LIMITING CONFIGURATION
const RATE_LIMIT_CONFIG = {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    // Endpoint-specific limits - MORE LENIENT TO PREVENT LEGITIMATE REQUEST BLOCKING
    AUTH: {
        LOGIN: {
            max: config.NODE_ENV === 'development' ? 100 : 30,
            message: 'Too many login attempts. Please try again later.'
        },
        REGISTER: {
            max: config.NODE_ENV === 'development' ? 50 : 20,
            message: 'Too many registration attempts. Please try again later.'
        },
        FORGOT_PASSWORD: { max: 20, message: 'Too many password reset attempts. Please try again later.' },
        RESET_PASSWORD: { max: 20, message: 'Too many password reset attempts. Please try again later.' },
        CHANGE_PASSWORD: { max: 20, message: 'Too many password change attempts. Please try again later.' },
        EMAIL_CHECK: { max: 50, message: 'Too many email check attempts. Please try again later.' }
    },
    API: {
        GENERAL: { max: 2000, message: 'Too many API requests' },
        SEARCH: { max: 200, message: 'Too many search requests' },
        UPLOAD: { max: 50, message: 'Too many upload attempts' }
    },
    STRICT: { max: 1, message: 'Rate limit exceeded' }
};
// 🔐 SIMPLE RATE LIMITER FACTORY - NO REDIS DEPENDENCY
const createSimpleRateLimiter = (config, keyPrefix = 'rate-limit') => {
    return rateLimit({
        windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
        max: config.max,
        message: {
            error: config.message,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil(RATE_LIMIT_CONFIG.WINDOW_MS / 1000)
        },
        standardHeaders: true,
        legacyHeaders: false,
        // 🔐 USE DEFAULT KEY GENERATOR (handles IPv6 properly)
        // Remove custom keyGenerator to use express-rate-limit's built-in safe implementation
        handler: (req, res) => {
            const ip = req.ip || req.connection?.remoteAddress;
            const userAgent = req.headers['user-agent'] || 'unknown';
            // 🔐 SECURITY LOGGING
            logger.warn('🚨 Rate limit triggered', {
                endpoint: req.originalUrl,
                method: req.method,
                ip: ip,
                userAgent: userAgent.substring(0, 100),
                limit: config.max,
                window: `${RATE_LIMIT_CONFIG.WINDOW_MS / 1000}s`,
                timestamp: new Date().toISOString()
            });
            // 🔐 SEND ERROR RESPONSE
            res.status(429).json({
                success: false,
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: config.message,
                    retryAfter: Math.ceil(RATE_LIMIT_CONFIG.WINDOW_MS / 1000),
                    timestamp: new Date().toISOString()
                }
            });
        }
    });
};
// 🔐 AUTHENTICATION ENDPOINT LIMITERS
const login = createSimpleRateLimiter(RATE_LIMIT_CONFIG.AUTH.LOGIN, 'auth-login');
const register = createSimpleRateLimiter(RATE_LIMIT_CONFIG.AUTH.REGISTER, 'auth-register');
const forgotPassword = createSimpleRateLimiter(RATE_LIMIT_CONFIG.AUTH.FORGOT_PASSWORD, 'auth-forgot');
const resetPassword = createSimpleRateLimiter(RATE_LIMIT_CONFIG.AUTH.RESET_PASSWORD, 'auth-reset');
const changePassword = createSimpleRateLimiter(RATE_LIMIT_CONFIG.AUTH.CHANGE_PASSWORD, 'auth-change');
const emailCheck = createSimpleRateLimiter(RATE_LIMIT_CONFIG.AUTH.EMAIL_CHECK, 'auth-email');
// 🔐 API ENDPOINT LIMITERS
const api = createSimpleRateLimiter(RATE_LIMIT_CONFIG.API.GENERAL, 'api-general');
const search = createSimpleRateLimiter(RATE_LIMIT_CONFIG.API.SEARCH, 'api-search');
const upload = createSimpleRateLimiter(RATE_LIMIT_CONFIG.API.UPLOAD, 'api-upload');
// 🔐 STRICT SECURITY LIMITER
const strict = createSimpleRateLimiter(RATE_LIMIT_CONFIG.STRICT, 'strict-security');
// 🔐 EXPORT SIMPLE RATE LIMITING MODULE
module.exports = {
    // Pre-configured limiters
    login,
    api,
    register,
    forgotPassword,
    resetPassword,
    changePassword,
    emailCheck,
    strict,
    search,
    upload,
    // Configuration
    RATE_LIMIT_CONFIG,
    // Utility functions
    getRateLimitInfo: () => ({
        windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
        authLimits: RATE_LIMIT_CONFIG.AUTH,
        apiLimits: RATE_LIMIT_CONFIG.API
    })
};
