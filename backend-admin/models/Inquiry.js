const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  // Product Reference
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  productName: {
    type: String,
    trim: true
  },
  productCode: {
    type: String,
    trim: true
  },
  selectedSize: {
    type: String,
    trim: true
  },
  sizePrice: {
    type: Number,
    min: 0
  },
  totalEstimatedValue: {
    type: Number,
    default: 0
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false
    },
    productName: { type: String, trim: true },
    productCode: { type: String, trim: true },
    quantity: { type: Number, default: 1 },
    selectedSize: { type: String, trim: true },
    priceType: { type: String, enum: ['100', '50'], default: '100' },
    unitPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 }
  }],
  // Business Information
  companyName: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  gstNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  customerType: {
    type: String,
    enum: ['retail', 'wholesaler', 'manufacturer', 'contractor', 'trader', 'other'],
    default: 'retail'
  },
  source: {
    type: String,
    enum: ['website', 'google', 'social_media', 'reference'],
    default: 'website'
  },
  // Location Data (Auto-detected)
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  // Device & Browser Info
  deviceType: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop'],
    default: 'desktop'
  },
  browser: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  // Page Source
  pageSource: {
    type: String,
    trim: true
  },
  // Status & Tracking
  status: {
    type: String,
    enum: ['new', 'pending', 'in-progress', 'completed', 'resolved', 'closed'],
    default: 'new'
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  leadQuality: {
    type: String,
    enum: ['hot', 'warm', 'cold'],
    default: 'warm',
    index: true
  },
  contactedAt: {
    type: Date,
    required: false
  },
  replyMessage: {
    type: String,
    trim: true
  },
  replySubject: {
    type: String,
    trim: true
  },
  repliedAt: {
    type: Date
  },
  contactNotes: {
    type: String,
    trim: true
  },
  attachmentUrl: {
    type: String,
    trim: true
  },
  attachmentName: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
inquirySchema.index({ status: 1 });
inquirySchema.index({ read: 1 });
inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ city: 1 });
inquirySchema.index({ companyName: 1 });
inquirySchema.index({ leadQuality: 1 });
inquirySchema.index({ productId: 1 });
inquirySchema.index({ productCode: 1 });
inquirySchema.index({ selectedSize: 1 });

module.exports = mongoose.model('Inquiry', inquirySchema);