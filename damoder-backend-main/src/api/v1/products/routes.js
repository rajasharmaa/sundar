// 🛒 PRODUCTS ROUTES
// Route definitions for product endpoints

const express = require('express');
const { validate } = require('../../middleware/validate');
const { requireUserAuth, requireAdminAuth } = require('../../middleware/auth');

const productsController = require('./controller');

const router = express.Router();

// Public routes
router.get('/popular', productsController.getPopularProducts);
router.get('/search/suggestions', productsController.getSearchSuggestions);
router.get('/search', productsController.searchProducts);
router.get('/category/:category/popular', productsController.getPopularInCategory);
router.get('/:id/related', productsController.getRelatedProducts);
router.get('/category/:category', productsController.getProductsByCategory);
router.get('/slug/:slug', productsController.getProductBySlug); // SEO-friendly slug lookup
router.get('/:id', productsController.getProductById);
router.post('/:id/view', productsController.trackProductView); // Track product views
router.get('/', productsController.getProducts);

// Admin routes (require authentication)
router.post('/bulk-price-update', requireAdminAuth, productsController.bulkPriceUpdate);

module.exports = router;