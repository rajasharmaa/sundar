import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { api, Product, secureApi } from '../services/api/api-client';
import { useToast } from '@/hooks/use-toast';
import logger from '@/lib/logger';
import { useAuth } from '@/context/AuthContext';

interface WishlistContextType {
    wishlist: Product[];
    isLoading: boolean;
    isInWishlist: (productId: string) => boolean;
    toggleWishlist: (product: Product) => Promise<void>;
    refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType>({
    wishlist: [],
    isLoading: false,
    isInWishlist: () => false,
    toggleWishlist: async () => { },
    refreshWishlist: async () => { },
});

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated, authReady, initializing } = useAuth();
    const { toast } = useToast();
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const backendUnavailableRef = useRef(false);

    // Load local storage on mount
    useEffect(() => {
        const local = localStorage.getItem('local_wishlist');
        if (local) {
            try {
                setWishlist(JSON.parse(local));
            } catch (e) {
                logger.error('Failed to parse local wishlist', e);
            }
        }
    }, []);

    const refreshWishlist = useCallback(async () => {
        if (!isAuthenticated) {
            setWishlist([]);
            return;
        }

        if (!authReady || initializing || backendUnavailableRef.current) return;

        setIsLoading(true);
        try {
            const response = await secureApi.wishlist.get();
            const items = (response as any).items || (response as any).data?.items || (response as any).data || [];

            setWishlist(items);
            localStorage.setItem('local_wishlist', JSON.stringify(items));
            logger.info('Wishlist refreshed successfully');
        } catch (error: any) {
            const status = error.response?.status;

            // On 401/404/500, fallback to local but don't force logout
            if (status === 401) {
                logger.info('Wishlist: Unauthorized access, preserving local session');
            } else if (status === 404 || status >= 500) {
                backendUnavailableRef.current = true;
            }

            const local = localStorage.getItem('local_wishlist');
            if (local) setWishlist(JSON.parse(local));
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, authReady, initializing]);

    useEffect(() => {
        if (isAuthenticated && authReady && !initializing) {
            refreshWishlist();
        } else if (!isAuthenticated && authReady && !initializing) {
            setWishlist([]);
        }
    }, [isAuthenticated, authReady, initializing, refreshWishlist]);

    const isInWishlist = (productId: string) => {
        return wishlist.some(p => (p.id || p._id) === productId);
    };

    const toggleWishlist = async (product: Product) => {
        const productId = product.id || product._id;
        const currentlyInWishlist = isInWishlist(productId);

        // Optimistic UI update
        const originalWishlist = [...wishlist];
        if (currentlyInWishlist) {
            setWishlist(prev => prev.filter(p => (p.id || p._id) !== productId));
        } else {
            setWishlist(prev => [...prev, product]);
        }

        if (!isAuthenticated) {
            toast({ title: 'Please login to save wishlist to cloud', variant: 'default' });
            // 🔧 M1-6 FIX: Compute correct post-update list before writing to localStorage
            const newWishlist = currentlyInWishlist
                ? wishlist.filter(p => (p.id || p._id) !== productId)
                : [...wishlist, product];
            localStorage.setItem('local_wishlist', JSON.stringify(newWishlist));
            return;
        }

        try {
            if (currentlyInWishlist) {
                await secureApi.wishlist.remove(productId as string);
                toast({ title: `Removed ${product.name || 'item'}` });
                // 🔧 M1-6 FIX: Write correct post-remove state
                localStorage.setItem('local_wishlist', JSON.stringify(
                    originalWishlist.filter(p => (p.id || p._id) !== productId)
                ));
            } else {
                await secureApi.wishlist.add(productId as string);
                toast({ title: `Added ${product.name || 'item'}` });
                // 🔧 M1-6 FIX: Write correct post-add state
                localStorage.setItem('local_wishlist', JSON.stringify([...originalWishlist, product]));
            }
        } catch (error: any) {
            // Revert on error
            setWishlist(originalWishlist);
            const status = error.response?.status;
            if (status === 401) {
                toast({ title: 'Please login to sync wishlist', variant: 'destructive' });
            } else {
                toast({ title: 'Wishlist sync failed', variant: 'destructive' });
            }
        }
    };

    // Auto-sync circuit breaker reset
    useEffect(() => {
        const handleServerAwake = () => {
            if (backendUnavailableRef.current) {
                backendUnavailableRef.current = false;
                refreshWishlist();
            }
        };
        window.addEventListener('server-awake', handleServerAwake);
        return () => window.removeEventListener('server-awake', handleServerAwake);
    }, [refreshWishlist]);

    return (
        <WishlistContext.Provider value={{ wishlist, isLoading, isInWishlist, toggleWishlist, refreshWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export default WishlistContext;