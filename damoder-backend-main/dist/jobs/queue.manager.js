"use strict";
const { Queue, Worker, QueueEvents } = require('bullmq');
const { redisClient, redisConfig, connectRedis } = require('../config/redis'); // Use shared Redis connection
const logger = require('../utils/logger');
class QueueManager {
    constructor() {
        this.queues = {};
        this.workers = {};
        this.queueEvents = {};
        this.deadLetterQueue = null;
    }
    // Initialize a queue with enhanced reliability
    async initQueue(queueName, opts = {}) {
        // Ensure Redis is connected
        await connectRedis();
        const queue = new Queue(queueName, {
            connection: redisClient, // Use redisClient instead of redisConfig
            ...opts
        });
        // Set up queue events
        const queueEvents = new QueueEvents(queueName, {
            connection: redisClient // Use redisClient instead of redisConfig
        });
        // Listen for failed jobs and move them to DLQ
        queueEvents.on('failed', async (data) => {
            logger.error(`Job ${data.jobId} failed in queue ${queueName}`, {
                failedReason: data.failedReason,
                attemptsMade: data.prev?.attemptsMade,
                stacktrace: data.prev?.stacktrace
            });
            // Add to dead letter queue for manual inspection
            if (data.prev?.attemptsMade >= 3) { // Max attempts reached
                // Initialize DLQ if not already created
                if (!this.deadLetterQueue) {
                    this.deadLetterQueue = new Queue('dead-letter-queue', {
                        connection: redisClient // Use redisClient instead of redisConfig
                    });
                }
                await this.deadLetterQueue.add('failed-job', {
                    originalQueue: queueName,
                    jobId: data.jobId,
                    failedReason: data.failedReason,
                    originalData: data.prev?.data,
                    failedAt: new Date().toISOString()
                }, {
                    attempts: 1,
                    backoff: { type: 'fixed', delay: 60000 } // Retry after 1 minute
                });
            }
        });
        // Listen for completed jobs
        queueEvents.on('completed', (data) => {
            logger.info(`Job ${data.jobId} completed in queue ${queueName}`);
        });
        this.queues[queueName] = queue;
        this.queueEvents[queueName] = queueEvents;
        return queue;
    }
    // Initialize a worker with enhanced error handling
    async initWorker(queueName, processor, opts = {}) {
        // Ensure Redis is connected
        await connectRedis();
        const worker = new Worker(queueName, async (job) => {
            try {
                logger.info(`Processing job ${job.id} in queue ${queueName}`, {
                    data: job.data,
                    attempts: job.attemptsMade
                });
                const result = await processor(job);
                logger.info(`Job ${job.id} processed successfully in queue ${queueName}`);
                return result;
            }
            catch (error) {
                logger.error(`Job ${job.id} failed in queue ${queueName}`, {
                    error: error.message,
                    stack: error.stack,
                    attempts: job.attemptsMade,
                    data: job.data
                });
                // Re-throw to let BullMQ handle retries
                throw error;
            }
        }, {
            connection: redisClient, // Use redisClient instead of redisConfig
            concurrency: opts.concurrency || 5,
            lockDuration: opts.lockDuration || 30000, // 30 seconds
            ...opts.settings
        });
        // Handle worker errors
        worker.on('error', (err) => {
            logger.error(`Worker error in queue ${queueName}`, {
                error: err.message,
                stack: err.stack
            });
        });
        // Handle failed jobs
        worker.on('failed', (job, err) => {
            logger.error(`Worker job failed in queue ${queueName}`, {
                jobId: job?.id,
                error: err.message,
                data: job?.data
            });
        });
        this.workers[queueName] = worker;
        return worker;
    }
    // Get queue statistics
    async getQueueStats() {
        const stats = {};
        for (const [queueName, queue] of Object.entries(this.queues)) {
            try {
                const [waiting, active, completed, failed, delayed] = await Promise.all([
                    queue.getWaitingCount(),
                    queue.getActiveCount(),
                    queue.getCompletedCount(),
                    queue.getFailedCount(),
                    queue.getDelayedCount()
                ]);
                stats[queueName] = {
                    waiting,
                    active,
                    completed,
                    failed,
                    delayed,
                    total: waiting + active + completed + failed + delayed
                };
            }
            catch (error) {
                logger.error(`Failed to get stats for queue ${queueName}`, {
                    error: error.message,
                    stack: error.stack
                });
                stats[queueName] = { error: error.message };
            }
        }
        return stats;
    }
    // Health check function
    async healthCheck() {
        try {
            if (!redisClient.isOpen) {
                return { status: 'DOWN', error: 'Redis connection not open' };
            }
            // Test Redis connectivity
            await redisClient.ping();
            // Check queue statuses
            const queueStatuses = {};
            for (const [queueName, queue] of Object.entries(this.queues)) {
                try {
                    const isPaused = await queue.isPaused();
                    queueStatuses[queueName] = isPaused ? 'paused' : 'running';
                }
                catch (err) {
                    queueStatuses[queueName] = 'error';
                }
            }
            return {
                status: 'UP',
                queues: queueStatuses,
                redis: 'connected'
            };
        }
        catch (error) {
            return {
                status: 'DOWN',
                error: error.message
            };
        }
    }
    // Clean up queues and workers
    async closeAll() {
        logger.info('Shutting down queue manager...');
        const shutdownPromises = [];
        // Close all workers
        for (const [queueName, worker] of Object.entries(this.workers)) {
            try {
                shutdownPromises.push(worker.close().then(() => {
                    logger.info(`Worker closed for queue ${queueName}`);
                }).catch((error) => {
                    logger.error(`Error closing worker for queue ${queueName}`, { error: error.message });
                }));
            }
            catch (error) {
                logger.error(`Error closing worker for queue ${queueName}`, { error: error.message });
            }
        }
        // Close all queues
        for (const [queueName, queue] of Object.entries(this.queues)) {
            try {
                shutdownPromises.push(queue.close().then(() => {
                    logger.info(`Queue closed ${queueName}`);
                }).catch((error) => {
                    logger.error(`Error closing queue ${queueName}`, { error: error.message });
                }));
            }
            catch (error) {
                logger.error(`Error closing queue ${queueName}`, { error: error.message });
            }
        }
        // Close dead letter queue if it exists
        if (this.deadLetterQueue) {
            try {
                shutdownPromises.push(this.deadLetterQueue.close().then(() => {
                    logger.info('Dead letter queue closed');
                }).catch((error) => {
                    logger.error('Error closing dead letter queue', { error: error.message });
                }));
            }
            catch (error) {
                logger.error('Error closing dead letter queue', { error: error.message });
            }
        }
        // Wait for all shutdown operations with timeout
        if (shutdownPromises.length > 0) {
            try {
                await Promise.race([
                    Promise.all(shutdownPromises),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Queue shutdown timeout')), 10000))
                ]);
            }
            catch (timeoutError) {
                logger.warn('Queue shutdown timed out:', { error: timeoutError.message });
            }
        }
        // Don't close the main Redis connection here since other parts of the app might still need it
        logger.info('Queue manager shutdown complete');
    }
}
// Singleton instance
const queueManager = new QueueManager();
module.exports = {
    queueManager,
    connectRedis // Export the connection function for use elsewhere
};
