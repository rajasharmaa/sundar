require('dotenv').config();

// Strict startup environment variable validation
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'REFRESH_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

requiredEnvVars.push('ADMIN_PASSWORD_HASH');

const missingEnv = requiredEnvVars.filter(env => !process.env[env]);
if (missingEnv.length > 0) {
  console.error('❌ CRITICAL STARTUP ERROR: Missing required environment variables:');
  missingEnv.forEach(v => console.error(`  - ${v}`));
  process.exit(1);
}

// Block startup in production if default/insecure keys are used
if (process.env.NODE_ENV && process.env.NODE_ENV.trim().toLowerCase() === 'production') {
  const insecureKeywords = ['change-this-in-production', 'your-super-secret-jwt-key', 'your-super-secret-refresh-key'];
  const jwtSec = process.env.JWT_SECRET || '';
  const refSec = process.env.REFRESH_SECRET || '';
  
  const usesInsecureJwt = insecureKeywords.some(keyword => jwtSec.includes(keyword));
  const usesInsecureRef = insecureKeywords.some(keyword => refSec.includes(keyword));
  
  if (usesInsecureJwt || usesInsecureRef) {
    console.error('❌ CRITICAL SECURITY ERROR: Insecure placeholder secrets detected in production environment!');
    console.error('Please configure strong, random JWT_SECRET and REFRESH_SECRET variables in your environment.');
    process.exit(1);
  }
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import database connection
const connectDB = require('./config/database');

// Import Redis client for cross-backend cache invalidation
const { connectRedis } = require('./utils/redisClient');

// Import routes
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');

// Create express app
const app = express();
const PORT = process.env.PORT || 3001;

// Connect to database and Redis
connectDB();
connectRedis(); // 🔥 Connect to Redis for cache invalidation

// CORS configuration - MUST BE FIRST before other middleware
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL,
      'http://localhost:3001'
    ].filter(Boolean);
    // Allow all localhost origins only in development mode and check against allowed origins
    const isProd = process.env.NODE_ENV && process.env.NODE_ENV.trim().toLowerCase() === 'production';
    const isLocalhost = !isProd && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'));
    
    // ✅ M4-5 FIX: Removed verbose console.log CORS debug statements
    // (were logging allowedOrigins array on every request — a security/performance issue)
    if (isLocalhost || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token', 'content-type', 'authorization', 'x-requested-with', 'x-csrf-token'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Security middleware - AFTER CORS
app.use(helmet());

// Rate limiting - AFTER CORS
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 attempts per windowMs
  message: {
    error: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/admin/login', loginLimiter);

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// CSRF Protection Middleware
const crypto = require('crypto');
app.get('/api/csrf-token', (req, res) => {
  let token = req.cookies?.['_csrf'];
  if (!token) {
    token = crypto.randomBytes(32).toString('hex');
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('_csrf', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
  }
  res.json({ csrfToken: token });
});

const csrfProtection = (req, res, next) => {
  const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (!mutatingMethods.includes(req.method)) {
    return next();
  }
  const cookieToken = req.cookies?.['_csrf'];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    console.warn(`❌ Admin CSRF validation failed: cookieToken: ${!!cookieToken}, headerToken: ${!!headerToken}`);
    return res.status(403).json({ error: 'CSRF protection block: Invalid or missing CSRF token.' });
  }
  return next();
};

app.use('/api', csrfProtection);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Damodar Traders API Server',
    version: '1.0.0',
    documentation: '/api/docs (coming soon)'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large. Maximum size is 5MB.'
    });
  }
  
  if (err.code === 'LIMIT_FILE_TYPES') {
    return res.status(400).json({
      error: 'Invalid file type. Only images are allowed.'
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Admin API: http://localhost:${PORT}/api/admin`);
  console.log(`📡 Public API: http://localhost:${PORT}/api/public`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Nodemon reload trigger: added REDIS_URL support for cache invalidation.