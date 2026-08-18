const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index to prevent duplicates
wishlistItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('WishlistItem', wishlistItemSchema, 'wishlists');
