// 🔐 ENTERPRISE-GRADE AUTHENTICATION MIDDLEWARE
// Handles JWT verification with cross-origin support and advanced security

const { verifyAccessToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const { connectToDB } = require('../config/database');

// 🔐 AUTHENTICATION MIDDLEWARE WITH CROSS-ORIGIN SUPPORT
const requireAuth = async (req, res, next) => {
  try {
    // 🔥 GET ACCESS TOKEN FROM COOKIES (PRIORITY) OR HEADERS (FALLBACK)
    const token = req.cookies?.accessToken || 
                  req.headers.authorization?.replace('Bearer ', '') ||
                  null;
    
    if (!token) {
      logger.debug('Authentication failed: No access token provided', {
        hasCookies: !!req.cookies,
        hasAuthHeader: !!req.headers.authorization,
        ip: req.ip,
        userAgent: req.headers['user-agent']?.substring(0, 50)
      });
      
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // 🔐 VERIFY ACCESS TOKEN WITH ENHANCED SECURITY
    const decoded = await verifyAccessToken(token, {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    if (!decoded) {
      logger.warn('Authentication failed: Invalid or expired token', {
        ip: req.ip,
        userAgent: req.headers['user-agent']?.substring(0, 50)
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    // 🔐 FETCH USER DATA FOR CONTEXT
    try {
      const db = await connectToDB();
      const user = await db.collection('users').findOne(
        { _id: decoded.sub },
        { projection: { password: 0, __v: 0 } }
      );

      if (!user) {
        logger.warn('Authentication failed: User not found', {
          userId: decoded.sub,
          ip: req.ip
        });
        
        return res.status(401).json({
          success: false,
          message: 'User account not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // 🔐 ATTACH USER CONTEXT TO REQUEST
      req.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        phone: user.phone,
        createdAt: user.createdAt,
        // Token metadata for security checks
        tokenIssuedAt: decoded.iat,
        tokenExpiresAt: decoded.exp,
        sessionId: decoded.sessionId,
        passwordVersion: user.passwordVersion || 1
      };

      logger.debug('Authentication successful', {
        userId: user._id,
        email: user.email,
        sessionId: decoded.sessionId?.substring(0, 8) + '...',
        ip: req.ip
      });

      next();
      
    } catch (dbError) {
      logger.error('Database error during authentication', {
        error: dbError.message,
        userId: decoded.sub
      });
      
      return res.status(500).json({
        success: false,
        message: 'Authentication service temporarily unavailable',
        code: 'DB_ERROR'
      });
    }

  } catch (error) {
    logger.error('Unexpected authentication error', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    return res.status(500).json({
      success: false,
      message: 'Authentication service error',
      code: 'INTERNAL_ERROR'
    });
  }
};

// 🔐 OPTIONAL AUTHENTICATION MIDDLEWARE
// Allows requests to proceed even without authentication
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || 
                  req.headers.authorization?.replace('Bearer ', '') ||
                  null;
    
    if (token) {
      const decoded = await verifyAccessToken(token, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      if (decoded) {
        try {
          const db = await connectToDB();
          const user = await db.collection('users').findOne(
            { _id: decoded.sub },
            { projection: { password: 0 } }
          );
          
          if (user) {
            req.user = {
              id: user._id,
              email: user.email,
              name: user.name,
              role: user.role || 'user'
            };
          }
        } catch (dbError) {
          logger.warn('Optional auth DB error (continuing without auth)', {
            error: dbError.message
          });
        }
      }
    }
    
    next();
  } catch (error) {
    logger.warn('Optional auth error (continuing without auth)', {
      error: error.message
    });
    next();
  }
};

// 🔐 ADMIN-ONLY MIDDLEWARE
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }
  
  if (req.user.role !== 'admin') {
    logger.warn('Admin access denied', {
      userId: req.user.id,
      userRole: req.user.role,
      ip: req.ip
    });
    
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
      code: 'INSUFFICIENT_PRIVILEGES'
    });
  }
  
  next();
};

// 🔐 RATE LIMITING MIDDLEWARE FOR AUTH ENDPOINTS
const createAuthRateLimiter = (windowMs = 15 * 60 * 1000, max = 5) => {
  const clients = new Map();
  
  return (req, res, next) => {
    const clientId = req.ip || req.connection?.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!clients.has(clientId)) {
      clients.set(clientId, []);
    }
    
    const requests = clients.get(clientId);
    
    // Clean old requests
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    validRequests.push(now);
    clients.set(clientId, validRequests);
    
    if (validRequests.length > max) {
      logger.warn('Rate limit exceeded for auth endpoint', {
        clientId,
        requestCount: validRequests.length,
        ip: req.ip
      });
      
      return res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    next();
  };
};

module.exports = {
  requireAuth,
  optionalAuth,
  requireAdmin,
  createAuthRateLimiter
};