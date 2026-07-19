"use strict";
const { createClient } = require('redis');
const logger = require('../utils/logger');
const config = require('./env');
// 🔥 PRODUCTION SAFETY: Require REDIS_URL in production
if (!config.REDIS_URL && config.NODE_ENV === 'production') {
    logger.error('❌ REDIS_URL is required in production for queues, caching, and rate limiting');
    logger.error('💡 Recommendation: Use Upstash Redis (https://upstash.com) or Railway Redis');
    throw new Error('REDIS_URL environment variable is required in production');
}
// 🔧 ENTERPRISE-GRADE REDIS CONFIGURATION WITH ADVANCED FAILOVER
const redisConfig = config.REDIS_URL ? {
    url: config.REDIS_URL,
    socket: {
        // 🔧 ADVANCED RECONNECTION STRATEGY
        reconnectStrategy: (retries) => {
            // Enhanced backoff with circuit breaker for cold starts
            if (retries > 100) {
                logger.error('💥 Redis reconnection circuit breaker tripped after 100 attempts');
                return new Error('Maximum reconnection attempts reached - circuit breaker engaged');
            }
            // Exponential backoff with jitter and ceiling (extended for cold start tolerance)
            const baseDelay = Math.min(Math.pow(1.8, retries) * 1000 + Math.random() * 3000, 120000 // Maximum 120s delay for cold start scenarios
            );
            // Add progressive delays for persistent failures
            const progressiveDelay = retries > 15 ? (retries - 15) * 10000 : 0;
            const totalDelay = Math.min(baseDelay + progressiveDelay, 300000); // Cap at 5 minutes
            logger.warn(`🔄 Redis reconnection attempt ${retries} in ${Math.round(totalDelay / 1000)}s`);
            return totalDelay;
        },
        // 🔧 ROBUST TIMEOUT CONFIGURATIONS
        connectTimeout: 45000, // Extended connection timeout for cold starts
        keepAlive: 60000, // Extended keep-alive
        noDelay: true, // Disable Nagle's algorithm for latency
        // 🔧 TLS AND NETWORK
        tls: config.REDIS_URL.startsWith('rediss://'),
        family: 4, // IPv4 preferred
        localAddress: undefined, // Let OS choose local address
        // 🔧 FAILOVER AND RESILIENCE
        autoResendUnfulfilledCommands: true,
        lazyConnect: false, // Connect immediately
        enableOfflineQueue: true, // Queue commands during downtime
        // 🔧 PERFORMANCE TUNING
        reconnectOnError: (err) => {
            const targetError = 'READONLY';
            if (err.message.includes(targetError)) {
                return true; // Reconnect on READONLY errors (cluster failover)
            }
            return false;
        }
    }
} : {
    // 🔧 LOCAL DEVELOPMENT CONFIGURATION
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        reconnectStrategy: (retries) => {
            if (retries > 20) {
                logger.error('💥 Local Redis reconnection limit reached');
                return new Error('Maximum local reconnection attempts reached');
            }
            const delay = Math.min(retries * 1500 + Math.random() * 1000, 15000);
            return delay;
        },
        connectTimeout: 15000,
        keepAlive: 30000,
        family: 4,
        enableOfflineQueue: true
    }
};
// 🔧 ENTERPRISE-GRADE REDIS CLIENT WITH ADVANCED FEATURES
const redisClient = createClient({
    ...redisConfig,
    // 🔧 COMMAND AND TIMEOUT CONFIGURATIONS
    disableOfflineQueue: false, // Queue commands during disconnect
    commandTimeout: 15000, // Extended command timeout for cold starts
    connectTimeout: 45000, // Extended connection timeout for cold starts
    readyCheck: true, // Ensure Redis is fully ready
    // 🔧 CONNECTION POOLING AND SCALING
    isolationPoolOptions: {
        acquireTimeoutMillis: 15000, // Extended acquire timeout
        createTimeoutMillis: 15000, // Extended create timeout
        destroyTimeoutMillis: 8000, // Extended destroy timeout
        min: config.NODE_ENV === 'production' ? 3 : 1, // Scale minimum connections
        max: config.NODE_ENV === 'production' ? 30 : 10, // Scale maximum connections
        autostart: true // Auto-start pool
    },
    // 🔧 ADVANCED RETRY AND FAILOVER
    maxRetriesPerRequest: null, // Required for BullMQ compatibility
    retryDelayOnFailover: 200, // Increased failover delay
    retryDelayOnClusterDown: 300, // Increased cluster down delay
    // 🔧 PERFORMANCE AND OPTIMIZATIONS
    enableAutoPipelining: true, // Automatic command pipelining
    autoPipeliningIgnoredCommands: [
        'subscribe', 'unsubscribe',
        'psubscribe', 'punsubscribe',
        'monitor', 'quit'
    ],
    // 🔧 MONITORING AND DEBUGGING
    showFriendlyErrorStack: config.NODE_ENV === 'development',
    // 🔧 LEGACY SUPPORT
    legacyMode: false, // Use modern API
    // 🔧 CLUSTER SUPPORT (if needed)
    useReplicas: false, // Disable replica usage by default
});
// 🔧 ENTERPRISE-GRADE REDIS STATE MANAGEMENT
let connectionState = 'disconnected';
let connectionAttempts = 0;
let lastSuccessfulPing = 0;
let circuitBreakerTripped = false;
const MAX_CONNECTION_ATTEMPTS = 100; // Extended retry limit
const CONNECTION_RESET_INTERVAL = 600000; // 10 minutes
const HEALTH_CHECK_INTERVAL = 15000; // 15 second health checks
const CIRCUIT_BREAKER_THRESHOLD = 20; // Trip after 20 consecutive failures
const CIRCUIT_BREAKER_TIMEOUT = 300000; // 5 minute timeout
redisClient.on('error', (err) => {
    connectionState = 'error';
    connectionAttempts++;
    // 🔧 ENHANCED ERROR LOGGING WITH CONTEXT
    const errorContext = {
        message: err.message,
        code: err.code,
        errno: err.errno,
        syscall: err.syscall,
        state: connectionState,
        attempts: connectionAttempts,
        timestamp: new Date().toISOString()
    };
    // 🔧 CATEGORIZED ERROR HANDLING
    if (err.code === 'ECONNREFUSED') {
        logger.error('❌ Redis connection refused - server unreachable', errorContext);
    }
    else if (err.code === 'ETIMEDOUT') {
        logger.error('❌ Redis connection timeout', errorContext);
    }
    else if (err.code === 'ECONNRESET') {
        logger.warn('⚠️ Redis connection reset by peer', errorContext);
    }
    else if (err.message.includes('AUTH')) {
        logger.error('❌ Redis authentication failed', errorContext);
    }
    else {
        logger.error('❌ Redis client error', errorContext);
    }
    // 🔧 CIRCUIT BREAKER IMPLEMENTATION
    if (connectionAttempts >= CIRCUIT_BREAKER_THRESHOLD) {
        circuitBreakerTripped = true;
        logger.error('💥 Redis circuit breaker tripped - too many failures');
        setTimeout(() => {
            circuitBreakerTripped = false;
            connectionAttempts = Math.floor(connectionAttempts / 2);
            logger.info('✅ Redis circuit breaker reset');
        }, CIRCUIT_BREAKER_TIMEOUT);
    }
    // 🔧 GRACEFUL DEGRADATION IN PRODUCTION
    if (config.NODE_ENV === 'production') {
        logger.warn('⚠️ Redis unavailable - falling back to memory storage for caching');
    }
});
redisClient.on('connect', () => {
    connectionState = 'connected';
    connectionAttempts = 0; // Reset on successful connection
    logger.info('✅ Redis TCP Connection Established');
});
redisClient.on('ready', () => {
    connectionState = 'ready';
    logger.info('✅ Redis Client Ready for Operations');
});
redisClient.on('reconnecting', () => {
    connectionState = 'reconnecting';
    connectionAttempts++;
    // 🔧 SMART RECONNECTION LOGGING
    const logLevel = connectionAttempts > 10 ? 'error' :
        connectionAttempts > 5 ? 'warn' : 'info';
    logger[logLevel](`🔄 Redis reconnecting (attempt ${connectionAttempts})...`, {
        circuitBreakerTripped,
        lastPing: lastSuccessfulPing ?
            `${Math.round((Date.now() - lastSuccessfulPing) / 1000)}s ago` : 'never'
    });
    // 🔧 ADAPTIVE RESET MECHANISM
    if (connectionAttempts % 15 === 0) {
        setTimeout(() => {
            if (connectionState === 'reconnecting') {
                const reduction = Math.min(8, Math.floor(connectionAttempts * 0.3));
                connectionAttempts = Math.max(0, connectionAttempts - reduction);
                logger.info(`🔄 Redis connection attempts reduced by ${reduction}`);
            }
        }, CONNECTION_RESET_INTERVAL);
    }
});
redisClient.on('end', () => {
    connectionState = 'disconnected';
    logger.warn('⚠️ Redis Connection Closed');
});
// 🔧 ENTERPRISE-GRADE REDIS CONNECTION WITH CIRCUIT BREAKER
const connectRedis = async (force = false) => {
    // 🔧 CIRCUIT BREAKER CHECK
    if (circuitBreakerTripped) {
        logger.warn('⚠️ Redis circuit breaker active - refusing connection attempts');
        throw new Error('Redis circuit breaker is active - service temporarily unavailable');
    }
    // 🔧 PREVENT EXCESSIVE ATTEMPTS
    if (connectionAttempts > MAX_CONNECTION_ATTEMPTS) {
        logger.error('💥 Maximum Redis connection attempts exceeded');
        circuitBreakerTripped = true;
        setTimeout(() => {
            circuitBreakerTripped = false;
            connectionAttempts = 0;
        }, CIRCUIT_BREAKER_TIMEOUT);
        if (config.NODE_ENV === 'production') {
            throw new Error('Redis connection permanently failed - circuit breaker engaged');
        }
        return redisClient;
    }
    // 🔧 FAST PATH: Return if already connected
    if (!force && (redisClient.isOpen || redisClient.isReady)) {
        return redisClient;
    }
    try {
        logger.info(`🔌 Attempting Redis connection (attempt ${connectionAttempts + 1})...`);
        // 🔧 ROBUST CONNECTION WITH TIMEOUT
        await Promise.race([
            redisClient.connect(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 25000))
        ]);
        // 🔧 POST-CONNECTION VALIDATION
        await redisClient.ping();
        logger.info('✅ Redis connected successfully');
        connectionAttempts = 0; // Reset on success
        connectionState = 'ready';
        lastSuccessfulPing = Date.now();
        return redisClient;
    }
    catch (err) {
        connectionAttempts++;
        // 🔧 DETAILED ERROR CONTEXT
        const errorContext = {
            message: err.message,
            code: err.code,
            attempt: connectionAttempts,
            maxAttempts: MAX_CONNECTION_ATTEMPTS,
            circuitBreakerThreshold: CIRCUIT_BREAKER_THRESHOLD
        };
        logger.error(`❌ Redis connection failed (attempt ${connectionAttempts}):`, errorContext);
        // 🔧 PRODUCTION ALERTING
        if (config.NODE_ENV === 'production' && connectionAttempts >= 3) {
            logger.error('💥 Redis connection critical failure in production environment');
            // Could integrate with monitoring services here
        }
        // 🔧 STATE RESET ON FAILURE
        connectionState = 'error';
        return redisClient;
    }
};
// 🔧 ADVANCED HEALTH MONITORING WITH AUTO-RECOVERY
const monitorRedisHealth = () => {
    setInterval(async () => {
        // 🔧 SKIP IF CIRCUIT BREAKER IS TRIPPED
        if (circuitBreakerTripped) {
            logger.debug('⏭️ Skipping health check - circuit breaker active');
            return;
        }
        if (redisClient.isOpen && connectionState !== 'error') {
            try {
                await redisClient.ping();
                lastSuccessfulPing = Date.now();
                // 🔧 STATE TRANSITION LOGGING
                if (connectionState !== 'ready') {
                    logger.info('✅ Redis connection stabilized');
                    connectionState = 'ready';
                }
                // 🔧 PERFORMANCE METRICS
                if (config.NODE_ENV === 'development') {
                    const info = await redisClient.info('memory');
                    logger.debug('📊 Redis memory usage:', info.split('\n')[1]);
                }
            }
            catch (err) {
                logger.warn('💔 Redis health check failed:', err.message);
                connectionState = 'degraded';
                // 🔧 AUTOMATIC RECOVERY ATTEMPT
                if (Date.now() - lastSuccessfulPing > 120000) { // 2 minutes
                    logger.info('🔄 Attempting automatic Redis recovery');
                    try {
                        await connectRedis(true);
                    }
                    catch (recoveryErr) {
                        logger.error('❌ Automatic Redis recovery failed:', recoveryErr.message);
                    }
                }
            }
        }
        else {
            logger.warn('⚠️ Redis client not ready for health check');
            connectionState = 'disconnected';
        }
    }, HEALTH_CHECK_INTERVAL);
};
// 🔧 START MONITORING WITH DELAYED START
setTimeout(() => {
    if (config.NODE_ENV === 'production') {
        monitorRedisHealth();
        logger.info('✅ Redis health monitoring started');
    }
}, 5000); // Start after 5 seconds
// Health check function
const checkRedisHealth = async () => {
    try {
        if (!redisClient.isOpen) {
            return { status: 'disconnected', error: 'Client not connected' };
        }
        await redisClient.ping();
        return { status: 'connected', uptime: process.uptime() };
    }
    catch (err) {
        return { status: 'error', error: err.message };
    }
};
// Graceful shutdown
const closeRedis = async () => {
    try {
        if (redisClient.isOpen) {
            await redisClient.quit();
            logger.info('✅ Redis connection closed gracefully');
        }
    }
    catch (err) {
        logger.warn('⚠️ Redis shutdown warning:', err.message);
    }
};
// 🔧 EXPORT ENHANCED REDIS MODULE
module.exports = {
    // Core exports
    redisClient,
    redisConfig,
    connectRedis,
    checkRedisHealth,
    closeRedis,
    // Advanced utilities
    monitorRedisHealth,
    // State inspection (development only)
    getConnectionInfo: () => ({
        isOpen: redisClient.isOpen,
        isReady: redisClient.isReady,
        state: connectionState,
        attempts: connectionAttempts,
        circuitBreaker: circuitBreakerTripped,
        lastPing: lastSuccessfulPing ?
            `${Math.round((Date.now() - lastSuccessfulPing) / 1000)}s ago` : 'never'
    }),
    // Configuration
    MAX_CONNECTION_ATTEMPTS,
    HEALTH_CHECK_INTERVAL,
    CIRCUIT_BREAKER_THRESHOLD,
    // Control functions
    resetConnectionAttempts: () => {
        connectionAttempts = 0;
        logger.info('🔄 Redis connection attempts counter reset');
    },
    tripCircuitBreaker: () => {
        circuitBreakerTripped = true;
        logger.warn('⚠️ Redis circuit breaker manually tripped');
    },
    resetCircuitBreaker: () => {
        circuitBreakerTripped = false;
        connectionAttempts = 0;
        logger.info('✅ Redis circuit breaker manually reset');
    }
};
