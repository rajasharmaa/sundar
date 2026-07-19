// 📥 CSV IMPORT SERVICE
// Bulk product upload via CSV files

const { ObjectId } = require('mongodb');
const { connectToDB } = require('../config/database');
const logger = require('../utils/logger');
const cacheService = require('../utils/cache-service');
const { generateProductSlug } = require('../utils/slug-generator');

/**
 * Parse CSV content and validate data
 * @param {string} csvContent - Raw CSV content
 * @returns {Promise<Array>} Array of parsed products
 */
const parseCSV = async (csvContent) => {
  const lines = csvContent.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }
  
  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const requiredFields = ['name', 'category', 'price', 'description'];
  const missingFields = requiredFields.filter(field => !headers.includes(field));
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  const products = [];
  const errors = [];
  
  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i]);
      
      if (values.length !== headers.length) {
        errors.push({ row: i + 1, error: `Column count mismatch. Expected ${headers.length}, got ${values.length}` });
        continue;
      }
      
      const product = {};
      headers.forEach((header, index) => {
        product[header] = values[index]?.trim() || '';
      });
      
      // Validate and transform data
      const validation = validateProduct(product);
      if (!validation.valid) {
        errors.push({ row: i + 1, error: validation.errors.join(', ') });
        continue;
      }
      
      // Generate slug
      product.slug = await generateProductSlug(product.name);
      
      // Transform price to number
      product.price = parseFloat(product.price);
      
      // Transform specifications if present
      if (product.specifications) {
        product.specifications = parseSpecifications(product.specifications);
      }
      
      // Set defaults
      product.active = product.active !== 'false';
      product.inStock = product.inStock !== 'false';
      product.featured = product.featured === 'true';
      
      products.push(product);
    } catch (error) {
      errors.push({ row: i + 1, error: error.message });
    }
  }
  
  return { products, errors };
};

/**
 * Parse a single CSV line handling quoted values
 */
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

/**
 * Validate product data
 */
const validateProduct = (product) => {
  const errors = [];
  
  if (!product.name || product.name.length < 3) {
    errors.push('Name must be at least 3 characters');
  }
  
  if (!product.category) {
    errors.push('Category is required');
  }
  
  if (!product.price || isNaN(product.price) || product.price < 0) {
    errors.push('Price must be a positive number');
  }
  
  if (!product.description || product.description.length < 10) {
    errors.push('Description must be at least 10 characters');
  }
  
  if (product.price > 1000000) {
    errors.push('Price seems too high');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Parse specifications string to object
 * Format: "key1:value1|key2:value2"
 */
const parseSpecifications = (specString) => {
  const specs = new Map();
  
  if (!specString) return specs;
  
  const pairs = specString.split('|');
  pairs.forEach(pair => {
    const [key, value] = pair.split(':');
    if (key && value) {
      specs.set(key.trim(), value.trim());
    }
  });
  
  return specs;
};

/**
 * Bulk insert products with batch processing
 * @param {Array} products - Array of product objects
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload results
 */
const bulkInsertProducts = async (products, options = {}) => {
  const {
    batchSize = 100,
    dryRun = false,
    userId = null
  } = options;
  
  const db = await connectToDB();
  const productsCollection = db.collection('products');
  
  const results = {
    total: products.length,
    inserted: 0,
    failed: 0,
    errors: []
  };
  
  if (dryRun) {
    logger.info(`📊 Dry run: Would insert ${products.length} products`);
    return { ...results, message: `Dry run completed. Would insert ${products.length} products.` };
  }
  
  // Process in batches
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(products.length / batchSize);
    
    logger.info(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} products)`);
    
    try {
      // Insert batch
      const insertResult = await productsCollection.insertMany(
        batch.map(product => ({
          ...product,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: userId ? new ObjectId(userId) : null
        }))
      );
      
      results.inserted += insertResult.insertedCount;
      
      // Invalidate cache after each batch
      await cacheService.invalidatePattern('products:*');
      
    } catch (error) {
      logger.error(`Batch ${batchNumber} error:`, error.message);
      results.failed += batch.length;
      results.errors.push({
        batch: batchNumber,
        error: error.message
      });
    }
    
    // Small delay between batches to prevent overwhelming the database
    if (i + batchSize < products.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  logger.info(`✅ Bulk upload completed: ${results.inserted}/${results.total} products inserted`);
  
  return results;
};

/**
 * Generate CSV template
 */
const generateCSVTemplate = () => {
  const headers = [
    'name',
    'slug',
    'sku',
    'category',
    'brand',
    'price',
    'discount',
    'description',
    'image',
    'inStock',
    'featured',
    'active',
    'specifications',
    'tags'
  ];
  
  const exampleRow = [
    'Stainless Steel Ball Valve',
    'stainless-steel-ball-valve',
    'SS-BV-001',
    'Valves',
    'Brand Name',
    '150.00',
    '10',
    'High-quality stainless steel ball valve for industrial applications',
    'https://example.com/image.jpg',
    'true',
    'false',
    'true',
    'Material:Stainless Steel|Size:1 inch|Pressure:300 PSI',
    'valves,steel,industrial'
  ];
  
  return [headers.join(','), exampleRow.join(',')].join('\n');
};

/**
 * Get upload progress
 */
const getUploadProgress = async (jobId) => {
  // This would integrate with a job queue system
  // For now, return mock progress
  return {
    jobId,
    status: 'completed',
    progress: 100,
    processed: 0,
    total: 0
  };
};

module.exports = {
  parseCSV,
  parseCSVLine,
  validateProduct,
  parseSpecifications,
  bulkInsertProducts,
  generateCSVTemplate,
  getUploadProgress
};
