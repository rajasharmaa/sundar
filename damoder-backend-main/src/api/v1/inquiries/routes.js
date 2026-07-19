// 📨 INQUIRIES ROUTES
// Route definitions for inquiry endpoints

const express = require('express');
const { validate } = require('../../middleware/validate');
const { requireUserAuth, requireAdminAuth } = require('../../middleware/auth');
const { verifyRecaptcha } = require('../../middleware/recaptcha');
const uploadMiddleware = require('../../middleware/upload.middleware');

const inquiriesController = require('./controller');

const router = express.Router();

// Log all incoming requests for debugging
router.use((req, res, next) => {
  console.log(`[INQUIRY_ROUTE] ${req.method} ${req.path}`, {
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {}),
    hasUser: !!req.user,
    requestId: req.requestId
  });
  next();
});

// Public routes - allow both authenticated and anonymous submissions
router.post('/', uploadMiddleware, verifyRecaptcha('contact'), inquiriesController.createInquiry);

// Protected routes - require authentication (for getting user's own inquiries)
router.get('/user', requireUserAuth, inquiriesController.getUserInquiries);

// Admin routes
router.get('/export', requireAdminAuth, inquiriesController.exportInquiries);
router.get('/:id/attachment', requireAdminAuth, inquiriesController.getInquiryAttachment);
router.get('/', requireAdminAuth, inquiriesController.getAllInquiries);
router.get('/:id', requireAdminAuth, inquiriesController.getInquiryById);
router.patch('/:id/status', requireAdminAuth, inquiriesController.updateInquiryStatus);
router.post('/:id/notes', requireAdminAuth, inquiriesController.addAdminNote);
router.delete('/:id', requireAdminAuth, inquiriesController.deleteInquiry);

module.exports = router;