import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import logger from '@/lib/logger';

interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  price?: number;
  rating?: number;
  [key: string]: any;
}

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  canAddToCompare: () => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_ITEMS = 4;
const STORAGE_KEY = 'compare_products';

/**
 * Product Comparison Context Provider
 * Manages state for product comparison across the app
 */
export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [compareList, setCompareList] = useState<Product[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const products = JSON.parse(stored);
        setCompareList(products);
      }
    } catch (err) {
      logger.error('Failed to load compare list', err);
    }
  }, []);

  // Save to localStorage when list changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
    } catch (err) {
      logger.error('Failed to save compare list', err);
    }
  }, [compareList]);

  const addToCompare = (product: Product) => {
    if (compareList.length >= MAX_COMPARE_ITEMS) {
      return;
    }
    if (!isInCompare(product.id)) {
      setCompareList(prev => [...prev, product]);
    }
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(prev => prev.filter(p => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (productId: string): boolean => {
    return compareList.some(p => p.id === productId);
  };

  const canAddToCompare = (): boolean => {
    return compareList.length < MAX_COMPARE_ITEMS;
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        canAddToCompare
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

/**
 * Hook to use compare context
 */
export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};

export default CompareContext;
