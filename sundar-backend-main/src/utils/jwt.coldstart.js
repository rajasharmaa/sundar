/**
 * 🔥 COLD-START SAFE JWT UTILITIES
 * 
 * Simplified JWT handling for Render free tier cold starts
 * No Redis dependencies, MongoDB-only validation
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');
const logger = require('./logger');

// 🔥 SIMPLE JWT CONFIGURATION
const JWT_SETTINGS = {
  ACCESS_EXPIRY: '15m',    // 15 minutes
  REFRESH_EXPIRY: '7d',    // 7 days
  ISSUER: 'sundar-corporation',
  CLOCK_TOLERANCE: 30      // seconds
};

/**
 * 🔥 GENERATE ACCESS TOKEN
 * 
 * Creates short-lived access token (15 minutes)
 */
const generateAccessToken = (user) => {
  if (!user?.id || !user?.email) {
    throw new Error('Invalid user data for token generation');
  }

  if (!config.JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET not configured');
  }

  // Create a session ID and unique token ID to satisfy jwt.js validation
  const tokenId = crypto.randomBytes(16).toString('hex');
  const sessionId = user.sessionId || crypto.randomBytes(32).toString('hex');

  const payload = {
    jti: tokenId,      // Required by jwt.js
    sessionId: sessionId, // Required by jwt.js
    sub: user.id.toString(),
    email: user.email,
    role: user.role || 'user',
    passwordVersion: user.passwordVersion || 1,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor((Date.now() + 15 * 60 * 1000) / 1000), // 15 minutes
    createdAt: new Date().toISOString(),
    serverInstanceId: process.env.SERVER_INSTANCE_ID || 'unknown',
    iss: JWT_SETTINGS.ISSUER,
    aud: config.FRONTEND_URL,
    tokenType: 'access'
  };

  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    algorithm: 'HS256'
  });
};

/**
 * 🔥 GENERATE REFRESH TOKEN
 * 
 * Creates long-lived refresh token (7 days)
 */
const generateRefreshToken = (user) => {
  if (!user?.id || !user?.email) {
    throw new Error('Invalid user data for refresh token generation');
  }

  if (!config.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET not configured');
  }

  // Create IDs for compatibility
  const tokenId = crypto.randomBytes(32).toString('hex');
  const sessionId = user.sessionId || crypto.randomBytes(32).toString('hex');

  const payload = {
    jti: tokenId,      // Required by jwt.js validation
    sessionId: sessionId, // Required by jwt.js validation
    sub: user.id.toString(),
    email: user.email,
    role: user.role || 'user',
    passwordVersion: user.passwordVersion || 1,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000), // 7 days
    createdAt: new Date().toISOString(),
    serverInstanceId: process.env.SERVER_INSTANCE_ID || 'unknown',
    iss: JWT_SETTINGS.ISSUER,
    aud: config.FRONTEND_URL,
    tokenType: 'refresh'
  };

  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    algorithm: 'HS256'
  });
};

/**
 * 🔥 VERIFY ACCESS TOKEN
 * 
 * Validates access token with cold-start aware error handling
 */
const verifyAccessToken = async (token) => {
  try {
    if (!token) return null;

    return jwt.verify(token, config.JWT_ACCESS_SECRET, {
      issuer: JWT_SETTINGS.ISSUER,
      algorithms: ['HS256'],
      clockTolerance: JWT_SETTINGS.CLOCK_TOLERANCE
    });

  } catch (error) {
    // 🔥 ENHANCED ERROR TRACKING
    if (error.name === 'TokenExpiredError') {
      const err = new Error('Token expired');
      err.name = 'TokenExpiredError';
      err.expiredAt = error.expiredAt;
      throw err;
    }

    logger.debug('Access token verification failed', {
      error: error.name,
      message: error.message
    });

    return null;
  }
};

/**
 * 🔥 VERIFY REFRESH TOKEN
 * 
 * Validates refresh token
 */
const verifyRefreshToken = async (token) => {
  try {
    if (!token) return null;

    const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET, {
      issuer: JWT_SETTINGS.ISSUER,
      // audience: config.FRONTEND_URL, // Disabled to prevent localhost mismatch issues
      algorithms: ['HS256'],
      clockTolerance: JWT_SETTINGS.CLOCK_TOLERANCE
    });

    // Validate required fields
    if (!decoded.sub || !decoded.email || decoded.tokenType !== 'refresh') {
      return null;
    }

    return decoded;

  } catch (error) {
    logger.debug('Refresh token verification failed', {
      error: error.name,
      message: error.message
    });

    return null;
  }
};

/**
 * 🔥 CHECK IF TOKEN IS EXPIRED
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= (decoded.exp + JWT_SETTINGS.CLOCK_TOLERANCE);
  } catch {
    return true;
  }
};

/**
 * 🔥 GET TOKEN REMAINING TIME
 */
const getTokenRemainingTime = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return 0;

    const currentTime = Math.floor(Date.now() / 1000);
    const remaining = (decoded.exp + JWT_SETTINGS.CLOCK_TOLERANCE) - currentTime;
    return Math.max(0, remaining);
  } catch {
    return 0;
  }
};

/**
 * 🔥 VALIDATE TOKEN STRUCTURE
 */
const validateTokenStructure = (token) => {
  try {
    if (!token || typeof token !== 'string') return false;

    const parts = token.split('.');
    if (parts.length !== 3) return false;

    return true;
  } catch {
    return false;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  isTokenExpired,
  getTokenRemainingTime,
  validateTokenStructure,
  JWT_SETTINGS
};