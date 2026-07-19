import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// 🔐 CRITICAL FIX: GSAP PLUGIN REGISTRATION WITH ERROR HANDLING
if (typeof window !== 'undefined') {
  try {
    gsap.registerPlugin(ScrollTrigger);
  } catch (err) {
    logger.warn('GSAP ScrollTrigger registration failed:', err);
    // Continue without ScrollTrigger - animations will still work
  }
}
import {
  ArrowLeft, Phone, Mail, MessageCircle, Tag, Check,
  Package, Shield, Truck, Clock, Award, Zap,
  Info, Star, ChevronRight, Lock,
  TrendingDown, Scale, Thermometer, Gauge,
  Settings, Factory, Headphones, RotateCw,
  ZoomIn, ZoomOut, AlertCircle, Loader2, Share2, Heart, GitCompare,
  Maximize2, Minimize2, X, MessageSquare, Download, ClipboardList
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api, type Product, invalidateProductCache } from '../services/api/api-client';
import { useAuth } from '@/context/AuthContext';
import { useCompare } from '@/context/CompareContext';
import { useAccessibility } from '@/context/AccessibilityContext';
import { SEO } from '@/components/SEO';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import { useWishlist } from '@/context/WishlistContext';
import { useRfq } from '@/context/RfqContext';
import { Badge } from '@/components/ui/badge';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductSpecs } from '@/components/product/ProductSpecs';
import { ProductDocuments } from '@/components/product/ProductDocuments';
import { ProductPrintTemplate } from '@/components/product/ProductPrintTemplate';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import RelatedProducts from '@/components/product/RelatedProducts';
import logger from '@/lib/logger';
import { getOptimizedUrl } from '@/lib/utils';
import Skeleton from '@/components/common/ui/skeleton';
import WhatsAppInquiryButton from '@/components/Products/WhatsAppInquiryButton';
import { InquiryForm } from '@/components/product/InquiryForm';
import { InquiryButton } from '@/components/product/InquiryButton';
import ScrollReveal from '@/components/ScrollReveal';
import { collectClientData } from '@/utils/clientDataUtils';

// Extended Product interface with size options
interface ProductWithSizes extends Omit<Product, 'price'> {
  sizeOptions: SizeOption[];
  material?: string;
  pressureRating?: string;
  temperatureRange?: string;
  standards?: string;
  application?: string;
  discountPercentage?: number;
}

interface SizeOption {
  size: string;
  price_100_percent: number;  // Standard price
  price_50_percent: number;   // Wholesale price
  availability?: boolean;
  stock?: number;
}

// Helper to get selected price based on user preference
const getPriceDisplay = (sizeOpt: SizeOption, useWholesale: boolean = false) => {
  return useWholesale ? sizeOpt.price_50_percent : sizeOpt.price_100_percent;
};

// Environment variables with fallbacks
// Environment variables with fallbacks - Ensure consistency with COMPANY_INFO
const SALES_PHONE = import.meta.env.VITE_SALES_PHONE || '+91 98765 43210';
const SALES_EMAIL = import.meta.env.VITE_SALES_EMAIL || 'info@damodartraders.com';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToRfq } = useRfq();
  const { user } = useAuth();
  const [rfqQty, setRfqQty] = useState(1);
  const [product, setProduct] = useState<ProductWithSizes | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [showPrice, setShowPrice] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'description' | 'specs'>('description');
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCompare, setIsAddingToCompare] = useState(false);
  const navigateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false); // Track auto-refresh state
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null); // Track last update time
  const [selectedPriceType, setSelectedPriceType] = useState<'100' | '50'>(() => {
    // Initialize from localStorage or default to '100'
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('priceType');
      return (saved === '50' || saved === '100') ? saved : '100';
    }
    return '100';
  });
  const [revealedDiscountRows, setRevealedDiscountRows] = useState<Set<number>>(new Set()); // Track which rows have discount revealed
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null); // Track which FAQ accordion is open
  const productRef = useRef<ProductWithSizes | null>(null); // Ref to track latest product

  const { language } = useAccessibility();

  // Persist price type selection to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('priceType', selectedPriceType);
    }
  }, [selectedPriceType]);

  // Calculate price with discount
  const calculateDiscountedPrice = useCallback((price: number, discount: number) => {
    return price * (1 - discount / 100);
  }, []);

  // Recently viewed tracking
  const { trackProduct } = useRecentlyViewed(10, { skipFetch: true });

  // Compare functionality
  const { addToCompare, removeFromCompare, isInCompare, canAddToCompare } = useCompare();

  // Generate breadcrumbs for product detail page
  const breadcrumbs = useBreadcrumbs([
    { label: language === 'hi' ? 'उत्पाद' : 'Products', href: '/products' },
    { label: product?.category || (language === 'hi' ? 'श्रेणी' : 'Category'), href: `/products?category=${product?.category?.toLowerCase()}` },
    { label: product?.name || (language === 'hi' ? 'उत्पाद विवरण' : 'Product Details') }
  ]);

  const priceDisplayRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const infoContainerRef = useRef<HTMLDivElement>(null);
  // Ref to track if component is mounted and clear navigation timeouts safely
  const componentIsMounted = useRef(true);
  useEffect(() => {
    componentIsMounted.current = true;
    return () => {
      componentIsMounted.current = false;
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current);
      }
    };
  }, []);

  // Fetch product data with proper error handling
  const fetchProduct = useCallback(async (skipCache = false) => {
    // Validate the product ID exists
    if (!id) {
      logger.error('Product ID is missing from URL parameters');
      if (componentIsMounted.current) {
        setError('Invalid product URL - Product ID is missing');
        setIsLoading(false);
      }
      // Navigate to products page if ID is invalid safely (Issue 1)
      if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current);
      navigateTimeoutRef.current = setTimeout(() => {
        if (componentIsMounted.current) {
          navigate('/products');
        }
      }, 2000);
      return;
    }

    try {
      if (componentIsMounted.current) {
        if (!productRef.current) {
          setIsLoading(true);
        }
        setError(null);
      }

      // Make API call to fetch product by ID with cache-busting
      const apiResponse = await api.products.getById(id, skipCache);

      if (!componentIsMounted.current) return; // Component unmounted

      // Issue 2: Excessive logging production mein removed, and Issue 3: safety null/type checks implemented
      logger.debug('API Response received', {
        id,
        hasResponse: !!apiResponse,
        responseType: typeof apiResponse,
        hasData: apiResponse && typeof apiResponse === 'object' ? !!(apiResponse as any)?.data : false
      });

      // Extract product from API response - handle both formats with safe check
      const productData = apiResponse && typeof apiResponse === 'object' 
        ? ((apiResponse as any)?.data || apiResponse) 
        : null;

      if (!productData) {
        logger.error('Product not found or invalid response', { id });
        setError('Product not found');
        toast({
          title: 'Product Not Found',
          description: 'The requested product could not be found.',
          variant: 'destructive',
        });
        // Navigate to products page after a brief delay to show error (Issue 1)
        if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current);
        navigateTimeoutRef.current = setTimeout(() => {
          if (componentIsMounted.current) {
            navigate('/products');
          }
        }, 2000);
        return;
      }

      // Transform API response to ProductWithSizes interface
      const transformedProduct: ProductWithSizes = {
        id: productData.id || productData._id || id,
        name: productData.name || `Product ${id}`,
        category: productData.category || 'Industrial',
        image: getOptimizedUrl(productData.image || (productData.images && productData.images.length > 0 ? (typeof productData.images[0] === 'object' ? productData.images[0].url : productData.images[0]) : undefined)),
        images: Array.isArray(productData.images) ? productData.images.map((img: any) => getOptimizedUrl(typeof img === 'object' ? img.url : img)) : [],
        description: productData.description || 'Premium industrial product with high quality standards.',
        discountPercentage: productData.discount || 0,
        // Handle dual-tier pricing with backward compatibility
        sizeOptions: Array.isArray((productData as any).sizeOptions)
          ? (productData as any).sizeOptions.map((so: any) => ({
            size: so.size || 'Standard',
            price_100_percent: so.price_100_percent ?? so.price ?? 0,
            price_50_percent: so.price_50_percent ?? (so.price ?? 0) * 0.5,
            availability: so.availability ?? true,
            stock: so.stock ?? 0,
          }))
          : [{
            size: 'Standard',
            price_100_percent: productData.price || 0,
            price_50_percent: (productData.price || 0) * 0.5,
            availability: true,
            stock: 0
          }],
        material: (productData as any).material,
        pressureRating: (productData as any).pressureRating,
        temperatureRange: (productData as any).temperatureRange,
        standards: (productData as any).standards,
        application: (productData as any).application,
        external: productData.external,
        createdAt: productData.createdAt,
        updatedAt: productData.updatedAt,
      };

      lastFetchTimeRef.current = Date.now(); // Update last fetch time on success
      if (componentIsMounted.current) {
        setProduct(transformedProduct);
        productRef.current = transformedProduct; // Update ref with latest product data
        setLastUpdateTime(new Date()); // Track update time
        setSelectedSize(transformedProduct.sizeOptions[0]);
        setShowPrice(false);

        // Track this product view with full product data
        trackProduct(transformedProduct.id, {
          name: transformedProduct.name,
          category: transformedProduct.category,
          image: transformedProduct.image,
          images: transformedProduct.images,
          description: transformedProduct.description,
        });

        // Increment view count on backend (safely tracking once per session - Issue 12)
        const sessionTrackedKey = `tracked_view_${transformedProduct.id}`;
        if (!sessionStorage.getItem(sessionTrackedKey)) {
          api.products.trackView(transformedProduct.id)
            .then(() => {
              sessionStorage.setItem(sessionTrackedKey, 'true');
              logger.debug('Product view tracked successfully', { productId: transformedProduct.id });
            })
            .catch(viewError => {
              logger.warn('Failed to track product view', viewError);
            });
        }
      }
    } catch (error: any) {
      if (!componentIsMounted.current) return; // Component unmounted

      logger.error('Error fetching product', {
        error: error.message,
        responseStatus: error.response?.status
      });
      setError(error.message || 'Failed to load product');

      // Show error toast
      toast({
        title: 'Failed to Load Product',
        description: error.message || 'Could not fetch product details. Please try again later.',
        variant: 'destructive',
      });

      // Navigate back to products after a delay safely (Issue 1)
      if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current);
      navigateTimeoutRef.current = setTimeout(() => {
        if (componentIsMounted.current) {
          navigate('/products');
        }
      }, 3000);
    } finally {
      if (componentIsMounted.current) {
        setIsLoading(false);
      }
    }
  }, [id, navigate, toast, trackProduct]);

  // Initial fetch and refresh on dependency change
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Refresh product data when window regains focus (with cooldown gate to prevent focus storms - Issue 8)
  useEffect(() => {
    const handleFocus = async () => {
      const now = Date.now();
      const COOLDOWN_MS = 60000; // 60s cooldown
      if (now - lastFetchTimeRef.current > COOLDOWN_MS) {
        logger.debug('Window focused - refreshing product data');
        await fetchProduct(true); // Skip cache on focus
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchProduct]);

  // Listen for storage events (data changes in other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      console.log('🔴 STORAGE EVENT TRIGGERED:', {
        key: e.key,
        newValue: e.newValue,
        matchesProduct: e.key === `product_update_${id}`,
        timestamp: new Date().toLocaleTimeString()
      });

      if (e.key === `product_update_${id}` && e.newValue) {
        logger.debug('🔄 Product updated - clearing cache and refreshing');
        invalidateProductCache(id!);

        // Force reload from server
        fetchProduct(true).then(() => {
          setLastUpdateTime(new Date());
          toast({
            title: '🔄 Price Updated',
            description: `Prices refreshed at ${new Date().toLocaleTimeString()}`,
            duration: 4000,
          });
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchProduct, id, toast]);

  // 🔥 REAL-TIME SYNC: Check for updates every 2 seconds - DISABLED (was causing irritation)
  /*
  useEffect(() => {
    let lastCheckTime = Date.now();
    console.log('🟢 Starting polling checker for product:', id);
    
    const checkForUpdates = setInterval(() => {
      const updateTimestamp = localStorage.getItem(`product_update_${id}`);
      
      if (updateTimestamp) {
        const updateTime = parseInt(updateTimestamp);
        
        console.log('🔵 POLL CHECK:', {
          updateTime: new Date(updateTime).toLocaleTimeString(),
          lastCheckTime: new Date(lastCheckTime).toLocaleTimeString(),
          isNewer: updateTime > lastCheckTime,
          currentTimestamp: new Date().toLocaleTimeString()
        });
        
        // If this is a NEW update (happened after last check)
        if (updateTime > lastCheckTime) {
          console.log('⚡ NEW PRODUCT UPDATE DETECTED!', {
            updateTime: new Date(updateTime).toLocaleTimeString(),
            checkTime: new Date(lastCheckTime).toLocaleTimeString()
          });
          
          lastCheckTime = updateTime;
          invalidateProductCache(id!);
          
          // Force refresh
          fetchProduct(true).then(() => {
            setLastUpdateTime(new Date());
            console.log('✅ Product data refreshed successfully');
            toast({
              title: '⚡ Real-time Update',
              description: `Product prices updated - ${new Date().toLocaleTimeString()}`,
              duration: 5000,
              variant: 'default',
            });
          }).catch(err => {
            console.error('❌ Failed to refresh product:', err);
          });
        }
      }
    }, 2000); // Check every 2 seconds
    
    return () => {
      console.log('🔴 Stopping polling checker');
      clearInterval(checkForUpdates);
    };
  }, [id, fetchProduct, toast]);
  */

  // 🔥 CRITICAL FIX: Auto-refresh product data ONLY when prices actually change - DISABLED (was causing irritation)
  /*
  useEffect(() => {
    const refreshInterval = 30000; // 30 seconds
    let lastKnownPriceHash = '';
    
    const getPriceHash = (prod: ProductWithSizes | null) => {
      if (!prod?.sizeOptions) return '';
      return prod.sizeOptions.map(s => `${s.price_100_percent}-${s.price_50_percent}`).join('|');
    };
    
    const autoRefresh = async () => {
      if (!id) return; // No product ID, skip refresh
      
      setIsAutoRefreshing(true);
      logger.debug('🔄 Auto-refreshing product data (interval) for:', id);
      
      try {
        // Fetch fresh data
        await fetchProduct(true); // Skip cache - this updates the product state and ref
        
        // Use setTimeout to ensure state update completes before checking hash
        setTimeout(() => {
          const newPriceHash = getPriceHash(productRef.current);
          
          if (newPriceHash !== lastKnownPriceHash && newPriceHash) {
            // Prices changed - show notification
            toast({
              title: '💰 Price Updated',
              description: `Latest prices loaded at ${new Date().toLocaleTimeString()}`,
              duration: 4000,
              variant: 'default',
            });
            lastKnownPriceHash = newPriceHash;
          } else {
            logger.debug('No price changes detected');
          }
        }, 100);
        
      } catch (error) {
        logger.warn('Auto-refresh failed:', error);
      } finally {
        setIsAutoRefreshing(false);
      }
    };
    
    // Initialize hash after first load
    const initHash = () => {
      lastKnownPriceHash = getPriceHash(productRef.current);
      logger.debug('Initial price hash set:', lastKnownPriceHash);
    };
    
    // Wait a bit for initial product load
    const initTimeout = setTimeout(initHash, 500);
    
    // Set up interval for periodic refresh
    const intervalId = setInterval(autoRefresh, refreshInterval);
    
    // Cleanup
    return () => {
      clearTimeout(initTimeout);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [id, fetchProduct, toast]);
  */

  // Toggle price type handler
  const handlePriceTypeToggle = useCallback((type: '100' | '50') => {
    setSelectedPriceType(type);
  }, []);

  // 🎨 ENHANCED ANIMATION VARIANTS
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" as const }
    }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" as const }
    }
  };

  // 🚀 SCROLL ANIMATION REFS
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const featuresSectionRef = useRef<HTMLDivElement>(null);
  const descriptionSectionRef = useRef<HTMLDivElement>(null);
  const specificationsSectionRef = useRef<HTMLDivElement>(null);
  const inquirySectionRef = useRef<HTMLDivElement>(null);
  const infoCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" as const }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const priceVariants = {
    hidden: { opacity: 0, x: selectedPriceType === '100' ? -20 : 20, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const
      }
    },
    exit: {
      opacity: 0,
      x: selectedPriceType === '100' ? 20 : -20,
      scale: 0.95,
      transition: { duration: 0.3 }
    }
  };

  const pulseGlow = {
    animate: {
      boxShadow: ["0 0 0 rgba(59, 130, 246, 0)", "0 0 20px rgba(59, 130, 246, 0.5)", "0 0 0 rgba(59, 130, 246, 0)"],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear" as const
      }
    }
  };
  // Handle compare toggle
  const handleCompareToggle = async () => {
    const productId = product?.id || product?._id || '';
    if (!productId) return;

    setIsAddingToCompare(true);
    try {
      if (isInCompare(productId)) {
        removeFromCompare(productId);
        toast({
          title: 'Removed from comparison',
          description: 'Product removed from comparison list',
          duration: 2000,
        });
      } else {
        if (!canAddToCompare()) {
          toast({
            title: 'Comparison limit reached',
            description: 'You can compare up to 4 products only',
            variant: 'destructive',
            duration: 3000,
          });
          return;
        }

        addToCompare({
          ...product,
          id: productId,
          image: product.images?.[0] || product.image,
        });
        toast({
          title: 'Added to comparison',
          description: 'Product added to comparison list',
          duration: 2000,
        });
      }
    } catch (error) {
      logger.error('Failed to toggle compare:', error);
      toast({
        title: 'Error',
        description: 'Failed to update comparison list',
        variant: 'destructive',
      });
    } finally {
      setIsAddingToCompare(false);
    }
  };

  // Animate elements on product load
  useEffect(() => {
    if (!product || !imageContainerRef.current || !infoContainerRef.current) return;

    const tl = gsap.timeline({ delay: 0.2 });

    tl.fromTo(
      imageContainerRef.current,
      { x: -50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out'
      }
    )
      .fromTo(
        infoContainerRef.current,
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out'
        },
        '-=0.5'
      );

    const imageContainer = imageContainerRef.current;
    const infoContainer = infoContainerRef.current;
    return () => {
      gsap.killTweensOf([imageContainer, infoContainer]);
    };
  }, [product]);

  // 🚀 SCROLL ANIMATIONS SETUP
  useEffect(() => {
    if (!product) return;

    const ctx = gsap.context(() => {
      // Hero Section Animation
      if (heroSectionRef.current) {
        gsap.fromTo(
          heroSectionRef.current.children,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: heroSectionRef.current,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Features Section Animation
      if (featuresSectionRef.current) {
        const featureCards = featuresSectionRef.current.querySelectorAll('.feature-card');
        gsap.fromTo(
          featureCards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: featuresSectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Description Section Animation
      if (descriptionSectionRef.current) {
        gsap.fromTo(
          descriptionSectionRef.current,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: descriptionSectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Specifications Section Animation
      if (specificationsSectionRef.current) {
        gsap.fromTo(
          specificationsSectionRef.current,
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: specificationsSectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Inquiry Section Animation
      if (inquirySectionRef.current) {
        gsap.fromTo(
          inquirySectionRef.current,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: inquirySectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Info Cards Stagger Animation
      infoCardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(
            card,
            { opacity: 0, y: 50, rotateY: -15 },
            {
              opacity: 1,
              y: 0,
              rotateY: 0,
              duration: 0.7,
              delay: index * 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      });
    });

    return () => ctx.revert();
  }, [product]);

  // Handle size selection
  const handleSizeSelect = useCallback((size: SizeOption) => {
    setSelectedSize(size);
    // 🔧 PERSIST PRICE VISIBILITY: Removed setShowPrice(false) so price stays visible 
    // for all sizes once revealed by the user.

    // Animate price display
    if (priceDisplayRef.current) {
      gsap.to(priceDisplayRef.current, {
        scale: 1.05,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out',
      });
    }
  }, []);

  const togglePriceVisibility = useCallback(() => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to view exclusive pricing and discounts',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (!selectedSize) {
      toast({
        title: 'Select Size First',
        description: 'Please select a size option to view pricing',
        variant: 'destructive',
      });
      return;
    }

    const newShowPrice = !showPrice;
    setShowPrice(newShowPrice);

    // Show toast only when revealing price
    if (newShowPrice) {
      const discount = product?.discountPercentage || 0;
      const originalPrice = selectedSize.price_100_percent;
      const discountedPrice = calculateDiscountedPrice(originalPrice, discount);

      toast({
        title: discount > 0 ? '🎉 Special Price Revealed!' : 'Price Details',
        description: discount > 0
          ? `You save ₹${((originalPrice ?? 0) - (discountedPrice ?? 0)).toFixed(2)} with ${discount}% discount!`
          : `Best price guaranteed for industrial quality`,
        className: discount > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0' : '',
        duration: 3000,
      });
    }
  }, [user, selectedSize, showPrice, product?.discountPercentage, toast, navigate, calculateDiscountedPrice]);

  // Toggle discount reveal for specific row in size table
  const toggleDiscountReveal = useCallback((rowIndex: number) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to view discounted prices',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setRevealedDiscountRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowIndex)) {
        newSet.delete(rowIndex);
      } else {
        newSet.add(rowIndex);

        // Show success toast when revealing discount
        const discount = product?.discountPercentage || 0;
        if (discount > 0 && product?.sizeOptions) {
          const originalPrice = product.sizeOptions[rowIndex]?.price_100_percent || 0;
          const discountedPrice = originalPrice * (1 - discount / 100);
          const savings = originalPrice - discountedPrice;

          toast({
            title: '🎉 Discount Applied!',
            description: `You save ₹${savings.toFixed(2)} with ${discount}% off!`,
            className: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0',
            duration: 2500,
          });
        }
      }
      return newSet;
    });
  }, [user, product, toast, navigate]);



  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      }).catch(err => logger.error('Share failed', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Product link copied to clipboard',
      });
    }
  }, [product, toast]);

  const handleAddToRfq = () => {
    if (!product) return;
    addToRfq(
      product as any,
      rfqQty,
      selectedSize?.size || 'Standard',
      selectedPriceType || '100'
    );
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  // Generate specifications from product data
  const generateSpecifications = useCallback((product: ProductWithSizes) => {
    const specs: any[] = [];
    const isHindi = language === 'hi';

    // First, add specifications from the specifications array if available
    if ((product as any).specifications && Array.isArray((product as any).specifications) && (product as any).specifications.length > 0) {
      (product as any).specifications.forEach((spec: { key: string; value: string }) => {
        specs.push({
          icon: Settings,
          label: spec.key,
          value: spec.value,
          color: 'text-blue-500'
        });
      });
    }

    // Then add default specifications if not already covered
    if (!specs.some(s => s.label === (isHindi ? 'सामग्री' : 'Material')) && product.material) {
      specs.push({ icon: Package, label: isHindi ? 'सामग्री' : 'Material', value: product.material, color: 'text-blue-500' });
    }
    if (!specs.some(s => s.label === (isHindi ? 'श्रेणी' : 'Category'))) {
      specs.push({ icon: Settings, label: isHindi ? 'श्रेणी' : 'Category', value: product.category || (isHindi ? 'औद्योगिक घटक' : 'Industrial Components'), color: 'text-purple-500' });
    }
    if (product.pressureRating && !specs.some(s => s.label === (isHindi ? 'दबाव रेटिंग' : 'Pressure Rating'))) {
      specs.push({ icon: Gauge, label: isHindi ? 'दबाव रेटिंग' : 'Pressure Rating', value: product.pressureRating, color: 'text-red-500' });
    }
    if (product.temperatureRange && !specs.some(s => s.label === (isHindi ? 'तापमान सीमा' : 'Temperature Range'))) {
      specs.push({ icon: Thermometer, label: isHindi ? 'तापमान सीमा' : 'Temperature Range', value: product.temperatureRange, color: 'text-orange-500' });
    }
    if (product.standards && !specs.some(s => s.label === (isHindi ? 'मानक' : 'Standards'))) {
      specs.push({ icon: Award, label: isHindi ? 'मानक' : 'Standards', value: product.standards, color: 'text-amber-500' });
    }
    if (product.application && !specs.some(s => s.label === (isHindi ? 'अनुप्रयोग' : 'Application'))) {
      specs.push({ icon: Factory, label: isHindi ? 'अनुप्रयोग' : 'Application', value: product.application, color: 'text-emerald-500' });
    }

    return specs;
  }, [language]);

  // Generate features from product data
  const generateFeatures = useCallback((product: ProductWithSizes) => {
    const isHindi = language === 'hi';
    const features = [
      { text: isHindi ? 'औद्योगिक-ग्रेड निर्माण' : 'Industrial-grade construction', icon: Shield, color: 'text-blue-500' },
      { text: isHindi ? 'लंबा सेवा जीवन' : 'Long service life', icon: Award, color: 'text-amber-500' },
      { text: isHindi ? 'जंग प्रतिरोधी' : 'Corrosion resistant', icon: Zap, color: 'text-yellow-500' },
      { text: isHindi ? 'गुणवत्ता प्रमाणित' : 'Quality certified', icon: Star, color: 'text-emerald-500' },
    ];

    if (product.material) {
      features.unshift({ text: isHindi ? `प्रीमियम ${product.material}` : `Premium ${product.material}`, icon: Package, color: 'text-purple-500' });
    }
    if (product.discountPercentage && product.discountPercentage > 0) {
      features.push({ text: isHindi ? `${product.discountPercentage}% छूट उपलब्ध` : `${product.discountPercentage}% discount available`, icon: TrendingDown, color: 'text-green-500' });
    }

    return features;
  }, [language]);

  // Add structured data for SEO with correct pricing
  const generateStructuredData = useCallback(() => {
    if (!product || !selectedSize) return null;

    const isPriceAvailable = user && selectedSize.price_100_percent > 0;
    const discount = product.discountPercentage || 0;
    const finalPrice = calculateDiscountedPrice(selectedSize.price_100_percent, discount);

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': product.name,
      'description': product.description.substring(0, 160),
      'image': product.image,
      'sku': `DT-${product.id.slice(-8).toUpperCase()}`,
      'brand': {
        '@type': 'Brand',
        'name': 'Damodar Traders'
      },
      ...(isPriceAvailable && {
        'offers': {
          '@type': 'Offer',
          'availability': 'https://schema.org/InStock',
          'price': finalPrice,
          'priceCurrency': 'INR',
          'priceValidUntil': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      })
    };

    return (
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    );
  }, [product, selectedSize, user, calculateDiscountedPrice]);

  // Loading state - Display skeleton loader
  if (isLoading) {
    return (
      <>
        <IndustrialBackground />
        <Navbar />
        <main className="relative z-10 pb-[100px] lg:pb-0">
          {/* Hero Section Skeleton - Full Width Layout */}
          <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-24 pb-12 w-full">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-1/4 w-96 h-96 sm:w-[500px] sm:h-[500px] bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 sm:w-[500px] sm:h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
            </div>

            <div className="relative w-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-[1600px] mx-auto">
                <div className="flex justify-center lg:justify-start mb-8">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>

                <div className="flex flex-col items-center lg:items-start">
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-full mb-6 border border-blue-400/30">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-24 h-5 bg-gray-200 rounded animate-pulse"></div>
                  </div>

                  <Skeleton className="h-12 xs:h-16 w-80 xs:w-96 mb-6" />
                  <Skeleton className="h-8 xs:h-10 w-64 xs:w-80 mb-8" />

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 md:gap-8 pt-6 border-t border-white/10">
                    <div className="text-center lg:text-right">
                      <div className="w-20 h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <div className="h-12 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                    <div className="text-center lg:text-right">
                      <div className="w-20 h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="h-12 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent hidden sm:block"></div>
                    <div className="text-center lg:text-right hidden sm:block">
                      <div className="w-20 h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                      <Skeleton className="h-6 w-28" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Product Details Skeleton */}
          <section className="py-12 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Product Image Skeleton */}
                <div className="opacity-0 lg:sticky lg:top-24 h-fit z-30 order-first lg:order-last">
                  <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
                    <div className="relative h-96 flex items-center justify-center p-8">
                      <Skeleton className="w-full h-full" />
                    </div>

                    {/* Image Gallery Skeleton */}
                    <div className="flex gap-3 p-6 border-t border-gray-200">
                      <Skeleton className="w-16 h-16 rounded-lg" />
                      <Skeleton className="w-16 h-16 rounded-lg" />
                      <Skeleton className="w-16 h-16 rounded-lg" />
                      <Skeleton className="w-16 h-16 rounded-lg" />
                    </div>
                  </div>
                </div>

                {/* Product Info Skeleton */}
                <div className="opacity-0 order-last lg:order-first">
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
                    {/* Price Section Skeleton */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-8 w-40" />
                      </div>
                      <Skeleton className="h-32 w-full rounded-2xl" />
                    </div>

                    {/* Size Options Skeleton */}
                    <div className="mb-8">
                      <Skeleton className="h-6 w-32 mb-4" />
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <Skeleton className="h-16 rounded-xl" />
                        <Skeleton className="h-16 rounded-xl" />
                        <Skeleton className="h-16 rounded-xl" />
                      </div>
                    </div>

                    {/* Features Skeleton */}
                    <div className="mb-8">
                      <Skeleton className="h-6 w-32 mb-4" />
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Skeleton className="h-12 rounded-xl" />
                        <Skeleton className="h-12 rounded-xl" />
                        <Skeleton className="h-12 rounded-xl" />
                        <Skeleton className="h-12 rounded-xl" />
                      </div>
                    </div>

                    {/* CTA Buttons Skeleton */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Skeleton className="h-12 flex-1 rounded-xl" />
                        <Skeleton className="h-12 flex-1 rounded-xl" />
                        <Skeleton className="h-12 flex-1 rounded-xl" />
                        <Skeleton className="h-12 flex-1 rounded-xl" />
                      </div>
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  // Error state
  if (error && !product && !isLoading) {
    return (
      <>
        <IndustrialBackground />
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Product</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                Browse All Products
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
              >
                <RotateCw className="w-5 h-5" />
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Product not found state
  if (!product) {
    return (
      <>
        <IndustrialBackground />
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
          <div className="text-center">
            <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The requested product could not be found.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5" />
              Browse All Products
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const discount = product.discountPercentage || 0;
  const specifications = generateSpecifications(product);
  const features = generateFeatures(product);
  const hasSizeOptions = !!(
    product.sizeOptions &&
    product.sizeOptions.length >= 1 &&
    (product.sizeOptions.length > 1 || (product.sizeOptions[0] && (product.sizeOptions[0].price_100_percent > 0 || product.sizeOptions[0].price_50_percent > 0)))
  );

  return (
    <>
      {/* 🎯 DYNAMIC SEO META TAGS */}
      <SEO
        title={`${product.name} | Premium Industrial Products`}
        description={`${product.name} - ${product.description.substring(0, 150)}... High-quality ${product.category.toLowerCase()} for industrial applications. Available in bulk quantities with competitive pricing.`}
        canonical={`https://damodartraders.com/products/${product.id}`}
        image={product.image}
        type="product"
        keywords={`${product.name}, ${product.category}, industrial, ${product.sizeOptions?.[0]?.size || ''}, Damodar Traders`}
        productData={{
          name: product.name,
          price: selectedSize?.price_100_percent || product.sizeOptions?.[0]?.price_100_percent || 0,
          currency: 'INR',
          brand: 'Damodar Traders',
          availability: product.inStock ? 'in stock' : 'out of stock',
          rating: product.rating || 0,
          reviewCount: product.reviews || 0
        }}
        og={{
          title: `${product.name} | Damodar Traders`,
          description: `Premium quality ${product.name} for industrial use. Browse specifications, pricing, and bulk order options.`,
          image: product.image,
          url: `https://damodartraders.com/products/${product.id}`
        }}
        twitter={{
          card: 'summary_large_image',
          title: `${product.name} | Damodar Traders`,
          description: `High-quality ${product.name} available at competitive prices. Perfect for industrial applications.`,
          image: product.image
        }}
      />

      {/* 🍞 BREADCRUMB STRUCTURED DATA */}
      <BreadcrumbSchema breadcrumbs={breadcrumbs} />

      {generateStructuredData()}

      <IndustrialBackground />
      <Navbar />

      <main className="relative z-10 pb-[100px] lg:pb-0">
        {/* Breadcrumb Navigation - Mobile Responsive */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm w-full overflow-hidden">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </div>

        {/* Hero Section - Full Width Professional Layout */}
        <section ref={heroSectionRef} className="relative bg-slate-950 text-white pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20 overflow-hidden w-full border-b border-slate-900">
          {/* High-End Industrial Gradient Mesh & Particle Background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[5%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse"></div>
            {/* Fine Tech Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
          </div>

          {/* Content Container - Wider & Centered */}
          <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1600px] mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full"
              >
                {/* Premium Back Button with Hover translation */}
                <div className="flex justify-center lg:justify-start mb-8 sm:mb-10">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-all duration-300 group px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md shadow-lg hover:shadow-cyan-500/10 touch-target min-h-[48px] border border-white/10 hover:border-cyan-500/30"
                  >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform text-cyan-400" />
                    <span className="font-semibold text-sm sm:text-base tracking-wide">
                      {language === 'hi' ? 'उत्पादों पर वापस जाएं' : 'Back to Products'}
                    </span>
                  </Link>
                </div>

                {/* Main Content - Centered */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                  {/* Category Badge with Glow */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-md rounded-full mb-6 border border-cyan-500/30 shadow-lg shadow-cyan-500/5"
                  >
                    <Package className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm sm:text-base font-bold text-cyan-200 tracking-wider uppercase">
                      {language === 'hi' && product.category === 'Industrial' ? 'औद्योगिक' : product.category}
                    </span>
                  </motion.div>

                  {/* Brand Badge if available */}
                  {(product as any).brand && (product as any).brand.trim() && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-full mb-5 border border-purple-500/30 shadow-lg shadow-purple-500/5"
                    >
                      <Award className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-semibold text-purple-100 tracking-wide">{(product as any).brand}</span>
                    </motion.div>
                  )}

                  {/* Product Title */}
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-[1.1] break-words max-w-5xl tracking-tight bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300"
                  >
                    {product.name}
                  </motion.h1>

                  {/* Subtitle */}
                  <p className="text-lg sm:text-xl md:text-2xl text-slate-400 max-w-3xl mb-8 font-semibold tracking-wide">
                    {language === 'hi' ? 'प्रीमियम औद्योगिक इंजीनियर्ड समाधान' : 'Premium Industrial Engineered Solutions'}
                  </p>

                  {/* Product Metadata Grid - Centered on Mobile, Left on Desktop */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 sm:gap-8 pt-6 border-t border-slate-900 w-full lg:w-auto">
                    {/* Product Code */}
                    <div className="text-center lg:text-left">
                      <div className="text-xs text-slate-500 mb-1 font-bold tracking-wider uppercase">
                        {language === 'hi' ? 'उत्पाद कोड' : 'Product Code'}
                      </div>
                      <div className="text-sm sm:text-base font-mono font-black text-cyan-400 tracking-wide bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                        {(product as any).productCode || `DT-${product.id.slice(-8).toUpperCase()}`}
                      </div>
                    </div>
                    <div className="h-10 w-px bg-slate-800"></div>
                    {/* Category */}
                    <div className="text-center lg:text-left">
                      <div className="text-xs text-slate-500 mb-1 font-bold tracking-wider uppercase">
                        {language === 'hi' ? 'श्रेणी' : 'Category'}
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-blue-400">
                        {language === 'hi' && product.category === 'Industrial' ? 'औद्योगिक' : product.category}
                      </div>
                    </div>
                    <div className="h-10 w-px bg-slate-800 hidden sm:block"></div>
                    {/* Quality */}
                    <div className="text-center lg:text-left hidden sm:block">
                      <div className="text-sm sm:text-base font-extrabold text-emerald-400">
                        {language === 'hi' ? 'औद्योगिक भारी-भरकम' : 'Industrial Heavy-Duty'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Product Details Section - Clean 2-Column Layout */}
        <section className="py-12 sm:py-16 bg-slate-50">
          <div className="w-full max-w-[1400px] mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[520px_1fr] gap-10 items-start">
              {/* Product Gallery Section - Left Column (Sticky) */}
              <aside className="lg:sticky lg:top-24 self-start h-fit w-full space-y-6">
                <ScrollReveal direction="left" distance={40}>
                  <div ref={imageContainerRef}>
                    <ProductGallery product={product} language={language} />
                  </div>
                </ScrollReveal>

                {/* Compact Actions & support in Sticky Right Column */}
                <ScrollReveal direction="left" distance={40} delay={0.15}>
                  <div className="bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-200/60 p-6 sm:p-7 space-y-6">
                    {/* CTA Buttons - Premium Overhauled Layout */}
                    <div className="space-y-4">
                      {/* B2B Quantity Selector */}
                      <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 border border-slate-200/85 rounded-2xl">
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider pl-2">
                          {language === 'hi' ? 'मात्रा (नग/मीटर)' : 'Quantity'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setRfqQty(q => Math.max(1, q - 1))}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={rfqQty}
                            onChange={(e) => setRfqQty(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 h-8 text-center bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => setRfqQty(q => q + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Add to RFQ List Button */}
                      <button
                        onClick={handleAddToRfq}
                        className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white font-extrabold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 shadow-lg text-center"
                      >
                        <ClipboardList className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm uppercase tracking-widest font-black">
                          {language === 'hi' ? 'RFQ सूची में जोड़ें' : 'Add to RFQ List'}
                        </span>
                      </button>

                      {/* Download Spec Sheet Button */}
                      <button
                        onClick={handleDownloadPdf}
                        className="w-full py-3 bg-white text-slate-800 border border-slate-300 font-extrabold rounded-2xl hover:bg-slate-50 transition-all duration-300 flex items-center justify-center gap-2 group hover:-translate-y-0.5"
                      >
                        <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                        <span className="text-xs uppercase tracking-wider font-bold">
                          {language === 'hi' ? 'कैटलॉग डाउनलोड करें' : 'Download Spec Sheet'}
                        </span>
                      </button>

                      {/* Main Call to Action */}
                      <a
                        href={`tel:${SALES_PHONE}`}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white font-extrabold rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center gap-2 group hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 shadow-lg text-center"
                      >
                        <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span className="text-sm sm:text-base uppercase tracking-widest font-black">
                          {language === 'hi' ? 'सीधे कोटेशन के लिए कॉल करें' : 'Call for Direct Quote'}
                        </span>
                      </a>

                      {/* Row of quick actions */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={handleShare}
                          className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-1 group border border-slate-200/80 hover:-translate-y-0.5"
                        >
                          <Share2 className="w-4.5 h-4.5 text-slate-500 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] uppercase tracking-wider">
                            {language === 'hi' ? 'साझा करें' : 'Share'}
                          </span>
                        </button>
                        <button
                          onClick={() => product && toggleWishlist(product as any)}
                          className={`py-3 font-extrabold rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-1 group border hover:-translate-y-0.5 ${product && isInWishlist((product as any)._id || product.id)
                            ? 'bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100'
                            : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                          <Heart className={`w-4.5 h-4.5 group-hover:scale-110 transition-transform ${product && isInWishlist((product as any)._id || product.id) ? 'fill-current text-pink-600' : 'text-slate-500'}`} />
                          <span className="text-[10px] uppercase tracking-wider">
                            {product && isInWishlist((product as any)._id || product.id)
                              ? (language === 'hi' ? 'सहेजा गया' : 'Saved')
                              : (language === 'hi' ? 'इच्छासूची' : 'Wishlist')}
                          </span>
                        </button>
                        <button
                          onClick={handleCompareToggle}
                          disabled={isAddingToCompare}
                          className={`py-3 font-extrabold rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-1 group border hover:-translate-y-0.5 ${product && isInCompare(product._id || product.id)
                            ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                            : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                          <GitCompare className={`w-4.5 h-4.5 group-hover:scale-110 transition-transform ${product && isInCompare(product._id || product.id) ? 'fill-current text-blue-600' : 'text-slate-500'}`} />
                          <span className="text-[10px] uppercase tracking-wider">
                            {isAddingToCompare
                              ? (language === 'hi' ? 'जोड़ रहे...' : 'Adding')
                              : (product && isInCompare(product._id || product.id)
                                ? (language === 'hi' ? 'तुलना में' : 'Comparing')
                                : (language === 'hi' ? 'तुलना करें' : 'Compare'))}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Priya Sharma Support card inside sticky right sidebar */}
                    <div className="border-t border-slate-100 pt-5">
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=120&h=120"
                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md shadow-slate-200/60"
                            alt="Technical Consultant Avatar"
                          />
                          <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                        </div>
                        <div className="flex-1">
                          <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none mb-1">
                            {language === 'hi' ? 'तकनीकी सहायता' : 'Technical Support'}
                          </div>
                          <h4 className="text-sm sm:text-base font-black text-slate-900 leading-tight">Priya Sharma</h4>
                          <p className="text-blue-600 font-black text-[9px] sm:text-[10px] uppercase tracking-widest leading-none mt-0.5">
                            {language === 'hi' ? 'मुख्य इंजीनियरिंग सलाहकार' : 'Lead Engineering Consultant'}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <a
                          href="tel:+919876543210"
                          className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-slate-700 rounded-xl font-bold transition-all text-xs"
                        >
                          <Phone size={13} className="text-blue-500" />
                          <span>{language === 'hi' ? 'प्रिया को कॉल करें' : 'Call Priya'}</span>
                        </a>
                        <a
                          href={`https://wa.me/919876543210?text=I am interested in ordering: ${product?.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl font-bold transition-all text-xs"
                        >
                          <MessageCircle size={13} className="text-emerald-500" />
                          <span>{language === 'hi' ? 'WhatsApp पर ऑर्डर' : 'WhatsApp Order'}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </aside>

              {/* Product Information & Details - Right Column (Scrollable) */}
              <main className="space-y-8 w-full">
                {/* Product Information Panel */}
                <div className="space-y-8 w-full pb-4">
                  <ScrollReveal direction="right" distance={40}>
                    <div className="space-y-6">
                      {/* Status Badges Row */}
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-600/10 text-xs sm:text-sm">
                          <Check className="w-4 h-4" />
                          {language === 'hi' ? 'स्टॉक में और आपूर्ति के लिए तैयार' : 'In Stock & Ready To Supply'}
                        </Badge>
                        <div className="flex items-center gap-1.5 bg-cyan-50 border border-cyan-100 px-4 py-2 rounded-xl shadow-sm">
                          <TrendingDown className="w-4 h-4 text-cyan-600" />
                          <span className="text-xs sm:text-sm font-extrabold text-cyan-700 uppercase tracking-wider">
                            {language === 'hi' ? 'थोक छूट उपलब्ध' : 'Volume Discount Available'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>

                  <div ref={infoContainerRef} className="w-full">
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-200/60 p-6 sm:p-8 md:p-10 transition-shadow hover:shadow-2xl hover:shadow-cyan-100/30 duration-500">
                      {/* Login Required Message */}
                      {!user && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-500/20 mb-6 shadow-sm">
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 flex-shrink-0">
                              <Lock className="w-6 h-6" />
                            </div>
                            <div className="text-center sm:text-left flex-1">
                              <div className="font-extrabold text-slate-900 text-base sm:text-lg mb-1">
                                {language === 'hi' ? 'विशेष मूल्य निर्धारण बंद है' : 'Exclusive Pricing Locked'}
                              </div>
                              <div className="text-sm text-slate-600 font-medium">
                                {language === 'hi'
                                  ? `सटीक डीलर/खुदरा मूल्य दरें, वास्तविक समय की स्टॉक सीमाएं देखने और अपने ${product.discountPercentage || 0}% छूट को तुरंत लागू करने के लिए लॉगिन करें।`
                                  : `Login to view precise dealer/retailer price rates, real-time stock limits, and apply your ${product.discountPercentage || 0}% discount immediately.`}
                              </div>
                            </div>
                            <Link
                              to="/login"
                              className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5 transition-all text-center text-sm sm:text-base"
                            >
                              {language === 'hi' ? 'अभी लॉगिन करें' : 'Login Now'}
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Size Options - Clean Pricing Table */}
                      {hasSizeOptions && (
                        <div className="mb-8">
                          {/* Auto-refresh indicator */}
                          <div className="mb-6 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 gap-3">
                              <div className="flex items-center gap-2">
                                <motion.div
                                  animate={{ rotate: isAutoRefreshing ? 360 : 0 }}
                                  transition={{ duration: 1, repeat: isAutoRefreshing ? Infinity : 0, ease: "linear" }}
                                >
                                  <RotateCw className={`w-4 h-4 ${isAutoRefreshing ? 'text-blue-600' : 'text-slate-400'}`} />
                                </motion.div>
                                <span className="text-xs font-semibold text-slate-600">
                                  {isAutoRefreshing
                                    ? (language === 'hi' ? 'कीमतें अपडेट हो रही हैं...' : 'Updating prices...')
                                    : (language === 'hi' ? 'कीमतें हर 30 सेकंड में स्वतः अपडेट होती हैं' : 'Prices auto-update every 30s')}
                                </span>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                                {lastUpdateTime && (
                                  <span className="text-xs text-slate-400 font-medium">
                                    {language === 'hi' ? 'सिंक:' : 'Sync:'} {lastUpdateTime.toLocaleTimeString()}
                                  </span>
                                )}
                                <Badge variant={isAutoRefreshing ? 'default' : 'secondary'} className="text-xs px-2.5 py-1 font-bold">
                                  {isAutoRefreshing
                                    ? (language === 'hi' ? 'लाइव' : 'Live')
                                    : (language === 'hi' ? 'ऑटो-सिंक चालू' : 'Auto-sync ON')}
                                </Badge>
                                {/* Manual Refresh Button */}
                                <button
                                  onClick={async () => {
                                    setIsAutoRefreshing(true);
                                    try {
                                      await fetchProduct(true);
                                      toast({
                                        title: language === 'hi' ? '✅ कीमतें अपडेट हो गईं' : '✅ Prices Refreshed',
                                        description: language === 'hi' ? `अपडेट किया गया ${new Date().toLocaleTimeString()}` : `Updated at ${new Date().toLocaleTimeString()}`,
                                        duration: 3000,
                                      });
                                    } catch (error) {
                                      toast({
                                        title: language === 'hi' ? 'अपडेट विफल' : 'Refresh Failed',
                                        description: language === 'hi' ? 'कीमतें अपडेट नहीं की जा सकीं' : 'Could not update prices',
                                        variant: 'destructive',
                                        duration: 3000,
                                      });
                                    } finally {
                                      setIsAutoRefreshing(false);
                                    }
                                  }}
                                  disabled={isAutoRefreshing}
                                  className="p-2 hover:bg-slate-200/60 rounded-xl transition-all disabled:opacity-50 border border-slate-200 bg-white"
                                  title={language === 'hi' ? 'कीमतें अभी रिफ्रेश करें' : 'Refresh prices now'}
                                >
                                  <RotateCw className="w-4 h-4 text-slate-600" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Price Change Notice in English/Hindi */}
                          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 shadow-sm mb-6">
                            <div className="flex items-start gap-3">
                              <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div className="text-sm flex-1">
                                <p className="font-extrabold text-amber-900">
                                  {language === 'hi' ? '📢 ध्यान दें: कीमतें बदल सकती हैं' : '📢 Note: Prices are subject to change'}
                                </p>
                                <p className="text-xs text-amber-700 mt-1 font-medium leading-relaxed">
                                  {language === 'hi'
                                    ? 'कीमतें बाजार भाव के अनुसार अपडेट होती रहती हैं। सटीक और ताज़ा कीमत जानने के लिए कृपया हमसे संपर्क करें या लॉगिन करें।'
                                    : 'Prices are updated regularly according to market rates. Please contact us or log in to know the exact and latest prices.'}
                                </p>
                                <div className="mt-2.5 flex flex-wrap gap-4 text-xs font-bold text-slate-800">
                                  <span>{language === 'hi' ? '📞 संपर्क:' : '📞 Contact:'} {SALES_PHONE}</span>
                                  <span>{language === 'hi' ? '✉️ ईमेल:' : '✉️ Email:'} {SALES_EMAIL}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                            <Scale className="w-5 h-5 text-blue-600" />
                            {language === 'hi' ? 'आकार चुनें और मूल्य देखें' : 'Select Size & View Pricing'}
                          </h3>

                          {/* Modern Premium Price Type Toggle Switcher */}
                          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50 mb-6 max-w-xl shadow-inner">
                            <motion.button
                              onClick={() => handlePriceTypeToggle('100')}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              className={`w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 flex flex-col items-center justify-center ${selectedPriceType === '100'
                                ? 'bg-white text-blue-700 shadow-md border border-blue-100/50'
                                : 'text-slate-500 hover:text-slate-850'
                                }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <Package className="w-4 h-4" />
                                {language === 'hi' ? 'खुदरा (स्टैंडर्ड)' : 'Standard / Retail'}
                              </span>
                              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 mt-0.5">
                                {language === 'hi' ? 'खुदरा मूल्य (एकल नग)' : 'Retail Pricing (Single Units)'}
                              </span>
                            </motion.button>
                            <motion.button
                              onClick={() => handlePriceTypeToggle('50')}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              className={`w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 flex flex-col items-center justify-center ${selectedPriceType === '50'
                                ? 'bg-white text-emerald-700 shadow-md border border-emerald-100/50'
                                : 'text-slate-500 hover:text-slate-850'
                                }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <Truck className="w-4 h-4" />
                                {language === 'hi' ? 'थोक (होलसेल)' : 'Wholesale / Bulk'}
                              </span>
                              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 mt-0.5">
                                {language === 'hi' ? 'थोक मूल्य (बल्क आर्डर)' : 'Wholesale Pricing (Bulk Deals)'}
                              </span>
                            </motion.button>
                          </div>

                          {/* Interactive Price Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {product.sizeOptions.map((sizeOption, index) => {
                              const isSelected = selectedSize?.size === sizeOption.size;
                              const isWholesale = selectedPriceType === '50';
                              const currentPrice = isWholesale ? sizeOption.price_50_percent : sizeOption.price_100_percent;
                              const finalPrice = currentPrice * (1 - (product?.discountPercentage || 0) / 100);
                              const isRevealed = revealedDiscountRows.has(index);

                              return (
                                <motion.div
                                  key={index}
                                  onClick={() => handleSizeSelect(sizeOption)}
                                  whileHover={{ y: -4, scale: 1.015 }}
                                  whileTap={{ scale: 0.985 }}
                                  className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 ${isSelected
                                    ? isWholesale
                                      ? 'bg-gradient-to-br from-emerald-50/70 to-teal-50/10 border-emerald-500 shadow-lg shadow-emerald-500/10'
                                      : 'bg-gradient-to-br from-blue-50/70 to-indigo-50/10 border-blue-500 shadow-lg shadow-blue-500/10'
                                    : 'bg-white border-slate-200/90 hover:border-slate-350 hover:shadow-md'
                                    }`}
                                >
                                  {isSelected && (
                                    <div className={`absolute -top-2.5 -right-2.5 text-white p-1 rounded-full shadow-lg z-10 ${isWholesale ? 'bg-emerald-600' : 'bg-blue-600'
                                      }`}>
                                      <Check className="w-4 h-4" />
                                    </div>
                                  )}

                                  <div className="flex justify-between items-start">
                                    <div>
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">
                                        {language === 'hi' ? 'आकार' : 'Size'}
                                      </span>
                                      <div className={`text-xl font-extrabold tracking-tight ${isSelected
                                        ? isWholesale ? 'text-emerald-700' : 'text-blue-700'
                                        : 'text-slate-800'
                                        }`}>
                                        {sizeOption.size}
                                      </div>
                                    </div>

                                    {isWholesale && (
                                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold px-2 py-0.5 text-[9px] uppercase tracking-wider rounded-md">
                                        {language === 'hi' ? 'थोक' : 'Wholesale'}
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="mt-4 pt-4 border-t border-slate-100">
                                    {user ? (
                                      <div className="space-y-3">
                                        <div className="flex justify-between items-baseline">
                                          <span className="text-slate-400 font-bold text-xs">
                                            {language === 'hi' ? 'मूल्य:' : 'Original Price:'}
                                          </span>
                                          <span className={`text-base font-black tabular-nums tracking-wide ${isRevealed ? 'line-through text-slate-400 text-sm' : 'text-slate-800'}`}>
                                            ₹{(currentPrice ?? 0).toFixed(2)}
                                          </span>
                                        </div>

                                        <div className={`rounded-xl border p-2.5 flex flex-col gap-2 ${isWholesale
                                          ? 'bg-emerald-50/50 border-emerald-100'
                                          : 'bg-amber-50/40 border-amber-100'
                                          }`}>
                                          <div className="flex justify-between items-center">
                                            <span className={`font-extrabold flex items-center gap-1 text-[11px] uppercase tracking-wider ${isWholesale ? 'text-emerald-700' : 'text-amber-700'
                                              }`}>
                                              <Tag className={`w-3.5 h-3.5 ${isWholesale ? 'text-emerald-600' : 'text-amber-600'}`} />
                                              {product?.discountPercentage || 0}% {language === 'hi' ? 'छूट' : 'OFF'}
                                            </span>

                                            {isRevealed && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  toggleDiscountReveal(index);
                                                }}
                                                className="text-[10px] text-slate-400 hover:text-slate-650 font-bold underline decoration-slate-350"
                                              >
                                                {language === 'hi' ? 'छिपाएं' : 'Hide'}
                                              </button>
                                            )}
                                          </div>

                                          <AnimatePresence mode="wait">
                                            {isRevealed ? (
                                              <motion.div
                                                key="final-price"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className={`flex justify-between items-center border-t border-dashed pt-2 ${isWholesale ? 'border-emerald-200' : 'border-amber-200'
                                                  }`}
                                              >
                                                <span className={`text-xs font-black ${isWholesale ? 'text-emerald-800' : 'text-amber-850'
                                                  }`}>
                                                  {language === 'hi' ? 'अंतिम मूल्य:' : 'Final Price:'}
                                                </span>
                                                <span className={`text-xl font-black tabular-nums ${isWholesale ? 'text-emerald-600' : 'text-amber-650'
                                                  }`}>
                                                  ₹{finalPrice.toFixed(2)}
                                                </span>
                                              </motion.div>
                                            ) : (
                                              <motion.button
                                                key="reveal-btn"
                                                onClick={(e) => { e.stopPropagation(); toggleDiscountReveal(index); }}
                                                className={`px-4 py-2 text-white rounded-lg font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 w-full bg-gradient-to-r ${isWholesale
                                                  ? 'from-emerald-500 to-teal-500 hover:from-emerald-650 hover:to-teal-650 shadow-emerald-500/10'
                                                  : 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-orange-500/10'
                                                  }`}
                                              >
                                                {language === 'hi' ? '🎉 अंतिम मूल्य देखें' : '🎉 Reveal Final Price'}
                                              </motion.button>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                                        <Lock className="w-4 h-4 text-slate-400 mr-2" />
                                        <span className="text-sm text-slate-500 font-bold">
                                          {language === 'hi' ? 'मूल्य देखने के लिए लॉगिन करें' : 'Login to view prices'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {!hasSizeOptions && user && (
                        <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
                          <AlertCircle className="w-8 h-8 text-blue-500 animate-pulse" />
                          <div>
                            <h4 className="text-base font-extrabold text-slate-800">
                              {language === 'hi' ? 'मूल्य अनुरोध पर उपलब्ध' : 'Price on Request'}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm">
                              {language === 'hi'
                                ? 'इस उत्पाद की दरें बाजार के उतार-चढ़ाव के अधीन हैं। नवीनतम सर्वोत्तम मूल्य के लिए सीधे हमसे संपर्क करें।'
                                : 'Pricing for this product is subject to market fluctuations. Contact us directly for the latest best rates.'}
                            </p>
                          </div>
                          <div className="flex gap-2 w-full max-w-xs mt-2">
                            <a
                              href={`tel:${SALES_PHONE}`}
                              className="flex-1 py-2.5 bg-blue-650 hover:bg-blue-700 text-white rounded-xl font-bold text-xs text-center transition-all shadow-sm"
                            >
                              {language === 'hi' ? 'कॉल करें' : 'Call Now'}
                            </a>
                            <a
                              href={`https://wa.me/919876543210?text=I want to inquire about pricing for: ${product.name}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs text-center transition-all shadow-sm"
                            >
                              WhatsApp
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Technical Overview Section */}
                <ScrollReveal direction="right" distance={40} delay={0.1}>
                  <div id="product-overview" className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-100/30 p-6 sm:p-8 md:p-10 space-y-6">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      {language === 'hi' ? 'तकनीकी विवरण' : 'Technical Overview'}
                    </h3>
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
                      {product.description}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4">
                      <div className="p-5 bg-gradient-to-br from-blue-50/50 to-white rounded-2xl border border-blue-100/60 shadow-sm">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">
                          {language === 'hi' ? 'मानक अनुपालन' : 'Standard Compliance'}
                        </span>
                        <span className="font-extrabold text-slate-800 text-sm sm:text-base">
                          {language === 'hi' ? 'ASTM/ASME प्रमाणित' : 'ASTM/ASME Certified'}
                        </span>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-emerald-50/50 to-white rounded-2xl border border-emerald-100/60 shadow-sm">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">
                          {language === 'hi' ? 'सामग्री अखंडता' : 'Material Integrity'}
                        </span>
                        <span className="font-extrabold text-slate-800 text-sm sm:text-base">
                          {language === 'hi' ? 'प्रीमियम शुद्ध वर्जिन ग्रेड' : 'Premium Pure virgin grade'}
                        </span>
                      </div>
                    </div>
                    {/* 12-Month Replacement Warranty Panel */}
                    <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Shield size={90} className="text-cyan-400" />
                      </div>
                      <span className="text-cyan-400 font-black text-[10px] uppercase tracking-widest block mb-2">
                        {language === 'hi' ? 'गुणवत्ता कवच' : 'Quality Shield'}
                      </span>
                      <h4 className="text-lg font-black leading-snug mb-4">
                        {language === 'hi' ? '12-महीने की आधिकारिक रिप्लेसमेंट वारंटी' : '12-Month Official replacement Warranty'}
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 opacity-90 text-xs sm:text-sm font-semibold">
                        <li className="flex items-center gap-2">
                          <Check size={14} className="text-emerald-400" />
                          {language === 'hi' ? 'विनिर्माण दोष कवर्ड' : 'Manufacturing Defects Covered'}
                        </li>
                        <li className="flex items-center gap-2">
                          <Check size={14} className="text-emerald-400" />
                          {language === 'hi' ? 'सामग्री मजबूती वारंटी' : 'Material Strength Warranty'}
                        </li>
                        <li className="flex items-center gap-2">
                          <Check size={14} className="text-emerald-400" />
                          {language === 'hi' ? 'सटीक आकार सहिष्णुता' : 'Precision Sizing Tolerance'}
                        </li>
                      </ul>
                    </div>

                    {/* Info Highlights row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-6 border-t border-slate-100">
                      <div className="text-center p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/60 hover:shadow-lg transition-all duration-300">
                        <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="font-extrabold text-slate-900 text-sm">
                          {language === 'hi' ? 'प्रीमियम गुणवत्ता' : 'Premium Quality'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                          {language === 'hi' ? 'औद्योगिक ग्रेड' : 'Industrial Grade'}
                        </div>
                      </div>
                      <div className="text-center p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/60 hover:shadow-lg transition-all duration-300">
                        <Shield className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                        <div className="font-extrabold text-slate-900 text-sm">
                          {language === 'hi' ? 'मजबूत कवच' : 'Robust Shield'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                          {language === 'hi' ? '1 वर्ष की सुरक्षा' : '1 Year Protection'}
                        </div>
                      </div>
                      <div className="text-center p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/60 hover:shadow-lg transition-all duration-300">
                        <Truck className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                        <div className="font-extrabold text-slate-900 text-sm">
                          {language === 'hi' ? 'सुरक्षित शिपिंग' : 'Safe Shipping'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                          {language === 'hi' ? 'थोक प्रेषण' : 'Bulk dispatch'}
                        </div>
                      </div>
                      <div className="text-center p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/60 hover:shadow-lg transition-all duration-300">
                        <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="font-extrabold text-slate-900 text-sm">
                          {language === 'hi' ? 'त्वरित प्रेषण' : 'Rapid Dispatch'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                          {language === 'hi' ? 'पूरे भारत में' : 'Across India'}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                {/* Technical Specifications Section */}
                <ScrollReveal direction="right" distance={40} delay={0.15}>
                  <ProductSpecs product={product} language={language} />
                </ScrollReveal>

                {/* Product Documents Section */}
                <ScrollReveal direction="right" distance={40} delay={0.2}>
                  <ProductDocuments
                    product={product}
                    language={language}
                    salesPhone={SALES_PHONE}
                    salesEmail={SALES_EMAIL}
                  />
                </ScrollReveal>

                {/* FAQ Section */}
                <ScrollReveal direction="right" distance={40} delay={0.25}>
                  <div id="product-faq" className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-100/30 p-6 sm:p-8 md:p-10 space-y-6">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      {language === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Frequently Asked Questions'}
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          q: language === 'hi' ? 'इस उत्पाद के लिए न्यूनतम ऑर्डर मात्रा (MOQ) क्या है?' : 'What is the minimum order quantity (MOQ) for bulk orders?',
                          a: language === 'hi'
                            ? 'आकार और विशिष्टताओं के आधार पर न्यूनतम ऑर्डर मात्रा भिन्न हो सकती है। सामान्यतः, मानक आकारों के लिए यह 10 इकाइयाँ और कस्टम ऑर्डर के लिए 50 इकाइयाँ है।'
                            : 'MOQ depends on sizing and specification requirements. Typically, standard inventory items require a minimum order of 10 units, while custom-engineered sizing has an MOQ of 50 units.'
                        },
                        {
                          q: language === 'hi' ? 'क्या आप कस्टमाइज्ड साइज और डिजाइन प्रदान करते हैं?' : 'Do you offer customized sizing and designs?',
                          a: language === 'hi'
                            ? 'हाँ, हम ग्राहकों की विशिष्ट आवश्यकताओं के अनुसार आकार, विनिर्देश और डिज़ाइन को अनुकूलित कर सकते हैं। अधिक जानकारी के लिए कृपया पूछताछ फॉर्म भरें।'
                            : 'Yes, we customize sizes, technical specs, and designs based on project requirements. Please fill out the inquiry form to discuss with our engineering team.'
                        },
                        {
                          q: language === 'hi' ? 'डिलीवरी का समय क्या है?' : 'What is the typical delivery timeline?',
                          a: language === 'hi'
                            ? 'मानक स्टॉक में उपलब्ध आकारों के लिए प्रेषण 2-3 दिनों में होता है। बड़े या अनुकूलित ऑर्डरों के लिए, आपकी आवश्यकताओं के आधार पर इसमें 10-15 दिन लग सकते हैं।'
                            : 'For standard stock items, dispatch occurs within 2-3 business days. For bulk or custom manufactured orders, it typically ranges between 10-15 business days.'
                        },
                        {
                          q: language === 'hi' ? 'क्या उत्पाद गुणवत्ता प्रमाणपत्रों के साथ आते हैं?' : 'Do the products come with quality certifications?',
                          a: language === 'hi'
                            ? 'हाँ, हमारे सभी उत्पाद भौतिक गुणवत्ता परीक्षण रिपोर्ट, सामग्री परीक्षण प्रमाणपत्र (MTC), और ASTM/IS अनुपालन प्रमाणपत्रों के साथ आते हैं।'
                            : 'Yes, all shipments include physical quality test reports, Material Test Certificates (MTC), and ASTM/IS compliance documentation.'
                        }
                      ].map((item, index) => (
                        <div key={index} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                          <h4 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-start gap-2.5">
                            <span className="text-blue-600 font-black shrink-0">Q.</span>
                            <span>{item.q}</span>
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 pl-5 leading-relaxed">
                            {item.a}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>

                {/* Bulk Quote & Technical Inquiry Form */}
                <ScrollReveal direction="right" distance={40} delay={0.35}>
                  <div id="product-inquiry" className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-[2.5rem] blur-3xl opacity-5"></div>
                    <div className="relative bg-white rounded-[2.5rem] border border-slate-200/80 p-6 sm:p-8 md:p-10 shadow-2xl space-y-8">
                      <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                          <Mail size={22} />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                            {language === 'hi' ? 'प्रत्यक्ष साइट पूछताछ' : 'Direct Site Inquiry & Support'}
                          </h3>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            {language === 'hi' ? '2 घंटे के भीतर जांच की जाएगी' : 'Responses within 2 hours'}
                          </p>
                        </div>
                      </div>

                      {/* Consultant info */}
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 shadow-inner flex flex-col sm:flex-row items-center gap-5">
                        <div className="relative shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=150&h=150"
                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                            alt="Technical Consultant Avatar"
                          />
                          <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                        </div>
                        <div className="text-center sm:text-left">
                          <h4 className="text-base font-black text-slate-900 leading-tight">Priya Sharma</h4>
                          <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest mt-0.5">
                            {language === 'hi' ? 'मुख्य इंजीनियरिंग सलाहकार' : 'Lead Engineering Consultant'}
                          </p>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-2 text-xs font-bold text-slate-600">
                            <a href="tel:+919876543210" className="flex items-center gap-1.5 hover:text-blue-600">
                              <Phone size={13} className="text-blue-500" />
                              <span>+91 9876543210</span>
                            </a>
                            <a href={`mailto:${SALES_EMAIL}`} className="flex items-center gap-1.5 hover:text-blue-600">
                              <Mail size={13} className="text-blue-500" />
                              <span>{SALES_EMAIL}</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      <InquiryForm
                        productId={product.id}
                        productName={product.name}
                      />
                    </div>
                  </div>
                </ScrollReveal>
              </main>
            </div>
          </div>
        </section>

        {/* Recently Viewed and Related Products (Full-Width Bottom Section) */}
        <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200/50">
          <div className="w-full max-w-[1400px] mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 space-y-16">
            <ScrollReveal>
              <RelatedProducts productId={product.id || product._id} category={product.category} />
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <RecentlyViewed />
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* Modular Print Template Component - Issue 5 */}
      {product && (
        <ProductPrintTemplate
          product={product}
          specifications={specifications}
          salesPhone={SALES_PHONE}
          salesEmail={SALES_EMAIL}
        />
      )}

      <Footer />
    </>
  );
};

export default ProductDetails;