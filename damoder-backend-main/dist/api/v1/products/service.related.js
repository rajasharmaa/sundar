"use strict";
// 🔗 RELATED PRODUCTS SERVICE
// Smart product recommendation engine
const { ObjectId } = require('mongodb');
const { connectToDB } = require('../../config/database');
try {
    const cacheService = require('../../utils/cache-service');
    const logger = require('../../utils/logger');
}
catch (error) {
    console.error('❌ Error loading dependencies in service.related:', error.message);
    throw error;
}
const cacheService = require('../../utils/cache-service');
const logger = require('../../utils/logger');
/**
 * Get related products based on multiple factors:
 * - Same category (60% weight)
 * - Similar price range (20% weight)
 * - Similar attributes/tags (20% weight)
 *
 * @param {string} productId - The product ID to find related products for
 * @param {number} limit - Number of related products to return
 * @returns {Promise<Array>} Array of related products
 */
const getRelatedProducts = async (productId, limit = 6) => {
    try {
        const cacheKey = `related:${productId}:limit:${limit}`;
        // Try cache first
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const db = await connectToDB();
        const productsCollection = db.collection('products');
        // Get the target product
        const targetProduct = await productsCollection.findOne({
            _id: new ObjectId(productId),
            active: { $ne: false }
        });
        if (!targetProduct) {
            return [];
        }
        // Build aggregation pipeline for smart recommendations
        const pipeline = [
            {
                $match: {
                    _id: { $ne: new ObjectId(productId) },
                    active: { $ne: false }
                }
            },
            {
                $addFields: {
                    // Category match score (60% weight)
                    categoryScore: {
                        $cond: [
                            { $eq: ['$category', targetProduct.category] },
                            60,
                            0
                        ]
                    },
                    // Price range score (20% weight)
                    priceScore: {
                        $cond: [
                            {
                                $and: [
                                    { $gte: ['$price', targetProduct.price * 0.7] },
                                    { $lte: ['$price', targetProduct.price * 1.3] }
                                ]
                            },
                            20,
                            0
                        ]
                    },
                    // Rating score (20% weight)
                    ratingScore: {
                        $cond: [
                            { $gte: ['$rating', targetProduct.rating || 0] },
                            20,
                            { $multiply: [{ $divide: ['$rating', 5] }, 20] }
                        ]
                    }
                }
            },
            {
                $addFields: {
                    totalScore: {
                        $add: ['$categoryScore', '$priceScore', '$ratingScore']
                    }
                }
            },
            {
                $sort: { totalScore: -1, rating: -1, createdAt: -1 }
            },
            {
                $limit: limit
            }
        ];
        const relatedProducts = await productsCollection.aggregate(pipeline).toArray();
        // Map _id to id for frontend compatibility
        const cleanedProducts = relatedProducts.map(item => ({
            ...item,
            id: item._id ? item._id.toString() : item.id
        }));
        // Cache for 1 hour
        await cacheService.set(cacheKey, cleanedProducts, 3600);
        return cleanedProducts;
    }
    catch (err) {
        logger.error('Get related products error:', err.message);
        return [];
    }
};
/**
 * Get popular products in the same category
 * Alternative simpler algorithm
 */
const getPopularInCategory = async (category, limit = 4, excludeProductId = null) => {
    try {
        const cacheKey = `popular:category:${category}:limit:${limit}`;
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const db = await connectToDB();
        const productsCollection = db.collection('products');
        const query = {
            category: { $regex: new RegExp(`^${category}$`, 'i') },
            active: { $ne: false }
        };
        if (excludeProductId) {
            query._id = { $ne: new ObjectId(excludeProductId) };
        }
        const products = await productsCollection
            .find(query)
            .sort({ rating: -1, reviews: -1 })
            .limit(limit)
            .toArray();
        const cleanedProducts = products.map(item => ({
            ...item,
            id: item._id ? item._id.toString() : item.id
        }));
        // Cache for 2 hours
        await cacheService.set(cacheKey, cleanedProducts, 7200);
        return cleanedProducts;
    }
    catch (err) {
        logger.error('Get popular in category error:', err.message);
        return [];
    }
};
module.exports = {
    getRelatedProducts,
    getPopularInCategory
};
