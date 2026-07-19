// 📨 INQUIRY MODEL
// Mongoose schema for customer inquiries

const { Schema } = require('mongoose');

const inquirySchema = new Schema({
  // 👤 User Reference
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,  // Made optional to support guest inquiries
    default: null
  },

  // 📧 Contact Information
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },

  // 📝 Inquiry Details
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },

  // 🛍️ Product Reference
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  productName: {
    type: String,
    trim: true
  },
  gstNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  totalEstimatedValue: {
    type: Number,
    default: 0
  },
  products: [{
    productId: {
      type: Schema.Types.ObjectId,
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

  // 📏 Size & Price Selection (Dual-Tier Pricing)
  selectedSize: {
    type: String,
    trim: true
  },
  priceType: {
    type: String,
    enum: ['100', '50'],
    default: '100'
  },
  // Keep selectedPriceType for backward compatibility
  selectedPriceType: {
    type: String,
    enum: ['100', '50'],
    default: '100'
  },
  sizePrice100: {
    type: Number
  },
  sizePrice50: {
    type: Number
  },

  // 🏢 Business Information
  companyName: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },

  // 🌍 Location Data (Auto-detected)
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

  // 📱 Device & Browser Info
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

  // 📄 Page Source
  pageSource: {
    type: String,
    trim: true
  },

  // 🏷️ Status Tracking
  status: {
    type: String,
    enum: ['new', 'pending', 'in-progress', 'completed', 'resolved', 'closed'],
    default: 'new'
  },

  // 📞 Contact Tracking
  contactedAt: {
    type: Date,
    required: false
  },
  contactNotes: {
    type: String,
    trim: true
  },
  leadQuality: {
    type: String,
    enum: ['hot', 'warm', 'cold'],
    default: 'warm'
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
  attachmentUrl: {
    type: String,
    trim: true
  },
  attachmentName: {
    type: String,
    trim: true
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

// 🔍 Indexes for performance
inquirySchema.index({ userId: 1 });
inquirySchema.index({ status: 1 });
inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ productId: 1, selectedPriceType: 1 }); // For dual pricing analytics
inquirySchema.index({ selectedSize: 1 }); // For size-based queries

module.exports = inquirySchema;