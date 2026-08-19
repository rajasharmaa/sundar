// 🔥 EARLY ENVIRONMENT VALIDATION - OPTIMIZED FOR RENDER FREE TIER
require('dotenv').config();

const http = require('http');
const logger = require('./src/utils/logger');

// 🔧 LOAD CONFIG FIRST TO VALIDATE ENVIRONMENT VARIABLES IMMEDIATELY
try {
  require('./src/config/env');
} catch (err) {
  console.error('❌ Environment validation failed at startup:');
  console.error(err.message);
  console.error('\n💡 Fix your environment variables and restart the server.');
  process.exit(1);
}

const config = require('./src/config/env');
const { connectToDB, setupDatabaseIndexes, closeDB } = require('./src/config/database');
const { initSocket } = require('./src/config/socket');
const { app, setupRateLimiters } = require('./src/app');
const { initializeQueues } = require('./src/config/queue');

const PORT = process.env.PORT || config.PORT || 3000; // Dynamic port for Render

// 🔧 RENDER FREE TIER DETECTION AND OPTIMIZATIONS
const isRender = !!process.env.RENDER; // Detect Render environment
const RENDER_COLD_START_DELAY = 3000;  // Increased delay for better stabilization
const WARM_STARTED = 'true'; // Flag to indicate server is warmed up

// Set warm started flag for health checks
process.env.WARM_STARTED = WARM_STARTED;

// 🔧 LIGHTWEIGHT WARMUP LOGIC FOR COLD STARTS
async function preWarmServices() {
  logger.info('🔥 Starting optimized service warmup...');

  // 🔧 DATABASE WARMUP WITH TIMEOUT PROTECTION
  const warmupPromises = [];

  // Warm up database connection with enhanced retry logic
  warmupPromises.push(
    (async () => {
      try {
        const db = await connectToDB();
        await db.command({ ping: 1 });
        logger.info('✅ Database warmed up successfully');
        return true;
      } catch (err) {
        logger.warn('⚠️ Database warmup failed (will retry on first request):', err.message);
        return false;
      }
    })()
  );

  // Warm up Redis connection (non-blocking)
  if (config.REDIS_URL) {
    warmupPromises.push(
      (async () => {
        try {
          const redisModule = require('./src/config/redis');
          const { connectRedis } = redisModule;
          const redisClient = await connectRedis();
          if (redisClient && redisClient.isOpen) {
            await redisClient.ping();
            logger.info('✅ Redis warmed up successfully');
            return true;
          }
          return false;
        } catch (err) {
          logger.warn('⚠️ Redis warmup failed (will retry on first request):', err.message);
          return false;
        }
      })()
    );
  }

  // Execute warmups with timeout to prevent blocking
  try {
    const results = await Promise.race([
      Promise.allSettled(warmupPromises),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Warmup timeout')), 8000) // Increased timeout
      )
    ]);

    const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
    logger.info(`✅ Service warmup completed: ${successful}/${results.length} services ready`);

  } catch (timeoutErr) {
    logger.warn('⚠️ Service warmup timed out, continuing with startup...', timeoutErr.message);
  }

  // Small stabilization delay for Render
  if (isRender) {
    logger.info(`⏳ Waiting ${RENDER_COLD_START_DELAY}ms for Render stabilization...`);
    await new Promise(resolve => setTimeout(resolve, RENDER_COLD_START_DELAY));
  }
}

async function startServer() {
  try {
    // ✅ CRITICAL: Trust proxy for Render/AWS/Azure (behind reverse proxy)
    // Without this: secure cookies won't set in production
    app.set('trust proxy', config.TRUST_PROXY === 'true' ? 1 : 0);

    // 🔧 PRE-WARM SERVICES FOR FASTER COLD STARTS
    await preWarmServices();

    // 🔧 SETUP DATABASE INDEXES
    await setupDatabaseIndexes();

    // 🔧 INITIALIZE QUEUES (DEFERRED FOR FASTER STARTUP)
    setImmediate(async () => {
      try {
        await initializeQueues();
        logger.info('✅ Background queues initialized');
      } catch (err) {
        logger.warn('⚠️ Queue initialization deferred:', err.message);
      }
    });

    // 🔧 SETUP RATE LIMITERS
    await setupRateLimiters();

    // 🔧 CREATE HTTP SERVER
    const server = http.createServer(app);

    // 🔧 INITIALIZE SOCKET.IO
    initSocket(server);

    // 🔧 START LISTENING WITH OPTIMIZED SETTINGS FOR RENDER
    server.listen(PORT, () => {
      logger.info(`✅ Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${config.NODE_ENV}`);
      if (isRender) {
        logger.info('🚀 Optimized for Render free tier cold-start resilience');

        // 🔥 SELF-PING TO PREVENT RENDER SLEEP (Every 14 minutes)
        setInterval(() => {
          logger.info('💓 Sending self-ping to keep Render awake...');
          http.get(`http://127.0.0.1:${PORT}/api/v1/health`, (res) => {
            logger.info(`💓 Self-ping response status: ${res.statusCode}`);
          }).on('error', (err) => {
            logger.error(`⚠️ Self-ping failed: ${err.message}`);
          });
        }, 14 * 60 * 1000); // 14 minutes
      }
    });

    // 🔧 GRACEFUL SHUTDOWN HANDLING
    const shutdown = async (signal) => {
      logger.info(`🛑 ${signal} received. Shutting down server...`);

      server.close(async () => {
        logger.info('✅ HTTP server closed');
        try {
          // 🔧 CLOSE QUEUES FIRST
          const { queueManager } = require('./src/jobs/queue.manager');
          await queueManager.closeAll();
          logger.info('✅ Queues closed');

          // 🔧 CLOSE REDIS FIRST (FASTER THAN DB)
          try {
            const redisModule = require('./src/config/redis');
            const { closeRedis } = redisModule;
            await closeRedis();
            logger.info('✅ Redis connection closed');
          } catch (redisErr) {
            logger.warn('⚠️ Redis shutdown warning:', {
              message: redisErr.message,
              code: redisErr.code
            });
          }

          // 🔧 CLOSE DATABASE LAST
          await closeDB();
          logger.info('✅ Database connection closed');

          process.exit(0);
        } catch (err) {
          logger.error('❌ Error during shutdown:', {
            message: err.message,
            stack: err.stack
          });
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error('🔥 Forceful shutdown after timeout');
        process.exit(1);
      }, 15000); // Reduced timeout for Render
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (err) {
    logger.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();