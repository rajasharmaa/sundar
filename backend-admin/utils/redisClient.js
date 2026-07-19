// Redis client for cache invalidation across backends
require('dotenv').config();

const { Redis } = require('ioredis');

// Use the same Redis instance as damoder-backend
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

if (!process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
  console.error('❌ CRITICAL CONFIGURATION ERROR: REDIS_URL is not defined in production!');
  process.exit(1);
}

let redisClient = null;

const connectRedis = async () => {
  if (redisClient) {
    console.log('✅ Redis already connected');
    return redisClient;
  }

  try {
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn('❌ Redis connection failed after multiple attempts');
          return null;
        }
        return Math.min(times * 200, 2000);
      }
    });

    redisClient.on('connect', () => {
      console.log('🔌 Redis connected');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });

    // Test connection
    await redisClient.ping();
    console.log('✅ Redis ready for cache invalidation');
    
    return redisClient;
  } catch (error) {
    console.warn('⚠️  Redis connection failed - cache invalidation will be skipped:', error.message);
    redisClient = null;
    return null;
  }
};

// Invalidate product cache
const invalidateProductCache = async (productId) => {
  if (!redisClient) {
    console.warn('⚠️  Redis not available - skipping cache invalidation');
    return false;
  }

  try {
    const prefix = 'cache:';
    const patterns = [
      `product:${productId}`,
      'products:all:*',
      'products:category:*',
      'products:search:*',
      'products:suggestions:*',
      'products:popular'
    ];

    let deletedCount = 0;

    // First, list all cache keys for debugging
    try {
      const allKeys = await redisClient.keys(`${prefix}*`);
      console.log('🔍 Current cache keys:', allKeys.length);
      if (allKeys.length > 0) {
        console.log('📋 Sample keys:', allKeys.slice(0, 10));
      }
    } catch (listError) {
      console.warn('⚠️  Could not list cache keys:', listError.message);
    }

    for (const pattern of patterns) {
      const keys = await redisClient.keys(`${prefix}${pattern}`);
      if (keys.length > 0) {
        const deleted = await redisClient.del(...keys);
        deletedCount += deleted;
        console.log(`🗑️  Deleted ${deleted} keys matching pattern: ${pattern}`);
      } else {
        console.log(`ℹ️  No keys found for pattern: ${pattern}`);
      }
    }

    console.log(`✅ Cache invalidated for product ${productId}. Total keys deleted: ${deletedCount}`);
    return true;
  } catch (error) {
    console.error('❌ Cache invalidation error:', error.message);
    return false;
  }
};

module.exports = {
  connectRedis,
  invalidateProductCache,
  getRedisClient: () => redisClient
};
