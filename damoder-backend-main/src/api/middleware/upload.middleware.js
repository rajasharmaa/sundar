// 📎 SECURE FILE UPLOAD MIDDLEWARE WITH MAGIC BYTES VALIDATION
// Uses multer and inspects file buffers to prevent renamed malicious files

const multer = require('multer');
const logger = require('../../utils/logger');
const { createError, sendErrorResponse } = require('../../utils/secure-error-handler');

// 🔒 Configure Multer memory storage
const storage = multer.memoryStorage();

// Allowed MIME types
const ALLOWED_MIMETYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/jpg'
]);

/**
 * Validates the file buffer magic bytes against the declared mimetype.
 * This blocks attacks where a user renames virus.exe -> virus.pdf.
 */
const validateMagicBytes = (buffer, mimetype) => {
  if (!buffer || buffer.length < 4) {
    return false;
  }
  
  const hex = buffer.toString('hex', 0, 4).toUpperCase();
  
  // 1. PDF: %PDF (25 50 44 46)
  if (hex === '25504446') {
    return mimetype === 'application/pdf';
  }
  
  // 2. PNG: \x89PNG (89 50 4e 47)
  if (hex === '89504E47') {
    return mimetype === 'image/png';
  }
  
  // 3. JPEG: (FF D8 FF)
  if (hex.startsWith('FFD8FF')) {
    return mimetype === 'image/jpeg' || mimetype === 'image/jpg';
  }
  
  // 4. ZIP / Office Open XML (docx, xlsx): PK (50 4b 03 04)
  if (hex === '504B0304') {
    return (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimetype === 'application/zip'
    );
  }
  
  // 5. Legacy Microsoft Office (doc, xls): Compound File Binary Format (D0 CF 11 E0)
  if (hex === 'D0CF11E0') {
    return (
      mimetype === 'application/msword' ||
      mimetype === 'application/vnd.ms-excel' ||
      mimetype === 'application/vnd.ms-office'
    );
  }
  
  return false;
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIMETYPES.has(file.mimetype)) {
      logger.warn('Blocked file upload with disallowed MIME type:', {
        filename: file.originalname,
        mimetype: file.mimetype
      });
      return cb(new Error('INVALID_FILE_TYPE'), false);
    }
    cb(null, true);
  }
});

/**
 * Middleware wrapper to handle multer errors and execute magic bytes verification
 */
const uploadMiddleware = (req, res, next) => {
  const uploadSingle = upload.single('file');
  
  uploadSingle(req, res, (err) => {
    if (err) {
      logger.warn('File upload failed during parsing:', {
        error: err.message,
        requestId: req.requestId
      });
      
      let errorMsg = 'Failed to process file attachment';
      if (err.code === 'LIMIT_FILE_SIZE') {
        errorMsg = 'File size is too large. Max limit is 5MB.';
      } else if (err.message === 'INVALID_FILE_TYPE') {
        errorMsg = 'Invalid file type. Only PDF, Word, Excel, and JPG/PNG images are allowed.';
      }
      
      const error = createError.validation(errorMsg);
      return sendErrorResponse(res, error, req.requestId);
    }
    
    // If a file was uploaded, perform Magic Bytes verification
    if (req.file) {
      const isSignatureValid = validateMagicBytes(req.file.buffer, req.file.mimetype);
      
      if (!isSignatureValid) {
        logger.error('CRITICAL: Blocked spoofed file upload (MIME/signature mismatch):', {
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          hexSignature: req.file.buffer.toString('hex', 0, 4).toUpperCase(),
          ip: req.ip,
          requestId: req.requestId
        });
        
        const error = createError.validation('Security validation failed: File type signature mismatch. Please upload a genuine document.');
        return sendErrorResponse(res, error, req.requestId);
      }
      
      logger.info('File attachment security check passed:', {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        requestId: req.requestId
      });
    }
    
    next();
  });
};

module.exports = uploadMiddleware;
