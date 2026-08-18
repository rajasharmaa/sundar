const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config/env');
const logger = require('../utils/logger');
const { connectToDB } = require('../config/database');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { RefreshTokenStorage } = require('../utils/refresh-token-storage');
const { validateEmail } = require('../utils/validation');

/**
 * Authentication Service
 * Handles all business logic for authentication operations
 */
class AuthService {
  /**
   * User login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} req - Request object for metadata
   * @returns {Object} Login result with tokens and user data
   */
  async login(email, password, req) {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Consistent sanitization
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedPassword = password.toString().trim();

    if (!validateEmail(sanitizedEmail)) {
      throw new Error('Invalid email format');
    }

    if (sanitizedPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Connect to database
    const db = await connectToDB();
    const usersCollection = db.collection('users');

    // CRITICAL: Explicitly select password field to avoid projection issues
    const user = await usersCollection.findOne(
      { email: sanitizedEmail },
      { projection: { password: 1, email: 1, name: 1, role: 1, _id: 1, isVerified: 1 } }
    );
    
    // Debug logging
    logger.debug('Login attempt:', {
      inputEmail: sanitizedEmail,
      userFound: !!user,
      userEmail: user?.email,
      hasPassword: !!user?.password,
      passwordLength: user?.password?.length
    });

    if (!user) {
      logger.warn('User not found for email:', sanitizedEmail);
      throw new Error('Invalid email or password');
    }

    // TEMPORARY: Skip email verification for development/testing
    // TODO: Re-enable email verification in production
    // if (user.isVerified === false) {
    //   throw new Error('Please verify your email before logging in');
    // }

    // Verify password with detailed logging
    logger.debug('Password verification:', {
      inputPasswordLength: sanitizedPassword.length,
      storedHashLength: user.password?.length,
      storedHashSample: user.password?.substring(0, 20) + '...'
    });
    
    const isPasswordValid = await bcrypt.compare(sanitizedPassword, user.password);
    if (!isPasswordValid) {
      logger.warn('Password comparison failed for user:', sanitizedEmail);
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role || 'user'
    };

    const accessToken = generateAccessToken(userData);
    const refreshToken = generateRefreshToken(userData);

    // Store refresh token with metadata
    const metadata = {
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || req.connection?.remoteAddress || '',
      deviceInfo: {
        platform: req.headers['sec-ch-ua-platform'] || 'unknown',
        mobile: /mobile/i.test(req.headers['user-agent'] || '')
      }
    };

    await RefreshTokenStorage.storeToken(user._id, refreshToken, metadata);

    // Return success response
    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role || 'user'
      },
      tokens: {
        accessToken,
        refreshToken
      }
    };
  }

  /**
   * User registration
   * @param {Object} userData - Registration data
   * @returns {Object} Registration result
   */
  async register(userData) {
    const { name, email, password, phone } = userData;

    // Validate required fields
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = name.trim();
    const sanitizedPassword = password.toString().trim();

    // Validate email format
    if (!validateEmail(sanitizedEmail)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (sanitizedPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Connect to database
    const db = await connectToDB();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: sanitizedEmail });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password with consistent parameters
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(sanitizedPassword, saltRounds);
    
    // Debug logging for registration
    logger.debug('Registration password hashing:', {
      inputPasswordLength: sanitizedPassword.length,
      saltRounds: saltRounds,
      hashedPasswordLength: hashedPassword.length,
      hashedPasswordSample: hashedPassword.substring(0, 20) + '...'
    });

    // Create user object
    const newUser = {
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : undefined,
      role: 'user',
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert user
    const result = await usersCollection.insertOne(newUser);
    
    // Verify user was inserted correctly
    logger.debug('User registration result:', {
      insertedId: result.insertedId,
      email: sanitizedEmail,
      hasPassword: !!hashedPassword
    });

    return {
      success: true,
      message: 'Registration successful',
      user: {
        id: result.insertedId,
        name: sanitizedName,
        email: sanitizedEmail,
        role: 'user'
      }
    };
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token from cookie
   * @param {Object} req - Request object
   * @returns {Object} New tokens
   */
  async refreshToken(refreshToken, req) {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    // Verify refresh token
    const decoded = await verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new Error('Invalid refresh token');
    }

    // Connect to database
    const db = await connectToDB();
    const usersCollection = db.collection('users');

    // Find user
    const user = await usersCollection.findOne({ _id: decoded.sub });
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new tokens
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role || 'user'
    };

    const newAccessToken = generateAccessToken(userData);
    const newRefreshToken = generateRefreshToken(userData);

    // Update refresh token in storage
    const metadata = {
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || req.connection?.remoteAddress || '',
      deviceInfo: {
        platform: req.headers['sec-ch-ua-platform'] || 'unknown',
        mobile: /mobile/i.test(req.headers['user-agent'] || '')
      }
    };

    await RefreshTokenStorage.rotateToken(user._id, refreshToken, newRefreshToken, metadata);

    return {
      success: true,
      message: 'Token refreshed successfully',
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    };
  }

  /**
   * User logout
   * @param {Object} req - Request object containing user info
   * @returns {Object} Logout result
   */
  async logout(req) {
    try {
      let userId = req.user?.id;
      
      // Try to get user ID from refresh token if not in request
      if (!userId) {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
          const decoded = await verifyRefreshToken(refreshToken);
          if (decoded) {
            userId = decoded.sub;
          }
        }
      }

      // Revoke refresh tokens for user
      if (userId) {
        await RefreshTokenStorage.revokeUserTokens(userId);
      }

      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      logger.warn('Logout error (non-critical):', error.message);
      return {
        success: true,
        message: 'Logged out successfully'
      };
    }
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Object} User profile data
   */
  async getProfile(userId) {
    const db = await connectToDB();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne(
      { _id: userId },
      { projection: { password: 0 } } // Exclude password
    );

    if (!user) {
      throw new Error('User not found');
    }

    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        phone: user.phone,
        createdAt: user.createdAt
      }
    };
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} Result
   */
  async changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw new Error('Current and new passwords are required');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    const db = await connectToDB();
    const usersCollection = db.collection('users');

    // Get user with password
    const user = await usersCollection.findOne({ _id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and increment password version
    const passwordVersion = (user.passwordVersion || 0) + 1;
    
    await usersCollection.updateOne(
      { _id: userId },
      {
        $set: {
          password: hashedNewPassword,
          passwordVersion,
          updatedAt: new Date()
        }
      }
    );

    // Revoke all refresh tokens for security
    await RefreshTokenStorage.revokeUserTokens(userId);

    return {
      success: true,
      message: 'Password changed successfully. Please log in again.'
    };
  }
}

module.exports = new AuthService();