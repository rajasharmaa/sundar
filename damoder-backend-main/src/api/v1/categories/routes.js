// 📂 CATEGORIES ROUTES

const express = require('express');
const categoriesController = require('./controller');

const router = express.Router();

// Public routes
router.get('/', categoriesController.getAllCategories);
router.get('/:category/products', categoriesController.getProductsByCategory);

module.exports = router;
