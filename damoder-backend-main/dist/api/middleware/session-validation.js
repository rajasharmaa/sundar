"use strict";
const { connectToDB } = require('../../config/database');
const { ObjectId } = require('mongodb');
const logger = require('../../utils/logger');
const { createError, sendErrorResponse } = require('../../utils/secure-error-handler');
const { getCacheManager } = require('../../utils/cache-service');
const { redisClient } = require('../../config/redis');
// Middleware to validate session against password version
const validateSessionPasswordVersion = async (req, res, next) => {
    // Only validate for authenticated users
    if (!req.session || !req.session.user || !req.session.user.id) {
        return next();
    }
    try {
        const userId = req.session.user.id;
        // Skip validation for certain routes to avoid infinite loops
        const skipRoutes = [
            '/api/v1/auth/login',
            '/api/v1/auth/logout',
            '/api/v1/auth/status',
            '/api/v1/auth/refresh',
            '/health',
            '/ready'
        ];
        if (skipRoutes.some(route => req.originalUrl.startsWith(route))) {
            return next();
        }
        const db = await connectToDB();
        const usersCollection = db.collection('users');
        // Try to get user from cache first
        const cacheManager = getCacheManager(redisClient, 300);
        const cacheKey = `user_password_version:${userId}`;
        let currentUser = await cacheManager.get(cacheKey);
        if (!currentUser) {
            // Get current user record from database
            currentUser = await usersCollection.findOne({ _id: new ObjectId(userId) }, { projection: { passwordVersion: 1 } });
            if (currentUser) {
                // Cache the result for 5 minutes
                await cacheManager.set(cacheKey, currentUser, 300);
            }
        }
        if (!currentUser) {
            // User no longer exists, destroy session
            req.session.destroy(() => { });
            const error = createError.userNotFound();
            logger.warn('Session validation failed: user not found', {
                requestId: req.requestId,
                userId,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            return sendErrorResponse(res, error, req.requestId);
        }
        // Compare password versions
        const sessionPasswordVersion = req.session.user.passwordVersion || 1;
        const dbPasswordVersion = currentUser.passwordVersion || 1;
        if (sessionPasswordVersion !== dbPasswordVersion) {
            // Password has been changed, invalidate session
            req.session.destroy(() => { });
            logger.warn('Session invalidated due to password version mismatch', {
                requestId: req.requestId,
                userId,
                sessionVersion: sessionPasswordVersion,
                dbVersion: dbPasswordVersion,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            const error = createError.invalidCredentials();
            error.message = 'Session invalidated: Password has been changed. Please log in again.';
            error.code = 'PASSWORD_CHANGED';
            return sendErrorResponse(res, error, req.requestId);
        }
        // Password versions match, continue
        next();
    }
    catch (error) {
        logger.error('Session validation error', {
            requestId: req.requestId,
            error: error.message,
            stack: error.stack,
            userId: req.session?.user?.id
        });
        // For database errors, let the request continue to avoid blocking legitimate users
        // but log the incident for monitoring
        if (error.name === 'MongoServerError' || error.name === 'MongoNetworkError') {
            logger.warn('Database error in session validation, continuing request', {
                requestId: req.requestId,
                userId: req.session?.user?.id,
                error: error.message
            });
            return next();
        }
        // For other errors, still continue to avoid breaking the application
        next();
    }
};
module.exports = { validateSessionPasswordVersion };
