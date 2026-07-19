"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InquiryService = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const secure_error_handler_1 = require("../utils/secure-error-handler");
const validation_1 = require("../utils/validation");
const mongodb_1 = require("mongodb");
const database_1 = require("../config/database");
// Import queue manager dynamically to avoid potential circular dependency during cold start initialization
let queueManager = null;
try {
    queueManager = require('../config/queue').queueManager;
}
catch (e) {
    logger_1.default.warn('Failed to load queue manager in inquiry service', e);
}
class InquiryService {
    inquiryRepository;
    productRepository;
    constructor(inquiryRepository, productRepository) {
        this.inquiryRepository = inquiryRepository;
        this.productRepository = productRepository;
    }
    async createInquiry(user, body, clientData) {
        const { subject, message, phone, productId, productName, companyName, businessName, pageSource, email, name, selectedSize, priceType, sizePrice100, sizePrice50, productCode } = body;
        // Validate inputs
        if (!subject || typeof subject !== 'string' || subject.trim().length < 5) {
            throw secure_error_handler_1.createError.validation('Subject must be at least 5 characters. Please provide a meaningful subject for your inquiry.');
        }
        if (!message || typeof message !== 'string' || message.trim().length < 10) {
            throw secure_error_handler_1.createError.validation('Message must be at least 10 characters. Please provide more details about your inquiry.');
        }
        // Sanitize inputs
        const sanitizedSubject = (0, validation_1.sanitizeInput)(subject.trim().substring(0, 200));
        const sanitizedMessage = (0, validation_1.sanitizeInput)(message.trim().substring(0, 2000));
        const sanitizedPhone = phone ? (0, validation_1.sanitizeInput)(phone.trim().substring(0, 20)) : '';
        const rawCompanyName = companyName || businessName || '';
        const sanitizedCompanyName = rawCompanyName ? (0, validation_1.sanitizeInput)(rawCompanyName.trim().substring(0, 200)) : '';
        const sanitizedPageSource = pageSource ? (0, validation_1.sanitizeInput)(pageSource.trim().substring(0, 500)) : '';
        const sanitizedEmail = email ? (0, validation_1.sanitizeInput)(email.trim().substring(0, 254)) : '';
        const sanitizedName = name ? (0, validation_1.sanitizeInput)(name.trim().substring(0, 100)) : '';
        // Normalize customerType
        const rawCustomerType = body.customerType || body.businessType;
        let customerType = 'retail';
        if (rawCustomerType) {
            const bt = rawCustomerType.toLowerCase();
            if (bt.includes('retail')) {
                customerType = 'retail';
            }
            else if (bt.includes('wholesale') || bt.includes('wholesaler')) {
                customerType = 'wholesaler';
            }
            else if (bt.includes('manufacturer') || bt.includes('industrial')) {
                customerType = 'manufacturer';
            }
            else if (bt.includes('contractor') || bt.includes('construction') || bt.includes('real estate')) {
                customerType = 'contractor';
            }
            else if (bt.includes('trader')) {
                customerType = 'trader';
            }
            else if (['retail', 'wholesaler', 'manufacturer', 'contractor', 'trader', 'other'].includes(bt)) {
                customerType = bt;
            }
            else {
                customerType = 'other';
            }
        }
        // Normalize source
        const rawSource = body.source || 'website';
        let source = 'website';
        if (rawSource) {
            const src = rawSource.toLowerCase();
            if (['website', 'google', 'social_media', 'reference'].includes(src)) {
                source = src;
            }
        }
        const read = body.read !== undefined ? !!body.read : false;
        // Verify product
        let verifiedProductName = productName;
        if (productId && mongodb_1.ObjectId.isValid(productId)) {
            try {
                const product = await this.productRepository.findById(productId);
                if (product) {
                    verifiedProductName = product.name;
                }
            }
            catch (err) {
                logger_1.default.warn('Failed to verify product in inquiry service:', { productId, error: err.message });
            }
        }
        const finalInquiryData = {
            email: '',
            name: '',
            userId: null
        };
        if (user && user.id) {
            finalInquiryData.userId = new mongodb_1.ObjectId(user.id);
            finalInquiryData.email = user.email || '';
            finalInquiryData.name = user.name || '';
        }
        else {
            if (!sanitizedName || sanitizedName.length < 2) {
                throw secure_error_handler_1.createError.validation('Full Name is required and must be at least 2 characters');
            }
            if (!sanitizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
                throw secure_error_handler_1.createError.validation('Valid Email is required');
            }
            finalInquiryData.email = sanitizedEmail;
            finalInquiryData.name = sanitizedName;
        }
        const inquiry = {
            ...finalInquiryData,
            phone: sanitizedPhone,
            subject: sanitizedSubject,
            message: sanitizedMessage,
            productId: productId && mongodb_1.ObjectId.isValid(productId) ? new mongodb_1.ObjectId(productId) : null,
            productName: verifiedProductName || '',
            companyName: sanitizedCompanyName,
            pageSource: sanitizedPageSource || 'Unknown',
            productCode: productCode || '',
            selectedSize: selectedSize || '',
            priceType: priceType || '100',
            sizePrice100: sizePrice100 || 0,
            sizePrice50: sizePrice50 || 0,
            customerType,
            source,
            read,
            ...clientData,
            status: 'new',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        let insertedId = '';
        const session = database_1.client.startSession();
        try {
            await session.withTransaction(async () => {
                insertedId = await this.inquiryRepository.create(inquiry, { session });
                if (productId && mongodb_1.ObjectId.isValid(productId)) {
                    const updated = await this.productRepository.updateOne(productId, { $inc: { inquiryCount: 1 } }, { session });
                    if (!updated) {
                        throw new Error(`Failed to update inquiry count for product ${productId}`);
                    }
                }
            });
            logger_1.default.info('✅ Inquiry and product count increment transaction committed successfully:', {
                inquiryId: insertedId,
                productId
            });
        }
        catch (txError) {
            logger_1.default.error('❌ Inquiry transaction failed, rolled back:', txError);
            throw secure_error_handler_1.createError.internal('Failed to submit inquiry due to a database transaction error');
        }
        finally {
            await session.endSession();
        }
        // Send notification to admin (non-blocking)
        setImmediate(async () => {
            try {
                if (!queueManager) {
                    try {
                        queueManager = require('../config/queue').queueManager;
                    }
                    catch (e) { }
                }
                if (!queueManager) {
                    logger_1.default.warn('Queue manager not initialized, skipping email notification');
                    return;
                }
                const emailQueue = queueManager.emailQueue;
                if (emailQueue) {
                    await emailQueue.add('admin-notification', {
                        to: process.env.ADMIN_EMAIL || 'admin@damoder.com',
                        subject: `New Inquiry: ${sanitizedSubject}`,
                        html: `
              <h3>New Customer Inquiry</h3>
              <p><strong>Name:</strong> ${finalInquiryData.name}</p>
              <p><strong>Email:</strong> ${finalInquiryData.email}</p>
              <p><strong>Phone:</strong> ${sanitizedPhone || 'Not provided'}</p>
              <p><strong>Company:</strong> ${sanitizedCompanyName || 'Not provided'}</p>
              <p><strong>Location:</strong> ${clientData.city || 'Unknown'}, ${clientData.country || 'Unknown'}</p>
              <p><strong>Product:</strong> ${verifiedProductName || 'General inquiry'}</p>
              ${selectedSize ? `<p><strong>Selected Size:</strong> ${selectedSize}</p>` : ''}
              ${priceType ? `<p><strong>Price Type:</strong> ${priceType === '100' ? 'Standard (100%)' : 'Wholesale (50%)'}</p>` : ''}
              <p><strong>Subject:</strong> ${sanitizedSubject}</p>
              <p><strong>Message:</strong></p>
              <p>${sanitizedMessage}</p>
            `,
                        templateType: 'admin-inquiry-notification'
                    });
                }
            }
            catch (notificationErr) {
                logger_1.default.warn('Failed to send inquiry notification:', {
                    error: notificationErr.message
                });
            }
        });
        return {
            success: true,
            message: 'Inquiry received',
            id: insertedId,
            inquiryId: insertedId
        };
    }
    async getUserInquiries(userId, email) {
        return this.inquiryRepository.findByUserIdOrEmail(userId, email);
    }
    async getAllInquiries() {
        return this.inquiryRepository.findAll();
    }
    async getInquiryById(id) {
        const inquiry = await this.inquiryRepository.findById(id);
        if (!inquiry) {
            throw secure_error_handler_1.createError.notFound('Inquiry not found');
        }
        return inquiry;
    }
    async updateInquiryStatus(id, status) {
        const statusMap = {
            'pending': 'in-progress',
            'completed': 'resolved'
        };
        const validStatuses = ['new', 'in-progress', 'resolved', 'closed'];
        const mappedStatus = statusMap[status] || status;
        if (!validStatuses.includes(mappedStatus)) {
            throw secure_error_handler_1.createError.badRequest(`Status must be one of: ${validStatuses.join(', ')}`);
        }
        const success = await this.inquiryRepository.updateOne(id, {
            $set: {
                status: mappedStatus,
                updatedAt: new Date()
            }
        });
        if (!success) {
            throw secure_error_handler_1.createError.notFound('Inquiry not found');
        }
        return true;
    }
    async addAdminNote(id, note, addedBy) {
        if (!note || note.trim().length < 1) {
            throw secure_error_handler_1.createError.badRequest('Note is required');
        }
        const success = await this.inquiryRepository.updateOne(id, {
            $push: {
                adminNotes: {
                    note: (0, validation_1.sanitizeInput)(note.trim()),
                    addedBy,
                    addedAt: new Date()
                }
            },
            $set: {
                updatedAt: new Date()
            }
        });
        if (!success) {
            throw secure_error_handler_1.createError.notFound('Inquiry not found');
        }
        return true;
    }
    async deleteInquiry(id) {
        const success = await this.inquiryRepository.deleteOne(id);
        if (!success) {
            throw secure_error_handler_1.createError.notFound('Inquiry not found');
        }
        return true;
    }
}
exports.InquiryService = InquiryService;
