"use strict";
// ❤️ WISHLIST ROUTES
// Express routes for wishlist management
const express = require('express');
const { requireUserAuth } = require('../../middleware/auth');
const { getWishlist, addToWishlist, removeFromWishlist, checkWishlistStatus } = require('./controller');
const router = express.Router();
// 🔐 All wishlist routes require authentication
router.use(requireUserAuth);
// 🔄 Main wishlist operations
router.route('/')
    .get(getWishlist) // GET /api/v1/wishlist - Get user's wishlist
    .post(addToWishlist); // POST /api/v1/wishlist - Add product to wishlist
// 🎯 Specific product operations
router.route('/:productId')
    .delete(removeFromWishlist); // DELETE /api/v1/wishlist/:productId - Remove from wishlist
router.route('/check/:productId')
    .get(checkWishlistStatus); // GET /api/v1/wishlist/check/:productId - Check wishlist status
module.exports = router;
