import React from 'react';
import { Heart, Eye, Mail, Phone, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SizeOption {
  size: string;
  price_100_percent: number;
  price_50_percent: number;
  availability?: boolean;
  stock?: number;
}

interface Product {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  category: string;
  image: string;
  images?: string[];
  price?: number; // Fallback for backward compatibility
  sizeOptions?: SizeOption[]; // Dual-tier pricing
  discount?: number;
  description?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  featured?: boolean;
  views?: number;
  priceUpdatedAt?: string;
}

interface ProductCardProps {
  product: Product;
  onWishlistToggle?: (productId: string) => void;
  isInWishlist?: boolean;
  onViewDetails?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onWishlistToggle,
  isInWishlist = false,
  onViewDetails
}) => {
  const productId = product._id || product.id || '';
  
  // Calculate price from sizeOptions (use minimum 100% price for display)
  const minPrice = product.sizeOptions?.length 
    ? Math.min(...product.sizeOptions.map(so => so.price_100_percent || 0))
    : (product.price || 0);
  
  const maxPrice = product.sizeOptions?.length 
    ? Math.max(...product.sizeOptions.map(so => so.price_100_percent || 0))
    : (product.price || 0);
  
  // Calculate discounted price (using minimum price)
  const finalPrice = product.discount 
    ? minPrice - (minPrice * product.discount / 100)
    : minPrice;
  
  // Check if price was recently updated (within 7 days)
  const isPriceRecentlyUpdated = product.priceUpdatedAt && 
    new Date(product.priceUpdatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.featured && (
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-lg">
              ⭐ Featured
            </span>
          )}
          {isPriceRecentlyUpdated && (
            <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
              🏷️ Price Updated
            </span>
          )}
          {product.discount && product.discount > 0 && (
            <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
              -{product.discount}% OFF
            </span>
          )}
          {!product.inStock && (
            <span className="px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-full shadow-lg">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onWishlistToggle?.(productId);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
            isInWishlist
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => onViewDetails?.(product)}
            className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-gray-100"
          >
            Quick View
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <div className="text-xs text-blue-600 font-medium mb-2 uppercase tracking-wide">
          {product.category}
        </div>

        {/* Product Name */}
        <Link to={`/products/${productId}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating && product.rating > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-700">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({product.reviews || 0} reviews)</span>
          </div>
        )}

        {/* Price */}
        <div className="mb-3">
          {product.discount && product.discount > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">₹{finalPrice.toFixed(2)}</span>
              <span className="text-sm text-gray-500 line-through">₹{product.price.toFixed(2)}</span>
            </div>
          ) : (
            <span className="text-xl font-bold text-gray-900">₹{product.price.toFixed(2)}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
          <Link
            to={`/products/${productId}`}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium text-sm hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2"
          >
            View Details
            <ChevronRight className="w-4 h-4" />
          </Link>
          
          <a
            href={`mailto:info@damoder.com?subject=Inquiry about ${encodeURIComponent(product.name)}`}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Send Inquiry"
          >
            <Mail className="w-5 h-5 text-gray-600" />
          </a>
        </div>

        {/* Views Count */}
        {product.views !== undefined && product.views > 0 && (
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {product.views.toLocaleString()} views
            </span>
            {product.inStock ? (
              <span className="text-green-600 font-medium">✓ In Stock</span>
            ) : (
              <span className="text-red-600 font-medium">Out of Stock</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
