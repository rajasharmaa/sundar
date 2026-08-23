import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, ShieldCheck, FileCheck, CheckCircle } from 'lucide-react';

const certifications = [
  {
    icon: Award,
    title: "ISO 9001:2015",
    desc: "Certified Quality Management System ensuring consistent product excellence.",
    highlight: "Quality Standard"
  },
  {
    icon: ShieldCheck,
    title: "BIS Certified",
    desc: "Adhering to Bureau of Indian Standards for manufacturing woven sacks.",
    highlight: "National Standard"
  },
  {
    icon: FileCheck,
    title: "GST Compliant",
    desc: "100% transparent and compliant billing and taxation practices.",
    highlight: "Business Trust"
  },
  {
    icon: CheckCircle,
    title: "Load Test Passed",
    desc: "Every batch undergoes rigorous SWL and SF testing for safety.",
    highlight: "Safety First"
  }
];

const CertificationsShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="py-24 bg-[#0B2023] relative overflow-hidden border-t border-white/5">
      {/* Industrial Grid Background */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[#22c55e] font-bold text-xs uppercase tracking-[0.2em] mb-4 block">
              Recognized Excellence
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
              Certifications & Standards
            </h2>
            <div className="w-16 h-1 bg-[#22c55e] mx-auto mt-6"></div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {certifications.map((cert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative bg-[#0f2a2e] border border-white/10 p-8 hover:border-[#22c55e]/50 transition-colors duration-500 flex flex-col items-start shadow-xl"
            >
              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-transparent group-hover:border-[#22c55e] transition-colors duration-500 m-4"></div>
              
              <div className="mb-6 p-4 bg-white/5 group-hover:bg-[#22c55e]/10 transition-colors duration-500 rounded-lg border border-white/5">
                <cert.icon className="w-8 h-8 text-white group-hover:text-[#22c55e] transition-colors duration-500" />
              </div>
              
              <span className="text-[#22c55e] text-xs font-bold uppercase tracking-widest mb-2 block">
                {cert.highlight}
              </span>
              
              <h3 className="text-xl font-bold text-white mb-3">
                {cert.title}
              </h3>
              
              <p className="text-white/60 font-medium text-sm leading-relaxed">
                {cert.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificationsShowcase;
