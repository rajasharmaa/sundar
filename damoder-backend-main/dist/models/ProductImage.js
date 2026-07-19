"use strict";
// 🖼️ PRODUCT IMAGE MODEL
// Separate collection for managing product images with multiple variants
const { Schema } = require('mongoose');
const productImageSchema = new Schema({
    // 🔗 Product Reference
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    // 📝 Image Metadata
    alt: {
        type: String,
        trim: true,
        maxlength: 200
    },
    caption: {
        type: String,
        trim: true,
        maxlength: 300
    },
    // 🎯 Image Variants (CDN URLs)
    variants: {
        thumbnail: {
            url: String,
            width: Number,
            height: Number,
            size: Number, // in bytes
            publicId: String
        },
        small: {
            url: String,
            width: Number,
            height: Number,
            size: Number,
            publicId: String
        },
        medium: {
            url: String,
            width: Number,
            height: Number,
            size: Number,
            publicId: String
        },
        large: {
            url: String,
            width: Number,
            height: Number,
            size: Number,
            publicId: String
        },
        original: {
            url: String,
            width: Number,
            height: Number,
            size: Number,
            publicId: String
        }
    },
    // 📊 Display Properties
    order: {
        type: Number,
        default: 0,
        min: 0
    },
    isPrimary: {
        type: Boolean,
        default: false,
        index: true
    },
    // 🏷️ Status
    active: {
        type: Boolean,
        default: true,
        index: true
    },
    // 📈 Analytics
    views: {
        type: Number,
        default: 0
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
// Indexes for efficient queries
productImageSchema.index({ productId: 1, order: 1 });
productImageSchema.index({ productId: 1, isPrimary: 1 });
productImageSchema.index({ createdAt: -1 });
module.exports = productImageSchema;
