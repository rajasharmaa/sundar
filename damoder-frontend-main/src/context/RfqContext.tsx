import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Product } from '@/types';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { secureApi } from '../services/api/api-client';
import logger from '@/lib/logger';

export interface RfqItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  priceType: '100' | '50';
}

interface RfqContextType {
  rfqItems: RfqItem[];
  addToRfq: (product: Product, quantity: number, selectedSize?: string, priceType?: '100' | '50') => void;
  removeFromRfq: (productId: string, selectedSize?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  togglePriceType: (productId: string, priceType: '100' | '50', selectedSize?: string) => void;
  clearRfq: () => void;
  isInRfq: (productId: string, selectedSize?: string) => boolean;
  rfqCount: number;
  isLoading: boolean;
}

const RfqContext = createContext<RfqContextType>({
  rfqItems: [],
  addToRfq: () => { },
  removeFromRfq: () => { },
  updateQuantity: () => { },
  togglePriceType: () => { },
  clearRfq: () => { },
  isInRfq: () => false,
  rfqCount: 0,
  isLoading: false,
});

export const useRfq = () => useContext(RfqContext);

export const RfqProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, authReady, initializing } = useAuth();
  const [rfqItems, setRfqItems] = useState<RfqItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const backendUnavailableRef = useRef(false);
  const skipNextSyncRef = useRef(false); // Prevents sync loop on initial load

  // Load from local storage on mount (Optimistic Load)
  useEffect(() => {
    const saved = localStorage.getItem('local_rfq_cart');
    if (saved) {
      try {
        setRfqItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse local RFQ cart', e);
      }
    }
  }, []);

  // Fetch RFQ from Cloud when User Logs In
  const refreshRfq = useCallback(async () => {
    if (!isAuthenticated) return;
    if (!authReady || initializing || backendUnavailableRef.current) return;

    setIsLoading(true);
    try {
      const response = await secureApi.rfq.get();
      const items = (response as any).items || [];
      
      // Merge local items with cloud items (prefer local if conflict, or just overwrite with cloud)
      // For simplicity and standard behavior, cloud is source of truth, but we keep local if cloud is empty
      if (items.length > 0) {
         skipNextSyncRef.current = true;
         setRfqItems(items);
         localStorage.setItem('local_rfq_cart', JSON.stringify(items));
      } else {
         // If cloud is empty but we have local items, sync local up to cloud
         const local = localStorage.getItem('local_rfq_cart');
         if (local && JSON.parse(local).length > 0) {
             await secureApi.rfq.sync(JSON.parse(local));
         }
      }
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 404 || status >= 500) {
          backendUnavailableRef.current = true;
      }
      logger.error('Failed to fetch cloud RFQ', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, authReady, initializing]);

  useEffect(() => {
    if (isAuthenticated && authReady && !initializing) {
        refreshRfq();
    }
  }, [isAuthenticated, authReady, initializing, refreshRfq]);

  // Sync to local storage and Cloud
  const saveAndSync = async (items: RfqItem[]) => {
    setRfqItems(items);
    localStorage.setItem('local_rfq_cart', JSON.stringify(items));

    if (isAuthenticated && !backendUnavailableRef.current) {
        if (skipNextSyncRef.current) {
            skipNextSyncRef.current = false;
            return;
        }
        try {
            await secureApi.rfq.sync(items);
        } catch (e) {
            logger.error('Failed to sync RFQ cart to cloud', e);
        }
    }
  };

  const addToRfq = (product: Product, quantity: number, selectedSize?: string, priceType: '100' | '50' = '100') => {
    const productId = product.id || product._id;
    if (!productId) return;

    const existingIndex = rfqItems.findIndex(
      item => (item.product.id || item.product._id) === productId && item.selectedSize === selectedSize
    );

    let updated: RfqItem[] = [];
    if (existingIndex > -1) {
      updated = [...rfqItems];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [...rfqItems, { product, quantity, selectedSize, priceType }];
    }

    saveAndSync(updated);
    toast.success(`${product.name} added to inquiry list`);
  };

  const removeFromRfq = (productId: string, selectedSize?: string) => {
    const updated = rfqItems.filter(
      item => !((item.product.id || item.product._id) === productId && item.selectedSize === selectedSize)
    );
    saveAndSync(updated);
    toast.success('Item removed from inquiry list');
  };

  const updateQuantity = (productId: string, quantity: number, selectedSize?: string) => {
    const updated = rfqItems.map(item => {
      if ((item.product.id || item.product._id) === productId && item.selectedSize === selectedSize) {
        return { ...item, quantity: Math.max(1, quantity) };
      }
      return item;
    });
    saveAndSync(updated);
  };

  const togglePriceType = (productId: string, priceType: '100' | '50', selectedSize?: string) => {
    const updated = rfqItems.map(item => {
      if ((item.product.id || item.product._id) === productId && item.selectedSize === selectedSize) {
        return { ...item, priceType };
      }
      return item;
    });
    saveAndSync(updated);
  };

  const clearRfq = () => {
    saveAndSync([]);
  };

  const isInRfq = (productId: string, selectedSize?: string) => {
    return rfqItems.some(
      item => (item.product.id || item.product._id) === productId && item.selectedSize === selectedSize
    );
  };

  const rfqCount = rfqItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <RfqContext.Provider
      value={{
        rfqItems,
        addToRfq,
        removeFromRfq,
        updateQuantity,
        togglePriceType,
        clearRfq,
        isInRfq,
        rfqCount,
        isLoading
      }}
    >
      {children}
    </RfqContext.Provider>
  );
};
