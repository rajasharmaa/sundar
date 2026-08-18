import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const industries = [
  { name: "Agriculture", color: "from-emerald-900/90 to-emerald-600/80", desc: "Durable sacks for seeds, feeds, and crop storage.", image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop" },
  { name: "Chemicals", color: "from-blue-900/90 to-blue-600/80", desc: "Chemical-resistant packaging for safe transport.", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000&auto=format&fit=crop" },
  { name: "Construction", color: "from-orange-900/90 to-orange-600/80", desc: "Heavy-duty bags for cement and construction materials.", image: "https://images.unsplash.com/photo-1541888087850-8b9fb641a24d?q=80&w=1000&auto=format&fit=crop" },
  { name: "Food & Grains", color: "from-amber-900/90 to-amber-600/80", desc: "Food-grade packaging ensuring freshness and hygiene.", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=1000&auto=format&fit=crop" },
  { name: "Fertilizers", color: "from-purple-900/90 to-purple-600/80", desc: "Moisture-proof laminated bags for chemical fertilizers.", image: "https://images.unsplash.com/photo-1592982537447-6f23f465c3e5?q=80&w=1000&auto=format&fit=crop" },
  { name: "Pharmaceuticals", color: "from-cyan-900/90 to-cyan-600/80", desc: "High-purity packaging for medical ingredients.", image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=1000&auto=format&fit=crop" },
  { name: "Logistics", color: "from-slate-900/90 to-slate-700/80", desc: "Bulk bags and protective packaging for transit.", image: "https://images.unsplash.com/photo-1586528116311-ad8ed7c83a9f?q=80&w=1000&auto=format&fit=crop" }
];

const IndustriesServed: React.FC = () => {
  const { settings } = useSiteSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section ref={containerRef} className="py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-emerald-500 font-bold text-xs uppercase tracking-[0.2em] mb-4 block">
              Sectors We Serve
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0f172a] uppercase tracking-tighter leading-[1.1]">
              PACKAGING FOR INDUSTRIES <br className="hidden lg:block" />
              THAT KEEP INDIA MOVING.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-[#0f172a] font-bold text-sm uppercase tracking-widest hover:text-emerald-600 transition-colors"
            >
              View All Solutions <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Hover-Expand Accordion Gallery */}
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row w-full h-[800px] md:h-[600px] gap-2 md:gap-4">
          {industries.map((industry, index) => {
            const isHovered = hoveredIndex === index;
            const isAnyHovered = hoveredIndex !== null;

            return (
              <motion.div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                animate={{
                  flex: isHovered ? 4 : (isAnyHovered ? 1 : 2)
                }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="relative h-full overflow-hidden rounded-2xl cursor-pointer group flex-1 md:flex-none w-full md:w-auto"
                style={{ flexBasis: 'auto' }} // ensure framer motion controls flex correctly
              >
                {/* Background Image with slight scale on hover */}
                <motion.img
                  src={industry.image || settings?.manufacturingImage || "/manufacturing.jpg"}
                  alt={industry.name}
                  animate={{ scale: isHovered ? 1.05 : 1 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Base Dark overlay */}
                <div className="absolute inset-0 bg-slate-900/40" />

                {/* Color overlay that fades in intensely on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-t ${industry.color} mix-blend-multiply`}
                  animate={{ opacity: isHovered ? 0.9 : 0.6 }}
                  transition={{ duration: 0.4 }}
                />

                {/* Vertical Text (Default State on Desktop) */}
                <div className="absolute inset-0 pointer-events-none">
                  <motion.h3
                    animate={{
                      opacity: isHovered ? 0 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-white font-black text-2xl uppercase tracking-widest whitespace-nowrap hidden md:block absolute bottom-12 left-1/2 origin-left -rotate-90"
                  >
                    {industry.name}
                  </motion.h3>

                  {/* Mobile default text (when not hovered, since no hover on mobile typically, just show it normally) */}
                  <div className="md:hidden absolute bottom-0 left-0 p-6 flex flex-col justify-end">
                    <h3 className="text-white font-black text-xl uppercase tracking-widest drop-shadow-lg">
                      {industry.name}
                    </h3>
                  </div>
                </div>

                {/* Expanded Content (Hover State) */}
                <motion.div
                  className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end pointer-events-none"
                  animate={{
                    opacity: isHovered ? 1 : 0,
                    y: isHovered ? 0 : 20
                  }}
                  transition={{ duration: 0.4, delay: isHovered ? 0.1 : 0 }}
                >
                  <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-xl border border-white/10 max-w-sm">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2 drop-shadow-lg">
                      {industry.name}
                    </h3>
                    <p className="text-white/90 font-medium mb-6 text-sm leading-relaxed drop-shadow-md">
                      {industry.desc}
                    </p>
                    <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest">
                      <span className="bg-white text-slate-900 px-4 py-2 rounded-full inline-flex items-center gap-2">
                        Explore <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default IndustriesServed;
