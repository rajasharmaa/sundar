/* eslint-disable @typescript-eslint/no-explicit-any */
import { Helmet } from 'react-helmet-async';
// pages/Products.tsx - PROFESSIONAL B2B E-COMMERCE DESIGN
import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import ErrorBoundary from '@/components/common/ErrorBoundary';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useDebounceValue } from '@/hooks/usePerformanceOptimization';
import { Menu, X } from 'lucide-react';

import { Link, useSearchParams } from 'react-router-dom';
import { Search, Package, Filter, Layers, Wrench, Zap, ArrowUpDown, ChevronRight, Heart, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '../services/api/api-client';
import { useToast } from '@/hooks/use-toast';
import { useApiHandler } from '@/hooks/useApiHandler';
import { SEO } from '@/components/SEO';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
// Remove IndustrialBackground - using clean professional design
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';

import { ProductCardEnhanced } from '@/components/product/ProductCardEnhanced';
import logger from '@/lib/logger';
import { useDeepMemo } from '@/hooks/usePerformanceOptimization';

import RecentlyViewed from '@/components/product/RecentlyViewed';
import { useWishlist } from '@/context/WishlistContext';
import { useCompare } from '@/context/CompareContext';
// New imports for enhanced UI

import CategoryChips from '@/components/Products/CategoryChips';
import ProductFilters from '@/components/Products/ProductFilters';
import ProductSkeleton from '@/components/Products/ProductSkeleton';
import Pagination from '@/components/Products/Pagination';
import ScrollReveal from '@/components/ScrollReveal';

import { Product } from '../services/api/endpoints';

// Professional B2B Color Palette
const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('default');

  // Derive filter state directly from URL parameters
  const selectedCategory = categoryParam || 'all';
  const selectedBrand = searchParams.get('brand') || '';
  const selectedSize = searchParams.get('size') || '';

  // New state for enhanced features
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [activeFilters, setActiveFilters] = useState<any>({});

  const [searchInput, setSearchInput] = useState(searchQuery);
  const debouncedSearchQuery = useDebounceValue(searchInput, 300);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Dynamic state for real-time B2B statistics
  const [stats, setStats] = useState({
    totalProducts: '',
    testedRate: '100%',
    certification: 'ISO'
  });

  // Use API handler hook for better error management
  const {
    data: allProducts = [],
    loading: isLoading,
    error,
    execute: fetchProducts
  } = useApiHandler<Product[]>({
    showErrors: true,
    retryOnError: true
  });

  // Ensure we always have an array, even if data is null
  const safeAllProducts = useMemo(() => Array.isArray(allProducts) ? allProducts : [], [allProducts]);

  const { toast } = useToast();
  const { wishlist } = useWishlist();
  const { compareList } = useCompare();

  // Load stats from endpoint with resilience fallbacks
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.metrics.getStats();
        if (res && res.success && res.data) {
          setStats({
            totalProducts: res.data.totalProducts ? `${res.data.totalProducts}+` : `${safeAllProducts.length || '5K'}+`,
            testedRate: res.data.testedRate || '100%',
            certification: res.data.certification || 'ISO'
          });
        } else {
          setStats({
            totalProducts: safeAllProducts.length ? `${safeAllProducts.length}+` : '5K+',
            testedRate: '100%',
            certification: 'ISO'
          });
        }
      } catch (err) {
        setStats({
          totalProducts: safeAllProducts.length ? `${safeAllProducts.length}+` : '5K+',
          testedRate: '100%',
          certification: 'ISO'
        });
      }
    };
    fetchStats();
  }, [safeAllProducts.length]);

  // Reset pagination page to 1 whenever any filter or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, selectedBrand, selectedSize, activeFilters.minPrice, activeFilters.maxPrice, activeFilters.inStock, activeFilters.featured]);

  // Handler functions to update URL parameters with XSS sanitization
  const handleSearch = useCallback((query: string) => {
    const sanitized = query.replace(/[<>]/g, '');
    setSearchQuery(sanitized);
    setSearchInput(sanitized);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (sanitized) {
        newParams.set('search', sanitized);
      } else {
        newParams.delete('search');
      }
      return newParams;
    });
  }, [setSearchParams]);

  const searchParam = searchParams.get('search') || '';

  // Sync URL search query with local input query
  useEffect(() => {
    const searchFromURL = searchParam.replace(/[<>]/g, '');
    if (searchFromURL !== searchQuery) {
      setSearchQuery(searchFromURL);
      setSearchInput(searchFromURL);
    }
  }, [searchParam, searchQuery]);

  // Handle debounced search changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      handleSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, handleSearch, searchQuery]);

  const handleBrandChange = useCallback((brand: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (brand) {
        newParams.set('brand', brand);
      } else {
        newParams.delete('brand');
      }
      return newParams;
    });
  }, [setSearchParams]);

  const handleSizeChange = useCallback((size: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (size) {
        newParams.set('size', size);
      } else {
        newParams.delete('size');
      }
      return newParams;
    });
  }, [setSearchParams]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSearchParams(new URLSearchParams());
    setActiveFilters({});
    setCurrentPage(1);
  }, [setSearchParams]);

  // Memoized category options with professional labels
  const categoryOptions = useDeepMemo([
    { value: 'all', label: 'All Products', icon: Package, color: 'bg-slate-900 text-white' },
    { value: 'pipes', label: 'Pipes & Tubes', icon: Layers, color: 'bg-blue-900 text-white' },
    { value: 'fittings', label: 'Pipe Fittings', icon: Wrench, color: 'bg-emerald-600 text-white' },
    { value: 'valves', label: 'Valves & Controls', icon: Filter, color: 'bg-red-700 text-white' },
    { value: 'other', label: 'Accessories', icon: Zap, color: 'bg-amber-600 text-white' },
  ], []);

  // Generate breadcrumbs after categoryOptions is defined
  const breadcrumbs = useBreadcrumbs([
    selectedCategory !== 'all'
      ? { label: categoryOptions.find(c => c.value === selectedCategory)?.label || 'Category' }
      : { label: 'All Products' }
  ]);

  // Helper function to normalize category strings - consistent with Categories.tsx
  const normalizeCategory = useCallback((category: string): string => {
    const cat = category?.toLowerCase() || '';

    if (cat.includes('pipe') || cat === 'pipes') return 'pipes';
    if (cat.includes('fitting') || cat.includes('joint') || cat.includes('connector') || cat === 'fittings') return 'fittings';
    if (cat.includes('valve') || cat === 'valves') return 'valves';

    return 'other';
  }, []);

  // 8. Memoized Price Map to avoid repeated calculation
  const priceMap = useMemo(() => {
    const map = new Map();
    safeAllProducts.forEach(product => {
      if (!product.sizeOptions || !Array.isArray(product.sizeOptions) || product.sizeOptions.length === 0) {
        map.set((product as any)._id || (product as any).id, (product as any).price || 0);
      } else {
        const minPrice = Math.min(...product.sizeOptions.map((s: any) => s.price_100_percent || 0).filter((p: number) => p > 0));
        map.set((product as any)._id || (product as any).id, minPrice);
      }
    });
    return map;
  }, [safeAllProducts]);

  // Filter products based on search and category - memoized
  const filteredProducts = useMemo(() => {
    if (!safeAllProducts || safeAllProducts.length === 0) {
      return [];
    }

    let filtered = safeAllProducts.filter(product => {
      const matchesSearch = searchQuery.trim() === '' ||
        (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const normalizedProductCategory = normalizeCategory(product.category);
      const normalizedSelectedCategory = normalizeCategory(selectedCategory);
      const matchesCategory = selectedCategory === 'all' || normalizedProductCategory === normalizedSelectedCategory;

      // Brand filter
      const productBrand = (product as any).brand || '';
      const matchesBrand = selectedBrand === '' || productBrand.toLowerCase().includes(selectedBrand.toLowerCase());

      // Size filter
      const matchesSize = selectedSize === '' ||
        (product.sizeOptions && Array.isArray(product.sizeOptions) &&
          product.sizeOptions.some(s => s.size.toLowerCase().includes(selectedSize.toLowerCase())));

      return matchesSearch && matchesCategory && matchesBrand && matchesSize;
    });

    // Apply additional filters from activeFilters
    if (activeFilters.minPrice !== undefined) {
      filtered = filtered.filter(p => (priceMap.get(p._id || p.id) || 0) >= activeFilters.minPrice);
    }
    if (activeFilters.maxPrice !== undefined) {
      filtered = filtered.filter(p => (priceMap.get(p._id || p.id) || 0) <= activeFilters.maxPrice);
    }
    if (activeFilters.inStock) {
      filtered = filtered.filter(p => (p as any).inStock !== false);
    }
    if (activeFilters.featured) {
      filtered = filtered.filter(p => (p as any).featured === true);
    }

    // Apply sorting
    if (sortBy !== 'default') {
      filtered = [...filtered].sort((a, b) => {
        const aId = a._id || a.id;
        const bId = b._id || b.id;
        const aPrice = priceMap.get(aId) || 0;
        const bPrice = priceMap.get(bId) || 0;
        switch (sortBy) {
          case 'price-low':
            return aPrice - bPrice;
          case 'price-high':
            return bPrice - aPrice;
          case 'newest':
            return new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime();
          case 'popular':
            return ((b as any).rating || 0) - ((a as any).rating || 0);
          case 'name-asc':
            return (a.name || '').localeCompare(b.name || '');
          case 'name-desc':
            return (b.name || '').localeCompare(a.name || '');
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [safeAllProducts, searchQuery, selectedCategory, sortBy, normalizeCategory, activeFilters, selectedBrand, selectedSize, priceMap]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Pagination logic
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Calculate category counts efficiently - memoized
  const categoryCounts = useMemo(() => {
    if (!safeAllProducts || safeAllProducts.length === 0) {
      return {
        all: 0,
        pipes: 0,
        fittings: 0,
        valves: 0,
        other: 0
      };
    }

    const counts: Record<string, number> = { all: safeAllProducts.length };

    // Initialize all category counts
    categoryOptions.forEach(option => {
      if (option.value !== 'all') {
        counts[option.value] = 0;
      }
    });

    // O(n) pass using Map
    const optionMap = new Map(categoryOptions.map(opt => [normalizeCategory(opt.value), opt.value]));
    safeAllProducts.forEach(product => {
      if (product.category) {
        const normalizedCategory = normalizeCategory(product.category);
        const matchedValue = optionMap.get(normalizedCategory);
        if (matchedValue && matchedValue !== 'all') {
          counts[matchedValue] = (counts[matchedValue] || 0) + 1;
        } else {
          counts.other = (counts.other || 0) + 1;
        }
      }
    });

    return counts;
  }, [safeAllProducts, categoryOptions, normalizeCategory]);

  // Fetch products with error handling
  const fetchAllProducts = useCallback(async () => {
    try {
      await fetchProducts(
        () => api.products.getAll(),
        (products) => {
          if (products.length === 0) {
            toast({
              title: 'No Products',
              description: 'Currently no products available in our catalog.',
              variant: 'default',
            });
          }
        },
        (error) => {
          logger.error('Error fetching products', error);
        }
      );
    } catch (error) {
      // Error is already handled by useApiHandler
      logger.error('Products fetch failed', error);
    }
  }, [fetchProducts, toast]);

  // Fetch products once on mount
  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  // Handle filter changes from ProductFilters component
  const handleFilterChange = useCallback((filters: any) => {
    setActiveFilters(filters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Handle category selection from sidebar
  const handleSidebarCategorySelect = useCallback((slug: string | null) => {
    const categoryValue = slug || 'all';
    setCurrentPage(1); // Reset to first page

    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (categoryValue === 'all') {
        newParams.delete('category');
      } else {
        newParams.set('category', categoryValue);
      }
      return newParams;
    });
  }, [setSearchParams]);

  return (
    <>

      {/* 🎯 DYNAMIC SEO META TAGS */}
      {(searchQuery || selectedBrand || selectedSize) && (
        <Helmet><meta name="robots" content="noindex, follow" /></Helmet>
      )}
      <SEO
        title={categoryParam
          ? `${categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)} Products | Industrial Supplies`
          : 'Premium Industrial Products | Pipes, Fittings & Valves'
        }
        description={categoryParam
          ? `Browse our extensive collection of ${categoryParam.toLowerCase()} for industrial applications. High-quality products from Damodar Traders with competitive pricing and bulk order options.`
          : 'Explore our comprehensive catalog of premium industrial products including pipes, fittings, valves, and accessories. Superior performance and durability for all industrial applications.'
        }
        canonical={`https://damodartraders.com/products${categoryParam ? `?category=${categoryParam}` : ''}`}
        image="https://damodartraders.com/og-products.jpg"
        type="website"
        keywords={categoryParam
          ? `${categoryParam}, ${categoryParam} products, industrial ${categoryParam}, ${categoryParam} suppliers, Damodar Traders`
          : 'industrial products, pipes, fittings, valves, industrial supplies, manufacturing, Damodar Traders'
        }
        og={{
          title: categoryParam ? `${categoryParam} Products | Damodar Traders` : 'Industrial Products Catalog',
          description: categoryParam
            ? `Quality ${categoryParam} for industrial use. Browse specifications and pricing.`
            : 'Comprehensive industrial product catalog with competitive pricing.',
          image: 'https://damodartraders.com/og-products.jpg',
          url: `https://damodartraders.com/products${categoryParam ? `?category=${categoryParam}` : ''}`
        }}
        twitter={{
          card: 'summary_large_image',
          title: categoryParam ? `${categoryParam} Products` : 'Industrial Products Catalog',
          description: categoryParam
            ? `Discover premium ${categoryParam} at Damodar Traders`
            : 'Browse our complete industrial product catalog',
          image: 'https://damodartraders.com/og-products.jpg'
        }}
      />

      {/* 🍞 BREADCRUMB STRUCTURED DATA */}
      <BreadcrumbSchema breadcrumbs={breadcrumbs} />

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 shadow-2xl overflow-y-auto lg:hidden"
            >
              <div className="p-4 border-b flex items-center justify-between bg-slate-950 text-white">
                <h2 className="text-lg font-bold flex items-center gap-2"><Filter className="w-5 h-5" /> Filters</h2>
                <button onClick={() => setIsMobileDrawerOpen(false)}><X className="w-6 h-6" /></button>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2 mb-6">
                  {categoryOptions.map(option => {
                    const Icon = option.icon;
                    const isSelected = selectedCategory === option.value;
                    const count = categoryCounts[option.value as keyof typeof categoryCounts] || 0;
                    return (
                      <button
                        key={option.value}
                        onClick={() => { handleSidebarCategorySelect(option.value === 'all' ? null : option.value); setIsMobileDrawerOpen(false); }}
                        className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-all ${
                          isSelected 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                        }`}
                        aria-label={`View ${option.label} category`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{option.label}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isSelected ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <Navbar />

      {/* 🌟 PREMIUM INDUSTRIAL HERO BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 py-16 text-white border-b border-white/10">
        {/* Background glow and grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="space-y-4">
              {/* Visual Breadcrumbs */}
              <div className="text-blue-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                <Link to="/" className="hover:text-blue-300 transition-colors">Home</Link>
                <ChevronRight size={12} />
                <span className="text-gray-300">Products</span>
                {selectedCategory !== 'all' && (
                  <>
                    <ChevronRight size={12} />
                    <span className="text-white font-black">{categoryOptions.find(o => o.value === selectedCategory)?.label}</span>
                  </>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                {selectedCategory !== 'all'
                  ? categoryOptions.find(o => o.value === selectedCategory)?.label
                  : 'Industrial Products Catalog'
                }
              </h1>

              <p className="text-gray-300 text-sm max-w-xl font-medium leading-relaxed">
                Explore Damodar Traders' high-performance industrial supplies. Fully certified engineering components, pipes, fittings, and control valves.
              </p>
            </div>

            {/* Dynamic Real-time Stats Cards */}
            <div className="grid grid-cols-3 gap-4 shrink-0 max-w-lg w-full md:w-auto">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center hover:border-blue-500/30 transition-all duration-300">
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-400">{stats.totalProducts || `${safeAllProducts.length}+`}</p>
                <p className="text-[10px] text-gray-300 uppercase font-black tracking-widest">Products</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center hover:border-blue-500/30 transition-all duration-300">
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{stats.testedRate}</p>
                <p className="text-[10px] text-gray-300 uppercase font-black tracking-widest">Tested</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center hover:border-blue-500/30 transition-all duration-300">
                <p className="text-2xl sm:text-3xl font-extrabold text-purple-400">{stats.certification}</p>
                <p className="text-[10px] text-gray-300 uppercase font-black tracking-widest">Certified</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50">
        {/* Main Content - Professional Grid Layout */}
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-6">
            {/* Left Sidebar - Sticky Category Navigation */}
            <aside className="w-72 flex-shrink-0 hidden lg:block sticky top-24 self-start">
              <ScrollReveal direction="right" distance={30}>
                <div className="flex flex-col h-[calc(100vh-7rem)] bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                  {/* Sidebar Header - Non-scrolling */}
                  <div className="bg-slate-950 px-6 py-5 shrink-0">
                    <h2 className="text-white text-lg font-bold flex items-center gap-3">
                      <Package className="w-5 h-5 text-blue-400" />
                      Product Categories
                    </h2>
                  </div>

                  {/* Category List - Internal Scrolling if needed */}
                  <nav className="p-3 space-y-1.5 overflow-y-auto custom-scrollbar flex-1">
                    {categoryOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = selectedCategory === option.value;
                      const count = categoryCounts[option.value as keyof typeof categoryCounts] || 0;

                      return (
                        <button
                          aria-label={`View ${option.label}`}
                          key={option.value}
                          onClick={() => handleSidebarCategorySelect(option.value === 'all' ? null : option.value)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group border ${isSelected
                            ? 'bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg border-blue-950 shadow-blue-900/20'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-transparent'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg transition-all duration-300 ${isSelected ? 'bg-white text-blue-900' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                              }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="tracking-tight">{option.label}</span>
                          </div>
                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold transition-all duration-300 ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </nav>

                  {/* Sidebar Footer - Non-scrolling */}
                  <div className="p-3 mt-auto border-t border-gray-50 shrink-0">
                    <div className="p-4 bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl text-white">
                      <p className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-1">Support</p>
                      <h4 className="text-sm font-bold mb-2">Need a custom quote?</h4>
                      <Link to="/contact" className="text-xs font-bold flex items-center gap-1 hover:underline">
                        Contact Sales <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </aside>



            {/* Main Product Area */}
            <div className="flex-1 min-w-0 pt-4">

              {/* Mobile Filter Trigger */}
              <div className="lg:hidden mb-4 flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <button onClick={() => setIsMobileDrawerOpen(true)} className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-blue-700">
                  <Menu className="w-5 h-5" /> All Categories & Filters
                </button>
              </div>
              {/* Mobile Category Chips */}
              <div className="lg:hidden block mb-6">
                <ScrollReveal distance={20}>
                  <CategoryChips
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleSidebarCategorySelect}
                  />
                </ScrollReveal>
              </div>

              {/* Search & Filters - Professional Layout */}
              <ScrollReveal distance={20} delay={0.1}>
                <ProductFilters
                  searchQuery={searchQuery}
                  onSearch={handleSearch}
                  onFilterChange={handleFilterChange}
                  isLoading={isLoading}
                  selectedBrand={selectedBrand}
                  selectedSize={selectedSize}
                  onBrandChange={handleBrandChange}
                  onSizeChange={handleSizeChange}
                  activeFilters={activeFilters}
                />
              </ScrollReveal>
              {/* Active Filter Badges */}
              {(selectedBrand || selectedSize || searchQuery || activeFilters.minPrice !== undefined || activeFilters.maxPrice !== undefined || activeFilters.inStock || activeFilters.featured) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      Search: {searchQuery}
                      <button onClick={() => handleSearch('')} className="text-blue-500 hover:text-blue-700" aria-label="Remove Search Filter"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {selectedBrand && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Brand: {selectedBrand}
                      <button onClick={() => handleBrandChange('')} className="text-emerald-500 hover:text-emerald-700" aria-label="Remove Brand Filter"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {selectedSize && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      Size: {selectedSize}
                      <button onClick={() => handleSizeChange('')} className="text-amber-500 hover:text-amber-700" aria-label="Remove Size Filter"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {activeFilters.minPrice !== undefined && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      Min Price: ₹{activeFilters.minPrice}
                      <button onClick={() => handleFilterChange({ ...activeFilters, minPrice: undefined })} className="text-blue-500 hover:text-blue-700" aria-label="Remove Min Price Filter"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {activeFilters.maxPrice !== undefined && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      Max Price: ₹{activeFilters.maxPrice}
                      <button onClick={() => handleFilterChange({ ...activeFilters, maxPrice: undefined })} className="text-blue-500 hover:text-blue-700" aria-label="Remove Max Price Filter"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {activeFilters.inStock && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      In Stock Only
                      <button onClick={() => handleFilterChange({ ...activeFilters, inStock: false })} className="text-green-500 hover:text-green-700" aria-label="Remove In Stock Filter"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {activeFilters.featured && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      Featured Only
                      <button onClick={() => handleFilterChange({ ...activeFilters, featured: false })} className="text-purple-500 hover:text-purple-700" aria-label="Remove Featured Filter"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  <button onClick={handleClearFilters} className="text-xs text-gray-500 hover:text-gray-700 underline">Clear All</button>
                </div>
              )}
              {/* Results Header - Clean Info Display */}
              <ScrollReveal distance={20} delay={0.2}>
                <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Found
                        {searchQuery && <span className="text-gray-600 font-normal"> matching "{searchQuery}"</span>}
                      </p>
                      {selectedCategory !== 'all' && (
                        <p className="text-xs text-gray-600 mt-1">
                          Category: <span className="font-medium text-blue-900">{categoryOptions.find(o => o.value === selectedCategory)?.label}</span>
                        </p>
                      )}
                    </div>

                    {/* Sort Dropdown - Professional Style */}
                    {filteredProducts.length > 0 && (
                      <div className="flex items-center gap-3">
                        <label htmlFor="sort-select" className="text-sm font-medium text-gray-700">Sort by:</label>
                        <div className="relative">
                          <select
                            id="sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent cursor-pointer hover:border-blue-900 transition-colors text-sm font-medium min-h-[40px]"
                          >
                            <option value="default">Default</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="newest">Newest First</option>
                            <option value="popular">Best Rating</option>
                            <option value="name-asc">Name: A to Z</option>
                            <option value="name-desc">Name: Z to A</option>
                          </select>
                          <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>

              {/* Loading/Error/Content State */}
              {isLoading ? (
                <ProductSkeleton count={8} />
              ) : error ? (
                <motion.div
                  className="text-center py-20 bg-white rounded-2xl shadow-sm border border-red-100 p-8 max-w-2xl mx-auto my-12"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center text-red-600 animate-pulse">
                    <AlertTriangle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Connection Failed</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    We are unable to connect to our servers right now. This might be due to a temporary network issue. Please check your connection and try again.
                  </p>
                  <button
                    onClick={fetchAllProducts}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Reconnecting...' : 'Try Again'}
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Empty State - Professional */}
                  {!safeAllProducts || safeAllProducts.length === 0 ? (
                    <motion.div
                      className="text-center py-24"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-50 flex items-center justify-center">
                          <Search className="w-10 h-10 text-blue-900" aria-hidden="true" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No Products Available</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-8">
                          Currently, there are no products in our catalog. Please check back later.
                        </p>
                        <Link
                          to="/contact"
                          className="inline-block px-8 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                          aria-label="Contact us for product information"
                        >
                          Contact Us
                        </Link>
                      </div>
                    </motion.div>
                  ) : filteredProducts.length === 0 ? (
                    <motion.div
                      className="text-center py-24"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center">
                          <Filter className="w-10 h-10 text-emerald-600" aria-hidden="true" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No Products Found</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-8">
                          We couldn't find any products matching your criteria. Try adjusting your filters.
                        </p>
                        <button
                          onClick={handleClearFilters}
                          className="inline-block px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg"
                          aria-label="Clear all filters"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      {/* Professional Product Grid - High-Resolution Focus */}
                      {/* Virtualized Product Grid */}
                      <ErrorBoundary>
                        <div className="w-full">
                          <AutoSizer disableHeight>
                            {({ width }) => {
                              const columnCount = width < 540 ? 2 : width < 1024 ? 3 : width < 1280 ? 4 : 4;
                              const rowCount = Math.ceil(paginatedProducts.length / columnCount);
                              const itemWidth = width / columnCount;
                              const itemHeight = width < 540 ? 340 : width < 1024 ? 400 : 440; // Responsive heights
                              const totalGridHeight = rowCount * itemHeight;

                              return (
                                <Grid
                                  columnCount={columnCount}
                                  columnWidth={itemWidth}
                                  height={totalGridHeight}
                                  rowCount={rowCount}
                                  rowHeight={itemHeight}
                                  width={width}
                                  style={{ overflow: 'hidden' }}
                                >
                                  {({ columnIndex, rowIndex, style }) => {
                                    const index = rowIndex * columnCount + columnIndex;
                                    const product = paginatedProducts[index];
                                    if (!product) return null;

                                    return (
                                      <div style={{ ...style, padding: '12px' }} key={product._id || product.id}>
                                        <ProductCardEnhanced product={product} />
                                      </div>
                                    );
                                  }}
                                </Grid>
                              );
                            }}
                          </AutoSizer>
                        </div>
                      </ErrorBoundary>

                      {/* Clean Pagination */}
                      {totalPages > 1 && (
                        <ScrollReveal>
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredProducts.length}
                            itemsPerPage={itemsPerPage}
                          />
                        </ScrollReveal>
                      )}
                    </>
                  )}

                  {/* CTA Section - Professional B2B Style */}
                  {filteredProducts.length > 0 && (
                    <ScrollReveal delay={0.2}>
                      <div className="mt-8 p-8 rounded-xl bg-gradient-to-r from-blue-50 to-emerald-50 border-2 border-blue-200 text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Need Bulk Orders or Custom Solutions?
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                          Get competitive pricing for industrial quantities and custom specifications.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Link
                            to="/contact"
                            className="px-8 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                            aria-label="Request bulk quote"
                          >
                            Request Bulk Quote
                          </Link>
                          <Link
                            to="/categories"
                            className="px-8 py-3 bg-white border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-all duration-300"
                            aria-label="Browse categories"
                          >
                            View All Categories
                          </Link>
                        </div>
                      </div>
                    </ScrollReveal>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Recently Viewed - Clean Section */}
      <section className="bg-white border-t-2 border-gray-200 py-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <RecentlyViewed limit={5} showClearButton={true} />
          </ScrollReveal>
        </div>
      </section>


      <Footer />
    </>
  );
};

export default Products;