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
import { getOptimizedUrl } from '@/lib/utils';
import logger from '@/lib/logger';
import ScrollReveal from '@/components/ScrollReveal';
import { CatalogueProductCard } from '@/components/product/CatalogueProductCard';

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
  category: string | any;
  rating?: number;
  reviewCount?: number;
}

const defaultCategories: Category[] = [
  {
    id: 'hdpe',
    name: 'HDPE Bags',
    description: 'Sundar Corporation offers a premium range of HDPE Bags (High-Density Polyethylene Bags), known for their strength, durability, and resistance to moisture and wear. Widely used across industries such as agriculture, cement, fertilizers, food grains, and chemicals, our HDPE bags are engineered to safely store and transport bulk materials.',
    image: '/hdpe-bag.png',
    productCount: 9,
    trending: true,
    features: ['High tensile strength', 'Moisture and tear resistant', 'Available in various sizes and weights', 'Cost-effective bulk packaging solution', 'Available in laminated and non-laminated variants'],
    subcategories: ['50 Kg HDPE Plain Bag', '30 Kg Hdpe Bag', '25 Kg Hdpe Printed Bag', 'HDPE White Bag']
  },
  {
    id: 'pp',
    name: 'PP Bags',
    description: 'Our PP Bags (Polypropylene Bags) are manufactured using superior-grade polypropylene, offering excellent strength and durability at an affordable cost. These bags are ideal for packing grains, sugar, cement, fertilizers, and other bulk commodities.',
    image: '/pp-bag.png',
    productCount: 6,
    trending: true,
    features: ['Lightweight yet strong', 'Resistant to chemicals and moisture', 'Reusable and recyclable', 'Available in customized sizes, colors, and printing', 'Economical packaging solution'],
    subcategories: ['30 Kg Pp Sack Bag', 'Seed Packing Material', 'Pp Wall Putti Bag', '50 Kg Pp Wheat Bag']
  },
  {
    id: 'bopp',
    name: 'BOPP Bags',
    description: 'Sundar Corporation supplies high-quality BOPP Bags (Biaxially Oriented Polypropylene Bags), known for their glossy finish, superior printability, and enhanced strength. These bags are perfect for branding and premium packaging needs.',
    image: '/bopp-bag.png',
    productCount: 3,
    trending: true,
    features: ['High-gloss, attractive finish', 'Excellent print quality for branding', 'Strong and tear-resistant', 'Moisture-proof lamination', 'Ideal for retail-ready packaging'],
    subcategories: ['Bopp Woven Sack Bag', 'Bopp Printed Woven Bag', '30 Kg Bopp Woven Bag']
  },
  {
    id: 'bulk',
    name: 'Polypropylene Bulk Bag',
    description: 'Our Polypropylene Bulk Bags are designed for the safe transport and storage of large quantities of bulk materials. Built with reinforced stitching and high-strength fabric, these bags are trusted for heavy-duty industrial use.',
    image: '/bulk-bag.png',
    productCount: 2,
    features: ['High load-bearing capacity', 'Reinforced seams for extra strength', 'UV-stabilized fabric options available', 'Suitable for repeated use', 'Custom sizes and loops available'],
    subcategories: ['25 Kg PP Bulk Bag', '15 kg PP Bulk Bag']
  },
  {
    id: 'jute',
    name: 'Jute Bags',
    description: 'Sundar Corporation also offers eco-friendly Jute Bags, a sustainable alternative to plastic packaging. Made from natural jute fiber, these bags are biodegradable, sturdy, and increasingly preferred by environmentally conscious businesses.',
    image: '/jute-bag.png',
    productCount: 1,
    features: ['100% natural and biodegradable', 'Sturdy and reusable', 'Eco-friendly packaging alternative', 'Customizable with printing/branding', 'Suitable for gifting, retail, and agricultural use'],
    subcategories: ['Jute Gunny Bags']
  },
];

// Category icons mapping
const categoryIcons: Record<string, any> = {
  hdpe: Layers,
  pp: Package,
  bopp: Filter,
  bulk: Package,
  jute: Zap
};

// Color scheme for categories - professional B2B palette
const categoryColors: Record<string, string> = {
  hdpe: 'bg-green-600',
  pp: 'bg-emerald-600',
  bopp: 'bg-teal-600',
  bulk: 'bg-cyan-600',
  jute: 'bg-orange-600'
};

const normalizeCategory = (category: string | undefined | null): string => {
  if (!category) return 'other';

  const normalized = category.toLowerCase().trim();

  // Map specific keywords to standard categories
  if (normalized.includes('hdpe')) return 'hdpe';
  if (normalized.includes('bopp')) return 'bopp';
  if (normalized.includes('pp') || normalized.includes('woven') || normalized.includes('sack')) return 'pp';
  if (normalized.includes('bulk')) return 'bulk';
  if (normalized.includes('jute')) return 'jute';

  return 'other';
};

const Categories = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
                <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
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
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all font-medium text-sm"
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
                      <Layers className="w-5 h-5 text-green-400" />
                      Categories
                    </h2>
                  </div>

                  <nav className="p-3 space-y-1.5 max-h-[calc(100vh-14rem)] overflow-y-auto custom-scrollbar">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${selectedCategory === 'all'
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Package className={`w-4 h-4 ${selectedCategory === 'all' ? 'text-green-200' : 'text-gray-400'}`} />
                        <span>All Products</span>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-black ${selectedCategory === 'all' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-500'
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
                              ? 'bg-green-50 text-green-700 border border-green-100'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                                <img src={category.image} alt={category.name} className="w-5 h-5 object-contain" />
                              </div>
                              <span>{category.name}</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''} ${isSelected ? 'text-green-600' : 'text-gray-300'}`} />
                          </button>

                          <AnimatePresence>
                            {isExpanded && category.subcategories && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden ml-6 pl-4 border-l-2 border-green-50 space-y-1"
                              >
                                {category.subcategories.map((sub) => (
                                  <button
                                    key={sub}
                                    className="w-full text-left px-3 py-2 text-xs font-bold text-gray-400 hover:text-green-600 hover:bg-white rounded-lg transition-all"
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

              {/* Promotional Banner (Like Reference Image) */}
              <ScrollReveal>
                <section className="relative w-full overflow-hidden bg-white shadow-md border border-gray-100 rounded-2xl flex flex-col md:flex-row items-stretch min-h-[320px] lg:min-h-[360px] group">
                  {/* Red slanted background */}
                  <div className="absolute top-0 right-0 bottom-0 w-full md:w-[70%] bg-[#E31E24] z-0 hidden md:block transition-all duration-700 group-hover:w-[72%]" style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}></div>

                  {/* Mobile red background */}
                  <div className="absolute top-[45%] left-0 right-0 bottom-0 w-full bg-[#E31E24] z-0 md:hidden"></div>

                  {/* Left side: Bags Composition */}
                  <div className="relative z-10 w-full md:w-[45%] flex items-end justify-center md:justify-start pl-0 md:pl-6 pt-10 h-[280px] md:h-auto">
                    {/* Dynamic bags composition using hue-rotate to match reference colors */}
                    <div className="relative w-full max-w-[400px] h-[220px] md:h-[280px] flex items-end justify-center pb-2 md:pb-6">
                      <img src="/pp-bag.png" className="absolute bottom-2 md:bottom-6 left-[5%] w-[32%] md:w-[28%] object-contain z-10 drop-shadow-xl" alt="White PP Bag" />
                      <img src="/pp-bag.png" className="absolute bottom-0 md:bottom-2 left-[25%] w-[35%] md:w-[32%] object-contain z-30 drop-shadow-2xl" style={{ filter: 'hue-rotate(190deg) saturate(2)' }} alt="Blue PP Bag" />
                      <img src="/pp-bag.png" className="absolute bottom-2 md:bottom-6 left-[50%] w-[33%] md:w-[30%] object-contain z-20 drop-shadow-xl" style={{ filter: 'hue-rotate(250deg) saturate(1.5)' }} alt="Purple PP Bag" />
                      <img src="/pp-bag.png" className="absolute bottom-4 md:bottom-10 left-[72%] w-[30%] md:w-[26%] object-contain z-0 drop-shadow-lg" alt="White PP Bag" />
                    </div>
                  </div>

                  {/* Right side: Text Content */}
                  <div className="relative z-10 w-full md:w-[55%] p-8 md:p-14 flex flex-col justify-center text-center md:text-left text-white md:pl-12">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-3 text-[#E31E24] md:text-white leading-tight">
                      PP Woven Bags <br className="hidden md:block" /><span className="font-semibold block mt-1 md:mt-2 text-gray-900 md:text-white">Manufacturer</span>
                    </h2>
                    <p className="text-base md:text-lg lg:text-xl font-medium text-white/90 max-w-md mx-auto md:mx-0 leading-snug">
                      Safeguarding goods with innovative PP Woven Sacks/Bags
                    </p>
                  </div>
                </section>
              </ScrollReveal>

              {/* 1. Browse by Category - Large Cards */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <div className="w-2 h-8 bg-green-600 rounded-full" />
                    Browse Categories
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categories.map((category, i) => {
                    return (
                      <ScrollReveal key={category.id} delay={i * 0.1} distance={30}>
                        <div
                          className="group relative bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,200,120,0.12)] hover:border-[#00C878]/30 transition-all cursor-pointer overflow-hidden flex items-center justify-between h-full min-h-[180px]"
                          onClick={() => {
                            setSelectedCategory(category.id);
                            navigate(`/category/${category.id}`);
                          }}
                        >
                          {/* Soft background glow on hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#00C878]/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                          
                          {/* Left Content */}
                          <div className="relative z-10 flex-1 pr-6 flex flex-col justify-center">
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2 group-hover:text-[#00C878] transition-colors">
                              {category.name}
                            </h3>
                            <p className="text-xs md:text-sm font-medium text-gray-500 mb-5 line-clamp-2 leading-relaxed">
                              {category.description || `Explore the best ${category.name} packaging solutions for your industry`}
                            </p>
                            <div className="flex items-center font-bold text-sm text-[#00C878]">
                              Explore now <ChevronRight size={18} strokeWidth={3} className="ml-0.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>

                          {/* Right Image (Bleeding out slightly like Image 1) */}
                          <div className="relative z-10 w-[110px] md:w-[140px] h-[110px] md:h-[140px] flex-shrink-0 flex items-center justify-center -mr-2 md:-mr-4">
                            <img 
                              src={category.image} 
                              alt={category.name} 
                              className="max-w-[110%] max-h-[110%] object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" 
                            />
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
                    className="group flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-green-600 transition-all shadow-md hover:shadow-lg"
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
                        <CatalogueProductCard product={product} />
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

export default Categories;