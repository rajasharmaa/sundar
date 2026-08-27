import React from 'react';

interface CompositionItem {
  label: string;
  value: string;
}

interface Props {
  items?: CompositionItem[];
  themeColor?: string;
}

const MaterialCompositionTable: React.FC<Props> = ({ items = [], themeColor = '#07111F' }) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 bg-[#F5F7F6]">
      <div className="max-w-[1000px] mx-auto px-6 lg:px-12">
        <div className="bg-white rounded-[32px] p-8 md:p-16 shadow-[0_20px_60px_rgb(0,0,0,0.05)] border border-gray-100">
          
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="w-full md:w-1/3 shrink-0">
              <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-gray-500">
                Specifications
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-6">
                Material <br/><span style={{ color: themeColor }}>Composition</span>
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                Engineered with high-grade materials for optimal performance, durability, and compliance with industry standards.
              </p>
            </div>

            <div className="w-full md:w-2/3">
              <div className="flex flex-col">
                {items.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex flex-col sm:flex-row sm:items-center py-5 border-b border-gray-100 last:border-0 group hover:bg-gray-50 transition-colors rounded-lg px-4 -mx-4"
                  >
                    <span className="w-full sm:w-2/5 text-sm font-bold text-gray-500 uppercase tracking-widest mb-1 sm:mb-0">
                      {item.label}
                    </span>
                    <span className="w-full sm:w-3/5 text-lg font-bold text-gray-900 group-hover:text-black transition-colors">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default MaterialCompositionTable;
