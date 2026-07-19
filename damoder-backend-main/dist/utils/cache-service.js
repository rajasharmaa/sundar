"use strict";
// 🚀 ADVANCED CACHING SERVICE
// Enterprise-grade caching with Redis and in-memory fallback
const redisClient = require('../config/redis');
const logger = require('./logger');
class CacheService {
    constructor() {
        this.localCache = new Map();
        this.cacheTimeouts = new Map();
        this.DEFAULT_TTL = 300; // 5 minutes default
        this.REDIS_PREFIX = 'cache:';
    }
    // 🔧 Generate cache key
    generateKey(prefix, ...args) {
        const cleanArgs = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(':');
        return `${prefix}:${cleanArgs}`;
    }
    // 🔧 Redis cache operations
    async getFromRedis(key) {
        if (!redisClient.isOpen)
            return null;
        try {
            const data = await redisClient.get(`${this.REDIS_PREFIX}${key}`);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            logger.warn('Redis cache get error:', error.message);
            return null;
        }
    }
    async setInRedis(key, value, ttl = this.DEFAULT_TTL) {
        if (!redisClient.isOpen)
            return false;
        try {
            const cacheKey = `${this.REDIS_PREFIX}${key}`;
            await redisClient.set(cacheKey, JSON.stringify(value), { EX: ttl });
            return true;
        }
        catch (error) {
            logger.warn('Redis cache set error:', error.message);
            return false;
        }
    }
    async deleteFromRedis(key) {
        if (!redisClient.isOpen)
            return false;
        try {
            const cacheKey = `${this.REDIS_PREFIX}${key}`;
            await redisClient.del(cacheKey);
            return true;
        }
        catch (error) {
            logger.warn('Redis cache delete error:', error.message);
            return false;
        }
    }
    // 🔧 Local memory cache operations
    getFromLocal(key) {
        const entry = this.localCache.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.localCache.delete(key);
            this.cacheTimeouts.delete(key);
            return null;
        }
        return entry.value;
    }
    setInLocal(key, value, ttl = this.DEFAULT_TTL) {
        let finalTtl = ttl;
        const isRedisOpen = redisClient && redisClient.isOpen;
        if (!isRedisOpen && (key.startsWith('product') || key.startsWith('products') || key.startsWith('category') || key.startsWith('stats'))) {
            finalTtl = Math.min(ttl, 5); // Limit local cache to 5 seconds for products/categories when Redis is offline
        }
        const expiresAt = Date.now() + (finalTtl * 1000);
        // Clear existing timeout
        if (this.cacheTimeouts.has(key)) {
            clearTimeout(this.cacheTimeouts.get(key));
        }
        // Set new entry
        this.localCache.set(key, { value, expiresAt });
        // Set cleanup timeout
        const timeout = setTimeout(() => {
            this.localCache.delete(key);
            this.cacheTimeouts.delete(key);
        }, finalTtl * 1000);
        this.cacheTimeouts.set(key, timeout);
    }
    deleteFromLocal(key) {
        this.localCache.delete(key);
        if (this.cacheTimeouts.has(key)) {
            clearTimeout(this.cacheTimeouts.get(key));
            this.cacheTimeouts.delete(key);
        }
    }
    // 🔧 Unified cache operations with fallback
    async get(key, useRedis = true) {
        // Try Redis first (if enabled)
        if (useRedis && redisClient.isOpen) {
            const redisValue = await this.getFromRedis(key);
            if (redisValue !== null) {
                // Populate local cache as backup
                this.setInLocal(key, redisValue, 60); // Short-lived local copy
                return redisValue;
            }
            return null; // Redis is connected and key is not found (miss/invalidated)
        }
        // Fallback to local cache
        return this.getFromLocal(key);
    }
    async set(key, value, options = {}) {
        const { ttl = this.DEFAULT_TTL, useRedis = true, useLocal = true } = options;
        const results = {
            redis: false,
            local: false
        };
        // Set in Redis
        if (useRedis) {
            results.redis = await this.setInRedis(key, value, ttl);
        }
        // Set in local cache
        if (useLocal) {
            this.setInLocal(key, value, ttl);
            results.local = true;
        }
        return results;
    }
    async delete(key, useRedis = true) {
        const results = {
            redis: false,
            local: false
        };
        if (useRedis) {
            results.redis = await this.deleteFromRedis(key);
        }
        this.deleteFromLocal(key);
        results.local = true;
        return results;
    }
    // 🔧 Cache patterns for common use cases
    // Pattern 1: Cache-Aside (Read-Through)
    async getCached(key, fetchFunction, options = {}) {
        const cached = await this.get(key, options.useRedis);
        if (cached !== null) {
            logger.debug(`Cache hit for key: ${key}`);
            return cached;
        }
        logger.debug(`Cache miss for key: ${key}`);
        const data = await fetchFunction();
        if (data !== null && data !== undefined) {
            await this.set(key, data, options);
        }
        return data;
    }
    // Pattern 2: Write-Through
    async setCached(key, value, options = {}) {
        await this.set(key, value, options);
        return value;
    }
    // Invalidate specific key
    async invalidate(key) {
        return this.delete(key);
    }
    // Pattern 3: Cache-Invalidate
    async invalidatePattern(pattern) {
        if (!redisClient.isOpen) {
            // For local cache, we'd need to implement pattern matching
            // This is a simplified version
            const keysToDelete = [];
            for (const key of this.localCache.keys()) {
                if (key.includes(pattern)) {
                    keysToDelete.push(key);
                }
            }
            keysToDelete.forEach(key => this.deleteFromLocal(key));
            return { redis: false, local: keysToDelete.length };
        }
        try {
            const keys = await redisClient.keys(`${this.REDIS_PREFIX}${pattern}*`);
            if (keys.length > 0) {
                await redisClient.del(...keys);
            }
            // Also clear local cache entries matching pattern
            const localKeys = Array.from(this.localCache.keys()).filter(key => key.includes(pattern));
            localKeys.forEach(key => this.deleteFromLocal(key));
            return { redis: keys.length, local: localKeys.length };
        }
        catch (error) {
            logger.error('Cache pattern invalidation error:', error);
            return { redis: 0, local: 0 };
        }
    }
    // 🔧 Application-specific caching methods
    // Product caching
    async getProduct(id) {
        const key = this.generateKey('product', id);
        return this.get(key);
    }
    async setProduct(id, product, ttl = 600) {
        const key = this.generateKey('product', id);
        return this.set(key, product, { ttl });
    }
    async getProductsByCategory(category, limit = 20) {
        const key = this.generateKey('products_category', category, limit);
        return this.get(key);
    }
    async setProductsByCategory(category, products, ttl = 300) {
        const key = this.generateKey('products_category', category, products.length);
        return this.set(key, products, { ttl });
    }
    // User caching
    async getUser(id) {
        const key = this.generateKey('user', id);
        return this.get(key);
    }
    async setUser(id, user, ttl = 1800) {
        const key = this.generateKey('user', id);
        return this.set(key, user, { ttl });
    }
    // Session caching
    async getSession(sessionId) {
        const key = this.generateKey('session', sessionId);
        return this.get(key, true); // Always use Redis for sessions
    }
    async setSession(sessionId, sessionData, ttl = 3600) {
        const key = this.generateKey('session', sessionId);
        return this.set(key, sessionData, { ttl, useRedis: true, useLocal: false });
    }
    // Statistics caching
    async getStats() {
        const key = 'stats:overview';
        return this.get(key);
    }
    async setStats(stats, ttl = 120) {
        const key = 'stats:overview';
        return this.set(key, stats, { ttl });
    }
    // 🔧 Cache management utilities
    async getCacheStats() {
        const redisConnected = redisClient.isOpen;
        let redisKeys = 0;
        if (redisConnected) {
            try {
                redisKeys = await redisClient.dbsize();
            }
            catch (error) {
                logger.warn('Could not get Redis DB size:', error.message);
            }
        }
        return {
            redis: {
                connected: redisConnected,
                keys: redisKeys,
                prefix: this.REDIS_PREFIX
            },
            local: {
                entries: this.localCache.size,
                timeouts: this.cacheTimeouts.size
            },
            timestamp: new Date().toISOString()
        };
    }
    async clearAll() {
        // Clear Redis cache
        let redisCleared = false;
        if (redisClient.isOpen) {
            try {
                const keys = await redisClient.keys(`${this.REDIS_PREFIX}*`);
                if (keys.length > 0) {
                    await redisClient.del(...keys);
                }
                redisCleared = true;
            }
            catch (error) {
                logger.error('Redis cache clear error:', error);
            }
        }
        // Clear local cache
        this.localCache.clear();
        this.cacheTimeouts.forEach(timeout => clearTimeout(timeout));
        this.cacheTimeouts.clear();
        return {
            redis: redisCleared,
            local: true
        };
    }
    // 🔧 Cache warming - Pre-cache popular products
    async warmupCache() {
        try {
            logger.info('🔥 Starting cache warmup...');
            const db = await require('../config/database').connectToDB();
            const productsCollection = db.collection('products');
            // Pre-cache popular products
            const popularProducts = await productsCollection.find({ active: { $ne: false }, featured: true })
                .sort({ views: -1 })
                .limit(20)
                .toArray();
            await this.set('products:popular', popularProducts, { ttl: 600 });
            // Pre-cache categories
            const categoriesCollection = db.collection('categories');
            const categories = await categoriesCollection.find({ active: { $ne: false } }).toArray();
            for (const category of categories) {
                const categoryProducts = await productsCollection.find({ category: category.name, active: { $ne: false } })
                    .limit(50)
                    .toArray();
                await this.set(`products:category:${category.slug}`, categoryProducts, { ttl: 300 });
            }
            logger.info('✅ Cache warmup completed');
            return true;
        }
        catch (error) {
            logger.error('Cache warmup error:', error.message);
            return false;
        }
    }
    cleanup() {
        this.cacheTimeouts.forEach(timeout => clearTimeout(timeout));
        this.cacheTimeouts.clear();
        this.localCache.clear();
    }
}
// Singleton instance
const cacheService = new CacheService();
// Graceful shutdown handler
process.on('SIGTERM', () => {
    cacheService.cleanup();
});
process.on('SIGINT', () => {
    cacheService.cleanup();
});
module.exports = cacheService;
