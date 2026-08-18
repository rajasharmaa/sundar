// 📁 MODELS REGISTRATION
// Centralized model registration for the application

const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Import schemas
const userSchema = require('./User');
const productSchema = require('./Product');
const inquirySchema = require('./Inquiry');
const refreshTokenSchema = require('./RefreshToken');
const wishlistSchema = require('./Wishlist');
const categorySchema = require('./Category');

// Register models with proper names
const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Inquiry = mongoose.model('Inquiry', inquirySchema);
const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
const Wishlist = mongoose.model('Wishlist', wishlistSchema);
const Category = mongoose.model('Category', categorySchema);

logger.info('✅ All models registered successfully');

// Export models for use in controllers
const Catalog = require('./Catalog');
const WishlistItem = require('./WishlistItem');

module.exports = {
  User,
  Product,
  Inquiry,
  RefreshToken,
  Wishlist,
  Category,
  Catalog,
  WishlistItem
};
