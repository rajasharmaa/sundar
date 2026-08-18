import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useSiteSettings, getManufacturingBg } from '@/hooks/useSiteSettings';

const features = [
  {
    title: "Manufacturing Expertise",
    description: "State-of-the-art facilities producing high-volume, precision-engineered packaging."
  },
  {
    title: "Consistent Quality",
    description: "Rigorous ISO-certified quality control protocols at every production stage."
  },
  {
    title: "Custom Solutions",
    description: "Tailored specifications, specialized materials, and custom printing capabilities."
  },
  {
    title: "Reliable Supply",
    description: "Robust supply chain ensuring on-time delivery for critical industrial operations."
  }
];

export default function WhyChooseUs() {
  const { settings } = useSiteSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10%" });

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  return (
    <section ref={containerRef} className="py-16 md:py-24 bg-white relative">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          
          {/* LEFT: Large Industrial Image */}
          <div className="lg:w-1/2 w-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 1 }}
              ref={imageContainerRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative h-[400px] lg:h-[550px] w-full bg-gray-50 rounded-2xl border border-gray-100 shadow-sm"
            >
              {/* Grayscale Base Image */}
              <img 
                src={getManufacturingBg(settings)} 
                alt="Industrial Scale Packaging" 
                className="absolute inset-0 w-full h-full object-contain p-6 filter grayscale opacity-60"
              />

              {/* Colored Spotlight Overlay */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  WebkitMaskImage: `radial-gradient(circle 250px at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 80%)`,
                  maskImage: `radial-gradient(circle 250px at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 80%)`,
                }}
              >
                <img 
                  src={getManufacturingBg(settings)} 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-contain p-6"
                />
              </motion.div>

              <div className="absolute inset-0 bg-[#0B2023]/5 mix-blend-multiply rounded-2xl pointer-events-none" />
            </motion.div>
          </div>

          {/* RIGHT: Content */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <span className="text-[#22c55e] font-semibold text-sm uppercase tracking-widest mb-4 block">
                Corporate Overview
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#0B2023] leading-tight mb-8">
                Why Choose <br /> Sundar?
              </h2>
              <div className="w-full h-px bg-gray-200" />
            </motion.div>

            {/* Annual Report Style List */}
            <div className="space-y-10">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                  transition={{ duration: 0.8, delay: 0.2 + (index * 0.1) }}
                  className="relative pl-10 group"
                >
                  <div className="absolute left-0 top-3 w-6 h-[2px] bg-gray-200 group-hover:bg-[#22c55e] transition-colors duration-300" />
                  <h3 className="text-xl font-bold text-[#0B2023] tracking-tight mb-2 group-hover:text-[#22c55e] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

