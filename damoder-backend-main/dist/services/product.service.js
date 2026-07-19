"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const cache_service_1 = __importDefault(require("../utils/cache-service"));
const logger_1 = __importDefault(require("../utils/logger"));
const secure_error_handler_1 = require("../utils/secure-error-handler");
class ProductService {
    productRepository;
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    async getProducts(page, limit) {
        const cacheKey = `products:all:${page}:${limit}`;
        const products = await cache_service_1.default.getCached(cacheKey, async () => {
            return this.productRepository.findAll(page, limit);
        }, { ttl: 300 });
        return {
            data: products,
            pagination: {
                page,
                limit,
                total: products.length
            }
        };
    }
    async getProductById(id) {
        const cacheKey = `product:${id}`;
        // 30s TTL for real-time price updates as per original fix in service.js
        const product = await cache_service_1.default.getCached(cacheKey, async () => {
            const prod = await this.productRepository.findById(id);
            if (!prod) {
                throw secure_error_handler_1.createError.productNotFound();
            }
            return prod;
        }, { ttl: 30 });
        if (!product) {
            throw secure_error_handler_1.createError.productNotFound();
        }
        return product;
    }
    async getProductsByCategory(category, page, limit) {
        const cleanCategory = category.toLowerCase().trim();
        const cacheKey = `products:category:${cleanCategory}:${page}:${limit}`;
        const products = await cache_service_1.default.getCached(cacheKey, async () => {
            return this.productRepository.findByCategory(cleanCategory, page, limit);
        }, { ttl: 300 });
        return {
            data: products,
            pagination: {
                page,
                limit,
                total: products.length
            }
        };
    }
    async getPopularProducts() {
        const cacheKey = 'products:popular';
        return cache_service_1.default.getCached(cacheKey, async () => {
            return this.productRepository.findPopular(10);
        }, { ttl: 600 });
    }
    async searchProducts(search, category) {
        const cacheKey = `products:search:${encodeURIComponent(search || 'all')}:${encodeURIComponent(category || 'all')}`;
        return cache_service_1.default.getCached(cacheKey, async () => {
            return this.productRepository.search(search, category, 50);
        }, { ttl: 120 });
    }
    async getSearchSuggestions(query) {
        if (!query || query.length < 2) {
            return [];
        }
        const cacheKey = `products:suggestions:${query}`;
        return cache_service_1.default.getCached(cacheKey, async () => {
            return this.productRepository.getSuggestions(query, 5);
        }, { ttl: 300 });
    }
    async trackProductView(id) {
        const views = await this.productRepository.incrementViews(id);
        if (views === 0) {
            throw secure_error_handler_1.createError.notFound('Product not found');
        }
        return {
            productId: id,
            views
        };
    }
    async getRelatedProducts(id, limit) {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw secure_error_handler_1.createError.productNotFound();
        }
        return this.productRepository.findRelated(product.category, id, limit);
    }
    async getPopularInCategory(category, excludeId, limit = 6) {
        return this.productRepository.findPopularInCategory(category, excludeId, limit);
    }
    async getProductBySlug(slug) {
        const cacheKey = `product:slug:${slug}`;
        const product = await cache_service_1.default.getCached(cacheKey, async () => {
            const prod = await this.productRepository.findBySlug(slug);
            if (!prod) {
                throw secure_error_handler_1.createError.productNotFound();
            }
            return prod;
        }, { ttl: 600 });
        if (!product) {
            throw secure_error_handler_1.createError.productNotFound();
        }
        return product;
    }
    async bulkPriceUpdate(updates) {
        logger_1.default.info(`📦 [BULK PRICE UPDATE SERVICE] Processing ${updates.length} updates`);
        const results = [];
        for (const update of updates) {
            const { productId, sizeIndex, priceType, newPrice } = update;
            if (!productId || sizeIndex === undefined || sizeIndex === null || !priceType || !['100', '50'].includes(priceType) || newPrice === undefined || newPrice === null) {
                results.push({ success: false, error: 'Invalid update parameters' });
                continue;
            }
            const product = await this.productRepository.findById(productId);
            if (!product) {
                results.push({ productId, success: false, error: 'Product not found' });
                continue;
            }
            if (!product.sizeOptions || !product.sizeOptions[sizeIndex]) {
                results.push({ productId, success: false, error: 'Invalid size index' });
                continue;
            }
            const updateQuery = {};
            if (priceType === '100') {
                updateQuery[`sizeOptions.${sizeIndex}.price_100_percent`] = Number(newPrice);
            }
            else if (priceType === '50') {
                updateQuery[`sizeOptions.${sizeIndex}.price_50_percent`] = Number(newPrice);
            }
            // Update the product
            const success = await this.productRepository.updateOne(productId, {
                $set: {
                    ...updateQuery,
                    priceUpdatedAt: new Date()
                }
            });
            if (success) {
                await this.invalidateProductCache(productId);
                results.push({ productId, success: true, priceType, newPrice });
            }
            else {
                results.push({ productId, success: false, error: 'Update failed' });
            }
        }
        return results;
    }
    async invalidateProductCache(productId) {
        await cache_service_1.default.delete(`product:${productId}`);
        await cache_service_1.default.invalidatePattern('products:all:');
        await cache_service_1.default.invalidatePattern('products:page:');
        await cache_service_1.default.invalidatePattern('products:category:');
        await cache_service_1.default.invalidatePattern('products:search:');
        await cache_service_1.default.invalidatePattern('products:suggestions:');
        await cache_service_1.default.invalidatePattern('products:popular');
        await cache_service_1.default.invalidatePattern('product:slug:');
        logger_1.default.info(`✅ [CACHE] Full product cache invalidated for product ${productId}`);
    }
}
exports.ProductService = ProductService;
