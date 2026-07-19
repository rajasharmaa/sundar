const { ObjectId } = require('mongodb');
const { connectToDB } = require('../../../config/database');
const logger = require('../../../utils/logger');
const { createError, sendErrorResponse } = require('../../../utils/secure-error-handler');
const { validateObjectId } = require('../../../utils/validation');

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const db = await connectToDB();
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(userId) },
            { projection: { password: 0, rememberToken: 0, resetToken: 0 } }
        );

        if (!user) {
            const error = createError.userNotFound();
            return sendErrorResponse(res, error, req.requestId);
        }

        user.id = user._id.toString();
        res.json(user);
    } catch (err) {
        logger.error('Get profile error:', { 
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('User profile service temporarily unavailable');
        return sendErrorResponse(res, error, req.requestId);
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone } = req.body;

        // Validate inputs
        if (name && (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 50)) {
            const error = createError.invalidFormat('name', '2-50 characters');
            return sendErrorResponse(res, error, req.requestId);
        }

        if (phone) {
            const { validateIndianPhone } = require('../../../utils/validation');
            if (!validateIndianPhone(phone)) {
                const error = createError.invalidFormat('phone', 'Valid Indian phone number');
                return sendErrorResponse(res, error, req.requestId);
            }
        }

        const db = await connectToDB();
        const updates = { updatedAt: new Date() };
        if (name) updates.name = name.trim();
        if (phone) updates.phone = phone.trim();
        if (req.body.avatarColor) updates.avatarColor = req.body.avatarColor.trim();
        if (req.body.avatarIcon) updates.avatarIcon = req.body.avatarIcon.trim();
        if (req.body.businessName) updates.businessName = req.body.businessName.trim();
        if (req.body.businessType) updates.businessType = req.body.businessType.trim();
        if (req.body.themeColor) updates.themeColor = req.body.themeColor.trim();

        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            const error = createError.userNotFound();
            return sendErrorResponse(res, error, req.requestId);
        }

        res.json({ message: 'Profile updated successfully', success: true });
    } catch (err) {
        logger.error('Update profile error:', { 
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('Profile update service temporarily unavailable');
        return sendErrorResponse(res, error, req.requestId);
    }
};

const getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const db = await connectToDB();
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(userId) },
            { projection: { wishlist: 1 } }
        );

        const wishlistIds = user?.wishlist || [];
        if (wishlistIds.length === 0) return res.json([]);

        // Validate all wishlist IDs
        const validIds = wishlistIds.filter(id => validateObjectId(id));
        if (validIds.length !== wishlistIds.length) {
            logger.warn('Invalid wishlist IDs found for user', { 
                requestId: req.requestId,
                userId,
                invalidCount: wishlistIds.length - validIds.length
            });
        }

        const products = await db.collection('products').find(
            { _id: { $in: validIds.map(id => new ObjectId(id)) } }
        ).toArray();

        const cleanProducts = products.map(p => ({
            ...p,
            id: p._id.toString()
        }));

        res.json(cleanProducts);
    } catch (err) {
        logger.error('Get wishlist error:', { 
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('Wishlist service temporarily unavailable');
        return sendErrorResponse(res, error, req.requestId);
    }
};

const addToWishlist = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        if (!validateObjectId(productId)) {
            const error = createError.invalidFormat('productId', 'Valid MongoDB ObjectId');
            return sendErrorResponse(res, error, req.requestId);
        }

        const db = await connectToDB();
        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { wishlist: productId } }
        );

        res.json({ success: true, message: 'Added to wishlist' });
    } catch (err) {
        logger.error('Add to wishlist error:', { 
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('Wishlist service temporarily unavailable');
        return sendErrorResponse(res, error, req.requestId);
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        if (!validateObjectId(productId)) {
            const error = createError.invalidFormat('productId', 'Valid MongoDB ObjectId');
            return sendErrorResponse(res, error, req.requestId);
        }

        const db = await connectToDB();
        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { wishlist: productId } }
        );

        res.json({ success: true, message: 'Removed from wishlist' });
    } catch (err) {
        logger.error('Remove from wishlist error:', { 
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('Wishlist service temporarily unavailable');
        return sendErrorResponse(res, error, req.requestId);
    }
};

const getMyInquiries = async (req, res) => {
    try {
        const userId = req.user.id;
        const db = await connectToDB();
        const inquiries = await db.collection('inquiries')
            .find({ userId: new ObjectId(userId) })
            .sort({ createdAt: -1 })
            .toArray();

        res.json(inquiries);
    } catch (err) {
        logger.error('Get my inquiries error:', { 
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('Inquiries service temporarily unavailable');
        return sendErrorResponse(res, error, req.requestId);
    }
};

const getAllUsers = async (req, res) => {
    try {
        const db = await connectToDB();
        const users = await db.collection('users').find({}, {
            projection: { password: 0, rememberToken: 0, resetToken: 0 }
        })
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray();

        res.json(users);
    } catch (err) {
        logger.error('Get all users error:', { 
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('User listing service temporarily unavailable');
        return sendErrorResponse(res, error, req.requestId);
    }
};

// Recently viewed products functions
const trackRecentlyViewed = async (req, res) => {
    try {
        logger.info('👁️ Tracking recently viewed:', {
            requestId: req.requestId,
            userId: req.user.id,
            productId: req.body.productId
        });
        
        const userId = req.user.id;
        const { productId } = req.body;

        if (!productId || !validateObjectId(productId)) {
            logger.warn('Invalid productId for recently viewed:', { productId });
            const error = createError.invalidFormat('productId', 'Valid MongoDB ObjectId');
            return sendErrorResponse(res, error, req.requestId);
        }

        const db = await connectToDB();
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(userId) },
            { projection: { recentlyViewed: 1 } }
        );

        let recentlyViewed = user?.recentlyViewed || [];
        
        // Remove if already exists
        recentlyViewed = recentlyViewed.filter(id => id !== productId);
        
        // Add to front
        recentlyViewed.unshift(productId);
        
        // Keep only last 20
        recentlyViewed = recentlyViewed.slice(0, 20);

        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { recentlyViewed, updatedAt: new Date() } }
        );

        logger.info('✅ Recently viewed tracked successfully:', {
            requestId: req.requestId,
            userId,
            productId,
            count: recentlyViewed.length
        });

        res.json({ success: true, message: 'Recently viewed tracked' });
    } catch (err) {
        logger.error('Track recently viewed error:', { 
            requestId: req.requestId,
            error: err.message,
            stack: err.stack,
            name: err.name
        });
        
        let errorMessage = 'Recently viewed tracking temporarily unavailable';
        if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
            errorMessage = 'Database connection issue. Please try again shortly.';
        }
        
        const error = createError.internal(errorMessage);
        return sendErrorResponse(res, error, req.requestId);
    }
};

const getRecentlyViewed = async (req, res) => {
    try {
        const userId = req.user.id;
        const db = await connectToDB();
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(userId) },
            { projection: { recentlyViewed: 1 } }
        );

        const recentlyViewedIds = user?.recentlyViewed || [];
        if (recentlyViewedIds.length === 0) return res.json([]);

        // Validate all IDs
        const validIds = recentlyViewedIds.filter(id => validateObjectId(id));
        const products = await db.collection('products').find(
            { _id: { $in: validIds.map(id => new ObjectId(id)) } }
        ).toArray();

        // Maintain order from recentlyViewedIds
        const orderedProducts = validIds.map(id => 
            products.find(p => p._id.toString() === id)
        ).filter(p => p);

        const cleanProducts = orderedProducts.map(p => ({
            ...p,
            id: p._id.toString()
        }));

        res.json(cleanProducts);
    } catch (err) {
        logger.error('Get recently viewed error:', { 
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('Recently viewed service temporarily unavailable');
        return sendErrorResponse(res, error, req.requestId);
    }
};

const clearRecentlyViewed = async (req, res) => {
    try {
        const userId = req.user.id;
        const db = await connectToDB();

        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { recentlyViewed: [], updatedAt: new Date() } }
        );

        res.json({ success: true, message: 'Recently viewed cleared' });
    } catch (err) {
        logger.error('Clear recently viewed error:', { 
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('Recently viewed service temporarily unavailable');
        return sendErrorResponse(res, error, req.requestId);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    getMyInquiries,
    getAllUsers,
    trackRecentlyViewed,
    getRecentlyViewed,
    clearRecentlyViewed
};
