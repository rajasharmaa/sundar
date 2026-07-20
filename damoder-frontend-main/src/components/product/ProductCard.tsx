import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, GitCompare, Eye, MessageSquare } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCompare } from '@/context/CompareContext';
import { getOptimizedUrl } from '@/lib/utils';
import type { Product } from '@/services/api/endpoints';
import QuickInquiryModal from '@/components/inquiry/QuickInquiryModal';

interface ProductCardProps {
  product: Product;
}

/**
 * Modern Professional ProductCard Component
 * Features:
 * - Clean, minimal design with proper spacing
 * - Optimized image display (object-contain)
 * - Category badge
 * - Wishlist integration with heart icon
 * - Smooth hover animations
 * - Responsive grid layout
 */
export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare, canAddToCompare } = useCompare();

  const inWishlist = isInWishlist(product.id || product._id || '');
  const inCompare = isInCompare(product.id || product._id || '');

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const productId = product.id || product._id || '';

    if (inCompare) {
      removeFromCompare(productId);
    } else {
      if (!canAddToCompare()) {
        alert('You can compare up to 4 products only. Please remove one to add another.');
        return;
      }
      addToCompare({
        ...product,
        id: productId,
        image: product.images?.[0] || product.image,
      });
    }
  };

  const getCategoryName = () => {
    if (!product.category) return 'Uncategorized';
    if (typeof product.category === 'string') {
      return product.category.charAt(0).toUpperCase() + product.category.slice(1);
    }
    if (typeof product.category === 'object' && 'name' in product.category) {
      return (product.category as any).name || 'Uncategorized';
    }
    return 'Uncategorized';
  };

  const getBadgeColor = (category: string) => {
    const cat = category.toLowerCase();
    const colorMap: Record<string, string> = {
      pipes: 'bg-blue-100/80 text-blue-800 border-blue-200',
      fittings: 'bg-emerald-100/80 text-emerald-800 border-emerald-200',
      valves: 'bg-red-100/80 text-red-800 border-red-200',
      flanges: 'bg-purple-100/80 text-purple-800 border-purple-200',
      tubes: 'bg-orange-100/80 text-orange-800 border-orange-200',
      accessories: 'bg-cyan-100/80 text-cyan-800 border-cyan-200',
      industrial: 'bg-slate-100/80 text-slate-800 border-slate-200',
    };

    for (const [key, color] of Object.entries(colorMap)) {
      if (cat.includes(key)) return color;
    }
    return 'bg-indigo-100/80 text-indigo-800 border-indigo-200';
  };

  const categoryName = getCategoryName();
  const badgeColor = getBadgeColor(categoryName);
  const images = product.images?.length ? product.images : [product.image].filter(Boolean);

  const getPrices = () => {
    if (!product.sizeOptions || !Array.isArray(product.sizeOptions)) return [];
    return product.sizeOptions
      .map(s => {
        const val = s.price_100_percent ?? (s as any).price;
        return typeof val === 'number' ? val : parseFloat(val);
      })
      .filter(p => !isNaN(p) && p > 0);
  };

  const sizeCount = product.sizeOptions?.length || 0;

  const brand = (product as any).brand;
  const productCode = (product as any).productCode;

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden">
      {/* Top Badges & Actions */}
      <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-start">
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}>
          {categoryName}
        </span>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleWishlistToggle}
            className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full shadow-sm transition-all duration-200 ${inWishlist ? 'bg-pink-50 text-pink-500' : 'bg-white/90 text-gray-400 hover:text-pink-500 hover:bg-white'
              }`}
          >
            <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleCompareToggle}
            className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full shadow-sm transition-all duration-200 ${inCompare ? 'bg-blue-50 text-blue-600' : 'bg-white/90 text-gray-400 hover:text-blue-600 hover:bg-white'
              }`}
          >
            <GitCompare size={18} />
          </button>
        </div>
      </div>

      {/* Image Section */}
      <div
        onClick={() => navigate(`/products/${product.id || product._id}`)}
        className="cursor-pointer relative bg-gray-50/50 aspect-[4/3] overflow-hidden"
      >
        <img
          src={getOptimizedUrl(images[0] || '/placeholder.svg')}
          alt={product.name}
          className="w-full h-full object-contain p-6 transform group-hover:scale-110 transition-transform duration-500"
        />

        {/* Quick Actions Hover Overlay */}
        <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex gap-4">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsInquiryOpen(true); }}
              className="text-gray-700 hover:text-blue-600 transition-colors"
              title="Send Inquiry"
            >
              <MessageSquare size={20} />
            </button>
            <div className="w-px h-5 bg-gray-200 self-center" />
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/products/${product.id || product._id}`); }}
              className="text-gray-700 hover:text-blue-600 transition-colors"
              title="View Details"
            >
              <Eye size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
          {brand && (
            <span className="text-[10px] font-bold text-blue-600/70 uppercase tracking-widest block mb-1">
              {brand}
            </span>
          )}
          <Link to={`/products/${product.id || product._id}`}>
            <h3 className="text-base font-bold text-gray-900 leading-tight line-clamp-2 hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {sizeCount > 0 && (
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
            <span className="text-xs text-gray-500 font-medium">Available in multiple sizes</span>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-medium uppercase">{sizeCount} Variants</span>
              <div className="flex gap-1 justify-end mt-0.5">
                {[...Array(Math.min(sizeCount, 3))].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-blue-200" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Improved CTA Button */}
        <div className="mt-4">
          <Link
            to={`/products/${product.id || product._id}`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-sm hover:shadow-md group/btn"
          >
            View Details
            <ArrowRight size={16} className="transform group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <QuickInquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        productId={product.id || product._id}
        productName={product.name}
      />
    </div>
  );
};

export default ProductCard;

