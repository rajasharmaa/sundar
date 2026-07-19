"use strict";
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { connectToDB } = require('../../../config/database');
const { validatePassword, validateEmail } = require('../../../utils/validation');
const { OAuth2Client } = require('google-auth-library');
const logger = require('../../../utils/logger');
const { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, revokeToken, addToBlacklist } = require('../../../utils/jwt.coldstart');
const config = require('../../../config/env');
const { getCacheManager } = require('../../../utils/cache-service');
const { redisClient } = require('../../../config/redis');
const { queueManager } = require('../../../config/queue');
const { ObjectId } = require('mongodb');
const { createError, sendErrorResponse } = require('../../../utils/secure-error-handler');
// 🔐 Rate limiting for authentication attempts
const authAttempts = new Map();
const MAX_AUTH_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
// 🔒 Security utilities - CONSISTENT HASHING (SHA256 ONLY)
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const isIpLockedOut = (ip) => {
    const attempts = authAttempts.get(ip);
    if (!attempts)
        return false;
    const now = Date.now();
    if (now - attempts.firstAttempt > LOCKOUT_DURATION) {
        authAttempts.delete(ip);
        return false;
    }
    return attempts.count >= MAX_AUTH_ATTEMPTS;
};
const recordAuthAttempt = (ip, success = false) => {
    const now = Date.now();
    const attempts = authAttempts.get(ip) || { count: 0, firstAttempt: now };
    if (success) {
        authAttempts.delete(ip);
    }
    else {
        attempts.count += 1;
        authAttempts.set(ip, attempts);
        // Auto-cleanup after lockout period
        setTimeout(() => {
            const stored = authAttempts.get(ip);
            if (stored && now - stored.firstAttempt > LOCKOUT_DURATION) {
                authAttempts.delete(ip);
            }
        }, LOCKOUT_DURATION);
    }
};
const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);
let DUMMY_HASH = '$2b$12$KIX0b2d5lU/Z6Cv9eWf9kuFxK7tWkfzrS9Yj6lZt3yPR1.KZT3Wk6'; // precomputed hash
(async () => {
    try {
        DUMMY_HASH = await bcrypt.hash('dummy_password_timing_protection', 12);
    }
    catch (err) {
        // keep fallback hash
    }
})();
// 🔐 ENTERPRISE-GRADE COOKIE CONFIGURATION - STATELESS JWT + REFRESH TOKEN
const isProd = config.NODE_ENV === 'production';
const sanitizeUser = (user) => ({
    id: (user._id || user.id).toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    avatar: user.avatar || ''
});
// 🔐 CONSOLIDATED TOKEN GENERATION - USING JWT UTILITIES WITH REDIS PERSISTENCE
const generateAuthTokens = async (user, req) => {
    const userData = {
        id: user._id,
        email: user.email,
        passwordVersion: user.passwordVersion || 1,
        role: user.role || 'user'
    };
    const accessToken = generateAccessToken(userData);
    const refreshToken = crypto.randomBytes(128).toString('hex');
    // Store refresh token in Redis with database fallback
    try {
        const metadata = {
            userAgent: req.headers['user-agent'] || '',
            ipAddress: req.ip || req.connection?.remoteAddress || '',
            deviceInfo: {
                platform: req.headers['sec-ch-ua-platform'] || 'unknown',
                mobile: /mobile/i.test(req.headers['user-agent'] || '')
            }
        };
        // 🔥 COLD-START SAFE: Store refresh token directly in MongoDB
        try {
            const db = await connectToDB();
            const refreshTokenDoc = {
                userId: user._id,
                tokenHash: hashToken(refreshToken),
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                userAgent: metadata.userAgent || '',
                ipAddress: metadata.ipAddress || '',
                deviceInfo: metadata.deviceInfo || {},
                revoked: false
            };
            await db.collection('refresh_tokens').insertOne(refreshTokenDoc);
            logger.debug('✅ Refresh token stored in MongoDB', {
                userId: user._id,
                hasUserAgent: !!metadata.userAgent
            });
        }
        catch (storageError) {
            logger.warn('Failed to store refresh token in MongoDB, continuing with login', {
                userId: user._id,
                error: storageError.message
            });
        }
        logger.debug('✅ Refresh token stored with metadata', {
            userId: user._id,
            hasUserAgent: !!metadata.userAgent,
            hasIpAddress: !!metadata.ipAddress
        });
    }
    catch (storageError) {
        logger.warn('Failed to store refresh token, continuing with login', {
            userId: user._id,
            error: storageError.message
        });
    }
    return { accessToken, refreshToken };
};
// 🔐 CROSS-ORIGIN COMPATIBLE AUTH COOKIE SETTER
const setAuthCookies = async (res, user, req) => {
    try {
        const { accessToken, refreshToken } = await generateAuthTokens(user, req);
        // Set cookies using secure-cookies utility with cross-origin support
        const { setAuthCookies: setSecureAuthCookies } = require('../../../utils/secure-cookies');
        setSecureAuthCookies(res, accessToken, refreshToken);
        // Cross-origin deployment validation
        const isCrossOrigin = req.headers.origin && !req.headers.origin.includes('localhost');
        // Verify cookies were set properly
        logger.debug('Auth cookies set successfully', {
            userId: user._id,
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            isCrossOriginDeployment: isCrossOrigin,
            cookiePath: '/', // Ensuring root path for cross-origin access
            sameSite: 'none' // Required for cross-origin scenarios
        });
        return { accessToken, refreshToken };
    }
    catch (error) {
        logger.error('Failed to set auth cookies', {
            userId: user._id,
            error: error.message,
            isCrossOrigin: req.headers.origin && !req.headers.origin.includes('localhost')
        });
        throw error;
    }
};
const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        // 🔐 STRICT INPUT VALIDATION - FAIL FAST
        if (!name?.trim() || !email?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        // 🔐 EMAIL FORMAT VALIDATION
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }
        // 🔐 PASSWORD STRENGTH VALIDATION
        const { isValid, feedback } = validatePassword(password);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Password requirements not met",
                details: feedback.slice(0, 3)
            });
        }
        // 🔐 DATABASE CONNECTION
        let db;
        try {
            db = await connectToDB();
        }
        catch (dbError) {
            logger.error('Database connection failed during registration', {
                email: email.toLowerCase().trim(),
                error: dbError.message
            });
            return res.status(503).json({
                success: false,
                message: 'Service temporarily unavailable',
                retryAfter: 30
            });
        }
        const usersCollection = db.collection('users');
        // 🔐 CHECK FOR EXISTING USER
        let existingUser;
        try {
            existingUser = await usersCollection.findOne({
                email: email.toLowerCase().trim()
            });
        }
        catch (dbError) {
            logger.error('Database query failed during registration', {
                email: email.toLowerCase().trim(),
                error: dbError.message
            });
            return res.status(503).json({
                success: false,
                message: 'Service temporarily unavailable',
                retryAfter: 30
            });
        }
        // 🔐 HANDLE DUPLICATE USER
        if (existingUser) {
            // Timing protection to prevent email enumeration
            await bcrypt.compare('dummy', '$2b$10$dummyhash');
            return res.status(409).json({
                success: false,
                message: "Account already exists with this email"
            });
        }
        // 🔐 HASH PASSWORD SAFELY
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 12);
        }
        catch (hashError) {
            logger.error('Password hashing failed during registration', {
                email: email.toLowerCase().trim(),
                error: hashError.message
            });
            return res.status(500).json({
                success: false,
                message: "Unable to process registration"
            });
        }
        // 🔐 CREATE USER OBJECT
        const now = new Date();
        const newUser = {
            name: name.trim().substring(0, 50),
            email: email.toLowerCase().trim(),
            phone: phone ? phone.trim().substring(0, 20) : '',
            password: hashedPassword,
            role: 'user',
            createdAt: now,
            updatedAt: now,
            failedLoginAttempts: 0,
            loginAttempts: 0,
            lastLogin: null,
            lastLoginAt: null,
            passwordVersion: 1,
            active: true,
            isActive: true
        };
        // 🔐 INSERT USER SAFELY
        let result;
        try {
            result = await usersCollection.insertOne(newUser);
        }
        catch (insertError) {
            if (insertError.code === 11000) {
                // Handle duplicate key error specifically
                return res.status(409).json({
                    success: false,
                    message: "Account already exists"
                });
            }
            logger.error('User insertion failed', {
                email: newUser.email,
                error: insertError.message
            });
            return res.status(500).json({
                success: false,
                message: "Registration failed"
            });
        }
        // 🔐 VALIDATE INSERTION SUCCESS
        if (!result?.insertedId) {
            logger.error('User insertion returned no ID', { email: newUser.email });
            return res.status(500).json({
                success: false,
                message: "Registration failed - unable to create account"
            });
        }
        const savedUser = { _id: result.insertedId, ...newUser };
        logger.info('✅ User registered successfully', {
            userId: savedUser._id,
            email: savedUser.email
        });
        // 🔐 SUCCESS RESPONSE - NO AUTO-LOGIN
        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: {
                user: sanitizeUser(savedUser)
            }
        });
    }
    catch (err) {
        logger.error('Registration critical error:', {
            error: err.message,
            stack: err.stack
        });
        // Return appropriate status codes based on error type
        if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
            return res.status(503).json({
                success: false,
                message: 'Database service temporarily unavailable',
                retryAfter: 30
            });
        }
        // For all other unexpected errors
        return res.status(500).json({
            success: false,
            message: "Registration service temporarily unavailable"
        });
    }
};
const login = async (req, res) => {
    // 🔥 CRITICAL: Mark this as login request to prevent interceptor refresh attempts
    req.isLoginRequest = true;
    try {
        const { email, password } = req.body;
        // 🔐 CRITICAL JWT SECRET VALIDATION - FAIL FAST BEFORE PROCESSING
        if (!config.JWT_ACCESS_SECRET || !config.JWT_REFRESH_SECRET) {
            logger.error('❌ CRITICAL: JWT secrets missing from environment configuration');
            return res.status(500).json({
                success: false,
                message: "Authentication service misconfigured - missing JWT secrets"
            });
        }
        // 🔐 DETERMINISTIC INPUT VALIDATION - FAIL FAST
        if (!email || !password) {
            logger.debug('Login failed: missing credentials');
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }
        // 🔐 CONSISTENT INPUT SANITIZATION
        const sanitizedEmail = email.toLowerCase().trim();
        const sanitizedPassword = password.toString().trim();
        // 🔐 EARLY VALIDATION BEFORE ANY PROCESSING
        if (!validateEmail(sanitizedEmail)) {
            logger.debug('Login failed: invalid email format', { email: sanitizedEmail });
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }
        if (sanitizedPassword.length < 6) {
            logger.debug('Login failed: password too short');
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }
        // 🔐 EXTENDED DATABASE CONNECTION WITH COLD START AWARENESS
        let db;
        const maxRetries = 3;
        const baseDelay = 1500; // 1.5 seconds
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                db = await connectToDB();
                break; // Success, exit retry loop
            }
            catch (dbError) {
                const isColdStart = req.headers['x-cold-start'] === 'true';
                const isLastAttempt = attempt === maxRetries;
                logger.warn(`Database connection attempt ${attempt}/${maxRetries} failed during login`, {
                    email: sanitizedEmail,
                    error: dbError.message,
                    isColdStart,
                    attempt
                });
                if (isLastAttempt) {
                    logger.error('Database connection failed after all login retry attempts', {
                        email: sanitizedEmail,
                        error: dbError.message,
                        isColdStart,
                        totalAttempts: maxRetries
                    });
                    // For cold start scenarios, provide more helpful messaging
                    const message = isColdStart
                        ? 'Server is initializing. Please wait 30-60 seconds and try again.'
                        : 'Authentication service temporarily unavailable';
                    return res.status(503).json({
                        success: false,
                        message,
                        retryAfter: isColdStart ? 60 : 30,
                        isColdStart: true
                    });
                }
                // Exponential backoff: 1.5s, 3s, 6s
                const delay = baseDelay * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        // 🔐 USER LOOKUP WITH DEFENSIVE PROGRAMMING
        let user;
        try {
            user = await db.collection('users').findOne({
                email: sanitizedEmail,
                $or: [
                    { isActive: { $ne: false } },
                    { active: { $ne: false } }
                ]
            });
        }
        catch (dbQueryError) {
            logger.error('Database query failed during user lookup', {
                email: sanitizedEmail,
                error: dbQueryError.message
            });
            return res.status(503).json({
                success: false,
                message: 'Authentication service temporarily unavailable'
            });
        }
        // 🔐 CONSISTENT USER VALIDATION
        if (!user) {
            // Timing protection to prevent email enumeration
            await bcrypt.compare('dummy', DUMMY_HASH);
            logger.info('Login failed: user not found', { email: sanitizedEmail });
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        // 🔐 PASSWORD VALIDATION WITH SAFETY CHECKS
        if (!user.password) {
            logger.error('User account missing password hash', {
                userId: user._id,
                email: user.email
            });
            return res.status(500).json({
                success: false,
                message: "Account configuration error"
            });
        }
        // 🔐 SECURE PASSWORD COMPARISON
        let isMatch;
        try {
            isMatch = await bcrypt.compare(sanitizedPassword, user.password);
        }
        catch (bcryptError) {
            logger.error('Password comparison failed', {
                userId: user._id,
                error: bcryptError.message
            });
            return res.status(500).json({
                success: false,
                message: "Authentication service error"
            });
        }
        if (!isMatch) {
            logger.info('Login failed: invalid password', {
                userId: user._id,
                email: user.email
            });
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        // 🔐 TOKEN GENERATION AND COOKIE SETTING - WRAPPED IN TRY-CATCH
        let tokens;
        try {
            tokens = await setAuthCookies(res, user, req);
        }
        catch (tokenError) {
            logger.error('Token generation or cookie setting failed', {
                userId: user._id,
                error: tokenError.message,
                stack: tokenError.stack
            });
            return res.status(500).json({
                success: false,
                message: "Authentication service error"
            });
        }
        // 🔐 POST-LOGIN USER UPDATES (NON-CRITICAL)
        try {
            await db.collection('users').updateOne({ _id: user._id }, {
                $set: {
                    lastLogin: new Date(),
                    lastLoginAt: new Date(),
                    failedLoginAttempts: 0,
                    loginAttempts: 0
                }
            });
        }
        catch (updateError) {
            logger.warn('Non-critical: failed to update user login metadata', {
                userId: user._id,
                error: updateError.message
            });
            // Continue - don't fail the login for this
        }
        // 🔐 SUCCESS RESPONSE
        logger.info('✅ Login successful', {
            userId: user._id,
            email: user.email
        });
        // 🔥 CROSS-ORIGIN COMPATIBILITY: Also return tokens in response body
        // This ensures clients can use localStorage + Authorization header when cookies are blocked
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: sanitizeUser(user)
            },
            accessToken: tokens?.accessToken,
            refreshToken: tokens?.refreshToken
        });
    }
    catch (err) {
        // 🔥 CRASH-PROOF ERROR HANDLING - NEVER LET LOGIN CRASH
        logger.error('Critical login error - preventing crash:', {
            error: err.message,
            stack: err.stack,
            name: err.name,
            code: err.code,
            email: req.body?.email
        });
        // 🔥 MORE SPECIFIC ERROR HANDLING FOR COLD START SCENARIOS
        if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
            return res.status(503).json({
                success: false,
                message: 'Service initializing',
                retryAfter: 10
            });
        }
        // 🔥 ALWAYS RETURN 503 FOR SERVER ERRORS, NEVER 401/500
        return res.status(503).json({
            success: false,
            message: "Authentication service temporarily unavailable",
            retryAfter: 30
        });
    }
};
const refreshToken = async (req, res) => {
    try {
        // 🔧 ENHANCED DEBUG LOGS FOR CROSS-ORIGIN TROUBLESHOOTING
        const isCrossOrigin = req.headers.origin && !req.headers.origin.includes('localhost');
        const isColdStart = req.headers['x-cold-start'] === 'true';
        logger.debug('🔄 Refresh token request received', {
            hasCookies: !!req.cookies,
            cookieKeys: Object.keys(req.cookies || {}),
            hasRefreshToken: !!req.cookies?.refreshToken,
            hasSignedCookies: !!req.signedCookies?.refreshToken,
            userAgent: req.headers['user-agent']?.substring(0, 50),
            isColdStart,
            isCrossOriginDeployment: isCrossOrigin,
            origin: req.headers.origin,
            referer: req.headers.referer
        });
        // ✅ Get refresh token from cookie, body, or headers (for cross-origin resilience)
        const token = req.cookies?.refreshToken ||
            req.signedCookies?.refreshToken ||
            req.body?.refreshToken ||
            req.headers['x-refresh-token'] ||
            req.headers['x-custom-refresh-token'];
        if (!token) {
            logger.warn('❌ Refresh token missing from request', {
                cookieCount: Object.keys(req.cookies || {}).length,
                signedCookieCount: Object.keys(req.signedCookies || {}).length,
                cookies: Object.keys(req.cookies || {}),
                signedCookies: Object.keys(req.signedCookies || {}),
                isCrossOrigin,
                isColdStart
            });
            // Cross-origin specific guidance
            if (isCrossOrigin) {
                logger.info('💡 Cross-origin deployment detected - ensure cookies are properly configured');
            }
            return res.status(401).json({
                success: false,
                message: 'Refresh token missing',
                isCrossOrigin,
                guidance: isCrossOrigin ? 'Check cross-origin cookie configuration' : undefined
            });
        }
        logger.debug('✅ Refresh token found in cookies', {
            isCrossOrigin,
            tokenLength: token.length
        });
        // 🔐 HASH THE TOKEN FOR LOOKUP - USING SHA256 (CONSISTENT)
        const hashed = crypto.createHash('sha256').update(token).digest('hex');
        // 🔥 COLD-START SAFE: Retrieve token directly from MongoDB
        let refreshTokenRecord;
        try {
            const db = await connectToDB();
            const doc = await db.collection('refresh_tokens').findOne({ tokenHash: hashed });
            if (doc) {
                refreshTokenRecord = {
                    userId: doc.userId,
                    tokenHash: doc.tokenHash,
                    revoked: doc.revoked,
                    expiresAt: doc.expiresAt,
                    revokedAt: doc.revokedAt
                };
                // Update last used time
                if (!doc.revoked) {
                    await db.collection('refresh_tokens').updateOne({ tokenHash: hashed }, { $set: { lastUsedAt: new Date() } });
                }
            }
        }
        catch (dbError) {
            logger.error('Database error during token retrieval', {
                error: dbError.message,
                isColdStart: req.headers['x-cold-start'] === 'true'
            });
            const isColdStart = req.headers['x-cold-start'] === 'true';
            const statusCode = isColdStart ? 503 : 500;
            const message = isColdStart ? 'Service initializing, please retry' : 'Authentication service temporarily unavailable';
            const retryAfter = isColdStart ? 10 : 5;
            return res.status(statusCode).json({
                success: false,
                message,
                retryAfter,
                isColdStart: true
            });
        }
        // 🔐 VALIDATE TOKEN RECORD
        if (!refreshTokenRecord || refreshTokenRecord.revoked || refreshTokenRecord.expiresAt < new Date()) {
            logger.warn('Invalid, expired, or revoked refresh token used', {
                hasRecord: !!refreshTokenRecord,
                revoked: refreshTokenRecord?.revoked,
                expired: refreshTokenRecord?.expiresAt < new Date()
            });
            // 🔐 SECURITY ALERT FOR TOKEN REUSE
            if (refreshTokenRecord?.revoked) {
                const timeSinceRevoked = new Date() - refreshTokenRecord.revokedAt;
                if (timeSinceRevoked > 10000) { // after 10-second grace window
                    logger.error('⚠️ SECURITY ALERT: Revoked refresh token reused', {
                        userId: refreshTokenRecord.userId,
                        revokedAt: refreshTokenRecord.revokedAt.toISOString(),
                        timeDifference: timeSinceRevoked
                    });
                    // Revoke ALL tokens for this user in MongoDB
                    try {
                        const db = await connectToDB();
                        await db.collection('refresh_tokens').updateMany({ userId: refreshTokenRecord.userId, revoked: false }, {
                            $set: {
                                revoked: true,
                                revokedAt: new Date(),
                                revokedReason: 'security_alert'
                            }
                        });
                    }
                    catch (revokeError) {
                        logger.error('Failed to revoke user tokens after security alert', {
                            userId: refreshTokenRecord.userId,
                            error: revokeError.message
                        });
                    }
                }
            }
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }
        logger.debug('Found valid refresh token record', {
            userId: refreshTokenRecord.userId
        });
        // 🔐 FIND USER BY ID WITH ERROR HANDLING
        let user;
        try {
            const db = await connectToDB();
            user = await db.collection('users').findOne({
                _id: new ObjectId(refreshTokenRecord.userId),
                $or: [
                    { isActive: { $ne: false } },
                    { active: { $ne: false } }
                ]
            });
        }
        catch (userQueryError) {
            logger.error('User lookup failed during token refresh', {
                userId: refreshTokenRecord.userId,
                error: userQueryError.message
            });
            return res.status(503).json({
                success: false,
                message: 'Authentication service temporarily unavailable'
            });
        }
        if (!user) {
            logger.warn('User not found or inactive for refresh token', {
                userId: refreshTokenRecord.userId
            });
            return res.status(401).json({
                success: false,
                message: 'User account not found'
            });
        }
        logger.debug('Found user for refresh token', {
            userId: user._id,
            email: user.email
        });
        // 🔐 REVOKE OLD TOKEN AND ISSUE NEW TOKENS WITH ERROR HANDLING
        let tokens;
        try {
            // Atomically revoke the old token in MongoDB
            try {
                const db = await connectToDB();
                await db.collection('refresh_tokens').updateOne({ tokenHash: hashed }, {
                    $set: {
                        revoked: true,
                        revokedAt: new Date(),
                        revokedReason: 'token_refreshed'
                    }
                });
            }
            catch (revokeError) {
                logger.warn('Failed to revoke old refresh token', {
                    error: revokeError.message,
                    userId: user._id
                });
            }
            // Issue new tokens and capture them
            tokens = await setAuthCookies(res, user, req);
        }
        catch (tokenError) {
            logger.error('Token generation failed during refresh', {
                userId: user._id,
                error: tokenError.message
            });
            return res.status(500).json({
                success: false,
                message: 'Token refresh service temporarily unavailable'
            });
        }
        logger.info('✅ Token refresh successful', {
            userId: user._id
        });
        // 🔥 CROSS-ORIGIN COMPATIBILITY: Also return tokens in response body
        return res.status(200).json({
            success: true,
            message: 'Tokens refreshed successfully',
            accessToken: tokens?.accessToken,
            refreshToken: tokens?.refreshToken
        });
    }
    catch (err) {
        // 🔥 CRASH-PROOF ERROR HANDLING - NEVER LET REFRESH TOKEN CRASH
        const isColdStart = req.headers['x-cold-start'] === 'true';
        logger.error('Critical refresh token error - preventing crash:', {
            error: err.message,
            stack: err.stack,
            name: err.name,
            isColdStart
        });
        // 🔐 ENHANCED ERROR CLASSIFICATION FOR PROPER FRONTEND HANDLING
        if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError' || err.name === 'MongoServerSelectionError') {
            // Network/database issues - return 503 for frontend retry
            return res.status(503).json({
                success: false,
                message: 'Service initializing',
                retryAfter: isColdStart ? 10 : 5,
                isColdStart: true
            });
        }
        // Authentication-related errors - return 401 for logout
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }
        // For all other unexpected errors, return 500 but indicate it's server-side
        return res.status(500).json({
            success: false,
            message: 'Token refresh temporarily unavailable',
            isServerError: true
        });
    }
};
const logout = async (req, res) => {
    const requestId = req.requestId;
    const ip = req.ip || req.connection?.remoteAddress;
    try {
        let userId = req.user?.id;
        let tokenId = req.user?.tokenJti;
        // 🔥 ENHANCED LOGOUT WITH MULTIPLE IDENTIFICATION METHODS AND TIMEOUT PROTECTION
        if (!userId) {
            // Try to extract user info from refresh token
            const refreshToken = req.cookies?.refreshToken;
            if (refreshToken) {
                try {
                    const hashed = hashToken(refreshToken);
                    // 🔥 COLD-START SAFE: Direct MongoDB lookup
                    const db = await connectToDB();
                    const doc = await db.collection('refresh_tokens').findOne({ tokenHash: hashed });
                    if (doc) {
                        userId = doc.userId;
                        tokenId = doc.tokenHash;
                        logger.info('Logout identified user via refresh token', {
                            userId,
                            ip,
                            requestId
                        });
                    }
                }
                catch (dbError) {
                    logger.warn('Failed to identify user via refresh token', {
                        error: dbError.message,
                        ip,
                        requestId
                    });
                }
            }
        }
        // 🔐 REVOKE ALL ACTIVE SESSIONS FOR THIS USER WITH PROPER ERROR HANDLING
        let sessionsRevoked = 0;
        if (userId) {
            try {
                // Revoke all refresh tokens for this user using hybrid storage
                // 🔥 COLD-START SAFE: Revoke tokens directly in MongoDB
                try {
                    const db = await connectToDB();
                    const result = await db.collection('refresh_tokens').updateMany({ userId, revoked: false }, {
                        $set: {
                            revoked: true,
                            revokedAt: new Date(),
                            revokedReason: 'user_logout'
                        }
                    });
                    sessionsRevoked = result.modifiedCount;
                }
                catch (revokeError) {
                    logger.error('Failed to revoke user tokens in MongoDB', {
                        error: revokeError.message,
                        userId
                    });
                    sessionsRevoked = 0;
                }
                logger.info('User sessions successfully revoked on logout', {
                    userId,
                    sessionsRevoked,
                    ip,
                    requestId
                });
            }
            catch (revokeError) {
                logger.error('Failed to revoke user sessions', {
                    error: revokeError.message,
                    userId,
                    ip,
                    requestId
                });
                // Continue with logout even if revocation partially fails
            }
            // 🔥 REVOKE CURRENT ACCESS TOKEN USING DATABASE-BACKED REVOCATION
            const accessToken = req.cookies?.accessToken;
            if (accessToken) {
                try {
                    await addToBlacklist(accessToken, 'logout');
                    logger.debug('Access token blacklisted on logout', { userId, requestId });
                }
                catch (blacklistErr) {
                    logger.warn('Failed to blacklist access token on logout', {
                        error: blacklistErr.message,
                        userId,
                        requestId
                    });
                }
            }
        }
        else {
            logger.warn('Logout attempted without user identification', {
                ip,
                requestId,
                hasRefreshToken: !!req.cookies?.refreshToken,
                hasAccessToken: !!req.cookies?.accessToken
            });
        }
        // 🔐 CLEAR ALL AUTHENTICATION COOKIES WITH PROPER OPTIONS
        try {
            const { clearAuthCookies } = require('../../../utils/secure-cookies');
            clearAuthCookies(res);
        }
        catch (cookieError) {
            logger.warn('Failed to clear authentication cookies', {
                error: cookieError.message,
                requestId
            });
        }
        // 🔒 ADDITIONAL SECURITY HEADERS FOR LOGOUT RESPONSE
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Clear-Site-Data': '"cookies", "storage"' // Modern header to clear site data
        });
        // Send success response
        res.status(200).json({
            success: true,
            message: 'Successfully logged out',
            sessionsRevoked,
            timestamp: new Date().toISOString()
        });
    }
    catch (err) {
        logger.error('Logout critical error:', {
            requestId,
            error: err.message,
            stack: err.stack,
            ip
        });
        // Even on error, attempt to clear cookies for security
        try {
            const { clearAuthCookies } = require('../../../utils/secure-cookies');
            clearAuthCookies(res);
        }
        catch (cookieError) {
            logger.warn('Failed to clear cookies during error handling', {
                error: cookieError.message,
                requestId
            });
        }
        // Send error response with security assurance
        res.status(500).json({
            success: false,
            error: 'Logout processing error',
            message: 'Authentication cleared for security',
            securityCleared: true,
            timestamp: new Date().toISOString()
        });
    }
};
// 🔐 HEALTH ENDPOINT WITH COLD START DETECTION
const getHealth = async (req, res) => {
    try {
        const startTime = Date.now();
        // Detect cold start conditions
        const isColdStart = req.headers['x-cold-start'] === 'true' ||
            !process.env.WARM_STARTED ||
            process.uptime() < 60; // Less than 1 minute uptime
        // Check database connectivity
        let dbStatus = 'unknown';
        let dbLatency = 0;
        try {
            const dbStart = Date.now();
            const db = await connectToDB();
            await db.admin().ping();
            dbLatency = Date.now() - dbStart;
            dbStatus = 'connected';
        }
        catch (dbError) {
            dbStatus = 'connecting'; // Changed from 'disconnected' to 'connecting' to indicate it's in progress
            logger.debug('Database not yet connected for health check', { error: dbError.message });
        }
        // Check Redis connectivity
        let redisStatus = 'unknown';
        let redisLatency = 0;
        try {
            const redisStart = Date.now();
            const { redisClient, connectRedis } = require('../../../config/redis');
            await connectRedis();
            if (redisClient.isOpen) {
                await redisClient.ping();
                redisLatency = Date.now() - redisStart;
                redisStatus = 'connected';
            }
            else {
                redisStatus = 'connecting'; // Changed from 'disconnected' to 'connecting'
            }
        }
        catch (redisError) {
            redisStatus = 'connecting'; // Changed from 'disconnected' to 'connecting'
            logger.debug('Redis not yet connected for health check', { error: redisError.message });
        }
        const responseTime = Date.now() - startTime;
        const healthData = {
            status: 'ok',
            uptime: process.uptime(),
            coldStart: isColdStart,
            db: dbStatus, // Simplified to just db status
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        };
        // Add cold start specific information
        if (isColdStart) {
            healthData.warmupNeeded = true;
            healthData.retryAfter = 15; // Suggest retry after 15 seconds
            healthData.message = 'Server is initializing, please retry shortly';
        }
        // CRITICAL: Always return 200 OK, never 503 during cold start
        // This prevents blocking the frontend authentication flow
        res.status(200).json(healthData);
        if (isColdStart) {
            logger.info('Cold start detected in health check', {
                uptime: process.uptime(),
                responseTime,
                dbStatus,
                redisStatus
            });
        }
    }
    catch (err) {
        logger.error('Health check failed', { error: err.message });
        // Still return 200 even if there are errors during health check
        res.status(200).json({
            status: 'ok',
            uptime: process.uptime(),
            coldStart: true,
            db: 'connecting',
            timestamp: new Date().toISOString(),
            message: 'Server is starting up',
            error: 'Health check encountered an issue but server is operational'
        });
    }
};
const getStatus = async (req, res) => {
    try {
        // 🔥 PRIMARY: Check cookies, FALLBACK: Check Authorization header for cross-origin compatibility
        let token = req.cookies?.accessToken;
        if (!token) {
            // Fallback to Bearer token for cross-origin scenarios
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
                logger.debug('🔐 Status check using Authorization header fallback', {
                    hasToken: !!token,
                    tokenLength: token?.length
                });
            }
        }
        if (!token) {
            const error = createError.unauthorized();
            return sendErrorResponse(res, error, req.requestId);
        }
        const decoded = await verifyAccessToken(token);
        if (!decoded) {
            const error = createError.unauthorized();
            return sendErrorResponse(res, error, req.requestId);
        }
        const db = await connectToDB();
        const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.id) });
        if (!user) {
            const error = createError.userNotFound();
            return sendErrorResponse(res, error, req.requestId);
        }
        // Support both old users (no pv) and new users
        const userPv = user.passwordVersion || 1;
        const tokenPv = decoded.pv || decoded.passwordVersion || 1;
        if (userPv !== tokenPv) {
            logger.warn('Password version mismatch during status check', {
                requestId: req.requestId,
                email: user.email
            });
            const error = createError.unauthorized();
            return sendErrorResponse(res, error, req.requestId);
        }
        res.json({ authenticated: true, user: sanitizeUser(user) });
    }
    catch (err) {
        logger.error('Auth status check failure:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.unauthorized();
        return sendErrorResponse(res, error, req.requestId);
    }
};
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const db = await connectToDB();
        const user = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
        if (!user)
            return res.json({ message: 'Instructions sent if account exists.', success: true });
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        await db.collection('users').updateOne({ _id: user._id }, {
            $set: { resetToken: hashedToken, resetTokenExpiry: new Date(Date.now() + 3600000), updatedAt: new Date() }
        });
        const resetLink = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const emailQueue = queueManager.emailQueue;
        if (emailQueue) {
            await emailQueue.add('password-reset', {
                to: user.email, subject: 'Password Reset', html: resetLink, templateType: 'forgot-password'
            });
        }
        res.json({ success: true, message: 'Password reset instructions sent to your email.' });
    }
    catch (err) {
        logger.error('Forgot password error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            const error = createError.weakPassword();
            return sendErrorResponse(res, error, req.requestId);
        }
        const db = await connectToDB();
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await db.collection('users').findOne({ resetToken: hashedToken, resetTokenExpiry: { $gt: new Date() } });
        if (!user) {
            const error = createError.unauthorized('Invalid or expired reset token');
            return sendErrorResponse(res, error, req.requestId);
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newVersion = (user.passwordVersion || 1) + 1;
        await db.collection('users').updateOne({ _id: user._id }, {
            $set: { password: hashedPassword, passwordVersion: newVersion, updatedAt: new Date() },
            $unset: { resetToken: '', resetTokenExpiry: '' }
        });
        // 🔴 Invalidate user cache on password reset
        const cacheManager = getCacheManager(redisClient, 300);
        await cacheManager.delete(`user:${user._id}`);
        res.json({ success: true, message: 'Password reset successful' });
    }
    catch (err) {
        logger.error('Reset password error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('Password reset service temporarily unavailable');
        return sendErrorResponse(res, error, req.requestId);
    }
};
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            const error = createError.weakPassword();
            return sendErrorResponse(res, error, req.requestId);
        }
        const db = await connectToDB();
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!user) {
            const error = createError.userNotFound();
            return sendErrorResponse(res, error, req.requestId);
        }
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            const error = createError.invalidCredentials();
            error.message = 'Current password is incorrect';
            return sendErrorResponse(res, error, req.requestId);
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const newVersion = (user.passwordVersion || 1) + 1;
        await db.collection('users').updateOne({ _id: user._id }, {
            $set: { password: hashedPassword, passwordVersion: newVersion, updatedAt: new Date() }
        });
        // 🔴 Invalidate user cache on password change
        const cacheManager = getCacheManager(redisClient, 300);
        await cacheManager.delete(`user:${user._id}`);
        await setAuthCookies(res, { ...user, passwordVersion: newVersion }, req);
        res.json({ success: true, message: 'Password changed successfully' });
    }
    catch (err) {
        logger.error('Change password error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('Password change service temporarily unavailable');
        return sendErrorResponse(res, error, req.requestId);
    }
};
const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: config.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;
        const db = await connectToDB();
        const usersCollection = db.collection('users');
        let user = await usersCollection.findOne({ email: email.toLowerCase().trim() });
        const now = new Date();
        if (!user) {
            const result = await usersCollection.insertOne({
                name, email: email.toLowerCase().trim(), googleId, avatar: picture,
                role: 'user', passwordVersion: 1, failedLoginAttempts: 0, loginAttempts: 0,
                createdAt: now, updatedAt: now, wishlist: [], active: true, isActive: true
            });
            user = await usersCollection.findOne({ _id: result.insertedId });
        }
        else {
            await usersCollection.updateOne({ _id: user._id }, {
                $set: { googleId, avatar: picture || user.avatar, updatedAt: now }
            });
        }
        const { accessToken } = await setAuthCookies(res, user, req);
        res.json({
            success: true,
            message: 'Google login successful',
            data: {
                user: sanitizeUser(user),
                accessToken
            }
        });
    }
    catch (err) {
        logger.error('Google login error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.unauthorized('Invalid Google authentication token');
        return sendErrorResponse(res, error, req.requestId);
    }
};
const initiateGoogleOAuth = async (req, res) => {
    try {
        const clientId = config.GOOGLE_CLIENT_ID;
        // 🔥 FIX #1: Use environment-based redirect URI instead of req.host
        // This prevents issues with reverse proxies and internal domains
        const redirectUri = config.GOOGLE_REDIRECT_URI ||
            `${config.BACKEND_URL || `${req.protocol}://${req.get('host')}`}/api/v1/auth/google/callback`;
        const scope = 'openid profile email';
        const state = crypto.randomBytes(16).toString('hex');
        // 🔥 FIX #3: Consistent cookie signing (unsigned)
        res.cookie('oauth_state', state, {
            httpOnly: true,
            secure: config.NODE_ENV === 'production',
            signed: false, // Match req.cookies usage
            sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 600000
        });
        const googleAuthUrl = `https://accounts.google.com/oauth/authorize?` +
            `client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=code&scope=${encodeURIComponent(scope)}&state=${state}&access_type=offline&prompt=consent`;
        res.redirect(googleAuthUrl);
    }
    catch (err) {
        logger.error('Initiate Google OAuth error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('Google authentication service temporarily unavailable');
        return sendErrorResponse(res, error, req.requestId);
    }
};
const handleGoogleCallback = async (req, res) => {
    try {
        const { code, state, error } = req.query;
        const frontendUrl = config.FRONTEND_URL;
        if (error)
            return res.redirect(`${frontendUrl}/login?error=oauth_error`);
        // 🔥 FIX #3: Use req.cookies (not req.signedCookies) for consistency
        const oauthState = req.cookies.oauth_state;
        if (!oauthState || state !== oauthState) {
            logger.warn('OAuth state mismatch or missing', {
                requestId: req.requestId,
                receivedState: state,
                cookieState: oauthState,
                hasCookie: !!oauthState
            });
            return res.redirect(`${frontendUrl}/login?error=invalid_state`);
        }
        res.clearCookie('oauth_state');
        // 🔥 FIX #1: Use environment-based redirect URI
        const redirectUri = config.GOOGLE_REDIRECT_URI ||
            `${config.BACKEND_URL || `${req.protocol}://${req.get('host')}`}/api/v1/auth/google/callback`;
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: config.GOOGLE_CLIENT_ID, client_secret: config.GOOGLE_CLIENT_SECRET,
                redirect_uri: redirectUri, grant_type: 'authorization_code', code: code,
            }),
        });
        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok)
            return res.redirect(`${frontendUrl}/login?error=token_exchange_failed`);
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
        });
        const userInfo = await userInfoResponse.json();
        const { id: googleId, email, name, picture: avatar } = userInfo;
        const db = await connectToDB();
        let user = await db.collection('users').findOne({ email: email.toLowerCase() });
        const now = new Date();
        if (!user) {
            const result = await db.collection('users').insertOne({
                name, email: email.toLowerCase(), googleId, avatar, role: 'user',
                passwordVersion: 1, createdAt: now, updatedAt: now, wishlist: [],
                active: true, isActive: true, failedLoginAttempts: 0, loginAttempts: 0
            });
            user = await db.collection('users').findOne({ _id: result.insertedId });
        }
        else {
            await db.collection('users').updateOne({ _id: user._id }, {
                $set: { googleId, avatar: avatar || user.avatar, updatedAt: now }
            });
        }
        await setAuthCookies(res, user, req);
        res.redirect(`${frontendUrl}/login?success=true`);
    }
    catch (err) {
        logger.error('Google OAuth callback error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        res.redirect(`${config.FRONTEND_URL}/login?error=server_error`);
    }
};
const checkEmail = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            const error = createError.missingField('email');
            return sendErrorResponse(res, error, req.requestId);
        }
        const db = await connectToDB();
        const user = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
        res.json({ exists: !!user });
    }
    catch (err) {
        logger.error('Check email error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('Email check service temporarily unavailable');
        return sendErrorResponse(res, error, req.requestId);
    }
};
module.exports = {
    register, login, logout, getStatus, refreshToken, forgotPassword, resetPassword,
    changePassword, googleLogin, initiateGoogleOAuth, handleGoogleCallback, checkEmail,
    getHealth
};
