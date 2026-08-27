import React from 'react';
import { Eye, Palette, Hexagon } from 'lucide-react';

interface PrintingInfo {
  types?: string[];
  colors?: string;
  inks?: string;
  description?: string;
}

interface Props {
  info?: PrintingInfo;
  themeColor?: string;
}

const PrintingDetailsSection: React.FC<Props> = ({ info, themeColor = '#07111F' }) => {
  if (!info || (!info.description && (!info.types || info.types.length === 0))) return null;

  return (
    <section className="py-24 lg:py-32 bg-gray-900 text-white relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ 
          background: `radial-gradient(circle at 70% 50%, ${themeColor}, transparent 50%)` 
        }} 
      />
      
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: themeColor }}>
              Customization
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-6">
              Advanced Printing <br/>Capabilities
            </h2>
            {info.description && (
              <p className="text-gray-400 text-lg font-medium leading-relaxed mb-10 max-w-lg">
                {info.description}
              </p>
            )}
            
            <div className="space-y-6">
              {info.types && info.types.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Hexagon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-1">Print Technology</h4>
                    <p className="font-bold text-lg">{info.types.join(' & ')}</p>
                  </div>
                </div>
              )}
              
              {info.colors && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-1">Color Options</h4>
                    <p className="font-bold text-lg">{info.colors}</p>
                  </div>
                </div>
              )}
              
              {info.inks && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-1">Ink Quality</h4>
                    <p className="font-bold text-lg">{info.inks}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="relative aspect-square lg:aspect-[4/3] rounded-[32px] bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shadow-2xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
            <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center relative z-10">
              <Palette className="w-20 h-20 text-white/20 mb-6" />
              <h3 className="text-3xl font-black tracking-tight mb-2">Precision Printing</h3>
              <p className="text-white/50 font-medium max-w-sm">
                High-definition graphics that make your brand stand out on retail shelves and industrial sites.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default PrintingDetailsSection;
