// 🛒 PRODUCT MODEL
// Mongoose schema for product management

const { Schema } = require('mongoose');

// 📏 Size Options Schema with Dual-Tier Pricing
const sizeOptionSchema = new Schema({
  size: {
    type: String,
    required: true,
    trim: true
  },
  // Dual-tier pricing as per Sundar Corporation price list
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

// Dynamic Content Schemas
const benefitSchema = new Schema({
  title: { type: String, required: true },
  desc: { type: String },
  image: { type: String }
});

const industrySchema = new Schema({
  name: { type: String, required: true },
  desc: { type: String },
  image: { type: String }
});

const faqSchema = new Schema({
  q: { type: String, required: true },
  a: { type: String, required: true }
});

const productSchema = new Schema({
  // 📝 Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    // ✅ M2-3 FIX: Removed inline 'index: true' — explicit productSchema.index({ slug: 1 }) below handles this
    maxlength: 300
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  brand: {
    type: String,
    trim: true,
    maxlength: 100,
    index: true
  },
  modelNumber: {
    type: String,
    trim: true,
    maxlength: 100
  },

  // 💰 Pricing - DEPRECATED: Use sizeOptions with dual-tier pricing instead
  price: {
    type: Number,
    default: 0,
    min: 0,
    index: true
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
    index: true
  },
  // 🔧 M2-2 FIX: Added minPrice/maxPrice to schema so pre-save hook values are persisted.
  // Previously these fields were set in the pre-save hook but NOT defined in schema,
  // causing Mongoose strict mode to silently drop them.
  minPrice: { type: Number, default: 0, min: 0, index: true },
  maxPrice: { type: Number, default: 0, min: 0, index: true },

  // 📏 Size Options with Dual-Tier Pricing (NEW)
  sizeOptions: [sizeOptionSchema],

  // Editorial Dynamic Fields
  benefits: [benefitSchema],
  industries: [industrySchema],
  faqs: [faqSchema],
  customizationTypes: [{ type: String }],
  manufacturingProcess: { type: String },
  materialComposition: { type: String },
  printingDetails: { type: String },

  // 🖼️ Media & UI
  themeColor: {
    type: String,
    trim: true,
    default: '#08131F'
  },
  image: {
    type: String,
    required: true
  },
  // Multiple images support
  images: [{
    url: String,
    publicId: String,
    order: Number,
    alt: String,
    size: Number,
    width: Number,
    height: Number
  }],

  // 🔗 External Links (for affiliate products)
  external: {
    type: Boolean,
    default: false
  },
  affiliateLink: {
    type: String,
    trim: true
  },

  // ⭐ Ratings & Reviews
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    index: true
  },
  reviews: {
    type: Number,
    default: 0,
    min: 0
  },

  // 📦 Packaging Specifications
  material: { type: String, trim: true, maxlength: 100 },
  bagType: { type: String, trim: true, maxlength: 100 },
  capacity: { type: String, trim: true, maxlength: 100 },
  size: { type: String, trim: true, maxlength: 100 },
  dimensions: { type: String, trim: true, maxlength: 100 },
  gsm: { type: String, trim: true, maxlength: 100 },
  color: { type: String, trim: true, maxlength: 100 },
  printingType: { type: String, trim: true, maxlength: 100 },
  lamination: { type: String, trim: true, maxlength: 100 },
  packagingApplication: { type: String, trim: true, maxlength: 100 },
  moq: { type: String, trim: true, maxlength: 100 },

  // 📦 Inventory
  inStock: {
    type: Boolean,
    default: true,
    index: true
  },

  // 🏷️ Status & Visibility
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },

  // 📊 Specifications (Flexible Map structure)
  specifications: {
    type: Map,
    of: String
  },

  // 🏷️ Tags for enhanced search
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],

  // 📈 Analytics
  views: {
    type: Number,
    default: 0,
    index: true
  },
  inquiryCount: {
    type: Number,
    default: 0,
    index: true
  },
  wishlistCount: {
    type: Number,
    default: 0
  },

  // 💹 Price Tracking
  priceUpdatedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    }
  }
});

// Pre-save middleware to calculate min/max prices from dual-tier pricing
productSchema.pre('save', function () {
  if (this.sizeOptions && this.sizeOptions.length > 0) {
    // Calculate min and max prices across all sizes (using 100% price as reference)
    const prices = this.sizeOptions.map(s => s.price_100_percent);
    this.price = Math.min(...prices); // Keep old field for backward compatibility
    this.minPrice = Math.min(...prices);
    this.maxPrice = Math.max(...prices);
  }
});

// Index for size-based queries with dual pricing
productSchema.index({ 'sizeOptions.size': 1 });
productSchema.index({ 'sizeOptions.price_100_percent': 1 });
productSchema.index({ 'sizeOptions.price_50_percent': 1 });

// 🔍 ENHANCED INDEXING STRATEGY FOR 100K+ PRODUCTS

// Text search index for product discovery (optimized weights)
productSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  brand: 'text',
  tags: 'text'
}, {
  name: 'product_text_search',
  weights: {
    name: 10,      // Highest boost for exact name matches
    brand: 8,      // High boost for brand matches
    category: 5,   // Medium boost for category
    tags: 3,       // Lower boost for tags
    description: 2 // Lowest boost for description
  }
});

// Slug-based lookups (SEO URLs)
productSchema.index({ slug: 1 }, { unique: true });

// SKU-based lookups
productSchema.index({ sku: 1 }, { unique: true, sparse: true });

// Category-based queries with sorting
productSchema.index({ category: 1, active: 1, createdAt: -1 }, { name: 'category_active_created' });
productSchema.index({ category: 1, active: 1, name: 1 }, { name: 'category_active_name' });

// Price-based filtering and sorting
productSchema.index({ price: 1, active: 1 }, { name: 'price_active' });
productSchema.index({ category: 1, price: 1, active: 1 }, { name: 'category_price_filter' });

// Recent products and trending
productSchema.index({ createdAt: -1, active: 1 }, { name: 'recent_active' });

// Rating-based sorting
productSchema.index({ rating: -1, reviews: -1, active: 1 }, { name: 'rating_reviews_active' });
productSchema.index({ category: 1, rating: -1, active: 1 }, { name: 'category_rating_sort' });

// Stock status queries
productSchema.index({ inStock: 1, active: 1 }, { name: 'stock_status' });

// Discounted products
productSchema.index({ discount: -1, active: 1 }, { name: 'discounted_products' });

// Featured products
productSchema.index({ featured: 1, active: 1 }, { name: 'featured_active' });

// Analytics indexes
productSchema.index({ views: -1, active: 1 }, { name: 'most_viewed' });
productSchema.index({ inquiryCount: -1, active: 1 }, { name: 'most_inquired' });
productSchema.index({ wishlistCount: -1, active: 1 }, { name: 'most_wishlisted' });

// Brand-based queries
productSchema.index({ brand: 1, active: 1 }, { name: 'brand_active' });
productSchema.index({ brand: 1, category: 1, active: 1 }, { name: 'brand_category_active' });

// Tags-based discovery
productSchema.index({ tags: 1, active: 1 }, { name: 'tags_active' });

// Composite indexes for complex filtering
productSchema.index({
  category: 1,
  brand: 1,
  price: 1,
  active: 1
}, { name: 'category_brand_price_filter' });

productSchema.index({
  category: 1,
  inStock: 1,
  rating: -1,
  active: 1
}, { name: 'category_stock_rating' });

// Index for specification searches (sparse since not all products have specs)
productSchema.index({ 'specifications.material': 1 }, { sparse: true, background: true });
productSchema.index({ 'specifications.size': 1 }, { sparse: true, background: true });

module.exports = productSchema;