import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSiteSettings, getManufacturingBg } from '@/hooks/useSiteSettings';

const CustomPackaging: React.FC = () => {
  const { settings } = useSiteSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="bg-offwhite rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 lg:p-24 relative overflow-hidden flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-navy/5 to-transparent pointer-events-none" />

          {/* LEFT: Content */}
          <div className="lg:w-1/2 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-industrial font-black text-sm uppercase tracking-widest mb-6 block">
                Custom Solutions
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-navy uppercase tracking-tighter leading-none mb-8">
                YOUR REQUIREMENTS. <br /> OUR ENGINEERING.
              </h2>
              <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed mb-10 max-w-xl">
                Need a specific size, material, printing, lamination, or packaging configuration? Our engineering team works directly with you to develop the exact packaging solution for your application.
              </p>
              
              <Link 
                to="/contact"
                className="group inline-flex items-center justify-center px-10 py-5 bg-navy text-white font-black text-sm uppercase tracking-widest rounded-full hover:bg-industrial transition-colors duration-300 shadow-xl"
              >
                <span>Discuss Your Requirement</span>
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* RIGHT: Visual with floating labels */}
          <div className="lg:w-1/2 relative w-full h-[400px] md:h-[500px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl"
            >
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }} 
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-full h-full"
              >
                <img 
                  src={getManufacturingBg(settings)} 
                  alt="Custom Printed Industrial Bags" 
                  className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
                />
              </motion.div>
              <div className="absolute inset-0 bg-navy/20 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent pointer-events-none" />
            </motion.div>

            {/* Floating Technical Labels */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.8, delay: 0.6, type: "spring" }}
              className="absolute top-1/4 -left-4 md:-left-12 z-20"
            >
              <motion.div 
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white text-navy font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] flex items-center gap-3 border border-white/50 backdrop-blur-sm"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-industrial animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                Custom Dimensions
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.8, delay: 0.8, type: "spring" }}
              className="absolute top-1/2 md:bottom-1/3 -right-4 md:-right-8 z-20"
            >
              <motion.div 
                animate={{ y: [6, -6, 6] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="bg-navy text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] flex items-center gap-3 border border-white/10 backdrop-blur-sm"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-industrial animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                Material Specs
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 1, type: "spring" }}
              className="absolute bottom-6 left-8 md:bottom-12 md:left-12 z-20"
            >
              <motion.div 
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="bg-white/90 backdrop-blur-md text-navy font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] flex items-center gap-3 border border-white"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-industrial animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                Multi-color Printing
              </motion.div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomPackaging;
