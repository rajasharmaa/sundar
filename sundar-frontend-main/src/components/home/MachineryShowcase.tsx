import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Settings, Zap, Clock, ShieldCheck } from 'lucide-react';

const machines = [
  {
    name: "Extrusion Tape Line",
    image: "/machine/machine 1.jpeg",
    capacity: "High Speed Output",
    desc: "State-of-the-art extrusion lines ensuring consistent tape width and superior tensile strength for PP/HDPE fabrics.",
    specs: ["High Melt Capacity", "Auto-Gauge Control"]
  },
  {
    name: "Circular Weaving Looms",
    image: "/machine/machin2.jpeg",
    capacity: "50+ Active Looms",
    desc: "High-speed circular looms capable of producing tubular and flat fabrics with zero defects.",
    specs: ["Multi-Shuttle", "Sensor Monitored"]
  },
  {
    name: "Flexo Printing Unit",
    image: "/machine/machine3.jpeg",
    capacity: "Up to 8 Colors",
    desc: "Precision flexographic printing machines for sharp, vibrant, and long-lasting brand graphics on bags.",
    specs: ["High Registration Accuracy", "Fast Drying"]
  },
  {
    name: "Lamination Plant",
    image: "/machine/machine4.jpeg",
    capacity: "Premium Finish",
    desc: "Advanced lamination machinery to apply BOPP films and provide moisture-resistant coatings.",
    specs: ["Edge-to-Edge Coat", "Bubble-Free"]
  },
  {
    name: "Finishing & Stitching",
    image: "/machine/machine5.jpeg",
    capacity: "Automated Setup",
    desc: "Automated cutting, folding, and bottom stitching units ensuring exact dimensions and strong seams.",
    specs: ["Ultrasonic Cutting", "Double Stitch"]
  }
];

const MachineryShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="text-[#22c55e] font-bold text-xs uppercase tracking-[0.2em] mb-4 block">
              Infrastructure
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0f172a] uppercase tracking-tighter leading-none mb-6">
              Our Advanced <br /> Machinery
            </h2>
            <p className="text-gray-600 font-medium text-lg leading-relaxed">
              Equipped with latest technology machines to ensure high volume production without compromising on quality or precision.
            </p>
          </motion.div>
          
          <motion.div
             initial={{ opacity: 0, x: 30 }}
             animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="flex gap-4"
          >
            <div className="flex items-center gap-3 bg-gray-50 px-6 py-4 rounded-xl border border-gray-100">
              <Zap className="text-[#22c55e] w-6 h-6" />
              <div>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Power</div>
                <div className="text-[#0f172a] font-bold">24/7 Operations</div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machines.map((machine, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`group relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 ${
                index === 0 || index === 3 ? 'md:col-span-2 lg:col-span-2' : ''
              }`}
            >
              <div className="absolute inset-0 z-0 h-64 md:h-full">
                <img 
                  src={machine.image} 
                  alt={machine.name} 
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500"></div>
              </div>

              <div className="relative z-10 p-8 h-full flex flex-col justify-end min-h-[350px]">
                <div className="mt-auto">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-[#22c55e] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      {machine.capacity}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-3">
                    {machine.name}
                  </h3>
                  <p className="text-gray-300 font-medium text-sm leading-relaxed mb-6 max-w-lg opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    {machine.desc}
                  </p>
                  
                  <div className="flex gap-4">
                    {machine.specs.map((spec, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <Settings className="w-3 h-3 text-[#22c55e]" />
                        {spec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MachineryShowcase;
