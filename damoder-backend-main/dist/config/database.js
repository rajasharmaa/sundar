"use strict";
const { MongoClient, ServerApiVersion } = require('mongodb');
const logger = require('../utils/logger');
const config = require('./env');
// 🔧 ENTERPRISE-GRADE MONGODB CONNECTION CONFIGURATION WITH FAILOVER SUPPORT
const client = new MongoClient(config.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false, // Disabled to support all MongoDB operations
        deprecationErrors: true,
    },
    tls: true,
    // 🔧 CONNECTION POOL OPTIMIZATION
    maxPoolSize: config.NODE_ENV === 'production' ? 10 : 5, // Scale with environment
    minPoolSize: config.NODE_ENV === 'production' ? 2 : 1, // Maintain warm connections
    maxIdleTimeMS: 45000, // Extended idle time for better reuse
    maxConnecting: 2, // Allow 2 concurrent connection attempts
    // 🔧 TIMEOUT CONFIGURATIONS
    connectTimeoutMS: 15000, // Extended connection timeout
    socketTimeoutMS: 60000, // Longer socket timeout for slow networks
    waitQueueTimeoutMS: 10000, // Extended queue timeout
    serverSelectionTimeoutMS: 10000, // Extended server selection
    // 🔧 RETRY AND RECOVERY SETTINGS
    retryWrites: true,
    retryReads: true,
    writeConcern: { w: 'majority', j: true }, // Journaling for data safety
    readPreference: 'primaryPreferred',
    // 🔧 HEARTBEAT AND MONITORING
    heartbeatFrequencyMS: 10000, // Regular heartbeats
    minHeartbeatFrequencyMS: 500, // Minimum heartbeat interval
    // 🔧 PERFORMANCE AND SECURITY
    monitorCommands: config.NODE_ENV === 'development', // Enable monitoring in dev only
    compressors: config.NODE_ENV === 'production' ? ['snappy'] : [], // Compression in production
    zlibCompressionLevel: 6,
    // 🔧 LOAD BALANCING AND FAILOVER
    srvMaxHosts: config.MONGODB_URI.includes('+srv') ? 0 : undefined,
    // 🔧 ADVANCED OPTIONS
    directConnection: false, // Allow replica set discovery
    maxStalenessSeconds: 90, // Stale read prevention
    appname: 'damodar-traders-api' // Application identification
});
// 🔧 ENTERPRISE-GRADE CONNECTION STATE MANAGEMENT
let dbConnection = null;
let connectionPromise = null;
let isConnecting = false;
let connectionRetries = 0;
let lastSuccessfulConnection = 0;
const MAX_RETRIES = config.NODE_ENV === 'production' ? 5 : 3;
const RETRY_DELAY_BASE = 1000; // Base retry delay (1s)
const CONNECTION_TIMEOUT = 30000; // Extended timeout (30s)
const WARMUP_DELAY = 2000; // Initial warmup delay
const CONNECTION_TTL = 300000; // 5 minute connection TTL
const HEALTH_CHECK_INTERVAL = 30000; // 30 second health checks
// 🔧 CONNECTION SEMAPHORE WITH RENDER OPTIMIZATIONS
const connectionSemaphore = {
    queue: [],
    running: false,
    maxConcurrent: 1, // Single connection at a time
    async acquire() {
        return new Promise((resolve) => {
            this.queue.push(resolve);
            this.process();
        });
    },
    release() {
        this.running = false;
        this.process();
    },
    process() {
        if (this.queue.length > 0 && !this.running) {
            this.running = true;
            const next = this.queue.shift();
            next();
        }
    }
};
// 🔧 ENTERPRISE-GRADE DATABASE CONNECTION WITH ADVANCED RETRY LOGIC AND CONNECTION POOLING
const connectToDB = async () => {
    // 🔧 FAST PATH: Return existing healthy connection with TTL check
    if (dbConnection && client.topology && client.topology.isConnected()) {
        // Check if connection is stale
        if (Date.now() - lastSuccessfulConnection < CONNECTION_TTL) {
            return dbConnection;
        }
        logger.info('🔄 Refreshing stale database connection');
    }
    // 🔧 ACQUIRE CONNECTION SEMAPHORE TO PREVENT RACE CONDITIONS
    await connectionSemaphore.acquire();
    try {
        // 🔧 DOUBLE-CHECK AFTER ACQUIRING LOCK
        if (dbConnection && client.topology && client.topology.isConnected()) {
            return dbConnection;
        }
        // 🔧 IF ALREADY CONNECTING, WAIT FOR EXISTING PROMISE
        if (isConnecting && connectionPromise) {
            logger.debug('⏳ Waiting for existing connection attempt');
            return await connectionPromise;
        }
        // 🔧 RESET CONNECTION STATE IF MAX RETRIES EXCEEDED
        if (connectionRetries >= MAX_RETRIES) {
            logger.warn('⚠️ Maximum connection retries exceeded, performing hard reset');
            await performHardReset();
        }
        isConnecting = true;
        // 🔧 CREATE CONNECTION PROMISE WITH ADVANCED RETRY LOGIC
        connectionPromise = createConnectionPromise();
        return await connectionPromise;
    }
    finally {
        isConnecting = false;
        connectionSemaphore.release();
    }
};
// 🔧 HARD RESET FOR RECOVERY SCENARIOS
const performHardReset = async () => {
    try {
        logger.info('🔄 Performing hard database connection reset');
        // Close existing connection
        if (client && client.topology) {
            await client.close(true);
        }
        // Reset all state
        dbConnection = null;
        connectionPromise = null;
        isConnecting = false;
        connectionRetries = 0;
        lastSuccessfulConnection = 0;
        // Clear semaphore queue
        connectionSemaphore.queue = [];
        connectionSemaphore.running = false;
        logger.info('✅ Database connection state reset completed');
    }
    catch (err) {
        logger.error('❌ Hard reset failed:', err);
    }
};
// 🔧 CONNECTION PROMISE FACTORY WITH EXPONENTIAL BACKOFF
const createConnectionPromise = () => {
    return Promise.race([
        (async () => {
            try {
                logger.info(`🔌 Connecting to MongoDB (attempt ${connectionRetries + 1}/${MAX_RETRIES})...`);
                // 🔧 EXPONENTIAL BACKOFF WITH JITTER
                if (connectionRetries > 0) {
                    const delay = Math.min(RETRY_DELAY_BASE * Math.pow(2, connectionRetries - 1) +
                        Math.random() * 1000, // Add jitter
                    10000 // Max 10s delay
                    );
                    logger.debug(`⏳ Waiting ${Math.round(delay)}ms before retry`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                // 🔧 ROBUST CONNECTION WITH MULTIPLE TIMEOUTS
                await Promise.race([
                    client.connect(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Primary connection timeout')), CONNECTION_TIMEOUT))
                ]);
                // 🔧 DATABASE VALIDATION
                const uriParts = config.MONGODB_URI.split('/');
                const dbName = uriParts[uriParts.length - 1]?.split('?')[0] || 'damodarTraders';
                dbConnection = client.db(dbName);
                // 🔧 HEALTH CHECK
                await dbConnection.command({ ping: 1 });
                // 🔧 UPDATE STATE ON SUCCESS
                connectionRetries = 0;
                lastSuccessfulConnection = Date.now();
                logger.info(`✅ Connected to MongoDB! Database: ${dbName}, Pool Size: ${client.topology?.s?.servers?.size || 0}`);
                return dbConnection;
            }
            catch (err) {
                connectionRetries++;
                // 🔧 DETAILED ERROR LOGGING
                const errorContext = {
                    message: err.message,
                    code: err.code,
                    name: err.name,
                    attempt: connectionRetries,
                    retriesRemaining: MAX_RETRIES - connectionRetries,
                    connectionString: config.MONGODB_URI.substring(0, 30) + '...' // Partial URI for security
                };
                switch (err.code) {
                    case 'ECONNREFUSED':
                        logger.error('❌ MongoDB connection refused - server unreachable', errorContext);
                        break;
                    case 'ETIMEOUT':
                        logger.error('❌ MongoDB connection timeout', errorContext);
                        break;
                    case 'ENOTFOUND':
                        logger.error('❌ MongoDB hostname not found', errorContext);
                        break;
                    case 13: // Unauthorized
                        logger.error('❌ MongoDB authentication failed', errorContext);
                        break;
                    default:
                        logger.error(`❌ MongoDB connection error (${err.name})`, errorContext);
                }
                // 🔧 CLEAR CONNECTION STATE ON FAILURE
                dbConnection = null;
                isConnecting = false;
                connectionPromise = null;
                // 🔧 EMERGENCY RESET ON MAX RETRIES
                if (connectionRetries >= MAX_RETRIES) {
                    logger.error('💥 Maximum retry attempts reached, initiating emergency reset');
                    await performHardReset();
                    throw new Error(`Database connection failed after ${MAX_RETRIES} attempts: ${err.message}`);
                }
                throw err;
            }
        })(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection establishment timeout')), CONNECTION_TIMEOUT + 5000))
    ]);
};
const setupDatabaseIndexes = async () => {
    try {
        const db = await connectToDB();
        logger.info('🔄 Synchronizing database indexes...');
        const setupCollectionIdx = async (collectionName, indexes) => {
            const collection = db.collection(collectionName);
            try {
                // Get existing indexes
                const existingIndexes = await collection.listIndexes().toArray();
                for (const idx of indexes) {
                    const { key, name, ...options } = idx;
                    // Check if an index with same keys but different name exists
                    const conflictIdx = existingIndexes.find(e => JSON.stringify(e.key) === JSON.stringify(key) && e.name !== name);
                    if (conflictIdx) {
                        logger.warn(`🗑️  Dropping conflicting index '${conflictIdx.name}' in ${collectionName} to use new name '${name}'`);
                        await collection.dropIndex(conflictIdx.name);
                    }
                    try {
                        await collection.createIndex(key, { name, ...options });
                    }
                    catch (err) {
                        if (err.code === 85 || err.codeName === 'IndexOptionsConflict') {
                            logger.warn(`⚠️ Index conflict in ${collectionName} for '${name}': ${err.message}`);
                        }
                        else {
                            throw err;
                        }
                    }
                }
            }
            catch (err) {
                logger.error(`❌ Error setting up indexes for ${collectionName}:`, {
                    message: err.message,
                    code: err.code
                });
            }
        };
        // Users
        await setupCollectionIdx('users', [
            { key: { email: 1 }, name: 'email_unique_idx', unique: true },
            { key: { role: 1 }, name: 'role_idx' },
            { key: { googleId: 1 }, name: 'googleId_idx', sparse: true },
            { key: { resetToken: 1 }, name: 'resetToken_idx', sparse: true },
            { key: { resetTokenExpiry: 1 }, name: 'resetTokenExpiry_idx', expireAfterSeconds: 3600, sparse: true },
            { key: { passwordVersion: 1 }, name: 'passwordVersion_idx' },
            { key: { createdAt: -1 }, name: 'createdAt_idx' },
            { key: { role: 1, createdAt: -1 }, name: 'role_createdAt_idx' }
        ]);
        // Products
        await setupCollectionIdx('products', [
            { key: { active: 1, createdAt: -1 }, name: 'active_createdAt_idx' },
            { key: { category: 1, active: 1 }, name: 'category_active_idx' },
            { key: { name: 1 }, name: 'name_idx' },
            { key: { tags: 1 }, name: 'tags_idx' },
            { key: { category: 1, createdAt: -1 }, name: 'category_createdAt_idx' },
            { key: { price: 1, createdAt: -1 }, name: 'price_createdAt_idx' }
        ]);
        // Inquiries
        await setupCollectionIdx('inquiries', [
            { key: { userId: 1, createdAt: -1 }, name: 'userId_createdAt_idx' },
            { key: { email: 1, createdAt: -1 }, name: 'email_createdAt_idx' },
            { key: { status: 1, createdAt: -1 }, name: 'status_createdAt_idx' },
            { key: { createdAt: -1 }, name: 'createdAt_idx' }
        ]);
        // Sessions
        await setupCollectionIdx('sessions', [
            { key: { expires: 1 }, name: 'expires_ttl_idx', expireAfterSeconds: 0 },
            { key: { "session.user.id": 1 }, name: 'session_user_id_idx', sparse: true }
        ]);
        // Refresh Tokens (for secure session management - COLD-START SAFE)
        await setupCollectionIdx('refresh_tokens', [
            { key: { tokenHash: 1 }, name: 'tokenHash_idx', unique: true },
            { key: { expiresAt: 1 }, name: 'expiresAt_idx', expireAfterSeconds: 0 },
            { key: { userId: 1 }, name: 'userId_idx' },
            { key: { revoked: 1 }, name: 'revoked_idx' },
            { key: { createdAt: -1 }, name: 'createdAt_idx' }
        ]);
        // Wishlist
        await setupCollectionIdx('wishlists', [
            { key: { userId: 1, createdAt: -1 }, name: 'user_wishlist_recent_idx' },
            { key: { userId: 1, productId: 1 }, name: 'user_product_unique_idx', unique: true },
            { key: { productId: 1, createdAt: -1 }, name: 'product_popularity_idx' },
            { key: { createdAt: -1 }, name: 'createdAt_idx' }
        ]);
        logger.info('✅ Database indexes synchronized with production spec');
    }
    catch (err) {
        logger.error('❌ Critical failure in database index setup:', {
            message: err.message,
            stack: err.stack
        });
    }
};
// Graceful shutdown with timeout
const closeDB = async (force = false) => {
    try {
        logger.info('🔌 Closing MongoDB connection...');
        // Clear connection state immediately
        dbConnection = null;
        connectionPromise = null;
        isConnecting = false;
        connectionRetries = 0;
        // Close with timeout to prevent hanging
        const closePromise = client.close(force);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Database close timeout')), 5000));
        await Promise.race([closePromise, timeoutPromise]);
        logger.info('✅ MongoDB connection closed successfully');
    }
    catch (err) {
        logger.error('❌ Error closing MongoDB connection:', {
            message: err.message,
            force: force
        });
        // Even if close fails, clear state to prevent memory leaks
        dbConnection = null;
        connectionPromise = null;
        isConnecting = false;
    }
};
// Health check function
const checkDBHealth = async () => {
    try {
        if (!dbConnection)
            return { status: 'disconnected', error: 'No active connection' };
        const db = await connectToDB();
        await db.command({ ping: 1 });
        return { status: 'connected', poolSize: client.topology?.s?.servers?.size || 0 };
    }
    catch (err) {
        return { status: 'error', error: err.message };
    }
};
// Connection event handlers
client.on('connectionReady', () => {
    logger.info('📡 MongoDB connection ready');
    connectionRetries = 0; // Reset retries on successful connection
});
client.on('connectionClosed', () => {
    logger.debug('🔌 MongoDB connection closed in pool');
    // Note: Do NOT set dbConnection = null here. This event is a pool-level event
    // indicating an idle connection in the pool was closed, not the entire client disconnection.
});
client.on('connectionError', (err) => {
    logger.error('💥 MongoDB connection error:', {
        message: err.message,
        code: err.code
    });
    dbConnection = null;
});
client.on('topologyDescriptionChanged', (event) => {
    if (config.NODE_ENV !== 'production') {
        logger.debug('_topology topology changed:', {
            topologyType: event.newDescription.type,
            servers: event.newDescription.servers.size
        });
    }
});
client.on('serverOpening', (event) => {
    logger.info('🔌 Opening connection to MongoDB server:', event.address);
});
client.on('serverClosed', (event) => {
    logger.warn('🔌 MongoDB server connection closed:', event.address);
    // Trigger reconnection attempt
    if (dbConnection) {
        dbConnection = null;
        connectionPromise = null;
        isConnecting = false;
    }
});
// 🔧 AUTOMATED HEALTH MONITORING
const startHealthMonitoring = () => {
    setInterval(async () => {
        try {
            if (dbConnection && client.topology?.isConnected()) {
                await dbConnection.command({ ping: 1 });
                if (Date.now() - lastSuccessfulConnection > HEALTH_CHECK_INTERVAL) {
                    lastSuccessfulConnection = Date.now();
                    logger.debug('💓 Database health check passed');
                }
            }
            else {
                logger.warn('⚠️ Database connection lost, attempting recovery');
                dbConnection = null;
                await connectToDB();
            }
        }
        catch (err) {
            logger.error('💔 Database health check failed:', err.message);
            dbConnection = null;
        }
    }, HEALTH_CHECK_INTERVAL);
};
// Start monitoring in production
if (config.NODE_ENV === 'production') {
    startHealthMonitoring();
}
// 🔧 EXPORT ENHANCED DATABASE MODULE
module.exports = {
    // Core functions
    connectToDB,
    setupDatabaseIndexes,
    closeDB,
    checkDBHealth,
    client,
    // Advanced utilities
    performHardReset,
    startHealthMonitoring,
    // State inspection (development only)
    getConnectionInfo: () => ({
        isConnected: !!(dbConnection && client.topology?.isConnected()),
        retries: connectionRetries,
        lastConnected: lastSuccessfulConnection,
        poolSize: client.topology?.s?.servers?.size || 0
    }),
    // Configuration
    MAX_RETRIES,
    CONNECTION_TIMEOUT,
    HEALTH_CHECK_INTERVAL
};
