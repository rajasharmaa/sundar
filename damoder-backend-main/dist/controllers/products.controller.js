"use strict";
const { ObjectId } = require('mongodb');
const cacheService = require('../utils/cache-service');
const { connectToDB } = require('../config/database');
const { sanitizeSearchQuery } = require('../utils/validation');
const logger = require('../utils/logger');
const { createError, sendErrorResponse } = require('../middleware/error.handler');
const { getRelatedProducts, getPopularInCategory } = require('../api/v1/products/service.related');
const { generateProductSlug } = require('../utils/slug-generator');
/**
 * Get all products with pagination and cursor-based support
 * GET /api/v1/products
 */
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const cursor = req.query.cursor; // For cursor-based pagination
        const unlimited = req.query.unlimited === 'true';
        // Cache key based on pagination type
        const cacheKey = cursor
            ? `products:cursor:${cursor}:${limit}`
            : `products:page:${page}:${limit}:${unlimited}`;
        const products = await cacheService.getCached(cacheKey, async () => {
            const db = await connectToDB();
            const productsCollection = db.collection('products');
            const skip = (page - 1) * limit;
            let query = { active: { $ne: false } };
            // Cursor-based pagination (better for large datasets)
            if (cursor) {
                query._id = { $lt: cursor };
            }
            // Build query with projection for performance
            const projection = {
                _id: 1,
                name: 1,
                slug: 1,
                category: 1,
                brand: 1,
                price: 1,
                discount: 1,
                image: 1,
                rating: 1,
                reviews: 1,
                inStock: 1,
                featured: 1,
                tags: 1,
                createdAt: 1
            };
            let productsQuery = productsCollection.find(query).sort({ createdAt: -1 });
            if (!unlimited && !cursor) {
                productsQuery = productsQuery.skip(skip).limit(limit);
            }
            else if (cursor) {
                productsQuery = productsQuery.limit(limit + 1); // Get one extra to check for next page
            }
            let products = await productsQuery.project(projection).toArray();
            // Check if there's a next page for cursor-based pagination
            let nextCursor = null;
            if (cursor && products.length > limit) {
                nextCursor = products[products.length - 1]._id;
                products.pop(); // Remove the extra item
            }
            // Map _id to id for frontend compatibility
            return {
                data: products.map(item => ({
                    ...item,
                    id: item._id ? item._id.toString() : item.id
                })),
                nextCursor,
                hasMore: nextCursor !== null
            };
        }, { ttl: 300 });
        return res.status(200).json({
            success: true,
            data: products.data,
            pagination: cursor
                ? {
                    type: 'cursor',
                    nextCursor: products.nextCursor,
                    hasMore: products.hasMore,
                    limit
                }
                : {
                    page,
                    limit: unlimited ? 'all' : limit,
                    total: products.data.length,
                    unlimited
                }
        });
    }
    catch (err) {
        logger.error('Get products error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Get product by ID
 * GET /api/v1/products/:id
 */
const getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        const cacheKey = `product:${productId}`;
        const product = await cacheService.getCached(cacheKey, async () => {
            const db = await connectToDB();
            const productsCollection = db.collection('products');
            const product = await productsCollection.findOne({
                _id: new ObjectId(productId),
                active: { $ne: false }
            });
            if (!product) {
                return null;
            }
            return {
                ...product,
                id: product._id ? product._id.toString() : product.id
            };
        }, { ttl: 600 });
        if (!product) {
            return sendErrorResponse(res, createError.notFound('Product not found'), req.requestId);
        }
        return res.status(200).json({
            success: true,
            data: product
        });
    }
    catch (err) {
        logger.error('Get product by ID error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Get product by slug (SEO-friendly URL)
 * GET /api/v1/products/slug/:slug
 */
const getProductBySlug = async (req, res) => {
    try {
        const slug = req.params.slug.toLowerCase().trim();
        const cacheKey = `product:slug:${slug}`;
        const product = await cacheService.getCached(cacheKey, async () => {
            const db = await connectToDB();
            const productsCollection = db.collection('products');
            const product = await productsCollection.findOne({
                slug: slug,
                active: { $ne: false }
            });
            if (!product) {
                return null;
            }
            return {
                ...product,
                id: product._id ? product._id.toString() : product.id
            };
        }, { ttl: 600 });
        if (!product) {
            return sendErrorResponse(res, createError.notFound('Product not found'), req.requestId);
        }
        return res.status(200).json({
            success: true,
            data: product
        });
    }
    catch (err) {
        logger.error('Get product by slug error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Get products by category
 * GET /api/v1/products/category/:category
 */
const getProductsByCategory = async (req, res) => {
    try {
        const category = req.params.category.toLowerCase().trim();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const cacheKey = `products:category:${category}:${page}:${limit}`;
        const products = await cacheService.getCached(cacheKey, async () => {
            const db = await connectToDB();
            const productsCollection = db.collection('products');
            const skip = (page - 1) * limit;
            let products = await productsCollection.find({
                category: { $regex: new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
                active: { $ne: false }
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();
            return products.map(item => ({
                ...item,
                id: item._id ? item._id.toString() : item.id
            }));
        }, { ttl: 300 });
        return res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                total: products.length
            }
        });
    }
    catch (err) {
        logger.error('Get products by category error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Get popular products
 * GET /api/v1/products/popular
 */
const getPopularProducts = async (req, res) => {
    try {
        const cacheKey = 'products:popular';
        const products = await cacheService.getCached(cacheKey, async () => {
            const db = await connectToDB();
            const productsCollection = db.collection('products');
            let products = await productsCollection.find({ active: { $ne: false } })
                .sort({ createdAt: -1 })
                .limit(10)
                .toArray();
            return products.map(item => ({
                ...item,
                id: item._id ? item._id.toString() : item.id
            }));
        }, { ttl: 600 });
        return res.status(200).json({
            success: true,
            data: products
        });
    }
    catch (err) {
        logger.error('Get popular products error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Search products
 * GET /api/v1/products/search
 */
const searchProducts = async (req, res) => {
    try {
        let { search, category } = req.query;
        // Sanitize inputs
        search = sanitizeSearchQuery(search);
        category = sanitizeSearchQuery(category);
        const cacheKey = `products:search:${encodeURIComponent(search || 'all')}:${encodeURIComponent(category || 'all')}`;
        const products = await cacheService.getCached(cacheKey, async () => {
            const db = await connectToDB();
            const productsCollection = db.collection('products');
            const query = { active: { $ne: false } };
            if (search) {
                const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                query.$or = [
                    { name: { $regex: escapedSearch, $options: 'i' } },
                    { description: { $regex: escapedSearch, $options: 'i' } },
                    { tags: { $regex: escapedSearch, $options: 'i' } }
                ];
            }
            if (category) {
                query.category = { $regex: new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
            }
            let products = await productsCollection.find(query)
                .sort({ createdAt: -1 })
                .limit(50)
                .toArray();
            return products.map(item => ({
                ...item,
                id: item._id ? item._id.toString() : item.id
            }));
        }, { ttl: 120 });
        return res.status(200).json({
            success: true,
            data: products
        });
    }
    catch (err) {
        logger.error('Search products error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Get search suggestions
 * GET /api/v1/products/search/suggestions
 */
const getSearchSuggestions = async (req, res) => {
    try {
        let { query } = req.query;
        query = sanitizeSearchQuery(query);
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const cacheKey = `products:suggestions:${query}`;
        const suggestions = await cacheService.getCached(cacheKey, async () => {
            const db = await connectToDB();
            const productsCollection = db.collection('products');
            let suggestions = await productsCollection.aggregate([
                {
                    $match: {
                        active: { $ne: false },
                        $or: [
                            { name: { $regex: escapedQuery, $options: 'i' } },
                            { category: { $regex: escapedQuery, $options: 'i' } },
                            { tags: { $regex: escapedQuery, $options: 'i' } }
                        ]
                    }
                },
                { $limit: 5 },
                { $project: { name: 1, category: 1, _id: 1, image: 1, price: 1 } }
            ]).toArray();
            return suggestions.map(item => ({
                ...item,
                id: item._id.toString()
            }));
        }, { ttl: 300 });
        return res.status(200).json({
            success: true,
            data: suggestions
        });
    }
    catch (err) {
        logger.error('Search suggestions error:', err.message);
        return res.status(200).json({
            success: true,
            data: []
        });
    }
};
/**
 * Get related products
 * GET /api/v1/products/:id/related
 */
const getRelatedProductsController = async (req, res) => {
    try {
        const { id } = req.params;
        const limit = parseInt(req.query.limit) || 6;
        if (!ObjectId.isValid(id)) {
            return sendErrorResponse(res, createError.badRequest('Invalid product ID'), req.requestId);
        }
        const relatedProducts = await getRelatedProducts(id, limit);
        return res.status(200).json({
            success: true,
            data: relatedProducts
        });
    }
    catch (err) {
        logger.error('Get related products error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Get popular products in category
 * GET /api/v1/products/category/:category/popular
 */
const getPopularInCategoryController = async (req, res) => {
    try {
        const { category } = req.params;
        const limit = parseInt(req.query.limit) || 4;
        const excludeProductId = req.query.exclude;
        const products = await getPopularInCategory(category, limit, excludeProductId);
        return res.status(200).json({
            success: true,
            data: products
        });
    }
    catch (err) {
        logger.error('Get popular in category error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Track product view
 * POST /api/v1/products/:id/track-view
 */
const trackProductView = async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return sendErrorResponse(res, createError.badRequest('Invalid product ID'), req.requestId);
        }
        const db = await connectToDB();
        const productsCollection = db.collection('products');
        // Increment view count
        const result = await productsCollection.updateOne({ _id: new ObjectId(id) }, { $inc: { views: 1 } });
        if (result.matchedCount === 0) {
            return sendErrorResponse(res, createError.notFound('Product not found'), req.requestId);
        }
        // Invalidate cache for this product
        await cacheService.invalidate(`product:${id}`);
        return res.status(200).json({
            success: true,
            message: 'Product view tracked successfully'
        });
    }
    catch (err) {
        logger.error('Track product view error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
module.exports = {
    getProducts,
    getProductById,
    getProductBySlug,
    getProductsByCategory,
    getPopularProducts,
    searchProducts,
    getSearchSuggestions,
    getRelatedProducts: getRelatedProductsController,
    getPopularInCategory: getPopularInCategoryController,
    trackProductView
};
