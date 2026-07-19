import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Camera, MapPin } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const isSafeImage = (url?: string): boolean => {
  if (!url) return false;
  return /^\//.test(url) || /^https?:\/\//.test(url);
};

const shopPhotos = [
  {
    image: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweqgLB9yVgiMyQhTQR76qltycH7dCvQbyaLD68eqONCZxOhkKi3QY0eVh5-CmdWucsgVECLETk-NK1DT738kZB-qrADr6QNf6zF7VnzF0O35xBZqL_RFBUjNhU5-hYzXDk3V1A5D=s1360-w1360-h1020-rw',
    caption: 'Main Showroom',
    description: 'Experience our extensive range of premium industrial fittings.'
  },
  {
    image: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweofwt3aI2ZzdlAuOiwzd00uT4cWGzHn5zwXQSUoZKS3OX_la-MjcY8U0sA6zaRBGxDvnHYCloIHkmsFQ4I8XeucpIJp5DPytZw9mBZ5qvoW2SnW8jqHQoTjpOE1Nd_z23mQR0nN=s1360-w1360-h1020-rw',
    caption: 'Product Showcase',
    description: 'Precision-engineered products for every industrial need.'
  },
  {
    image: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwepjyX6xJHm-216BZ1vzDXikePTc4uDDEnZhL4oTgHcpAGvPKmcceZzpyXMPoytyKoTC6sCMqpqMmDljZ9WR6RNAVOexJZiBRFUprFFh4pnKrC6OQUDbqsWgJmeZDXtjxHVur_6O=s1360-w1360-h1020-rw',
    caption: 'Smart Warehouse',
    description: 'Strategic storage ensuring lightning-fast delivery pan-India.'
  },
  {
    image: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweqzzQ_prGTZtQplO5rJTK1Vd8RkGpbv8ao3uw1WwxZXFsWh2MH3Bx_OHcCneuO-dA0d1iK5UwteeHMt-Or3ALlmhmkpD2AaqY4fnKApr8-XHcpI7Crtck_JoPFri36IsZdxdaY=s1360-w1360-h1020-rw',
    caption: 'Quality Lab',
    description: 'Rigorous testing to maintain our legacy of trust since 2011.'
  }
];

const ShopSlider = () => {
  const { settings } = useSiteSettings();
  const [index, setIndex] = useState(0);

  const next = useCallback(() => setIndex((prev) => (prev + 1) % settings.shopPhotos.length), [settings.shopPhotos.length]);
  const prev = useCallback(() => setIndex((prev) => (prev - 1 + settings.shopPhotos.length) % settings.shopPhotos.length), [settings.shopPhotos.length]);

  // Auto swap every 4 seconds
  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Text Content */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
                <Camera className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Facility Tour</span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 leading-none tracking-tighter">
                OUR <span className="text-blue-600">HUB</span> OF <br /> EXCELLENCE
              </h2>
              <p className="text-xl text-gray-600 font-medium max-w-lg">
                Step inside the engine room of Damodar Traders. From our modern showroom to our advanced warehouse.
              </p>
              
              <div className="flex gap-4 pt-8">
                <button onClick={prev} className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={next} className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300">
                  <ChevronRight size={24} />
                </button>
              </div>
            </motion.div>
          </div>

          {/* 3D Stack Swap Effect */}
          <div className="lg:w-1/2 relative h-[500px] w-full max-w-[500px]">
            <AnimatePresence mode="popLayout">
              {settings.shopPhotos.map((photo, i) => {
                // Determine order for 3D stack
                const isActive = i === index;
                const isNext = i === (index + 1) % settings.shopPhotos.length;
                const isPrev = i === (index - 1 + settings.shopPhotos.length) % settings.shopPhotos.length;
                
                if (!isActive && !isNext) return null;

                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8, x: 100, opacity: 0, rotate: 10 }}
                    animate={{ 
                      scale: isActive ? 1 : 0.9,
                      x: isActive ? 0 : 40,
                      z: isActive ? 50 : 0,
                      opacity: isActive ? 1 : 0.6,
                      rotate: isActive ? 0 : -5,
                      zIndex: isActive ? 20 : 10
                    }}
                    exit={{ scale: 0.8, x: -100, opacity: 0, rotate: -10 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 cursor-pointer"
                    onClick={next}
                  >
                    <div className="h-full w-full bg-white rounded-[3rem] p-4 shadow-2xl border border-white/50 relative overflow-hidden group">
                      <img
                        src={isSafeImage(photo.image) ? photo.image : '/placeholder.svg'}
                        alt={photo.caption}
                        className="w-full h-[320px] object-cover rounded-[2.5rem]"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                      
                      <div className="p-8">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                           <MapPin size={14} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Indore, MP</span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{photo.caption}</h3>
                        <p className="text-sm text-gray-500 font-medium line-clamp-1">{photo.description}</p>
                      </div>
                      
                      {/* Glass Overlay on Hover */}
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                         <div className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl">
                            NEXT PHOTO
                         </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopSlider;