const { verifyAccessToken } = require('../../utils/jwt');
const logger = require('../../utils/logger');
const { connectToDB } = require('../../config/database');
const { ObjectId } = require('mongodb');

// 🔐 SIMPLE, CRASH-PROOF AUTH MIDDLEWARE
// No Redis dependency, no caching, direct database lookup
const requireUserAuth = async (req, res, next) => {
    const requestId = req.requestId;
    const ip = req.ip || req.connection?.remoteAddress;

    try {
        // 🔥 COOKIE-BASED AUTHENTICATION WITH HEADER FALLBACK
        let token = req.cookies?.accessToken;

        // Check Authorization header if no cookie
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization.trim();
            
            // Handle different Authorization header formats
            if (authHeader.startsWith('Bearer ') || authHeader.startsWith('bearer ')) {
                token = authHeader.substring(7).trim(); // Extract after 'Bearer '
            } else if (authHeader.length > 10) { // If it looks like a raw token
                token = authHeader.trim();
            }
        }

        if (!token) {
            logger.debug('Authentication failed: No access token provided', {
                requestId,
                ip
            });
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        // 🔒 JWT verification with cold start awareness
        let decoded;
        try {
            decoded = await verifyAccessToken(token);
        } catch (verificationError) {
            logger.warn('Token verification failed', {
                requestId,
                error: verificationError.message,
                ip,
                isExpired: verificationError.name === 'TokenExpiredError'
            });

            // For token expiration, check if it's likely a cold start scenario
            if (verificationError.name === 'TokenExpiredError') {
                // Still return 401 for expired tokens since refresh token should handle this
                return res.status(401).json({
                    success: false,
                    message: 'Token expired, please refresh',
                    code: 'TOKEN_EXPIRED',
                    requiresRefresh: true
                });
            } else {
                // For other verification errors, return 401
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token',
                    code: 'INVALID_TOKEN'
                });
            }
        }

        // 🔒 VALIDATE DECODED TOKEN
        if (!decoded || !decoded.sub) {
            logger.warn('Invalid token payload structure', {
                requestId,
                ip,
                hasSubject: !!decoded?.sub
            });
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
                code: 'INVALID_TOKEN_STRUCTURE'
            });
        }

        // 🔒 VALIDATE USER ID FORMAT
        let userId;
        try {
            userId = new ObjectId(decoded.sub);
        } catch (idError) {
            logger.warn('Invalid user ID format in token', {
                requestId,
                userId: decoded.sub,
                ip
            });
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
                code: 'INVALID_USER_ID_FORMAT'
            });
        }

        // 🔒 DATABASE CONNECTION with cold start awareness
        let db;
        const maxRetries = 3;
        const baseDelay = 2000; // 2 seconds base delay

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                db = await connectToDB();
                break; // Success, exit retry loop
            } catch (dbError) {
                const isLastAttempt = attempt === maxRetries;

                logger.warn(`Database connection attempt ${attempt}/${maxRetries} failed in auth middleware`, {
                    requestId,
                    userId: decoded.sub,
                    error: dbError.message,
                    attempt
                });

                if (isLastAttempt) {
                    logger.error('Database connection failed after all auth retry attempts', {
                        requestId,
                        userId: decoded.sub,
                        error: dbError.message,
                        totalAttempts: maxRetries
                    });

                    // Return 503 for cold start scenarios instead of 401
                    return res.status(503).json({
                        success: false,
                        message: 'Authentication service temporarily unavailable due to server initialization',
                        code: 'DATABASE_UNAVAILABLE',
                        retryAfter: 10,
                        isColdStart: true
                    });
                }

                // Wait before next attempt with exponential backoff
                await new Promise(resolve => setTimeout(resolve, baseDelay * attempt));
            }
        }

        // 🔒 FETCH USER FROM DATABASE
        const user = await db.collection('users').findOne({
            _id: userId,
            active: { $ne: false }
        });

        if (!user) {
            logger.warn('User not found or inactive', {
                requestId,
                userId: decoded.sub,
                ip
            });
            return res.status(401).json({
                success: false,
                message: 'User account not found',
                code: 'USER_NOT_FOUND'
            });
        }

        // 🔒 PASSWORD VERSION CHECK
        const userPv = user.passwordVersion || 1;
        const tokenPv = decoded.passwordVersion || 1;

        if (userPv !== tokenPv) {
            logger.warn('Authentication blocked: Password version mismatch', {
                requestId,
                userId: user._id,
                email: user.email,
                userPv,
                tokenPv,
                ip
            });

            return res.status(401).json({
                success: false,
                message: 'Session invalidated due to password change. Please login again.',
                code: 'PASSWORD_VERSION_MISMATCH'
            });
        }

        // 🔒 ATTACH USER TO REQUEST
        req.user = {
            id: user._id.toString(),
            _id: user._id,
            email: user.email,
            name: user.name,
            role: user.role || 'user',
            passwordVersion: user.passwordVersion || 1,
            tokenJti: decoded.jti,
            sessionId: decoded.sessionId
        };

        logger.debug('Authentication successful', {
            requestId,
            userId: user._id,
            email: user.email,
            ip
        });

        next();

    } catch (err) {
        logger.error('Auth middleware crashed:', {
            requestId,
            error: err.message,
            stack: err.stack,
            ip
        });

        // 🔒 NEVER LET AUTH MIDDLEWARE CRASH - ALWAYS RETURN 500
        return res.status(500).json({
            success: false,
            message: 'Authentication service error',
            code: 'AUTH_MIDDLEWARE_ERROR'
        });
    }
};

// Simple role-based authorization
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Insufficient permissions. Required role: ${roles.join(' or ')}`
            });
        }

        next();
    };
};

// Simple admin authorization
const requireAdminAuth = async (req, res, next) => {
    try {
        // First check if user is authenticated
        await requireUserAuth(req, res, () => { });

        // If requireUserAuth failed, the response has already been sent
        if (res.headersSent || !req.user) {
            return;
        }

        // Then check if user has admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        next();
    } catch (err) {
        logger.error('Admin auth middleware error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: 'Authorization service temporarily unavailable'
            });
        }
    }
};

module.exports = {
    requireUserAuth,
    requireRole,
    requireAdminAuth
};
