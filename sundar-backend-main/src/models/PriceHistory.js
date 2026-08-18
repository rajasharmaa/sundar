// 💰 PRICE HISTORY MODEL
// Track all price changes for products

const { Schema } = require('mongoose');

const priceHistorySchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  oldPrice: {
    type: Number,
    required: true,
    min: 0
  },
  newPrice: {
    type: Number,
    required: true,
    min: 0
  },
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  reason: {
    type: String,
    required: false,
    trim: true,
    maxlength: 200
  },
  changedAt: {
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

// Compound index for efficient queries
priceHistorySchema.index({ productId: 1, changedAt: -1 });

module.exports = priceHistorySchema;
