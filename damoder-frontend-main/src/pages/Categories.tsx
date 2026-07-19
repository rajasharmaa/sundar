import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ChevronDown, ChevronRight, Package, Layers, Wrench, Filter, Zap,
  ArrowRight, X, Star, TrendingUp, Shield, Clock, Heart, GitCompare, Eye
} from 'lucide-react';
import { CardSkeleton, CategoriesSkeleton } from '@/components/skeletons/SkeletonLoader';
import { api } from '../services/api/api-client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useWishlist } from '@/context/WishlistContext';
import { useCompare } from '@/context/CompareContext';
import { getOptimizedUrl } from '@/lib/utils';
import logger from '@/lib/logger';
import ScrollReveal from '@/components/ScrollReveal';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  trending?: boolean;
  features?: string[];
  subcategories?: string[];
}

interface ProductCard {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  price?: number;
  images?: string[];
  category?: string | any;
  rating?: number;
  reviewCount?: number;
}

const defaultCategories: Category[] = [
  {
    id: 'pipes',
    name: 'Pipes & Tubes',
    description: 'Industrial-grade pipes and tubes for demanding applications',
    image: '/placeholder.svg',
    productCount: 150,
    trending: true,
    features: ['Stainless Steel', 'Carbon Steel', 'Galvanized', 'Seamless'],
    subcategories: ['Steel Pipes', 'Copper Tubes', 'PVC Pipes', 'HDPE Pipes']
  },
  {
    id: 'fittings',
    name: 'Pipe Fittings',
    description: 'Precision-engineered fittings for seamless pipe connections',
    image: '/placeholder.svg',
    productCount: 200,
    trending: true,
    features: ['Elbows', 'Tees', 'Reducers', 'Flanges', 'Couplings'],
    subcategories: ['Butt Weld', 'Socket Weld', 'Threaded', 'Flanged']
  },
  {
    id: 'valves',
    name: 'Valves & Controls',
    description: 'Superior flow control solutions with reliable sealing',
    image: '/placeholder.svg',
    productCount: 150,
    trending: true,
    features: ['Gate Valves', 'Ball Valves', 'Check Valves', 'Globe Valves'],
    subcategories: ['Manual Valves', 'Automated Valves', 'Control Valves']
  },
  {
    id: 'flanges',
    name: 'Flanges',
    description: 'High-pressure flanges for secure pipe connections',
    image: '/placeholder.svg',
    productCount: 80,
    features: ['Weld Neck', 'Slip On', 'Blind Flanges', 'Socket Weld'],
    subcategories: ['ANSI Flanges', 'DIN Flanges', 'JIS Flanges']
  },
  {
    id: 'fasteners',
    name: 'Fasteners',
    description: 'Industrial bolts, nuts, and fastening solutions',
    image: '/placeholder.svg',
    productCount: 120,
    features: ['Hex Bolts', 'Stud Bolts', 'Nuts', 'Washers'],
    subcategories: ['Metric', 'Imperial', 'Stainless Steel', 'Alloy Steel']
  },
  {
    id: 'other',
    name: 'Industrial Components',
    description: 'Comprehensive range of specialized industrial hardware',
    image: '/placeholder.svg',
    productCount: 50,
    features: ['Gaskets', 'Clamps', 'Supports', 'Accessories'],
    subcategories: ['Rubber Gaskets', 'Metal Clamps', 'Pipe Supports']
  },
];

// Category icons mapping
const categoryIcons: Record<string, any> = {
  pipes: Layers,
  fittings: Wrench,
  valves: Filter,
  flanges: Package,
  fasteners: Zap,
  other: Package
};

// Color scheme for categories - professional B2B palette
const categoryColors: Record<string, string> = {
  pipes: 'bg-blue-600',
  fittings: 'bg-emerald-600',
  valves: 'bg-red-600',
  flanges: 'bg-purple-600',
  fasteners: 'bg-amber-600',
  other: 'bg-gray-600'
};

const normalizeCategory = (category: string | undefined | null): string => {
  if (!category) return 'other';

  const normalized = category.toLowerCase().trim();

  // Map specific keywords to standard categories
  if (normalized.includes('pipe') || normalized.includes('tube')) return 'pipes';
  if (normalized.includes('fitting') || normalized.includes('elbow') || normalized.includes('tee') || normalized.includes('flange')) return 'fittings';
  if (normalized.includes('valve') || normalized.includes('gate') || normalized.includes('ball valve')) return 'valves';

  return 'other';
};

const Categories = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Combined data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          api.products.getAll(),
          api.categories.getAll()
        ]);

        const safeProducts = Array.isArray(productsData) ? productsData : [];
        setProducts((safeProducts as unknown) as ProductCard[]);

        if (Array.isArray(categoriesData)) {
          // Merge API categories with defaults to get rich metadata
          const mergedCategories = categoriesData.map((apiCat: any) => {
            const defaultMatch = defaultCategories.find(
              d => d.id === apiCat.slug || d.name.toLowerCase() === apiCat.name.toLowerCase()
            );

            return {
              id: apiCat.slug || apiCat.name.toLowerCase().replace(/\s+/g, '-'),
              name: apiCat.name,
              description: apiCat.description || defaultMatch?.description || `Professional range of ${apiCat.name} products.`,
              image: apiCat.categoryImage || defaultMatch?.image || '/placeholder.svg',
              productCount: apiCat.productCount || 0,
              trending: apiCat.trending || defaultMatch?.trending || false,
              features: apiCat.features || defaultMatch?.features || ['Quality Certified', 'Industrial Grade'],
              subcategories: apiCat.subcategories || defaultMatch?.subcategories || []
            };
          });

          setCategories(mergedCategories);
        }
      } catch (err) {
        logger.error('Failed to fetch data:', err);
        toast({
          title: 'Connection Note',
          description: 'Using cached data.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);


  // Get featured products for selected category
  const featuredProducts = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products : [];
    if (selectedCategory === 'all') {
      return safeProducts.slice(0, 8);
    }
    return safeProducts
      .filter(p => normalizeCategory(p.category) === selectedCategory)
      .slice(0, 8);
  }, [products, selectedCategory]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Page Title Section - Compact & Modern */}
        <div className="bg-white border-b border-gray-100 pt-24 pb-8">
          <div className="max-w-[1600px] mx-auto px-6">
            <ScrollReveal distance={20}>
              <nav className="flex mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">Categories</span>
              </nav>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                    Material Catalog
                  </h1>
                  <p className="text-gray-500 max-w-2xl font-medium">
                    Browse our comprehensive range of industrial-grade components and hardware solutions.
                  </p>
                </div>
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search in catalog..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium text-sm"
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 py-10 w-full">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Redesigned Sidebar - High Contrast Industrial Look */}
            <aside className="w-full lg:w-80 shrink-0">
              <ScrollReveal direction="right" distance={30}>
                <div className="sticky top-24 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="bg-gray-900 px-6 py-5">
                    <h2 className="text-white text-lg font-extrabold flex items-center gap-3">
                      <Layers className="w-5 h-5 text-blue-400" />
                      Categories
                    </h2>
                  </div>

                  <nav className="p-3 space-y-1.5 max-h-[calc(100vh-14rem)] overflow-y-auto custom-scrollbar">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${selectedCategory === 'all'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Package className={`w-4 h-4 ${selectedCategory === 'all' ? 'text-blue-200' : 'text-gray-400'}`} />
                        <span>All Products</span>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-black ${selectedCategory === 'all' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {products.length}
                      </span>
                    </button>

                    {categories.map((category) => {
                      const Icon = categoryIcons[category.id] || Package;
                      const isSelected = selectedCategory === category.id;
                      const isExpanded = expandedCategory === category.id;

                      return (
                        <div key={category.id} className="space-y-1">
                          <button
                            onClick={() => {
                              setExpandedCategory(isExpanded ? null : category.id);
                              setSelectedCategory(category.id);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${isSelected
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <span>{category.name}</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''} ${isSelected ? 'text-blue-600' : 'text-gray-300'}`} />
                          </button>

                          <AnimatePresence>
                            {isExpanded && category.subcategories && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden ml-6 pl-4 border-l-2 border-blue-50 space-y-1"
                              >
                                {category.subcategories.map((sub) => (
                                  <button
                                    key={sub}
                                    className="w-full text-left px-3 py-2 text-xs font-bold text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                                  >
                                    {sub}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </nav>
                </div>
              </ScrollReveal>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 space-y-12">

              {/* 1. Browse by Category - Large Cards */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-600 rounded-full" />
                    Browse Categories
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {categories.map((category, i) => {
                    const Icon = categoryIcons[category.id] || Package;
                    return (
                      <ScrollReveal key={category.id} delay={i * 0.1} distance={30}>
                        <div
                          className="group relative bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer overflow-hidden h-full"
                          onClick={() => {
                            setSelectedCategory(category.id);
                            navigate(`/products?category=${category.id}`);
                          }}
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-100 transition-colors" />
                          <div className="relative z-10">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110 ${categoryColors[category.id] || 'bg-gray-900'}`}>
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                              {category.name}
                            </h3>
                            <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
                              {category.description}
                            </p>
                            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest mt-auto">
                              <span className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                                {category.productCount} Products
                              </span>
                              <div className="flex items-center gap-1 text-gray-400 group-hover:text-blue-600 transition-colors">
                                Explore <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </ScrollReveal>
                    );
                  })}
                </div>
              </section>

              {/* 2. Featured Products Grid */}
              <section className="pt-8 border-t border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                    {selectedCategory === 'all' ? 'Featured Products' : `${categories.find(c => c.id === selectedCategory)?.name}`}
                  </h2>
                  <Link
                    to="/products"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-md hover:shadow-lg"
                  >
                    View Full Catalog
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
                  </div>
                ) : featuredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <Package className="w-16 h-16 text-gray-200 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">No products found</h3>
                    <p className="text-gray-400">Try selecting another category</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {featuredProducts.map((product, i) => (
                      <ScrollReveal key={product._id || product.id} delay={i * 0.1} distance={20}>
                        <ProductCardComponent
                          product={product}
                          isInWishlist={isInWishlist}
                          toggleWishlist={toggleWishlist}
                          isInCompare={isInCompare}
                          addToCompare={addToCompare}
                          removeFromCompare={removeFromCompare}
                        />
                      </ScrollReveal>
                    ))}
                  </div>
                )}
              </section>
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

// Reusable Product Card with Enhanced UI
const ProductCardComponent = ({
  product,
  isInWishlist,
  toggleWishlist,
  isInCompare,
  addToCompare,
  removeFromCompare
}: any) => {
  const inWishlist = isInWishlist(product.id || product._id);
  const inCompare = isInCompare(product.id || product._id);
  const badgeStyle = (cat: string) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('pipe')) return 'bg-blue-50 text-blue-700 border-blue-100';
    if (c.includes('fitting')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    return 'bg-gray-50 text-gray-700 border-gray-100';
  };

  const currentCategory = typeof product.category === 'string' ? product.category : product.category?.name || 'Industrial';

  return (
    <div className="group relative bg-white flex flex-col h-full rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-500 overflow-hidden">
      {/* Absolute Top Badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm backdrop-blur-md ${badgeStyle(currentCategory)}`}>
          {currentCategory}
        </span>
      </div>

      {/* Image Container - Non-cropping */}
      <div className="bg-gray-50/50 aspect-square overflow-hidden relative">
        <Link
          to={`/products/${product.id || product._id}`}
          className="block w-full h-full"
        >
          <img
            src={getOptimizedUrl(product.images?.[0] || product.image || '/placeholder.svg')}
            alt={product.name}
            className="w-full h-full object-contain p-8 transform group-hover:scale-110 transition-transform duration-700"
          />
        </Link>
        <div className="absolute inset-0 bg-blue-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="flex gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform pointer-events-auto">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
              className={`p-3 rounded-full shadow-xl transition-all ${inWishlist ? 'bg-pink-500 text-white' : 'bg-white text-gray-400 hover:text-pink-500'}`}
              aria-label="Toggle wishlist"
            >
              <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (inCompare) removeFromCompare(product.id || product._id);
                else addToCompare({ ...product, id: product.id || product._id, image: product.images?.[0] || product.image });
              }}
              className={`p-3 rounded-full shadow-xl transition-all ${inCompare ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 hover:text-blue-600'}`}
              aria-label="Compare product"
            >
              <GitCompare size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-6 flex flex-col flex-1">
        <Link to={`/products/${product.id || product._id}`}>
          <h3 className="text-base font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors min-h-[3rem] leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between pointer-events-none">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Industrial Unit Price</span>
            <span className="text-xl font-black text-gray-900">
              ₹{(product.price || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-45">
            <ArrowRight size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;