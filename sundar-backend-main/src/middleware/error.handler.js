/**
 * Centralized Error Handler
 * Standardizes error responses across the application
 * Enhanced for production with better logging and error tracking
 */

const logger = require('../utils/logger');

/**
 * Error ID generator for tracking
 */
const generateErrorId = () => {
  return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create standardized error objects
 */
const createError = {
  badRequest: (message = 'Bad Request') => ({
    status: 400,
    message,
    code: 'BAD_REQUEST'
  }),
  
  unauthorized: (message = 'Unauthorized') => ({
    status: 401,
    message,
    code: 'UNAUTHORIZED'
  }),
  
  forbidden: (message = 'Forbidden') => ({
    status: 403,
    message,
    code: 'FORBIDDEN'
  }),
  
  notFound: (message = 'Not Found') => ({
    status: 404,
    message,
    code: 'NOT_FOUND'
  }),
  
  conflict: (message = 'Conflict') => ({
    status: 409,
    message,
    code: 'CONFLICT'
  }),
  
  tooManyRequests: (message = 'Too Many Requests') => ({
    status: 429,
    message,
    code: 'TOO_MANY_REQUESTS'
  }),
  
  internalServerError: (message = 'Internal Server Error') => ({
    status: 500,
    message,
    code: 'INTERNAL_SERVER_ERROR'
  }),
  
  serviceUnavailable: (message = 'Service Unavailable') => ({
    status: 503,
    message,
    code: 'SERVICE_UNAVAILABLE'
  }),
  
  // New error types for better categorization
  databaseError: (message = 'Database Error') => ({
    status: 500,
    message,
    code: 'DATABASE_ERROR'
  }),
  
  networkError: (message = 'Network Error') => ({
    status: 502,
    message,
    code: 'NETWORK_ERROR'
  })
};

/**
 * Send standardized error response
 * @param {Object} res - Express response object
 * @param {Object} error - Error object
 * @param {string} requestId - Request ID for tracing
 * @param {string} errorId - Unique error ID for tracking
 */
const sendErrorResponse = (res, error, requestId = null, errorId = null) => {
  const response = {
    success: false,
    message: error.message || 'An unexpected error occurred',
    code: error.code || 'UNKNOWN_ERROR'
  };

  // Add identifiers for tracking
  if (requestId) {
    response.requestId = requestId;
  }
  if (errorId) {
    response.errorId = errorId;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    response.stack = error.stack;
  }

  // Add user-friendly messages for common errors
  if (process.env.NODE_ENV === 'production') {
    switch (error.code) {
      case 'DATABASE_ERROR':
        response.message = 'Service temporarily unavailable. Please try again later.';
        break;
      case 'NETWORK_ERROR':
        response.message = 'Network connectivity issue. Please check your connection.';
        break;
      case 'INTERNAL_SERVER_ERROR':
        response.message = 'Something went wrong on our end. Our team has been notified.';
        break;
    }
  }

  const statusCode = error.status || 500;
  return res.status(statusCode).json(response);
};

/**
 * Express error handling middleware
 * @param {Object} err - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const errorHandler = (err, req, res, next) => {
  // Generate unique identifiers
  const errorId = generateErrorId();
  const requestId = req.requestId || 'unknown';
  
  // Enhance error with additional context
  const errorWithContext = {
    ...err,
    errorId,
    requestId,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString()
  };

  // Handle specific error types
  // 🔧 M1-8 FIX: Merged duplicate ValidationError blocks into one handler
  if (err.name === 'ValidationError') {
    // Handles both Zod-style (err.message) and Mongoose-style (err.errors map)
    const message = err.errors
      ? Object.values(err.errors).map((e) => e.message).join(', ')
      : err.message;
    logger.warn('Validation error:', errorWithContext);
    return sendErrorResponse(res, createError.badRequest(message), requestId, errorId);
  }

  // Handle database connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    logger.error('Database connection error:', errorWithContext);
    return sendErrorResponse(res, createError.databaseError('Database connection failed'), requestId, errorId);
  }

  // Handle timeout errors
  if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
    logger.error('Timeout error:', errorWithContext);
    return sendErrorResponse(res, createError.networkError('Request timeout'), requestId, errorId);
  }

  // Handle rate limiting errors
  if (err.name === 'TooManyRequestsError' || err.statusCode === 429) {
    logger.warn('Rate limiting error:', errorWithContext);
    return sendErrorResponse(res, createError.tooManyRequests('Too many requests'), requestId, errorId);
  }

  // Handle cast errors (invalid ID format)
  if (err.name === 'CastError') {
    logger.warn('Cast error:', errorWithContext);
    return sendErrorResponse(res, createError.badRequest('Invalid ID format'), requestId, errorId);
  }

  // Log unexpected errors with full context
  logger.error('Unhandled application error:', errorWithContext);

  // Report to external error monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // 🔧 M1-9 FIX: Replaced logger.errorToFile (may not exist) with structured logger.error
    logger.error('UNHANDLED_PRODUCTION_ERROR', {
      errorId,
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    // TODO: Integrate Sentry: Sentry.captureException(err, { contexts: { request: errorWithContext } });
  }

  // Return internal server error with error tracking
  return sendErrorResponse(res, createError.internalServerError(), requestId, errorId);
};

/**
 * Async error wrapper for route handlers
 * Catches async errors and passes them to error handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  createError,
  sendErrorResponse,
  errorHandler,
  asyncHandler,
  generateErrorId
};