const zod = require('zod');
require('dotenv').config();

// Create minimal console logger for environment validation to avoid circular dependency
const createMinimalLogger = () => ({
    error: (...args) => console.error('[ERROR]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    info: (...args) => console.info('[INFO]', ...args)
});

const logger = createMinimalLogger();

const envSchema = zod.object({
    // Core Application
    NODE_ENV: zod.enum(['development', 'test', 'production']).default('production'),
    PORT: zod.string().transform(Number).default('3000'),

    // Security Secrets (relaxed validation for development)
    JWT_SECRET: zod.string().min(process.env.NODE_ENV === 'production' ? 64 : 10, 'JWT_SECRET must be at least 64 characters for production security'),
    JWT_ACCESS_SECRET: zod.string().min(process.env.NODE_ENV === 'production' ? 64 : 10, 'JWT_ACCESS_SECRET must be at least 64 characters'),
    JWT_REFRESH_SECRET: zod.string().min(process.env.NODE_ENV === 'production' ? 64 : 10, 'JWT_REFRESH_SECRET must be at least 64 characters'),
    COOKIE_SECRET: zod.string().min(process.env.NODE_ENV === 'production' ? 64 : 10, 'COOKIE_SECRET must be at least 64 characters'),
    SESSION_SECRET: zod.string().min(process.env.NODE_ENV === 'production' ? 64 : 10, 'SESSION_SECRET must be at least 64 characters'),

    // Expiry Configuration - COLD-START OPTIMIZED
    JWT_ACCESS_EXPIRY: zod.string().default('30m'),   // Extended for free tier hosting
    JWT_REFRESH_EXPIRY: zod.string().default('30d'),    // Extended for user experience

    // URLs (validated for production)
    FRONTEND_URL: zod.string().url().refine(
        url => process.env.NODE_ENV !== 'production' || url.startsWith('https://'),
        'FRONTEND_URL must use HTTPS in production'
    ),
    BACKEND_URL: zod.string().url().optional().or(zod.string().startsWith('http://localhost')).optional(),

    // Database Connections
    MONGODB_URI: zod.string().refine(
        uri => uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'),
        'Must be valid MongoDB connection string'
    ).refine(
        uri => process.env.NODE_ENV !== 'production' ||
            (!uri.includes('localhost') && !uri.includes('127.0.0.1')),
        'Production MongoDB URI cannot contain localhost addresses'
    ),

    REDIS_URL: zod.string().url().optional().refine(
        url => !url || (process.env.NODE_ENV !== 'production' || url.startsWith('rediss://')),
        'Production Redis must use rediss:// (TLS) protocol'
    ),

    // Proxy Configuration
    TRUST_PROXY: zod.enum(['true', 'false']).or(zod.boolean()).default('false'),

    // OAuth Configuration
    GOOGLE_CLIENT_ID: zod.string().optional(),
    GOOGLE_CLIENT_SECRET: zod.string().optional(),
    GOOGLE_REDIRECT_URI: zod.string().url().optional(),

    // Email Configuration
    EMAIL_USER: zod.string().email().optional(),
    EMAIL_PASS: zod.string().min(16).optional(),
    EMAIL_FROM: zod.string().email().optional().or(zod.string().regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)).optional(),
    EMAIL_SERVICE: zod.enum(['gmail', 'sendgrid', 'ses', 'smtp']).default('gmail'),

    // Security Features
    ENABLE_RATE_LIMITING: zod.enum(['true', 'false']).default('true'),
    ENABLE_CSP: zod.enum(['true', 'false']).default('true'),
    ENABLE_HELMET: zod.enum(['true', 'false']).default('true'),
    ENABLE_HSTS: zod.enum(['true', 'false']).default('true'),

    // Logging Configuration
    LOG_LEVEL: zod.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),
    LOG_TRANSPORT: zod.enum(['console', 'file', 'both']).default('console'),

    // Performance & Monitoring
    ENABLE_COMPRESSION: zod.enum(['true', 'false']).default('true'),
    ENABLE_CACHING: zod.enum(['true', 'false']).default('true'),
    CACHE_TTL_DEFAULT: zod.string().transform(Number).default('300'),

    // CORS Configuration
    ALLOWED_ORIGINS: zod.string().optional().transform(val =>
        val ? val.split(',').map(origin => origin.trim()) : []
    ),

    // reCAPTCHA Configuration
    RECAPTCHA_SECRET_KEY: zod.string().optional(),
});

const validateEnv = () => {
    try {
        const env = envSchema.parse(process.env);

        // Security validation for all environments
        const securityChecks = [
            {
                check: () => env.JWT_SECRET.length < 64,
                message: 'JWT_SECRET must be at least 64 characters long for cryptographic security'
            },
            {
                check: () => env.JWT_ACCESS_SECRET.length < 64,
                message: 'JWT_ACCESS_SECRET must be at least 64 characters long'
            },
            {
                check: () => env.JWT_REFRESH_SECRET.length < 64,
                message: 'JWT_REFRESH_SECRET must be at least 64 characters long'
            },
            {
                check: () => env.COOKIE_SECRET.length < 64,
                message: 'COOKIE_SECRET must be at least 64 characters long'
            },
            {
                check: () => env.SESSION_SECRET.length < 64,
                message: 'SESSION_SECRET must be at least 64 characters long'
            },
            {
                check: () => env.NODE_ENV === 'production' && env.MONGODB_URI.includes('localhost'),
                message: 'Production MongoDB URI cannot contain localhost addresses'
            },
            {
                check: () => env.NODE_ENV === 'production' && env.MONGODB_URI.includes('127.0.0.1'),
                message: 'Production MongoDB URI cannot contain 127.0.0.1 addresses'
            },
            {
                check: () => env.NODE_ENV === 'production' && env.REDIS_URL && !env.REDIS_URL.startsWith('rediss://'),
                message: 'Production Redis must use TLS (rediss:// protocol)'
            },
            {
                check: () => env.NODE_ENV === 'production' && !env.FRONTEND_URL.startsWith('https://'),
                message: 'Production FRONTEND_URL must use HTTPS'
            },
            {
                check: () => env.NODE_ENV === 'production' && env.BACKEND_URL && !env.BACKEND_URL.startsWith('https://'),
                message: 'Production BACKEND_URL must use HTTPS'
            },
            {
                check: () => env.NODE_ENV === 'production' && (!env.RECAPTCHA_SECRET_KEY || env.RECAPTCHA_SECRET_KEY === 'your_recaptcha_secret_key_here'),
                message: 'RECAPTCHA_SECRET_KEY is required and must not be placeholder in production mode'
            }
        ];

        // Run security checks
        const failedChecks = securityChecks.filter(check => check.check());
        if (failedChecks.length > 0) {
            logger.error('❌ Security validation failed:');
            failedChecks.forEach(check => logger.error(`  - ${check.message}`));
            process.exit(1);
        }

        // Production-specific warnings
        if (env.NODE_ENV === 'production') {
            const warnings = [];

            if (!env.REDIS_URL) {
                warnings.push('REDIS_URL not set - using memory store (not recommended for production)');
            }

            if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
                warnings.push('Google OAuth not configured - social login disabled');
            }

            if (!env.EMAIL_USER || !env.EMAIL_PASS) {
                warnings.push('Email configuration incomplete - password reset disabled');
            }

            if (!env.RECAPTCHA_SECRET_KEY) {
                warnings.push('RECAPTCHA_SECRET_KEY not set - reCAPTCHA verification bypassed (security risk)');
            }

            if (warnings.length > 0) {
                warnings.forEach(warning => logger.warn(`⚠️  ${warning}`));
            }

            // Log security confirmation
            logger.info('✅ Production security validation passed');
        } else {
            // Development warnings
            const devWarnings = [];

            if (env.MONGODB_URI.includes('localhost') || env.MONGODB_URI.includes('127.0.0.1')) {
                devWarnings.push('Using local MongoDB - ensure this is intentional for development');
            }

            if (devWarnings.length > 0) {
                devWarnings.forEach(warning => logger.info(`ℹ️  ${warning}`));
            }
        }

        // Log environment summary (without exposing secrets)
        logger.info(`🔧 Environment: ${env.NODE_ENV}`);
        logger.info(`🔌 Port: ${env.PORT}`);
        logger.info(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
        logger.info(`🔒 Trust Proxy: ${env.TRUST_PROXY}`);
        logger.info(`🛡️  Rate Limiting: ${env.ENABLE_RATE_LIMITING}`);
        logger.info(`🔐 CSP Enabled: ${env.ENABLE_CSP}`);

        return env;
    } catch (err) {
        if (err instanceof zod.ZodError) {
            logger.error('❌ Invalid environment variables:');
            err.errors.forEach(error => {
                logger.error(`  - ${error.path.join('.')}: ${error.message}`);
            });
        } else {
            logger.error('❌ Configuration error:', err.message);
        }
        process.exit(1);
    }
};

module.exports = validateEnv();
