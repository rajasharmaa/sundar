// ❤️ WISHLIST MODEL
// Mongoose schema for user wishlists with optimal performance

const { Schema } = require('mongoose');

const wishlistSchema = new Schema({
  // 👤 User reference
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // 🛒 Product reference
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  
  // 📅 Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.__v;
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    }
  }
});

// 🔍 COMPREHENSIVE INDEXING FOR OPTIMAL PERFORMANCE

// Primary composite index for user wishlist queries
wishlistSchema.index({ userId: 1, createdAt: -1 }, { name: 'user_wishlist_recent' });

// Unique constraint to prevent duplicate wishlist items
wishlistSchema.index({ userId: 1, productId: 1 }, { 
  unique: true, 
  name: 'user_product_unique' 
});

// Product-based queries (for analytics)
wishlistSchema.index({ productId: 1, createdAt: -1 }, { name: 'product_popularity' });

module.exports = wishlistSchema;