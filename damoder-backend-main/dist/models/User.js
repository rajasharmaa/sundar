"use strict";
// 🗄️ USER MODEL
// Mongoose schema for user management with enterprise-grade security
const { Schema } = require('mongoose');
const userSchema = new Schema({
    // 🔐 Authentication Fields
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false // Never return password in queries
    },
    passwordVersion: {
        type: Number,
        default: 1
    },
    // 👤 Profile Information
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
    avatar: {
        type: String,
        default: ''
    },
    // 🔒 Security & Metadata
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    lastLoginAt: {
        type: Date
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    // 📅 Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    // 👁️ Recently Viewed Products (for product discovery)
    recentlyViewed: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            },
            viewedAt: {
                type: Date,
                default: Date.now
            }
        }]
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.__v;
            ret.id = ret._id.toString();
            delete ret._id;
            return ret;
        }
    }
});
// 🔐 Virtual for account lock status
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});
// 🔐 Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
    // if we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }
    // otherwise we're incrementing
    const updates = { $inc: { loginAttempts: 1 } };
    // lock the account if we've reached max attempts and it's not locked already
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }
    return this.updateOne(updates);
};
// 🔐 Instance method to reset login attempts
userSchema.methods.resetAttempts = function () {
    return this.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 }
    });
};
// 🔍 DATABASE INDEXING FOR OPTIMAL PERFORMANCE
// Essential unique indexes
userSchema.index({ email: 1 }, { unique: true, name: 'email_unique' });
// Authentication and security indexes
userSchema.index({ isActive: 1, emailVerified: 1 }, { name: 'auth_status' });
userSchema.index({ role: 1, isActive: 1 }, { name: 'role_active' });
// Login security indexes
userSchema.index({ loginAttempts: 1, lockUntil: 1 }, { name: 'security_lockout' });
// Activity-based indexes
userSchema.index({ lastLoginAt: -1 }, { name: 'recent_logins' });
userSchema.index({ createdAt: -1 }, { name: 'newest_users' });
// Composite indexes for common query patterns
userSchema.index({
    role: 1,
    isActive: 1,
    createdAt: -1
}, { name: 'role_active_recent' });
userSchema.index({
    emailVerified: 1,
    isActive: 1,
    lastLoginAt: -1
}, { name: 'verified_active_login' });
// Index for recently viewed products (keep only last 20)
userSchema.index({ 'recentlyViewed.viewedAt': -1 }, { name: 'recently_viewed' });
module.exports = userSchema;
