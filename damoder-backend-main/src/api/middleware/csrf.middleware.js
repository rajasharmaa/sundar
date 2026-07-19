const logger = require('../../utils/logger');
const { createError, sendErrorResponse } = require('../../utils/secure-error-handler');

/**
 * Double-Submit Cookie CSRF protection middleware.
 * Verifies that the 'X-CSRF-Token' header matches the secure '_csrf' cookie.
 */
const csrfProtection = (req, res, next) => {
  const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  
  if (!mutatingMethods.includes(req.method)) {
    return next();
  }

  // Bypass CSRF protection for refresh token endpoint
  if (req.path && req.path.includes('/auth/refresh-token')) {
    return next();
  }

  const cookieToken = req.cookies?.['_csrf'];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    logger.warn('❌ CSRF verification failed: Token mismatch or missing', {
      method: req.method,
      path: req.path,
      requestId: req.requestId,
      hasCookie: !!cookieToken,
      hasHeader: !!headerToken
    });

    const error = createError.forbidden('CSRF protection block: Invalid or missing CSRF token.');
    return sendErrorResponse(res, error, req.requestId);
  }

  return next();
};

module.exports = csrfProtection;
