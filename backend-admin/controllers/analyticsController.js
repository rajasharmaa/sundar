const Product = require('../models/Product');
const Inquiry = require('../models/Inquiry');

// Get dashboard statistics - ENHANCED
const getDashboardStats = async (req, res) => {
  try {
    const User = require('../models/User');
    
    const [
      totalProducts,
      totalCategories,
      totalInquiries,
      newInquiries,
      pendingInquiries,
      hotLeads,
      totalUsers
    ] = await Promise.all([
      Product.countDocuments(),
      require('../models/Category').countDocuments({ active: true }),
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: 'new' }),
      Inquiry.countDocuments({ status: 'pending' }),
      Inquiry.countDocuments({ leadQuality: 'hot' }),
      User.countDocuments()
    ]);
    
    // Today's inquiries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayInquiries = await Inquiry.countDocuments({
      createdAt: { $gte: today }
    });
    
    // Last 7 days inquiries
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const recentInquiries = await Inquiry.countDocuments({
      createdAt: { $gte: lastWeek }
    });

    res.json({
      success: true,
      data: {
        totalProducts,
        totalCategories,
        totalInquiries,
        newInquiries,
        pendingInquiries,
        hotLeads,
        totalUsers,
        todayInquiries,
        recentInquiries
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch statistics' 
    });
  }
};

// Get size distribution analytics
const getSizeDistribution = async (req, res) => {
  try {
    const products = await Product.find({}, 'name sizeOptions category material');
    
    const sizeMap = new Map();
    let totalSizeOptions = 0;

    // Process all size options
    products.forEach(product => {
      product.sizeOptions.forEach(option => {
        totalSizeOptions++;
        const size = option.size;
        
        if (!sizeMap.has(size)) {
          sizeMap.set(size, {
            size: size,
            count: 0,
            minPrice: option.price_100_percent || 0,
            maxPrice: option.price_100_percent || 0,
            totalPrice: 0,
            products: []
          });
        }

        const sizeData = sizeMap.get(size);
        sizeData.count++;
        sizeData.totalPrice += (option.price_100_percent || 0);
        sizeData.minPrice = Math.min(sizeData.minPrice, option.price_100_percent || 0);
        sizeData.maxPrice = Math.max(sizeData.maxPrice, option.price_100_percent || 0);
        
        sizeData.products.push({
          productId: product._id,
          name: product.name,
          price: option.price_100_percent || 0,
          category: product.category,
          material: product.material
        });
      });
    });

    // Convert to array and calculate percentages
    const sizeDistribution = Array.from(sizeMap.values()).map(item => ({
      ...item,
      avgPrice: Number((item.totalPrice / item.count).toFixed(2)),
      percentage: Number(((item.count / totalSizeOptions) * 100).toFixed(2))
    }));

    // Sort by count descending
    sizeDistribution.sort((a, b) => b.count - a.count);

    // Calculate summary
    const summary = {
      totalUniqueSizes: sizeDistribution.length,
      mostCommonSize: sizeDistribution.length > 0 ? sizeDistribution[0] : null,
      leastCommonSize: sizeDistribution.length > 0 ? sizeDistribution[sizeDistribution.length - 1] : null
    };

    res.json({
      totalSizeOptions,
      sizeDistribution,
      summary
    });
  } catch (error) {
    console.error('Get size distribution error:', error);
    res.status(500).json({ error: 'Failed to fetch size distribution' });
  }
};

// Get price range analytics
const getPriceRange = async (req, res) => {
  try {
    const products = await Product.find({}, 'sizeOptions');
    
    const prices = [];
    products.forEach(product => {
      product.sizeOptions.forEach(option => {
        if (option.price_100_percent !== undefined) {
          prices.push(option.price_100_percent);
        }
      });
    });

    if (prices.length === 0) {
      return res.json({
        priceRanges: [],
        statistics: {
          minPrice: 0,
          maxPrice: 0,
          avgPrice: '0.00',
          medianPrice: '0.00',
          totalProductsWithPrice: 0
        }
      });
    }

    // Define price ranges
    const ranges = [
      { range: '0-100', min: 0, max: 100 },
      { range: '101-500', min: 101, max: 500 },
      { range: '501-1000', min: 501, max: 1000 },
      { range: '1001-5000', min: 1001, max: 5000 },
      { range: '5001-10000', min: 5001, max: 10000 },
      { range: '10000+', min: 10001, max: Infinity }
    ];

    const priceRanges = ranges.map(range => {
      const count = prices.filter(price => price >= range.min && price <= range.max).length;
      return {
        range: range.range,
        count: count,
        percentage: Number(((count / prices.length) * 100).toFixed(2))
      };
    });

    // Calculate statistics
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const medianPrice = sortedPrices.length % 2 === 0
      ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
      : sortedPrices[Math.floor(sortedPrices.length / 2)];

    res.json({
      priceRanges: priceRanges.filter(range => range.count > 0),
      statistics: {
        minPrice,
        maxPrice,
        avgPrice: avgPrice.toFixed(2),
        medianPrice: medianPrice.toFixed(2),
        totalProductsWithPrice: prices.length
      }
    });
  } catch (error) {
    console.error('Get price range error:', error);
    res.status(500).json({ error: 'Failed to fetch price range data' });
  }
};

// Filter products by size and price
const filterProductsBySize = async (req, res) => {
  try {
    const { size, minPrice, maxPrice, category } = req.query;
    
    let query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }

    const products = await Product.find(query);
    
    // Filter products based on criteria
    const filteredProducts = products.map(product => {
      let matchingSizeOptions = product.sizeOptions;
      
      // Filter by size
      if (size) {
        matchingSizeOptions = matchingSizeOptions.filter(option => 
          option.size.toLowerCase().includes(size.toLowerCase())
        );
      }
      
      // Filter by price range
      if (minPrice !== undefined || maxPrice !== undefined) {
        matchingSizeOptions = matchingSizeOptions.filter(option => {
          const price = option.price_100_percent || 0;
          const min = minPrice ? parseFloat(minPrice) : -Infinity;
          const max = maxPrice ? parseFloat(maxPrice) : Infinity;
          return price >= min && price <= max;
        });
      }
      
      return {
        ...product.toObject(),
        matchingSizeOptions,
        matchCount: matchingSizeOptions.length
      };
    }).filter(product => product.matchCount > 0);

    res.json({
      totalFound: filteredProducts.length,
      filters: {
        size: size || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        category: category && category !== 'all' ? category : undefined
      },
      products: filteredProducts
    });
  } catch (error) {
    console.error('Filter products error:', error);
    res.status(500).json({ error: 'Failed to filter products' });
  }
};

// @desc    Get inquiries by location (city/state/country)
// @route   GET /api/admin/stats/inquiries-by-location
// @access  Private/Admin
const getInquiriesByLocation = async (req, res) => {
  try {
    const { groupBy = 'city', limit = 10 } = req.query;
    
    let groupField;
    switch(groupBy) {
      case 'state':
        groupField = '$state';
        break;
      case 'country':
        groupField = '$country';
        break;
      default:
        groupField = '$city';
    }
    
    const locationStats = await Inquiry.aggregate([
      {
        $match: {
          [groupBy]: { $exists: true, $ne: null, $ne: '', $ne: 'Unknown' }
        }
      },
      {
        $group: {
          _id: groupField,
          count: { $sum: 1 },
          companies: { $addToSet: '$companyName' },
          lastInquiry: { $max: '$createdAt' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          location: '$_id',
          count: 1,
          companyCount: { $size: '$companies' },
          lastInquiry: 1
        }
      }
    ]);
    
    res.json({
      success: true,
      data: locationStats,
      groupBy
    });
  } catch (error) {
    console.error('Get inquiries by location error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch location statistics' 
    });
  }
};

// @desc    Get inquiries by company
// @route   GET /api/admin/stats/inquiries-by-company
// @access  Private/Admin
const getInquiriesByCompany = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const companyStats = await Inquiry.aggregate([
      {
        $match: {
          companyName: { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$companyName',
          count: { $sum: 1 },
          contacts: { $addToSet: { name: '$name', email: '$email', phone: '$phone' } },
          locations: { $addToSet: { city: '$city', state: '$state', country: '$country' } },
          products: { $addToSet: '$productName' },
          lastInquiry: { $max: '$createdAt' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          companyName: '$_id',
          inquiryCount: 1,
          contactCount: { $size: '$contacts' },
          locationCount: { $size: '$locations' },
          productInterest: { $slice: ['$products', 5] },
          lastInquiry: 1
        }
      }
    ]);
    
    res.json({
      success: true,
      data: companyStats
    });
  } catch (error) {
    console.error('Get inquiries by company error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch company statistics' 
    });
  }
};

// @desc    Get top viewed products
// @route   GET /api/admin/stats/top-viewed-products
// @access  Private/Admin
const getTopViewedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const topProducts = await Product.find()
      .sort({ views: -1 })
      .limit(parseInt(limit))
      .select('name category image views price priceUpdatedAt featured');
    
    res.json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    console.error('Get top viewed products error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch top viewed products' 
    });
  }
};

// @desc    Get inquiry trends over time
// @route   GET /api/admin/stats/inquiry-trends
// @access  Private/Admin
const getInquiryTrends = async (req, res) => {
  try {
    const { period = '30', days = '30' } = req.query;
    
    const daysParam = parseInt(days || period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysParam);
    startDate.setHours(0, 0, 0, 0);
    
    const trends = await Inquiry.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          hotLeads: {
            $sum: { $cond: [{ $eq: ['$leadQuality', 'hot'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          count: 1,
          hotLeads: 1
        }
      }
    ]);
    
    res.json({
      success: true,
      data: trends,
      period: daysParam,
      days: daysParam
    });
  } catch (error) {
    console.error('Get inquiry trends error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch inquiry trends' 
    });
  }
};

// @desc    Get most popular product categories
// @route   GET /api/admin/stats/popular-categories
// @access  Private/Admin
const getPopularCategories = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const categoryStats = await Inquiry.aggregate([
      {
        $match: {
          productId: { $exists: true }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $group: {
          _id: '$product.category',
          count: { $sum: 1 },
          products: { $addToSet: '$product.name' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          category: '$_id',
          inquiryCount: 1,
          uniqueProducts: { $size: '$products' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: categoryStats
    });
  } catch (error) {
    console.error('Get popular categories error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch category statistics' 
    });
  }
};

// @desc    Get most inquired products
// @route   GET /api/admin/stats/most-inquired-products
// @access  Private/Admin
const getMostInquiredProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const topProducts = await Inquiry.aggregate([
      {
        $match: { 
          productId: { $exists: true },
          productName: { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$productId',
          count: { $sum: 1 },
          productName: { $first: '$productName' },
          productCategory: { $first: '$product.category' },
          lastInquiry: { $max: '$createdAt' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          productId: '$_id',
          inquiryCount: '$count',
          productName: 1,
          lastInquiry: 1
        }
      }
    ]);
    
    res.json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    console.error('Get most inquired products error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch most inquired products' 
    });
  }
};

// Export all functions
module.exports = {
  getDashboardStats,
  getSizeDistribution,
  getPriceRange,
  filterProductsBySize,
  // New analytics functions
  getInquiriesByLocation,
  getInquiriesByCompany,
  getTopViewedProducts,
  getInquiryTrends,
  getPopularCategories,
  getMostInquiredProducts
};