const { WishlistItem } = require('../../../models');
const { Product } = require('../../../models');
const { User } = require('../../../models');

// Get all wishlist items (admin view)
const getAllWishlists = async (req, res) => {
  try {
    const wishlists = await WishlistItem.find()
      .populate('userId', 'name email')
      .populate('productId', 'name category image price')
      .sort({ createdAt: -1 });
    
    const formattedWishlists = wishlists.map(item => {
      const itemObj = item.toObject ? item.toObject() : item;
      const hasUser = itemObj.userId && typeof itemObj.userId === 'object' && itemObj.userId.name;
      const hasProduct = itemObj.productId && typeof itemObj.productId === 'object' && itemObj.productId.name;
      return {
        _id: itemObj._id,
        userId: hasUser ? itemObj.userId._id : itemObj.userId,
        user: hasUser ? {
          name: itemObj.userId.name,
          email: itemObj.userId.email
        } : undefined,
        productId: hasProduct ? itemObj.productId._id : itemObj.productId,
        product: hasProduct ? {
          name: itemObj.productId.name,
          image: itemObj.productId.image,
          category: itemObj.productId.category,
          price: itemObj.productId.price
        } : undefined,
        addedAt: itemObj.createdAt || itemObj.addedAt || new Date()
      };
    });

    res.json({
      success: true,
      wishlists: formattedWishlists,
      total: formattedWishlists.length
    });
  } catch (error) {
    console.error('Get all wishlists error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch wishlists' 
    });
  }
};

// Get wishlist statistics
const getWishlistStats = async (req, res) => {
  try {
    const [
      totalItems,
      uniqueUsers,
      uniqueProducts
    ] = await Promise.all([
      WishlistItem.countDocuments(),
      WishlistItem.distinct('userId').then(ids => ids.length),
      WishlistItem.distinct('productId').then(ids => ids.length)
    ]);

    // Most wished product
    const mostWishedAggregate = await WishlistItem.aggregate([
      {
        $group: {
          _id: '$productId',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 1
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: true
        }
      }
    ]);

    const mostWishedProduct = mostWishedAggregate.length > 0 && mostWishedAggregate[0].product ? {
      productId: mostWishedAggregate[0]._id.toString(),
      name: mostWishedAggregate[0].product.name,
      count: mostWishedAggregate[0].count
    } : null;

    const averageItemsPerUser = uniqueUsers > 0 ? (totalItems / uniqueUsers).toFixed(1) : '0.0';
    
    // Most active users (users with most wishlist items)
    const topUsers = await WishlistItem.aggregate([
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          userId: '$_id',
          userName: '$user.name',
          userEmail: '$user.email',
          wishlistCount: '$count'
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        totalWishlistItems: totalItems,
        uniqueUsersWithWishlist: uniqueUsers,
        mostWishedProduct,
        averageItemsPerUser,
        topUsers
      }
    });
  } catch (error) {
    console.error('Get wishlist stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch wishlist statistics' 
    });
  }
};

// Get wishlists by user ID
const getWishlistByUser = async (req, res) => {
  try {
    const wishlists = await WishlistItem.find({ userId: req.params.userId })
      .populate('productId', 'name category image price')
      .sort({ createdAt: -1 });
    
    const formattedWishlists = wishlists.map(item => {
      const itemObj = item.toObject ? item.toObject() : item;
      const hasUser = itemObj.userId && typeof itemObj.userId === 'object' && itemObj.userId.name;
      const hasProduct = itemObj.productId && typeof itemObj.productId === 'object' && itemObj.productId.name;
      return {
        _id: itemObj._id,
        userId: hasUser ? itemObj.userId._id : itemObj.userId,
        user: hasUser ? {
          name: itemObj.userId.name,
          email: itemObj.userId.email
        } : undefined,
        productId: hasProduct ? itemObj.productId._id : itemObj.productId,
        product: hasProduct ? {
          name: itemObj.productId.name,
          image: itemObj.productId.image,
          category: itemObj.productId.category,
          price: itemObj.productId.price
        } : undefined,
        addedAt: itemObj.createdAt || itemObj.addedAt || new Date()
      };
    });

    res.json({
      success: true,
      wishlists: formattedWishlists,
      total: formattedWishlists.length
    });
  } catch (error) {
    console.error('Get user wishlist error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch user wishlist' 
    });
  }
};

// Get most wished products
const getMostWishedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const mostWished = await WishlistItem.aggregate([
      {
        $group: {
          _id: '$productId',
          count: { $sum: 1 },
          users: { $addToSet: '$userId' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          productId: '$_id',
          name: '$product.name',
          category: '$product.category',
          image: '$product.image',
          price: '$product.price',
          count: '$count',
          userCount: { $size: '$users' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: mostWished
    });
  } catch (error) {
    console.error('Get most wished products error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch most wished products' 
    });
  }
};

module.exports = {
  getAllWishlists,
  getWishlistStats,
  getWishlistByUser,
  getMostWishedProducts
};
