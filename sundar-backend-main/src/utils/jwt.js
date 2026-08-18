const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');
const logger = require('./logger');
const { connectToDB } = require('../config/database');

// 🔒 ENTERPRISE-GRADE JWT SECURITY CONFIGURATION
const JWT_CONFIG = {
    algorithm: 'HS256',
    issuer: 'sundar-corporation',
    audience: config.FRONTEND_URL,
    
    // 🔐 ADVANCED SECURITY OPTIONS FOR VERIFICATION ONLY
    allowInvalidAsymmetricKeyTypes: false,
    subject: undefined, // Will be set per token
    jwtid: undefined    // Will be set per token
};

// 🔐 TOKEN ROTATION AND SESSION MANAGEMENT
const SESSION_CONFIG = {
    MAX_CONCURRENT_SESSIONS: 5,      // Max active sessions per user
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    REFRESH_TOKEN_ROTATION: true,    // Rotate refresh tokens on use
    ACCESS_TOKEN_JTI_REUSE_WINDOW: 300000 // 5 minutes reuse window for network retries
};

// 🔐 ENTERPRISE-GRADE TOKEN BLACKLIST WITH MULTI-LAYER CACHING
const BLACKLIST_CACHE_TTL = 3600; // 1 hour cache for blacklisted tokens
const BLACKLIST_CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
let blacklistCache = new Map(); // In-memory fallback cache
let lastCleanupTime = 0;

// 🔐 AUTOMATIC BLACKLIST CLEANUP SCHEDULER
const scheduleBlacklistCleanup = () => {
    setInterval(async () => {
        try {
            await cleanupExpiredBlacklistEntries();
        } catch (err) {
            logger.warn('Scheduled blacklist cleanup failed:', err.message);
        }
    }, BLACKLIST_CLEANUP_INTERVAL);
};

// Start cleanup scheduler
scheduleBlacklistCleanup();

const isTokenBlacklisted = async (token) => {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    try {
        // Check in-memory cache first (fastest)
        const cached = blacklistCache.get(tokenHash);
        if (cached !== undefined) {
            if (cached === true) {
                logger.debug('Token blacklisted (cache hit)');
                return true;
            }
            // Check if cache entry is still valid
            if (Date.now() < cached.expiresAt) {
                return false;
            }
            // Expired cache entry - remove it
            blacklistCache.delete(tokenHash);
        }

        // Check Redis cache
        try {
            const redisModule = require('../config/redis');
            const { redisClient } = redisModule;
            
            if (redisClient.isOpen) {
                const redisKey = `blacklist:${tokenHash}`;
                const redisResult = await redisClient.get(redisKey);
                
                if (redisResult !== null) {
                    const isBlacklisted = redisResult === 'true';
                    // Cache in memory for faster subsequent checks
                    blacklistCache.set(tokenHash, isBlacklisted ? true : {
                        expiresAt: Date.now() + (BLACKLIST_CACHE_TTL * 1000)
                    });
                    return isBlacklisted;
                }
            }
        } catch (redisError) {
            logger.warn('Redis blacklist check failed, falling back to database', {
                error: redisError.message
            });
        }

        // Check database as final authority
        const db = await connectToDB();
        const blacklistRecord = await db.collection('token_blacklist').findOne({
            tokenHash,
            expiresAt: { $gt: new Date() }
        });

        const isBlacklisted = !!blacklistRecord;
        
        // Cache the result
        if (isBlacklisted) {
            blacklistCache.set(tokenHash, true);
            logger.info('Token blacklisted (database check)', { 
                reason: blacklistRecord?.reason,
                expiresAt: blacklistRecord?.expiresAt
            });
        } else {
            blacklistCache.set(tokenHash, {
                expiresAt: Date.now() + (BLACKLIST_CACHE_TTL * 1000)
            });
        }
        
        // Also cache in Redis if available
        try {
            const redisModule = require('../config/redis');
            const { redisClient } = redisModule;
            
            if (redisClient.isOpen) {
                const redisKey = `blacklist:${tokenHash}`;
                await redisClient.set(redisKey, isBlacklisted.toString(), { EX: BLACKLIST_CACHE_TTL });
            }
        } catch (redisError) {
            logger.warn('Failed to cache blacklist result in Redis', {
                error: redisError.message
            });
        }

        return isBlacklisted;
        
    } catch (err) {
        logger.error('Blacklist check critical failure:', {
            error: err.message,
            stack: err.stack
        });
        // Fail secure - treat as blacklisted if check fails
        return true;
    }
};

// 🔐 ENHANCED TOKEN BLACKLISTING WITH REDUNDANCY
const addToBlacklist = async (token, reason = 'manual_revocation', customExpiry = null) => {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = customExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default
    
    try {
        // Add to database first (authoritative source)
        const db = await connectToDB();
        const result = await db.collection('token_blacklist').insertOne({
            tokenHash,
            reason,
            expiresAt,
            createdAt: new Date()
        });
        
        // Update caches
        blacklistCache.set(tokenHash, true);
        
        // Update Redis cache
        try {
            const redisModule = require('../config/redis');
            const { redisClient } = redisModule;
            
            if (redisClient.isOpen) {
                const redisKey = `blacklist:${tokenHash}`;
                await redisClient.set(redisKey, 'true', { EX: 2592000 }); // 30 days in Redis
            }
        } catch (redisError) {
            logger.warn('Failed to update Redis blacklist cache', {
                error: redisError.message
            });
        }
        
        logger.info('Token successfully blacklisted', { 
            reason, 
            expiresAt: expiresAt.toISOString(),
            insertId: result.insertedId
        });
        
        return true;
        
    } catch (err) {
        logger.error('Failed to add token to blacklist:', {
            error: err.message,
            stack: err.stack,
            reason,
            tokenHash: tokenHash.substring(0, 16) + '...' // Log partial hash for debugging
        });
        throw err;
    }
};

// 🔐 BATCH BLACKLIST OPERATIONS FOR EFFICIENCY
const addToBlacklistBatch = async (tokens, reason = 'bulk_revocation') => {
    if (!Array.isArray(tokens) || tokens.length === 0) {
        return 0;
    }
    
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const operations = tokens.map(token => ({
        tokenHash: crypto.createHash('sha256').update(token).digest('hex'),
        reason,
        expiresAt,
        createdAt: new Date()
    }));
    
    try {
        const db = await connectToDB();
        const result = await db.collection('token_blacklist').insertMany(operations, {
            ordered: false // Continue on individual errors
        });
        
        // Update caches for successful insertions
        operations.forEach(op => {
            blacklistCache.set(op.tokenHash, true);
        });
        
        logger.info('Batch token blacklist operation completed', {
            count: result.insertedCount,
            reason,
            totalRequested: tokens.length
        });
        
        return result.insertedCount;
        
    } catch (err) {
        logger.error('Batch blacklist operation failed:', {
            error: err.message,
            reason,
            tokenCount: tokens.length
        });
        throw err;
    }
};

// 🔐 BLACKLIST CLEANUP UTILITY
const cleanupExpiredBlacklistEntries = async () => {
    try {
        const db = await connectToDB();
        const result = await db.collection('token_blacklist').deleteMany({
            expiresAt: { $lt: new Date() }
        });
        
        if (result.deletedCount > 0) {
            logger.info('Expired blacklist entries cleaned up', {
                count: result.deletedCount
            });
        }
        
        // Clear in-memory cache
        blacklistCache.clear();
        
        return result.deletedCount;
    } catch (err) {
        logger.error('Blacklist cleanup failed:', err);
        throw err;
    }
};

// 🔐 STANDARDIZED ACCESS TOKEN GENERATION
const generateAccessToken = (user) => {
    // 🔒 CRITICAL: VALIDATE REQUIRED USER FIELDS
    if (!user?.id || !user?.email) {
        throw new Error('Invalid user data for token generation');
    }
    
    // 🔒 CRITICAL: VALIDATE JWT SECRETS BEFORE GENERATION
    if (!config.JWT_ACCESS_SECRET) {
        logger.error('❌ CRITICAL: JWT_ACCESS_SECRET is missing from environment');
        throw new Error('JWT access secret not configured');
    }
    
    // 🔒 GENERATE SECURE TOKEN IDENTIFIER
    const tokenId = crypto.randomBytes(16).toString('hex');
    
    // 🔒 CREATE STANDARDIZED PAYLOAD
    const payload = {
        // 🔐 STANDARD JWT CLAIMS
        jti: tokenId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor((Date.now() + parseExpiry(config.JWT_ACCESS_EXPIRY)) / 1000),
        sub: user.id.toString(),
        iss: JWT_CONFIG.issuer,
        aud: JWT_CONFIG.audience,
        
        // 🔐 USER CONTEXT - STANDARDIZED FIELDS
        email: user.email,
        role: user.role || 'user',
        passwordVersion: user.passwordVersion || 1,
        
        // 🔐 MINIMAL SESSION CONTEXT
        sessionId: user.sessionId || crypto.randomBytes(32).toString('hex'),
        
        // 🔐 TOKEN METADATA
        createdAt: Date.now(),
        tokenType: 'access'
    };

    // 🔐 SIGN TOKEN WITH PROPER SECRET
    try {
        const token = jwt.sign(payload, config.JWT_ACCESS_SECRET, {
            algorithm: 'HS256'
            // All claims are already in payload, no additional options needed
        });
        
        logger.debug('🔐 Access token generated', {
            userId: user.id,
            tokenId: tokenId.substring(0, 8) + '...',
            expiry: config.JWT_ACCESS_EXPIRY
        });
        
        return token;
    } catch (signError) {
        logger.error('❌ Failed to sign access token', {
            userId: user.id,
            error: signError.message
        });
        throw new Error('Failed to generate access token');
    }
};

// 🔐 ADVANCED REFRESH TOKEN GENERATION WITH ROTATION SUPPORT
const generateRefreshToken = (user) => {
    // 🔒 CRITICAL: VALIDATE REQUIRED USER FIELDS
    if (!user?.id || !user?.email) {
        throw new Error('Invalid user data for refresh token generation');
    }
    
    // 🔒 CRITICAL: VALIDATE JWT SECRETS BEFORE GENERATION
    if (!config.JWT_REFRESH_SECRET) {
        logger.error('❌ CRITICAL: JWT_REFRESH_SECRET is missing from environment');
        throw new Error('JWT refresh secret not configured');
    }
    
    // 🔒 GENERATE HIGH-ENTROPY TOKENS
    const tokenId = crypto.randomBytes(32).toString('hex'); // 256-bit entropy
    const sessionId = user.sessionId || crypto.randomBytes(32).toString('hex');
    
    // 🔒 CREATE SECURE REFRESH TOKEN PAYLOAD
    const payload = {
        // 🔐 STANDARD JWT CLAIMS
        jti: tokenId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor((Date.now() + parseExpiry(config.JWT_REFRESH_EXPIRY)) / 1000),
        sub: user.id.toString(),
        iss: JWT_CONFIG.issuer,
        aud: JWT_CONFIG.audience,
        
        // 🔐 USER CONTEXT - STANDARDIZED FIELDS
        email: user.email,
        role: user.role || 'user',
        passwordVersion: user.passwordVersion || 1,
        
        // 🔐 SESSION MANAGEMENT
        tokenType: 'refresh',
        sessionId: sessionId,
        parentSessionId: user.parentSessionId, // For token rotation chain
        
        // 🔐 SECURITY CONTEXT
        ipHash: user.ipHash || crypto.createHash('sha256')
            .update(user.ip || 'unknown')
            .digest('hex'),
        userAgentHash: user.userAgentHash || crypto.createHash('sha256')
            .update(user.userAgent || 'unknown')
            .digest('hex'),
        
        // 🔐 DEVICE AND LOCATION CONTEXT
        deviceInfo: user.deviceInfo || {
            platform: user.platform || 'unknown',
            browser: user.browser || 'unknown',
            mobile: user.mobile || false
        },
        location: user.location || {
            country: user.country || 'unknown',
            region: user.region || 'unknown'
        },
        
        // 🔐 TOKEN METADATA
        createdAt: Date.now(),
        lastUsedAt: null,
        useCount: 0,
        version: '2.0',
        
        // 🔐 ROTATION CONTEXT
        rotatedFrom: user.previousTokenId || null,
        rotationChain: user.rotationChain || [tokenId]
    };

    // 🔐 SIGN REFRESH TOKEN WITH ENHANCED SECURITY
    try {
        const token = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
            algorithm: 'HS256'
            // All claims are already in payload, no additional options needed
        });
        
        logger.debug('🔐 Refresh token generated', {
            userId: user.id,
            sessionId: sessionId.substring(0, 8) + '...',
            tokenId: tokenId.substring(0, 8) + '...',
            expiry: config.JWT_REFRESH_EXPIRY,
            rotationEnabled: SESSION_CONFIG.REFRESH_TOKEN_ROTATION
        });
        
        return token;
    } catch (signError) {
        logger.error('❌ Failed to sign refresh token', {
            userId: user.id,
            error: signError.message
        });
        throw new Error('Failed to generate refresh token');
    }
};

// 🔐 ENTERPRISE-GRADE ACCESS TOKEN VERIFICATION WITH ADVANCED SECURITY
const verifyAccessToken = async (token, options = {}) => {
    try {
        // 🔒 PRELIMINARY VALIDATION
        if (!token || typeof token !== 'string') {
            logger.warn('Invalid token format provided for verification');
            return null;
        }
        
        // 🔒 CHECK BLACKLIST FIRST (FAST PATH)
        if (await isTokenBlacklisted(token)) {
            logger.warn('🔐 Blocked blacklisted access token attempt');
            return null;
        }

        // 🔒 VERIFY TOKEN SIGNATURE AND CLAIMS
        const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET, {
            issuer: JWT_CONFIG.issuer,
            audience: JWT_CONFIG.audience,
            algorithms: ['HS256'],
            ...options
            // Removed clockTolerance as it's already in JWT_CONFIG
        });

        // 🔒 COMPREHENSIVE PAYLOAD VALIDATION - STANDARDIZED FIELDS
        const requiredFields = ['sub', 'email', 'role', 'jti', 'sessionId', 'passwordVersion'];
        for (const field of requiredFields) {
            if (!decoded[field]) {
                logger.warn('🔐 Invalid access token - missing required field', { 
                    missingField: field, 
                    tokenStructure: Object.keys(decoded) 
                });
                return null;
            }
        }

        // 🔒 ADVANCED SECURITY VALIDATIONS
        
        // 1. Issuer validation
        if (decoded.iss !== JWT_CONFIG.issuer) {
            logger.warn('🔐 Invalid token issuer', {
                expected: JWT_CONFIG.issuer,
                received: decoded.iss
            });
            return null;
        }
        
        // 2. Audience validation
        if (decoded.aud !== JWT_CONFIG.audience) {
            logger.warn('🔐 Invalid token audience', {
                expected: JWT_CONFIG.audience,
                received: decoded.aud
            });
            return null;
        }
        
        // 3. Subject validation
        if (!decoded.sub || typeof decoded.sub !== 'string') {
            logger.warn('🔐 Invalid token subject');
            return null;
        }
        
        // 4. Token type validation
        if (decoded.tokenType && decoded.tokenType !== 'access') {
            logger.warn('🔐 Invalid token type', { tokenType: decoded.tokenType });
            return null;
        }
        
        // 5. IP validation (if provided)
        if (options.ip && decoded.ip && decoded.ip !== options.ip) {
            logger.warn('🔐 IP address mismatch in access token', {
                tokenIp: decoded.ip,
                requestIp: options.ip,
                userId: decoded.sub
            });
            // Don't immediately reject - could be NAT/proxy, log for monitoring
        }
        
        // 6. User-Agent validation (if provided)
        if (options.userAgentHash && decoded.userAgentHash && 
            decoded.userAgentHash !== options.userAgentHash) {
            logger.warn('🔐 User-Agent mismatch in access token', {
                userId: decoded.sub,
                sessionId: decoded.sessionId
            });
        }
        
        // 7. Password version validation
        if (options.currentPasswordVersion && 
            decoded.pv !== options.currentPasswordVersion) {
            logger.info('🔐 Token invalidated due to password change', {
                userId: decoded.sub,
                tokenPv: decoded.pv,
                currentPv: options.currentPasswordVersion
            });
            return null;
        }
        
        // 🔒 SUCCESSFUL VERIFICATION
        logger.debug('🔐 Access token verified successfully', {
            userId: decoded.sub,
            sessionId: decoded.sessionId,
            tokenId: decoded.jti
        });
        
        return decoded;
        
    } catch (err) {
        // 🔒 DETAILED ERROR HANDLING AND LOGGING
        const errorContext = {
            message: err.message,
            name: err.name,
            code: err.code,
            userId: options.userId || 'unknown'
        };
        
        switch (err.name) {
            case 'TokenExpiredError':
                logger.info('🔐 Access token expired', errorContext);
                break;
            case 'JsonWebTokenError':
                logger.warn('🔐 Access token signature invalid', errorContext);
                break;
            case 'NotBeforeError':
                logger.warn('🔐 Access token not yet valid', errorContext);
                break;
            default:
                logger.error('🔐 Unexpected access token verification error', errorContext);
        }
        
        // 🔒 SECURITY: BLACKLIST SUSPICIOUS TOKENS
        if (err.name === 'JsonWebTokenError') {
            try {
                await addToBlacklist(token, `verification_failure_${err.name}`);
            } catch (blacklistErr) {
                logger.warn('🔐 Failed to blacklist suspicious token', blacklistErr);
            }
        }
        
        return null;
    }
};

const verifyRefreshToken = async (token, options = {}) => {
    try {
        // Check database blacklist
        if (await isTokenBlacklisted(token)) {
            logger.warn('Blocked blacklisted refresh token');
            return null;
        }

        const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET, {
            issuer: JWT_CONFIG.issuer,
            audience: JWT_CONFIG.audience,
            algorithms: ['HS256'],
            ...options
        });

        // Validate refresh token specific fields
        if (decoded.tokenType !== 'refresh') {
            logger.warn('Invalid refresh token type:', decoded.tokenType);
            return null;
        }

        const requiredFields = ['sub', 'email', 'sessionId', 'jti'];
        for (const field of requiredFields) {
            if (!decoded[field]) {
                logger.warn('Invalid refresh token payload - missing field:', { field, decoded });
                return null;
            }
        }

        return decoded;
    } catch (err) {
        logger.debug('Refresh token verification failed:', {
            message: err.message,
            name: err.name,
            code: err.code
        });
        
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            try {
                await addToBlacklist(token, 'verification_failure');
            } catch (blacklistErr) {
                logger.warn('Failed to blacklist token:', blacklistErr);
            }
        }
        
        return null;
    }
};

// 🔐 Emergency token revocation
const revokeToken = async (token, reason = 'manual_revocation') => {
    try {
        await addToBlacklist(token, reason);
    } catch (err) {
        logger.error('Token revocation failed:', err);
        throw err;
    }
};

const isTokenRevoked = async (token) => {
    return await isTokenBlacklisted(token);
};

// Fallback verification with enhanced security
const verifyToken = async (token, secret = config.JWT_SECRET) => {
    try {
        if (await isTokenBlacklisted(token)) {
            return null;
        }

        const decoded = jwt.verify(token, secret, {
            ...JWT_CONFIG,
            algorithms: ['HS256']
        });

        return decoded;
    } catch (err) {
        logger.debug('Generic token verification failed:', {
            message: err.message,
            name: err.name
        });
        
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            try {
                await addToBlacklist(token, 'generic_verification_failure');
            } catch (blacklistErr) {
                logger.warn('Failed to blacklist token:', blacklistErr);
            }
        }
        
        return null;
    }
};

// Enhanced token expiration check
const isTokenExpired = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) return true;
        
        // Add small clock tolerance for network delays
        const currentTime = Math.floor(Date.now() / 1000);
        return currentTime >= (decoded.exp + 30); // 30 seconds tolerance
    } catch {
        return true;
    }
};

// Get token metadata without verification
const getTokenMetadata = (token) => {
    try {
        const decoded = jwt.decode(token);
        return {
            valid: !!decoded,
            expired: decoded ? isTokenExpired(token) : true,
            issuer: decoded?.iss,
            audience: decoded?.aud,
            subject: decoded?.sub,
            issuedAt: decoded?.iat,
            expiresAt: decoded?.exp,
            tokenId: decoded?.jti
        };
    } catch {
        return { valid: false, expired: true };
    }
};

// 🔐 UTILITY FUNCTIONS FOR EXPIRY PARSING
const parseExpiry = (expiryString) => {
    if (typeof expiryString === 'number') return expiryString;
    
    const match = expiryString.match(/^([0-9]+)([smhd])$/);
    if (!match) throw new Error(`Invalid expiry format: ${expiryString}`);
    
    const [, value, unit] = match;
    const numValue = parseInt(value);
    
    switch (unit) {
        case 's': return numValue * 1000;
        case 'm': return numValue * 60 * 1000;
        case 'h': return numValue * 60 * 60 * 1000;
        case 'd': return numValue * 24 * 60 * 60 * 1000;
        default: throw new Error(`Unknown time unit: ${unit}`);
    }
};

// 🔐 EXPORT ENHANCED JWT MODULE
module.exports = {
    // Token generation
    generateAccessToken,
    generateRefreshToken,
    
    // Token verification
    verifyAccessToken,
    verifyRefreshToken,
    verifyToken,
    
    // Token lifecycle management
    isTokenExpired,
    revokeToken,
    isTokenRevoked,
    getTokenMetadata,
    
    // Blacklist operations
    addToBlacklist,
    addToBlacklistBatch,
    isTokenBlacklisted,
    cleanupExpiredBlacklistEntries,
    
    // Configuration
    JWT_CONFIG,
    SESSION_CONFIG,
    
    // Utility functions
    parseExpiry,
    
    // Session management helpers
    getMaxConcurrentSessions: () => SESSION_CONFIG.MAX_CONCURRENT_SESSIONS,
    isRefreshTokenRotationEnabled: () => SESSION_CONFIG.REFRESH_TOKEN_ROTATION,
    getAccessTokenReuseWindow: () => SESSION_CONFIG.ACCESS_TOKEN_JTI_REUSE_WINDOW
};