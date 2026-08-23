import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import CountUp from 'react-countup';
import { Factory, Box, Users, Truck } from 'lucide-react';

const stats = [
  {
    icon: Factory,
    value: 500,
    suffix: "+",
    unit: "Metric Tons",
    label: "Monthly Production"
  },
  {
    icon: Box,
    value: 50,
    suffix: "k+",
    unit: "Bags",
    label: "Daily Output"
  },
  {
    icon: Users,
    value: 200,
    suffix: "+",
    unit: "Skilled Staff",
    label: "Dedicated Workforce"
  },
  {
    icon: Truck,
    value: 1500,
    suffix: "+",
    unit: "Dispatches",
    label: "Monthly Deliveries"
  }
];

const ProductionCapacityDashboard: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 border border-gray-100 shadow-sm">
                <Factory className="w-8 h-8 text-[#22c55e]" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] uppercase tracking-tighter leading-none mb-6">
                Scale & <br /> Capacity
              </h2>
              <p className="text-gray-600 font-medium text-lg leading-relaxed mb-8">
                Our infrastructure is designed for high-volume manufacturing, ensuring we meet bulk industrial requirements with consistent quality and timely delivery.
              </p>
              
              <div className="inline-flex items-center gap-3 bg-[#0B2023] text-white px-6 py-3 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-widest">Active Operations</span>
              </div>
            </motion.div>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: 0.2 + (index * 0.1) }}
                className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 hover:border-[#22c55e]/30 transition-colors duration-300 flex flex-col justify-between min-h-[240px]"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-[#0f172a]">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
                    {stat.unit}
                  </span>
                </div>
                
                <div>
                  <div className="text-5xl md:text-6xl font-black text-[#0f172a] tracking-tighter mb-2 flex items-baseline">
                    {isInView ? (
                      <CountUp end={stat.value} duration={2.5} separator="," />
                    ) : (
                      "0"
                    )}
                    <span className="text-[#22c55e] text-3xl md:text-4xl ml-1">{stat.suffix}</span>
                  </div>
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProductionCapacityDashboard;
