// ❤️ WISHLIST CONTROLLER
// Enterprise-grade wishlist management with optimal performance

const { ObjectId } = require('mongodb');
const { connectToDB } = require('../../../config/database');
const logger = require('../../../utils/logger');
const { createError, sendErrorResponse } = require('../../../utils/secure-error-handler');

/**
 * @route   GET /api/v1/wishlist
 * @desc    Get user's wishlist with product details
 * @access  Private
 */
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    logger.info('Fetching wishlist', { userId });

    // Validate user ID format
    let objectId;
    try {
      objectId = new ObjectId(userId);
    } catch (err) {
      logger.warn('Invalid user ID format in wishlist request', { userId });
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
        code: 'INVALID_USER_ID'
      });
    }

    // Get database connection
    const db = await connectToDB();

    // Fetch wishlist items with product details using aggregation
    const wishlistItems = await db.collection('wishlists').aggregate([
      { $match: { userId: objectId } },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      { $match: { 'product.active': { $ne: false } } },
      {
        $project: {
          _id: 1,
          productId: 1,
          createdAt: 1,
          'product._id': 1,
          'product.name': 1,
          'product.description': 1,
          'product.price': 1,
          'product.discount': 1,
          'product.images': 1,
          'product.image': 1,
          'product.category': 1,
          'product.rating': 1,
          'product.reviews': 1,
          'product.inStock': 1,
          'product.active': 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    // Transform data for frontend
    const products = wishlistItems.map(item => {
      const p = item.product;
      const primaryImage = p.image || (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null);

      return {
        id: p._id.toString(),
        _id: p._id.toString(),
        name: p.name,
        description: p.description,
        price: p.price,
        discount: p.discount,
        image: primaryImage,
        images: Array.isArray(p.images) ? p.images : (primaryImage ? [primaryImage] : []),
        category: p.category,
        rating: p.rating,
        reviews: p.reviews,
        inStock: p.inStock,
        wishlistAddedAt: item.createdAt
      };
    });

    logger.info('Wishlist fetched successfully', {
      userId,
      itemCount: products.length,
      productNames: products.map(p => p.name),
      imageUrls: products.map(p => p.image)
    });

    res.status(200).json({
      success: true,
      data: {
        items: products,
        count: products.length
      },
      message: 'Wishlist retrieved successfully'
    });

  } catch (error) {
    logger.error('Wishlist fetch error', {
      error: error.message,
      userId: req.user?.id,
      stack: error.stack
    });

    // Handle database connection errors specifically
    if (error.message?.includes('connect') || error.message?.includes('database')) {
      logger.warn('Database connection error during wishlist fetch - returning 503');
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable',
        code: 'SERVICE_UNAVAILABLE',
        isColdStart: true,
        retryAfter: 5
      });
    }

    // Return proper error response instead of passing to next
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      code: 'WISHLIST_FETCH_ERROR'
    });
  }
};

/**
 * @route   POST /api/v1/wishlist
 * @desc    Add product to wishlist
 * @access  Private
 */
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!productId) {
      logger.warn('Missing productId in wishlist add request', { userId });
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
        code: 'MISSING_PRODUCT_ID'
      });
    }

    // Validate ObjectId formats
    let userObjectId, productObjectId;
    try {
      userObjectId = new ObjectId(userId);
      productObjectId = new ObjectId(productId);
    } catch (err) {
      logger.warn('Invalid ID format in wishlist add request', { userId, productId });
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        code: 'INVALID_ID_FORMAT'
      });
    }

    logger.info('Adding to wishlist', { userId, productId });

    // Check if product exists and is active
    const db = await connectToDB();
    const product = await db.collection('products').findOne({
      _id: productObjectId,
      active: { $ne: false }
    });

    if (!product) {
      logger.warn('Product not found or inactive', { productId, userId });
      return res.status(404).json({
        success: false,
        message: 'Product not found or unavailable',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    // Check if already in wishlist
    const existing = await db.collection('wishlists').findOne({
      userId: userObjectId,
      productId: productObjectId
    });

    if (existing) {
      logger.info('Product already in wishlist', { userId, productId });
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist',
        code: 'ALREADY_IN_WISHLIST'
      });
    }

    // Add to wishlist
    const result = await db.collection('wishlists').insertOne({
      userId: userObjectId,
      productId: productObjectId,
      createdAt: new Date()
    });

    const primaryImage = product.image || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null);

    logger.info('Product added to wishlist successfully', {
      userId,
      productId,
      wishlistItemId: result.insertedId.toString(),
      image: primaryImage
    });

    const productData = {
      id: product._id.toString(),
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      discount: product.discount,
      image: primaryImage,
      images: Array.isArray(product.images) ? product.images : (primaryImage ? [primaryImage] : []),
      category: product.category,
      rating: product.rating,
      reviews: product.reviews,
      inStock: product.inStock,
      wishlistAddedAt: new Date()
    };

    res.status(201).json({
      success: true,
      data: {
        item: productData
      },
      message: 'Product added to wishlist'
    });

  } catch (error) {
    logger.error('Wishlist add error', {
      error: error.message,
      userId: req.user?.id,
      productId: req.body?.productId,
      stack: error.stack
    });

    // Handle database connection errors specifically
    if (error.message?.includes('connect') || error.message?.includes('database')) {
      logger.warn('Database connection error during wishlist add - returning 503');
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable',
        code: 'SERVICE_UNAVAILABLE',
        isColdStart: true,
        retryAfter: 5
      });
    }

    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist',
        code: 'ALREADY_IN_WISHLIST'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist',
      code: 'WISHLIST_ADD_ERROR'
    });
  }
};

/**
 * @route   DELETE /api/v1/wishlist/:productId
 * @desc    Remove product from wishlist
 * @access  Private
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Validate ObjectId format
    let userObjectId, productObjectId;
    try {
      userObjectId = new ObjectId(userId);
      productObjectId = new ObjectId(productId);
    } catch (err) {
      logger.warn('Invalid ID format in wishlist remove request', { userId, productId });
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        code: 'INVALID_ID_FORMAT'
      });
    }

    logger.info('Removing from wishlist', { userId, productId });

    // Get database connection
    const db = await connectToDB();
    const result = await db.collection('wishlists').deleteOne({
      userId: userObjectId,
      productId: productObjectId
    });

    if (result.deletedCount === 0) {
      logger.info('Product not found in wishlist', { userId, productId });
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist',
        code: 'NOT_IN_WISHLIST'
      });
    }

    logger.info('Product removed from wishlist successfully', {
      userId,
      productId
    });

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });

  } catch (error) {
    logger.error('Wishlist remove error', {
      error: error.message,
      userId: req.user?.id,
      productId: req.params?.productId,
      stack: error.stack
    });

    // Handle database connection errors specifically
    if (error.message?.includes('connect') || error.message?.includes('database')) {
      logger.warn('Database connection error during wishlist remove - returning 503');
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable',
        code: 'SERVICE_UNAVAILABLE',
        isColdStart: true,
        retryAfter: 5
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist',
      code: 'WISHLIST_REMOVE_ERROR'
    });
  }
};

/**
 * @route   GET /api/v1/wishlist/check/:productId
 * @desc    Check if product is in user's wishlist
 * @access  Private
 */
const checkWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Validate ObjectId format
    let userObjectId, productObjectId;
    try {
      userObjectId = new ObjectId(userId);
      productObjectId = new ObjectId(productId);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        code: 'INVALID_ID_FORMAT'
      });
    }

    const db = await connectToDB();
    const wishlistItem = await db.collection('wishlists').findOne({
      userId: userObjectId,
      productId: productObjectId
    });

    res.status(200).json({
      success: true,
      data: {
        isInWishlist: !!wishlistItem
      }
    });

  } catch (error) {
    logger.error('Wishlist check error', {
      error: error.message,
      userId: req.user?.id,
      productId: req.params?.productId,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to check wishlist status',
      code: 'WISHLIST_CHECK_ERROR'
    });
  }
};

// Export all controller functions
module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus
};