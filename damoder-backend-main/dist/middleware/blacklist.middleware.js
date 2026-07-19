"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBlacklist = void 0;
// Require config/redis directly to avoid circular dependency in ESM/CJS interop
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = __importDefault(require("../utils/logger"));
let redisClient = null;
try {
    redisClient = require('../config/redis').redisClient;
}
catch (e) {
    logger_1.default.warn('Failed to load redis client in blacklist middleware', e);
}
const hashToken = (token) => crypto_1.default.createHash('sha256').update(token).digest('hex');
const checkBlacklist = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken ||
            req.headers.authorization?.replace('Bearer ', '') ||
            null;
        if (!token) {
            return next();
        }
        if (!redisClient || !redisClient.isOpen) {
            // Redis offline, fail open to avoid service disruption
            return next();
        }
        const tokenHash = hashToken(token);
        const isBlacklisted = await redisClient.get(`blacklist:token:${tokenHash}`);
        if (isBlacklisted) {
            logger_1.default.warn('🚫 Attempted to use a blacklisted JWT token:', {
                tokenHash: tokenHash.substring(0, 16) + '...',
                ip: req.ip
            });
            res.status(401).json({
                success: false,
                message: 'Token has been revoked/logged out',
                code: 'TOKEN_REVOKED'
            });
            return;
        }
        next();
    }
    catch (error) {
        logger_1.default.error('Error checking JWT blacklist:', error);
        next(); // Fail open
    }
};
exports.checkBlacklist = checkBlacklist;
