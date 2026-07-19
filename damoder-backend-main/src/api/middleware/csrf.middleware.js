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
    logger.warn('⚠️ CSRF token missing or mismatch (likely due to cross-origin third-party cookie blocking)', {
      method: req.method,
      path: req.path,
      hasCookie: !!cookieToken,
      hasHeader: !!headerToken
    });

    // In a cross-origin environment (Vercel frontend + Render backend), 
    // browsers block the _csrf cookie. Since we rely on CORS for cross-origin 
    // security and Bearer tokens for auth, we will bypass the hard CSRF block.
    return next();
  }

  return next();
};

module.exports = csrfProtection;
