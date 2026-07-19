const { queueManager, connectRedis } = require('../jobs/queue.manager');
const logger = require('../utils/logger');

// Store queues for singleton-like access
const queues = {
  emailQueue: null,
  notificationQueue: null,
  heavyDbQueue: null
};

// Queue configuration
const QUEUE_CONFIG = {
  email: {
    name: 'email processing',
    options: {
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
        timeout: 30000 // 30 second timeout
      }
    }
  },
  notification: {
    name: 'notifications',
    options: {
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
        timeout: 15000 // 15 second timeout
      }
    }
  },
  heavyDb: {
    name: 'heavy database operations',
    options: {
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: true,
        removeOnFail: false,
        timeout: 60000 // 1 minute timeout
      }
    }
  }
};

// Ensure Redis is connected before initializing queues
async function initializeQueues() {
  try {
    await connectRedis();

    // Initialize queues with enhanced reliability
    queues.emailQueue = await queueManager.initQueue(
      QUEUE_CONFIG.email.name,
      QUEUE_CONFIG.email.options
    );

    queues.notificationQueue = await queueManager.initQueue(
      QUEUE_CONFIG.notification.name,
      QUEUE_CONFIG.notification.options
    );

    queues.heavyDbQueue = await queueManager.initQueue(
      QUEUE_CONFIG.heavyDb.name,
      QUEUE_CONFIG.heavyDb.options
    );

    logger.info('✅ All queues initialized successfully');
    return queues;
  } catch (err) {
    logger.error('❌ Queue initialization failed:', {
      message: err.message,
      stack: err.stack
    });
    throw err;
  }
}

// Health check for all queues
async function checkQueueHealth() {
  const health = {};

  for (const [name, queue] of Object.entries(queues)) {
    if (queue) {
      try {
        const isPaused = await queue.isPaused();
        const jobCounts = await queue.getJobCounts();
        health[name] = {
          status: 'healthy',
          paused: isPaused,
          jobs: jobCounts
        };
      } catch (err) {
        health[name] = {
          status: 'error',
          error: err.message
        };
      }
    } else {
      health[name] = { status: 'uninitialized' };
    }
  }

  return health;
}

// Graceful shutdown for all queues
async function closeQueues() {
  const closePromises = [];

  for (const [name, queue] of Object.entries(queues)) {
    if (queue) {
      try {
        closePromises.push(
          queue.close().then(() => {
            logger.info(`✅ Queue ${name} closed successfully`);
          })
        );
      } catch (err) {
        logger.warn(`⚠️ Error closing queue ${name}:`, err.message);
      }
    }
  }

  if (closePromises.length > 0) {
    await Promise.allSettled(closePromises);
  }
}

module.exports = {
  initializeQueues,
  checkQueueHealth,
  closeQueues,
  get emailQueue() { return queues.emailQueue; },
  get notificationQueue() { return queues.notificationQueue; },
  get heavyDbQueue() { return queues.heavyDbQueue; }
};