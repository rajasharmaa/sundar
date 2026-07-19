// 🔐 SECURE ERROR HANDLING - PRODUCTION GRADE SECURITY
// Prevents sensitive data leakage while maintaining usability

const crypto = require('crypto');
const config = require('../config/env');
const logger = require('./logger');

// 🔒 ENTERPRISE-GRADE ERROR WHITELIST - MINIMAL SAFE FIELDS
const SAFE_ERROR_FIELDS = new Set([
  'message',
  'code',
  'statusCode',
  'errorId',
  'timestamp',
  'requestId',
  'helpUrl',
  'retryAfter',
  'details' // Only sanitized details
]);

// 🔒 SECURITY LOGGING CONTEXT
const getSecurityContext = (req) => ({
  ip: req?.ip || 'unknown',
  userAgent: req?.headers?.['user-agent']?.substring(0, 100) || 'unknown',
  method: req?.method || 'unknown',
  url: req?.originalUrl || 'unknown',
  userId: req?.user?.id || 'anonymous',
  requestId: req?.requestId || 'unknown'
});

// 🔒 SENSITIVE FIELD PATTERNS TO FILTER
const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /key/i,
  /token/i,
  /cookie/i,
  /authorization/i,
  /bearer/i,
  /private/i,
  /credential/i,
  /database/i,
  /mongo/i,
  /redis/i,
  /connection/i,
  /filesystem/i,
  /path/i,
  /directory/i,
  /file/i,
  /config/i,
  /env/i
];

// 🔐 STANDARDIZED ERROR CODES WITH CONSISTENT RESPONSE FORMAT
const ERROR_CODES = {
  // Authentication Errors (401)
  UNAUTHORIZED: {
    statusCode: 401,
    code: 'UNAUTHORIZED',
    message: 'Authentication required',
    userMessage: 'Please log in to continue'
  },
  INVALID_CREDENTIALS: {
    statusCode: 401,
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid credentials provided',
    userMessage: 'Invalid email or password'
  },
  TOKEN_EXPIRED: {
    statusCode: 401,
    code: 'TOKEN_EXPIRED',
    message: 'Authentication token expired',
    userMessage: 'Your session has expired. Please log in again'
  },
  TOKEN_INVALID: {
    statusCode: 401,
    code: 'TOKEN_INVALID',
    message: 'Invalid authentication token',
    userMessage: 'Invalid session. Please log in again'
  },
  TOKEN_REVOKED: {
    statusCode: 401,
    code: 'TOKEN_REVOKED',
    message: 'Authentication token has been revoked',
    userMessage: 'Your session has been terminated. Please log in again'
  },
  MISSING_EMAIL: {
    statusCode: 400,
    code: 'MISSING_EMAIL',
    message: 'Email address is required',
    userMessage: 'Please enter your email address'
  },
  MISSING_PASSWORD: {
    statusCode: 400,
    code: 'MISSING_PASSWORD',
    message: 'Password is required',
    userMessage: 'Please enter your password'
  },
  INVALID_EMAIL_FORMAT: {
    statusCode: 400,
    code: 'INVALID_EMAIL_FORMAT',
    message: 'Invalid email format provided',
    userMessage: 'Please enter a valid email address'
  },
  
  // Authorization Errors (403)
  FORBIDDEN: {
    statusCode: 403,
    code: 'FORBIDDEN',
    message: 'Access forbidden',
    userMessage: 'You do not have permission to perform this action'
  },
  INSUFFICIENT_PERMISSIONS: {
    statusCode: 403,
    code: 'INSUFFICIENT_PERMISSIONS',
    message: 'Insufficient permissions',
    userMessage: 'You lack the required permissions for this operation'
  },
  SESSION_CONFLICT: {
    statusCode: 403,
    code: 'SESSION_CONFLICT',
    message: 'Multiple active sessions detected',
    userMessage: 'Another session is active. Please log out from other devices'
  },
  
  // Client Errors (400)
  VALIDATION_ERROR: {
    statusCode: 400,
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    userMessage: 'Please check your input and try again'
  },
  MISSING_FIELD: {
    statusCode: 400,
    code: 'MISSING_FIELD',
    message: 'Required field missing',
    userMessage: 'Please provide all required information'
  },
  WEAK_PASSWORD: {
    statusCode: 400,
    code: 'WEAK_PASSWORD',
    message: 'Password does not meet security requirements',
    userMessage: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
  },
  INVALID_INPUT: {
    statusCode: 400,
    code: 'INVALID_INPUT',
    message: 'Invalid input provided',
    userMessage: 'The provided input format is not valid'
  },
  EMAIL_EXISTS: {
    statusCode: 409,
    code: 'EMAIL_EXISTS',
    message: 'Email address already registered',
    userMessage: 'An account with this email already exists'
  },
  MISSING_FIELDS: {
    statusCode: 400,
    code: 'MISSING_FIELDS',
    message: 'Required fields are missing',
    userMessage: 'Please fill in all required fields'
  },
  DUPLICATE_ACCOUNT: {
    statusCode: 409,
    code: 'DUPLICATE_ACCOUNT',
    message: 'Account already exists',
    userMessage: 'An account with this email already exists'
  },
  INSERTION_FAILED: {
    statusCode: 500,
    code: 'INSERTION_FAILED',
    message: 'Failed to create user account',
    userMessage: 'Unable to process registration'
  },
  HASHING_FAILED: {
    statusCode: 500,
    code: 'HASHING_FAILED',
    message: 'Password hashing failed',
    userMessage: 'Unable to process registration'
  },
  
  // Resource Errors (404)
  NOT_FOUND: {
    statusCode: 404,
    code: 'NOT_FOUND',
    message: 'Resource not found',
    userMessage: 'The requested resource could not be found'
  },
  USER_NOT_FOUND: {
    statusCode: 404,
    code: 'USER_NOT_FOUND',
    message: 'User account not found',
    userMessage: 'No account found with the provided credentials'
  },
  PRODUCT_NOT_FOUND: {
    statusCode: 404,
    code: 'PRODUCT_NOT_FOUND',
    message: 'Product not found',
    userMessage: 'The requested product could not be found'
  },
  CATEGORY_NOT_FOUND: {
    statusCode: 404,
    code: 'CATEGORY_NOT_FOUND',
    message: 'Category not found',
    userMessage: 'The requested category does not exist'
  },
  
  // Conflict Errors (409)
  RESOURCE_CONFLICT: {
    statusCode: 409,
    code: 'RESOURCE_CONFLICT',
    message: 'Resource conflict detected',
    userMessage: 'This resource cannot be modified due to conflicting state'
  },
  DUPLICATE_ENTRY: {
    statusCode: 409,
    code: 'DUPLICATE_ENTRY',
    message: 'Duplicate entry detected',
    userMessage: 'This entry already exists in the system'
  },
  
  // Server Errors (500)
  INTERNAL_ERROR: {
    statusCode: 500,
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    userMessage: 'An unexpected error occurred. Please try again later'
  },
  DATABASE_ERROR: {
    statusCode: 500,
    code: 'DATABASE_ERROR',
    message: 'Database operation failed',
    userMessage: 'Database service temporarily unavailable'
  },
  CACHE_ERROR: {
    statusCode: 500,
    code: 'CACHE_ERROR',
    message: 'Cache service error',
    userMessage: 'Cache service temporarily unavailable'
  },
  
  // Service Unavailable (503)
  SERVICE_UNAVAILABLE: {
    statusCode: 503,
    code: 'SERVICE_UNAVAILABLE',
    message: 'Service temporarily unavailable',
    userMessage: 'Service is currently unavailable. Please try again shortly'
  },
  MAINTENANCE_MODE: {
    statusCode: 503,
    code: 'MAINTENANCE_MODE',
    message: 'System under maintenance',
    userMessage: 'System is currently under maintenance. Please try again later'
  },
  
  // Rate Limiting (429)
  TOO_MANY_REQUESTS: {
    statusCode: 429,
    code: 'TOO_MANY_REQUESTS',
    message: 'Rate limit exceeded',
    userMessage: 'Too many requests. Please try again later',
    retryAfter: 60 // seconds
  },
  BRUTE_FORCE_DETECTED: {
    statusCode: 429,
    code: 'BRUTE_FORCE_DETECTED',
    message: 'Suspicious activity detected',
    userMessage: 'Too many failed attempts. Account temporarily locked',
    retryAfter: 900 // 15 minutes
  },
  RATE_LIMIT_EXCEEDED: {
    statusCode: 429,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Rate limit exceeded for this IP',
    userMessage: 'Too many failed attempts. Please try again later',
    retryAfter: 300 // 5 minutes
  },
  ACCOUNT_LOCKED: {
    statusCode: 429,
    code: 'ACCOUNT_LOCKED',
    message: 'Account temporarily locked due to failed attempts',
    userMessage: 'Account locked due to multiple failed attempts. Please try again later',
    retryAfter: 900 // 15 minutes
  },
  
  // Service Unavailable (503)
  SERVICE_TEMPORARILY_UNAVAILABLE: {
    statusCode: 503,
    code: 'SERVICE_TEMPORARILY_UNAVAILABLE',
    message: 'Service temporarily unavailable',
    userMessage: 'Service is initializing. Please wait a moment and try again',
    retryAfter: 30
  },
  DATABASE_UNAVAILABLE: {
    statusCode: 503,
    code: 'DATABASE_UNAVAILABLE',
    message: 'Database service unavailable',
    userMessage: 'Database service is temporarily unavailable. Please try again in a moment',
    retryAfter: 30
  },
  DATABASE_QUERY_FAILED: {
    statusCode: 503,
    code: 'DATABASE_QUERY_FAILED',
    message: 'Database query failed',
    userMessage: 'Unable to verify credentials. Please try again',
    retryAfter: 15
  },
  AUTH_SERVICE_ERROR: {
    statusCode: 500,
    code: 'AUTH_SERVICE_ERROR',
    message: 'Authentication service error',
    userMessage: 'Authentication service error. Please try again'
  },
  TOKEN_GENERATION_FAILED: {
    statusCode: 500,
    code: 'TOKEN_GENERATION_FAILED',
    message: 'Token generation failed',
    userMessage: 'Unable to complete authentication. Please try again'
  }
};

// 🔒 SANITIZE ERROR OBJECT - REMOVE SENSITIVE DATA
const sanitizeError = (error, requestId) => {
  const sanitized = {
    errorId: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    requestId: requestId || 'unknown'
  };

  // Add safe fields
  Object.keys(error).forEach(key => {
    if (SAFE_ERROR_FIELDS.has(key.toLowerCase())) {
      sanitized[key] = error[key];
    }
  });

  // Use predefined error code if available
  if (error.code && ERROR_CODES[error.code]) {
    const errorCode = ERROR_CODES[error.code];
    sanitized.statusCode = errorCode.statusCode;
    sanitized.message = config.NODE_ENV === 'production' ? 
      errorCode.userMessage : 
      errorCode.message;
    sanitized.code = error.code;
  } else {
    // Default error handling
    sanitized.statusCode = error.statusCode || 500;
    sanitized.message = config.NODE_ENV === 'production' ?
      'An error occurred while processing your request' :
      (error.message || 'Internal server error');
  }

  // Add help URL for common errors
  if (sanitized.statusCode === 401) {
    sanitized.helpUrl = '/login';
  } else if (sanitized.statusCode === 403) {
    sanitized.helpUrl = '/support';
  }

  return sanitized;
};

// 🔒 FILTER SENSITIVE DATA FROM OBJECTS
const filterSensitiveData = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const filtered = Array.isArray(obj) ? [] : {};
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const keyLower = key.toLowerCase();
    
    // Check if field name contains sensitive patterns
    const isSensitive = SENSITIVE_PATTERNS.some(pattern => pattern.test(keyLower));
    
    if (isSensitive) {
      filtered[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      filtered[key] = filterSensitiveData(value);
    } else {
      filtered[key] = value;
    }
  });
  
  return filtered;
};

// 🔐 STANDARDIZED ERROR FACTORY WITH CONSISTENT SIGNATURES
const createError = {
  // Authentication errors (401)
  unauthorized: (message, details) => (createErrorFactory('UNAUTHORIZED', message, details)),
  invalidCredentials: (message, details) => (createErrorFactory('INVALID_CREDENTIALS', message, details)),
  tokenExpired: (message, details) => (createErrorFactory('TOKEN_EXPIRED', message, details)),
  tokenInvalid: (message, details) => (createErrorFactory('TOKEN_INVALID', message, details)),
  tokenRevoked: (message, details) => (createErrorFactory('TOKEN_REVOKED', message, details)),
  
  // Authorization errors (403)
  forbidden: (message, details) => (createErrorFactory('FORBIDDEN', message, details)),
  insufficientPermissions: (message, details) => (createErrorFactory('INSUFFICIENT_PERMISSIONS', message, details)),
  sessionConflict: (message, details) => (createErrorFactory('SESSION_CONFLICT', message, details)),
  
  // Client errors (400)
  validation: (message, details) => (createErrorFactory('VALIDATION_ERROR', message, details)),
  badRequest: (message, details) => (createErrorFactory('INVALID_INPUT', message, details)),
  unprocessable: (message, details) => (createErrorFactory('INVALID_INPUT', message, details)),
  missingField: (field, details) => (createErrorFactory('MISSING_FIELD', `${ERROR_CODES.MISSING_FIELD.message}: ${field}`, details)),
  weakPassword: (message, details) => (createErrorFactory('WEAK_PASSWORD', message, details)),
  invalidInput: (message, details) => (createErrorFactory('INVALID_INPUT', message, details)),
  emailExists: (message, details) => (createErrorFactory('EMAIL_EXISTS', message, details)),
  
  // Resource errors (404)
  notFound: (resource, details) => (createErrorFactory('NOT_FOUND', resource ? `${resource} not found` : ERROR_CODES.NOT_FOUND.message, details)),
  userNotFound: (message, details) => (createErrorFactory('USER_NOT_FOUND', message, details)),
  productNotFound: (message, details) => (createErrorFactory('PRODUCT_NOT_FOUND', message, details)),
  categoryNotFound: (message, details) => (createErrorFactory('CATEGORY_NOT_FOUND', message, details)),
  
  // Conflict errors (409)
  resourceConflict: (message, details) => (createErrorFactory('RESOURCE_CONFLICT', message, details)),
  duplicateEntry: (message, details) => (createErrorFactory('DUPLICATE_ENTRY', message, details)),
  
  // Server errors (500)
  internal: (message, details) => (createErrorFactory('INTERNAL_ERROR', message, details)),
  databaseError: (message, details) => (createErrorFactory('DATABASE_ERROR', message, details)),
  cacheError: (message, details) => (createErrorFactory('CACHE_ERROR', message, details)),
  
  // Service unavailable (503)
  serviceUnavailable: (message, details) => (createErrorFactory('SERVICE_UNAVAILABLE', message, details)),
  maintenanceMode: (message, details) => (createErrorFactory('MAINTENANCE_MODE', message, details)),
  
  // Rate limiting (429)
  tooManyRequests: (message, retryAfter, details) => ({
    ...createErrorFactory('TOO_MANY_REQUESTS', message, details),
    retryAfter: retryAfter || ERROR_CODES.TOO_MANY_REQUESTS.retryAfter
  }),
  bruteForceDetected: (message, retryAfter, details) => ({
    ...createErrorFactory('BRUTE_FORCE_DETECTED', message, details),
    retryAfter: retryAfter || ERROR_CODES.BRUTE_FORCE_DETECTED.retryAfter
  })
};

// 🔧 HELPER FUNCTION FOR ERROR CREATION
const createErrorFactory = (errorCode, message, details) => {
  const errorConfig = ERROR_CODES[errorCode];
  if (!errorConfig) {
    // Fallback to internal error if code not found
    return {
      code: 'INTERNAL_ERROR',
      message: 'Unknown error code',
      statusCode: 500,
      ...(details && { details: filterSensitiveData(details) })
    };
  }
  
  return {
    code: errorConfig.code,
    message: message || errorConfig.message,
    statusCode: errorConfig.statusCode,
    ...(details && { details: filterSensitiveData(details) }),
    ...(errorConfig.retryAfter && { retryAfter: errorConfig.retryAfter })
  };
};

// 🔐 STANDARDIZED ERROR RESPONSE SENDER WITH CONSISTENT STRUCTURE
const sendErrorResponse = (res, error, requestId) => {
  try {
    // Ensure error has required structure
    const errorWithDefaults = {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'An unexpected error occurred',
      statusCode: error.statusCode || 500,
      ...(error.details && { details: error.details }),
      ...(error.retryAfter && { retryAfter: error.retryAfter })
    };
    
    // Sanitize the error for response
    const sanitizedError = sanitizeError(errorWithDefaults, requestId);
    
    // Enhanced logging with structured data
    const logContext = {
      errorId: sanitizedError.errorId,
      code: sanitizedError.code,
      statusCode: sanitizedError.statusCode,
      requestId: sanitizedError.requestId,
      timestamp: sanitizedError.timestamp
    };
    
    // Detailed logging in development
    if (config.LOG_LEVEL === 'debug' || config.NODE_ENV === 'development') {
      logger.error('🔧 Detailed error context:', {
        ...logContext,
        originalMessage: error.message,
        stack: error.stack?.split('\n').slice(0, 5).join('\n'),
        details: error.details
      });
    } else {
      // Production logging
      logger.error('❌ API Error occurred:', logContext);
    }
    
    // 🔒 SECURITY HEADERS FOR ALL ERROR RESPONSES
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Error-Id': sanitizedError.errorId
    });
    
    // 🔐 STANDARDIZED ERROR RESPONSE STRUCTURE
    const responsePayload = {
      success: false,
      error: {
        id: sanitizedError.errorId,
        code: sanitizedError.code,
        message: sanitizedError.message,
        timestamp: sanitizedError.timestamp
      }
    };
    
    // Add optional fields
    if (sanitizedError.helpUrl) {
      responsePayload.error.helpUrl = sanitizedError.helpUrl;
    }
    
    if (sanitizedError.retryAfter) {
      responsePayload.error.retryAfter = sanitizedError.retryAfter;
      res.set('Retry-After', sanitizedError.retryAfter.toString());
    }
    
    if (sanitizedError.details && config.NODE_ENV === 'development') {
      responsePayload.error.details = sanitizedError.details;
    }
    
    // Send response
    res.status(sanitizedError.statusCode).json(responsePayload);
    
  } catch (handlerError) {
    // Ultimate fallback
    logger.error('🚨 Error handler crashed:', {
      originalError: error?.message,
      handlerError: handlerError.message,
      requestId: requestId,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      error: {
        id: 'fallback-' + Date.now(),
        code: 'INTERNAL_ERROR',
        message: 'Critical system error occurred',
        timestamp: new Date().toISOString()
      }
    });
  }
};

// 🔐 ENTERPRISE-GRADE ERROR HANDLING MIDDLEWARE WITH ENHANCED CLASSIFICATION
const errorHandler = (err, req, res, next) => {
  // Prevent double handling
  if (res.headersSent) {
    logger.warn('❌ Error handler called after headers sent', {
      error: err.message,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
    return next(err);
  }
  
  const requestId = req.requestId || 'unknown';
  const securityContext = getSecurityContext(req);
  
  // 🔥 INTELLIGENT ERROR CLASSIFICATION WITH SECURITY LEVELS
  let errorResponse;
  let securityLevel = 'LOW';
  
  // Handle different error types with appropriate responses
  if (err.isOperational) {
    // Known operational errors - use as-is
    errorResponse = err;
  } else if (err.name === 'ValidationError') {
    // Mongoose validation errors
    errorResponse = createError.validation('Validation failed', err.errors);
  } else if (err.name === 'CastError') {
    // MongoDB cast errors (invalid ID format)
    errorResponse = createError.notFound('Invalid resource identifier');
  } else if (err.code === 11000) {
    // MongoDB duplicate key errors
    const field = Object.keys(err.keyPattern)[0];
    errorResponse = createError.duplicateEntry(`${field} already exists`);
    securityLevel = 'MEDIUM'; // Potential enumeration attack
  } else if (err.name === 'JsonWebTokenError') {
    errorResponse = createError.tokenInvalid('Invalid authentication token');
    securityLevel = 'HIGH'; // Token manipulation attempt
  } else if (err.name === 'TokenExpiredError') {
    errorResponse = createError.tokenExpired('Authentication token has expired');
    securityLevel = 'MEDIUM';
  } else if (err.name === 'UnauthorizedError') {
    errorResponse = createError.unauthorized('Access requires authentication');
    securityLevel = 'HIGH'; // Auth bypass attempt
  } else if (err.code === 'ENOENT' || err.code === 'ENOTFOUND') {
    // Network/service discovery errors
    errorResponse = createError.serviceUnavailable('External service unavailable');
    securityLevel = 'MEDIUM';
  } else if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    // Connection errors
    errorResponse = createError.databaseError('Database connection failed');
    securityLevel = 'MEDIUM';
  } else if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError' || err.name === 'MongoServerSelectionError') {
    // MongoDB connection/network errors
    errorResponse = createError.serviceUnavailable('Database service temporarily unavailable');
    securityLevel = 'MEDIUM';
  } else if (err.message && (err.message.includes('Redis') || err.message.includes('redis'))) {
    // Redis connection errors
    errorResponse = createError.cacheError('Cache service temporarily unavailable');
    securityLevel = 'MEDIUM';
  } else {
    // Unknown/unexpected errors - HIGHEST SECURITY LEVEL
    errorResponse = createError.internal('Unexpected system error occurred');
    securityLevel = 'CRITICAL';
  }
  
  // 🔥 ENHANCED SECURITY CONTEXT WITH STRUCTURED LOGGING
  const errorLogContext = {
    ...securityContext,
    errorId: errorResponse.errorId || crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9),
    errorCode: errorResponse.code,
    errorName: err.name,
    errorClass: err.constructor.name,
    securityLevel,
    timestamp: new Date().toISOString()
  };
  
  // 🔥 TIERED SECURITY LOGGING
  switch (securityLevel) {
    case 'CRITICAL':
      logger.error('🚨 CRITICAL SYSTEM ERROR - Requires immediate attention', errorLogContext);
      break;
    case 'HIGH':
      logger.warn('⚠️ HIGH SECURITY INCIDENT - Potential attack detected', errorLogContext);
      break;
    case 'MEDIUM':
      logger.info('ℹ️ MEDIUM SECURITY EVENT - Monitoring recommended', errorLogContext);
      break;
    default:
      logger.debug('🔧 Operational system event', errorLogContext);
  }
  
  // 🔥 COMPREHENSIVE DEVELOPMENT DEBUGGING
  if (config.NODE_ENV === 'development' || config.LOG_LEVEL === 'debug') {
    logger.error('🔧 Comprehensive error diagnostics:', {
      ...errorLogContext,
      originalError: {
        message: err.message,
        stack: err.stack?.split('\n').slice(0, 8).join('\n'),
        name: err.name,
        code: err.code,
        details: err.details
      },
      sanitizedResponse: {
        code: errorResponse.code,
        statusCode: errorResponse.statusCode,
        message: errorResponse.message
      }
    });
  }
  
  // Add security metadata to error response for monitoring
  errorResponse.securityMetadata = {
    securityLevel,
    classifiedAt: new Date().toISOString(),
    requestId: securityContext.requestId,
    userAgentHash: securityContext.userAgent ? 
      crypto.createHash('sha256').update(securityContext.userAgent).digest('hex').substring(0, 16) : 
      'unknown'
  };
  
  sendErrorResponse(res, errorResponse, requestId);
};

// 🔐 EXPORT STANDARDIZED ERROR HANDLING MODULE
module.exports = {
  // Error creation factory
  createError,
  
  // Response sender
  sendErrorResponse,
  
  // Main error handler middleware
  errorHandler,
  
  // Utility functions
  sanitizeError,
  filterSensitiveData,
  
  // Configuration
  ERROR_CODES,
  
  // Helper functions for external use
  isOperationalError: (error) => error.isOperational === true,
  getErrorCode: (error) => error.code || 'INTERNAL_ERROR',
  getErrorStatusCode: (error) => error.statusCode || 500,
  
  // Security level classification
  getSecurityLevel: (error) => {
    if (error.securityMetadata) return error.securityMetadata.securityLevel;
    if (error.statusCode >= 500) return 'CRITICAL';
    if (error.statusCode === 401 || error.statusCode === 403) return 'HIGH';
    if (error.statusCode === 400 || error.statusCode === 409) return 'MEDIUM';
    return 'LOW';
  }
};