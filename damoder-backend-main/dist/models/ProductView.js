"use strict";
// 👁️ PRODUCT VIEW MODEL
// Track product views for analytics
const { Schema } = require('mongoose');
const productViewSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        index: true
    },
    visitorId: {
        type: String,
        required: false,
        trim: true,
        maxlength: 100
    },
    ipAddress: {
        type: String,
        required: false,
        trim: true
    },
    duration: {
        type: Number,
        default: 0,
        min: 0
    },
    source: {
        type: String,
        required: false,
        enum: ['direct', 'google', 'social', 'referral', 'internal'],
        default: 'direct'
    },
    device: {
        type: String,
        required: false,
        enum: ['mobile', 'tablet', 'desktop'],
        default: 'desktop'
    },
    browser: {
        type: String,
        required: false,
        trim: true
    },
    os: {
        type: String,
        required: false,
        trim: true
    },
    city: {
        type: String,
        required: false,
        trim: true
    },
    state: {
        type: String,
        required: false,
        trim: true
    },
    country: {
        type: String,
        required: false,
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
// Indexes for analytics queries
productViewSchema.index({ productId: 1, createdAt: -1 });
productViewSchema.index({ userId: 1, createdAt: -1 });
productViewSchema.index({ city: 1, createdAt: -1 });
productViewSchema.index({ country: 1, createdAt: -1 });
module.exports = productViewSchema;
