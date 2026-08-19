/* eslint-disable @typescript-eslint/no-explicit-any */
import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, Package, Layers, Wrench, Filter, Zap, ArrowRight, 
  MapPin, Globe, ShieldCheck, Award, Users, ChevronRight, X, AlertTriangle, RefreshCw, SlidersHorizontal
} from 'lucide-react';

import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useDebounceValue } from '@/hooks/usePerformanceOptimization';
import { api } from '../services/api/api-client';
import { useToast } from '@/hooks/use-toast';
import { useApiHandler } from '@/hooks/useApiHandler';
import { SEO } from '@/components/SEO';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';
import logger from '@/lib/logger';
import { useDeepMemo } from '@/hooks/usePerformanceOptimization';
import { Product } from '../services/api/endpoints';
import { CatalogueProductCard } from '@/components/product/CatalogueProductCard';
import ProductSkeleton from '@/components/Products/ProductSkeleton';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { MultiSelectFilter } from '@/components/filters/MultiSelectFilter';

export default function Products() {
  const { settings } = useSiteSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('default');

  const selectedCategory = categoryParam || 'all';
  const selectedBrand = searchParams.get('brand') || '';
  const selectedSize = searchParams.get('size') || '';

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  const [activeFilters, setActiveFilters] = useState<any>({});
  const [searchInput, setSearchInput] = useState(searchQuery);
  const debouncedSearchQuery = useDebounceValue(searchInput, 300);

  const [stats, setStats] = useState({
    totalProducts: '500+',
    customers: '1000+',
    categories: '12+',
    experience: '8+'
  });

  const {
    data: allProducts = [],
    loading: isLoading,
    error,
    execute: fetchProducts
  } = useApiHandler<Product[]>({
    showErrors: true,
    retryOnError: true
  });

  const safeAllProducts = useMemo(() => Array.isArray(allProducts) ? allProducts : [], [allProducts]);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching trust metrics
    setStats({
      totalProducts: safeAllProducts.length > 0 ? `${safeAllProducts.length}+` : '500+',
      customers: '2500+',
      categories: '15+',
      experience: '30+'
    });
  }, [safeAllProducts.length]);

  const handleSearch = useCallback((query: string) => {
    const sanitized = query.replace(/[<>]/g, '');
    setSearchQuery(sanitized);
    // Don't update searchInput here, it causes cursor jumping/flickering while typing
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (sanitized) newParams.set('search', sanitized);
      else newParams.delete('search');
      return newParams;
    }, { replace: true });
  }, [setSearchParams]);

  const searchParam = searchParams.get('search') || '';

  useEffect(() => {
    const searchFromURL = searchParam.replace(/[<>]/g, '');
    if (searchFromURL !== searchQuery) {
      setSearchQuery(searchFromURL);
      // Only update the input field if the change came from URL (like back button)
      // and not from the user currently typing
      if (searchFromURL !== debouncedSearchQuery.replace(/[<>]/g, '')) {
        setSearchInput(searchFromURL);
      }
    }
  }, [searchParam, searchQuery, debouncedSearchQuery]);

  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      handleSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, handleSearch, searchQuery]);

  const categoryOptions = useDeepMemo([
    { value: 'all', label: 'ALL PRODUCTS' },
    { value: 'hdpe', label: 'HDPE BAGS' },
    { value: 'pp', label: 'PP BAGS' },
    { value: 'bopp', label: 'BOPP BAGS' },
    { value: 'bulk', label: 'FIBC / BULK BAGS' },
    { value: 'flexible', label: 'FLEXIBLE PACKAGING' },
    { value: 'industrial', label: 'INDUSTRIAL PACKAGING' },
    { value: 'custom', label: 'CUSTOM SOLUTIONS' },
  ], []);

  const breadcrumbs = useBreadcrumbs([
    selectedCategory !== 'all'
      ? { label: categoryOptions.find(c => c.value === selectedCategory)?.label || 'Category' }
      : { label: 'All Products' }
  ]);

  const normalizeCategory = useCallback((category: any): string => {
    const catName = typeof category === 'string' ? category : (category?.name || '');
    const cat = catName.toLowerCase();
    
    if (cat.includes('bopp')) return 'bopp';
    if (cat.includes('hdpe')) return 'hdpe';
    // Only return 'pp' if it's explicitly 'pp' and NOT 'bopp' (already handled above, but just to be safe)
    if (cat.includes('pp') || cat.includes('woven')) return 'pp';
    if (cat.includes('bulk') || cat.includes('fibc')) return 'bulk';
    if (cat.includes('flexible')) return 'flexible';
    if (cat.includes('industrial')) return 'industrial';
    if (cat.includes('custom')) return 'custom';
    return 'other';
  }, []);

  const filteredProducts = useMemo(() => {
    if (!safeAllProducts || safeAllProducts.length === 0) return [];

    let filtered = safeAllProducts.filter((product: any) => {
      // Search filter
      const matchesSearch = searchQuery.trim() === '' ||
        (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const normalizedProductCategory = normalizeCategory(product.category);
      const normalizedSelectedCategory = normalizeCategory(selectedCategory);
      const matchesCategory = selectedCategory === 'all' || 
        normalizedProductCategory === normalizedSelectedCategory || 
        (selectedCategory === 'custom' && (product as any).isCustom);
      
      // Material filter
      const matchesMaterial = selectedMaterials.length === 0 || 
        (product.material && selectedMaterials.includes(product.material));

      return matchesSearch && matchesCategory && matchesMaterial;
    });

    if (sortBy !== 'default') {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'newest': return new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime();
          case 'name-asc': return (a.name || '').localeCompare(b.name || '');
          case 'name-desc': return (b.name || '').localeCompare(a.name || '');
          default: return 0;
        }
      });
    }

    return filtered;
  }, [safeAllProducts, searchQuery, selectedCategory, selectedMaterials, sortBy, normalizeCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: safeAllProducts.length };
    categoryOptions.forEach(opt => { if (opt.value !== 'all') counts[opt.value] = 0; });
    
    safeAllProducts.forEach(product => {
      if (product.category) {
        const normalized = normalizeCategory(product.category);
        if (counts[normalized] !== undefined) counts[normalized]++;
      }
    });
    return counts;
  }, [safeAllProducts, categoryOptions, normalizeCategory]);

  const fetchAllProducts = useCallback(async () => {
    try {
      await fetchProducts(
        () => api.products.getAll(),
        (products) => {},
        (error) => logger.error('Error fetching products', error)
      );
    } catch (error) {
      logger.error('Products fetch failed', error);
    }
  }, [fetchProducts]);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  const handleCategorySelect = (slug: string | null) => {
    const categoryValue = slug || 'all';
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (categoryValue === 'all') newParams.delete('category');
      else newParams.set('category', categoryValue);
      return newParams;
    });
  };

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-emerald-500 selection:text-white flex flex-col">
      <Helmet><meta name="robots" content="index, follow" /></Helmet>
      <SEO title="Packaging Products & Solutions | Sundar Corporation" description="Premium industrial packaging catalogue." />
      <BreadcrumbSchema breadcrumbs={breadcrumbs} />
      
      {/* 1. PREMIUM NAVBAR */}
      <Navbar />

      {/* 2. PRODUCTS HERO */}
      <section className="relative h-[360px] md:h-[420px] bg-[#07111F] flex items-center pt-20 overflow-hidden">
        {/* Background Image & Gradient */}
        <div className="absolute inset-0 z-0">
          <img 
            src={settings.productsBanner || settings.manufacturingImage || "/manufacturing.jpg"} 
            alt="Packaging Manufacturing" 
            className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020817] via-[#07111F]/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-[0.2em] mb-4">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">Products</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-[1.1] mb-6">
              PACKAGING<br/>
              SOLUTIONS BUILT<br/>
              <span className="text-emerald-400">FOR INDUSTRY.</span>
            </h1>
            
            <p className="text-gray-400 text-base md:text-lg max-w-xl font-medium leading-relaxed mb-8">
              Explore our range of high-performance packaging solutions engineered for strength, reliability and demanding industrial applications.
            </p>
            
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-sm font-bold tracking-widest text-sm uppercase transition-colors inline-flex items-center gap-2">
              Explore Products <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* 3. CATEGORY NAVIGATION (Horizontal) */}
      <section className="bg-white border-b border-gray-200 sticky top-16 md:top-20 z-40 shadow-sm">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex overflow-x-auto hide-scrollbar custom-scrollbar px-6 md:px-12">
            {categoryOptions.map((cat) => {
              const isActive = selectedCategory === cat.value;
              const count = categoryCounts[cat.value] || 0;
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategorySelect(cat.value)}
                  className={`relative flex items-center gap-2 py-5 px-1 md:px-4 shrink-0 font-bold text-xs md:text-sm uppercase tracking-widest transition-colors ${
                    isActive ? 'text-navy' : 'text-gray-400 hover:text-navy'
                  }`}
                >
                  {cat.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                    {count}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeCategory"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 md:px-12 py-12 md:py-20 flex flex-col">
        
        {/* 4. PRODUCT DISCOVERY TOOLBAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search premium industrial packaging..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-offwhite border-none text-navy pl-12 pr-4 py-4 rounded-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-6 py-4 bg-offwhite hover:bg-gray-100 text-navy font-bold text-sm uppercase tracking-widest rounded-sm transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
              {selectedMaterials.length > 0 && (
                <span className="bg-[#00C878] text-white text-xs px-2 py-0.5 rounded-full ml-2">
                  {selectedMaterials.length}
                </span>
              )}
            </button>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-offwhite border-none text-navy py-4 pl-6 pr-12 rounded-sm font-bold text-sm uppercase tracking-widest focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="default">Featured</option>
                <option value="newest">Newest</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Header */}
        <div className="mb-10">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Our Product Range</h2>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-black text-navy uppercase tracking-tight">
              {categoryOptions.find(o => o.value === selectedCategory)?.label}
            </h3>
            <span className="text-gray-400 font-medium">{filteredProducts.length} Products</span>
          </div>
        </div>

        {/* 5. PRODUCT CATALOGUE GRID */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProductSkeleton count={6} />
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-navy mb-2">Connection Error</h3>
            <p className="text-gray-500 mb-6">Unable to load the product catalogue.</p>
            <button onClick={fetchAllProducts} className="bg-navy text-white px-6 py-3 rounded-sm font-bold uppercase tracking-widest text-sm">
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="py-24 text-center bg-offwhite rounded-xl border border-dashed border-gray-300">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-navy mb-2 uppercase tracking-tight">No Products In This Category Yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Our team can help you find the right packaging solution or manufacture a custom product for your exact requirements.
            </p>
            <Link to="/contact" className="bg-emerald-500 text-white px-8 py-4 rounded-sm font-bold uppercase tracking-widest text-sm hover:bg-emerald-600 transition-colors inline-block">
              Contact Our Team
            </Link>
          </div>
        ) : (
          <ErrorBoundary>
            <motion.div 
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredProducts.map((product, index) => {
                // Make every 7th product featured (large tile) if on desktop
                const isFeatured = index % 7 === 0 && index !== 0;
                return (
                  <motion.div 
                    key={product._id || product.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                    }}
                    className={isFeatured ? 'md:col-span-2' : ''}
                  >
                    <CatalogueProductCard product={product} isFeatured={isFeatured} />
                  </motion.div>
                );
              })}
            </motion.div>
          </ErrorBoundary>
        )}
      </main>

      {/* 6. PRODUCT DISCOVERY CTA */}
      <section className="bg-[#020817] py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-luminosity" style={{ backgroundImage: `url(${settings.manufacturingImage || '/manufacturing.jpg'})` }} />
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-6">
              CAN'T FIND <br/><span className="text-emerald-400">WHAT YOU NEED?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 font-medium">
              Tell us your packaging requirements and our engineering team will help you find the right solution or custom manufacture it for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-sm font-bold uppercase tracking-widest text-sm transition-colors text-center">
                Request a Quote
              </Link>
              <Link to="/about" className="bg-transparent border border-gray-600 hover:border-white text-white px-8 py-4 rounded-sm font-bold uppercase tracking-widest text-sm transition-colors text-center">
                Talk to our Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CAPABILITY / TRUST SECTION */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-navy uppercase tracking-tight">
              PACKAGING ENGINEERED <br className="hidden md:block"/> FOR PERFORMANCE.
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="text-center pt-8 md:pt-0">
              <Package className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
              <p className="text-4xl font-black text-navy mb-2">{stats.totalProducts}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Products</p>
            </div>
            <div className="text-center pt-8 md:pt-0">
              <Users className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
              <p className="text-4xl font-black text-navy mb-2">{stats.customers}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">B2B Customers</p>
            </div>
            <div className="text-center pt-8 md:pt-0">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
              <p className="text-4xl font-black text-navy mb-2">100%</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quality Tested</p>
            </div>
            <div className="text-center pt-8 md:pt-0">
              <Award className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
              <p className="text-4xl font-black text-navy mb-2">{stats.experience}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Years Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. GLOBAL / PAN-INDIA PRESENCE */}
      <section className="py-24 bg-offwhite overflow-hidden relative">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="max-w-xl z-10">
            <div className="flex items-center gap-3 text-emerald-500 font-bold text-xs uppercase tracking-[0.2em] mb-4">
              <Globe className="w-4 h-4" /> Global Reach
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-navy uppercase tracking-tight mb-6">
              REACHING BUSINESSES <br/>BEYOND BORDERS.
            </h2>
            <p className="text-gray-500 font-medium leading-relaxed mb-8">
              With a robust manufacturing infrastructure and a dedicated logistics network, Sundar Corporation delivers premium packaging solutions to industrial hubs across India and international markets, ensuring timely supply for uninterrupted operations.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                <MapPin className="w-4 h-4 text-emerald-500" /> <span className="font-bold text-navy text-sm">Pan-India Supply</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                <Globe className="w-4 h-4 text-emerald-500" /> <span className="font-bold text-navy text-sm">Export Quality</span>
              </div>
            </div>
          </div>
          
          {/* Abstract Network Illustration */}
          <div className="relative w-full lg:w-1/2 h-[400px] flex items-center justify-center">
             {/* Abstract circular network nodes representing locations */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,200,120,0.05)_0%,transparent_70%)]" />
             <div className="relative w-full h-full max-w-md">
                {/* Central Hub */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-500 rounded-full shadow-[0_0_30px_rgba(0,200,120,0.5)] z-20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-emerald-500/20 rounded-full animate-ping opacity-20" />
                
                {/* Connecting Lines and Nodes */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <path d="M50 50 L20 30 M50 50 L80 20 M50 50 L85 60 M50 50 L30 80 M50 50 L10 60" stroke="rgba(0,200,120,0.2)" strokeWidth="0.5" fill="none" />
                  <circle cx="20" cy="30" r="1.5" fill="#07111F" />
                  <circle cx="80" cy="20" r="2" fill="#07111F" />
                  <circle cx="85" cy="60" r="1.5" fill="#07111F" />
                  <circle cx="30" cy="80" r="2.5" fill="#07111F" />
                  <circle cx="10" cy="60" r="1" fill="#07111F" />
                </svg>
             </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <MultiSelectFilter
        title="Material"
        options={[
          { value: 'HDPE', label: 'HDPE' },
          { value: 'PP', label: 'PP Woven' },
          { value: 'BOPP', label: 'BOPP' },
          { value: 'LDPE', label: 'LDPE' },
          { value: 'Jute', label: 'Jute / Eco-friendly' }
        ]}
        selectedValues={selectedMaterials}
        onChange={setSelectedMaterials}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
      <Footer />
    </div>
  );
}