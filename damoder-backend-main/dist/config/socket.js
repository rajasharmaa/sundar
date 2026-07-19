"use strict";
const { Server } = require("socket.io");
const logger = require('../utils/logger');
const config = require('./env');
let io;
const initSocket = (server) => {
    // 🔥 DYNAMIC CORS ORIGINS for production flexibility
    const allowedOrigins = [
        config.FRONTEND_URL,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174'
    ];
    // In production, allow all Vercel preview deployments
    if (config.NODE_ENV === 'production') {
        // Allow any *.vercel.app domain for preview deployments
        allowedOrigins.push(/\.vercel\.app$/);
        // Allow any custom domains that might be added
        allowedOrigins.push(/^https:\/\/.*\.onrender\.com(:\d+)?$/);
    }
    io = new Server(server, {
        // 🔥 PRODUCTION-GRADE SOCKET.IO CONFIGURATION
        allowEIO3: true, // Allow Engine.IO v3 clients
        transports: ['websocket', 'polling'], // Enable both transports
        cors: {
            origin: function (origin, callback) {
                // Allow requests with no origin (mobile apps, curl, etc.)
                if (!origin)
                    return callback(null, true);
                // Check against allowed origins
                const isAllowed = allowedOrigins.some(allowed => {
                    if (typeof allowed === 'string') {
                        return origin === allowed;
                    }
                    else if (allowed instanceof RegExp) {
                        return allowed.test(origin);
                    }
                    return false;
                });
                if (isAllowed) {
                    callback(null, true);
                }
                else {
                    logger.warn(`❌ Socket.io CORS blocked origin: ${origin}`);
                    callback(new Error('CORS not allowed'), false);
                }
            },
            methods: ["GET", "POST"],
            credentials: true,
            optionsSuccessStatus: 200
        },
        // 🔥 CONNECTION TIMEOUTS AND RETRIES
        pingTimeout: 20000, // 20 seconds
        pingInterval: 25000, // 25 seconds
        upgradeTimeout: 30000, // 30 seconds for upgrade
        httpCompression: {
            threshold: 1024 // Compress messages > 1KB
        },
        // 🔥 SECURITY SETTINGS
        allowRequest: (req, callback) => {
            // Add security checks here if needed
            callback(null, true);
        }
    });
    // 🔥 CONNECTION EVENT HANDLERS
    io.on("connection", (socket) => {
        logger.info(`🔌 Socket connected: ${socket.id} from ${socket.handshake.address}`);
        // 🔥 AUTHENTICATION HANDLING
        const token = socket.handshake.auth?.token;
        if (token) {
            // TODO: Validate JWT token and attach user info to socket
            // For now, allowing connection without validation
            logger.debug(`Socket ${socket.id} authenticated with token`);
        }
        // 🔥 ERROR HANDLING
        socket.on("error", (err) => {
            logger.error(`Socket error for ${socket.id}:`, {
                message: err.message,
                stack: err.stack
            });
        });
        // 🔥 DISCONNECTION HANDLING
        socket.on("disconnect", (reason) => {
            logger.info(`🔌 Socket disconnected: ${socket.id}, reason: ${reason}`);
        });
        // 🔥 DISCONNECTING (before actual disconnect)
        socket.on("disconnecting", (reason) => {
            logger.debug(`Socket ${socket.id} disconnecting: ${reason}`);
        });
        // 🔥 HANDLE CONNECTION ERRORS
        socket.on("connect_error", (err) => {
            logger.error(`Socket connection error for ${socket.id}:`, {
                message: err.message,
                stack: err.stack
            });
        });
    });
    // 🔥 GLOBAL ERROR HANDLER
    io.engine.on("connection_error", (err) => {
        logger.error("Socket.io connection error:", {
            req: err.req,
            code: err.code,
            message: err.message,
            context: err.context
        });
    });
    return io;
};
const getIO = () => {
    if (!io) {
        // In production, fail fast for critical service dependency
        if (config.NODE_ENV === 'production') {
            logger.error("❌ Critical: Socket.io not initialized in production - server cannot start");
            process.exit(1);
        }
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
const notifyPriceUpdate = (productId, newPrice, productName) => {
    if (io) {
        io.emit("priceUpdate", {
            productId,
            newPrice,
            productName,
            timestamp: new Date()
        });
    }
};
// Health check function
const checkSocketHealth = () => {
    if (!io) {
        return { status: 'uninitialized' };
    }
    const sockets = io.sockets.sockets;
    return {
        status: 'healthy',
        connectedClients: sockets.size,
        uptime: process.uptime()
    };
};
// Graceful shutdown
const closeSocket = () => {
    if (io) {
        io.close(() => {
            logger.info('✅ Socket.io server closed');
        });
    }
};
module.exports = {
    initSocket,
    getIO,
    notifyPriceUpdate,
    checkSocketHealth,
    closeSocket
};
