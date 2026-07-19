"use strict";
// 🔐 PERSISTENT REFRESH TOKEN STORAGE WITH REDIS BACKEND
// Implements secure, scalable refresh token management with Redis persistence
// Supports cross-origin deployment scenarios (Vercel ↔ Render)
const crypto = require('crypto');
const logger = require('./logger');
const { redisClient, connectRedis } = require('../config/redis');
const { connectToDB } = require('../config/database');
// 🔐 TOKEN HASHING UTILITY - CONSISTENT SHA256
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
// 🔐 REDIS KEY PREFIXES FOR ORGANIZATION
const REDIS_PREFIX = {
    REFRESH_TOKEN: 'rt:', // rt:hashed_token -> token_data
    USER_TOKENS: 'ut:', // ut:user_id -> Set of token hashes
    TOKEN_BLACKLIST: 'bl:', // bl:hashed_token -> blacklist_reason
    TOKEN_METADATA: 'tm:' // tm:hashed_token -> metadata
};
// 🔐 TOKEN EXPIRATION TIMES (seconds)
const EXPIRY = {
    REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days
    USER_TOKEN_SET: 8 * 24 * 60 * 60, // 8 days (longer than tokens)
    BLACKLIST_ENTRY: 30 * 24 * 60 * 60, // 30 days
    METADATA: 7 * 24 * 60 * 60 // 7 days
};
// 🔐 REFRESH TOKEN DATA STRUCTURE
class RefreshToken {
    constructor(data) {
        this.userId = data.userId;
        this.tokenHash = data.tokenHash;
        this.createdAt = data.createdAt || new Date();
        this.expiresAt = data.expiresAt || new Date(Date.now() + EXPIRY.REFRESH_TOKEN * 1000);
        this.lastUsedAt = data.lastUsedAt || null;
        this.userAgent = data.userAgent || '';
        this.ipAddress = data.ipAddress || '';
        this.deviceInfo = data.deviceInfo || {};
        this.revoked = data.revoked || false;
        this.revokedAt = data.revokedAt || null;
        this.revokedReason = data.revokedReason || null;
    }
    // Convert to database/document format
    toDBObject() {
        return {
            userId: this.userId,
            tokenHash: this.tokenHash,
            createdAt: this.createdAt,
            expiresAt: this.expiresAt,
            lastUsedAt: this.lastUsedAt,
            userAgent: this.userAgent,
            ipAddress: this.ipAddress,
            deviceInfo: this.deviceInfo,
            revoked: this.revoked,
            revokedAt: this.revokedAt,
            revokedReason: this.revokedReason
        };
    }
    // Convert to Redis hash format
    toRedisObject() {
        return {
            userId: this.userId.toString(),
            createdAt: this.createdAt.toISOString(),
            expiresAt: this.expiresAt.toISOString(),
            lastUsedAt: this.lastUsedAt ? this.lastUsedAt.toISOString() : '',
            userAgent: this.userAgent,
            ipAddress: this.ipAddress,
            deviceInfo: JSON.stringify(this.deviceInfo),
            revoked: this.revoked.toString(),
            revokedAt: this.revokedAt ? this.revokedAt.toISOString() : '',
            revokedReason: this.revokedReason || ''
        };
    }
    static fromRedisObject(hash, tokenHash) {
        return new RefreshToken({
            userId: hash.userId,
            tokenHash: tokenHash,
            createdAt: new Date(hash.createdAt),
            expiresAt: new Date(hash.expiresAt),
            lastUsedAt: hash.lastUsedAt ? new Date(hash.lastUsedAt) : null,
            userAgent: hash.userAgent,
            ipAddress: hash.ipAddress,
            deviceInfo: hash.deviceInfo ? JSON.parse(hash.deviceInfo) : {},
            revoked: hash.revoked === 'true',
            revokedAt: hash.revokedAt ? new Date(hash.revokedAt) : null,
            revokedReason: hash.revokedReason || null
        });
    }
}
// 🔐 REDIS-BASED STORAGE OPERATIONS WITH CROSS-ORIGIN SUPPORT
class RedisTokenStorage {
    // Store a new refresh token with cross-origin compatibility
    static async storeToken(userId, token, metadata = {}) {
        try {
            const tokenHash = hashToken(token);
            const refreshToken = new RefreshToken({
                userId,
                tokenHash,
                userAgent: metadata.userAgent || '',
                ipAddress: metadata.ipAddress || '',
                deviceInfo: metadata.deviceInfo || {}
            });
            // Connect to Redis with timeout protection
            await Promise.race([
                connectRedis(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 5000))
            ]);
            if (redisClient.isOpen) {
                // Store token data in Redis hash with persistence
                const redisKey = `${REDIS_PREFIX.REFRESH_TOKEN}${tokenHash}`;
                await redisClient.hSet(redisKey, refreshToken.toRedisObject());
                await redisClient.expire(redisKey, EXPIRY.REFRESH_TOKEN);
                // Add to user's token set for easy cleanup
                const userTokensKey = `${REDIS_PREFIX.USER_TOKENS}${userId}`;
                await redisClient.sAdd(userTokensKey, tokenHash);
                await redisClient.expire(userTokensKey, EXPIRY.USER_TOKEN_SET);
                // Cross-origin deployment support - sync with database backup
                try {
                    await DatabaseTokenStorage.storeToken(userId, token, metadata);
                }
                catch (dbError) {
                    logger.warn('⚠️ Database backup sync failed (non-critical)', {
                        userId: userId.toString(),
                        error: dbError.message
                    });
                }
                logger.debug('✅ Refresh token stored in Redis with database backup', {
                    userId: userId.toString(),
                    tokenHash: tokenHash.substring(0, 16) + '...',
                    crossOriginCompatible: true
                });
                return { success: true, tokenHash };
            }
            else {
                throw new Error('Redis not available');
            }
        }
        catch (error) {
            logger.warn('⚠️ Redis token storage failed, falling back to database', {
                userId: userId.toString(),
                error: error.message,
                isTimeout: error.message.includes('timeout')
            });
            return await DatabaseTokenStorage.storeToken(userId, token, metadata);
        }
    }
    // Retrieve token by hash with cross-origin resilience
    static async getToken(tokenHash) {
        try {
            // Attempt Redis connection with timeout
            await Promise.race([
                connectRedis(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 3000))
            ]);
            if (redisClient.isOpen) {
                const redisKey = `${REDIS_PREFIX.REFRESH_TOKEN}${tokenHash}`;
                const tokenData = await redisClient.hGetAll(redisKey);
                if (Object.keys(tokenData).length > 0) {
                    const refreshToken = RefreshToken.fromRedisObject(tokenData, tokenHash);
                    // Update last used time
                    if (!refreshToken.revoked) {
                        refreshToken.lastUsedAt = new Date();
                        await redisClient.hSet(redisKey, 'lastUsedAt', refreshToken.lastUsedAt.toISOString());
                    }
                    logger.debug('✅ Token retrieved from Redis', {
                        tokenHash: tokenHash.substring(0, 16) + '...',
                        userId: refreshToken.userId.toString(),
                        isRevoked: refreshToken.revoked
                    });
                    return refreshToken;
                }
            }
            // Fall back to database
            logger.debug('🔄 Falling back to database for token retrieval', {
                tokenHash: tokenHash.substring(0, 16) + '...'
            });
            return await DatabaseTokenStorage.getToken(tokenHash);
        }
        catch (error) {
            logger.warn('⚠️ Redis token retrieval failed, falling back to database', {
                tokenHash: tokenHash.substring(0, 16) + '...',
                error: error.message,
                isTimeout: error.message.includes('timeout')
            });
            return await DatabaseTokenStorage.getToken(tokenHash);
        }
    }
    // Revoke a specific token
    static async revokeToken(tokenHash, reason = 'manual_revocation') {
        try {
            await connectRedis();
            if (redisClient.isOpen) {
                const redisKey = `${REDIS_PREFIX.REFRESH_TOKEN}${tokenHash}`;
                const exists = await redisClient.exists(redisKey);
                if (exists) {
                    await redisClient.hSet(redisKey, {
                        revoked: 'true',
                        revokedAt: new Date().toISOString(),
                        revokedReason: reason
                    });
                    // Add to blacklist
                    const blacklistKey = `${REDIS_PREFIX.TOKEN_BLACKLIST}${tokenHash}`;
                    await redisClient.set(blacklistKey, reason, { EX: EXPIRY.BLACKLIST_ENTRY });
                    logger.debug('✅ Token revoked in Redis', {
                        tokenHash: tokenHash.substring(0, 16) + '...',
                        reason
                    });
                    return true;
                }
            }
            // Fall back to database
            return await this.revokeTokenInDatabase(tokenHash, reason);
        }
        catch (error) {
            logger.warn('⚠️ Redis token revocation failed, falling back to database', {
                tokenHash: tokenHash.substring(0, 16) + '...',
                error: error.message
            });
            return await this.revokeTokenInDatabase(tokenHash, reason);
        }
    }
    // Revoke all tokens for a user
    static async revokeUserTokens(userId) {
        try {
            await connectRedis();
            if (redisClient.isOpen) {
                const userTokensKey = `${REDIS_PREFIX.USER_TOKENS}${userId}`;
                const tokenHashes = await redisClient.sMembers(userTokensKey);
                const revokePromises = tokenHashes.map(async (tokenHash) => {
                    const redisKey = `${REDIS_PREFIX.REFRESH_TOKEN}${tokenHash}`;
                    await redisClient.hSet(redisKey, {
                        revoked: 'true',
                        revokedAt: new Date().toISOString(),
                        revokedReason: 'user_logout'
                    });
                    // Add to blacklist
                    const blacklistKey = `${REDIS_PREFIX.TOKEN_BLACKLIST}${tokenHash}`;
                    await redisClient.set(blacklistKey, 'user_logout', { EX: EXPIRY.BLACKLIST_ENTRY });
                });
                await Promise.all(revokePromises);
                // Clear user's token set
                await redisClient.del(userTokensKey);
                logger.debug('✅ All user tokens revoked in Redis', {
                    userId: userId.toString(),
                    count: tokenHashes.length
                });
                return tokenHashes.length;
            }
            // Fall back to database
            return await this.revokeUserTokensInDatabase(userId);
        }
        catch (error) {
            logger.warn('⚠️ Redis bulk token revocation failed, falling back to database', {
                userId: userId.toString(),
                error: error.message
            });
            return await this.revokeUserTokensInDatabase(userId);
        }
    }
    // Check if token is blacklisted
    static async isTokenBlacklisted(tokenHash) {
        try {
            await connectRedis();
            if (redisClient.isOpen) {
                const blacklistKey = `${REDIS_PREFIX.TOKEN_BLACKLIST}${tokenHash}`;
                const result = await redisClient.get(blacklistKey);
                return result !== null;
            }
            return false;
        }
        catch (error) {
            logger.warn('⚠️ Redis blacklist check failed', {
                tokenHash: tokenHash.substring(0, 16) + '...',
                error: error.message
            });
            return false;
        }
    }
    // Cleanup expired tokens
    static async cleanupExpiredTokens() {
        try {
            // This is primarily handled by Redis expiration
            // But we can log statistics
            logger.debug('🧹 Redis token cleanup completed (handled by expiration)');
            return { cleaned: 0, skipped: 0 };
        }
        catch (error) {
            logger.error('❌ Token cleanup failed', { error: error.message });
            return { cleaned: 0, skipped: 0, error: error.message };
        }
    }
}
// 🔐 DATABASE FALLBACK OPERATIONS WITH CROSS-ORIGIN COMPATIBILITY
class DatabaseTokenStorage {
    static async storeToken(userId, token, metadata = {}) {
        try {
            const db = await connectToDB();
            const tokenHash = hashToken(token);
            const refreshToken = new RefreshToken({
                userId,
                tokenHash,
                userAgent: metadata.userAgent || '',
                ipAddress: metadata.ipAddress || '',
                deviceInfo: metadata.deviceInfo || {}
            });
            // Use upsert to handle cross-origin scenarios where same token might be stored twice
            await db.collection('refresh_tokens').replaceOne({ tokenHash }, refreshToken.toDBObject(), { upsert: true });
            logger.debug('✅ Refresh token stored in database with upsert', {
                userId: userId.toString(),
                tokenHash: tokenHash.substring(0, 16) + '...',
                crossOriginSafe: true
            });
            return { success: true, tokenHash };
        }
        catch (error) {
            logger.error('❌ Database token storage failed', {
                userId: userId.toString(),
                error: error.message,
                isNetworkError: error.name === 'MongoNetworkError'
            });
            throw error;
        }
    }
    static async getToken(tokenHash) {
        try {
            const db = await connectToDB();
            const tokenDoc = await db.collection('refresh_tokens').findOne({ tokenHash });
            if (tokenDoc) {
                const refreshToken = new RefreshToken(tokenDoc);
                // Update last used time
                if (!refreshToken.revoked) {
                    refreshToken.lastUsedAt = new Date();
                    await db.collection('refresh_tokens').updateOne({ tokenHash }, { $set: { lastUsedAt: refreshToken.lastUsedAt } });
                }
                return refreshToken;
            }
            return null;
        }
        catch (error) {
            logger.error('❌ Database token retrieval failed', {
                tokenHash: tokenHash.substring(0, 16) + '...',
                error: error.message
            });
            return null;
        }
    }
    static async revokeToken(tokenHash, reason = 'manual_revocation') {
        try {
            const db = await connectToDB();
            const result = await db.collection('refresh_tokens').updateOne({ tokenHash }, {
                $set: {
                    revoked: true,
                    revokedAt: new Date(),
                    revokedReason: reason
                }
            });
            return result.modifiedCount > 0;
        }
        catch (error) {
            logger.error('❌ Database token revocation failed', {
                tokenHash: tokenHash.substring(0, 16) + '...',
                error: error.message
            });
            return false;
        }
    }
    static async revokeUserTokens(userId) {
        try {
            const db = await connectToDB();
            const result = await db.collection('refresh_tokens').updateMany({ userId, revoked: false }, {
                $set: {
                    revoked: true,
                    revokedAt: new Date(),
                    revokedReason: 'user_logout'
                }
            });
            return result.modifiedCount;
        }
        catch (error) {
            logger.error('❌ Database bulk token revocation failed', {
                userId: userId.toString(),
                error: error.message
            });
            return 0;
        }
    }
    static async cleanupExpiredTokens() {
        try {
            const db = await connectToDB();
            const result = await db.collection('refresh_tokens').deleteMany({
                expiresAt: { $lt: new Date() }
            });
            logger.info('🧹 Database token cleanup completed', {
                deleted: result.deletedCount
            });
            return { cleaned: result.deletedCount, skipped: 0 };
        }
        catch (error) {
            logger.error('❌ Database token cleanup failed', { error: error.message });
            return { cleaned: 0, skipped: 0, error: error.message };
        }
    }
}
// 🔐 TOKEN ROTATION LOGIC
RedisTokenStorage.rotateToken = async (userId, oldToken, newToken, metadata = {}) => {
    try {
        // Revoke old token
        const oldTokenHash = hashToken(oldToken);
        await RedisTokenStorage.revokeToken(oldTokenHash, 'token_rotation');
        // Store new token
        return await RedisTokenStorage.storeToken(userId, newToken, metadata);
    }
    catch (error) {
        logger.error('Token rotation failed', {
            userId: userId.toString(),
            error: error.message
        });
        throw error;
    }
};
DatabaseTokenStorage.rotateToken = async (userId, oldToken, newToken, metadata = {}) => {
    try {
        // Revoke old token
        const oldTokenHash = hashToken(oldToken);
        await DatabaseTokenStorage.revokeToken(oldTokenHash, 'token_rotation');
        // Store new token
        return await DatabaseTokenStorage.storeToken(userId, newToken, metadata);
    }
    catch (error) {
        logger.error('Database token rotation failed', {
            userId: userId.toString(),
            error: error.message
        });
        throw error;
    }
};
// 🔐 PUBLIC INTERFACE - HYBRID STORAGE WITH CROSS-ORIGIN RESILIENCE
const RefreshTokenStorage = {
    // Store token with dual persistence (Redis primary, database backup)
    async storeToken(userId, token, metadata = {}) {
        return await RedisTokenStorage.storeToken(userId, token, metadata);
    },
    // Get token with intelligent fallback
    async getToken(tokenHash) {
        return await RedisTokenStorage.getToken(tokenHash);
    },
    // Revoke token (both Redis and database)
    async revokeToken(tokenHash, reason = 'manual_revocation') {
        const redisSuccess = await RedisTokenStorage.revokeToken(tokenHash, reason);
        const dbSuccess = await DatabaseTokenStorage.revokeToken(tokenHash, reason);
        return redisSuccess || dbSuccess;
    },
    // Revoke all user tokens (both Redis and database)
    async revokeUserTokens(userId) {
        const redisCount = await RedisTokenStorage.revokeUserTokens(userId);
        const dbCount = await DatabaseTokenStorage.revokeUserTokens(userId);
        return Math.max(redisCount, dbCount);
    },
    // Rotate token (revoke old, store new)
    async rotateToken(userId, oldToken, newToken, metadata = {}) {
        // Try Redis rotation first
        try {
            await RedisTokenStorage.rotateToken(userId, oldToken, newToken, metadata);
            // Also update database for persistence
            await DatabaseTokenStorage.rotateToken(userId, oldToken, newToken, metadata);
            return { success: true };
        }
        catch (redisError) {
            logger.warn('Redis token rotation failed, falling back to database', {
                userId: userId.toString(),
                error: redisError.message
            });
            // Fallback to database-only rotation
            return await DatabaseTokenStorage.rotateToken(userId, oldToken, newToken, metadata);
        }
    },
    // Check blacklist (Redis only for performance)
    async isTokenBlacklisted(tokenHash) {
        return await RedisTokenStorage.isTokenBlacklisted(tokenHash);
    },
    // Cleanup expired tokens
    async cleanupExpiredTokens() {
        const redisResult = await RedisTokenStorage.cleanupExpiredTokens();
        const dbResult = await DatabaseTokenStorage.cleanupExpiredTokens();
        return {
            redis: redisResult,
            database: dbResult,
            totalCleaned: redisResult.cleaned + dbResult.cleaned
        };
    },
    // Health check
    async healthCheck() {
        try {
            await connectRedis();
            const redisHealthy = redisClient.isOpen;
            const db = await connectToDB();
            const dbHealthy = !!db;
            return {
                redis: redisHealthy,
                database: dbHealthy,
                hybrid: redisHealthy && dbHealthy
            };
        }
        catch (error) {
            return {
                redis: false,
                database: false,
                hybrid: false,
                error: error.message
            };
        }
    }
};
module.exports = {
    RefreshTokenStorage,
    hashToken,
    EXPIRY,
    REDIS_PREFIX
};
