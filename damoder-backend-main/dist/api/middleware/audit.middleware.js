"use strict";
const { connectToDB } = require('../../config/database');
const { ObjectId } = require('mongodb');
const logger = require('../../utils/logger');
/**
 * Middleware factory for audit logging
 * @param {string} action - The audit action (e.g. PRODUCT_UPDATED)
 * @param {function} getDetails - Optional function to extract details from req/res
 */
const auditLog = (action, getDetails = () => ({})) => async (req, res, next) => {
    // Capture the original send to intercept the response status
    const originalSend = res.send;
    res.send = function (data) {
        res.send = originalSend;
        // Asynchronously log the action after response is sent to not block the request
        setTimeout(async () => {
            try {
                const status = res.statusCode >= 400 ? 'FAILURE' : 'SUCCESS';
                let details = {};
                try {
                    details = getDetails(req, res, data);
                }
                catch (e) {
                    logger.warn('Error extracting audit details', e);
                }
                const db = await connectToDB();
                const userIdStr = req.user?.id || req.user?._id;
                await db.collection('auditlogs').insertOne({
                    action,
                    userId: userIdStr ? new ObjectId(userIdStr) : null,
                    userEmail: req.user?.email || req.body?.email || null,
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent'),
                    details,
                    status,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
            catch (error) {
                logger.error('Failed to write audit log', error);
            }
        }, 0);
        return res.send(data);
    };
    next();
};
module.exports = { auditLog };
