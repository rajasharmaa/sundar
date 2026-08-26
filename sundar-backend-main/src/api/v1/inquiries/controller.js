const logger = require('../../../utils/logger');
const { ObjectId } = require('mongodb');
const { connectToDB } = require('../../../config/database');
const { createError, sendErrorResponse } = require('../../../utils/secure-error-handler');
const { sanitizeInput } = require('../../../utils/validation');
const { queueManager } = require('../../../config/queue');
const { collectClientData } = require('../../../utils/clientDataCollector');
const ProductModel = require('../../../models').Product;

const createInquiry = async (req, res) => {
    try {
        // 🛡️ 1. Honeypot Field Check (bot protection)
        if (req.body.website_url) {
            logger.info('Honeypot triggered, silently rejecting request:', { ip: req.ip });
            return res.status(201).json({
                success: true,
                message: 'Inquiry received',
                id: 'mock-' + Math.floor(100000 + Math.random() * 900000),
                inquiryId: 'mock-' + Math.floor(100000 + Math.random() * 900000)
            });
        }

        const { subject, message, phone, productId, productName, companyName, businessName, pageSource, email, name, selectedSize, priceType, sizePrice100, sizePrice50, productCode, products, totalEstimatedValue } = req.body;
        const user = req.user;

        logger.info('Inquiry submission received:', {
            requestId: req.requestId,
            hasUser: !!user,
            subject,
            messageLength: message?.length,
            hasEmail: !!email,
            hasName: !!name,
            selectedSize,
            priceType
        });

        // Validate basic inputs
        if (!subject || typeof subject !== 'string' || subject.trim().length < 5) {
            logger.warn('Invalid subject:', { subject, length: subject?.length });
            const error = createError.validation('Subject must be at least 5 characters. Please provide a meaningful subject for your inquiry.');
            return sendErrorResponse(res, error, req.requestId);
        }

        if (!message || typeof message !== 'string' || message.trim().length < 10) {
            logger.warn('Invalid message:', { messageLength: message?.length });
            const error = createError.validation('Message must be at least 10 characters. Please provide more details about your inquiry.');
            return sendErrorResponse(res, error, req.requestId);
        }

        // 🛡️ Message Complexity check (Spam protection - prevent character flooding)
        const trimmedMsg = message.trim();
        const nonSpaceMsg = trimmedMsg.replace(/\s/g, '');
        if (nonSpaceMsg.length >= 20) {
            const uniqueChars = new Set(nonSpaceMsg).size;
            if (uniqueChars / nonSpaceMsg.length < 0.15) {
                logger.warn('Blocked low entropy spam message:', { message: trimmedMsg });
                const error = createError.validation('Your message contains repetitive character sequences and is flagged as spam. Please provide detailed specifications.');
                return sendErrorResponse(res, error, req.requestId);
            }
        }

        // Sanitize inputs
        const sanitizedSubject = sanitizeInput(subject.trim().substring(0, 200));
        const sanitizedMessage = sanitizeInput(trimmedMsg.substring(0, 2000));
        const rawPhone = phone ? phone.trim() : '';
        const cleanPhone = rawPhone.replace(/\D/g, '');
        const finalPhone = cleanPhone.length === 12 && cleanPhone.startsWith('91')
            ? cleanPhone.slice(2)
            : cleanPhone;

        // Phone format validation
        if (rawPhone) {
            const isValidIndian = /^[6-9]\d{9}$/.test(finalPhone);
            if (!isValidIndian) {
                const error = createError.validation('Invalid phone number. Must be a valid 10-digit Indian number.');
                return sendErrorResponse(res, error, req.requestId);
            }
        }

        const rawCompanyName = companyName || businessName || '';
        const sanitizedCompanyName = rawCompanyName ? sanitizeInput(rawCompanyName.trim().substring(0, 200)) : '';
        const sanitizedPageSource = pageSource ? sanitizeInput(pageSource.trim().substring(0, 500)) : '';
        const sanitizedEmail = email ? email.trim().substring(0, 254) : '';
        const sanitizedName = name ? sanitizeInput(name.trim().substring(0, 100)) : '';

        // Normalize customerType enum to match mongoose schema in admin-backend
        const rawCustomerType = req.body.customerType || req.body.businessType;
        let customerType = 'retail';
        if (rawCustomerType) {
            const bt = rawCustomerType.toLowerCase();
            if (bt.includes('retail')) {
                customerType = 'retail';
            } else if (bt.includes('wholesale') || bt.includes('wholesaler')) {
                customerType = 'wholesaler';
            } else if (bt.includes('manufacturer') || bt.includes('industrial')) {
                customerType = 'manufacturer';
            } else if (bt.includes('contractor') || bt.includes('construction') || bt.includes('real estate')) {
                customerType = 'contractor';
            } else if (bt.includes('trader')) {
                customerType = 'trader';
            } else if (['retail', 'wholesaler', 'manufacturer', 'contractor', 'trader', 'other'].includes(bt)) {
                customerType = bt;
            } else {
                customerType = 'other';
            }
        }

        // Normalize source enum to match mongoose schema in admin-backend
        const rawSource = req.body.source || 'website';
        let source = 'website';
        if (rawSource) {
            const src = rawSource.toLowerCase();
            if (['website', 'google', 'social_media', 'reference'].includes(src)) {
                source = src;
            } else {
                source = 'website';
            }
        }

        // Set read status
        const read = req.body.read !== undefined ? !!req.body.read : false;

        // Connect database
        const db = await connectToDB();

        // 🛡️ 2. Backend Server Rate Limiting (Max 3 submissions per hour per IP/Email/Phone)
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';

        const ipCount = await db.collection('inquiries').countDocuments({
            ipAddress: clientIp,
            createdAt: { $gte: oneHourAgo }
        });

        if (ipCount >= 3) {
            logger.warn('Rate limit exceeded by IP:', { ip: clientIp });
            const error = createError.tooManyRequests('Too many inquiry submissions from this IP. Limit is 3 per hour.', 3600);
            return sendErrorResponse(res, error, req.requestId);
        }

        const emailOrPhoneQuery = [];
        if (sanitizedEmail) emailOrPhoneQuery.push({ email: sanitizedEmail.toLowerCase() });
        if (finalPhone) emailOrPhoneQuery.push({ phone: finalPhone });

        if (emailOrPhoneQuery.length > 0) {
            const emailPhoneCount = await db.collection('inquiries').countDocuments({
                $or: emailOrPhoneQuery,
                createdAt: { $gte: oneHourAgo }
            });

            if (emailPhoneCount >= 3) {
                logger.warn('Rate limit exceeded by email/phone:', { email: sanitizedEmail, phone: finalPhone });
                const error = createError.tooManyRequests('Too many inquiry submissions. Limit is 3 per hour.', 3600);
                return sendErrorResponse(res, error, req.requestId);
            }
        }

        // 🛡️ 3. Backend Duplicate Inquiry Protection (Same message from same email/phone in last 15 min)
        const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
        const duplicateQuery = {
            message: sanitizedMessage,
            createdAt: { $gte: fifteenMinutesAgo }
        };
        const conditions = [];
        if (sanitizedEmail) conditions.push({ email: sanitizedEmail.toLowerCase() });
        if (finalPhone) conditions.push({ phone: finalPhone });

        if (conditions.length > 0) {
            duplicateQuery.$or = conditions;
            const hasDuplicate = await db.collection('inquiries').findOne(duplicateQuery);
            if (hasDuplicate) {
                logger.warn('Duplicate inquiry submission blocked:', { email: sanitizedEmail, phone: finalPhone });
                const error = createError.badRequest('Duplicate inquiry detected. You have already submitted this exact message recently.');
                return sendErrorResponse(res, error, req.requestId);
            }
        }

        // Verify product if productId provided
        let verifiedProductName = productName;
        if (productId && ObjectId.isValid(productId)) {
            try {
                const product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
                if (product) {
                    verifiedProductName = product.name;
                }
            } catch (err) {
                logger.warn('Failed to verify product:', { productId, error: err.message });
            }
        }

        // Handle both authenticated and anonymous users
        const inquiryData = {
            email: '',
            name: '',
            userId: null
        };

        if (user && user.id) {
            // Authenticated user - use their profile data
            inquiryData.userId = new ObjectId(user.id);
            inquiryData.email = user.email || '';
            inquiryData.name = user.name || '';
        } else {
            // Anonymous user - extract from request body
            if (!sanitizedName || sanitizedName.length < 2) {
                const error = createError.validation('Full Name is required and must be at least 2 characters');
                return sendErrorResponse(res, error, req.requestId);
            }
            if (!sanitizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
                const error = createError.validation('Valid Email is required');
                return sendErrorResponse(res, error, req.requestId);
            }
            inquiryData.email = sanitizedEmail;
            inquiryData.name = sanitizedName;
        }

        // Collect technical client data safely
        let clientData = {};
        try {
            clientData = await collectClientData(req);
        } catch (clientErr) {
            logger.warn('Failed to collect client data:', { requestId: req.requestId, error: clientErr.message });
        }

        // ☁️ 4. Cloudinary File Upload Integration
        let attachmentUrl = '';
        let attachmentName = '';

        if (req.file) {
            try {
                const cloudinaryService = require('../../../services/cloudinary.service');
                const uploadResult = await cloudinaryService.uploadBuffer(
                    req.file.buffer,
                    req.file.originalname,
                    req.file.mimetype
                );
                attachmentUrl = uploadResult.url;
                attachmentName = req.file.originalname;
            } catch (uploadErr) {
                logger.error('Failed to upload attachment to Cloudinary:', uploadErr);
                const error = createError.internal('Failed to upload file attachment. Please try again.');
                return sendErrorResponse(res, error, req.requestId);
            }
        }

        const inquiry = {
            ...inquiryData,
            phone: finalPhone,
            subject: sanitizedSubject,
            message: sanitizedMessage,
            productId: productId && ObjectId.isValid(productId) ? new ObjectId(productId) : null,
            productName: verifiedProductName || '',
            companyName: sanitizedCompanyName,
            pageSource: sanitizedPageSource || req.headers.referer || 'Unknown',
            productCode: productCode || '',
            selectedSize: selectedSize || '',
            priceType: priceType || '100',
            sizePrice100: sizePrice100 || 0,
            sizePrice50: sizePrice50 || 0,
            products: Array.isArray(products) ? products.map(p => ({
                productId: p.productId && ObjectId.isValid(p.productId) ? new ObjectId(p.productId) : null,
                productName: p.productName || '',
                productCode: p.productCode || '',
                quantity: parseInt(p.quantity) || 1,
                selectedSize: p.selectedSize || '',
                priceType: p.priceType || '100',
                unitPrice: parseFloat(p.unitPrice) || 0,
                totalPrice: parseFloat(p.totalPrice) || 0
            })) : [],
            totalEstimatedValue: parseFloat(totalEstimatedValue) || 0,
            customerType,
            source,
            read,
            attachmentUrl,
            attachmentName,
            ...clientData,
            status: 'new',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        logger.info('💾 Saving inquiry to database:', {
            requestId: req.requestId,
            selectedSize: inquiry.selectedSize,
            priceType: inquiry.priceType,
            sizePrice100: inquiry.sizePrice100,
            sizePrice50: inquiry.sizePrice50,
            productName: inquiry.productName,
            productCode: inquiry.productCode,
            hasAttachment: !!attachmentUrl
        });

        const result = await db.collection('inquiries').insertOne(inquiry);

        logger.info('✅ Inquiry saved successfully:', {
            requestId: req.requestId,
            inquiryId: result.insertedId.toString(),
            userId: user?.id || 'anonymous'
        });

        // Send notification to admin (non-blocking)
        setImmediate(async () => {
            try {
                if (!queueManager) {
                    logger.warn('Queue manager not initialized, skipping email notification');
                    return;
                }

                const emailQueue = queueManager.emailQueue;
                if (emailQueue) {
                    await emailQueue.add('admin-notification', {
                        to: process.env.ADMIN_EMAIL || 'admin@damoder.com',
                        subject: `New Inquiry: ${sanitizedSubject}`,
                        html: `
                            <h3>New Customer Inquiry</h3>
                            <p><strong>Name:</strong> ${user?.name || inquiryData.name}</p>
                            <p><strong>Email:</strong> ${user?.email || inquiryData.email}</p>
                            <p><strong>Phone:</strong> ${finalPhone || 'Not provided'}</p>
                            <p><strong>Company:</strong> ${sanitizedCompanyName || 'Not provided'}</p>
                            <p><strong>Location:</strong> ${clientData.city || 'Unknown'}, ${clientData.country || 'Unknown'}</p>
                            <p><strong>Product:</strong> ${verifiedProductName || 'General inquiry'}</p>
                            ${selectedSize ? `<p><strong>Selected Size:</strong> ${selectedSize}</p>` : ''}
                            ${priceType ? `<p><strong>Price Type:</strong> ${priceType === '100' ? 'Standard (100%)' : 'Wholesale (50%)'}</p>` : ''}
                            <p><strong>Subject:</strong> ${sanitizedSubject}</p>
                            ${attachmentUrl ? `<p><strong>Attachment:</strong> <a href="${attachmentUrl}">${attachmentName}</a></p>` : ''}
                            <p><strong>Message:</strong></p>
                            <p>${sanitizedMessage}</p>
                        `,
                        templateType: 'admin-inquiry-notification'
                    });
                } else {
                    logger.debug('Email queue not available, skipping notification');
                }
            } catch (notificationErr) {
                logger.warn('Failed to send inquiry notification:', {
                    requestId: req.requestId,
                    error: notificationErr.message,
                    stack: notificationErr.stack
                });
            }
        });

        res.status(201).json({
            success: true,
            message: 'Inquiry received',
            id: result.insertedId,
            inquiryId: result.insertedId.toString()
        });
    } catch (err) {
        logger.error('❌ Create inquiry error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack,
            name: err.name
        });

        // Provide more specific error messages based on error type
        let errorMessage = 'Inquiry submission service temporarily unavailable';

        if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
            errorMessage = 'Database connection issue. Please try again in a few moments.';
        } else if (err.name === 'ValidationError') {
            errorMessage = err.message;
        }

        const error = createError.internal(errorMessage);
        return sendErrorResponse(res, error, req.requestId);
    }
};

const getUserInquiries = async (req, res) => {
    try {
        const user = req.user;
        const db = await connectToDB();

        console.info('ðŸ“¥ Fetching inquiries for user:', {
            userId: user.id,
            email: user.email,
            requestId: req.requestId
        });

        // Fetch inquiries by userId OR by email (for guest inquiries made with same email)
        const inquiries = await db.collection('inquiries')
            .find({
                $or: [
                    { userId: new ObjectId(user.id) },
                    { email: user.email }
                ]
            })
            .sort({ createdAt: -1 })
            .toArray();

        console.info('ðŸ“¤ Found inquiries count:', inquiries.length);

        res.json({
            success: true,
            data: inquiries.map(inquiry => ({
                id: inquiry._id.toString(),
                _id: inquiry._id.toString(),
                subject: inquiry.subject,
                message: inquiry.message,
                status: inquiry.status,
                createdAt: inquiry.createdAt,
                updatedAt: inquiry.updatedAt,
                // Include additional fields for display
                phone: inquiry.phone,
                companyName: inquiry.companyName,
                productName: inquiry.productName,
                city: inquiry.city,
                state: inquiry.state,
                country: inquiry.country,
                // Reply Information
                replyMessage: inquiry.replyMessage,
                replySubject: inquiry.replySubject,
                repliedAt: inquiry.repliedAt,
                // Attachment Information
                attachmentUrl: inquiry.attachmentUrl,
                attachmentName: inquiry.attachmentName,
                // B2B RFQ Information
                products: inquiry.products || [],
                totalEstimatedValue: inquiry.totalEstimatedValue || 0
            }))
        });
    } catch (err) {
        logger.error('Get user inquiries error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('Unable to fetch inquiries');
        return sendErrorResponse(res, error, req.requestId);
    }
};

const getAllInquiries = async (req, res) => {
    try {
        const db = await connectToDB();

        const inquiries = await db.collection('inquiries')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        logger.info('ðŸ“¥ Fetching all inquiries:', {
            requestId: req.requestId,
            count: inquiries.length,
            sampleData: inquiries.length > 0 ? {
                selectedSize: inquiries[0].selectedSize,
                priceType: inquiries[0].priceType,
                sizePrice100: inquiries[0].sizePrice100,
                sizePrice50: inquiries[0].sizePrice50
            } : 'No inquiries'
        });

        res.json({
            success: true,
            data: inquiries.map(inquiry => ({
                id: inquiry._id.toString(),
                userId: inquiry.userId?.toString(),
                email: inquiry.email,
                name: inquiry.name,
                phone: inquiry.phone,
                subject: inquiry.subject,
                message: inquiry.message,
                status: inquiry.status,
                createdAt: inquiry.createdAt,
                updatedAt: inquiry.updatedAt,
                // Business Information
                companyName: inquiry.companyName,
                // Product & Size Information
                productId: inquiry.productId?.toString(),
                productName: inquiry.productName,
                productCode: inquiry.productCode,
                selectedSize: inquiry.selectedSize,
                priceType: inquiry.priceType,
                sizePrice100: inquiry.sizePrice100,
                sizePrice50: inquiry.sizePrice50,
                // Auto-Collected Location Data
                city: inquiry.city,
                state: inquiry.state,
                country: inquiry.country,
                ipAddress: inquiry.ipAddress,
                // Device & Browser Info
                deviceType: inquiry.deviceType,
                browser: inquiry.browser,
                // Source Info
                pageSource: inquiry.pageSource,
                // Contact Tracking
                contactedAt: inquiry.contactedAt,
                contactNotes: inquiry.contactNotes,
                leadQuality: inquiry.leadQuality,
                // Attachment Information
                attachmentUrl: inquiry.attachmentUrl,
                attachmentName: inquiry.attachmentName,
                // B2B RFQ Information
                products: inquiry.products || [],
                totalEstimatedValue: inquiry.totalEstimatedValue || 0
            }))
        });
    } catch (err) {
        logger.error('Get all inquiries error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('Unable to fetch inquiries');
        return sendErrorResponse(res, error, req.requestId);
    }
};

const getInquiryById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            const error = createError.badRequest('Invalid inquiry ID');
            return sendErrorResponse(res, error, req.requestId);
        }

        const db = await connectToDB();
        const inquiry = await db.collection('inquiries')
            .findOne({ _id: new ObjectId(id) });

        if (!inquiry) {
            const error = createError.notFound('Inquiry not found');
            return sendErrorResponse(res, error, req.requestId);
        }

        res.json({
            success: true,
            data: {
                id: inquiry._id.toString(),
                userId: inquiry.userId?.toString(),
                email: inquiry.email,
                name: inquiry.name,
                phone: inquiry.phone,
                subject: inquiry.subject,
                message: inquiry.message,
                status: inquiry.status,
                createdAt: inquiry.createdAt,
                updatedAt: inquiry.updatedAt,
                // Business Information
                companyName: inquiry.companyName,
                // Product & Size Information
                productId: inquiry.productId?.toString(),
                productName: inquiry.productName,
                productCode: inquiry.productCode,
                // Reply Information
                replyMessage: inquiry.replyMessage,
                replySubject: inquiry.replySubject,
                repliedAt: inquiry.repliedAt,
                selectedSize: inquiry.selectedSize,
                priceType: inquiry.priceType,
                sizePrice100: inquiry.sizePrice100,
                sizePrice50: inquiry.sizePrice50,
                // Auto-Collected Location Data
                city: inquiry.city,
                state: inquiry.state,
                country: inquiry.country,
                ipAddress: inquiry.ipAddress,
                // Device & Browser Info
                deviceType: inquiry.deviceType,
                browser: inquiry.browser,
                // Source Info
                pageSource: inquiry.pageSource,
                // Contact Tracking
                contactedAt: inquiry.contactedAt,
                contactNotes: inquiry.contactNotes,
                leadQuality: inquiry.leadQuality,
                // Attachment Information
                attachmentUrl: inquiry.attachmentUrl,
                attachmentName: inquiry.attachmentName,
                // B2B RFQ Information
                products: inquiry.products || [],
                totalEstimatedValue: inquiry.totalEstimatedValue || 0
            }
        });
    } catch (err) {
        logger.error('Get inquiry by ID error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('Unable to fetch inquiry');
        return sendErrorResponse(res, error, req.requestId);
    }
};

const updateInquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!ObjectId.isValid(id)) {
            const error = createError.badRequest('Invalid inquiry ID');
            return sendErrorResponse(res, error, req.requestId);
        }

        if (!status || typeof status !== 'string') {
            const error = createError.badRequest('Valid status is required');
            return sendErrorResponse(res, error, req.requestId);
        }

        // Map frontend status values to backend status values
        const statusMap = {
            'pending': 'in-progress',
            'completed': 'resolved'
        };

        const validStatuses = ['new', 'in-progress', 'resolved', 'closed'];
        const mappedStatus = statusMap[status] || status;

        if (!validStatuses.includes(mappedStatus)) {
            const error = createError.badRequest(`Status must be one of: ${validStatuses.join(', ')}`);
            return sendErrorResponse(res, error, req.requestId);
        }

        const db = await connectToDB();
        const result = await db.collection('inquiries').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: mappedStatus,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            const error = createError.notFound('Inquiry not found');
            return sendErrorResponse(res, error, req.requestId);
        }

        res.json({
            success: true,
            message: 'Inquiry status updated successfully'
        });
    } catch (err) {
        logger.error('Update inquiry status error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('Unable to update inquiry status');
        return sendErrorResponse(res, error, req.requestId);
    }
};

const exportInquiries = async (req, res) => {
    try {
        const db = await connectToDB();
        const inquiries = await db.collection('inquiries')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        // Convert to CSV format
        const headers = ['ID', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Company', 'Product', 'City', 'State', 'Country', 'Created At'];
        const csvRows = [headers.join(',')];

        inquiries.forEach(inquiry => {
            const row = [
                inquiry._id.toString(),
                `"${(inquiry.name || '').replace(/"/g, '""')}"`,
                `"${(inquiry.email || '').replace(/"/g, '""')}"`,
                `"${(inquiry.phone || '').replace(/"/g, '""')}"`,
                `"${(inquiry.subject || '').replace(/"/g, '""')}"`,
                `"${(inquiry.message || '').replace(/"/g, '""')}"`,
                inquiry.status,
                `"${(inquiry.companyName || '').replace(/"/g, '""')}"`,
                `"${(inquiry.productName || '').replace(/"/g, '""')}"`,
                `"${(inquiry.city || '').replace(/"/g, '""')}"`,
                `"${(inquiry.state || '').replace(/"/g, '""')}"`,
                `"${(inquiry.country || '').replace(/"/g, '""')}"`,
                inquiry.createdAt
            ];
            csvRows.push(row.join(','));
        });

        const csv = csvRows.join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=inquiries.csv');
        res.send(csv);
    } catch (err) {
        logger.error('Export inquiries error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('Unable to export inquiries');
        return sendErrorResponse(res, error, req.requestId);
    }
};

const addAdminNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;

        if (!ObjectId.isValid(id)) {
            const error = createError.badRequest('Invalid inquiry ID');
            return sendErrorResponse(res, error, req.requestId);
        }

        if (!note || typeof note !== 'string' || note.trim().length < 1) {
            const error = createError.badRequest('Note is required');
            return sendErrorResponse(res, error, req.requestId);
        }

        const db = await connectToDB();
        const result = await db.collection('inquiries').updateOne(
            { _id: new ObjectId(id) },
            {
                $push: {
                    adminNotes: {
                        note: sanitizeInput(note.trim()),
                        addedBy: req.user?.email || 'admin',
                        addedAt: new Date()
                    }
                },
                $set: {
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            const error = createError.notFound('Inquiry not found');
            return sendErrorResponse(res, error, req.requestId);
        }

        res.json({
            success: true,
            message: 'Note added successfully'
        });
    } catch (err) {
        logger.error('Add admin note error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('Unable to add note');
        return sendErrorResponse(res, error, req.requestId);
    }
};

const deleteInquiry = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            const error = createError.badRequest('Invalid inquiry ID');
            return sendErrorResponse(res, error, req.requestId);
        }

        const db = await connectToDB();

        // Find the inquiry first to get attachment information
        const inquiry = await db.collection('inquiries').findOne({ _id: new ObjectId(id) });

        if (!inquiry) {
            const error = createError.notFound('Inquiry not found');
            return sendErrorResponse(res, error, req.requestId);
        }

        // Delete file from Cloudinary if it exists
        if (inquiry.attachmentUrl) {
            try {
                const cloudinaryService = require('../../../services/cloudinary.service');
                await cloudinaryService.deleteAsset(inquiry.attachmentUrl);
            } catch (cloudErr) {
                logger.error('Failed to delete attachment from Cloudinary during inquiry deletion:', {
                    requestId: req.requestId,
                    inquiryId: id,
                    error: cloudErr.message
                });
            }
        }

        await db.collection('inquiries').deleteOne(
            { _id: new ObjectId(id) }
        );

        res.json({
            success: true,
            message: 'Inquiry deleted successfully'
        });
    } catch (err) {
        logger.error('Delete inquiry error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('Unable to delete inquiry');
        return sendErrorResponse(res, error, req.requestId);
    }
};

const getInquiryAttachment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            const error = createError.badRequest('Invalid inquiry ID');
            return sendErrorResponse(res, error, req.requestId);
        }

        const db = await connectToDB();
        const inquiry = await db.collection('inquiries').findOne({ _id: new ObjectId(id) });

        if (!inquiry) {
            const error = createError.notFound('Inquiry not found');
            return sendErrorResponse(res, error, req.requestId);
        }

        if (!inquiry.attachmentUrl) {
            const error = createError.notFound('No attachment found for this inquiry');
            return sendErrorResponse(res, error, req.requestId);
        }

        // Redirect to Cloudinary URL
        res.redirect(inquiry.attachmentUrl);
    } catch (err) {
        logger.error('Get inquiry attachment error:', {
            requestId: req.requestId,
            error: err.message
        });
        const error = createError.internal('Unable to retrieve attachment');
        return sendErrorResponse(res, error, req.requestId);
    }
};

module.exports = {
    createInquiry,
    getUserInquiries,
    getAllInquiries,
    getInquiryById,
    updateInquiryStatus,
    exportInquiries,
    addAdminNote,
    deleteInquiry,
    getInquiryAttachment
};


