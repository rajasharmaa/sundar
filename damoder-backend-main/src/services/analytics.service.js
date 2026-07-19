// 📊 ANALYTICS SERVICE
// Comprehensive analytics and metrics for admin dashboard

const { ObjectId } = require('mongodb');
const { connectToDB } = require('../config/database');
const cacheService = require('../utils/cache-service');
const logger = require('../utils/logger');

/**
 * Get comprehensive dashboard analytics
 */
const getDashboardAnalytics = async (options = {}) => {
  const { 
    startDate, 
    endDate, 
    limit = 10 
  } = options;
  
  const cacheKey = `analytics:dashboard:${startDate || 'all'}:${endDate || 'all'}`;
  
  return await cacheService.getCached(cacheKey, async () => {
    const db = await connectToDB();
    
    // Run parallel queries
    const [
      productStats,
      categoryStats,
      inquiryStats,
      userStats,
      viewStats
    ] = await Promise.all([
      getProductStats(db),
      getCategoryStats(db),
      getInquiryStats(db, { startDate, endDate }),
      getUserStats(db),
      getViewStats(db, { limit })
    ]);
    
    return {
      overview: {
        totalProducts: productStats.total,
        activeProducts: productStats.active,
        totalCategories: categoryStats.total,
        totalInquiries: inquiryStats.total,
        totalUsers: userStats.total,
        totalViews: viewStats.total
      },
      products: productStats,
      categories: categoryStats,
      inquiries: inquiryStats,
      users: userStats,
      views: viewStats,
      timestamp: new Date().toISOString()
    };
  }, { ttl: 300 });
};

/**
 * Get product statistics
 */
const getProductStats = async (db) => {
  const productsCollection = db.collection('products');
  
  const total = await productsCollection.countDocuments();
  const active = await productsCollection.countDocuments({ active: { $ne: false } });
  const featured = await productsCollection.countDocuments({ featured: true });
  const outOfStock = await productsCollection.countDocuments({ inStock: false });
  
  // Get average price
  const avgPriceResult = await productsCollection.aggregate([
    { $match: { active: { $ne: false } } },
    { $group: { _id: null, avgPrice: { $avg: '$price' } } }
  ]).toArray();
  
  const avgPrice = avgPriceResult[0]?.avgPrice || 0;
  
  // Get price range
  const priceRangeResult = await productsCollection.aggregate([
    { $match: { active: { $ne: false } } },
    { 
      $group: { 
        _id: null, 
        minPrice: { $min: '$price' }, 
        maxPrice: { $max: '$price' } 
      } 
    }
  ]).toArray();
  
  return {
    total,
    active,
    featured,
    outOfStock,
    avgPrice: Math.round(avgPrice * 100) / 100,
    minPrice: priceRangeResult[0]?.minPrice || 0,
    maxPrice: priceRangeResult[0]?.maxPrice || 0
  };
};

/**
 * Get category statistics
 */
const getCategoryStats = async (db) => {
  const categoriesCollection = db.collection('categories');
  
  const total = await categoriesCollection.countDocuments();
  const active = await categoriesCollection.countDocuments({ active: { $ne: false } });
  
  // Get products per category
  const productsPerCategory = await categoriesCollection.aggregate([
    { $match: { active: { $ne: false } } },
    {
      $lookup: {
        from: 'products',
        localField: 'name',
        foreignField: 'category',
        as: 'products'
      }
    },
    {
      $project: {
        name: 1,
        slug: 1,
        productCount: { $size: '$products' }
      }
    },
    { $sort: { productCount: -1 } },
    { $limit: 10 }
  ]).toArray();
  
  return {
    total,
    active,
    topCategories: productsPerCategory
  };
};

/**
 * Get inquiry statistics
 */
const getInquiryStats = async (db, options = {}) => {
  const inquiriesCollection = db.collection('inquiries');
  
  const { startDate, endDate } = options;
  
  let query = {};
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const total = await inquiriesCollection.countDocuments(query);
  
  // Status breakdown
  const statusBreakdown = await inquiriesCollection.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]).toArray();
  
  // Recent inquiries trend (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const dailyTrend = await inquiriesCollection.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]).toArray();
  
  return {
    total,
    statusBreakdown: statusBreakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    dailyTrend
  };
};

/**
 * Get user statistics
 */
const getUserStats = async (db) => {
  const usersCollection = db.collection('users');
  
  const total = await usersCollection.countDocuments();
  const active = await usersCollection.countDocuments({
    $or: [
      { isActive: { $ne: false } },
      { active: { $ne: false } }
    ]
  });
  
  // New users in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const newUsers = await usersCollection.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });
  
  return {
    total,
    active,
    newUsersLast30Days: newUsers
  };
};

/**
 * Get view statistics - Most viewed products
 */
const getViewStats = async (db, options = {}) => {
  const { limit = 10 } = options;
  
  const productsCollection = db.collection('products');
  
  const mostViewed = await productsCollection.find(
    { active: { $ne: false } }
  )
    .sort({ views: -1 })
    .limit(limit)
    .project({
      _id: 1,
      name: 1,
      slug: 1,
      image: 1,
      category: 1,
      views: 1,
      inquiryCount: 1
    })
    .toArray();
  
  // Calculate total views
  const totalViewsResult = await productsCollection.aggregate([
    { $match: { active: { $ne: false } } },
    { $group: { _id: null, totalViews: { $sum: '$views' } } }
  ]).toArray();
  
  const totalViews = totalViewsResult[0]?.totalViews || 0;
  
  return {
    total: totalViews,
    mostViewed: mostViewed.map(p => ({
      ...p,
      id: p._id.toString()
    }))
  };
};

/**
 * Get conversion rate (views to inquiries)
 */
const getConversionRate = async (productId = null) => {
  const db = await connectToDB();
  const productsCollection = db.collection('products');
  const inquiriesCollection = db.collection('inquiries');
  
  let query = { active: { $ne: false } };
  if (productId) {
    query._id = new ObjectId(productId);
  }
  
  const products = await productsCollection.find(query).toArray();
  
  let totalViews = 0;
  let totalInquiries = 0;
  
  products.forEach(p => {
    totalViews += p.views || 0;
    totalInquiries += p.inquiryCount || 0;
  });
  
  const conversionRate = totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0;
  
  return {
    totalViews,
    totalInquiries,
    conversionRate: Math.round(conversionRate * 100) / 100
  };
};

/**
 * Track product view with duplicate prevention
 */
const trackProductView = async (productId, userId = null) => {
  try {
    const db = await connectToDB();
    const productsCollection = db.collection('products');
    
    if (!ObjectId.isValid(productId)) {
      return { success: false, error: 'Invalid product ID' };
    }
    
    // Increment view count
    const result = await productsCollection.updateOne(
      { _id: new ObjectId(productId) },
      { $inc: { views: 1 } }
    );
    
    if (result.matchedCount === 0) {
      return { success: false, error: 'Product not found' };
    }
    
    // Invalidate cache
    await cacheService.invalidate(`product:${productId}`);
    await cacheService.invalidate('analytics:*');
    
    return { success: true };
  } catch (error) {
    logger.error('Track view error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Get search analytics
 */
const getSearchAnalytics = async (options = {}) => {
  const { limit = 20 } = options;
  
  // This would integrate with search logging
  // For now, return mock data structure
  return {
    popularSearches: [],
    zeroResultSearches: [],
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  getDashboardAnalytics,
  getProductStats,
  getCategoryStats,
  getInquiryStats,
  getUserStats,
  getViewStats,
  getConversionRate,
  trackProductView,
  getSearchAnalytics
};
