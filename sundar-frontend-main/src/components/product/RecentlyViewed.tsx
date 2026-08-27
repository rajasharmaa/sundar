import { Link } from 'react-router-dom';
import { Clock, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { getOptimizedUrl } from '@/lib/utils';
import Skeleton from '@/components/common/ui/skeleton';

interface RecentlyViewedProps {
  limit?: number;
  className?: string;
  showClearButton?: boolean;
}

/**
 * Recently Viewed Products Component
 * - Displays user's recently viewed products
 * - Auto-tracks views when navigating to product details
 * - Supports clearing history
 */
export const RecentlyViewed = ({ limit = 5, className = '', showClearButton = true }: RecentlyViewedProps) => {
  const { recentlyViewed, isLoading, error, clearHistory } = useRecentlyViewed(limit);

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-5">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-gray-50 rounded-2xl animate-pulse border border-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (recentlyViewed.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header - Industrial Focus */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            Recently Viewed
          </h3>
        </div>

        {/* Empty State Card */}
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-center">
          <Clock className="w-10 h-10 text-gray-300 mb-3 animate-pulse" />
          <h4 className="text-sm font-bold text-gray-950 mb-1">No recently viewed works</h4>
          <p className="text-xs text-gray-500 max-w-sm">
            Your recently viewed works will appear here as you browse the portfolio.
          </p>
        </div>
      </div>
    );
  }

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'recently';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'recently';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Get badge color based on category - consistent with ProductCard
  const getBadgeStyles = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('bag')) return 'bg-green-100 text-green-700 border-green-200';
    if (cat.includes('bopp')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (cat.includes('hdpe')) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header - Industrial Focus */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          Recently Viewed
        </h3>

        {showClearButton && (
          <button
            onClick={() => clearHistory()}
            className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-50 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
            Clear History
          </button>
        )}
      </div>

      {/* Horizontal Adaptive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        <AnimatePresence mode="popLayout" initial={false}>
          {recentlyViewed.map((product, index) => {
            const badgeStyle = getBadgeStyles(product.category);
            return (
              <motion.div
                key={product.id || product._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-100 transition-all duration-300 overflow-hidden"
              >
                {/* Product Image Wrapper */}
                <Link
                  to={`/products/${product.id || product._id}`}
                  className="relative aspect-square overflow-hidden bg-gray-50/50 block"
                >
                  <img
                    src={getOptimizedUrl(product.images?.[0] || product.image || '/placeholder.svg')}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-contain p-6 transform group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border shadow-sm ${badgeStyle}`}>
                      {product.category || 'Industrial'}
                    </span>
                  </div>

                  {/* Hover Overlay CTA */}
                  <div className="absolute inset-0 bg-green-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <ExternalLink className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </Link>

                {/* Product Detail Area */}
                <div className="p-4 flex flex-col flex-1">
                  <Link to={`/products/${product.id || product._id}`} className="block">
                    <h4 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-green-600 transition-colors leading-tight mb-2 min-h-[2.5rem]">
                      {product.name}
                    </h4>
                  </Link>

                  <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs font-bold uppercase tracking-tighter">
                        {formatTimeAgo(product.viewedAt)}
                      </span>
                    </div>

                    <Link
                      to={`/products/${product.id || product._id}`}
                      className="text-xs font-bold text-green-600 uppercase tracking-widest hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};


export default RecentlyViewed;

