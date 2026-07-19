"use strict";
const mongoose = require('mongoose');
const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN_SUCCESS', 'LOGIN_FAILED', 'REGISTER', 'PASSWORD_RESET',
            'PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED',
            'INQUIRY_STATUS_CHANGED', 'SETTINGS_UPDATED'
        ]
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    userEmail: {
        type: String,
        default: null
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        default: null
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILURE', 'WARNING'],
        default: 'SUCCESS'
    }
}, { timestamps: true });
// Indexes for faster querying in the admin dashboard
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ ipAddress: 1 });
module.exports = mongoose.model('AuditLog', auditLogSchema);
