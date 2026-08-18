import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const FinalCTA: React.FC = () => {
  const { settings } = useSiteSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="py-32 md:py-48 bg-navy relative overflow-hidden">
      {/* Background Industrial Subtle Image */}
      <div className="absolute inset-0 z-0">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={isInView ? { scale: 1 } : { scale: 1.1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={settings.manufacturingImage || "/manufacturing.jpg"} 
          alt="Sundar Corporation Manufacturing" 
          className="w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-navy/40" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl lg:text-[5rem] font-black text-white uppercase tracking-tighter leading-[1.1] mb-8">
            READY TO FIND <br className="hidden md:block" />
            THE RIGHT <span className="text-industrial">PACKAGING?</span>
          </h2>
          <p className="text-xl md:text-2xl text-offwhite/80 font-medium max-w-3xl mx-auto leading-relaxed mb-12">
            Tell us what you need. We'll help you engineer and deliver the right solution for your industrial requirements.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/contact"
              className="group relative inline-flex items-center justify-center px-10 py-5 bg-industrial text-navy font-black text-sm uppercase tracking-widest overflow-hidden rounded-full hover:bg-industrial-light transition-colors duration-300 w-full sm:w-auto"
            >
              <span>Request a Quote</span>
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/contact"
              className="group inline-flex items-center justify-center px-10 py-5 bg-white/5 backdrop-blur-md text-white border border-white/20 hover:border-white hover:bg-white/10 font-bold text-sm uppercase tracking-widest rounded-full transition-all duration-300 w-full sm:w-auto"
            >
              <Phone className="mr-3 w-5 h-5" />
              <span>Talk to our Team</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
