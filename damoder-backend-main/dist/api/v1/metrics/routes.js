"use strict";
// 📊 METRICS ROUTES
// Route definitions for metrics endpoints
const express = require('express');
const { requireAdminAuth } = require('../../middleware/auth');
const metricsController = require('./controller');
const router = express.Router();
// Public health check
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'Damodar Traders API'
    });
});
// Admin-only detailed metrics
router.get('/stats', requireAdminAuth, metricsController.getMetrics);
module.exports = router;
