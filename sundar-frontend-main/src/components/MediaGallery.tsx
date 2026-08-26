import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight, Zap, ShoppingBag } from 'lucide-react';
import { api, type Product } from '@/services/api/api-client';
import ProductSkeleton from '@/components/Products/ProductSkeleton';
import logger from '@/lib/logger';

const isSafeImage = (url?: string): boolean => {
  if (!url) return false;
  return /^\//.test(url) || /^https?:\/\//.test(url);
};

const MediaGallery = () => {
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchPopularProducts = async () => {
      try {
        setIsLoading(true);
        const response = await api.products.getAll();

        if (!mounted) return;

        const data = Array.isArray(response) ? response : (response as any)?.data || [];
        if (!data || data.length === 0) {
          logger.warn('Popular products array is empty.');
          return;
        }

        // Shuffle products randomly and select 12
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        console.log('MediaGallery: raw data count fetched =', data.length, '; sliced count =', shuffled.slice(0, 12).length);
        setPopularProducts(shuffled.slice(0, 12));
      } catch (error) {
        logger.error('Error fetching popular products:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    fetchPopularProducts();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 60, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const
      }
    }
  };

  return (
    <section className="relative py-24 overflow-hidden bg-white">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-green-50 rounded-full blur-[120px] opacity-50" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-cyan-50 rounded-full blur-[120px] opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-green-50 text-green-600 rounded-full text-xs sm:text-xs font-bold uppercase tracking-widest mb-4">
              <Zap size={14} className="fill-current" aria-hidden="true" />
              <span>Trending Now</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-none">
              POPULAR <span className="text-green-600 block sm:inline">COLLECTIONS</span>
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-500 max-w-xl font-medium">
              Explore our most sought-after industrial solutions, precision-engineered for maximum performance and durability.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-4 lg:mt-0"
          >
            <Link
              to="/categories"
              className="group flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-green-600 transition-all duration-500 shadow-xl hover:shadow-green-200 text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <span>EXPLORE ALL</span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight size={16} aria-hidden="true" />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Dynamic Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <ProductSkeleton count={8} />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
            >
              {popularProducts.map((product) => (
                <motion.div
                  key={product.slug || product._id || product.id}
                  variants={itemVariants}
                  className="group relative h-full hover:-translate-y-2 sm:hover:-translate-y-3 transition-transform duration-500 ease-out"
                >
                  <Link to={`/products/${product.slug || product._id || product.slug || product.slug || product._id || product.id}`} className="block h-full flex flex-col">
                    <div className="h-full bg-white rounded-3xl sm:rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.12)] transition-all duration-700 flex flex-col relative">

                      {/* Image Container with Magnetic Effect */}
                      <div className="relative aspect-square sm:aspect-[4/5] overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                        <img
                          src={isSafeImage(product.image) ? product.image : '/placeholder.svg'}
                          alt={product.name || 'Industrial Product'}
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                          sizes="(max-width:768px) 100vw, 25vw"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                            target.alt = 'Product image not available';
                          }}
                        />

                        {/* Status Overlay */}
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                          <div className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest text-green-600 shadow-sm border border-white">
                            {typeof product.category === 'string' ? product.category : ((product.category as any)?.name || 'Industrial')}
                          </div>
                          {product.discount > 0 && (
                            <div className="px-4 py-1.5 bg-rose-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                              {product.discount}% OFF
                            </div>
                          )}
                        </div>

                        {/* Interactive Hover Layer */}
                        <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-green-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-8 flex flex-col justify-end">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col text-white">
                              <span className="text-xs font-bold uppercase tracking-widest opacity-70">Category</span>
                              <span className="text-sm font-black">{typeof product.category === 'string' ? product.category : ((product.category as any)?.name || 'Industrial')}</span>
                            </div>
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-green-900 shadow-xl transform rotate-12 group-hover:rotate-0 transition-all duration-500">
                              <ShoppingBag size={24} aria-hidden="true" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-5 sm:p-8 flex-1 flex flex-col">
                        <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2 line-clamp-1 sm:line-clamp-2 group-hover:text-green-600 transition-colors leading-tight">
                          {product.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium line-clamp-2 mb-4 sm:mb-6">
                          {product.shortDescription || product.description || `High-performance ${(typeof product.category === 'string' ? product.category : (product.category as any)?.name)?.toLowerCase() || 'industrial'} solution engineered for excellence.`}
                        </p>

                        <div className="mt-auto pt-4 sm:pt-6 border-t border-gray-50 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Availability</span>
                            <span className="text-xs sm:text-xs font-black text-green-600 flex items-center gap-1.5 mt-0.5">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse" />
                              IN STOCK
                            </span>
                          </div>
                          <div className="text-green-600 font-black text-xs sm:text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            Details <ChevronRight size={14} aria-hidden="true" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default MediaGallery;


