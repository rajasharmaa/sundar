import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Globe, MapPin, Truck, Building2 } from 'lucide-react';

const GlobalPresence = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const stats = [
    { label: 'Countries Exported', value: '15+', icon: Globe },
    { label: 'Manufacturing Units', value: '2', icon: Factory },
    { label: 'Global Clients', value: '500+', icon: Building2 },
    { label: 'Annual Export (Tons)', value: '10K+', icon: Truck }
  ];

  return (
    <section ref={containerRef} className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            className="text-4xl md:text-5xl font-black text-[#2E3192] mb-6"
          >
            Global Existence
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 leading-relaxed"
          >
            Delivering high-quality packaging solutions across the globe. Our strong distribution network ensures timely delivery worldwide.
          </motion.p>
        </div>

        <div className="relative w-full max-w-5xl mx-auto mb-20 aspect-[2/1]">
          {/* Simple vector map representation using a background or placeholder image, 
              in a real scenario we might use a library like react-simple-maps or an SVG */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-full h-full rounded-3xl bg-gray-50 border border-gray-100 shadow-inner flex items-center justify-center relative overflow-hidden"
          >
             {/* We can use an SVG map as a background for the premium feel */}
             <div className="absolute inset-0 opacity-40" style={{ 
               backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1000 500\'%3E%3Cpath fill=\'%23cbd5e1\' d=\'M256,192 C256,192 260,190 264,192 C268,194 270,198 270,202 C270,206 266,210 262,210 C258,210 254,206 254,202 C254,198 256,192 256,192 Z M312,188 C312,188 316,186 320,188 C324,190 326,194 326,198 C326,202 322,206 318,206 C314,206 310,202 310,198 C310,194 312,188 312,188 Z M220,160 C220,160 224,158 228,160 C232,162 234,166 234,170 C234,174 230,178 226,178 C222,178 218,174 218,170 C218,166 220,160 220,160 Z M180,180 C180,180 184,178 188,180 C192,182 194,186 194,190 C194,194 190,198 186,198 C182,198 178,194 178,190 C178,186 180,180 180,180 Z M380,220 C380,220 384,218 388,220 C392,222 394,226 394,230 C394,234 390,238 386,238 C382,238 378,234 378,230 C378,226 380,220 380,220 Z M450,150 C450,150 454,148 458,150 C462,152 464,156 464,160 C464,164 460,168 456,168 C452,168 448,164 448,160 C448,156 450,150 450,150 Z M520,180 C520,180 524,178 528,180 C532,182 534,186 534,190 C534,194 530,198 526,198 C522,198 518,194 518,190 C518,186 520,180 520,180 Z M600,240 C600,240 604,238 608,240 C612,242 614,246 614,250 C614,254 610,258 606,258 C602,258 598,254 598,250 C598,246 600,240 600,240 Z M680,200 C680,200 684,198 688,200 C692,202 694,206 694,210 C694,214 690,218 686,218 C682,218 678,214 678,210 C678,206 680,200 680,200 Z M750,280 C750,280 754,278 758,280 C762,282 764,286 764,290 C764,294 760,298 756,298 C752,298 748,294 748,290 C748,286 750,280 750,280 Z M820,350 C820,350 824,348 828,350 C832,352 834,356 834,360 C834,364 830,368 826,368 C822,368 818,364 818,360 C818,356 820,350 820,350 Z M880,180 C880,180 884,178 888,180 C892,182 894,186 894,190 C894,194 890,198 886,198 C882,198 878,194 878,190 C878,186 880,180 880,180 Z\' /%3E%3C/svg%3E")',
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               backgroundRepeat: 'no-repeat'
             }}></div>

             {/* Location Pins */}
             <div className="absolute top-[40%] left-[65%] flex flex-col items-center">
                <div className="relative">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-ping absolute"></div>
                  <div className="w-4 h-4 bg-red-600 rounded-full relative z-10 border-2 border-white"></div>
                </div>
                <div className="mt-2 bg-white px-3 py-1 rounded-full shadow-md text-xs font-bold text-gray-800 whitespace-nowrap">
                  India (HQ & Factory)
                </div>
             </div>

             <div className="absolute top-[35%] left-[55%] flex flex-col items-center group cursor-pointer">
                <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white group-hover:scale-150 transition-transform"></div>
                <div className="mt-2 bg-white/90 px-2 py-0.5 rounded text-[10px] font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Middle East</div>
             </div>

             <div className="absolute top-[30%] left-[45%] flex flex-col items-center group cursor-pointer">
                <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white group-hover:scale-150 transition-transform"></div>
                <div className="mt-2 bg-white/90 px-2 py-0.5 rounded text-[10px] font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Europe</div>
             </div>

             <div className="absolute top-[45%] left-[20%] flex flex-col items-center group cursor-pointer">
                <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white group-hover:scale-150 transition-transform"></div>
                <div className="mt-2 bg-white/90 px-2 py-0.5 rounded text-[10px] font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">North America</div>
             </div>

             <div className="absolute top-[60%] left-[80%] flex flex-col items-center group cursor-pointer">
                <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white group-hover:scale-150 transition-transform"></div>
                <div className="mt-2 bg-white/90 px-2 py-0.5 rounded text-[10px] font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Australia</div>
             </div>

             <div className="absolute top-[55%] left-[50%] flex flex-col items-center group cursor-pointer">
                <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white group-hover:scale-150 transition-transform"></div>
                <div className="mt-2 bg-white/90 px-2 py-0.5 rounded text-[10px] font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Africa</div>
             </div>

             {/* Map Legend */}
             <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-100">
               <div className="space-y-2">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                   <span className="text-xs font-semibold text-gray-600">Head Office & Factory</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                   <span className="text-xs font-semibold text-gray-600">Export Destinations</span>
                 </div>
               </div>
             </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100"
            >
              <div className="w-12 h-12 bg-white text-[#2E3192] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Simple placeholder for Factory icon since it might not be imported above
const Factory = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path>
    <path d="M17 18h1"></path>
    <path d="M12 18h1"></path>
    <path d="M7 18h1"></path>
  </svg>
);

export default GlobalPresence;
