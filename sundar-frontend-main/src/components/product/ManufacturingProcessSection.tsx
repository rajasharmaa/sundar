import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Settings, Layers, Target, Shield, Box, Factory } from 'lucide-react';

interface ProcessStep {
  title: string;
  description: string;
  icon?: string;
}

interface Props {
  steps?: ProcessStep[];
  themeColor?: string;
}

const getIcon = (name?: string) => {
  const icons: Record<string, any> = {
    Zap, Settings, Layers, Target, Shield, Box, Factory
  };
  const Icon = name && icons[name] ? icons[name] : Settings;
  return <Icon className="w-8 h-8" />;
};

const ManufacturingProcessSection: React.FC<Props> = ({ steps = [], themeColor = '#07111F' }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gray-50 -skew-x-12 transform translate-x-1/2 opacity-50" />
      
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="mb-16 lg:mb-24 flex flex-col items-center text-center">
          <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-gray-500">
            Process
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            How It's <span style={{ color: themeColor }}>Made</span>
          </h2>
          <p className="mt-6 text-gray-500 max-w-2xl text-lg font-medium">
            A precise, multi-stage manufacturing process ensuring consistent quality and structural integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="relative group"
            >
              {/* Connector Line (Desktop only) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-[2px] bg-gray-100 z-0">
                  <motion.div 
                    className="h-full origin-left"
                    style={{ backgroundColor: themeColor }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 + (idx * 0.2) }}
                  />
                </div>
              )}

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white border-2 border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500" style={{ color: themeColor }}>
                  {getIcon(step.icon)}
                </div>
                
                <div className="text-sm font-black text-gray-300 tracking-[0.2em] uppercase mb-4">
                  Step 0{idx + 1}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">
                  {step.title}
                </h3>
                
                <p className="text-gray-500 font-medium leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ManufacturingProcessSection;
