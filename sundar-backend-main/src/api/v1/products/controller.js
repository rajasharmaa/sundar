const { ObjectId } = require('mongodb');
const cacheService = require('../../../utils/cache-service');
const { connectToDB } = require('../../../config/database');
const { sanitizeSearchQuery } = require('../../../utils/validation');
const logger = require('../../../utils/logger');
const { createError, sendErrorResponse } = require('../../../utils/secure-error-handler');

const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    // 🔧 M1-5 FIX: Reduced default limit from 100 to 24 for better performance
    const limit = Math.min(parseInt(req.query.limit) || 24, 100);
    const cacheKey = `products:all:${page}:${limit}`;

    const result = await cacheService.getCached(
      cacheKey,
      async () => {
        const db = await connectToDB();
        const productsCollection = db.collection('products');
        const skip = (page - 1) * limit;
        const query = { active: { $ne: false } };

        // 🔧 M1-5 FIX: Run find + countDocuments in parallel instead of returning products.length
        const [products, total] = await Promise.all([
          productsCollection.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray(),
          productsCollection.countDocuments(query)
        ]);

        const mappedProducts = products.map(item => ({
          ...item,
          id: item._id ? item._id.toString() : item.id
        }));

        return { items: mappedProducts, total };
      },
      { ttl: 300 }
    );

    res.json({
      data: result.items,
      pagination: {
        page,
        limit,
        total: result.total  // ✅ Real total count from DB
      }
    });
  } catch (err) {
    logger.error('Get products error:', {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });
    const error = createError.internal('Product listing service temporarily unavailable');
    return sendErrorResponse(res, error, req.requestId);
  }
};

const getProductById = async (req, res) => {
  try {
    // ID validated by Zod
    const productId = req.params.id;
    const cacheKey = `product:${productId}`;

    const product = await cacheService.getCached(
      cacheKey,
      async () => {
        const db = await connectToDB();
        const productsCollection = db.collection('products');
        
        // Support finding by ObjectId or slug
        const query = { active: { $ne: false } };
        
        // Check if productId is a valid 24-character hex string (ObjectId)
        if (ObjectId.isValid(productId) && String(productId).length === 24) {
          query.$or = [
            { _id: new ObjectId(productId) },
            { slug: productId }
          ];
        } else {
          query.slug = productId;
        }

        const product = await productsCollection.findOne(query);

        if (!product) {
          return null; // Will trigger 404 error below
        }

        // Map _id to id for frontend compatibility
        return {
          ...product,
          id: product._id ? product._id.toString() : product.id
        };
      },
      { ttl: 600 }
    );

    if (!product) {
      const error = createError.productNotFound();
      return sendErrorResponse(res, error, req.requestId);
    }
    res.json({
      success: true,
      data: product
    });
  } catch (err) {
    logger.error('Get product by ID error:', {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });
    const error = createError.internal('Product details service temporarily unavailable');
    return sendErrorResponse(res, error, req.requestId);
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category.toLowerCase().trim();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const cacheKey = `products:category:${category}:${page}:${limit}`;

    const products = await cacheService.getCached(
      cacheKey,
      async () => {
        const db = await connectToDB();
        const productsCollection = db.collection('products');
        const skip = (page - 1) * limit;

        let products = await productsCollection.find({
          category: { $regex: new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          active: { $ne: false }
        })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();

        // Map _id to id for frontend compatibility
        products = products.map(item => ({
          ...item,
          id: item._id ? item._id.toString() : item.id
        }));

        return products;
      },
      { ttl: 300 }
    );

    // Add pagination metadata
    res.json({
      data: products,
      pagination: {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
        total: products.length
      }
    });
  } catch (err) {
    logger.error('Get products by category error:', {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });
    const error = createError.internal('Category products service temporarily unavailable');
    return sendErrorResponse(res, error, req.requestId);
  }
};

const getPopularProducts = async (req, res) => {
  const requestId = req.requestId;
  const isWarming = req.headers['x-server-warming'] === 'true';

  try {
    logger.debug('Popular products request', {
      requestId,
      isWarming,
      userAgent: req.headers['user-agent']?.substring(0, 50)
    });

    // 🔧 HANDLE SERVER WARM-UP GRACEFULLY - Return empty array instead of 503
    if (isWarming) {
      logger.info('❄️ Server warming detected for popular products request');

      // Return empty array during warm-up to prevent frontend errors
      return res.json([]);
    }

    const cacheKey = 'products:popular';

    const products = await cacheService.getCached(
      cacheKey,
      async () => {
        const db = await connectToDB();
        const productsCollection = db.collection('products');
        let products = await productsCollection.find({ active: { $ne: false }, featured: true })
          .sort({ createdAt: -1 }) // Sort by creation date instead of views
          .limit(30)
          .toArray();

        // Map _id to id for frontend compatibility
        products = products.map(item => ({
          ...item,
          id: item._id ? item._id.toString() : item.id
        }));

        return products;
      },
      { ttl: 600 }
    );

    logger.debug('Popular products retrieved successfully', {
      requestId,
      count: products.length
    });

    // Return consistent format with data property for frontend compatibility
    res.json({
      success: true,
      data: products
    });
  } catch (err) {
    logger.error('Get popular products error:', {
      requestId,
      isWarming,
      error: err.message,
      stack: err.stack
    });

    // 🔧 GRACEFUL DEGRADATION FOR SERVER WARM-UP
    if (isWarming) {
      logger.warn('Popular products service error during warm-up, returning empty array', {
        requestId,
        error: err.message
      });
      return res.json([]);
    }

    const error = createError.internal('Popular products service temporarily unavailable');
    return sendErrorResponse(res, error, requestId);
  }
};

const searchProducts = async (req, res) => {
  const requestId = req.requestId;

  try {
    let { search, category } = req.query;

    // Sanitize inputs
    search = sanitizeSearchQuery(search);
    category = sanitizeSearchQuery(category);

    // Generate cache key with proper escaping
    const cacheKey = `products:search:${encodeURIComponent(search || 'all')}:${encodeURIComponent(category || 'all')}`;

    const searchResults = await cacheService.getCached(
      cacheKey,
      async () => {
        try {
          const db = await connectToDB();
          const productsCollection = db.collection('products');
          const query = { active: { $ne: false } };

          // Enhanced search logic with proper indexing detection
          if (search) {
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            try {
              // Check for text index with timeout
              const indexesPromise = productsCollection.indexes();
              const indexesTimeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Indexes check timeout')), 3000)
              );

              const indexes = await Promise.race([indexesPromise, indexesTimeout]);
              const hasTextIndex = indexes.some(idx =>
                idx.name === 'text_search_index' ||
                (idx.key && Object.values(idx.key).includes('text'))
              );

              if (hasTextIndex && search.trim().length >= 2) {
                query.$text = { $search: search };
                logger.debug('Using text search index', { requestId, search });
              } else {
                // Fallback to regex search
                query.$or = [
                  { name: { $regex: escapedSearch, $options: 'i' } },
                  { description: { $regex: escapedSearch, $options: 'i' } },
                  { tags: { $regex: escapedSearch, $options: 'i' } }
                ];
                logger.debug('Using regex search fallback', { requestId, search });
              }
            } catch (indexError) {
              logger.warn('Index check failed, using regex fallback', {
                requestId,
                error: indexError.message
              });

              // Safe fallback
              query.$or = [
                { name: { $regex: escapedSearch, $options: 'i' } },
                { description: { $regex: escapedSearch, $options: 'i' } },
                { tags: { $regex: escapedSearch, $options: 'i' } }
              ];
            }
          }

          // Add category filter if specified
          if (category) {
            query.category = { $regex: new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
          }

          // Execute query with timeout protection
          const findPromise = productsCollection.find(query)
            .sort({ createdAt: -1, views: -1 }) // Sort by recency and popularity
            .limit(50)
            .toArray();

          const findTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Database query timeout')), 10000)
          );

          let products = await Promise.race([findPromise, findTimeout]);

          // Map _id to id for frontend compatibility
          products = products.map(item => ({
            ...item,
            id: item._id ? item._id.toString() : item.id
          }));

          return products;
        } catch (innerErr) {
          logger.error('Inner search error:', innerErr);
          throw innerErr;
        }
      },
      { ttl: 120 }
    );

    // Return consistent format with data property for frontend compatibility
    res.json({
      success: true,
      data: searchResults
    });

  } catch (err) {
    logger.error('Search products critical error:', {
      requestId,
      error: err.message,
      stack: err.stack
    });

    const error = createError.internal('Search service error');
    return sendErrorResponse(res, error, requestId);
  }
};

const getSearchSuggestions = async (req, res) => {
  try {
    let { query } = req.query;
    // Zod checks min length 2, so we can skip that check here if we trust it, but keeping logic is fine.

    query = sanitizeSearchQuery(query);
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cacheKey = `products:suggestions:${query}`;

    const suggestions = await cacheService.getCached(
      cacheKey,
      async () => {
        const db = await connectToDB();
        const productsCollection = db.collection('products');

        let suggestions = await productsCollection.aggregate([
          {
            $match: {
              active: { $ne: false },
              $or: [
                { name: { $regex: escapedQuery, $options: 'i' } },
                { category: { $regex: escapedQuery, $options: 'i' } },
                { tags: { $regex: escapedQuery, $options: 'i' } }
              ]
            }
          },
          { $limit: 5 },
          { $project: { name: 1, category: 1, _id: 1, image: 1, images: 1, price: 1 } }
        ]).toArray();

        // Map _id to id for frontend compatibility
        suggestions = suggestions.map(item => ({
          ...item,
          id: item._id.toString()
        }));

        return suggestions;
      },
      { ttl: 300 }
    );
    // Return consistent format with data property for frontend compatibility
    res.json({
      success: true,
      data: suggestions
    });
  } catch (err) {
    logger.error('Search suggestions error:', {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });
    res.json({
      success: false,
      data: [],
      error: err.message
    });
  }
};

const invalidateProductCache = async (productId) => {
  await cacheService.delete(`product:${productId}`);
  await cacheService.invalidatePattern('products:all:');
  await cacheService.invalidatePattern('products:page:');
  await cacheService.invalidatePattern('products:category:');
  await cacheService.invalidatePattern('products:search:');
  await cacheService.invalidatePattern('products:suggestions:');
  await cacheService.invalidatePattern('products:popular');
  // Also clear slug-based cache — storefront uses slug URLs
  await cacheService.invalidatePattern('product:slug:');
  logger.info(`✅ [CACHE] Full product cache invalidated for product ${productId}`);
};

// Track product view - Increment view count
const trackProductView = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectToDB();
    const productsCollection = db.collection('products');

    // Increment views by 1
    const result = await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { views: 1 } }
    );

    if (result.matchedCount === 0) {
      throw createError.notFound('Product not found');
    }

    // Get updated product to return new view count
    const product = await productsCollection.findOne({ _id: new ObjectId(id) });

    res.json({
      success: true,
      data: {
        productId: id,
        views: product.views || 0
      }
    });
  } catch (err) {
    logger.error('Track product view error:', {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });
    const error = createError.internal('Failed to track product view');
    return sendErrorResponse(res, error, req.requestId);
  }
};

// Get related products based on category and similar attributes
const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 6;

    const db = await connectToDB();
    const productsCollection = db.collection('products');

    // Get the current product to determine its category
    const currentProduct = await productsCollection.findOne({ _id: new ObjectId(id) });

    if (!currentProduct) {
      const error = createError.productNotFound();
      return sendErrorResponse(res, error, req.requestId);
    }

    // Find products in the same category, excluding the current product
    const relatedProducts = await productsCollection.find({
      category: { $regex: new RegExp(`^${currentProduct.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      active: { $ne: false },
      _id: { $ne: new ObjectId(id) }
    })
      .sort({ createdAt: -1, views: -1 })
      .limit(limit)
      .toArray();

    // Map _id to id for frontend compatibility
    const products = relatedProducts.map(item => ({
      ...item,
      id: item._id ? item._id.toString() : item.id
    }));

    res.json({
      success: true,
      data: products
    });
  } catch (err) {
    logger.error('Get related products error:', {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });
    const error = createError.internal('Related products service temporarily unavailable');
    return sendErrorResponse(res, error, req.requestId);
  }
};

// Get popular products in a specific category
const getPopularInCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit) || 6;
    const excludeId = req.query.exclude;

    const db = await connectToDB();
    const productsCollection = db.collection('products');

    // Build query
    const query = {
      category: { $regex: new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      active: { $ne: false }
    };

    // Exclude specific product if provided
    if (excludeId) {
      query._id = { $ne: new ObjectId(excludeId) };
    }

    const products = await productsCollection.find(query)
      .sort({ views: -1, createdAt: -1 })
      .limit(limit)
      .toArray();

    // Map _id to id for frontend compatibility
    const popularProducts = products.map(item => ({
      ...item,
      id: item._id ? item._id.toString() : item.id
    }));

    res.json({
      success: true,
      data: popularProducts
    });
  } catch (err) {
    logger.error('Get popular in category error:', {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });
    const error = createError.internal('Popular category products service temporarily unavailable');
    return sendErrorResponse(res, error, req.requestId);
  }
};

// Get product by SEO-friendly slug
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const cacheKey = `product:slug:${slug}`;

    const product = await cacheService.getCached(
      cacheKey,
      async () => {
        const db = await connectToDB();
        const productsCollection = db.collection('products');
        const product = await productsCollection.findOne({
          slug: slug,
          active: { $ne: false }
        });

        if (!product) {
          return null;
        }

        // Map _id to id for frontend compatibility
        return {
          ...product,
          id: product._id ? product._id.toString() : product.id
        };
      },
      { ttl: 600 }
    );

    if (!product) {
      const error = createError.productNotFound();
      return sendErrorResponse(res, error, req.requestId);
    }

    res.json({
      success: true,
      data: product
    });
  } catch (err) {
    logger.error('Get product by slug error:', {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });
    const error = createError.internal('Product details service temporarily unavailable');
    return sendErrorResponse(res, error, req.requestId);
  }
};

// Bulk price update (supports dual-tier pricing)
const bulkPriceUpdate = async (req, res) => {
  try {
    logger.info('🔵 [BULK PRICE UPDATE] Request received:', { body: req.body });
    const { updates } = req.body; // Array of { productId, sizeIndex, priceType: '100' | '50', newPrice }

    if (!Array.isArray(updates)) {
      logger.error('❌ [BULK PRICE UPDATE] Updates is not an array');
      return res.status(400).json({
        success: false,
        error: 'Updates must be an array'
      });
    }

    logger.info(`📦 [BULK PRICE UPDATE] Processing ${updates.length} updates`);

    const results = [];
    const db = await connectToDB();
    const productsCollection = db.collection('products');

    // 🔧 M3-3 FIX: Fetch all existing products in one query
    const productIds = [...new Set(updates.map(u => u.productId).filter(Boolean))];
    const existingProducts = await productsCollection
      .find({ _id: { $in: productIds.map(id => new ObjectId(id)) } })
      .project({ _id: 1, sizeOptions: 1 })
      .toArray();
    const productMap = new Map(existingProducts.map(p => [p._id.toString(), p]));

    const bulkOps = [];
    const cacheInvalidationIds = new Set();

    for (const update of updates) {
      const { productId, sizeIndex, priceType, newPrice } = update;

      logger.info(`🔄 [BULK PRICE UPDATE] Updating product ${productId}, size ${sizeIndex}, type ${priceType}, price ${newPrice}`);

      // Validate required fields
      if (!productId) {
        logger.error('❌ [BULK PRICE UPDATE] Missing productId');
        results.push({ success: false, error: 'Missing productId' });
        continue;
      }

      if (sizeIndex === undefined || sizeIndex === null) {
        logger.error('❌ [BULK PRICE UPDATE] Missing sizeIndex');
        results.push({ success: false, error: 'Missing sizeIndex' });
        continue;
      }

      if (!priceType || !['100', '50'].includes(priceType)) {
        logger.error(`❌ [BULK PRICE UPDATE] Invalid priceType: ${priceType}`);
        results.push({ success: false, error: 'Invalid priceType' });
        continue;
      }

      if (newPrice === undefined || newPrice === null) {
        logger.error('❌ [BULK PRICE UPDATE] Missing newPrice');
        results.push({ success: false, error: 'Missing newPrice' });
        continue;
      }

      // 🔧 M3-3 FIX: Use pre-fetched product map instead of sequential findOne
      const product = productMap.get(productId);
      if (!product) {
        logger.error(`❌ [BULK PRICE UPDATE] Product not found: ${productId}`);
        results.push({ productId, success: false, error: 'Product not found' });
        continue;
      }

      if (!product.sizeOptions[sizeIndex]) {
        logger.error(`❌ [BULK PRICE UPDATE] Invalid size index ${sizeIndex} for product ${productId}. Total sizes: ${product.sizeOptions.length}`);
        results.push({ productId, success: false, error: 'Invalid size index' });
        continue;
      }

      // Update appropriate price field based on priceType
      const updateQuery = {};
      if (priceType === '100') {
        updateQuery[`sizeOptions.${sizeIndex}.price_100_percent`] = Number(newPrice);
        logger.info(`✅ [BULK PRICE UPDATE] Queued 100% price to ${newPrice}`);
      } else if (priceType === '50') {
        updateQuery[`sizeOptions.${sizeIndex}.price_50_percent`] = Number(newPrice);
        logger.info(`✅ [BULK PRICE UPDATE] Queued 50% price to ${newPrice}`);
      } else {
        logger.error(`❌ [BULK PRICE UPDATE] Invalid price type: ${priceType}`);
        results.push({ productId, success: false, error: 'Invalid price type' });
        continue;
      }

      // 🔧 M3-3 FIX: Add to bulkOps array instead of awaiting sequential updateOne
      bulkOps.push({
        updateOne: {
          filter: { _id: new ObjectId(productId) },
          update: {
            $set: {
              ...updateQuery,
              priceUpdatedAt: new Date()
            }
          }
        }
      });

      cacheInvalidationIds.add(productId);
      results.push({ productId, success: true, priceType, newPrice });
    }

    // 🔧 M3-3 FIX: Execute all updates in a single database roundtrip
    if (bulkOps.length > 0) {
      await productsCollection.bulkWrite(bulkOps, { ordered: false });
      logger.info(`✅ [BULK PRICE UPDATE] Saved ${bulkOps.length} updates to database`);

      // 🔥 CRITICAL FIX: Invalidate Redis cache for products in parallel
      await Promise.all(Array.from(cacheInvalidationIds).map(id => invalidateProductCache(id)));
      logger.info(`🗑️ [BULK PRICE UPDATE] Cache invalidated for ${cacheInvalidationIds.size} products`);
    }

    logger.info(`🎉 [BULK PRICE UPDATE] Completed. Success: ${results.filter(r => r.success).length}, Failed: ${results.filter(r => !r.success).length}`);

    res.json({
      success: true,
      message: 'Bulk price update completed',
      results
    });
  } catch (error) {
    logger.error('❌ [BULK PRICE UPDATE] Error:', error);
    logger.error('Stack trace:', error.stack);
    const err = createError.internal('Failed to update prices: ' + error.message);
    return sendErrorResponse(res, err, req.requestId);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductsByCategory,
  getPopularProducts,
  searchProducts,
  getSearchSuggestions,
  invalidateProductCache,
  trackProductView,
  getRelatedProducts,
  getPopularInCategory,
  getProductBySlug,
  bulkPriceUpdate
};
