// 📂 CATEGORIES CONTROLLER
const { connectToDB } = require('../../../config/database');
const logger = require('../../../utils/logger');
const { sendErrorResponse, createError } = require('../../../middleware/error.handler');

/**
 * Get all categories
 * GET /api/v1/categories
 */
const getAllCategories = async (req, res) => {
  try {
    const db = await connectToDB();
    const productsCollection = db.collection('products');

    // Use aggregation instead of distinct() which is not supported in MongoDB API v1
    const categoriesWithCount = await productsCollection.aggregate([
      {
        $match: { active: { $ne: false } }
      },
      {
        $group: {
          _id: "$category",
          productCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          slug: { $toLower: { $replaceOne: { input: "$_id", find: " ", replacement: "-" } } },
          productCount: 1
        }
      },
      {
        $sort: { productCount: -1 }
      }
    ]).toArray();

    return res.status(200).json({
      success: true,
      data: categoriesWithCount,
      count: categoriesWithCount.length
    });
  } catch (error) {
    logger.error('Get categories error:', error);
    return sendErrorResponse(res, createError.internalServerError(), req.requestId);
  }
};

/**
 * Get products by category
 * GET /api/v1/categories/:category/products
 */
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const db = await connectToDB();
    const productsCollection = db.collection('products');
    const skip = (page - 1) * limit;

    const products = await productsCollection.find({
      category: { $regex: new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      active: { $ne: false }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await productsCollection.countDocuments({
      category: { $regex: new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      active: { $ne: false }
    });

    return res.status(200).json({
      success: true,
      data: products.map(item => ({
        ...item,
        id: item._id ? item._id.toString() : item.id
      })),
      pagination: {
        page,
        limit,
        total
      }
    });
  } catch (error) {
    logger.error('Get products by category error:', error);
    return sendErrorResponse(res, createError.internalServerError(), req.requestId);
  }
};

module.exports = {
  getAllCategories,
  getProductsByCategory
};
