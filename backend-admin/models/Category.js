const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
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
    trim: true
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
  // Category Image (Cloudinary)
  categoryImage: {
    type: String,
    required: false,
    default: ''
  },
  categoryImagePublicId: {
    type: String,
    required: false
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false,
    default: null
  },
  order: {
    type: Number,
    default: 0,
    min: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  productCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
categorySchema.index({ slug: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ active: 1, order: 1 });

module.exports = mongoose.model('Category', categorySchema);
