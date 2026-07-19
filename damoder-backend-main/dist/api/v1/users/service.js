"use strict";
// 👤 USERS SERVICE
// Business logic layer for user operations
const { ObjectId } = require('mongodb');
const { connectToDB } = require('../../../config/database');
const { validateEmail, validatePhone } = require('../../../utils/validation');
const logger = require('../../../utils/logger');
const { createError } = require('../../../utils/secure-error-handler');
const bcrypt = require('bcryptjs');
// Get current user profile
const getMe = async (userId) => {
    try {
        const db = await connectToDB();
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } } // Exclude password
        );
        if (!user) {
            throw createError.notFound('User not found');
        }
        // Transform for frontend compatibility
        return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            phone: user.phone || '',
            avatar: user.avatar || '',
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }
    catch (err) {
        if (err.name === 'ValidationError')
            throw err;
        logger.error('Get user profile service error:', {
            userId,
            error: err.message,
            stack: err.stack
        });
        throw createError.internal('Unable to fetch user profile');
    }
};
// Update user profile
const updateProfile = async (userId, updateData) => {
    try {
        const db = await connectToDB();
        // Validate update data
        const allowedUpdates = ['name', 'phone', 'avatar'];
        const updates = {};
        for (const key of allowedUpdates) {
            if (updateData[key] !== undefined) {
                if (key === 'phone' && updateData.phone) {
                    if (!validatePhone(updateData.phone)) {
                        throw createError.invalidFormat('phone', 'Invalid phone number format');
                    }
                    updates.phone = updateData.phone.trim();
                }
                else if (key === 'name' && updateData.name) {
                    if (typeof updateData.name !== 'string' || updateData.name.trim().length < 2) {
                        throw createError.invalidFormat('name', 'Name must be at least 2 characters');
                    }
                    updates.name = updateData.name.trim();
                }
                else if (key === 'avatar') {
                    updates.avatar = updateData.avatar || '';
                }
            }
        }
        if (Object.keys(updates).length === 0) {
            throw createError.badRequest('No valid fields to update');
        }
        updates.updatedAt = new Date();
        const result = await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { $set: updates });
        if (result.matchedCount === 0) {
            throw createError.notFound('User not found');
        }
        // Return updated user
        const updatedUser = await db.collection('users').findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } });
        return {
            id: updatedUser._id.toString(),
            email: updatedUser.email,
            name: updatedUser.name,
            phone: updatedUser.phone || '',
            avatar: updatedUser.avatar || '',
            role: updatedUser.role,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
        };
    }
    catch (err) {
        if (err.name === 'ValidationError')
            throw err;
        logger.error('Update user profile service error:', {
            userId,
            updateData,
            error: err.message,
            stack: err.stack
        });
        throw err;
    }
};
// Change user password
const changePassword = async (userId, currentPassword, newPassword) => {
    try {
        const db = await connectToDB();
        // Get user with password
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!user) {
            throw createError.notFound('User not found');
        }
        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw createError.unauthorized('Current password is incorrect');
        }
        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        // Update password
        const result = await db.collection('users').updateOne({ _id: new ObjectId(userId) }, {
            $set: {
                password: hashedPassword,
                passwordVersion: (user.passwordVersion || 1) + 1,
                updatedAt: new Date()
            }
        });
        if (result.matchedCount === 0) {
            throw createError.notFound('User not found');
        }
        logger.info('User password changed successfully', { userId });
        return { message: 'Password changed successfully' };
    }
    catch (err) {
        if (err.name === 'ValidationError')
            throw err;
        logger.error('Change password service error:', {
            userId,
            error: err.message,
            stack: err.stack
        });
        throw err;
    }
};
module.exports = {
    getMe,
    updateProfile,
    changePassword
};
