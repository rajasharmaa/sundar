const express = require('express');
const router = express.Router();
const { createInquiry } = require('../controllers/inquiryController');

// Public inquiry submission
router.post('/inquiries', createInquiry);

module.exports = router;