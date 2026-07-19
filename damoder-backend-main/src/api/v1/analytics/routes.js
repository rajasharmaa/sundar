// 📊 ANALYTICS ROUTES
// Admin analytics endpoints

const express = require('express');
const router = express.Router();
const { requireUserAuth, requireAdminAuth } = require('../../middleware/auth');
const analyticsController = require('../../../controllers/analytics.controller');

// Track view (also available in products routes - public/user)
router.post('/track-view/:id', analyticsController.trackProductView);

// All other routes require admin authentication
router.use(requireAdminAuth);

// Dashboard overview
router.get('/dashboard', analyticsController.getDashboardAnalytics);

// Specific analytics
router.get('/products', analyticsController.getProductAnalytics);
router.get('/views', analyticsController.getViewAnalytics);
router.get('/inquiries', analyticsController.getInquiryAnalytics);
router.get('/conversion', analyticsController.getConversionRate);
router.get('/search', analyticsController.getSearchAnalytics);

module.exports = router;
