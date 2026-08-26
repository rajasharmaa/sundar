import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const processSteps = [
  {
    id: '01',
    title: 'Raw Material Selection',
    description: 'Sourcing premium quality granules and additives for superior strength and durability.'
  },
  {
    id: '02',
    title: 'Yarn Extrusion & Weaving',
    description: 'Advanced tape extrusion and precision circular weaving for perfect fabric quality.'
  },
  {
    id: '03',
    title: 'Printing / Lamination',
    description: 'Precision multi-color printing and protective barrier lamination.'
  },
  {
    id: '04',
    title: 'Conversion',
    description: 'Automated cutting and stitching for precise dimensions and durability.'
  },
  {
    id: '05',
    title: 'Quality Inspection',
    description: 'Rigorous testing for strength, GSM, and print accuracy.'
  },
  {
    id: '06',
    title: 'Packaging & Dispatch',
    description: 'Secure bundling and palletizing for safe and efficient global transit.'
  }
];

const ProductionProcess = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Map vertical scroll progress to horizontal movement
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-70%"]);
  
  return (
    <section ref={targetRef} className="relative h-[300vh] bg-white">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <div className="max-w-[1400px] w-full mx-auto px-6 lg:px-12">
          
          {/* Header */}
          <div className="mb-16 mt-[-10vh]">
            <h4 className="text-[#00C878] font-bold text-sm tracking-widest uppercase mb-4">Production Process</h4>
            <h2 className="text-4xl lg:text-6xl font-black text-[#07111F] tracking-tight leading-tight max-w-2xl font-serif">
              From Material To Finished Product
            </h2>
          </div>

          {/* Horizontal Scroll Track */}
          <div className="flex items-center overflow-hidden">
            <motion.div style={{ x }} className="flex gap-8 md:gap-12 w-max pr-[20vw] md:pr-[40vw]">
              {processSteps.map((step) => (
                <div 
                  key={step.id} 
                  className="flex-none w-[280px] md:w-[340px] relative group"
                >
                  {/* Giant Background Number */}
                  <div className="text-[100px] md:text-[120px] leading-none font-black text-gray-50 mb-8 select-none transition-colors duration-500 group-hover:text-gray-100">
                    {step.id}
                  </div>
                  
                  {/* Divider Line */}
                  <div className="h-[1px] w-full bg-gray-200 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-[#00C878] w-0 group-hover:w-full transition-all duration-700 ease-out" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl md:text-2xl font-bold text-[#07111F] mb-4 group-hover:text-[#00C878] transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 font-medium leading-relaxed text-sm md:text-base pr-4">
                    {step.description}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default ProductionProcess;
