import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const CompanyIntroduction: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const { settings } = useSiteSettings();

  return (
    <section ref={containerRef} className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* LEFT: Large Heading */}
          <div className="lg:col-span-6">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-navy leading-tight"
            >
              Built on <br />
              <span className="text-industrial">Manufacturing.</span><br />
              Driven by <br />
              Reliability.
            </motion.h2>
          </div>

          {/* RIGHT: Company Story */}
          <div className="lg:col-span-6 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed mb-6">
                Sundar Corporation is a premier packaging manufacturer and supplier focused on delivering reliable products, consistent quality, and scalable industrial solutions.
              </p>
              <p className="text-gray-500 leading-relaxed">
                From everyday packaging to demanding heavy-duty industrial applications, we engineer solutions that protect your products and optimize your supply chain. We are committed to manufacturing excellence and long-term partnerships with dealers, distributors, and industrial buyers worldwide.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex items-center gap-8"
            >
              <Link 
                to="/about" 
                className="group flex items-center gap-2 text-navy font-black text-sm uppercase tracking-widest hover:text-industrial transition-colors duration-300"
              >
                <span>Discover Our Story</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Circular Video/Image Element */}
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-industrial p-1">
                  <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-100">
                    <img src={settings.virtualTour?.previewImage || settings.manufacturingImage || "/manufacturing.jpg"} alt="Manufacturing Story" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center bg-navy/20">
                      <Play className="w-4 h-4 text-white fill-white ml-1" />
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-tight">
                  Our <br /> Manufacturing <br /> Story
                </span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CompanyIntroduction;
