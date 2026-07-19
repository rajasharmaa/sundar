"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
// Note: Require-style imports are used to maintain compatibility with JS controller and middleware
const { register, login, refreshToken, getStatus, logout } = require('../controllers/auth.controller.coldstart');
const { authenticate } = require('../middleware/auth.middleware.coldstart');
const router = (0, express_1.Router)();
exports.router = router;
// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
// Protected routes
router.get('/status', authenticate, getStatus);
exports.default = router;
