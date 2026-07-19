"use strict";
// 📊 PRODUCT SPECIFICATION MODEL
// Separate collection for technical specifications to reduce Product document size
const { Schema } = require('mongoose');
const productSpecificationSchema = new Schema({
    // 🔗 Product Reference
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    // 📝 Specification Details
    key: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
        index: true
    },
    value: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    unit: {
        type: String,
        trim: true,
        maxlength: 50
    },
    // 🏷️ Specification Category/Group
    group: {
        type: String,
        trim: true,
        maxlength: 100,
        index: true,
        default: 'General'
    },
    // 📊 Display Properties
    order: {
        type: Number,
        default: 0,
        min: 0
    },
    visible: {
        type: Boolean,
        default: true,
        index: true
    },
    searchable: {
        type: Boolean,
        default: true,
        index: true
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
// Indexes for efficient filtering and searching
productSpecificationSchema.index({ productId: 1, group: 1, order: 1 });
productSpecificationSchema.index({ key: 1, value: 1 }, { sparse: true });
productSpecificationSchema.index({ 'key': 'text', 'value': 'text' });
module.exports = productSpecificationSchema;
