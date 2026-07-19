"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInquiry = exports.addAdminNote = exports.exportInquiries = exports.updateInquiryStatus = exports.getInquiryById = exports.getAllInquiries = exports.getUserInquiries = exports.createInquiry = void 0;
const di_container_1 = require("../../../utils/di-container");
const logger_1 = __importDefault(require("../../../utils/logger"));
const secure_error_handler_1 = require("../../../utils/secure-error-handler");
// Use require for the JS utility files to ensure they load correctly
const { collectClientData } = require('../../../utils/clientDataCollector');
const getInquiryService = () => {
    return di_container_1.container.get('InquiryService');
};
const createInquiry = async (req, res) => {
    try {
        const user = req.user || null;
        const clientData = await collectClientData(req);
        logger_1.default.info('Inquiry controller: collecting request body', {
            requestId: req.requestId,
            hasUser: !!user
        });
        const result = await getInquiryService().createInquiry(user, req.body, clientData);
        res.status(201).json(result);
    }
    catch (err) {
        logger_1.default.error('❌ Create inquiry controller error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack,
            name: err.name
        });
        let error = err;
        if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
            error = secure_error_handler_1.createError.internal('Database connection issue. Please try again in a few moments.');
        }
        else if (err.statusCode !== 400 && err.name !== 'ValidationError') {
            error = secure_error_handler_1.createError.internal('Inquiry submission service temporarily unavailable');
        }
        (0, secure_error_handler_1.sendErrorResponse)(res, error, req.requestId);
    }
};
exports.createInquiry = createInquiry;
const getUserInquiries = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            (0, secure_error_handler_1.sendErrorResponse)(res, secure_error_handler_1.createError.unauthorized('Authentication required'), req.requestId);
            return;
        }
        const inquiries = await getInquiryService().getUserInquiries(user.id, user.email);
        res.json({
            success: true,
            data: inquiries.map(inquiry => ({
                id: inquiry.id,
                _id: inquiry.id,
                subject: inquiry.subject,
                message: inquiry.message,
                status: inquiry.status,
                createdAt: inquiry.createdAt,
                updatedAt: inquiry.updatedAt,
                phone: inquiry.phone,
                companyName: inquiry.companyName,
                productName: inquiry.productName,
                city: inquiry.city,
                state: inquiry.state,
                country: inquiry.country,
                replyMessage: inquiry.replyMessage,
                replySubject: inquiry.replySubject,
                repliedAt: inquiry.repliedAt
            }))
        });
    }
    catch (err) {
        logger_1.default.error('Get user inquiries error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = secure_error_handler_1.createError.internal('Unable to fetch inquiries');
        (0, secure_error_handler_1.sendErrorResponse)(res, error, req.requestId);
    }
};
exports.getUserInquiries = getUserInquiries;
const getAllInquiries = async (req, res) => {
    try {
        const inquiries = await getInquiryService().getAllInquiries();
        res.json({
            success: true,
            data: inquiries.map(inquiry => ({
                id: inquiry.id,
                userId: inquiry.userId?.toString(),
                email: inquiry.email,
                name: inquiry.name,
                phone: inquiry.phone,
                subject: inquiry.subject,
                message: inquiry.message,
                status: inquiry.status,
                createdAt: inquiry.createdAt,
                updatedAt: inquiry.updatedAt,
                companyName: inquiry.companyName,
                productId: inquiry.productId?.toString(),
                productName: inquiry.productName,
                productCode: inquiry.productCode,
                selectedSize: inquiry.selectedSize,
                priceType: inquiry.priceType,
                sizePrice100: inquiry.sizePrice100,
                sizePrice50: inquiry.sizePrice50,
                city: inquiry.city,
                state: inquiry.state,
                country: inquiry.country,
                ipAddress: inquiry.ipAddress,
                deviceType: inquiry.deviceType,
                browser: inquiry.browser,
                pageSource: inquiry.pageSource,
                contactedAt: inquiry.contactedAt,
                contactNotes: inquiry.contactNotes,
                leadQuality: inquiry.leadQuality
            }))
        });
    }
    catch (err) {
        logger_1.default.error('Get all inquiries error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = secure_error_handler_1.createError.internal('Unable to fetch inquiries');
        (0, secure_error_handler_1.sendErrorResponse)(res, error, req.requestId);
    }
};
exports.getAllInquiries = getAllInquiries;
const getInquiryById = async (req, res) => {
    try {
        const id = req.params.id;
        const inquiry = await getInquiryService().getInquiryById(id);
        res.json({
            success: true,
            data: {
                id: inquiry.id,
                userId: inquiry.userId?.toString(),
                email: inquiry.email,
                name: inquiry.name,
                phone: inquiry.phone,
                subject: inquiry.subject,
                message: inquiry.message,
                status: inquiry.status,
                createdAt: inquiry.createdAt,
                updatedAt: inquiry.updatedAt,
                companyName: inquiry.companyName,
                productId: inquiry.productId?.toString(),
                productName: inquiry.productName,
                productCode: inquiry.productCode,
                replyMessage: inquiry.replyMessage,
                replySubject: inquiry.replySubject,
                repliedAt: inquiry.repliedAt,
                selectedSize: inquiry.selectedSize,
                priceType: inquiry.priceType,
                sizePrice100: inquiry.sizePrice100,
                sizePrice50: inquiry.sizePrice50,
                city: inquiry.city,
                state: inquiry.state,
                country: inquiry.country,
                ipAddress: inquiry.ipAddress,
                deviceType: inquiry.deviceType,
                browser: inquiry.browser,
                pageSource: inquiry.pageSource,
                contactedAt: inquiry.contactedAt,
                contactNotes: inquiry.contactNotes,
                leadQuality: inquiry.leadQuality
            }
        });
    }
    catch (err) {
        if (err.statusCode === 404) {
            (0, secure_error_handler_1.sendErrorResponse)(res, err, req.requestId);
            return;
        }
        logger_1.default.error('Get inquiry by ID error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = secure_error_handler_1.createError.internal('Unable to fetch inquiry');
        (0, secure_error_handler_1.sendErrorResponse)(res, error, req.requestId);
    }
};
exports.getInquiryById = getInquiryById;
const updateInquiryStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        await getInquiryService().updateInquiryStatus(id, status);
        res.json({
            success: true,
            message: 'Inquiry status updated successfully'
        });
    }
    catch (err) {
        if (err.statusCode === 404 || err.statusCode === 400) {
            (0, secure_error_handler_1.sendErrorResponse)(res, err, req.requestId);
            return;
        }
        logger_1.default.error('Update inquiry status error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = secure_error_handler_1.createError.internal('Unable to update inquiry status');
        (0, secure_error_handler_1.sendErrorResponse)(res, error, req.requestId);
    }
};
exports.updateInquiryStatus = updateInquiryStatus;
const exportInquiries = async (req, res) => {
    try {
        const inquiries = await getInquiryService().getAllInquiries();
        // Convert to CSV format
        const headers = ['ID', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Company', 'Product', 'City', 'State', 'Country', 'Created At'];
        const csvRows = [headers.join(',')];
        inquiries.forEach(inquiry => {
            const row = [
                inquiry.id,
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
                inquiry.createdAt?.toISOString() || ''
            ];
            csvRows.push(row.join(','));
        });
        const csv = csvRows.join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=inquiries.csv');
        res.send(csv);
    }
    catch (err) {
        logger_1.default.error('Export inquiries error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = secure_error_handler_1.createError.internal('Unable to export inquiries');
        (0, secure_error_handler_1.sendErrorResponse)(res, error, req.requestId);
    }
};
exports.exportInquiries = exportInquiries;
const addAdminNote = async (req, res) => {
    try {
        const id = req.params.id;
        const { note } = req.body;
        const addedBy = req.user?.email || 'admin';
        await getInquiryService().addAdminNote(id, note, addedBy);
        res.json({
            success: true,
            message: 'Note added successfully'
        });
    }
    catch (err) {
        if (err.statusCode === 404 || err.statusCode === 400) {
            (0, secure_error_handler_1.sendErrorResponse)(res, err, req.requestId);
            return;
        }
        logger_1.default.error('Add admin note error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = secure_error_handler_1.createError.internal('Unable to add note');
        (0, secure_error_handler_1.sendErrorResponse)(res, error, req.requestId);
    }
};
exports.addAdminNote = addAdminNote;
const deleteInquiry = async (req, res) => {
    try {
        const id = req.params.id;
        await getInquiryService().deleteInquiry(id);
        res.json({
            success: true,
            message: 'Inquiry deleted successfully'
        });
    }
    catch (err) {
        if (err.statusCode === 404) {
            (0, secure_error_handler_1.sendErrorResponse)(res, err, req.requestId);
            return;
        }
        logger_1.default.error('Delete inquiry error:', {
            requestId: req.requestId,
            error: err.message,
            stack: err.stack
        });
        const error = secure_error_handler_1.createError.internal('Unable to delete inquiry');
        (0, secure_error_handler_1.sendErrorResponse)(res, error, req.requestId);
    }
};
exports.deleteInquiry = deleteInquiry;
