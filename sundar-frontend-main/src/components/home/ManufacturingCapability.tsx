import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CountUp from 'react-countup';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface ManufacturingCapabilityProps {
  companyInfo: any;
  categoriesCount: number;
}

const ManufacturingCapability: React.FC<ManufacturingCapabilityProps> = ({ companyInfo, categoriesCount }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const { settings } = useSiteSettings();

  const stats = [
    { value: 500, suffix: '+', label: 'Products' },
    { value: categoriesCount || 10, suffix: '+', label: 'Categories' },
    { value: new Date().getFullYear() - companyInfo.since, suffix: '+', label: 'Years Experience' },
    { value: parseInt(companyInfo.stats.clients.replace(/\D/g, '')) || 1500, suffix: '+', label: 'Customers' },
    { value: 24, suffix: '/7', label: 'Production' }
  ];

  return (
    <section ref={containerRef} className="relative py-32 md:py-48 overflow-hidden bg-[#0B2023]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={settings.virtualTour?.previewImage || settings.manufacturingImage || "/manufacturing.jpg"} 
          alt="Manufacturing Capability" 
          className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-[#0B2023]/90" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[#22c55e] font-semibold text-sm uppercase tracking-widest mb-6 block">
            Engineered At Scale
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-8">
            Our Manufacturing <br /> Capability
          </h2>
          <p className="text-lg md:text-xl text-white/70 font-medium max-w-3xl mx-auto leading-relaxed mb-20">
            From raw material to finished packaging, our processes are designed around consistency, quality and dependable large-scale production.
          </p>
        </motion.div>

        {/* Animated Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-20 border-t border-b border-white/10 py-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.4 + (index * 0.1) }}
              className="flex flex-col items-center"
            >
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                {isInView ? (
                  <CountUp end={stat.value} duration={2.5} separator="," />
                ) : (
                  "0"
                )}
                <span className="text-[#22c55e]">{stat.suffix}</span>
              </div>
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <Link
            to="/custom-manufacturing"
            className="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-[#0B2023] rounded-full font-semibold text-sm hover:bg-[#22c55e] hover:text-white hover:shadow-[0_0_20px_rgba(229,149,0,0.3)] transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 uppercase tracking-wider">Explore Our Facility</span>
            <div className="relative z-10 ml-3 bg-[#0B2023]/10 group-hover:bg-white/20 rounded-full p-1 transition-colors duration-300">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ManufacturingCapability;
