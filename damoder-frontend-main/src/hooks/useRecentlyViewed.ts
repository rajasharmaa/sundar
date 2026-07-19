import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api/api-client';
import logger from '@/lib/logger';

interface Product {
  id: string;
  _id?: string;
  name: string;
  category: string;
  image: string;
  images?: string[];
  description: string;
  viewedAt?: string;
}

interface TrackedProduct extends Product {
  id: string;
  viewedAt: string;
}

interface UseRecentlyViewedReturn {
  recentlyViewed: Product[];
  isLoading: boolean;
  error: string | null;
  trackProduct: (productId: string, productData?: Partial<Product>) => Promise<void>;
  clearHistory: () => Promise<void>;
  refetch: () => Promise<void>;
}

/** 🔥 FIX: Check if user has a valid auth session — prevents 500 errors for guests */
const isUserLoggedIn = (): boolean => {
  try {
    const hasToken =
      document.cookie.includes('accessToken') ||
      localStorage.getItem('auth_token') !== null ||
      localStorage.getItem('user') !== null;
    return hasToken;
  } catch {
    return false;
  }
};

export interface RecentlyViewedOptions {
  skipFetch?: boolean;
}

/**
 * Hook for managing recently viewed products
 * - Uses localStorage as primary storage (no backend dependency for guests)
 * - Syncs with API only when user is logged in (avoids 500 errors for guests)
 */
export const useRecentlyViewed = (
  limit: number = 10,
  options?: RecentlyViewedOptions
): UseRecentlyViewedReturn => {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const STORAGE_KEY = 'recently_viewed_products';

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const products = JSON.parse(stored);
        return Array.isArray(products) ? products : [];
      }
    } catch (err) {
      logger.error('Failed to load from localStorage:', err);
    }
    return [];
  }, []);

  const saveToStorage = useCallback((products: Product[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (err) {
      logger.error('Failed to save to localStorage:', err);
    }
  }, []);

  const fetchRecentlyViewed = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 🔥 FIX: Only call API if user is logged in — guests caused 500 errors
      if (isUserLoggedIn()) {
        try {
          const products = await api.user.getRecentlyViewed(limit);
          if (Array.isArray(products) && products.length > 0) {
            setRecentlyViewed(products);
            saveToStorage(products);
            return;
          }
        } catch (apiError) {
          logger.debug('Using localStorage fallback for recently viewed');
        }
      }

      // Guest or API failure: use localStorage
      const stored = loadFromStorage();
      setRecentlyViewed(stored.slice(0, limit));
    } catch (err: any) {
      logger.error('Failed to fetch recently viewed:', err);
      setError(err.message || 'Failed to load recently viewed products');
      const stored = loadFromStorage();
      setRecentlyViewed(stored.slice(0, limit));
    } finally {
      setIsLoading(false);
    }
  }, [limit, loadFromStorage, saveToStorage]);

  const trackProduct = useCallback(async (productId: string, productData?: Partial<Product>) => {
    try {
      const current = loadFromStorage();
      const filtered = current.filter((p: Product) => p.id !== productId);

      const newProduct: TrackedProduct = {
        id: productId,
        _id: productData?._id || productId,
        name: productData?.name || 'Product',
        category: productData?.category || 'Industrial',
        image: productData?.image || '/placeholder.svg',
        images: productData?.images || [],
        description: productData?.description || '',
        viewedAt: new Date().toISOString()
      };

      const updated = [newProduct, ...filtered].slice(0, limit);
      setRecentlyViewed(updated);
      saveToStorage(updated);

      // 🔥 FIX: Only sync with API if logged in — prevents 500 errors for guests
      if (isUserLoggedIn()) {
        api.user.trackRecentlyViewed(productId).catch(() => {
          logger.debug('Background API sync failed, using localStorage only');
        });
      }
    } catch (err: any) {
      logger.error('Failed to track product view:', err);
    }
  }, [limit, loadFromStorage, saveToStorage]);

  const clearHistory = useCallback(async () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecentlyViewed([]);

      if (isUserLoggedIn()) {
        api.user.clearRecentlyViewed().catch(() => {
          logger.debug('API clear failed, localStorage cleared successfully');
        });
      }
    } catch (err: any) {
      logger.error('Failed to clear recently viewed:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (!options?.skipFetch) {
      fetchRecentlyViewed();
    } else {
      const stored = loadFromStorage();
      setRecentlyViewed(stored.slice(0, limit));
      setIsLoading(false);
    }
  }, [fetchRecentlyViewed, options?.skipFetch, loadFromStorage, limit]);

  return {
    recentlyViewed,
    isLoading,
    error,
    trackProduct,
    clearHistory,
    refetch: fetchRecentlyViewed
  };
};

export default useRecentlyViewed;
