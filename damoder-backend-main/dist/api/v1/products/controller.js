"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkPriceUpdate = exports.getProductBySlug = exports.getPopularInCategory = exports.getRelatedProducts = exports.trackProductView = exports.getSearchSuggestions = exports.searchProducts = exports.getPopularProducts = exports.getProductsByCategory = exports.getProductById = exports.getProducts = void 0;
const di_container_1 = require("../../../utils/di-container");
const logger_1 = __importDefault(require("../../../utils/logger"));
const secure_error_handler_1 = require("../../../utils/secure-error-handler");
const validation_1 = require("../../../utils/validation");
const getProductService = () => {
    return di_container_1.container.get('ProductService');
};
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const result = await getProductService().getProducts(page, limit);
        res.json(result);
    }
    catch (err) {
        logger_1.default.error('Get products error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = secure_error_handler_1.createError.internal('Product listing service temporarily unavailable');
        (0, secure_error_handler_1.sendErrorResponse)(res, error, req.requestId);
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await getProductService().getProductById(productId);
        res.json({
            success: true,
            data: product
        });
    }
    catch (err) {
        if (err.statusCode === 404) {
            (0, secure_error_handler_1.sendErrorResponse)(res, err, req.requestId);
            return;
        }
        logger_1.default.error('Get product by ID error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = secure_error_handler_1.createError.internal('Product details service temporarily unavailable');
        (0, secure_error_handler_1.sendErrorResponse)(res, error, req.requestId);
    }
};
exports.getProductById = getProductById;
const getProductsByCategory = async (req, res) => {
    try {
        const category = req.params.category;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const result = await getProductService().getProductsByCategory(category, page, limit);
        res.json(result);
    }
    catch (err) {
        logger_1.default.error('Get products by category error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = secure_error_handler_1.createError.internal('Category products service temporarily unavailable');
        (0, secure_error_handler_1.sendErrorResponse)(res, error, req.requestId);
    }
};
exports.getProductsByCategory = getProductsByCategory;
const getPopularProducts = async (req, res) => {
    const requestId = req.requestId;
    const isWarming = req.headers['x-server-warming'] === 'true';
    try {
        logger_1.default.debug('Popular products request', {
            requestId,
            isWarming,
            userAgent: req.headers['user-agent']?.substring(0, 50)
        });
        if (isWarming) {
            logger_1.default.info('❄️ Server warming detected for popular products request');
            res.json([]);
            return;
        }
        const products = await getProductService().getPopularProducts();
        logger_1.default.debug('Popular products retrieved successfully', {
            requestId,
            count: products.length
        });
        res.json({
            success: true,
            data: products
        });
    }
    catch (err) {
        logger_1.default.error('Get popular products error:', {
            requestId,
            isWarming,
            error: err.message,
            stack: err.stack
        });
        if (isWarming) {
            logger_1.default.warn('Popular products service error during warm-up, returning empty array', {
                requestId,
                error: err.message
            });
            res.json([]);
            return;
        }
        const error = secure_error_handler_1.createError.internal('Popular products service temporarily unavailable');
        (0, secure_error_handler_1.sendErrorResponse)(res, error, requestId);
    }
};
exports.getPopularProducts = getPopularProducts;
const searchProducts = async (req, res) => {
    const requestId = req.requestId;
    try {
        let { search, category } = req.query;
        const sanitizedSearch = (0, validation_1.sanitizeSearchQuery)(search);
        const sanitizedCategory = (0, validation_1.sanitizeSearchQuery)(category);
        const searchResults = await getProductService().searchProducts(sanitizedSearch, sanitizedCategory);
        res.json({
            success: true,
            data: searchResults
        });
    }
    catch (err) {
        logger_1.default.error('Search products critical error:', {
            requestId,
            error: err.message,
            stack: err.stack
        });
        const error = secure_error_handler_1.createError.internal('Search service error');
        (0, secure_error_handler_1.sendErrorResponse)(res, error, requestId);
    }
};
exports.searchProducts = searchProducts;
const getSearchSuggestions = async (req, res) => {
    try {
        let { query } = req.query;
        const sanitizedQuery = (0, validation_1.sanitizeSearchQuery)(query);
        const suggestions = await getProductService().getSearchSuggestions(sanitizedQuery);
        res.json({
            success: true,
            data: suggestions
        });
    }
    catch (err) {
        logger_1.default.error('Search suggestions error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        res.json({
            success: false,
            data: [],
            error: err.message
        });
    }
};
exports.getSearchSuggestions = getSearchSuggestions;
const trackProductView = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await getProductService().trackProductView(id);
        res.json({
            success: true,
            data: result
        });
    }
    catch (err) {
        logger_1.default.error('Track product view error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = secure_error_handler_1.createError.internal('Failed to track product view');
        (0, secure_error_handler_1.sendErrorResponse)(res, error, req.requestId);
    }
};
exports.trackProductView = trackProductView;
const getRelatedProducts = async (req, res) => {
    try {
        const id = req.params.id;
        const limit = parseInt(req.query.limit) || 6;
        const products = await getProductService().getRelatedProducts(id, limit);
        res.json({
            success: true,
            data: products
        });
    }
    catch (err) {
        if (err.statusCode === 404) {
            (0, secure_error_handler_1.sendErrorResponse)(res, err, req.requestId);
            return;
        }
        logger_1.default.error('Get related products error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = secure_error_handler_1.createError.internal('Related products service temporarily unavailable');
        (0, secure_error_handler_1.sendErrorResponse)(res, error, req.requestId);
    }
};
exports.getRelatedProducts = getRelatedProducts;
const getPopularInCategory = async (req, res) => {
    try {
        const category = req.params.category;
        const limit = parseInt(req.query.limit) || 6;
        const excludeId = req.query.exclude;
        const popularProducts = await getProductService().getPopularInCategory(category, excludeId, limit);
        res.json({
            success: true,
            data: popularProducts
        });
    }
    catch (err) {
        logger_1.default.error('Get popular in category error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = secure_error_handler_1.createError.internal('Popular category products service temporarily unavailable');
        (0, secure_error_handler_1.sendErrorResponse)(res, error, req.requestId);
    }
};
exports.getPopularInCategory = getPopularInCategory;
const getProductBySlug = async (req, res) => {
    try {
        const slug = req.params.slug;
        const product = await getProductService().getProductBySlug(slug);
        res.json({
            success: true,
            data: product
        });
    }
    catch (err) {
        if (err.statusCode === 404) {
            (0, secure_error_handler_1.sendErrorResponse)(res, err, req.requestId);
            return;
        }
        logger_1.default.error('Get product by slug error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = secure_error_handler_1.createError.internal('Product details service temporarily unavailable');
        (0, secure_error_handler_1.sendErrorResponse)(res, error, req.requestId);
    }
};
exports.getProductBySlug = getProductBySlug;
const bulkPriceUpdate = async (req, res) => {
    try {
        logger_1.default.info('🔵 [BULK PRICE UPDATE CONTROLLER] Request received:', { body: req.body });
        const { updates } = req.body;
        if (!Array.isArray(updates)) {
            logger_1.default.error('❌ [BULK PRICE UPDATE CONTROLLER] Updates is not an array');
            res.status(400).json({
                success: false,
                error: 'Updates must be an array'
            });
            return;
        }
        const results = await getProductService().bulkPriceUpdate(updates);
        res.json({
            success: true,
            message: 'Bulk price update completed',
            results
        });
    }
    catch (err) {
        logger_1.default.error('❌ [BULK PRICE UPDATE] Error:', err);
        const error = secure_error_handler_1.createError.internal('Failed to update prices: ' + err.message);
        (0, secure_error_handler_1.sendErrorResponse)(res, error, req.requestId);
    }
};
exports.bulkPriceUpdate = bulkPriceUpdate;
