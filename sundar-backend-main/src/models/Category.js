// 📁 CATEGORY MODEL
// Mongoose schema for product categories

const { Schema } = require('mongoose');

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  icon: {
    type: String,
    required: false,
    default: 'Package', // Default Lucide icon name
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true,
    maxlength: 500
  },
  longDescription: {
    type: String,
    maxlength: 10000
  },
  features: [{ type: String }],
  manufacturingSteps: [{
    title: { type: String },
    description: { type: String }
  }],
  specsTable: {
    headers: [{ type: String }],
    rows: [[{ type: String }]]
  },
  materialComposition: [{
    label: { type: String },
    value: { type: String }
  }],
  faqs: [{
    q: { type: String },
    a: { type: String }
  }],
  finishes: [{ type: String }],
  applications: [{ type: String }],
  heroImage: { type: String },
  
  // 🌲 Hierarchical Category Structure
  parentCategory: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: false,
    default: null,
    index: true
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 5, // Max 5 levels deep
    index: true
  },
  ancestors: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  
  // 📊 Ordering & Display
  order: {
    type: Number,
    default: 0,
    min: 0,
    index: true
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  productCount: {
    type: Number,
    default: 0
  },
  
  // 🏷️ SEO Fields
  metaTitle: {
    type: String,
    trim: true,
    maxlength: 200
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: 300
  },
  
  // 🖼️ Category Image
  image: {
    type: String,
    trim: true
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

// Indexes for performance and hierarchical queries
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parentCategory: 1, level: 1, order: 1 });
categorySchema.index({ active: 1, level: 1, order: 1 });
categorySchema.index({ ancestors: 1 }, { sparse: true });
categorySchema.index({ 'metaTitle': 'text', 'description': 'text' });

module.exports = categorySchema;
