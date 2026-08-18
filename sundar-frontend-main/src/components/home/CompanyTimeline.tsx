import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const milestones = [
  { year: "2017", title: "Foundation", desc: "Established in Indore, MP, starting with core trading operations." },
  { year: "2019", title: "Expansion", desc: "Expanded product portfolio to include specialized industrial packaging." },
  { year: "2021", title: "Manufacturing", desc: "Started dedicated manufacturing operations to ensure quality control." },
  { year: "2023", title: "ISO Certification", desc: "Achieved ISO 9001:2015 certification for quality management." },
  { year: "2025", title: "Pan-India Reach", desc: "Serving 1500+ corporate clients across India." }
];

const CompanyTimeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="py-24 md:py-32 bg-white relative">
      <div className="max-w-[1000px] mx-auto px-6">
        
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-industrial font-black text-sm uppercase tracking-widest mb-6 block">
              Company Story
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-navy uppercase tracking-tighter leading-none">
              OUR JOURNEY
            </h2>
          </motion.div>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gray-200 transform md:-translate-x-1/2" />

          <div className="space-y-16 md:space-y-24">
            {milestones.map((milestone, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                className={`relative flex flex-col md:flex-row items-start md:items-center ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-industrial transform -translate-x-1/2 mt-2 md:mt-0 shadow-[0_0_0_4px_white,0_0_0_8px_rgba(0,200,120,0.2)]" />

                {/* Content */}
                <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${
                  index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'
                }`}>
                  <div className="text-4xl md:text-6xl font-black text-gray-100 mb-2">
                    {milestone.year}
                  </div>
                  <h3 className="text-2xl font-bold text-navy uppercase tracking-tight mb-3">
                    {milestone.title}
                  </h3>
                  <p className="text-gray-500 font-medium leading-relaxed">
                    {milestone.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default CompanyTimeline;
