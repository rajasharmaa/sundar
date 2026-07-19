const Catalog = require('../models/Catalog');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'catalog-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit for catalogs
  }
});

const deleteTempFile = (file) => {
  if (file && file.path && fs.existsSync(file.path)) {
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      console.error('Failed to delete temp file:', err.message);
    }
  }
};

// Get active catalog
const getActiveCatalog = async (req, res) => {
  try {
    const catalog = await Catalog.findOne({ isActive: true }).sort({ createdAt: -1 });
    res.json(catalog || { name: 'Standard Catalog', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' });
  } catch (error) {
    console.error('Get active catalog error:', error);
    res.status(500).json({ error: 'Failed to fetch active catalog' });
  }
};

// Upload catalog PDF to Cloudinary
const uploadCatalogPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    // Upload to Cloudinary as resource_type: raw to handle PDFs correctly
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'catalogs',
      resource_type: 'raw',
      use_filename: true,
      unique_filename: true
    });

    // Delete temp file after successful upload
    deleteTempFile(req.file);

    // Deactivate all existing catalogs
    await Catalog.updateMany({ isActive: true }, { isActive: false });

    // Save new catalog record
    const newCatalog = new Catalog({
      name: req.file.originalname,
      url: result.secure_url,
      isActive: true
    });

    const savedCatalog = await newCatalog.save();
    res.status(201).json(savedCatalog);
  } catch (error) {
    deleteTempFile(req.file);
    console.error('Upload catalog error:', error);
    res.status(500).json({ error: 'Failed to upload catalog: ' + error.message });
  }
};

// Set catalog to manual/external URL
const setCatalogUrl = async (req, res) => {
  try {
    const { name, url } = req.body;

    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }

    // Deactivate all existing catalogs
    await Catalog.updateMany({ isActive: true }, { isActive: false });

    // Save manual URL catalog record
    const newCatalog = new Catalog({
      name,
      url,
      isActive: true
    });

    const savedCatalog = await newCatalog.save();
    res.status(201).json(savedCatalog);
  } catch (error) {
    console.error('Set catalog URL error:', error);
    res.status(500).json({ error: 'Failed to set catalog URL' });
  }
};

module.exports = {
  uploadPdf: upload.single('catalog'),
  getActiveCatalog,
  uploadCatalogPDF,
  setCatalogUrl
};
