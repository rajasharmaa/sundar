import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { num: "01", title: "Material Selection", desc: "Selecting high-grade polymers and raw materials for maximum strength." },
  { num: "02", title: "Fabric / Film Production", desc: "Advanced extrusion and weaving for consistent material quality." },
  { num: "03", title: "Printing / Lamination", desc: "Precision multi-color printing and protective barrier lamination." },
  { num: "04", title: "Conversion", desc: "Automated cutting and stitching for precise dimensions and durability." },
  { num: "05", title: "Quality Inspection", desc: "Rigorous testing for strength, GSM, and print accuracy." },
  { num: "06", title: "Packaging & Dispatch", desc: "Secure baling and optimized logistics for on-time delivery." }
];

const ProductionProcess: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const container = containerRef.current;
      if (!container) return;

      const totalWidth = container.scrollWidth - window.innerWidth + 200;
      
      // Only apply horizontal scroll on desktop
      if (window.innerWidth >= 1024) {
        gsap.to(container, {
          x: -totalWidth,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            pin: true,
            scrub: 1,
            end: () => "+=" + container.offsetWidth,
            invalidateOnRefresh: true,
          }
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-white overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-6 mb-16 z-10">
        <span className="text-[#22c55e] font-semibold text-sm uppercase tracking-widest mb-4 block">
          Production Process
        </span>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#0B2023] leading-tight">
          From Material To <br /> Finished Product
        </h2>
      </div>

      <div className="overflow-x-auto lg:overflow-visible">
        <div ref={containerRef} className="flex flex-col lg:flex-row gap-12 lg:gap-0 px-6 lg:px-[10vw] w-max lg:w-max">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col lg:w-[400px] lg:flex-shrink-0 lg:pr-24 relative group">
              <div className="text-7xl lg:text-9xl font-serif font-bold text-gray-100 group-hover:text-[#22c55e]/20 transition-colors duration-500 mb-4">
                {step.num}
              </div>

              <div className="hidden lg:block w-full h-px bg-gray-200 mb-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#22c55e] scale-0 group-hover:scale-100 transition-transform duration-300" />
                <div className="h-full bg-[#22c55e] w-0 group-hover:w-full transition-all duration-700 ease-out" />
              </div>

              <h3 className="text-2xl font-bold text-[#0B2023] tracking-tight mb-4 group-hover:text-[#22c55e] transition-colors">
                {step.title}
              </h3>
              <p className="text-gray-500 font-medium">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductionProcess;
