import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { Shield, Zap, Target, Leaf, CheckCircle2, Factory, Truck, Box } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEO from '../components/SEO/MetaTags';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { MachineAnimation } from '../components/animations/MachineAnimation';

// Helper component for fading steps based on scroll progress
const StepItem = ({ step, index, total, globalProgress }: { step: any, index: number, total: number, globalProgress: MotionValue<number> }) => {
  const start = index / total;
  const peak = start + (1 / total) / 2;
  const end = (index + 1) / total;
  
  const opacity = useTransform(globalProgress, (p) => {
    if (p < start - 0.1) return 0;
    if (p < start) return (p - (start - 0.1)) / 0.1;
    if (p <= end) return 1;
    if (p < end + 0.1) return 1 - (p - end) / 0.1;
    return 0;
  });
  
  const y = useTransform(globalProgress, (p) => {
    if (p < start - 0.1) return 30;
    if (p < start) return 30 - 30 * ((p - (start - 0.1)) / 0.1);
    if (p <= end) return 0;
    if (p < end + 0.1) return -30 * ((p - end) / 0.1);
    return -30;
  });

  return (
    <motion.div 
      style={{ opacity, y, pointerEvents: 'none' }} 
      className="absolute inset-0 flex items-center justify-start pointer-events-auto"
    >
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-navy/5 max-w-sm">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 text-amber-500">
          <step.icon className="w-8 h-8" />
        </div>
        <div className="text-amber-500 font-black text-sm tracking-[0.2em] mb-2 uppercase">Step 0{index + 1}</div>
        <h3 className="text-xl font-bold text-navy mb-3 uppercase tracking-wider">{step.title}</h3>
        <p className="text-navy/70 font-medium">{step.desc}</p>
      </div>
    </motion.div>
  );
};

const Manufacturing = () => {
  const { settings } = useSiteSettings();
  const processRef = useRef<HTMLDivElement>(null);
  
  // Setup scroll tracking for the process section
  const { scrollYProgress } = useScroll({
    target: processRef,
    offset: ["start start", "end end"]
  });

  const steps = [
    {
      title: "Extrusion",
      desc: "High-grade PP/HDPE granules are melted and extruded into fine, strong tapes.",
      icon: Factory
    },
    {
      title: "Weaving",
      desc: "Circular looms weave the tapes into durable fabric rolls with consistent mesh.",
      icon: Box
    },
    {
      title: "Lamination",
      desc: "Optional BOPP lamination is applied for enhanced strength and premium printability.",
      icon: Shield
    },
    {
      title: "Printing & Finishing",
      desc: "Up to 8-color flexo/rotogravure printing, followed by precise cutting and stitching.",
      icon: Target
    }
  ];

  const stats = [
    { value: "500+", label: "Metric Tons Monthly", icon: Factory },
    { value: "50+", label: "Circular Looms", icon: Zap },
    { value: "100%", label: "Virgin Material", icon: Leaf },
    { value: "24/7", label: "Operations", icon: Truck }
  ];

  return (
    <>
      <SEO 
        title="Custom Manufacturing | Sundar Corporation" 
        description="Explore our state-of-the-art manufacturing facility. Premium custom printed BOPP bags and PP woven sacks."
      />
      <Navbar />

      <main className="pt-20 bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] min-h-[500px] bg-navy overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src={settings?.manufacturingImage || "/manufacturing.jpg"}
              alt="Manufacturing Facility" 
              className="w-full h-full object-cover opacity-30 mix-blend-luminosity grayscale"
            />
            {/* Architectural Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/70 to-navy" />
          </div>

          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="px-4 py-2 rounded bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-[0.2em] mb-6 inline-block border border-amber-500/20">
                State-of-the-art Facility
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 uppercase tracking-tight font-display leading-tight">
                Our Manufacturing <br/><span className="text-amber-500">Excellence</span>
              </h1>
              <p className="text-xl text-white/70 max-w-2xl mx-auto font-medium">Precision engineering and strict quality control at every step of the custom packaging production process.</p>
            </motion.div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="py-12 bg-white border-b border-navy/5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] relative z-20 -mt-12 mx-4 lg:mx-auto max-w-6xl rounded border-t border-amber-500">
          <div className="px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-navy/10">
              {stats.map((stat, i) => (
                <div key={i} className="text-center md:px-4">
                  <stat.icon className="w-8 h-8 text-amber-500 mx-auto mb-4" />
                  <div className="text-3xl font-black text-navy mb-1">{stat.value}</div>
                  <div className="text-xs font-bold text-navy/50 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INTERACTIVE SCROLL ANIMATION SECTION */}
        <section ref={processRef} className="h-[400vh] relative bg-[#F8FAFC]">
          <div className="sticky top-20 h-[calc(100vh-5rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col overflow-hidden">
            <div className="text-center py-12 shrink-0">
              <h2 className="text-3xl md:text-5xl font-black text-navy mb-4 uppercase tracking-tight font-display">The Production Process</h2>
              <div className="w-24 h-1 bg-amber-500 mx-auto"></div>
              <p className="text-navy/60 font-medium mt-6 uppercase tracking-wider text-sm">Scroll to see how our premium bags are made.</p>
            </div>
            
            <div className="flex-1 flex flex-col lg:flex-row relative">
              {/* Left Side: Sticky Text Steps */}
              <div className="w-full lg:w-1/3 relative h-[35vh] lg:h-full flex items-center shrink-0 z-10 pointer-events-none">
                {steps.map((step, i) => (
                  <StepItem 
                    key={i} 
                    step={step} 
                    index={i} 
                    total={steps.length} 
                    globalProgress={scrollYProgress} 
                  />
                ))}
              </div>
              
              {/* Right Side: The Machine SVG Animation */}
              <div className="w-full lg:w-2/3 h-[50vh] lg:h-full flex items-center justify-center">
                <MachineAnimation progress={scrollYProgress} />
              </div>
            </div>
          </div>
        </section>

        {/* Quality Assurance */}
        <section className="py-24 bg-white border-t border-navy/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 relative group">
                <div className="absolute inset-0 bg-amber-500 translate-x-4 translate-y-4 rounded-sm transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
                <img src={settings?.manufacturingImage || "/manufacturing.jpg"} alt="Quality Control" className="relative rounded-sm shadow-xl w-full h-[400px] object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
              </div>
              <div className="lg:w-1/2">
                <h2 className="text-3xl md:text-4xl font-black text-navy mb-6 uppercase tracking-tight font-display">Strict Quality Assurance</h2>
                <div className="w-16 h-1 bg-amber-500 mb-8"></div>
                <p className="text-lg text-navy/70 mb-10 font-medium leading-relaxed">We maintain rigorous testing protocols at every stage of production to ensure superior strength, GSM consistency, and print quality.</p>
                
                <div className="space-y-4">
                  {[
                    "Tensile Strength & Elongation Testing",
                    "UV Resistance Verification",
                    "GSM & Dimensional Accuracy Checks",
                    "Drop Test & Load Capacity Validation"
                  ].map((check, i) => (
                    <div key={i} className="flex items-center gap-4 bg-navy/5 p-4 rounded border border-navy/5 hover:border-amber-500/50 transition-colors">
                      <CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0" />
                      <span className="text-navy font-bold">{check}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Machinery Gallery */}
        <section className="py-24 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-navy mb-4 uppercase tracking-tight font-display">Our Infrastructure</h2>
              <div className="w-24 h-1 bg-amber-500 mx-auto"></div>
              <p className="text-navy/60 font-medium mt-6 uppercase tracking-wider text-sm">A glimpse into our advanced manufacturing capabilities</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px] md:auto-rows-[300px]">
              
              {/* Vertical Image (Left) */}
              <div className="md:col-span-1 md:row-span-2 rounded-2xl overflow-hidden group shadow-lg relative">
                <div className="absolute inset-0 bg-navy/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img src="/machine/machine5.jpeg" alt="Facility Overview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>

              {/* Wide Horizontal Image (Top Right) */}
              <div className="md:col-span-3 rounded-2xl overflow-hidden group shadow-lg relative">
                <div className="absolute inset-0 bg-navy/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img src="/machine/machine 1.jpeg" alt="Manufacturing Infrastructure" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              
              {/* Bottom Right 1 */}
              <div className="md:col-span-1 rounded-2xl overflow-hidden group shadow-lg relative">
                <div className="absolute inset-0 bg-navy/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img src="/machine/machine4.jpeg" alt="Advanced Machinery" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              
              {/* Bottom Right 2 */}
              <div className="md:col-span-1 rounded-2xl overflow-hidden group shadow-lg relative">
                <div className="absolute inset-0 bg-navy/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img src="/machine/machin2.jpeg" alt="Production Line" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>

              {/* Bottom Right 3 */}
              <div className="md:col-span-1 rounded-2xl overflow-hidden group shadow-lg relative">
                <div className="absolute inset-0 bg-navy/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img src="/machine/machine3.jpeg" alt="Quality Control" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Manufacturing;
