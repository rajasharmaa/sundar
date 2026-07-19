const logger = require('../../utils/logger');
const { cleanupRequestId } = require('./request-id');

// Middleware to log request performance
const performanceLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = req.requestId || 'unknown';
  
  // Track response size
  let responseBodySize = 0;
  const originalSend = res.send;
  res.send = function(data) {
    if (data) {
      responseBodySize = Buffer.byteLength(
        typeof data === 'string' ? data : JSON.stringify(data)
      );
    }
    return originalSend.call(this, data);
  };

  const logCompletion = () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Log performance metrics
    logger.info('Request completed', {
      requestId,
      method: req.method,
      url: req.originalUrl, // Use originalUrl to preserve query params
      statusCode,
      duration: `${duration}ms`,
      responseSize: `${responseBodySize} bytes`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      forwardedFor: req.headers['x-forwarded-for']
    });

    // Log slow requests
    const slowThreshold = parseInt(process.env.SLOW_REQUEST_THRESHOLD) || 1000;
    if (duration > slowThreshold) {
      logger.warn('Slow request detected', {
        requestId,
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        threshold: `${slowThreshold}ms`
      });
    }
    
    // Cleanup request ID
    cleanupRequestId();
  };

  // Handle different response completion events
  res.on('finish', logCompletion);
  res.on('close', logCompletion);
  
  // Handle errors
  res.on('error', (err) => {
    logger.error('Response error', {
      requestId,
      error: err.message,
      stack: err.stack
    });
    cleanupRequestId();
  });

  next();
};

module.exports = { performanceLogger };