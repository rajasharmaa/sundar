"use strict";
// 🔁 REFRESH TOKEN MODEL
// Mongoose schema for secure refresh token management
const { Schema } = require('mongoose');
const refreshTokenSchema = new Schema({
    // 👤 User Reference
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // 🔐 Token Security
    tokenHash: {
        type: String,
        required: true,
        unique: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    // ⏰ Expiration
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // Automatic TTL index
    },
    // 🔄 Revocation Status
    revoked: {
        type: Boolean,
        default: false
    },
    // 📅 Usage Tracking
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUsedAt: {
        type: Date,
        default: Date.now
    },
    // 🔒 Security Context
    securityContext: {
        ip: String,
        ipHash: String,
        userAgentHash: String,
        forwardedFor: String,
        forwardedProto: String,
        cfRay: String,
        country: String
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.__v;
            delete ret.tokenHash; // Never expose the token hash
            ret.id = ret._id.toString();
            delete ret._id;
            return ret;
        }
    }
});
// 🔍 Indexes for performance and security
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ sessionId: 1 });
refreshTokenSchema.index({ revoked: 1 });
refreshTokenSchema.index({ expiresAt: 1 });
module.exports = refreshTokenSchema;
