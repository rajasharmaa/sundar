const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize filename to prevent directory traversal and invalid chars
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + sanitizedName);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow CSV and JSON for import files
  const isImportRoute = req.originalUrl && (req.originalUrl.includes('/import') || req.path.includes('/import'));
  
  if (isImportRoute) {
    const filetypes = /csv|json/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname || mimetype) {
      return cb(null, true);
    }
    return cb(new Error('Only CSV or JSON files are allowed for import!'), false);
  }

  // Accept images and PDFs
  const isPdf = file.mimetype === 'application/pdf' && path.extname(file.originalname).toLowerCase() === '.pdf';
  const isImage = file.mimetype.startsWith('image/') && /jpeg|jpg|png|webp|gif/.test(path.extname(file.originalname).toLowerCase());
  
  if (isImage || isPdf) {
    cb(null, true);
  } else {
    cb(new Error('Only specific image files and PDFs are allowed!'), false);
  }
};

const multerUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  }
});

// Magic bytes validation middleware
const validateUpload = (req, res, next) => {
  const files = req.file ? [req.file] : (req.files || []);
  if (files.length === 0) return next();
  
  for (const file of files) {
    if (!fs.existsSync(file.path)) continue;
    
    // Read first 4 bytes
    const buffer = Buffer.alloc(4);
    try {
      const fd = fs.openSync(file.path, 'r');
      fs.readSync(fd, buffer, 0, 4, 0);
      fs.closeSync(fd);
      
      const hex = buffer.toString('hex').toUpperCase();
      let isValid = false;
      
      // Check magic numbers for allowed types
      if (hex.startsWith('FFD8FF')) isValid = true; // JPEG
      else if (hex.startsWith('89504E47')) isValid = true; // PNG
      else if (hex.startsWith('47494638')) isValid = true; // GIF
      else if (hex.startsWith('52494646')) isValid = true; // WEBP (RIFF)
      else if (hex.startsWith('25504446')) isValid = true; // PDF
      else if (hex.startsWith('7B') || hex.startsWith('5B')) isValid = true; // JSON { or [
      else if (file.mimetype.includes('csv')) isValid = true; // CSV doesn't have a strict magic number
      
      if (!isValid) {
        files.forEach(f => {
          if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
        });
        return res.status(400).json({ error: 'Invalid file content detected.' });
      }
    } catch (err) {
      files.forEach(f => {
        if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
      });
      return res.status(500).json({ error: 'File validation failed.' });
    }
  }
  next();
};

// Wrapper to transparently apply magic bytes validation alongside multer
const upload = {
  single: (fieldname) => [multerUpload.single(fieldname), validateUpload],
  array: (fieldname, maxCount) => [multerUpload.array(fieldname, maxCount), validateUpload],
  fields: (fields) => [multerUpload.fields(fields), validateUpload],
  none: () => multerUpload.none()
};

module.exports = upload;
