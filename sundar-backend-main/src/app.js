require('express-async-errors');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

const config = require('./config/env');
const logger = require('./utils/logger');
const { connectToDB } = require('./config/database');
const { requestIdMiddleware } = require('./api/middleware/request-id');
const { performanceLogger } = require('./api/middleware/performance-logger');
const { errorHandler, createError, sendErrorResponse } = require('./middleware/error.handler');
const { runSecurityValidation } = require('./utils/security-validator');
const { cookieSecurityMiddleware } = require('./utils/secure-cookies');

// Register all models
require('./models');

// Middleware
const { validate } = require('./api/middleware/validate');

const app = express();

// 🔥 APPLICATION STARTUP WITH SECURITY VALIDATION
const initializeApp = async () => {
  try {
    logger.info('🚀 Initializing Sundar Corporation API with enterprise-grade security...');

    // 🔐 RUN COMPREHENSIVE SECURITY VALIDATION
    if (config.NODE_ENV === 'production') {
      logger.info('🔒 Running production security validation...');
      const securityResults = await runSecurityValidation();

      if (securityResults.criticalFailures > 0) {
        logger.error('❌ CRITICAL SECURITY ISSUES FOUND - ABORTING STARTUP');
        process.exit(1);
      }

      logger.info('✅ All security validations passed');
    }

    // 🔧 CONNECT TO DATABASE
    const db = await connectToDB();
    logger.info('✅ Database connected successfully');

    // 🔧 MIGRATION: Migrate legacy user fields to match schema keys
    try {
      logger.info('🔧 Running user schema field migration checks...');
      const usersCollection = db.collection('users');

      // 1. Migrate active -> isActive
      const activeRes = await usersCollection.updateMany(
        { active: { $exists: true }, isActive: { $exists: false } },
        [{ $set: { isActive: "$active" } }]
      );
      if (activeRes.modifiedCount > 0) {
        logger.info(`Migrated active -> isActive for ${activeRes.modifiedCount} users`);
      }

      // 2. Migrate failedLoginAttempts -> loginAttempts
      const failRes = await usersCollection.updateMany(
        { failedLoginAttempts: { $exists: true }, loginAttempts: { $exists: false } },
        [{ $set: { loginAttempts: "$failedLoginAttempts" } }]
      );
      if (failRes.modifiedCount > 0) {
        logger.info(`Migrated failedLoginAttempts -> loginAttempts for ${failRes.modifiedCount} users`);
      }

      // 3. Migrate lastLogin -> lastLoginAt
      const loginRes = await usersCollection.updateMany(
        { lastLogin: { $exists: true }, lastLoginAt: { $exists: false } },
        [{ $set: { lastLoginAt: "$lastLogin" } }]
      );
      if (loginRes.modifiedCount > 0) {
        logger.info(`Migrated lastLogin -> lastLoginAt for ${loginRes.modifiedCount} users`);
      }
      logger.info('✅ User schema fields migration checks completed');
    } catch (migrationError) {
      logger.error('⚠️ User schema fields migration failed (non-blocking):', migrationError.message);
    }

    // 🔧 INITIALIZE OTHER SERVICES
    // Redis, queues, etc. would be initialized here

    logger.info('🎉 Application initialized successfully with enterprise-grade security');

  } catch (error) {
    logger.error('❌ Application initialization failed:', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

// Trust proxy for secure cookies (Required for Render)
app.set('trust proxy', config.TRUST_PROXY === 'true' ? 1 : 0);

// 🔐 COOKIE SECURITY MIDDLEWARE - VALIDATE INCOMING COOKIES
app.use(cookieSecurityMiddleware);

// Request ID and Performance Monitoring
app.use(requestIdMiddleware);
app.use(performanceLogger);

// 1. Better URL Sanitizer (Fixes // issues before they hit routers)
app.use((req, res, next) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/+/g, '/');
  }
  next();
});
// 🔥 PRODUCTION-SAFE CORS CONFIGURATION
const allowedOrigins = [];

if (config.NODE_ENV && config.NODE_ENV.trim().toLowerCase() === 'production') {
  // Allow custom domains
  allowedOrigins.push(/^https:\/\/.*\.damoder\.com$/);
  // Allow Render domain
  allowedOrigins.push('https://damoder-backend.onrender.com');

  if (config.FRONTEND_URL) {
    allowedOrigins.push(config.FRONTEND_URL);
  }
} else {
  // Development mode origins
  allowedOrigins.push(
    config.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:8080',    // Admin panel
    'http://127.0.0.1:8080',   // Admin panel
    'http://localhost:3000',  // Development backend
    'http://127.0.0.1:3000'   // Development backend
  );
}

// 🛡️ CORS MIDDLEWARE - PRODUCTION CROSS-ORIGIN COMPATIBLE
app.use(cors({
  origin: function (origin, callback) {
    // Check if origin is allowed
    if (!origin) {
      if (process.env.NODE_ENV === 'development') return callback(null, true);
      return callback(new Error('CORS policy violation: No origin provided'), false);
    }

    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(pattern => {
      if (typeof pattern === 'string') {
        return origin === pattern;
      } else if (pattern instanceof RegExp) {
        return pattern.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked origin:', origin);
      callback(new Error('CORS policy violation'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'Accept',
    'X-Request-ID',
    'X-Server-Time',
    'X-Client-Version',
    'X-Cold-Start',
    'X-Health-Check',
    'X-Background-Check',
    'X-Wishlist-Request',
    'X-Refresh-Token',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-Server-Time',
    'X-Client-Version',
    'X-Cold-Start',
    'Retry-After'
  ],
  optionsSuccessStatus: 200, // Changed from 204 to 200 for better compatibility
  maxAge: 86400 // 24 hours
}));

// ✅ M1-3 FIX: Removed global OPTIONS wildcard handler.
// It was overriding cors() by reflecting ANY Origin header, enabling cross-origin credential theft.
// The cors() middleware above already handles OPTIONS preflights correctly.

// 🔧 DEVELOPMENT RATE LIMITING - RELAXED FOR LOCAL TESTING
if (config.NODE_ENV === 'development') {
  const developmentLimiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 100, // 100 requests per second in development
    message: 'Too many requests in development mode',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', developmentLimiter);
}

// ✅ M4-6 FIX: Removed duplicate security headers before Helmet.
// X-Content-Type-Options, X-Frame-Options are set by Helmet below.
// X-XSS-Protection is deprecated and can introduce XSS vulnerabilities in old browsers.

// 🔧 SIMPLIFIED SECURITY MIDDLEWARE - PREVENT FRONTEND CONFLICTS
const helmetConfig = {
  // 🛡️ CONTENT SECURITY POLICY - MINIMAL FOR APIS
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for frameworks
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"]
    },
    reportOnly: false
  },

  // 🔒 STRICT TRANSPORT SECURITY
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: config.NODE_ENV === 'production'
  },

  // 🛡️ BASIC SECURITY HEADERS
  xssFilter: true,
  noSniff: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

  // 🚫 DISABLE CONFLICTING HEADERS
  expectCt: false,
  permittedCrossDomainPolicies: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
};



// 🔐 APPLY HELMET SECURITY MIDDLEWARE
app.use(helmet(helmetConfig));

logger.info('✅ Helmet security headers configured', {
  nodeEnv: config.NODE_ENV,
  hstsEnabled: config.NODE_ENV === 'production',
  cspDirectives: Object.keys(helmetConfig.contentSecurityPolicy.directives)
});

// 2. Body parsers with proper error handling
app.use(express.json({
  limit: '10mb',
  type: ['application/json', 'text/plain'],
  verify: (req, res, buf, encoding) => {
    // Verify JSON integrity
    try {
      JSON.parse(buf.toString(encoding));
    } catch (err) {
      throw new Error('Invalid JSON payload');
    }
  }
}));

// 🔧 ADD GLOBAL JSON PARSING ERROR HANDLER
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.warn('Invalid JSON in request body', {
      error: err.message,
      ip: req.ip,
      path: req.path
    });
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format in request body',
      code: 'INVALID_JSON'
    });
  }
  next(err);
});

app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
  parameterLimit: 1000
}));

// 3. Cookie parser (parses cookies from request headers)
// ✅ M4-4 FIX: cookieParser does NOT accept httpOnly/secure as options.
// Cookie security attributes are set when writing cookies via res.cookie(), not when parsing.
app.use(cookieParser());

// 4. Comprehensive input sanitization
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn('MongoDB injection attempt detected and sanitized', {
      key,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
  }
}));

// 5. Parameter pollution protection with logging
app.use(hpp({
  log: true,
  whitelist: ['category', 'tags'] // Allow legitimate multi-value params
}));

// 6. Compression with proper error handling
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    // Skip compression for streaming, WebSockets, and small responses
    if (req.headers['x-no-compression']) return false;
    if (res.getHeader('Content-Type')?.includes('text/event-stream')) return false;
    return compression.filter(req, res);
  }
}));

// 7. CSRF protection middleware for mutating API requests
const csrfProtection = require('./api/middleware/csrf.middleware');
app.use('/api/', csrfProtection);

const { login: authLimiter, api: apiLimiter } = require('./utils/rate-limiter');

app.use('/api/', apiLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);
app.use('/api/admin/login', authLimiter);

// 🔧 ULTIMATE HEALTH ENDPOINT - ALWAYS RESPONDS QUICKLY
app.get('/health', async (req, res) => {
  const serverStartTime = Date.now() - (process.uptime() * 1000);
  const isColdStart = Date.now() - serverStartTime < 30000; // 30 seconds
  const clientColdStart = req.headers['x-cold-start'] === 'true';
  const isHealthCheck = req.headers['x-health-check'] === 'true';
  const isBackgroundCheck = req.headers['x-background-check'] === 'true';

  try {
    // 🔧 LIGHTWEIGHT HEALTH CHECK - ALWAYS RESPOND QUICKLY
    const response = {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      serverInstanceId: process.env.SERVER_INSTANCE_ID || 'default'
    };

    // 🔧 ONLY CHECK ESSENTIAL SERVICES FOR HEALTH CHECKS
    if (isHealthCheck || isBackgroundCheck) {
      // Quick database ping (500ms timeout)
      let dbHealthy = false;
      try {
        const db = await connectToDB();
        await Promise.race([
          db.command({ ping: 1 }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 500))
        ]);
        dbHealthy = true;
      } catch (dbError) {
        logger.debug('Database health check timeout (non-critical)', { error: dbError.message });
      }

      response.services = {
        database: dbHealthy,
        server: true
      };
    }

    // 🔧 COLD START HANDLING - ALWAYS RETURN 200 OK BUT INCLUDE COLD START INFO
    if (isColdStart || clientColdStart) {
      response.coldStart = true;
      response.isColdStart = true;
      response.warmupTime = Math.max(30 - process.uptime(), 0);
      response.retryAfter = Math.ceil(response.warmupTime);
      response.message = 'Server is initializing, please retry shortly';

      logger.info('Cold start detected - returning 200 with cold start info', {
        uptime: process.uptime(),
        warmupRemaining: response.warmupTime,
        isHealthCheck
      });

      // 🔥 CRITICAL: ALWAYS RETURN 200 OK TO PREVENT AUTH FLOW BLOCKAGE
      return res.status(200).json(response);
    }

    // 🔧 NORMAL HEALTH CHECK - ALWAYS 200 OK
    res.status(200).json(response);

  } catch (err) {
    logger.error('Health check error:', err.message);
    res.status(503).json({
      status: 'error',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      serverInstanceId: process.env.SERVER_INSTANCE_ID || 'default',
      message: 'Health check failed',
      error: err.message
    });
  }
});

// 🔧 ADD HEAD METHOD SUPPORT FOR HEALTH CHECKS
app.head('/health', (req, res) => {
  res.status(200).end();
});



// 🔧 ENHANCED READINESS PROBE WITH DEPENDENCY CHECKS
app.get('/ready', async (req, res) => {
  const startTime = Date.now();

  try {
    // 🔧 VERIFY ESSENTIAL SERVICES ARE READY
    const readinessChecks = {
      database: false,
      redis: false,
      application: true // App is running if we reach this point
    };

    // Quick database readiness check
    try {
      const db = await connectToDB();
      await db.command({ ping: 1 });
      readinessChecks.database = true;
    } catch (err) {
      logger.warn('Database not ready for readiness check:', err.message);
    }

    // Quick Redis readiness check
    try {
      const redisModule = require('./config/redis');
      const { redisClient } = redisModule;
      if (redisClient && redisClient.isOpen) {
        await redisClient.ping();
        readinessChecks.redis = true;
      }
    } catch (err) {
      logger.warn('Redis not ready for readiness check:', err.message);
    }

    const allReady = Object.values(readinessChecks).every(check => check);
    const statusCode = allReady ? 200 : 503;

    res.status(statusCode).json({
      status: allReady ? 'READY' : 'NOT_READY',
      services: readinessChecks,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });

  } catch (err) {
    logger.error('Readiness check failed:', err);
    res.status(503).json({
      status: 'NOT_READY',
      error: 'Readiness probe failed',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
  }
});

// Import route modules
const authRoutes = require('./routes/auth.routes.coldstart'); // 🔥 COLD-START SAFE
const productsRoutes = require('./api/v1/products/routes');
const productsController = require('./api/v1/products/controller');
const categoriesRoutes = require('./api/v1/categories/routes');
const usersRoutes = require('./api/v1/users/routes');
const inquiriesRoutes = require('./api/v1/inquiries/routes');
const metricsRoutes = require('./api/v1/metrics/routes');
const wishlistRoutes = require('./api/v1/wishlist/routes');
const rfqRoutes = require('./api/v1/rfq/routes'); // NEW
const catalogRoutes = require('./api/v1/catalog/routes');
const settingsRoutes = require('./api/v1/settings/routes');
const sitemapController = require('./controllers/sitemap.controller');
const bulkUploadController = require('./controllers/bulkUpload.controller');
const analyticsController = require('./controllers/analytics.controller');
const analyticsRoutes = require('./api/v1/analytics/routes');
const { requireAdminAuth } = require('./api/middleware/auth');
const unifiedAdminRoutes = require('./api/admin/routes'); // NEW UNIFIED ADMIN ROUTES

// API Routes - v1
const crypto = require('crypto');
app.get('/api/v1/csrf-token', (req, res) => {
  let token = req.cookies?.['_csrf'];
  if (!token) {
    token = crypto.randomBytes(32).toString('hex');
    const isProd = config.NODE_ENV === 'production';
    res.cookie('_csrf', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
  }
  res.json({ csrfToken: token });
});

// Admin API Routes (Unified)
app.use('/api/admin', unifiedAdminRoutes);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/inquiries', inquiriesRoutes);
app.use('/api/v1/metrics', metricsRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/rfq', rfqRoutes); // NEW
app.use('/api/v1/catalog', catalogRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Admin bulk upload routes (requires file upload middleware)
// Note: Add multer middleware for file uploads in production
app.post('/api/admin/products/bulk-upload',
  requireAdminAuth,
  // multer.single('file'), // Uncomment after adding multer
  bulkUploadController.bulkUpload
);
app.post('/api/admin/products/bulk-upload/confirm', requireAdminAuth, bulkUploadController.confirmBulkUpload);
app.get('/api/admin/products/bulk-upload/progress/:jobId', requireAdminAuth, bulkUploadController.getUploadProgress);
app.get('/api/admin/products/bulk-upload/template', requireAdminAuth, bulkUploadController.downloadTemplate);

// Admin price management routes
app.post('/api/admin/products/bulk-price-update', requireAdminAuth, productsController.bulkPriceUpdate);

// SEO Routes (outside v1 namespace)
app.get('/sitemap.xml', sitemapController.generateSitemapIndex);
app.get('/sitemap-main.xml', sitemapController.generateMainSitemap);
app.get('/sitemap-products-:page.xml', sitemapController.generateProductSitemap);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Sundar Corporation API v1', status: 'UP' });
});

app.use((req, res) => {
  const error = createError.notFound();
  sendErrorResponse(res, error, req.requestId);
});

// Use standardized error handler
app.use(errorHandler);

module.exports = { app, setupRateLimiters: async () => { } };

// 🔥 START APPLICATION WITH SECURITY VALIDATION
if (require.main === module) {
  initializeApp().catch(err => {
    logger.error('❌ Fatal application startup error:', err);
    process.exit(1);
  });
}