"use strict";
const logger = require('../utils/logger');
const { ObjectId } = require('mongodb');
const { connectToDB } = require('../config/database');
const { createError, sendErrorResponse } = require('../middleware/error.handler');
const { sanitizeInput } = require('../utils/validation');
/**
 * Create new inquiry (Enhanced - Multi-Product Support)
 * POST /api/v1/inquiries
 */
const createInquiry = async (req, res) => {
    try {
        const { name, email, phone, companyName, businessName, location, products, // Array of { productId, productName, quantity, selectedSize, priceType, unitPrice }
        inquiryType, message, pageSource, city, state, country, ipAddress, deviceType, browser, userAgent, businessType, priceType: businessPriceType } = req.body;
        const user = req.user;
        const userId = user ? user.id : null;
        const inquiryName = name || user?.name;
        const inquiryEmail = email || user?.email;
        const inquiryPhone = phone || user?.phone;
        const inquiryCompanyName = businessName || companyName || (user?.companyName);
        console.log('[INQUIRY] Received request:', {
            hasUser: !!user,
            hasProducts: !!products,
            productCount: products?.length || 0,
            hasName: !!inquiryName,
            hasEmail: !!inquiryEmail,
            hasPhone: !!inquiryPhone,
            businessName,
            businessType
        });
        // Calculate total estimated value and format products (if any)
        let totalEstimatedValue = 0;
        const formattedProducts = Array.isArray(products) ? products.map(product => {
            const quantity = product.quantity || 1;
            const unitPrice = product.unitPrice || 0;
            const totalPrice = unitPrice * quantity;
            totalEstimatedValue += totalPrice;
            return {
                productId: product.productId ? new ObjectId(product.productId) : null,
                productName: product.productName ? sanitizeInput(product.productName.trim()) : '',
                productCode: product.productCode ? sanitizeInput(product.productCode.trim()) : null,
                quantity,
                selectedSize: product.selectedSize ? sanitizeInput(product.selectedSize.trim()) : null,
                priceType: product.priceType || '100',
                unitPrice,
                totalPrice
            };
        }) : [];
        // For guest users, validate name, email, and phone
        if (!user) {
            if (!inquiryName || typeof inquiryName !== 'string' || inquiryName.trim().length < 2) {
                logger.warn('Missing or invalid name from guest user');
                return sendErrorResponse(res, createError.badRequest('Name is required'), req.requestId);
            }
            if (!inquiryEmail || typeof inquiryEmail !== 'string' || !/\S+@\S+\.\S+/.test(inquiryEmail)) {
                logger.warn('Missing or invalid email from guest user');
                return sendErrorResponse(res, createError.badRequest('Valid email is required'), req.requestId);
            }
            if (!inquiryPhone || typeof inquiryPhone !== 'string' || inquiryPhone.replace(/\D/g, '').length < 10) {
                logger.warn('Missing or invalid phone from guest user');
                return sendErrorResponse(res, createError.badRequest('Valid phone number is required (minimum 10 digits)'), req.requestId);
            }
        }
        // Determine if high-value (threshold: ₹50,000)
        const isHighValue = totalEstimatedValue >= 50000;
        // Sanitize inputs
        const sanitizedName = inquiryName ? sanitizeInput(inquiryName.trim().substring(0, 100)) : '';
        const sanitizedEmail = inquiryEmail ? sanitizeInput(inquiryEmail.trim().toLowerCase().substring(0, 100)) : '';
        const sanitizedPhone = inquiryPhone ? sanitizeInput(inquiryPhone.trim().substring(0, 20)) : '';
        const sanitizedCompanyName = inquiryCompanyName ? sanitizeInput(inquiryCompanyName.trim().substring(0, 100)) : null;
        const sanitizedLocation = location ? sanitizeInput(location.trim().substring(0, 200)) : null;
        const sanitizedMessage = message ? sanitizeInput(message.trim().substring(0, 2000)) : '';
        const sanitizedPageSource = pageSource ? sanitizeInput(pageSource.trim().substring(0, 500)) : null;
        // Prepare inquiry data with timeline
        const inquiryData = {
            userId: userId ? new ObjectId(userId) : null,
            email: sanitizedEmail,
            name: sanitizedName,
            phone: sanitizedPhone,
            companyName: sanitizedCompanyName,
            businessName: sanitizedCompanyName, // Alias for frontend compatibility
            businessType: businessType ? sanitizeInput(businessType) : null,
            priceType: businessPriceType ? sanitizeInput(businessPriceType) : (formattedProducts[0]?.priceType || '100'),
            location: sanitizedLocation,
            products: formattedProducts,
            totalEstimatedValue,
            inquiryType: inquiryType || (formattedProducts.length > 1 ? 'bulk' : (formattedProducts.length === 1 ? 'single' : 'general')),
            subject: req.body.subject || `${(inquiryType || 'SINGLE').toUpperCase()} Product Inquiry - ${formattedProducts.length} item(s)`,
            message: sanitizedMessage,
            status: 'pending',
            isHighValue,
            draft: false,
            pageSource: sanitizedPageSource,
            city: city ? sanitizeInput(city.trim()) : null,
            state: state ? sanitizeInput(state.trim()) : null,
            country: country ? sanitizeInput(country.trim()) : null,
            ipAddress: ipAddress || req.ip || null,
            deviceType: deviceType || 'desktop',
            browser: browser ? sanitizeInput(browser.trim()) : null,
            userAgent: userAgent ? sanitizeInput(userAgent.trim()) : null,
            timeline: [{
                    action: 'created',
                    timestamp: new Date(),
                    details: 'Inquiry submitted by customer'
                }],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        console.log('[INQUIRY] Inserting inquiry:', {
            ...inquiryData,
            userId: userId || 'guest',
            productCount: formattedProducts.length,
            totalValue: totalEstimatedValue,
            isHighValue
        });
        const db = await connectToDB();
        const result = await db.collection('inquiries').insertOne(inquiryData);
        logger.info('Inquiry created successfully', {
            inquiryId: result.insertedId.toString(),
            userId: userId || 'guest',
            productCount: formattedProducts.length,
            totalValue: totalEstimatedValue,
            isHighValue
        });
        // Send notification for high-value inquiries
        if (isHighValue) {
            setImmediate(() => {
                try {
                    const queueManager = require('../jobs/queue.manager').queueManager;
                    const productSummary = formattedProducts.map(p => `${p.productName} (${p.quantity}x ₹${p.unitPrice})`).join(', ');
                    queueManager.initQueue('email processing').then(emailQueue => {
                        emailQueue.add('high-value-inquiry', {
                            to: process.env.ADMIN_EMAIL || 'admin@example.com',
                            subject: `🔥 HIGH VALUE INQUIRY: ₹${totalEstimatedValue.toLocaleString()}`,
                            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                  <h2 style="color: #dc2626;">🔥 High Value Inquiry Alert!</h2>
                  <p><strong>Name:</strong> ${sanitizedName}</p>
                  <p><strong>Email:</strong> ${sanitizedEmail}</p>
                  <p><strong>Phone:</strong> ${sanitizedPhone || 'Not provided'}</p>
                  <p><strong>Company:</strong> ${sanitizedCompanyName || 'Not provided'}</p>
                  <p><strong>Total Value:</strong> ₹${totalEstimatedValue.toLocaleString()}</p>
                  <p><strong>Products:</strong></p>
                  <ul>
                    ${formattedProducts.map(p => `<li>${p.productName} - Qty: ${p.quantity}, Price: ₹${p.unitPrice}</li>`).join('')}
                  </ul>
                  <p><strong>Message:</strong></p>
                  <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
                    <p>${sanitizedMessage || 'No additional message'}</p>
                  </div>
                  <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                  <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} Damodar Traders</p>
                </div>
              `
                        }, {
                            attempts: 3,
                            backoff: { type: 'exponential', delay: 2000 }
                        });
                    }).catch(err => {
                        logger.error('Failed to initialize email queue for high-value notification', { error: err.message });
                    });
                }
                catch (err) {
                    logger.error('Failed to send high-value inquiry notification', { error: err.message });
                }
            });
        }
        return res.status(201).json({
            success: true,
            message: 'Inquiry received successfully',
            data: {
                id: result.insertedId.toString(),
                totalEstimatedValue,
                isHighValue,
                productCount: formattedProducts.length
            }
        });
    }
    catch (err) {
        logger.error('Create inquiry failed:', {
            error: err.message,
            stack: err.stack,
            code: err.code,
            name: err.name,
            userId: req.user?.id || 'guest',
            requestId: req.requestId
        });
        if (err.name === 'MongoServerError' && err.code === 11000) {
            logger.warn('Duplicate inquiry detected');
            return sendErrorResponse(res, createError.conflict('Duplicate inquiry'), req.requestId);
        }
        if (err.name === 'ValidationError') {
            logger.warn('Database validation error:', err.message);
            return sendErrorResponse(res, createError.badRequest('Invalid inquiry data'), req.requestId);
        }
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Get user's inquiries
 * GET /api/v1/inquiries/user
 */
const getUserInquiries = async (req, res) => {
    try {
        const user = req.user;
        const db = await connectToDB();
        const inquiries = await db.collection('inquiries')
            .find({ userId: new ObjectId(user.id) })
            .sort({ createdAt: -1 })
            .toArray();
        const formattedInquiries = inquiries.map(inquiry => ({
            id: inquiry._id.toString(),
            subject: inquiry.subject,
            status: inquiry.status,
            createdAt: inquiry.createdAt,
            updatedAt: inquiry.updatedAt
        }));
        return res.status(200).json({
            success: true,
            data: formattedInquiries
        });
    }
    catch (err) {
        logger.error('Get user inquiries error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Get all inquiries (admin) with pagination and filtering
 * GET /api/v1/inquiries
 */
const getAllInquiries = async (req, res) => {
    try {
        const { status, startDate, endDate, search, city, company, leadQuality, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;
        const db = await connectToDB();
        const filter = {};
        // Apply filters
        if (status && status !== 'all')
            filter.status = status;
        if (city)
            filter.city = { $regex: city, $options: 'i' };
        if (company)
            filter.companyName = { $regex: company, $options: 'i' };
        if (leadQuality)
            filter.leadQuality = leadQuality;
        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        // Search by name, email, or phone
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        // Count total documents
        const total = await db.collection('inquiries').countDocuments(filter);
        // Fetch paginated results
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortField = ['totalEstimatedValue', 'createdAt', 'updatedAt'].includes(sortBy) ? sortBy : 'createdAt';
        const sortOrder = order === 'asc' ? 1 : -1;
        const inquiries = await db.collection('inquiries')
            .find(filter)
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(parseInt(limit))
            .toArray();
        return res.status(200).json({
            success: true,
            data: inquiries,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (err) {
        logger.error('Get all inquiries error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Get inquiry by ID
 * GET /api/v1/inquiries/:id
 */
const getInquiryById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return sendErrorResponse(res, createError.badRequest('Invalid inquiry ID'), req.requestId);
        }
        const db = await connectToDB();
        const inquiry = await db.collection('inquiries')
            .findOne({ _id: new ObjectId(id) });
        if (!inquiry) {
            return sendErrorResponse(res, createError.notFound('Inquiry not found'), req.requestId);
        }
        const formattedInquiry = {
            id: inquiry._id.toString(),
            userId: inquiry.userId.toString(),
            email: inquiry.email,
            name: inquiry.name,
            phone: inquiry.phone,
            subject: inquiry.subject,
            message: inquiry.message,
            status: inquiry.status,
            createdAt: inquiry.createdAt,
            updatedAt: inquiry.updatedAt
        };
        return res.status(200).json({
            success: true,
            data: formattedInquiry
        });
    }
    catch (err) {
        logger.error('Get inquiry by ID error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Update inquiry status with timeline tracking
 * PATCH /api/v1/inquiries/:id/status
 */
const updateInquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        if (!ObjectId.isValid(id)) {
            return sendErrorResponse(res, createError.badRequest('Invalid inquiry ID'), req.requestId);
        }
        const validStatuses = ['pending', 'contacted', 'converted', 'rejected', 'closed'];
        if (!status || !validStatuses.includes(status)) {
            return sendErrorResponse(res, createError.badRequest(`Status must be one of: ${validStatuses.join(', ')}`), req.requestId);
        }
        const db = await connectToDB();
        const updateData = {
            status,
            updatedAt: new Date(),
            $push: {
                timeline: {
                    action: `status_changed_to_${status}`,
                    timestamp: new Date(),
                    details: notes || `Status updated to ${status}`
                }
            }
        };
        // If marked as contacted, add contactedAt timestamp
        if (status === 'contacted') {
            updateData.$set = { contactedAt: new Date() };
        }
        const result = await db.collection('inquiries').updateOne({ _id: new ObjectId(id) }, updateData);
        if (result.matchedCount === 0) {
            return sendErrorResponse(res, createError.notFound('Inquiry not found'), req.requestId);
        }
        logger.info('Inquiry status updated', {
            inquiryId: id,
            newStatus: status,
            adminId: req.user?.id
        });
        return res.status(200).json({
            success: true,
            message: 'Status updated successfully'
        });
    }
    catch (err) {
        logger.error('Update inquiry status error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Add admin note to inquiry
 * POST /api/v1/inquiries/:id/notes
 */
const addAdminNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;
        const adminId = req.user.id;
        if (!ObjectId.isValid(id)) {
            return sendErrorResponse(res, createError.badRequest('Invalid inquiry ID'), req.requestId);
        }
        if (!note || typeof note !== 'string' || note.trim().length < 3) {
            return sendErrorResponse(res, createError.badRequest('Note must be at least 3 characters'), req.requestId);
        }
        const db = await connectToDB();
        const result = await db.collection('inquiries').updateOne({ _id: new ObjectId(id) }, {
            $push: {
                adminNotes: {
                    note: sanitizeInput(note.trim()),
                    addedBy: new ObjectId(adminId),
                    createdAt: new Date()
                },
                timeline: {
                    action: 'admin_note_added',
                    timestamp: new Date(),
                    details: 'Internal note added by admin'
                }
            },
            $set: { updatedAt: new Date() }
        });
        if (result.matchedCount === 0) {
            return sendErrorResponse(res, createError.notFound('Inquiry not found'), req.requestId);
        }
        logger.info('Admin note added', {
            inquiryId: id,
            adminId
        });
        return res.status(200).json({
            success: true,
            message: 'Note added successfully'
        });
    }
    catch (err) {
        logger.error('Add admin note error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Export inquiries to CSV
 * GET /api/v1/inquiries/export
 */
const exportInquiries = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;
        const db = await connectToDB();
        const filter = {};
        if (status && status !== 'all')
            filter.status = status;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        const inquiries = await db.collection('inquiries')
            .find(filter)
            .sort({ createdAt: -1 })
            .toArray();
        // Convert to CSV format
        const csvRows = [
            ['ID', 'Name', 'Email', 'Phone', 'Company', 'Status', 'Total Value', 'Products', 'Inquiry Type', 'Lead Quality', 'Date'].join(',')
        ];
        inquiries.forEach(inquiry => {
            const productSummary = inquiry.products && inquiry.products.length > 0
                ? inquiry.products.map(p => `${p.productName} (${p.quantity}x)`).join('; ')
                : 'N/A';
            csvRows.push([
                inquiry._id.toString(),
                `"${(inquiry.name || '').replace(/"/g, '""')}"`,
                inquiry.email || '',
                inquiry.phone || '',
                `"${(inquiry.companyName || '').replace(/"/g, '""')}"`,
                inquiry.status,
                inquiry.totalEstimatedValue || 0,
                `"${productSummary.replace(/"/g, '""')}"`,
                inquiry.inquiryType || 'single',
                inquiry.leadQuality || 'warm',
                new Date(inquiry.createdAt).toLocaleDateString()
            ].join(','));
        });
        const csvContent = '\uFEFF' + csvRows.join('\n'); // Add BOM for Excel compatibility
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=inquiries_${new Date().toISOString().split('T')[0]}.csv`);
        return res.send(csvContent);
    }
    catch (err) {
        logger.error('Export inquiries error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
/**
 * Delete inquiry
 * DELETE /api/v1/inquiries/:id
 */
const deleteInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return sendErrorResponse(res, createError.badRequest('Invalid inquiry ID'), req.requestId);
        }
        const db = await connectToDB();
        const result = await db.collection('inquiries').deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return sendErrorResponse(res, createError.notFound('Inquiry not found'), req.requestId);
        }
        logger.info('Inquiry deleted', {
            inquiryId: id,
            adminId: req.user?.id
        });
        return res.status(200).json({
            success: true,
            message: 'Inquiry deleted successfully'
        });
    }
    catch (err) {
        logger.error('Delete inquiry error:', err.message);
        return sendErrorResponse(res, createError.internalServerError(), req.requestId);
    }
};
module.exports = {
    createInquiry,
    getUserInquiries,
    getAllInquiries,
    getInquiryById,
    updateInquiryStatus,
    addAdminNote,
    exportInquiries,
    deleteInquiry
};
