const { Product } = require('../../../models');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const XLSX = require('xlsx');
// 🔥 Import Redis cache invalidation
const { invalidateProductCache } = require('../utils/redisClient');
const fs = require('fs');

const deleteTempFile = (file) => {
  if (file && file.path && fs.existsSync(file.path)) {
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      console.error('Failed to delete temp file:', err.message);
    }
  }
};

const deleteTempFiles = (files) => {
  if (Array.isArray(files)) {
    files.forEach(deleteTempFile);
  } else if (files) {
    deleteTempFile(files);
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const { category, brand, search, minPrice, maxPrice, size } = req.query;
    
    let query = {};
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Brand filter
    if (brand && brand !== 'all') {
      query.brand = new RegExp(brand, 'i');
    }
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') }
      ];
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.minPrice = {};
      if (minPrice) query.minPrice.$gte = Number(minPrice);
      if (maxPrice) query.maxPrice = {};
      if (maxPrice) query.maxPrice.$lte = Number(maxPrice);
    }
    
    // Size filter - find products with specific size
    if (size) {
      query['sizeOptions.size'] = new RegExp(size, 'i');
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      sizeOptions,
      discount,
      material,
      bagSize,
      weight,
      printType,
      closure,
      specifications,
      featured,
      benefits,
      industries,
      faqs,
      customizationTypes,
      manufacturingProcess,
      materialComposition,
      printingDetails,
      themeColor
    } = req.body;

    // Validate required fields
    if (!name || name.trim() === '') {
      deleteTempFiles(req.files || req.file);
      return res.status(400).json({ error: 'Product name is required' });
    }
    if (!description || description.trim() === '') {
      deleteTempFiles(req.files || req.file);
      return res.status(400).json({ error: 'Product description is required' });
    }
    if (!category || category.trim() === '') {
      deleteTempFiles(req.files || req.file);
      return res.status(400).json({ error: 'Category is required' });
    }
    if (!sizeOptions) {
      deleteTempFiles(req.files || req.file);
      return res.status(400).json({ error: 'Size options are required' });
    }

    const slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Parse and validate sizeOptions
    let parsedSizeOptions = sizeOptions;
    if (typeof sizeOptions === 'string') {
      try {
        parsedSizeOptions = JSON.parse(sizeOptions);
      } catch (e) {
        deleteTempFiles(req.files || req.file);
        return res.status(400).json({ error: 'Invalid size options format' });
      }
    }

    // Validate sizeOptions array
    if (!Array.isArray(parsedSizeOptions) || parsedSizeOptions.length === 0) {
      deleteTempFiles(req.files || req.file);
      return res.status(400).json({ error: 'At least one size option is required' });
    }

    // Validate each size option has dual-tier pricing
    for (let i = 0; i < parsedSizeOptions.length; i++) {
      const option = parsedSizeOptions[i];
      if (!option.size || 
          option.price_100_percent === undefined || 
          option.price_50_percent === undefined ||
          option.price_100_percent < 0 ||
          option.price_50_percent < 0) {
        deleteTempFiles(req.files || req.file);
        return res.status(400).json({ 
          error: `Size option ${i + 1} must have size, price_100_percent, and price_50_percent` 
        });
      }
    }

    // Parse specifications
    let parsedSpecifications = undefined;
    if (specifications) {
      if (typeof specifications === 'string') {
        try {
          parsedSpecifications = JSON.parse(specifications);
        } catch (e) {
          deleteTempFiles(req.files || req.file);
          return res.status(400).json({ error: 'Invalid specifications format' });
        }
      } else {
        parsedSpecifications = specifications;
      }
    }

    // Parse dynamic editorial arrays
    const parseJSONField = (field) => {
      if (!field) return undefined;
      if (typeof field === 'string') {
        try { return JSON.parse(field); } catch (e) { return undefined; }
      }
      return field;
    };

    const parsedBenefits = parseJSONField(benefits);
    const parsedIndustries = parseJSONField(industries);
    const parsedFaqs = parseJSONField(faqs);
    const parsedCustomizationTypes = parseJSONField(customizationTypes);

    // Handle image upload
    let imageUrl = '';
    let imagePublicId = '';
    let images = [];
    
    if (req.files && req.files.length > 0) {
      try {
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'products',
            use_filename: true,
            unique_filename: false
          });
          
          images.push({
            url: result.secure_url,
            publicId: result.public_id,
            order: i
          });
          
          if (i === 0) {
            imageUrl = result.secure_url;
            imagePublicId = result.public_id;
          }
        }
        deleteTempFiles(req.files);
      } catch (uploadError) {
        deleteTempFiles(req.files);
        return res.status(500).json({ error: 'Failed to upload images: ' + uploadError.message });
      }
    } else if (req.file) { // Fallback if single file was sent
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'products',
          use_filename: true,
          unique_filename: false
        });
        
        imageUrl = result.secure_url;
        imagePublicId = result.public_id;
        images.push({
          url: result.secure_url,
          publicId: result.public_id,
          order: 0
        });
        
        deleteTempFile(req.file);
      } catch (uploadError) {
        deleteTempFile(req.file);
        return res.status(500).json({ error: 'Failed to upload image: ' + uploadError.message });
      }
    }

    const product = new Product({
      name,
      slug,
      category,
      description,
      sizeOptions: parsedSizeOptions,
      discount: discount || 0,
      material,
      bagSize,
      weight,
      printType,
      closure,
      themeColor,
      specifications: parsedSpecifications,
      featured: featured === 'true' || featured === true,
      benefits: parsedBenefits,
      industries: parsedIndustries,
      faqs: parsedFaqs,
      customizationTypes: parsedCustomizationTypes,
      manufacturingProcess,
      materialComposition,
      printingDetails,
      image: imageUrl,
      imagePublicId,
      images
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    deleteTempFiles(req.files || req.file);
    res.status(500).json({ error: 'Failed to create product: ' + error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    console.info('🔴 Update request received for ID:', req.params.id);
    console.info('📦 Request body:', req.body);
    console.info('📦 sizeOptions type:', typeof req.body.sizeOptions);
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      deleteTempFiles(req.files || req.file);
      return res.status(404).json({ error: 'Product not found' });
    }
    console.info('📄 Found product:', product.name);

    const updates = {};
    
    // Handle regular fields - allow empty strings for optional fields
    const fields = ['name', 'category', 'description', 'discount', 'material', 
                   'bagSize', 'weight', 'printType', 'closure', 'featured',
                   'manufacturingProcess', 'materialComposition', 'printingDetails', 'themeColor'];
    
    fields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        // For boolean fields like featured
        if (field === 'featured') {
          updates[field] = req.body[field] === 'true' || req.body[field] === true;
        } else {
          // For optional string fields, allow empty strings
          updates[field] = req.body[field];
        }
      }
    });

    // Handle sizeOptions
    if (req.body.sizeOptions) {
      let parsedSizeOptions = req.body.sizeOptions;
      if (typeof req.body.sizeOptions === 'string') {
        try {
          parsedSizeOptions = JSON.parse(req.body.sizeOptions);
        } catch (e) {
          deleteTempFiles(req.files || req.file);
          return res.status(400).json({ error: 'Invalid size options format' });
        }
      }
      updates.sizeOptions = parsedSizeOptions;
    }

    // Handle specifications
    if (req.body.specifications !== undefined) {
      let parsedSpecs = req.body.specifications;
      if (typeof req.body.specifications === 'string') {
        try {
          parsedSpecs = JSON.parse(req.body.specifications);
        } catch (e) {
          deleteTempFiles(req.files || req.file);
          return res.status(400).json({ error: 'Invalid specifications format' });
        }
      }
      updates.specifications = parsedSpecs;
    }

    // Parse dynamic editorial arrays
    const parseJSONFieldUpdate = (field) => {
      if (!field) return undefined;
      if (typeof field === 'string') {
        try { return JSON.parse(field); } catch (e) { return undefined; }
      }
      return field;
    };

    if (req.body.benefits !== undefined) updates.benefits = parseJSONFieldUpdate(req.body.benefits);
    if (req.body.industries !== undefined) updates.industries = parseJSONFieldUpdate(req.body.industries);
    if (req.body.faqs !== undefined) updates.faqs = parseJSONFieldUpdate(req.body.faqs);
    if (req.body.customizationTypes !== undefined) updates.customizationTypes = parseJSONFieldUpdate(req.body.customizationTypes);

    // Handle image upload
    if (req.files && req.files.length > 0) {
      try {
        let newImages = [];
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'products',
            use_filename: true,
            unique_filename: false
          });
          
          newImages.push({
            url: result.secure_url,
            publicId: result.public_id,
            order: (product.images ? product.images.length : 0) + i
          });
          
          if (i === 0 && !product.image) {
            updates.image = result.secure_url;
            updates.imagePublicId = result.public_id;
          }
        }
        
        if (req.body.retainedImages) {
          let retainedImages = [];
          try {
            retainedImages = JSON.parse(req.body.retainedImages);
          } catch (e) {
            deleteTempFiles(req.files || req.file);
            return res.status(400).json({ error: 'Invalid retained images format' });
          }
          const oldImages = (product.images && product.images.length > 0) ? product.images : (product.image ? [{ url: product.image, publicId: product.imagePublicId }] : []);
          
          const imagesToDelete = oldImages.filter(img => !retainedImages.includes(img.url));
          for (const img of imagesToDelete) {
            if (img.publicId) {
              await cloudinary.uploader.destroy(img.publicId).catch(console.error);
            }
          }
          
          const filteredOldImages = oldImages.filter(img => retainedImages.includes(img.url));
          updates.images = [...filteredOldImages, ...newImages];
          
          if (updates.images.length > 0) {
            updates.image = updates.images[0].url;
            updates.imagePublicId = updates.images[0].publicId;
          } else {
            updates.image = '';
            updates.imagePublicId = '';
          }
        } else {
          updates.images = [...(product.images || []), ...newImages];
        }
        
        deleteTempFiles(req.files);
      } catch (uploadError) {
        deleteTempFiles(req.files);
        return res.status(500).json({ error: 'Failed to upload images: ' + uploadError.message });
      }
    } else if (req.file) { // Fallback if single file was sent
      try {
        // Delete old image from Cloudinary if exists
        if (product.imagePublicId) {
          await cloudinary.uploader.destroy(product.imagePublicId);
        }
        
        // Upload new image
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'products',
          use_filename: true,
          unique_filename: false
        });
        
        updates.image = result.secure_url;
        updates.imagePublicId = result.public_id;
        updates.images = [{
          url: result.secure_url,
          publicId: result.public_id,
          order: 0
        }];
        
        // Delete local file
        deleteTempFile(req.file);
      } catch (uploadError) {
        deleteTempFile(req.file);
        return res.status(500).json({ error: 'Failed to upload image: ' + uploadError.message });
      }
    } else {
      // Handle deletion of images when no new images are uploaded
      if (req.body.retainedImages) {
        let retainedImages = [];
        try {
          retainedImages = JSON.parse(req.body.retainedImages);
        } catch (e) {
          return res.status(400).json({ error: 'Invalid retained images format' });
        }
        const oldImages = (product.images && product.images.length > 0) ? product.images : (product.image ? [{ url: product.image, publicId: product.imagePublicId }] : []);
        
        const imagesToDelete = oldImages.filter(img => !retainedImages.includes(img.url));
        for (const img of imagesToDelete) {
          if (img.publicId) {
            await cloudinary.uploader.destroy(img.publicId).catch(console.error);
          }
        }
        
        const filteredOldImages = oldImages.filter(img => retainedImages.includes(img.url));
        updates.images = filteredOldImages;
        
        if (updates.images.length > 0) {
          updates.image = updates.images[0].url;
          updates.imagePublicId = updates.images[0].publicId;
        } else {
          updates.image = '';
          updates.imagePublicId = '';
        }
      }
    }

    console.info('📝 Updates to apply:', JSON.stringify(updates, null, 2));
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    console.info('✅ Product updated successfully');

    // 🔥 CRITICAL FIX: Invalidate Redis cache in damoder-backend
    if (updates.sizeOptions || updates.price_100_percent || updates.price_50_percent) {
      await invalidateProductCache(req.params.id);
      console.info(`🗑️  Redis cache invalidated for product ${req.params.id}`);
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('🔥 Error updating product:', error);
    deleteTempFiles(req.files || req.file);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation failed: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Failed to update product: ' + error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete image from Cloudinary if exists
    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }

    await Product.findByIdAndDelete(req.params.id);
    
    res.json({
      message: 'Product deleted successfully',
      deletedCount: 1
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// Bulk price update (supports dual-tier pricing)
const bulkPriceUpdate = async (req, res) => {
  try {
    console.info('🔵 [BULK PRICE UPDATE] Request received:', req.body);
    const { updates } = req.body; // Array of { productId, sizeIndex, priceType: '100' | '50', newPrice }
    
    if (!Array.isArray(updates)) {
      console.error('❌ [BULK PRICE UPDATE] Updates is not an array');
      return res.status(400).json({ error: 'Updates must be an array' });
    }
    
    console.info(`📦 [BULK PRICE UPDATE] Processing ${updates.length} updates`);
    
    const results = [];
    
    for (const update of updates) {
      const { productId, sizeIndex, priceType, newPrice } = update;
      
      console.info(`🔄 [BULK PRICE UPDATE] Updating product ${productId}, size ${sizeIndex}, type ${priceType}, price ${newPrice}`);
      
      // Validate required fields
      if (!productId) {
        console.error('❌ [BULK PRICE UPDATE] Missing productId');
        results.push({ success: false, error: 'Missing productId' });
        continue;
      }
      
      if (sizeIndex === undefined || sizeIndex === null) {
        console.error('❌ [BULK PRICE UPDATE] Missing sizeIndex');
        results.push({ success: false, error: 'Missing sizeIndex' });
        continue;
      }
      
      if (!priceType || !['100', '50'].includes(priceType)) {
        console.error(`❌ [BULK PRICE UPDATE] Invalid priceType: ${priceType}`);
        results.push({ success: false, error: 'Invalid priceType' });
        continue;
      }
      
      if (newPrice === undefined || newPrice === null) {
        console.error('❌ [BULK PRICE UPDATE] Missing newPrice');
        results.push({ success: false, error: 'Missing newPrice' });
        continue;
      }
      
      const product = await Product.findById(productId);
      if (!product) {
        console.error(`❌ [BULK PRICE UPDATE] Product not found: ${productId}`);
        results.push({ productId, success: false, error: 'Product not found' });
        continue;
      }
      
      if (!product.sizeOptions[sizeIndex]) {
        console.error(`❌ [BULK PRICE UPDATE] Invalid size index ${sizeIndex} for product ${productId}. Total sizes: ${product.sizeOptions.length}`);
        results.push({ productId, success: false, error: 'Invalid size index' });
        continue;
      }
      
      // Use direct MongoDB update to avoid full document validation
      const updateField = priceType === '100' 
        ? `sizeOptions.${sizeIndex}.price_100_percent`
        : `sizeOptions.${sizeIndex}.price_50_percent`;
      
      const updateQuery = {
        $set: {
          [updateField]: Number(newPrice),
          priceUpdatedAt: new Date()
        }
      };
      
      await Product.findByIdAndUpdate(productId, updateQuery, { runValidators: false });
      console.info(`✅ [BULK PRICE UPDATE] Updated ${priceType}% price to ${newPrice}`);
      
      // 🔥 CRITICAL FIX: Invalidate Redis cache in damoder-backend
      await invalidateProductCache(productId);
      console.info(`🗑️  [BULK PRICE UPDATE] Redis cache invalidated for product ${productId}`);
      
      results.push({ productId, success: true, priceType, newPrice });
    }
    
    console.info(`🎉 [BULK PRICE UPDATE] Completed. Success: ${results.filter(r => r.success).length}, Failed: ${results.filter(r => !r.success).length}`);
    
    res.json({
      message: 'Bulk price update completed',
      results
    });
  } catch (error) {
    console.error('❌ [BULK PRICE UPDATE] Error:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Failed to update prices: ' + error.message });
  }
};

// Import products from Excel/CSV
const importProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a file' });
    }
    
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    const imported = [];
    const errors = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // Validate required fields
        if (!row.name || !row.category) {
          errors.push({ row: i + 2, error: 'Missing required fields (name, category)' });
          continue;
        }
        
        // Parse size options from row with dual-tier pricing (3-column format: Size | 100% Price | 50% Price)
        const sizeOptions = [];
        
        // Look for size columns and their corresponding prices
        // Expected format: "Size" | "100% Price" or "Price Full" | "50% Price" or "Price Half"
        const sizeColumns = Object.keys(row).filter(key => 
          key.toLowerCase().includes('size') || 
          key.match(/^\d/) || // Starts with number like "1/2", "3/4"
          key.toLowerCase() === 'size'
        );
        
        for (const sizeKey of sizeColumns) {
          const sizeValue = sizeKey.trim();
          
          // Skip if this looks like a price column header
          if (sizeKey.toLowerCase().includes('price')) continue;
          
          if (!row[sizeKey]) continue; // Skip empty sizes
          
          // Try to find corresponding price columns
          let price100 = 0;
          let price50 = 0;
          
          // Look for "100% Price" or "Full Price" column
          const price100Key = Object.keys(row).find(k => 
            (k.includes('100') || k.toLowerCase().includes('full') || k.toLowerCase() === 'price') &&
            !k.toLowerCase().includes('50') &&
            !k.toLowerCase().includes('half')
          );
          
          // Look for "50% Price" or "Half Price" column
          const price50Key = Object.keys(row).find(k => 
            k.includes('50') || k.toLowerCase().includes('half') || k.toLowerCase().includes('wholesale')
          );
          
          if (price100Key && row[price100Key]) {
            price100 = Number(row[price100Key]) || 0;
          }
          
          if (price50Key && row[price50Key]) {
            price50 = Number(row[price50Key]) || 0;
          }
          
          // If we found at least one price, add the size option
          if (price100 > 0 || price50 > 0) {
            sizeOptions.push({
              size: String(row[sizeKey]).trim(),
              price_100_percent: price100,
              price_50_percent: price50,
              availability: true,
              stock: 0
            });
          }
        }
        
        // Create product
        const productData = {
          name: row.name,
          category: row.category,
          brand: row.brand || '',
          productCode: row.productCode || row.code || '',
          description: row.description || '',
          sizeOptions: sizeOptions.length > 0 ? sizeOptions : [{ size: 'Standard', price: 0 }],
          material: row.material || '',
          bagSize: row.bagSize || '',
          weight: row.weight || '',
          printType: row.printType || '',
          closure: row.closure || '',
          specifications: []
        };
        
        const product = new Product(productData);
        await product.save();
        imported.push({ row: i + 2, productId: product._id, name: product.name });
        
      } catch (err) {
        errors.push({ row: i + 2, error: err.message });
      }
    }
    
    // Delete uploaded file
    deleteTempFile(req.file);
    
    res.json({
      message: 'Import completed',
      summary: {
        total: data.length,
        imported: imported.length,
        errors: errors.length
      },
      imported,
      errors
    });
  } catch (error) {
    deleteTempFile(req.file);
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import products: ' + error.message });
  }
};

// Search products by size
const searchBySize = async (req, res) => {
  try {
    const { size } = req.query;
    
    if (!size) {
      return res.status(400).json({ error: 'Size parameter is required' });
    }
    
    const products = await Product.find({
      'sizeOptions.size': new RegExp(size, 'i')
    }).sort({ createdAt: -1 });
    
    // Filter size options to only match the searched size
    const filteredProducts = products.map(product => {
      const matchingSizes = product.sizeOptions.filter(s => 
        s.size.toLowerCase().includes(size.toLowerCase())
      );
      
      return {
        ...product.toObject(),
        matchedSizes: matchingSizes
      };
    });
    
    res.json(filteredProducts);
  } catch (error) {
    console.error('Search by size error:', error);
    res.status(500).json({ error: 'Failed to search by size' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkPriceUpdate,
  importProducts,
  searchBySize
};

