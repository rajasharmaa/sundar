"use strict";
// 🛒 PRODUCTS SERVICE
// Business logic layer for product operations
const { ObjectId } = require('mongodb');
const { getCacheManager } = require('../../../utils/cache-service');
const { redisClient } = require('../../../config/redis');
const { connectToDB } = require('../../../config/database');
const { sanitizeSearchQuery } = require('../../../utils/validation');
const logger = require('../../../utils/logger');
const { createError, sendErrorResponse } = require('../../../utils/secure-error-handler');
// Get all products with pagination and caching
const getProducts = async (req) => {
    try {
        const cacheManager = getCacheManager(redisClient, 300);
        const cacheKey = `products:all:${req.query.page || 1}:${req.query.limit || 10}`;
        let products = await cacheManager.get(cacheKey);
        if (!products) {
            const db = await connectToDB();
            const productsCollection = db.collection('products');
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 100;
            const skip = (page - 1) * limit;
            products = await productsCollection.find({ active: { $ne: false } })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();
            // Map _id to id for frontend compatibility
            products = products.map(item => ({
                ...item,
                id: item._id ? item._id.toString() : item.id
            }));
            await cacheManager.set(cacheKey, products, 300);
        }
        return {
            data: products,
            pagination: {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 100,
                total: products.length
            }
        };
    }
    catch (err) {
        logger.error('Get products service error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        throw createError.internal('Product listing service temporarily unavailable');
    }
};
// Get product by ID with caching
const getProductById = async (req) => {
    try {
        // 🔥 CRITICAL FIX: Reduced cache TTL from 600s to 30s for real-time price updates
        const cacheManager = getCacheManager(redisClient, 30);
        const cacheKey = `product:${req.params.id}`;
        let product = await cacheManager.get(cacheKey);
        if (!product) {
            const db = await connectToDB();
            const productsCollection = db.collection('products');
            product = await productsCollection.findOne({
                _id: new ObjectId(req.params.id),
                active: { $ne: false }
            });
            if (!product) {
                throw createError.productNotFound();
            }
            // Map _id to id for frontend compatibility
            if (product) {
                product = {
                    ...product,
                    id: product._id ? product._id.toString() : product.id
                };
            }
            // 🔥 CRITICAL FIX: Use 30s TTL for real-time price updates (was 600s)
            await cacheManager.set(cacheKey, product, 30);
        }
        return product;
    }
    catch (err) {
        if (err.name === 'ValidationError')
            throw err;
        logger.error('Get product by ID service error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        throw createError.internal('Product details service temporarily unavailable');
    }
};
// Get products by category with pagination and caching
const getProductsByCategory = async (req) => {
    try {
        const category = req.params.category.toLowerCase().trim();
        const cacheManager = getCacheManager(redisClient, 300);
        const cacheKey = `products:category:${category}:${req.query.page || 1}:${req.query.limit || 10}`;
        let products = await cacheManager.get(cacheKey);
        if (!products) {
            const db = await connectToDB();
            const productsCollection = db.collection('products');
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const skip = (page - 1) * limit;
            products = await productsCollection.find({
                category: { $regex: new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
                active: { $ne: false }
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();
            // Map _id to id for frontend compatibility
            products = products.map(item => ({
                ...item,
                id: item._id ? item._id.toString() : item.id
            }));
            await cacheManager.set(cacheKey, products, 300);
        }
        return {
            data: products,
            pagination: {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 50,
                total: products.length
            }
        };
    }
    catch (err) {
        logger.error('Get products by category service error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        throw createError.internal('Category products service temporarily unavailable');
    }
};
// Get popular products with caching
const getPopularProducts = async (req) => {
    try {
        const cacheManager = getCacheManager(redisClient, 600);
        const cacheKey = 'products:popular';
        let products = await cacheManager.get(cacheKey);
        if (!products) {
            const db = await connectToDB();
            const productsCollection = db.collection('products');
            products = await productsCollection.find({ active: { $ne: false } })
                .sort({ createdAt: -1 }) // Sort by creation date instead of views
                .limit(10)
                .toArray();
            // Map _id to id for frontend compatibility
            products = products.map(item => ({
                ...item,
                id: item._id ? item._id.toString() : item.id
            }));
            await cacheManager.set(cacheKey, products, 600);
        }
        return products;
    }
    catch (err) {
        logger.error('Get popular products service error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        throw createError.internal('Popular products service temporarily unavailable');
    }
};
// Search products with caching
const searchProducts = async (req) => {
    try {
        let { search, category } = req.query;
        // Sanitize inputs
        search = sanitizeSearchQuery(search);
        category = sanitizeSearchQuery(category);
        // Generate cache key with proper escaping
        const cacheKey = `products:search:${encodeURIComponent(search || 'all')}:${encodeURIComponent(category || 'all')}`;
        // Try cache first with timeout protection
        let products = null;
        try {
            const cacheManager = getCacheManager(redisClient, 300);
            products = await cacheManager.get(cacheKey);
        }
        catch (cacheErr) {
            logger.warn('Cache read failed, proceeding with database query', {
                cacheKey,
                error: cacheErr.message
            });
        }
        if (!products) {
            const db = await connectToDB();
            const productsCollection = db.collection('products');
            // Build search query
            const query = { active: { $ne: false } };
            if (search) {
                query.$text = { $search: search };
            }
            if (category) {
                query.category = { $regex: new RegExp(category, 'i') };
            }
            products = await productsCollection.find(query)
                .sort({ score: { $meta: "textScore" }, createdAt: -1 })
                .limit(50)
                .toArray();
            // Map _id to id for frontend compatibility
            products = products.map(item => ({
                ...item,
                id: item._id ? item._id.toString() : item.id
            }));
            // Cache results with timeout protection
            try {
                const cacheManager = getCacheManager(redisClient, 300);
                await cacheManager.set(cacheKey, products, 300);
            }
            catch (cacheErr) {
                logger.warn('Failed to cache search results', {
                    cacheKey,
                    error: cacheErr.message
                });
            }
        }
        return products;
    }
    catch (err) {
        logger.error('Search products service error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        throw createError.internal('Product search service temporarily unavailable');
    }
};
// Get search suggestions
const getSearchSuggestions = async (req) => {
    try {
        const { q: query } = req.query;
        if (!query || query.length < 2) {
            return [];
        }
        const sanitizedQuery = sanitizeSearchQuery(query);
        const cacheManager = getCacheManager(redisClient, 300);
        const cacheKey = `search:suggestions:${encodeURIComponent(sanitizedQuery)}`;
        let suggestions = await cacheManager.get(cacheKey);
        if (!suggestions) {
            const db = await connectToDB();
            const productsCollection = db.collection('products');
            // Get matching products for suggestions
            const products = await productsCollection.find({
                $text: { $search: sanitizedQuery },
                active: { $ne: false }
            })
                .project({
                name: 1,
                category: 1,
                score: { $meta: "textScore" }
            })
                .sort({ score: { $meta: "textScore" } })
                .limit(10)
                .toArray();
            // Extract unique categories and product names
            const categories = [...new Set(products.map(p => p.category))];
            const productNames = products.map(p => p.name);
            suggestions = {
                categories: categories.slice(0, 5),
                products: productNames.slice(0, 10)
            };
            await cacheManager.set(cacheKey, suggestions, 300);
        }
        return suggestions;
    }
    catch (err) {
        logger.error('Get search suggestions service error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        throw createError.internal('Search suggestions service temporarily unavailable');
    }
};
module.exports = {
    getProducts,
    getProductById,
    getProductsByCategory,
    getPopularProducts,
    searchProducts,
    getSearchSuggestions
};
