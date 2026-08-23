import React from 'react';
import { motion } from 'framer-motion';

const clients = [
  'ULTRATECH CEMENT',
  'RELIANCE INDUSTRIES',
  'ADANI AGRI',
  'ITC LIMITED',
  'NIRMA',
  'DELHIVERY',
  // Duplicate for infinite scroll effect
  'ULTRATECH CEMENT',
  'RELIANCE INDUSTRIES',
  'ADANI AGRI',
  'ITC LIMITED',
  'NIRMA',
  'DELHIVERY',
];

const ClientLogos: React.FC = () => {
  return (
    <section className="py-12 md:py-16 bg-[#0f172a] border-y border-white/10 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-transparent to-[#0f172a] z-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center relative z-20">
        <p className="text-xs font-bold text-[#22c55e] tracking-[0.2em] uppercase">
          Trusted By Industry Leaders
        </p>
      </div>
      
      <div className="relative flex overflow-x-hidden group mt-4">
        <motion.div
          className="flex space-x-16 md:space-x-24 px-6 items-center whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 30
          }}
        >
          {clients.map((client, index) => (
            <div key={index} className="flex items-center text-white/40 hover:text-white transition-colors duration-500 cursor-default">
              <span className="text-xl md:text-3xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Arial Black, Impact, sans-serif' }}>
                {client}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ClientLogos;
