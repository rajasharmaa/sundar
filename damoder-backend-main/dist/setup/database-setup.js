"use strict";
/**
 * 🔥 DATABASE SETUP FOR COLD-START SAFE AUTH
 *
 * Creates required collections and indexes for MongoDB-only auth
 */
const { connectToDB } = require('./config/database');
const logger = require('./utils/logger');
async function setupDatabase() {
    try {
        const db = await connectToDB();
        // Create refresh_tokens collection
        const refreshTokensCollection = db.collection('refresh_tokens');
        // Create indexes for performance and cold-start resilience
        await refreshTokensCollection.createIndex({ tokenHash: 1 }, {
            unique: true,
            name: 'token_hash_unique'
        });
        await refreshTokensCollection.createIndex({ userId: 1 }, {
            name: 'user_id_index'
        });
        await refreshTokensCollection.createIndex({ expiresAt: 1 }, {
            expireAfterSeconds: 0,
            name: 'expires_at_ttl'
        }); // TTL index for automatic cleanup
        await refreshTokensCollection.createIndex({ revoked: 1, expiresAt: 1 }, {
            name: 'revoked_expires_compound'
        });
        await refreshTokensCollection.createIndex({ lastUsedAt: -1 }, {
            name: 'last_used_at_desc'
        }); // For cleanup queries
        logger.info('✅ Refresh tokens collection and indexes created', {
            indexes: [
                'token_hash_unique',
                'user_id_index',
                'expires_at_ttl',
                'revoked_expires_compound',
                'last_used_at_desc'
            ],
            ttlEnabled: true,
            coldStartOptimized: true
        });
        // Create users collection indexes if not exists
        const usersCollection = db.collection('users');
        await usersCollection.createIndex({ email: 1 }, {
            unique: true,
            name: 'email_unique'
        });
        await usersCollection.createIndex({ createdAt: -1 }, {
            name: 'created_at_desc'
        });
        logger.info('✅ Database setup completed successfully', {
            collections: ['refresh_tokens', 'users'],
            indexesCreated: 6,
            ttlCleanupEnabled: true
        });
    }
    catch (error) {
        logger.error('❌ Database setup failed:', error.message);
        throw error;
    }
}
// Run setup if this file is executed directly
if (require.main === module) {
    setupDatabase()
        .then(() => {
        logger.info('Database setup complete');
        process.exit(0);
    })
        .catch((error) => {
        logger.error('Database setup failed:', error);
        process.exit(1);
    });
}
module.exports = { setupDatabase };
