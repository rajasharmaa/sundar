import React from 'react';
import { Globe, MapPin } from 'lucide-react';

const GlobalPresenceSection: React.FC = () => {
  return (
    <section className="py-24 bg-offwhite overflow-hidden relative border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-16">
        <div className="max-w-xl z-10">
          <div className="flex items-center gap-3 text-emerald-500 font-bold text-xs uppercase tracking-[0.2em] mb-4">
            <Globe className="w-4 h-4" /> Global Reach
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-navy uppercase tracking-tight mb-6">
            REACHING BUSINESSES <br/>BEYOND BORDERS.
          </h2>
          <p className="text-gray-500 font-medium leading-relaxed mb-8">
            With a robust manufacturing infrastructure and a dedicated logistics network, Sundar Corporation delivers premium packaging solutions to industrial hubs across India and international markets, ensuring timely supply for uninterrupted operations.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
              <MapPin className="w-4 h-4 text-emerald-500" /> <span className="font-bold text-navy text-sm">Pan-India Supply</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
              <Globe className="w-4 h-4 text-emerald-500" /> <span className="font-bold text-navy text-sm">Export Quality</span>
            </div>
          </div>
        </div>
        
        {/* Abstract Network Illustration */}
        <div className="relative w-full lg:w-1/2 h-[400px] flex items-center justify-center">
           {/* Abstract circular network nodes representing locations */}
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,200,120,0.05)_0%,transparent_70%)]" />
           <div className="relative w-full h-full max-w-md">
              {/* Central Hub */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-500 rounded-full shadow-[0_0_30px_rgba(0,200,120,0.5)] z-20" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-emerald-500/20 rounded-full animate-ping opacity-20" />
              
              {/* Connecting Lines and Nodes */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <path d="M50 50 L20 30 M50 50 L80 20 M50 50 L85 60 M50 50 L30 80 M50 50 L10 60" stroke="rgba(0,200,120,0.2)" strokeWidth="0.5" fill="none" />
                <circle cx="20" cy="30" r="1.5" fill="#07111F" />
                <circle cx="80" cy="20" r="2" fill="#07111F" />
                <circle cx="85" cy="60" r="1.5" fill="#07111F" />
                <circle cx="30" cy="80" r="2.5" fill="#07111F" />
                <circle cx="10" cy="60" r="1" fill="#07111F" />
              </svg>
           </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalPresenceSection;
