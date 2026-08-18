import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '@/services/api/api-client';
import { logger } from '@/lib/logger';
import Skeleton from '@/components/common/ui/skeleton';
import { CatalogueProductCard } from './CatalogueProductCard';
import type { Product } from '@/services/api/endpoints';

interface RelatedProductsProps {
  productId: string;
  category?: string;
  limit?: number;
  className?: string;
}

/**
 * Related Products Component
 * Displays smart product recommendations based on:
 * - Same category
 * - Similar price range
 * - Customer behavior
 * 
 * Uses API with localStorage fallback for offline support
 */
export const RelatedProducts = ({ productId, category, limit = 6, className = '' }: RelatedProductsProps) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to get related products first
        let products: Product[] = [];

        try {
          const response: Product[] = await api.products.getRelated(productId, limit);
          products = response || [];
        } catch (err) {
          // Fallback to popular in category if related fails
          if (category) {
            try {
              const categoryId = typeof category === 'string' ? category : ((category as any)?.name || (category as any)?.id || '');
              const fallbackResponse: Product[] = await api.products.getPopularInCategory(categoryId, limit, productId);
              products = fallbackResponse || [];
            } catch (fallbackErr) {
              logger.debug('Both API calls failed, using localStorage fallback');
            }
          }
        }

        // If API succeeded, save to localStorage cache
        if (products.length > 0) {
          const cacheKey = `related_${productId}_limit_${limit}`;
          localStorage.setItem(cacheKey, JSON.stringify({
            products,
            timestamp: Date.now()
          }));
          setRelatedProducts(products);
        } else {
          // Try localStorage cache as fallback
          const cacheKey = `related_${productId}_limit_${limit}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              const { products: cachedProducts, timestamp } = JSON.parse(cached);
              // Use cache if less than 1 hour old
              if (Date.now() - timestamp < 3600000) {
                setRelatedProducts(cachedProducts);
              }
            } catch (cacheErr) {
              logger.debug('Cache read failed:', cacheErr);
            }
          }
        }
      } catch (err: any) {
        logger.error('Failed to load related products', err);
        setError(err.message || 'Failed to load related products');

        // Last resort - try any available cache
        const cacheKey = `related_${productId}_limit_${limit}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const { products } = JSON.parse(cached);
            setRelatedProducts(products);
          } catch (err) {
            logger.debug('Final resort cache read failed');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchRelatedProducts();
    }
  }, [productId, category, limit]);

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-500" />
          <h3 className="text-2xl font-bold text-gray-900">Related Products</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(limit)].map((_, i) => (
            <Skeleton key={i} className="h-[420px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl xs:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              Related Products
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </h3>
          </div>
          <p className="text-sm text-gray-500 font-medium ml-10">Smart recommendations based on your browsing</p>
        </div>

        <Link
          to="/products"
          className="group inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-green-600 hover:text-green-600 transition-all duration-300 shadow-sm hover:shadow-md ml-10 sm:ml-0"
        >
          Explore All Products
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Products Grid - Horizontal Scroll on Mobile, Grid on Desktop */}
      <div className="relative">
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xs:gap-6 overflow-x-auto sm:overflow-x-visible pb-6 sm:pb-0 scrollbar-hide snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
          {relatedProducts.map((product, index) => (
            <motion.div
              key={product.id || (product as any)._id || index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="min-w-[280px] xs:min-w-[320px] sm:min-w-0 snap-start"
            >
              <CatalogueProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* Subtle scroll hint for mobile */}
        <div className="sm:hidden flex justify-center gap-1.5 mt-2">
          {relatedProducts.slice(0, Math.min(relatedProducts.length, 5)).map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === 0 ? 'w-4 bg-green-600' : 'w-1 bg-gray-300'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;
