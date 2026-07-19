const Product = require('../models/Product');

// Get product size analytics
const getProductSizeAnalytics = async (req, res) => {
  try {
    const products = await Product.find({}, 'name category image sizeOptions views');
    
    // Calculate size analytics for each product
    const sizeAnalytics = products.map(product => {
      const totalSizes = product.sizeOptions?.length || 0;
      const sizes = product.sizeOptions?.map(s => s.size).join(', ') || 'N/A';
      const minPrice = product.sizeOptions?.reduce((min, s) => Math.min(min, s.price_100_percent || 0), Infinity) || 0;
      const maxPrice = product.sizeOptions?.reduce((max, s) => Math.max(max, s.price_100_percent || 0), 0) || 0;
      
      return {
        productId: product._id,
        name: product.name,
        category: product.category,
        image: product.image,
        totalSizes,
        sizes,
        minPrice: minPrice === Infinity ? 0 : minPrice,
        maxPrice,
        views: product.views || 0
      };
    });

    // Calculate overall statistics
    const totalProducts = products.length;
    const totalSizeOptions = products.reduce((sum, p) => sum + (p.sizeOptions?.length || 0), 0);
    const avgSizesPerProduct = totalProducts > 0 ? (totalSizeOptions / totalProducts).toFixed(1) : '0';

    // Most common sizes
    const sizeCount = new Map();
    products.forEach(product => {
      product.sizeOptions?.forEach(option => {
        sizeCount.set(option.size, (sizeCount.get(option.size) || 0) + 1);
      });
    });

    const mostCommonSizes = Array.from(sizeCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([size, count]) => ({ size, count }));

    res.json({
      success: true,
      data: {
        products: sizeAnalytics,
        summary: {
          totalProducts,
          totalSizeOptions,
          avgSizesPerProduct: parseFloat(avgSizesPerProduct),
          mostCommonSizes
        }
      }
    });
  } catch (error) {
    console.error('Get product size analytics error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch product size analytics' 
    });
  }
};

module.exports = {
  getProductSizeAnalytics
};
