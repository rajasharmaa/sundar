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
    <section className="py-16 md:py-24 bg-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Text Content */}
          <div className="w-full lg:w-1/3 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4 md:space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full shadow-sm border border-blue-100">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-black uppercase tracking-widest text-blue-700">Featured</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-none tracking-tighter uppercase">
                OUR <span className="text-blue-600">FEATURED</span> <br className="hidden md:block" /> PRODUCTS
              </h2>
              <p className="text-base md:text-xl text-gray-600 font-medium max-w-lg mx-auto lg:mx-0">
                Discover our hand-picked selection of premium industrial solutions trusted by professionals nationwide.
              </p>
              
              {/* Desktop Buttons - Hidden on mobile */}
              {products.length > 1 && (
                <div className="hidden lg:flex gap-4 pt-8">
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
          <div className="w-full lg:w-2/3 relative h-[380px] md:h-[450px]">
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

                  // Adjust horizontal offsets for mobile vs desktop
                  const xOffset = window.innerWidth < 768 ? 100 : 180;

                  return (
                    <motion.div
                      key={product._id || i}
                      initial={{ scale: 0.8, x: xOffset, opacity: 0 }}
                      animate={{ 
                        scale: isActive ? 1 : 0.85,
                        x: isActive ? 0 : (isNext ? xOffset : -xOffset),
                        zIndex: isActive ? 30 : 10,
                        opacity: isActive ? 1 : 0.5,
                      }}
                      exit={{ scale: 0.8, x: -xOffset, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className={`absolute w-[85%] sm:w-full max-w-sm ${isActive ? 'cursor-grab active:cursor-grabbing' : ''}`}
                      drag={isActive ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={1}
                      onDragEnd={(e, { offset, velocity }) => {
                        const swipe = offset.x;
                        if (swipe < -50) {
                          next();
                        } else if (swipe > 50) {
                          prev();
                        }
                      }}
                    >
                      <Link to={`/products/${product._id}`} className="block pointer-events-none" onClick={(e) => {
                        // Re-enable clicks only if not dragging
                        (e.target as HTMLElement).closest('a')!.style.pointerEvents = 'auto';
                      }}>
                        <div className={`bg-white rounded-3xl md:rounded-[2rem] overflow-hidden border border-gray-100 transition-shadow duration-300 ${isActive ? 'shadow-2xl shadow-blue-900/10' : 'shadow-md'}`}>
                          <div className="relative aspect-[4/3] p-4 md:p-6 bg-gray-50 flex items-center justify-center group pointer-events-auto">
                            <img
                              src={getOptimizedUrl(productImage || '/placeholder.svg')}
                              alt={product.name}
                              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                              draggable="false"
                            />
                            {isActive && (
                              <div className="absolute inset-0 bg-black/40 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                                <span className="px-6 py-3 bg-white text-gray-900 font-bold rounded-full text-sm uppercase tracking-wider transform translate-y-4 md:group-hover:translate-y-0 transition-all duration-300">
                                  View Details
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-4 md:p-6 pointer-events-auto">
                            <div className="text-[10px] md:text-xs font-bold text-blue-600 uppercase tracking-widest mb-1 md:mb-2">
                              {typeof product.category === 'string' ? product.category : product.category?.name || 'Category'}
                            </div>
                            <h3 className="text-lg md:text-xl font-black text-gray-900 leading-tight mb-1 md:mb-2 line-clamp-1">
                              {product.name}
                            </h3>
                            <p className="text-gray-500 text-xs md:text-sm line-clamp-2">
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

          {/* Mobile Buttons - Hidden on desktop */}
          {products.length > 1 && (
            <div className="flex lg:hidden gap-4 justify-center w-full mt-4">
              <button onClick={prev} className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 active:bg-blue-700 active:text-white">
                <ChevronLeft size={20} />
              </button>
              <button onClick={next} className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 active:bg-blue-700 active:text-white">
                <ChevronRight size={20} />
              </button>
            </div>
          )}
          
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSlider;