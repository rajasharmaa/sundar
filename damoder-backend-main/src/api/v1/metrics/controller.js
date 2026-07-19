const os = require('os');
const { connectToDB } = require('../../../config/database');
const { redisClient } = require('../../../config/redis');
const { emailQueue, notificationQueue, heavyDbQueue } = require('../../../config/queue');
const logger = require('../../../utils/logger');

// Metrics endpoint for monitoring
const getMetrics = async (req, res) => {
  try {
    const startTime = Date.now();

    // System metrics
    const systemMetrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: {
        count: os.cpus().length,
        model: os.cpus()[0].model,
        speed: os.cpus()[0].speed
      },
      load: os.loadavg(),
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname()
    };

    // Database metrics
    let dbMetrics = {};
    try {
      const db = await connectToDB();
      await db.command({ ping: 1 });

      dbMetrics = {
        connected: true,
        collections: await db.listCollections().toArray(),
        stats: {
          users: await db.collection('users').estimatedDocumentCount(),
          products: await db.collection('products').countDocuments({ active: { $ne: false } }),
          inquiries: await db.collection('inquiries').estimatedDocumentCount()
        }
      };
    } catch (dbErr) {
      dbMetrics = {
        connected: false,
        error: dbErr.message
      };
    }

    // Redis metrics
    let redisMetrics = {};
    try {
      await redisClient.ping();
      const redisInfo = await redisClient.info();

      redisMetrics = {
        connected: true,
        info: redisInfo,
        memory: await redisClient.info('memory'),
        clients: await redisClient.info('clients')
      };
    } catch (redisErr) {
      redisMetrics = {
        connected: false,
        error: redisErr.message
      };
    }

    // Queue metrics
    let queueMetrics = {};
    try {
      const [emailWaiting, emailActive, emailCompleted, emailFailed] = await Promise.all([
        emailQueue.getWaitingCount(),
        emailQueue.getActiveCount(),
        emailQueue.getCompletedCount(),
        emailQueue.getFailedCount()
      ]);

      const [notificationWaiting, notificationActive, notificationCompleted, notificationFailed] = await Promise.all([
        notificationQueue.getWaitingCount(),
        notificationQueue.getActiveCount(),
        notificationQueue.getCompletedCount(),
        notificationQueue.getFailedCount()
      ]);

      const [dbWaiting, dbActive, dbCompleted, dbFailed] = await Promise.all([
        heavyDbQueue.getWaitingCount(),
        heavyDbQueue.getActiveCount(),
        heavyDbQueue.getCompletedCount(),
        heavyDbQueue.getFailedCount()
      ]);

      queueMetrics = {
        email: {
          waiting: emailWaiting,
          active: emailActive,
          completed: emailCompleted,
          failed: emailFailed
        },
        notifications: {
          waiting: notificationWaiting,
          active: notificationActive,
          completed: notificationCompleted,
          failed: notificationFailed
        },
        heavyDb: {
          waiting: dbWaiting,
          active: dbActive,
          completed: dbCompleted,
          failed: dbFailed
        }
      };
    } catch (queueErr) {
      queueMetrics = {
        error: queueErr.message
      };
    }

    const responseTime = Date.now() - startTime;

    const metrics = {
      timestamp: new Date().toISOString(),
      service: 'Damodar Traders API',
      version: '3.0.0',
      responseTime: `${responseTime}ms`,
      system: systemMetrics,
      database: dbMetrics,
      redis: redisMetrics,
      queues: queueMetrics
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Metrics collection error', { error });
    res.status(500).json({
      error: 'Failed to collect metrics',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = { getMetrics };