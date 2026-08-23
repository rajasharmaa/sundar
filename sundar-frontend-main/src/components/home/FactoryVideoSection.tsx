import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const FactoryVideoSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const { settings } = useSiteSettings();
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <>
      <section ref={containerRef} className="py-24 md:py-32 bg-white relative">
        <div className="max-w-[1400px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 1 }}
            className="relative w-full aspect-video md:aspect-[21/9] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-[#0f172a] shadow-2xl group cursor-pointer"
            onClick={() => setIsPlaying(true)}
          >
            {/* Thumbnail Image */}
            <img 
              src={settings.manufacturingImage || "/manufacturing.jpg"} 
              alt="Sundar Corporation Manufacturing Facility" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-700 group-hover:scale-105"
            />
            
            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />

            {/* Play Button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_50px_rgba(255,255,255,0.1)] relative">
                <div className="absolute inset-0 rounded-full border border-[#22c55e] animate-ping opacity-20"></div>
                <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-2" />
              </div>
              <h3 className="text-white font-bold tracking-widest uppercase mt-8 text-sm md:text-base opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                Watch Factory Tour
              </h3>
            </div>

            {/* Labels */}
            <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12">
              <span className="text-[#22c55e] font-bold text-xs uppercase tracking-widest mb-2 block">
                Inside Sundar Corporation
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
                Our Facilities
              </h2>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Modal Placeholder */}
      {isPlaying && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-12">
          <button 
            onClick={() => setIsPlaying(false)}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="w-full max-w-6xl aspect-video bg-[#0f172a] rounded-2xl overflow-hidden relative border border-white/10 flex items-center justify-center">
            <div className="text-center">
              <Play className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/50 font-medium uppercase tracking-widest">Video integration pending real footage</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FactoryVideoSection;
