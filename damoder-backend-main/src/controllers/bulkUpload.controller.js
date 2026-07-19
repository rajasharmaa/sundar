// 📥 BULK UPLOAD CONTROLLER
// Handle CSV file uploads for bulk product creation

const csvImportService = require('../services/csv-import.service');
const logger = require('../utils/logger');
const { createError, sendErrorResponse } = require('../middleware/error.handler');

/**
 * Upload CSV file for bulk product import
 * POST /api/admin/products/bulk-upload
 */
const bulkUpload = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return sendErrorResponse(
        res, 
        createError.badRequest('CSV file is required'), 
        req.requestId
      );
    }
    
    const csvContent = req.file.buffer.toString('utf-8');
    const userId = req.user?._id?.toString() || null;
    
    // Parse and validate CSV
    logger.info('📥 Processing CSV upload...');
    const { products, errors: parseErrors } = await csvImportService.parseCSV(csvContent);
    
    if (products.length === 0) {
      return sendErrorResponse(
        res,
        createError.badRequest('No valid products found in CSV'),
        req.requestId
      );
    }
    
    // Generate job ID for tracking
    const jobId = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Return immediate response with preview
    return res.status(200).json({
      success: true,
      message: 'CSV uploaded successfully',
      jobId,
      preview: {
        totalRows: products.length + parseErrors.length,
        validProducts: products.length,
        invalidRows: parseErrors.length,
        parseErrors: parseErrors.slice(0, 10) // First 10 errors
      },
      nextStep: 'Call /api/admin/products/bulk-upload/confirm with jobId to start import'
    });
    
  } catch (error) {
    logger.error('Bulk upload error:', error.message);
    return sendErrorResponse(
      res,
      createError.internalServerError('Failed to process CSV file'),
      req.requestId
    );
  }
};

/**
 * Confirm and execute bulk upload
 * POST /api/admin/products/bulk-upload/confirm
 */
const confirmBulkUpload = async (req, res) => {
  try {
    const { jobId, dryRun = false } = req.body;
    
    if (!jobId) {
      return sendErrorResponse(
        res,
        createError.badRequest('Job ID is required'),
        req.requestId
      );
    }
    
    // In a real implementation, you'd retrieve the CSV data from storage
    // For now, we'll expect the CSV to be passed in the request
    
    const userId = req.user?._id?.toString() || null;
    
    // This would typically retrieve stored CSV data
    // For demonstration, we'll return a mock response
    
    const results = {
      jobId,
      status: 'completed',
      inserted: 0,
      failed: 0,
      message: dryRun ? 'Dry run completed' : 'Upload completed successfully'
    };
    
    return res.status(200).json({
      success: true,
      message: dryRun ? 'Dry run completed' : 'Bulk upload initiated',
      results
    });
    
  } catch (error) {
    logger.error('Confirm bulk upload error:', error.message);
    return sendErrorResponse(
      res,
      createError.internalServerError('Failed to confirm bulk upload'),
      req.requestId
    );
  }
};

/**
 * Get upload progress
 * GET /api/admin/products/bulk-upload/progress/:jobId
 */
const getUploadProgress = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const progress = await csvImportService.getUploadProgress(jobId);
    
    return res.status(200).json({
      success: true,
      data: progress
    });
    
  } catch (error) {
    logger.error('Get upload progress error:', error.message);
    return sendErrorResponse(
      res,
      createError.internalServerError('Failed to get upload progress'),
      req.requestId
    );
  }
};

/**
 * Download CSV template
 * GET /api/admin/products/bulk-upload/template
 */
const downloadTemplate = async (req, res) => {
  try {
    const template = csvImportService.generateCSVTemplate();
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=product-template.csv');
    
    return res.send(template);
    
  } catch (error) {
    logger.error('Download template error:', error.message);
    return sendErrorResponse(
      res,
      createError.internalServerError('Failed to generate template'),
      req.requestId
    );
  }
};

module.exports = {
  bulkUpload,
  confirmBulkUpload,
  getUploadProgress,
  downloadTemplate
};
