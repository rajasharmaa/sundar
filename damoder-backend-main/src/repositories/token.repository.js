const crypto = require('crypto');
const { connectToDB, client } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Token Repository
 * Handles database operations for refresh tokens
 */
class TokenRepository {
  /**
   * Store refresh token in database
   * @param {string} userId - User ID
   * @param {string} refreshToken - Refresh token
   * @param {Object} metadata - Token metadata
   */
  async storeToken(userId, refreshToken, metadata = {}) {
    try {
      const db = await connectToDB();
      const tokensCollection = db.collection('refresh_tokens');

      const tokenRecord = {
        userId,
        refreshToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true,
        metadata: {
          userAgent: metadata.userAgent || '',
          ipAddress: metadata.ipAddress || '',
          deviceInfo: metadata.deviceInfo || {},
          createdAt: new Date()
        }
      };

      await tokensCollection.insertOne(tokenRecord);
      logger.debug('Refresh token stored successfully', { userId });
    } catch (error) {
      logger.error('Failed to store refresh token:', error.message);
      throw error;
    }
  }

  /**
   * Find refresh token by value
   * @param {string} refreshToken - Refresh token to find
   * @returns {Object|null} Token record or null
   */
  async findToken(refreshToken) {
    try {
      const db = await connectToDB();
      const tokensCollection = db.collection('refresh_tokens');

      const tokenRecord = await tokensCollection.findOne({
        refreshToken,
        isActive: true,
        expiresAt: { $gt: new Date() }
      });

      return tokenRecord;
    } catch (error) {
      logger.error('Failed to find refresh token:', error.message);
      return null;
    }
  }

  /**
   * Revoke specific refresh token
   * @param {string} refreshToken - Token to revoke
   */
  async revokeToken(refreshToken) {
    try {
      const db = await connectToDB();
      const tokensCollection = db.collection('refresh_tokens');

      await tokensCollection.updateOne(
        { refreshToken },
        {
          $set: {
            isActive: false,
            revokedAt: new Date()
          }
        }
      );
      logger.debug('Refresh token revoked successfully');
    } catch (error) {
      logger.error('Failed to revoke refresh token:', error.message);
      throw error;
    }
  }

  /**
   * Revoke all tokens for a user
   * @param {string} userId - User ID
   * @returns {number} Number of tokens revoked
   */
  async revokeUserTokens(userId) {
    try {
      const db = await connectToDB();
      const tokensCollection = db.collection('refresh_tokens');

      const result = await tokensCollection.updateMany(
        { userId, isActive: true },
        {
          $set: {
            isActive: false,
            revokedAt: new Date()
          }
        }
      );

      logger.debug(`Revoked ${result.modifiedCount} tokens for user`, { userId });
      return result.modifiedCount;
    } catch (error) {
      logger.error('Failed to revoke user tokens:', error.message);
      throw error;
    }
  }

  /**
   * Rotate refresh token (invalidate old, create new) with enhanced security
   * @param {string} userId - User ID
   * @param {string} oldToken - Old refresh token
   * @param {string} newToken - New refresh token
   * @param {Object} metadata - Metadata for new token
   * @param {string} rotationChainId - Optional rotation chain identifier
   */
  async rotateToken(userId, oldToken, newToken, metadata = {}, rotationChainId = null) {
    const db = await connectToDB();
    const tokensCollection = db.collection('refresh_tokens');
    
    const session = client.startSession();
    try {
      // Start transaction for atomic operations
      await session.withTransaction(async () => {
        // 1. Invalidate old token with rotation context
        await tokensCollection.updateOne(
          { refreshToken: oldToken, userId },
          {
            $set: {
              isActive: false,
              rotatedAt: new Date(),
              rotatedTo: newToken.substring(0, 32) + '...', // Store partial new token reference
              rotationChainId: rotationChainId || crypto.randomBytes(16).toString('hex'),
              lastUsedAt: new Date()
            }
          },
          { session }
        );

        // 2. Store new token with rotation history
        const tokenRecord = {
          userId,
          refreshToken: newToken,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          isActive: true,
          metadata: {
            userAgent: metadata.userAgent || '',
            ipAddress: metadata.ipAddress || '',
            deviceInfo: metadata.deviceInfo || {},
            createdAt: new Date(),
            rotationFrom: oldToken.substring(0, 32) + '...', // Store partial old token reference
            rotationChainId: rotationChainId || crypto.randomBytes(16).toString('hex')
          }
        };

        await tokensCollection.insertOne(tokenRecord, { session });
        
        // 3. Cleanup old rotated tokens (keep last 5 for security audit)
        const cleanupResult = await tokensCollection.deleteMany({
          userId,
          isActive: false,
          rotatedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Keep 7 days of rotated tokens
        }, { session });
        
        logger.debug('Token rotation cleanup completed', { 
          userId: userId.toString(),
          deletedTokens: cleanupResult.deletedCount
        });
      });
      
      await session.endSession();
      logger.debug('Refresh token rotated successfully with enhanced security', { 
        userId: userId.toString(),
        rotationChainId: rotationChainId || 'generated'
      });
    } catch (error) {
      logger.error('Failed to rotate refresh token with transaction:', error.message);
      // Fallback to simple update if transactions not supported
      await this.rotateTokenSimple(userId, oldToken, newToken, metadata);
    }
  }
  
  /**
   * Simple token rotation fallback (without transactions)
   */
  async rotateTokenSimple(userId, oldToken, newToken, metadata = {}) {
    const db = await connectToDB();
    const tokensCollection = db.collection('refresh_tokens');

    // Invalidate old token
    await tokensCollection.updateOne(
      { refreshToken: oldToken, userId },
      {
        $set: {
          isActive: false,
          rotatedAt: new Date()
        }
      }
    );

    // Store new token
    const tokenRecord = {
      userId,
      refreshToken: newToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      metadata: {
        userAgent: metadata.userAgent || '',
        ipAddress: metadata.ipAddress || '',
        deviceInfo: metadata.deviceInfo || {},
        createdAt: new Date()
      }
    };

    await tokensCollection.insertOne(tokenRecord);
    logger.debug('Refresh token rotated successfully (simple method)', { userId });
  }

  /**
   * Clean up expired tokens
   * @returns {number} Number of tokens cleaned
   */
  async cleanupExpiredTokens() {
    try {
      const db = await connectToDB();
      const tokensCollection = db.collection('refresh_tokens');

      const result = await tokensCollection.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      logger.info(`Cleaned up ${result.deletedCount} expired tokens`);
      return result.deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup expired tokens:', error.message);
      return 0;
    }
  }

  /**
   * Get active tokens count for user
   * @param {string} userId - User ID
   * @returns {number} Active token count
   */
  async getActiveTokenCount(userId) {
    try {
      const db = await connectToDB();
      const tokensCollection = db.collection('refresh_tokens');

      const count = await tokensCollection.countDocuments({
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
      });

      return count;
    } catch (error) {
      logger.error('Failed to get active token count:', error.message);
      return 0;
    }
  }
}

module.exports = new TokenRepository();