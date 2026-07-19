"use strict";
const { ObjectId } = require('mongodb');
const { connectToDB } = require('../config/database');
const logger = require('../utils/logger');
const { createError, sendErrorResponse } = require('../middleware/error.handler');
const { validateObjectId, validateIndianPhone } = require('../utils/validation');
/**
 * Get user profile
 * GET /api/v1/users/profile
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const db = await connectToDB();
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) }, { projection: { password: 0, rememberToken: 0, resetToken: 0 } });
        if (!user) {
            return sendErrorResponse(res, createError.notFound('User not found'), req.requestId);
        }
        const userProfile = {
            ...user,
            id: user._id.toString()
        };
        return res.status(200).json({
            success: true,
            data: userProfile
        });
    }
    catch (err) {
        logger.error('Get profile error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Update user profile
 * PUT /api/v1/users/profile
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone, avatarColor, avatarIcon, businessName, businessType, themeColor } = req.body;
        // Validate inputs
        if (name && (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 50)) {
            return sendErrorResponse(res, createError.badRequest('Name must be 2-50 characters'), req.requestId);
        }
        if (phone && !validateIndianPhone(phone)) {
            return sendErrorResponse(res, createError.badRequest('Invalid phone number'), req.requestId);
        }
        if (businessName && (typeof businessName !== 'string' || businessName.trim().length > 100)) {
            return sendErrorResponse(res, createError.badRequest('Business name must be less than 100 characters'), req.requestId);
        }
        const db = await connectToDB();
        const updates = { updatedAt: new Date() };
        if (name)
            updates.name = name.trim();
        if (phone)
            updates.phone = phone.trim();
        if (avatarColor !== undefined)
            updates.avatarColor = avatarColor;
        if (avatarIcon !== undefined)
            updates.avatarIcon = avatarIcon;
        if (businessName !== undefined)
            updates.businessName = businessName.trim();
        if (businessType !== undefined)
            updates.businessType = businessType.trim();
        if (themeColor !== undefined)
            updates.themeColor = themeColor;
        const result = await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { $set: updates });
        if (result.matchedCount === 0) {
            return sendErrorResponse(res, createError.notFound('User not found'), req.requestId);
        }
        // Retrieve updated user to return to the client
        const updatedUser = await db.collection('users').findOne({ _id: new ObjectId(userId) }, { projection: { password: 0, rememberToken: 0, resetToken: 0 } });
        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                ...updatedUser,
                id: updatedUser._id.toString()
            }
        });
    }
    catch (err) {
        logger.error('Update profile error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Get user wishlist
 * GET /api/v1/users/wishlist
 */
const getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const db = await connectToDB();
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) }, { projection: { wishlist: 1 } });
        const wishlistIds = user?.wishlist || [];
        if (wishlistIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }
        // Validate all wishlist IDs
        const validIds = wishlistIds.filter(id => validateObjectId(id));
        const products = await db.collection('products').find({ _id: { $in: validIds.map(id => new ObjectId(id)) } }).toArray();
        const cleanProducts = products.map(p => ({
            ...p,
            id: p._id.toString()
        }));
        return res.status(200).json({
            success: true,
            data: cleanProducts
        });
    }
    catch (err) {
        logger.error('Get wishlist error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Add product to wishlist
 * POST /api/v1/users/wishlist/:productId
 */
const addToWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        if (!validateObjectId(productId)) {
            return sendErrorResponse(res, createError.badRequest('Invalid product ID'), req.requestId);
        }
        const db = await connectToDB();
        await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { $addToSet: { wishlist: productId } });
        return res.status(200).json({
            success: true,
            message: 'Added to wishlist'
        });
    }
    catch (err) {
        logger.error('Add to wishlist error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Remove product from wishlist
 * DELETE /api/v1/users/wishlist/:productId
 */
const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        if (!validateObjectId(productId)) {
            return sendErrorResponse(res, createError.badRequest('Invalid product ID'), req.requestId);
        }
        const db = await connectToDB();
        await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { $pull: { wishlist: productId } });
        return res.status(200).json({
            success: true,
            message: 'Removed from wishlist'
        });
    }
    catch (err) {
        logger.error('Remove from wishlist error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Get user inquiries
 * GET /api/v1/users/inquiries
 */
const getMyInquiries = async (req, res) => {
    try {
        const userId = req.user.id;
        const db = await connectToDB();
        const inquiries = await db.collection('inquiries')
            .find({ userId: new ObjectId(userId) })
            .sort({ createdAt: -1 })
            .toArray();
        return res.status(200).json({
            success: true,
            data: inquiries
        });
    }
    catch (err) {
        logger.error('Get my inquiries error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Track recently viewed product
 * POST /api/v1/users/recently-viewed
 */
const trackRecentlyViewed = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;
        if (!productId || !validateObjectId(productId)) {
            return sendErrorResponse(res, createError.badRequest('Invalid product ID'), req.requestId);
        }
        const db = await connectToDB();
        const usersCollection = db.collection('users');
        // Add product to recently viewed (at beginning of array)
        // and keep only last 20 items
        await usersCollection.updateOne({ _id: new ObjectId(userId) }, {
            $push: {
                recentlyViewed: {
                    $each: [{ productId: new ObjectId(productId), viewedAt: new Date() }],
                    $position: 0,
                    $slice: 20 // Keep only last 20 viewed products
                }
            }
        });
        return res.status(200).json({
            success: true,
            message: 'Product view tracked'
        });
    }
    catch (err) {
        logger.error('Track recently viewed error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Get user's recently viewed products
 * GET /api/v1/users/recently-viewed?limit=10
 */
const getRecentlyViewed = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;
        const db = await connectToDB();
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) }, { projection: { recentlyViewed: 1 } });
        const recentlyViewedIds = user?.recentlyViewed || [];
        if (recentlyViewedIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No recently viewed products'
            });
        }
        // Get product IDs from recently viewed array
        const productIds = recentlyViewedIds.slice(0, limit).map(item => item.productId);
        // Fetch the actual products
        const products = await db.collection('products')
            .find({
            _id: { $in: productIds },
            active: { $ne: false }
        })
            .toArray();
        // Map products back to maintain order and include viewedAt
        const orderedProducts = productIds
            .map(productId => {
            const product = products.find(p => p._id.toString() === productId.toString());
            const viewedItem = recentlyViewedIds.find(item => item.productId.toString() === productId.toString());
            if (!product)
                return null;
            return {
                ...product,
                id: product._id.toString(),
                viewedAt: viewedItem?.viewedAt
            };
        })
            .filter(Boolean); // Remove nulls
        return res.status(200).json({
            success: true,
            data: orderedProducts
        });
    }
    catch (err) {
        logger.error('Get recently viewed error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Clear recently viewed products
 * DELETE /api/v1/users/recently-viewed
 */
const clearRecentlyViewed = async (req, res) => {
    try {
        const userId = req.user.id;
        const db = await connectToDB();
        await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { $set: { recentlyViewed: [] } });
        return res.status(200).json({
            success: true,
            message: 'Recently viewed cleared'
        });
    }
    catch (err) {
        logger.error('Clear recently viewed error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
module.exports = {
    getProfile,
    updateProfile,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    getMyInquiries,
    trackRecentlyViewed,
    getRecentlyViewed,
    clearRecentlyViewed
};
