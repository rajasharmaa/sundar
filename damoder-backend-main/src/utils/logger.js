const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log levels to include fatal
const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5
  },
  colors: {
    fatal: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    trace: 'gray'
  }
};

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'damodar-traders-api' },
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
      zippedArchive: true // Enable compression
    }),
    // Write all logs with level `info` and below to `combined.log`
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
      zippedArchive: true // Enable compression
    })
  ]
});

// If we're not in production, log to the `console` with colors
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ colors: customLevels.colors }),
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level}]: ${message}${metaStr ? `\n${metaStr}` : ''}`;
      })
    )
  }));
}

// Add fatal method to match usage in codebase
logger.fatal = (...args) => logger.log('fatal', ...args);

// Enhanced logging methods for production monitoring
logger.errorToFile = (errorData) => {
  // Write detailed error information to a separate file for analysis
  const errorFilePath = path.join(logsDir, 'detailed-errors.log');
  const errorEntry = {
    timestamp: new Date().toISOString(),
    ...errorData
  };
  
  try {
    fs.appendFileSync(errorFilePath, JSON.stringify(errorEntry) + '\n');
  } catch (writeError) {
    console.error('Failed to write to detailed error log:', writeError);
  }
};

// Method to log security-related events
logger.security = (message, meta = {}) => {
  const securityLog = {
    type: 'SECURITY',
    message,
    ...meta,
    timestamp: new Date().toISOString()
  };
  
  logger.warn('[SECURITY]', securityLog);
  
  // Also write to security log file
  const securityLogPath = path.join(logsDir, 'security.log');
  try {
    fs.appendFileSync(securityLogPath, JSON.stringify(securityLog) + '\n');
  } catch (writeError) {
    console.error('Failed to write to security log:', writeError);
  }
};

// Method to log performance metrics
logger.performance = (operation, durationMs, meta = {}) => {
  const perfLog = {
    type: 'PERFORMANCE',
    operation,
    durationMs,
    ...meta,
    timestamp: new Date().toISOString()
  };
  
  if (durationMs > 5000) { // Log slow operations as warnings
    logger.warn('[PERFORMANCE]', perfLog);
  } else {
    logger.info('[PERFORMANCE]', perfLog);
  }
};

// Method to log API request/response details
logger.api = (req, res, durationMs, additionalMeta = {}) => {
  const apiLog = {
    type: 'API',
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    durationMs,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    ...additionalMeta,
    timestamp: new Date().toISOString()
  };
  
  if (res.statusCode >= 500) {
    logger.error('[API_ERROR]', apiLog);
  } else if (res.statusCode >= 400) {
    logger.warn('[API_WARNING]', apiLog);
  } else {
    logger.info('[API_SUCCESS]', apiLog);
  }
};

module.exports = logger;