const express = require('express');
const { requireAdminAuth } = require('../../middleware/auth');
const uploadMiddleware = require('../../middleware/upload.middleware');
const controller = require('./controller');

const router = express.Router();

// Public routes
router.get('/', controller.getSettings);

// Admin-only routes
router.put('/', requireAdminAuth, controller.updateSettings);
router.post('/upload', requireAdminAuth, uploadMiddleware, controller.uploadImage);

module.exports = router;
