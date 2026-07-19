"use strict";
// 🔐 ENTERPRISE-GRADE JWT CONFIGURATION
// Standardized configuration for secure authentication system
const config = require('./env');
// 🔐 JWT TOKEN CONFIGURATION
const JWT_CONFIG = {
    // Access Token Settings (Short-lived)
    ACCESS_TOKEN: {
        SECRET: config.JWT_ACCESS_SECRET,
        EXPIRES_IN: config.JWT_ACCESS_EXPIRY || '15m', // 15 minutes
        ALGORITHM: 'HS256'
    },
    // Refresh Token Settings (Long-lived)
    REFRESH_TOKEN: {
        SECRET: config.JWT_REFRESH_SECRET,
        EXPIRES_IN: config.JWT_REFRESH_EXPIRY || '7d', // 7 days
        ALGORITHM: 'HS256'
    },
    // Token Metadata
    ISSUER: 'damodar-traders-auth',
    AUDIENCE: config.FRONTEND_URL || 'http://localhost:5173',
    // Security Settings
    ALLOW_INVALID_ASYMMETRIC_KEY_TYPES: false,
    IGNORE_EXPIRATION: false,
    IGNORE_NOT_BEFORE: false
};
// 🔐 TOKEN EXPIRY UTILITIES
const parseExpiry = (expiryString) => {
    if (typeof expiryString === 'number')
        return expiryString;
    const match = expiryString.match(/^([0-9]+)([smhd])$/);
    if (!match)
        throw new Error(`Invalid expiry format: ${expiryString}`);
    const [, value, unit] = match;
    const numValue = parseInt(value);
    switch (unit) {
        case 's': return numValue * 1000;
        case 'm': return numValue * 60 * 1000;
        case 'h': return numValue * 60 * 60 * 1000;
        case 'd': return numValue * 24 * 60 * 60 * 1000;
        default: throw new Error(`Unknown time unit: ${unit}`);
    }
};
// 🔐 TOKEN VALIDATION
const validateJwtConfig = () => {
    const errors = [];
    if (!JWT_CONFIG.ACCESS_TOKEN.SECRET) {
        errors.push('JWT_ACCESS_SECRET is required');
    }
    if (!JWT_CONFIG.REFRESH_TOKEN.SECRET) {
        errors.push('JWT_REFRESH_SECRET is required');
    }
    if (errors.length > 0) {
        throw new Error(`JWT Configuration Errors: ${errors.join(', ')}`);
    }
    return true;
};
module.exports = {
    JWT_CONFIG,
    parseExpiry,
    validateJwtConfig
};
