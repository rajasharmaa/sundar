import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, GitCompare, Eye, MessageSquare, Tag, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCompare } from '@/context/CompareContext';
import { useRfq } from '@/context/RfqContext';
import { getOptimizedUrl } from '@/lib/utils';
import type { Product } from '@/services/api/endpoints';
import QuickInquiryModal from '@/components/inquiry/QuickInquiryModal';

interface ProductCardProps {
  product: Product;
}

/**
 * Enhanced ProductCard Component with Price List Support
 * Features:
 * - Shows price range (min-max)
 * - Displays brand badge
 * - Shows product code
 * - Size count badge
 * - Dynamic size selector on detail page
 */
export const ProductCardEnhanced = ({ product }: ProductCardProps) => {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare, canAddToCompare } = useCompare();
  const { addToRfq } = useRfq();

  const productId = product.id || product._id || '';
  const inWishlist = isInWishlist(productId);
  const inCompare = isInCompare(productId);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  // Safely get category name
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

  // Get badge color based on category
  const getBadgeColor = (category: string) => {
    const cat = category.toLowerCase();

    const colorMap: Record<string, string> = {
      pipes: 'bg-blue-100 text-blue-700',
      fittings: 'bg-emerald-100 text-emerald-700',
      'g.i. fittings': 'bg-emerald-100 text-emerald-700',
      'c.i. fittings': 'bg-amber-100 text-amber-700',
      valves: 'bg-red-100 text-red-700',
      flanges: 'bg-purple-100 text-purple-700',
      tubes: 'bg-orange-100 text-orange-700',
      accessories: 'bg-cyan-100 text-cyan-700',
      industrial: 'bg-gray-100 text-gray-700',
      uncategorized: 'bg-slate-100 text-slate-700',
    };

    for (const [key, color] of Object.entries(colorMap)) {
      if (cat.includes(key)) {
        return color;
      }
    }

    return 'bg-indigo-100 text-indigo-700';
  };

  const categoryName = getCategoryName();
  const badgeColor = getBadgeColor(categoryName);

  // Calculate price range robustly
  const getPrices = () => {
    if (!product.sizeOptions || !Array.isArray(product.sizeOptions)) return [];
    return product.sizeOptions
      .map(s => {
        const val = s.price_100_percent ?? (s as any).price;
        return typeof val === 'number' ? val : parseFloat(val);
      })
      .filter(p => !isNaN(p) && p > 0);
  };

  const prices = getPrices();


  const hasMultipleSizes = prices.length > 1;
  const sizeCount = product.sizeOptions?.length || 0;

  const images = (product.images?.length ? product.images : [product.image])
    .filter(Boolean)
    .map((img: any) => typeof img === 'object' ? img.url : img);


  return (
    <div className="group block h-full text-left">
      <div className="card-3d card-3d-glow flex flex-col relative h-full bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] border border-gray-100 hover:border-blue-100 transition-all duration-300">
        {/* Image Section */}
        <div className="relative flex-1 min-h-[160px] max-h-[220px] bg-gradient-to-b from-gray-50 to-white p-4 flex items-center justify-center overflow-hidden group-hover:from-gray-100 group-hover:to-gray-50 transition-colors duration-500">
          <Link
            to={`/products/${productId}`}
            className="w-full h-full flex items-center justify-center relative"
            aria-label={`View details for ${product.name}`}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                src={getOptimizedUrl(images[currentImageIndex] || '/placeholder.svg')}
                alt={`${product.name} - view ${currentImageIndex + 1}`}
                loading="lazy"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                onError={(e: any) => {
                  e.currentTarget.src = '/placeholder.svg';
                  e.currentTarget.alt = 'Product image not available';
                }}
              />
            </AnimatePresence>
          </Link>

          {/* Dots Indicator for Images */}
          {images.length > 1 && (
            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5 z-10 pointer-events-none">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-4 bg-blue-600' : 'w-1.5 bg-gray-300'}`}
                />
              ))}
            </div>
          )}

          {/* Image Navigation Controls - Moved to the very edges */}
          {images.length > 1 && (
            <div className="absolute inset-y-0 left-0 right-0 flex justify-between items-center px-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              <button
                type="button"
                className="pointer-events-auto p-1 rounded-full bg-white/90 hover:bg-blue-600 hover:text-white text-gray-700 shadow-sm backdrop-blur-sm transform transition-all active:scale-95 border border-gray-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="pointer-events-auto p-1 rounded-full bg-white/90 hover:bg-blue-600 hover:text-white text-gray-700 shadow-sm backdrop-blur-sm transform transition-all active:scale-95 border border-gray-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev + 1) % images.length);
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hover Overlay - Changed to appear from bottom instead of center */}
          <div className="absolute inset-x-0 bottom-0 top-auto h-1/2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6 gap-3 pointer-events-none z-30">
            <div className="pointer-events-auto flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
              <Link
                to={`/products/${productId}`}
                className="p-3 bg-white text-gray-900 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-200 transform hover:scale-110 shadow-lg flex items-center justify-center"
                aria-label="Quick view"
                title="Quick View"
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsInquiryOpen(true);
                }}
                className="p-3 bg-white text-gray-900 rounded-full hover:bg-green-600 hover:text-white transition-all duration-200 transform hover:scale-110 shadow-lg"
                aria-label="Send inquiry"
                type="button"
                title="Send Inquiry"
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToRfq(product as any, 1, product.sizeOptions?.[0]?.size || 'Standard', '100');
                }}
                className="p-3 bg-white text-gray-900 rounded-full hover:bg-slate-900 hover:text-white transition-all duration-200 transform hover:scale-110 shadow-lg"
                aria-label="Add to RFQ list"
                type="button"
                title="Add to RFQ List"
              >
                <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Inquiry Modal */}
          <QuickInquiryModal
            isOpen={isInquiryOpen}
            onClose={() => setIsInquiryOpen(false)}
            productId={productId}
            productName={product.name}
          />

          {/* Category Badge */}
          <div className="absolute top-2 xs:top-3 left-2 xs:left-3 z-10">
            <span className={`inline-flex items-center px-2 py-0.5 xs:px-2.5 xs:py-1 rounded-full text-[10px] xs:text-xs font-semibold ${badgeColor}`}>
              {categoryName}
            </span>
          </div>

          {/* Size Count Badge */}
          {hasMultipleSizes && (
            <div className="absolute top-2 xs:top-3 right-2 xs:right-12 z-10">
              <span className="inline-flex items-center px-2 py-0.5 xs:px-2.5 xs:py-1 rounded-full text-[10px] xs:text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                <Tag className="w-3 h-3 mr-1" />
                {sizeCount} sizes
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute top-2 xs:top-3 right-2 xs:right-3 z-10 flex flex-col gap-1.5 xs:gap-2">
            {/* Compare Button */}
            <button
              onClick={handleCompareToggle}
              className={`p-2 xs:p-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 touch-target ${inCompare
                ? 'bg-blue-50 text-blue-600 border-2 border-blue-200'
                : 'bg-white text-gray-400 hover:text-blue-600'
                }`}
              aria-label={inCompare ? "Remove from compare" : "Add to compare"}
              type="button"
              title={inCompare ? "Remove from Compare" : "Add to Compare"}
            >
              <GitCompare
                className={`w-4 h-4 xs:w-5 xs:h-5 transition-colors duration-200 ${inCompare ? 'fill-current' : ''
                  }`}
              />
            </button>

            {/* Wishlist Heart */}
            <button
              onClick={handleWishlistToggle}
              className="p-2 xs:p-2.5 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 touch-target"
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              type="button"
            >
              <Heart
                className={`w-4 h-4 xs:w-5 xs:h-5 transition-colors duration-200 ${inWishlist
                  ? 'text-pink-500 fill-pink-500'
                  : 'text-gray-400 hover:text-pink-500'
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Product Info Section */}
        <div className="p-4 flex flex-col gap-3 bg-white shrink-0 border-t border-gray-50">
          {/* Brand & Product Code */}
          {(product.brand || product.productCode) && (
            <div className="flex items-center justify-between gap-2">
              {product.brand && (
                <span className="text-[10px] xs:text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {product.brand}
                </span>
              )}
              {product.productCode && (
                <span className="text-[10px] xs:text-xs text-muted-foreground">
                  #{product.productCode}
                </span>
              )}
            </div>
          )}

          {/* Product Title */}
          <Link to={`/products/${productId}`} className="block">
            <h3 className="font-semibold text-sm xs:text-base text-gray-900 line-clamp-2 min-h-[2.25rem] xs:min-h-[2.5rem] group-hover:text-blue-600 transition-colors duration-200 leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Category Text */}
          <p className="text-[10px] xs:text-xs text-gray-500 font-medium">
            {categoryName}
          </p>

          {/* Industrial Grade Icon */}
          <div className="flex items-center gap-1 xs:gap-1.5 text-gray-400">
            <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="text-[10px] xs:text-xs font-medium">Industrial Grade</span>
          </div>

          {/* CTA Button */}
          <div className="pt-1 mt-auto">
            <Link
              to={`/products/${productId}`}
              className="inline-flex items-center gap-1.5 xs:gap-2 text-primary font-semibold text-xs xs:text-sm group-hover:underline transition-all duration-200"
            >
              View Details
              <ArrowRight className="w-3 h-3 xs:w-4 xs:h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardEnhanced;
