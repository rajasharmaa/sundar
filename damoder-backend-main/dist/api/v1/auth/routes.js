"use strict";
// 🔐 AUTH ROUTES
// Route definitions for authentication endpoints
const express = require('express');
const { validate } = require('../../middleware/validate');
const { requireUserAuth } = require('../../middleware/auth');
const { verifyRecaptcha } = require('../../middleware/recaptcha');
const { auditLog } = require('../../middleware/audit.middleware');
const { login: authLimiter } = require('../../../utils/rate-limiter');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } = require('./schema');
const authController = require('./controller');
const router = express.Router();
// Public routes
router.post('/register', verifyRecaptcha('register'), validate(registerSchema), auditLog('REGISTER'), authController.register);
router.post('/login', authLimiter, verifyRecaptcha('login'), validate(loginSchema), auditLog('LOGIN_SUCCESS'), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/status', authController.getStatus);
router.get('/health', authController.getHealth);
router.post('/forgot-password', authLimiter, verifyRecaptcha('forgot_password'), validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.get('/check-email', authController.checkEmail);
router.get('/google', authLimiter, authController.initiateGoogleOAuth);
router.get('/google/callback', authController.handleGoogleCallback);
router.post('/google', authLimiter, authController.googleLogin);
// Protected routes
router.post('/change-password', requireUserAuth, validate(changePasswordSchema), authController.changePassword);
module.exports = router;
