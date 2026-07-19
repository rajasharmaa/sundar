import React from 'react';

const IndustrialBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-white">
      {/* Premium subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-blue-50/40" />
      
      {/* Clean engineering-style grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, #2563eb 1px, transparent 1px),
            linear-gradient(to bottom, #2563eb 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Light decorative radial glow in top right */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full blur-[120px]" />
    </div>
  );
};

export default IndustrialBackground;
