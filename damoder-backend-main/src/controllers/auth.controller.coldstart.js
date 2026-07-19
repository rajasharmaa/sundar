/**
 * 🔥 COLD-START SAFE AUTHENTICATION CONTROLLER
 * 
 * Production-grade authentication with MongoDB-only persistence
 * Designed specifically for Render free tier cold starts
 * 
 * Key Features:
 * - Refresh tokens stored exclusively in MongoDB
 * - Access tokens: 15 minutes expiry
 * - Refresh tokens: 7 days expiry
 * - Graceful cold start handling (503 retries, not 401 logout)
 * - No Redis/memory dependencies
 * - Hashed token comparison for security
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config/env');
const logger = require('../utils/logger');
const { connectToDB } = require('../config/database');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.coldstart');
const { validatePassword, validateEmail } = require('../utils/validation');

const sanitizeUser = (user) => ({
  id: (user._id || user.id).toString(),
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  avatar: user.avatar || ''
});

// 🔥 COLD-START SAFE REFRESH TOKEN MODEL
class RefreshTokenModel {
  constructor(data) {
    this.userId = data.userId;
    this.tokenHash = data.tokenHash;
    this.createdAt = data.createdAt || new Date();
    this.expiresAt = data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    this.lastUsedAt = data.lastUsedAt || null;
    this.userAgent = data.userAgent || '';
    this.ipAddress = data.ipAddress || '';
    this.deviceInfo = data.deviceInfo || {};
    this.revoked = data.revoked || false;
    this.revokedAt = data.revokedAt || null;
    this.revokedReason = data.revokedReason || null;
  }

  toDBObject() {
    return {
      userId: this.userId,
      tokenHash: this.tokenHash,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      lastUsedAt: this.lastUsedAt,
      userAgent: this.userAgent,
      ipAddress: this.ipAddress,
      deviceInfo: this.deviceInfo,
      revoked: this.revoked,
      revokedAt: this.revokedAt,
      revokedReason: this.revokedReason
    };
  }

  static fromDBObject(doc) {
    return new RefreshTokenModel({
      userId: doc.userId,
      tokenHash: doc.tokenHash,
      createdAt: doc.createdAt,
      expiresAt: doc.expiresAt,
      lastUsedAt: doc.lastUsedAt,
      userAgent: doc.userAgent,
      ipAddress: doc.ipAddress,
      deviceInfo: doc.deviceInfo || {},
      revoked: doc.revoked,
      revokedAt: doc.revokedAt,
      revokedReason: doc.revokedReason
    });
  }
}

// 🔥 HASH UTILITIES
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const compareToken = (token, hash) => hashToken(token) === hash;

/**
 * 🔥 COLD-START SAFE LOGIN CONTROLLER
 * 
 * Handles user login with robust cold start awareness
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔐 Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedPassword = password.toString().trim();

    // 🔐 Connect to database with cold start awareness
    let db;
    try {
      db = await connectToDB();
      logger.debug('✅ Database connected successfully for login', {
        email: sanitizedEmail,
        serverInstanceId: process.env.SERVER_INSTANCE_ID || 'unknown'
      });
    } catch (dbError) {
      const isColdStart = dbError.message.includes('connection') ||
        dbError.message.includes('timeout') ||
        dbError.name === 'MongoNetworkError';

      logger.warn('Database connection failed during login', {
        email: sanitizedEmail,
        error: dbError.message,
        errorName: dbError.name,
        isColdStart,
        serverInstanceId: process.env.SERVER_INSTANCE_ID || 'unknown'
      });

      // Return 503 for cold start scenarios - frontend will retry
      return res.status(503).json({
        success: false,
        message: 'Service initializing. Please retry in a moment.',
        retryAfter: 5,
        isColdStart: true,
        serverInstanceId: process.env.SERVER_INSTANCE_ID || 'unknown'
      });
    }

    // 🔐 Find user
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email: sanitizedEmail });

    if (!user) {
      // Security: don't reveal if user exists
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 🔐 Verify password
    const isPasswordValid = await bcrypt.compare(sanitizedPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 🔐 Check if account is locked
    if (user.locked) {
      return res.status(403).json({
        success: false,
        message: 'Account is locked. Please contact support.'
      });
    }

    // 🔐 Generate tokens
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      passwordVersion: user.passwordVersion || 1
    };

    const accessToken = generateAccessToken(userData);
    const refreshToken = crypto.randomBytes(128).toString('hex'); // High entropy
    const refreshTokenHash = hashToken(refreshToken);

    // 🔐 Store refresh token in MongoDB
    try {
      const refreshTokenDoc = new RefreshTokenModel({
        userId: user._id,
        tokenHash: refreshTokenHash,
        userAgent: req.headers['user-agent'] || '',
        ipAddress: req.ip || req.connection?.remoteAddress || '',
        deviceInfo: {
          platform: req.headers['sec-ch-ua-platform'] || 'unknown',
          mobile: /mobile/i.test(req.headers['user-agent'] || '')
        }
      });

      await db.collection('refresh_tokens').insertOne(refreshTokenDoc.toDBObject());

      logger.info('✅ User logged in successfully', {
        userId: user._id.toString(),
        email: sanitizedEmail,
        hasRefreshToken: true,
        serverInstanceId: process.env.SERVER_INSTANCE_ID || 'unknown',
        userAgent: req.headers['user-agent']?.substring(0, 50) || 'unknown'
      });
    } catch (storageError) {
      logger.error('Failed to store refresh token', {
        userId: user._id.toString(),
        error: storageError.message
      });
      // Don't fail login if token storage fails - user can still use access token
    }

    // 🔐 Set secure cookies - ENVIRONMENT AWARE
    const isProd = config.NODE_ENV === 'production';

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd || config.COOKIE_SECURE === 'true',
      sameSite: isProd ? 'none' : (config.COOKIE_SAME_SITE || 'lax'),
      maxAge: 30 * 60 * 1000, // 30 minutes
      path: '/'
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd || config.COOKIE_SECURE === 'true',
      sameSite: isProd ? 'none' : (config.COOKIE_SAME_SITE || 'lax'),
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/'
    });

    // 🔐 Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role || 'user'
      },
      accessToken, // 🔥 Return token for frontend headers
      refreshToken // 🔥 Return refresh token in body for cross-origin / cookie-less fallback
    });

  } catch (error) {
    logger.error('Login controller error', {
      error: error.message,
      stack: error.stack
    });

    // Return 500 for unexpected errors - frontend will retry
    return res.status(500).json({
      success: false,
      message: 'Login service temporarily unavailable',
      retryAfter: 3,
      isServerError: true
    });
  }
};

/**
 * 🔥 COLD-START SAFE REFRESH TOKEN CONTROLLER
 * 
 * Validates refresh tokens against MongoDB with hashed comparison
 * Works reliably after cold starts
 */
const refreshToken = async (req, res) => {
  try {
    // 🔐 Get refresh token from cookies, body, or headers
    const token = req.cookies?.refreshToken || req.body?.refreshToken || req.headers['x-refresh-token'];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token missing',
        requiresLogin: true
      });
    }

    // 🔐 Connect to database with cold start handling
    let db;
    try {
      db = await connectToDB();
      logger.debug('✅ Database connected for token refresh', {
        serverInstanceId: process.env.SERVER_INSTANCE_ID || 'unknown'
      });
    } catch (dbError) {
      const isColdStart = dbError.message.includes('connection') ||
        dbError.message.includes('timeout') ||
        dbError.name === 'MongoNetworkError';

      logger.warn('Database unavailable during token refresh', {
        error: dbError.message,
        errorName: dbError.name,
        isColdStart,
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
    }

    // 🔐 Hash the incoming token for comparison
    const tokenHash = hashToken(token);

    // 🔐 Find refresh token in MongoDB
    const refreshTokenDoc = await db.collection('refresh_tokens').findOne({ tokenHash });

    if (!refreshTokenDoc) {
      logger.warn('Refresh token not found in database');
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        requiresLogin: true
      });
    }

    // 🔐 Convert to model for easier handling
    const refreshTokenModel = RefreshTokenModel.fromDBObject(refreshTokenDoc);

    // 🔐 Check if token is revoked
    if (refreshTokenModel.revoked) {
      logger.warn('Attempted to use revoked refresh token', {
        userId: refreshTokenModel.userId.toString(),
        reason: refreshTokenModel.revokedReason
      });
      return res.status(401).json({
        success: false,
        message: 'Session revoked. Please log in again.',
        requiresLogin: true
      });
    }

    // 🔐 Check if token is expired
    if (refreshTokenModel.expiresAt < new Date()) {
      logger.info('Refresh token expired', {
        userId: refreshTokenModel.userId.toString(),
        expiredAt: refreshTokenModel.expiresAt
      });

      // Clean up expired token
      await db.collection('refresh_tokens').deleteOne({ tokenHash });

      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
        requiresLogin: true
      });
    }

    // 🔐 Find user
    const user = await db.collection('users').findOne({ _id: refreshTokenModel.userId });

    if (!user) {
      logger.error('User not found for valid refresh token', {
        userId: refreshTokenModel.userId.toString()
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid session',
        requiresLogin: true
      });
    }

    // 🔐 Check if user account is locked
    if (user.locked) {
      // Revoke all tokens for locked user
      await db.collection('refresh_tokens').updateMany(
        { userId: user._id, revoked: false },
        {
          $set: {
            revoked: true,
            revokedAt: new Date(),
            revokedReason: 'account_locked'
          }
        }
      );

      return res.status(403).json({
        success: false,
        message: 'Account is locked',
        requiresLogin: true
      });
    }

    // 🔐 Generate new tokens
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      passwordVersion: user.passwordVersion || 1
    };

    const newAccessToken = generateAccessToken(userData);
    const newRefreshToken = crypto.randomBytes(128).toString('hex');
    const newRefreshTokenHash = hashToken(newRefreshToken);

    // 🔐 Rotate refresh token (revoke old, store new)
    try {
      // Revoke old token
      await db.collection('refresh_tokens').updateOne(
        { tokenHash },
        {
          $set: {
            revoked: true,
            revokedAt: new Date(),
            revokedReason: 'token_rotated'
          }
        }
      );

      // Store new token
      const newRefreshTokenDoc = new RefreshTokenModel({
        userId: user._id,
        tokenHash: newRefreshTokenHash,
        userAgent: req.headers['user-agent'] || refreshTokenModel.userAgent,
        ipAddress: req.ip || refreshTokenModel.ipAddress,
        deviceInfo: refreshTokenModel.deviceInfo
      });

      await db.collection('refresh_tokens').insertOne(newRefreshTokenDoc.toDBObject());

      logger.debug('✅ Token rotation completed', {
        userId: user._id.toString(),
        oldTokenTruncated: tokenHash.substring(0, 16) + '...',
        newTokenTruncated: newRefreshTokenHash.substring(0, 16) + '...'
      });
    } catch (rotationError) {
      logger.error('Token rotation failed', {
        userId: user._id.toString(),
        error: rotationError.message
      });
      // Don't fail the refresh if rotation fails - security risk is minimal
    }

    // 🔐 Set new cookies
    // 🔐 Set refreshed cookies - ENVIRONMENT AWARE
    const isProd = config.NODE_ENV === 'production';

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: isProd || config.COOKIE_SECURE === 'true',
      sameSite: isProd ? 'none' : (config.COOKIE_SAME_SITE || 'lax'),
      maxAge: 30 * 60 * 1000, // 30 minutes
      path: '/'
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: isProd || config.COOKIE_SECURE === 'true',
      sameSite: isProd ? 'none' : (config.COOKIE_SAME_SITE || 'lax'),
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/'
    });

    // 🔐 Success response
    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      accessToken: newAccessToken, // 🔥 Return new token for frontend headers
      refreshToken: newRefreshToken // 🔥 Return new refresh token in body for cross-origin / cookie-less fallback
    });

  } catch (error) {
    logger.error('Token refresh error', {
      error: error.message,
      stack: error.stack
    });

    // For unexpected errors, return 500 - frontend will retry, NOT logout
    return res.status(500).json({
      success: false,
      message: 'Token refresh temporarily unavailable',
      retryAfter: 3,
      isServerError: true,
      requiresLogin: false
    });
  }
};

/**
 * 🔥 AUTH STATUS CONTROLLER
 * 
 * Verifies access token and triggers refresh if expired
 */
const getStatus = async (req, res) => {
  try {
    // 🔥 ENHANCED STATUS CHECK: Rely on authenticate middleware
    // The middleware handles both cookies and bearer tokens
    if (!req.user) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: 'Authentication required'
      });
    }

    const { ObjectId } = require('mongodb');
    const db = await connectToDB();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0, rememberToken: 0, resetToken: 0 } }
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: 'User not found'
      });
    }

    const userProfile = {
      ...user,
      id: user._id.toString()
    };

    return res.status(200).json({
      success: true,
      authenticated: true,
      user: userProfile
    });
  } catch (error) {
    logger.error('Auth status check failed', {
      error: error.message
    });

    return res.status(500).json({
      success: false,
      authenticated: false,
      message: 'Status check failed'
    });
  }
};

/**
 * 🔥 LOGOUT CONTROLLER
 * 
 * Revokes refresh tokens in MongoDB
 */
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    // Connect to database
    let db;
    try {
      db = await connectToDB();
    } catch (dbError) {
      logger.warn('Database unavailable during logout', {
        error: dbError.message
      });
      // Still clear cookies even if DB unavailable
    }

    // Revoke refresh token if available
    if (refreshToken && db) {
      const tokenHash = hashToken(refreshToken);

      await db.collection('refresh_tokens').updateOne(
        { tokenHash },
        {
          $set: {
            revoked: true,
            revokedAt: new Date(),
            revokedReason: 'user_logout'
          }
        }
      );
    }

    // Clear cookies
    // 🔐 Clear cookies - ENVIRONMENT AWARE
    const isProd = config.NODE_ENV === 'production';

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProd || config.COOKIE_SECURE === 'true',
      sameSite: isProd ? 'none' : (config.COOKIE_SAME_SITE || 'lax'),
      path: '/'
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProd || config.COOKIE_SECURE === 'true',
      sameSite: isProd ? 'none' : (config.COOKIE_SAME_SITE || 'lax'),
      path: '/'
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Logout error', {
      error: error.message
    });

    // Still clear cookies on error
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // 🔐 STRICT INPUT VALIDATION - FAIL FAST
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // 🔐 EMAIL FORMAT VALIDATION
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // 🔐 PASSWORD STRENGTH VALIDATION
    const { isValid, feedback } = validatePassword(password);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Password requirements not met",
        details: feedback.slice(0, 3)
      });
    }

    // 🔐 DATABASE CONNECTION
    let db;
    try {
      db = await connectToDB();
    } catch (dbError) {
      logger.error('Database connection failed during registration', {
        email: email.toLowerCase().trim(),
        error: dbError.message
      });
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable',
        retryAfter: 30
      });
    }

    const usersCollection = db.collection('users');

    // 🔐 CHECK FOR EXISTING USER
    let existingUser;
    try {
      existingUser = await usersCollection.findOne({
        email: email.toLowerCase().trim()
      });
    } catch (dbError) {
      logger.error('Database query failed during registration', {
        email: email.toLowerCase().trim(),
        error: dbError.message
      });
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable',
        retryAfter: 30
      });
    }

    // 🔐 HANDLE DUPLICATE USER
    if (existingUser) {
      // Timing protection to prevent email enumeration
      await bcrypt.compare('dummy', '$2b$10$dummyhash');
      return res.status(409).json({
        success: false,
        message: "Account already exists with this email"
      });
    }

    // 🔐 HASH PASSWORD SAFELY
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (hashError) {
      logger.error('Password hashing failed during registration', {
        email: email.toLowerCase().trim(),
        error: hashError.message
      });
      return res.status(500).json({
        success: false,
        message: "Unable to process registration"
      });
    }

    // 🔐 CREATE USER OBJECT
    const now = new Date();
    const newUser = {
      name: name.trim().substring(0, 50),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim().substring(0, 20) : '',
      password: hashedPassword,
      role: 'user',
      createdAt: now,
      updatedAt: now,
      failedLoginAttempts: 0,
      loginAttempts: 0,
      lastLogin: null,
      lastLoginAt: null,
      passwordVersion: 1,
      active: true,
      isActive: true
    };

    // 🔐 INSERT USER SAFELY
    let result;
    try {
      result = await usersCollection.insertOne(newUser);
    } catch (insertError) {
      if (insertError.code === 11000) {
        // Handle duplicate key error specifically
        return res.status(409).json({
          success: false,
          message: "Account already exists"
        });
      }

      logger.error('User insertion failed', {
        email: newUser.email,
        error: insertError.message
      });
      return res.status(500).json({
        success: false,
        message: "Registration failed"
      });
    }

    // 🔐 VALIDATE INSERTION SUCCESS
    if (!result?.insertedId) {
      logger.error('User insertion returned no ID', { email: newUser.email });
      return res.status(500).json({
        success: false,
        message: "Registration failed - unable to create account"
      });
    }

    const savedUser = { _id: result.insertedId, ...newUser };

    logger.info('✅ User registered successfully', {
      userId: savedUser._id,
      email: savedUser.email
    });

    // 🔐 SUCCESS RESPONSE - NO AUTO-LOGIN
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: sanitizeUser(savedUser)
      }
    });

  } catch (err) {
    logger.error('Registration critical error:', {
      error: err.message,
      stack: err.stack
    });

    // Return appropriate status codes based on error type
    if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
      return res.status(503).json({
        success: false,
        message: 'Database service temporarily unavailable',
        retryAfter: 30
      });
    }

    // For all other unexpected errors
    return res.status(500).json({
      success: false,
      message: "Registration service temporarily unavailable"
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getStatus,
  logout
};