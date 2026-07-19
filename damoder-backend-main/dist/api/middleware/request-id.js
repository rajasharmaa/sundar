"use strict";
const crypto = require('crypto');
const logger = require('../../utils/logger');
// Middleware to generate and track request IDs
const requestIdMiddleware = (req, res, next) => {
    try {
        // Validate incoming request ID format if present
        let requestId = req.headers['x-request-id'];
        if (requestId) {
            // Validate UUID v4 format or hex string
            if (!/^[0-9a-f]{32}$|^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(requestId)) {
                logger.warn('Invalid request ID format, generating new one', {
                    invalidId: requestId,
                    ip: req.ip
                });
                requestId = null;
            }
        }
        // Generate a unique request ID if not already present or invalid
        if (!requestId) {
            requestId = crypto.randomUUID(); // Generates UUID v4
        }
        // Add request ID to the request object for later use
        req.requestId = requestId;
        // Make request ID available globally for logging
        process.currentRequestId = requestId;
        // Add request ID to response headers
        res.setHeader('X-Request-ID', requestId);
        // Log the start of request processing
        logger.debug('Request started', {
            requestId,
            method: req.method,
            url: req.originalUrl,
            ip: req.ip
        });
        // Continue with the request
        next();
    }
    catch (error) {
        logger.error('Request ID middleware error:', {
            message: error.message,
            stack: error.stack,
            url: req.originalUrl
        });
        next(); // Don't block the request on ID generation failure
    }
};
// Helper to get current request ID in other modules
const getCurrentRequestId = () => process.currentRequestId || 'unknown';
// Clean up global request ID after request completion
const cleanupRequestId = () => {
    delete process.currentRequestId;
};
module.exports = {
    requestIdMiddleware,
    getCurrentRequestId,
    cleanupRequestId
};
