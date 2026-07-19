import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { getOptimizedUrl } from '@/lib/utils';

interface FeaturedProductsSliderProps {
  products: Product[];
}

const FeaturedProductsSlider = ({ products }: FeaturedProductsSliderProps) => {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % products.length);
  }, [products.length]);

  const prev = useCallback(() => {
    setIndex((prev) => (prev - 1 + products.length) % products.length);
  }, [products.length]);

  useEffect(() => {
    if (products.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, products.length]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Text Content */}
          <div className="lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full shadow-sm border border-blue-100">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-black uppercase tracking-widest text-blue-700">Featured</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 leading-none tracking-tighter uppercase">
                OUR <span className="text-blue-600">FEATURED</span> <br /> PRODUCTS
              </h2>
              <p className="text-xl text-gray-600 font-medium max-w-lg">
                Discover our hand-picked selection of premium industrial solutions trusted by professionals nationwide.
              </p>
              
              {products.length > 1 && (
                <div className="flex gap-4 pt-8">
                  <button onClick={prev} className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={next} className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300">
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Slider */}
          <div className="lg:w-2/3 w-full relative h-[450px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="popLayout">
                {products.map((product, i) => {
                  const isActive = i === index;
                  const isNext = i === (index + 1) % products.length;
                  const isPrev = i === (index - 1 + products.length) % products.length;
                  
                  if (!isActive && !isNext && !isPrev && products.length > 3) return null;

                  const productImage = (product.images && product.images.length > 0) 
                    ? (typeof product.images[0] === 'string' ? product.images[0] : (product.images[0] as any).url)
                    : product.image;

                  return (
                    <motion.div
                      key={product._id || i}
                      initial={{ scale: 0.8, x: 200, opacity: 0 }}
                      animate={{ 
                        scale: isActive ? 1 : 0.85,
                        x: isActive ? 0 : (isNext ? 180 : -180),
                        zIndex: isActive ? 30 : 10,
                        opacity: isActive ? 1 : 0.5,
                      }}
                      exit={{ scale: 0.8, x: -200, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute w-full max-w-sm"
                    >
                      <Link to={`/products/${product._id}`} className="block">
                        <div className={`bg-white rounded-[2rem] overflow-hidden border border-gray-100 transition-shadow duration-300 ${isActive ? 'shadow-2xl shadow-blue-900/10' : 'shadow-md'}`}>
                          <div className="relative aspect-[4/3] p-6 bg-gray-50 flex items-center justify-center group">
                            <img
                              src={getOptimizedUrl(productImage || '/placeholder.svg')}
                              alt={product.name}
                              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                            />
                            {isActive && (
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <span className="px-6 py-3 bg-white text-gray-900 font-bold rounded-full text-sm uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                  View Details
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                              {typeof product.category === 'string' ? product.category : product.category?.name || 'Category'}
                            </div>
                            <h3 className="text-xl font-black text-gray-900 leading-tight mb-2 line-clamp-1">
                              {product.name}
                            </h3>
                            <p className="text-gray-500 text-sm line-clamp-2">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSlider;