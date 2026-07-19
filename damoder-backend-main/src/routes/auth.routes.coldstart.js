/**
 * 🔥 COLD-START SAFE AUTH ROUTES
 * 
 * Authentication routes using cold-start safe controllers
 */

const express = require('express');
const { register, login, refreshToken, getStatus, logout } = require('../controllers/auth.controller.coldstart');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware.coldstart');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Protected routes
router.get('/status', authenticate, getStatus);

module.exports = router;