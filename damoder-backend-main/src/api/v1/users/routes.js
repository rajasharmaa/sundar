// 👤 USERS ROUTES
// Route definitions for user endpoints

const express = require('express');
const { validate } = require('../../middleware/validate');
const { requireUserAuth } = require('../../middleware/auth');

const usersController = require('./controller');

const router = express.Router();

// Protected routes - require authentication
router.get('/me', requireUserAuth, usersController.getProfile);
router.get('/profile', requireUserAuth, usersController.getProfile);
router.put('/profile', requireUserAuth, usersController.updateProfile);

// Recently viewed products routes
router.post('/recently-viewed', requireUserAuth, usersController.trackRecentlyViewed);
router.get('/recently-viewed', requireUserAuth, usersController.getRecentlyViewed);
router.delete('/recently-viewed', requireUserAuth, usersController.clearRecentlyViewed);

module.exports = router;