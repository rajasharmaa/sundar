// 🔐 SECURE COOKIE MIDDLEWARE - PRODUCTION COMPATIBLE
const config = require('../config/env');
const logger = require('../utils/logger');

// 🔒 PRODUCTION-GRADE COOKIE CONFIGURATION
const isProd = config.NODE_ENV === 'production';

// 🛡️ ENVIRONMENT-AWARE COOKIE SECURITY OPTIONS
const BASE_COOKIE_OPTIONS = {
  httpOnly: true,     // 🔒 Prevent XSS access to cookies
  secure: isProd || config.COOKIE_SECURE === 'true',       // 🔒 HTTPS only in production or when explicitly enabled
  sameSite: isProd ? 'none' : (config.COOKIE_SAME_SITE || 'lax'),   // 🔒 Cross-origin in prod, lax in dev
  path: '/',          // 🔒 Root path for universal accessibility
  domain: undefined,  // 🔒 No domain restriction for maximum compatibility
  priority: 'high',   // 🔒 High priority for better persistence
  signed: false,      // 🔒 UNSIGNED cookies for consistent access
  partitioned: false  // 🔒 Disable partitioning for cross-origin compatibility
};

// 🔐 ENVIRONMENT-AWARE COOKIE CONFIGURATION
const getEnvironmentCookieOptions = () => ({
  ...BASE_COOKIE_OPTIONS,
  secure: isProd || config.COOKIE_SECURE === 'true' || process.env.FORCE_SECURE_COOKIES === 'true'
});

// ⏱️ ACCESS TOKEN COOKIE - SHORT LIVED
const ACCESS_COOKIE_OPTIONS = {
  ...BASE_COOKIE_OPTIONS,
  maxAge: 15 * 60 * 1000, // 15 minutes
  name: 'accessToken'
};

// ⏳ REFRESH TOKEN COOKIE - LONG LIVED
const REFRESH_COOKIE_OPTIONS = {
  ...BASE_COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  name: 'refreshToken'
};

// 🧼 LOGOUT COOKIE CLEARING OPTIONS
const CLEAR_COOKIE_OPTIONS = {
  ...BASE_COOKIE_OPTIONS,
  maxAge: 0,
  expires: new Date(0)
};

// 🔐 CROSS-ORIGIN COMPATIBLE COOKIE SETTER
const setSecureCookie = (res, name, value, options = {}) => {
  try {
    const cookieOptions = {
      ...BASE_COOKIE_OPTIONS,
      ...options
    };
    
    // 🔒 ENSURE ENVIRONMENT-APPROPRIATE SETTINGS
    // In development, use lax sameSite and only secure if explicitly configured
    if (!isProd) {
      cookieOptions.secure = config.COOKIE_SECURE === 'true' || process.env.FORCE_SECURE_COOKIES === 'true';
      cookieOptions.sameSite = config.COOKIE_SAME_SITE || 'lax';
    } else {
      // In production, enforce secure cookies for cross-origin
      cookieOptions.secure = true;
      cookieOptions.sameSite = 'none';
    }
    
    cookieOptions.path = '/';
    
    // 🔒 CRITICAL: Wrap cookie setting in try-catch to prevent crashes
    res.cookie(name, value, cookieOptions);
    
    // Enhanced logging for cross-origin debugging
    logger.debug('🍪 Secure cookie set successfully', { 
      name, 
      options: { 
        ...cookieOptions, 
        value: '[REDACTED]'
      },
      environment: config.NODE_ENV,
      isProduction: isProd,
      secureSetting: cookieOptions.secure,
      sameSiteSetting: cookieOptions.sameSite
    });
  } catch (cookieError) {
    logger.error('❌ Failed to set secure cookie', {
      name,
      error: cookieError.message,
      stack: cookieError.stack,
      environment: config.NODE_ENV
    });
    throw new Error(`Failed to set cookie: ${name}`);
  }
};

// 🔐 SECURE COOKIE CLEARER - WRAPPED IN TRY-CATCH
const clearSecureCookie = (res, name) => {
  try {
    res.clearCookie(name, CLEAR_COOKIE_OPTIONS);
    logger.debug('Secure cookie cleared successfully', { name });
  } catch (clearError) {
    logger.error('❌ Failed to clear secure cookie', {
      name,
      error: clearError.message
    });
    // Don't throw - clearing failure shouldn't break the flow
  }
};

// 🔐 AUTH COOKIE SETTER - STANDARDIZED INTERFACE WITH ERROR HANDLING
const setAuthCookies = (res, accessToken, refreshToken) => {
  try {
    // 🔒 SET ACCESS TOKEN COOKIE
    setSecureCookie(res, 'accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
    
    // 🔒 SET REFRESH TOKEN COOKIE
    setSecureCookie(res, 'refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    
    logger.debug('✅ Auth cookies set successfully', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken
    });
  } catch (setError) {
    logger.error('❌ Failed to set auth cookies', {
      error: setError.message,
      stack: setError.stack
    });
    throw new Error('Failed to set authentication cookies');
  }
};

// 🔐 AUTH COOKIE CLEARER - COMPREHENSIVE CLEARING
const clearAuthCookies = (res) => {
  try {
    // 🔒 CLEAR AUTH TOKENS
    clearSecureCookie(res, 'accessToken');
    clearSecureCookie(res, 'refreshToken');
    
    // 🔒 CLEAR ADDITIONAL AUTH-RELATED COOKIES
    const authCookieNames = ['oauth_state', 'csrf_token', 'session_id'];
    authCookieNames.forEach(name => {
      clearSecureCookie(res, name);
    });
    
    logger.debug('✅ All auth cookies cleared successfully');
  } catch (clearError) {
    logger.error('❌ Error during auth cookie clearing', {
      error: clearError.message
    });
    // Don't throw - clearing failure shouldn't break logout flow
  }
};

// 🔐 COOKIE SECURITY VALIDATOR
const validateCookieSecurity = (req) => {
  // In development, be more permissive
  if (!isProd) return true;
  
  // 🔥 ENSURE SECURE CONNECTION IN PRODUCTION
  const isSecureConnection = req.secure || 
                            req.headers['x-forwarded-proto'] === 'https' ||
                            req.headers['x-now-secure'] === '1';
                            
  if (!isSecureConnection) {
    logger.warn('❌ Insecure cookie request in production', {
      ip: req.ip,
      userAgent: req.headers['user-agent']?.substring(0, 100),
      forwardedProto: req.headers['x-forwarded-proto']
    });
    return false;
  }
  
  return true;
};

// 🔐 COOKIE SECURITY MIDDLEWARE
const cookieSecurityMiddleware = (req, res, next) => {
  if (!validateCookieSecurity(req)) {
    return res.status(400).json({
      error: 'Insecure request - HTTPS required in production environment'
    });
  }
  
  const cookieCount = Object.keys(req.cookies || {}).length;
  if (cookieCount > 0) {
    logger.debug('Request cookies received', {
      count: cookieCount,
      hasAuthTokens: !!(req.cookies.accessToken || req.cookies.refreshToken),
      ip: req.ip,
      userAgent: req.headers['user-agent']?.substring(0, 100)
    });
  }
  
  next();
};

module.exports = {
  BASE_COOKIE_OPTIONS,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
  CLEAR_COOKIE_OPTIONS,
  setSecureCookie,
  clearSecureCookie,
  setAuthCookies,
  clearAuthCookies,
  cookieSecurityMiddleware,
  validateCookieSecurity,
  isProd,
  getEnvironmentCookieOptions
};