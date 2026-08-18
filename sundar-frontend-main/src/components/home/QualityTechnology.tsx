import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, Microscope, Activity, Maximize, Printer, CheckSquare } from 'lucide-react';

const qualityPoints = [
  { icon: Shield, title: "Quality Control", desc: "End-to-end monitoring from raw material to dispatch." },
  { icon: Microscope, title: "Material Testing", desc: "Tensile strength, GSM, and UV resistance verification." },
  { icon: Activity, title: "Production Monitoring", desc: "Real-time tracking of weaving and extrusion metrics." },
  { icon: Maximize, title: "Dimensional Inspection", desc: "Laser-guided accuracy for exact bag specifications." },
  { icon: Printer, title: "Printing Accuracy", desc: "High-resolution color matching and registration checks." },
  { icon: CheckSquare, title: "Final Inspection", desc: "100% visual and physical load testing before shipment." }
];

const QualityTechnology: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="py-24 md:py-32 bg-navy relative overflow-hidden">
      {/* Clean solid background */}

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* LEFT: Heading & Stat */}
          <div className="lg:w-1/3 flex flex-col justify-between">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[#22c55e] font-semibold text-sm uppercase tracking-widest mb-4 block">
                Assurance
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-8">
                Quality is <br /> Built into <br /> Every Process.
              </h2>
              <p className="text-offwhite/70 font-medium leading-relaxed">
                We employ advanced testing equipment and rigorous protocols to ensure every packaging solution meets global industrial standards.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12 p-8 border border-white/10 bg-white/5 rounded-2xl"
            >
              <div className="text-6xl font-serif font-bold text-white mb-2">
                98<span className="text-[#22c55e] font-sans">%</span>
              </div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Quality Retention Rate
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Quality Grid */}
          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {qualityPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                  transition={{ duration: 0.6, delay: 0.2 + (index * 0.1) }}
                  className="p-8 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors duration-300 rounded-2xl flex flex-col items-start"
                >
                  <div className="p-4 bg-[#0B2023] border border-[#22c55e]/20 rounded-xl text-[#22c55e] mb-6 shadow-lg shadow-[#22c55e]/5">
                    <point.icon className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight mb-3">
                    {point.title}
                  </h3>
                  <p className="text-white/60 font-medium leading-relaxed">
                    {point.desc}
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

export default QualityTechnology;
