/**
 * 🔥 COLD-START SAFE AUTH MIDDLEWARE
 * 
 * Production-grade authentication middleware optimized for Render free tier
 * Implements intelligent cold start detection and graceful degradation
 * Never breaks user sessions on transient server issues
 */

const { verifyAccessToken, getTokenRemainingTime } = require('../utils/jwt.coldstart');
const logger = require('../utils/logger');

/**
 * 🔥 COLD-START AWARE AUTHENTICATION MIDDLEWARE
 * 
 * Protects routes while handling cold start scenarios gracefully
 */
const authenticate = async (req, res, next) => {
  try {
    // Get access token from cookies OR Authorization header
    let token = req.cookies?.accessToken;

    // Check Authorization header if no cookie
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    // Verify token with enhanced logging
    let decoded;
    try {
      decoded = await verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        logger.info('Access token expired', { tokenExpiresAt: err.expiredAt });
        return res.status(401).json({
          success: false,
          message: 'Access token expired',
          code: 'TOKEN_EXPIRED',
          requiresLogin: false // 🔥 CRITICAL: Allow frontend to refresh
        });
      }
      throw err; // Re-throw for general catch block
    }

    if (!decoded) {
      logger.warn('Token verification failed in middleware', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        serverInstanceId: process.env.SERVER_INSTANCE_ID || 'unknown'
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid access token',
        code: 'INVALID_TOKEN',
        requiresLogin: false
      });
    }

    // Log successful authentication
    const remainingTime = getTokenRemainingTime(token);
    logger.debug('✅ User authenticated successfully', {
      userId: decoded.sub,
      email: decoded.email,
      tokenExpiresIn: `${Math.floor(remainingTime / 60)} minutes`,
      serverInstanceId: process.env.SERVER_INSTANCE_ID || 'unknown'
    });

    // Attach user to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      passwordVersion: decoded.passwordVersion
    };

    next();

  } catch (error) {
    logger.error('Authentication middleware error', {
      error: error.message,
      userId: req.user?.id
    });

    // Classify error type for appropriate response
    const isColdStart = error.message.includes('connection') ||
      error.message.includes('timeout') ||
      error.name === 'MongoNetworkError' ||
      error.message.includes('database');

    if (isColdStart) {
      logger.warn('Cold start detected in auth middleware', {
        error: error.message,
        errorName: error.name,
        serverInstanceId: process.env.SERVER_INSTANCE_ID || 'unknown'
      });

      // Return 503 for cold start - frontend will retry, NOT logout
      return res.status(503).json({
        success: false,
        message: 'Service initializing. Please retry shortly.',
        retryAfter: 5,
        isColdStart: true,
        requiresLogin: false,
        serverInstanceId: process.env.SERVER_INSTANCE_ID || 'unknown'
      });
    } else {
      // Return 500 for other server errors - frontend will retry
      logger.error('Authentication middleware error', {
        error: error.message,
        errorName: error.name,
        userId: req.user?.id,
        serverInstanceId: process.env.SERVER_INSTANCE_ID || 'unknown'
      });

      return res.status(500).json({
        success: false,
        message: 'Authentication service temporarily unavailable',
        retryAfter: 3,
        isServerError: true,
        requiresLogin: false
      });
    }
  }
};

/**
 * 🔥 OPTIONAL AUTH MIDDLEWARE
 * 
 * Allows route to proceed even if user is not authenticated
 * Sets req.user if token is valid, otherwise continues without error
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;

    // Check Authorization header if no cookie
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return next(); // Continue without user
    }

    const decoded = await verifyAccessToken(token);

    if (decoded) {
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        passwordVersion: decoded.passwordVersion
      };
    }

    next();

  } catch (error) {
    logger.warn('Optional auth failed (continuing)', {
      error: error.message
    });
    next(); // Continue even if auth fails
  }
};

/**
 * 🔥 ROLE-BASED AUTHORIZATION MIDDLEWARE
 * 
 * Checks if user has required role(s)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * 🔥 PASSWORD VERSION CHECK MIDDLEWARE
 * 
 * Ensures user hasn't changed password since token was issued
 */
const checkPasswordVersion = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    // Get current password version from database
    const { connectToDB } = require('../config/database');
    const db = await connectToDB();

    const user = await db.collection('users').findOne(
      { _id: req.user.id },
      { projection: { passwordVersion: 1 } }
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Compare password versions
    if (user.passwordVersion !== req.user.passwordVersion) {
      logger.info('Password version mismatch - token invalidated', {
        userId: req.user.id,
        tokenVersion: req.user.passwordVersion,
        currentVersion: user.passwordVersion
      });

      return res.status(401).json({
        success: false,
        message: 'Session invalidated. Please log in again.',
        code: 'PASSWORD_CHANGED'
      });
    }

    next();

  } catch (error) {
    logger.error('Password version check failed', {
      error: error.message,
      userId: req.user?.id
    });

    // Enhanced cold start detection
    const isColdStart = error.name === 'MongoNetworkError' ||
      error.message.includes('connection') ||
      error.message.includes('timeout') ||
      error.message.includes('database');

    if (isColdStart) {
      logger.warn('Cold start detected in password version check', {
        error: error.message,
        errorName: error.name,
        userId: req.user?.id,
        serverInstanceId: process.env.SERVER_INSTANCE_ID || 'unknown'
      });

      return res.status(503).json({
        success: false,
        message: 'Service initializing. Please retry shortly.',
        retryAfter: 5,
        isColdStart: true,
        requiresLogin: false,
        serverInstanceId: process.env.SERVER_INSTANCE_ID || 'unknown'
      });
    }

    // For other errors, still allow request to proceed (fail open)
    logger.debug('Password version check failed, allowing request (fail open)', {
      error: error.message,
      userId: req.user?.id,
      serverInstanceId: process.env.SERVER_INSTANCE_ID || 'unknown'
    });
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  checkPasswordVersion
};