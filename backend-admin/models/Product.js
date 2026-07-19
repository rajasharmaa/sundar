const mongoose = require('mongoose');

// 📏 Size Options Schema with Dual-Tier Pricing
const sizeOptionSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
    trim: true
  },
  // Dual-tier pricing as per Damodar Traders price list
  price_100_percent: {
    type: Number,
    required: true,
    min: 0
  },
  price_50_percent: {
    type: Number,
    required: true,
    min: 0
  },
  availability: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 0
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: false,
    default: ''
  },
  imagePublicId: {
    type: String
  },
  // Multiple images support
  images: [{
    url: String,
    publicId: String,
    order: Number
  }],
  category: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    trim: true,
    default: ''
  },
  productCode: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  description: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  // 💰 Pricing - DEPRECATED: Use sizeOptions with dual-tier pricing instead
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // 📏 Size Options with Dual-Tier Pricing (NEW)
  sizeOptions: {
    type: [sizeOptionSchema],
    required: true,
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'At least one size option is required'
    }
  },
  material: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  pressureRating: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  temperatureRange: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  standards: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  application: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  // Specifications (Flexible Map structure)
  specifications: {
    type: Map,
    of: String
  },
  // Featured product flag
  featured: {
    type: Boolean,
    default: false
  },
  // Price range cache for faster queries (calculated from dual-tier pricing)
  minPrice: {
    type: Number,
    default: 0
  },
  maxPrice: {
    type: Number,
    default: 0
  },
  // Price tracking
  priceUpdatedAt: {
    type: Date,
    default: null
  },
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  wishlistCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text', material: 'text', brand: 'text' });
productSchema.index({ productCode: 1 });
productSchema.index({ 'sizeOptions.size': 1 });

// Pre-save middleware to calculate price range from dual-tier pricing
productSchema.pre('save', function (next) {
  if (this.sizeOptions && this.sizeOptions.length > 0) {
    const prices = this.sizeOptions.map(s => s.price_100_percent);
    this.minPrice = Math.min(...prices);
    this.maxPrice = Math.max(...prices);
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);