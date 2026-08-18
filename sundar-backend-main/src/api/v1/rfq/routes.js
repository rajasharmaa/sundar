const express = require('express');
const router = express.Router();
const { getRfqCart, syncRfqCart } = require('./controller');
const { requireUserAuth } = require('../../middleware/auth');

// Require auth for all RFQ routes
router.use(requireUserAuth);

// GET /api/v1/rfq - Get user's RFQ cart
router.get('/', getRfqCart);

// POST /api/v1/rfq/sync - Sync frontend RFQ cart to backend
router.post('/sync', syncRfqCart);

module.exports = router;
