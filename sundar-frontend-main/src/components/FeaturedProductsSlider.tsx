import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Package, ArrowRight } from 'lucide-react';
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
    <section className="py-20 md:py-32 bg-slate-900 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-900/20 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/4 translate-y-1/4" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Text Content */}
          <div className="w-full lg:w-1/3 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Package className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-100">Premium Range</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tighter">
                OUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">FEATURED</span> <br className="hidden md:block" /> PRODUCTS
              </h2>
              <p className="text-base md:text-lg text-slate-300 font-light max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Discover our hand-picked selection of high-performance packaging solutions, designed for durability and engineered for excellence.
              </p>

              {/* Desktop Buttons */}
              {products.length > 1 && (
                <div className="hidden lg:flex gap-4 pt-6">
                  <button onClick={prev} className="w-14 h-14 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-emerald-500 hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-1 transition-all duration-300">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={next} className="w-14 h-14 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-emerald-500 hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-1 transition-all duration-300">
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Slider */}
          <div className="w-full lg:w-2/3 relative h-[420px] md:h-[500px]">
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

                  // Adjust horizontal offsets
                  const xOffset = window.innerWidth < 768 ? 100 : 220;

                  return (
                    <motion.div
                      key={product._id || i}
                      initial={{ scale: 0.8, x: xOffset, opacity: 0 }}
                      animate={{
                        scale: isActive ? 1 : 0.85,
                        x: isActive ? 0 : (isNext ? xOffset : -xOffset),
                        zIndex: isActive ? 30 : 10,
                        opacity: isActive ? 1 : 0.3,
                        rotateY: isActive ? 0 : (isNext ? -15 : 15),
                      }}
                      exit={{ scale: 0.8, x: -xOffset, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 250, damping: 25 }}
                      className={`absolute w-[85%] sm:w-full max-w-[400px] ${isActive ? 'cursor-grab active:cursor-grabbing' : ''} perspective-1000`}
                      drag={isActive ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={1}
                      onDragEnd={(e, { offset }) => {
                        const swipe = offset.x;
                        if (swipe < -50) next();
                        else if (swipe > 50) prev();
                      }}
                    >
                      <Link to={`/products/${product._id}`} className="block pointer-events-none" onClick={(e) => {
                        (e.target as HTMLElement).closest('a')!.style.pointerEvents = 'auto';
                      }}>
                        <div className={`relative overflow-hidden rounded-[40px] transition-all duration-500 h-[480px] w-full flex flex-col group
                          ${isActive 
                            ? 'bg-white shadow-[0_20px_50px_rgba(16,185,129,0.2)]' 
                            : 'bg-white/90 shadow-2xl scale-95 opacity-70'}`}>
                          
                          {/* Top-left organic shape */}
                          <div className="absolute -top-12 -left-12 w-48 h-48 bg-gradient-to-br from-emerald-100/80 to-teal-50/80 rounded-[40%_60%_70%_30%] pointer-events-none z-0" />
                          
                          {/* Bottom-right organic shape */}
                          <div className="absolute -bottom-16 -right-12 w-56 h-56 bg-gradient-to-tl from-emerald-200/60 to-emerald-50/80 rounded-[60%_40%_30%_70%] pointer-events-none z-0" />

                          {/* Decorative dots pattern */}
                          <div className="absolute top-16 left-8 w-16 h-16 bg-[radial-gradient(#10b981_2px,transparent_2px)] [background-size:8px_8px] opacity-20 pointer-events-none z-0" />
                          <div className="absolute bottom-28 right-8 w-16 h-16 bg-[radial-gradient(#10b981_2px,transparent_2px)] [background-size:8px_8px] opacity-20 pointer-events-none z-0" />

                          {/* Center Pill / Oval Image Container */}
                          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[70%] h-[55%] bg-[#e6f4f1] rounded-[100px] flex items-center justify-center p-6 z-10 shadow-inner">
                            <img
                              src={getOptimizedUrl(productImage || '/placeholder.svg')}
                              alt={product.name}
                              className="w-[90%] h-[90%] object-contain drop-shadow-xl transition-transform duration-700 group-hover:scale-110 pointer-events-none"
                              draggable="false"
                            />
                          </div>
                          
                          {/* Content at Bottom */}
                          <div className="absolute bottom-0 left-0 right-0 p-8 z-20 pointer-events-auto">
                            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-2 tracking-tight line-clamp-2" style={{ fontFamily: 'serif' }}>
                              {product.name}
                            </h3>
                            <p className="text-emerald-600/80 text-sm md:text-base font-medium line-clamp-1">
                              {typeof product.category === 'string' ? product.category : product.category?.name || 'Premium Range'}
                            </p>
                            
                            {isActive && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-4 flex items-center gap-2 text-emerald-600 text-sm font-bold uppercase tracking-wider group-hover:text-emerald-500 transition-colors cursor-pointer w-max"
                              >
                                <span>Explore Product</span>
                                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Buttons */}
          {products.length > 1 && (
            <div className="flex lg:hidden gap-4 justify-center w-full mt-4 relative z-20">
              <button onClick={prev} className="w-12 h-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-emerald-500 hover:border-emerald-400 active:bg-emerald-600 transition-all duration-300">
                <ChevronLeft size={20} />
              </button>
              <button onClick={next} className="w-12 h-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-emerald-500 hover:border-emerald-400 active:bg-emerald-600 transition-all duration-300">
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