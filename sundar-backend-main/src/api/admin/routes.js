const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('./middleware/auth');
const upload = require('./middleware/upload');
const { login: loginRateLimiter } = require('../../utils/rate-limiter');

// Import controllers
const { login, logout, checkStatus, refreshToken } = require('./controllers/authController');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkPriceUpdate,
  importProducts,
  searchBySize
} = require('./controllers/productController');
const {
  getAllInquiries,
  updateInquiryStatus,
  deleteInquiry,
  createInquiry,
  sendInquiryReply,
  exportInquiries
} = require('./controllers/inquiryController');
const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getUserStats
} = require('./controllers/userController');
const {
  getDashboardStats,
  getSizeDistribution,
  getPriceRange,
  filterProductsBySize,
  getInquiriesByLocation,
  getInquiriesByCompany,
  getTopViewedProducts,
  getInquiryTrends,
  getPopularCategories,
  getMostInquiredProducts
} = require('./controllers/analyticsController');
const {
  getProductSizeAnalytics
} = require('./controllers/productAnalyticsController');
const {
  getCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById
} = require('./controllers/categoryController');
const {
  getAllWishlists,
  getWishlistStats,
  getWishlistByUser,
  getMostWishedProducts
} = require('./controllers/wishlistController');
const {
  getSettings,
  updateSettings,
  uploadImage: uploadSettingsImage
} = require('./controllers/settingsController');


// Auth routes
router.get('/status', authenticateToken, checkStatus);
router.post('/login', loginRateLimiter, login);
router.post('/logout', authenticateToken, logout);
router.post('/refresh-token', refreshToken); // No auth required - uses refresh token in body

// Product routes
router.get('/products', authenticateToken, authorizeAdmin, getAllProducts);
router.get('/products/:id', authenticateToken, authorizeAdmin, getProductById);
router.post('/products', authenticateToken, authorizeAdmin, upload.array('images', 5), createProduct);
router.put('/products/:id', authenticateToken, authorizeAdmin, upload.array('images', 5), updateProduct);
router.delete('/products/:id', authenticateToken, authorizeAdmin, deleteProduct);
router.post('/products/bulk-price-update', authenticateToken, authorizeAdmin, bulkPriceUpdate);
router.post('/products/import', authenticateToken, authorizeAdmin, upload.single('file'), importProducts);
router.get('/products/search-by-size', authenticateToken, authorizeAdmin, searchBySize);

// Catalog routes
const { getActiveCatalog, uploadCatalogPDF, setCatalogUrl, uploadPdf } = require('./controllers/catalogController');
router.get('/catalog', authenticateToken, authorizeAdmin, getActiveCatalog);
router.post('/catalog/upload', authenticateToken, authorizeAdmin, uploadPdf, uploadCatalogPDF);
router.post('/catalog/url', authenticateToken, authorizeAdmin, setCatalogUrl);

// Category routes
router.get('/categories', getCategories); // Public - for frontend
router.get('/categories/all', authenticateToken, authorizeAdmin, getAllCategories); // Admin only
router.post('/categories', authenticateToken, authorizeAdmin, upload.single('categoryImage'), createCategory);
router.get('/categories/:id', authenticateToken, authorizeAdmin, getCategoryById);
router.put('/categories/:id', authenticateToken, authorizeAdmin, upload.single('categoryImage'), updateCategory);
router.delete('/categories/:id', authenticateToken, authorizeAdmin, deleteCategory);

// Inquiry routes
router.post('/inquiries', createInquiry); // Public - for frontend users
router.get('/inquiries/export', authenticateToken, authorizeAdmin, exportInquiries);
router.get('/inquiries', authenticateToken, authorizeAdmin, getAllInquiries);
router.put('/inquiries/:id/status', authenticateToken, authorizeAdmin, updateInquiryStatus);
router.put('/inquiries/:id/reply', authenticateToken, authorizeAdmin, sendInquiryReply);
router.delete('/inquiries/:id', authenticateToken, authorizeAdmin, deleteInquiry);

// User management routes
router.get('/users', authenticateToken, authorizeAdmin, getAllUsers);
router.get('/users/:id', authenticateToken, authorizeAdmin, getUserById);
router.patch('/users/:id/status', authenticateToken, authorizeAdmin, updateUserStatus);
router.patch('/users/:id/role', authenticateToken, authorizeAdmin, updateUserRole);
router.delete('/users/:id', authenticateToken, authorizeAdmin, deleteUser);
router.get('/users/stats', authenticateToken, authorizeAdmin, getUserStats);

// Wishlist routes
router.get('/wishlists', authenticateToken, authorizeAdmin, getAllWishlists);
router.get('/wishlists/stats', authenticateToken, authorizeAdmin, getWishlistStats);
router.get('/wishlists/user/:userId', authenticateToken, authorizeAdmin, getWishlistByUser);
router.get('/wishlists/most-wished', authenticateToken, authorizeAdmin, getMostWishedProducts);

// Analytics routes
router.get('/stats', authenticateToken, authorizeAdmin, getDashboardStats);
router.get('/stats/inquiries-by-location', authenticateToken, authorizeAdmin, getInquiriesByLocation);
router.get('/stats/inquiries-by-company', authenticateToken, authorizeAdmin, getInquiriesByCompany);
router.get('/stats/top-viewed-products', authenticateToken, authorizeAdmin, getTopViewedProducts);
router.get('/stats/inquiry-trends', authenticateToken, authorizeAdmin, getInquiryTrends);
router.get('/stats/popular-categories', authenticateToken, authorizeAdmin, getPopularCategories);
router.get('/stats/most-inquired-products', authenticateToken, authorizeAdmin, getMostInquiredProducts);
router.get('/products/analytics/size-distribution', authenticateToken, authorizeAdmin, getSizeDistribution);
router.get('/products/analytics/price-range', authenticateToken, authorizeAdmin, getPriceRange);
router.get('/products/filter/by-size', authenticateToken, authorizeAdmin, filterProductsBySize);

// 🎯 NEW: Analytics endpoints (alternative paths)
router.get('/analytics/inquiries/location', authenticateToken, authorizeAdmin, getInquiriesByLocation);
router.get('/analytics/inquiries/company', authenticateToken, authorizeAdmin, getInquiriesByCompany);
router.get('/analytics/products/top-viewed', authenticateToken, authorizeAdmin, getTopViewedProducts);
router.get('/analytics/inquiries/trends', authenticateToken, authorizeAdmin, getInquiryTrends);
router.get('/analytics/categories/popular', authenticateToken, authorizeAdmin, getPopularCategories);

// 📊 Product Size Analytics
router.get('/analytics/products/size-details', authenticateToken, authorizeAdmin, getProductSizeAnalytics);

// ⚙️ Site Settings routes
router.get('/settings', authenticateToken, authorizeAdmin, getSettings);
router.put('/settings', authenticateToken, authorizeAdmin, updateSettings);
router.post('/settings/upload', authenticateToken, authorizeAdmin, upload.single('file'), uploadSettingsImage);

module.exports = router;
