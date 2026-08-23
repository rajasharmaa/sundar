import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Minus } from 'lucide-react';

const specs = [
  { feature: "GSM Range", hdpe: "40 - 120", pp: "50 - 150", bopp: "60 - 180", fibc: "100 - 250" },
  { feature: "Max Load Capacity", hdpe: "25 kg", pp: "50 kg", bopp: "50 kg", fibc: "2000 kg" },
  { feature: "UV Resistance", hdpe: true, pp: true, bopp: true, fibc: true },
  { feature: "Moisture Proof", hdpe: true, pp: true, bopp: "High", fibc: true },
  { feature: "Custom Printing", hdpe: "4-Color", pp: "6-Color", bopp: "8-Color", fibc: "4-Color" },
  { feature: "Food Grade", hdpe: true, pp: true, bopp: true, fibc: true },
];

const ProductSpecsComparison: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const renderValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <div className="flex justify-center"><Check className="w-5 h-5 text-[#22c55e]" /></div>
      ) : (
        <div className="flex justify-center"><Minus className="w-5 h-5 text-gray-300" /></div>
      );
    }
    return <span className="font-medium text-gray-700">{value}</span>;
  };

  return (
    <section ref={containerRef} className="py-24 bg-[#FDFBF7] relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[#22c55e] font-bold text-xs uppercase tracking-[0.2em] mb-4 block">
              Technical Specifications
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-[#0f172a] uppercase tracking-tighter">
              Product Capabilities
            </h2>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="overflow-x-auto pb-8"
        >
          <div className="min-w-[800px] bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-[#0f172a]">
                  <th className="py-6 px-6 text-left text-white font-bold text-sm uppercase tracking-widest w-1/4 border-b border-white/10">Feature</th>
                  <th className="py-6 px-4 text-white font-bold text-sm uppercase tracking-widest border-b border-white/10 border-l border-white/10">HDPE Bags</th>
                  <th className="py-6 px-4 text-white font-bold text-sm uppercase tracking-widest border-b border-white/10 border-l border-white/10">PP Woven Sacks</th>
                  <th className="py-6 px-4 text-[#22c55e] font-bold text-sm uppercase tracking-widest border-b border-white/10 border-l border-white/10 bg-white/5 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#22c55e] text-white text-[10px] px-3 py-1 rounded-full whitespace-nowrap shadow-md">Premium</div>
                    BOPP Laminated
                  </th>
                  <th className="py-6 px-4 text-white font-bold text-sm uppercase tracking-widest border-b border-white/10 border-l border-white/10">FIBC Jumbo Bags</th>
                </tr>
              </thead>
              <tbody>
                {specs.map((spec, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-5 px-6 text-left font-bold text-[#0f172a] text-sm uppercase tracking-wider bg-gray-50/50">
                      {spec.feature}
                    </td>
                    <td className="py-5 px-4 border-l border-gray-100">{renderValue(spec.hdpe)}</td>
                    <td className="py-5 px-4 border-l border-gray-100">{renderValue(spec.pp)}</td>
                    <td className="py-5 px-4 border-l border-gray-100 bg-[#22c55e]/5">{renderValue(spec.bopp)}</td>
                    <td className="py-5 px-4 border-l border-gray-100">{renderValue(spec.fibc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ProductSpecsComparison;
