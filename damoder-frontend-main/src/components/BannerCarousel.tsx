import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { BannerSettings } from '@/types';

// Helper to get theme colors
const getThemeColors = (color: string) => {
  switch(color) {
    case 'green': return { bg: 'from-[#0f2a15] via-[#15803d] to-[#0f2a15]', blob: 'bg-green-500/20', line: 'bg-green-400', grad1: ['#22c55e', '#166534'], grad2: ['#4ade80', '#15803d'], text: 'text-green-300' };
    case 'red': return { bg: 'from-[#2a0f0f] via-[#b91c1c] to-[#2a0f0f]', blob: 'bg-red-500/20', line: 'bg-red-400', grad1: ['#ef4444', '#991b1b'], grad2: ['#f87171', '#b91c1c'], text: 'text-red-300' };
    case 'dark': return { bg: 'from-[#0f172a] via-[#334155] to-[#0f172a]', blob: 'bg-slate-500/20', line: 'bg-slate-400', grad1: ['#64748b', '#334155'], grad2: ['#94a3b8', '#475569'], text: 'text-slate-300' };
    case 'blue':
    default: return { bg: 'from-[#0f172a] via-[#1e3a8a] to-[#0f172a]', blob: 'bg-blue-500/20', line: 'bg-blue-400', grad1: ['#3b82f6', '#1d4ed8'], grad2: ['#60a5fa', '#2563eb'], text: 'text-blue-300' };
  }
};

// Helper for alignment
const getAlignment = (align: string) => {
  switch(align) {
    case 'center': return 'text-center items-center mx-auto';
    case 'right': return 'text-right items-end ml-auto';
    case 'left':
    default: return 'text-left items-start';
  }
};

export default function BannerCarousel({ banners }: { banners: BannerSettings[] }) {
  const activeBanners = banners.filter(b => b.isActive && b.image);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const currentBanner = activeBanners[currentIndex];
  
  // Customization props
  const bannerType = currentBanner.bannerType || 'abstract_split';
  const theme = getThemeColors(currentBanner.themeColor || 'blue');
  const alignment = getAlignment(currentBanner.textAlign || 'left');

  return (
    <section className={`relative w-full overflow-hidden my-4 md:my-8 group ${bannerType === 'abstract_split' ? 'h-[480px] sm:h-[450px] lg:h-[500px] bg-gradient-to-br rounded-[1.5rem] md:rounded-[2rem] shadow-2xl ' + theme.bg : 'h-[450px] md:h-[500px] lg:h-[550px] rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] bg-slate-900'}`}>
      
      {/* ----------------- BACKGROUND (Depends on Type) ----------------- */}
      
      {bannerType === 'abstract_split' && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl ${theme.blob}`} />
          <svg className="absolute top-0 left-0 w-full h-full object-cover opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 C40,40 60,10 100,50 L100,0 Z" fill="url(#grad1)" />
            <path d="M0,100 C30,70 70,80 100,40 L100,100 Z" fill="url(#grad2)" />
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.grad1[0]} stopOpacity="0.5" />
                <stop offset="100%" stopColor={theme.grad1[1]} stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={theme.grad2[0]} stopOpacity="0.3" />
                <stop offset="100%" stopColor={theme.grad2[1]} stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
          <div className={`absolute top-[20%] left-[45%] text-xl font-light opacity-50 ${theme.text}`}>+</div>
          <div className={`absolute bottom-[25%] left-[30%] text-xl font-light opacity-50 ${theme.text}`}>+</div>
          <div className={`absolute top-[15%] right-[20%] text-2xl font-light opacity-50 ${theme.text}`}>+</div>
          <div className="absolute top-10 right-10 flex flex-col gap-1.5 opacity-30">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transform rotate-45 ${theme.line}`} />
            ))}
          </div>
        </div>
      )}

      {bannerType === 'full_image' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-transparent z-10" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTQgMzBoNnY2aC02di02em0wLThoNnY2aC02di02em0wLTE2aDZ2NmgtNnYtNnptMC04aDZ2NmgtNnYtNnptLTgtOGg2djZoLTZ2LTZ6bTAtOGg2djZoLTZ2LTZ6bS04IDBvNnY2aC02di02em0tOCAwaDZ2NmgtNnYtNnptLTggMGg2djZoLTZ2LTZ6bS04IDBoNnY2aC02di02eiIgZmlsbD0iIzRmNDY1YyIgZmlsbC1vcGFjaXR5PSIwLjA1IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] opacity-20 z-0" />
        </>
      )}

      {/* ----------------- CONTENT ANIMATION WRAPPER ----------------- */}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id || currentIndex}
          initial={{ opacity: 0, x: bannerType === 'abstract_split' ? 20 : 0, filter: bannerType === 'full_image' ? "blur(10px)" : "blur(0px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: bannerType === 'abstract_split' ? -20 : 0, filter: bannerType === 'full_image' ? "blur(10px)" : "blur(0px)" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`absolute inset-0 flex ${bannerType === 'abstract_split' ? 'flex-col md:flex-row' : 'items-center'} z-10`}
        >
          {/* Full Image Background Layer (Only for Full Image type) */}
          {bannerType === 'full_image' && (
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <motion.img 
                src={currentBanner.image} 
                alt={currentBanner.title} 
                className="w-full h-full object-cover"
                initial={{ scale: 1 }}
                animate={{ scale: 1.05 }}
                transition={{ duration: 8, ease: "linear" }}
              />
            </div>
          )}

          {/* ----------------- LEFT TEXT AREA ----------------- */}
          
          <div className={`${bannerType === 'abstract_split' ? 'w-full md:w-1/2 px-6 sm:px-8 md:px-16 lg:px-20 pt-10 md:pt-0 flex-1 md:h-full' : 'w-full px-6 sm:px-8 md:px-16 lg:px-20 h-full'} flex flex-col justify-center relative pointer-events-none`}>
            <div className={`max-w-xl flex flex-col ${alignment} pointer-events-auto`}>
              
              {/* Logo / Brand Accent (Only Abstract Split) */}
              {bannerType === 'abstract_split' && (
                <div className="flex items-center gap-2 mb-6 opacity-80">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${theme.line}`}>
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-white uppercase">Damodar Traders</span>
                </div>
              )}

              {/* Decorative Accent Line (Only Full Image) */}
              {bannerType === 'full_image' && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`absolute ${currentBanner.textAlign === 'center' ? 'hidden' : currentBanner.textAlign === 'right' ? '-right-6 md:-right-10' : '-left-6 md:-left-10'} top-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full`}
                />
              )}

              {currentBanner.subtitle && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={bannerType === 'abstract_split' 
                    ? `${theme.text} font-light italic tracking-widest text-sm md:text-base mb-2 flex items-center gap-4`
                    : "inline-flex items-center gap-2 px-5 py-2 bg-white/10 border border-white/20 backdrop-blur-md rounded-full mb-6 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  }
                >
                  {bannerType === 'full_image' && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                  <span className={bannerType === 'full_image' ? "text-white font-extrabold tracking-[0.2em] uppercase text-[10px] md:text-xs" : "text-xs md:text-sm"}>
                    {currentBanner.subtitle}
                  </span>
                </motion.div>
              )}

              {currentBanner.title && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={bannerType === 'abstract_split' ? "mb-8 flex flex-col" : "mb-8"}
                  style={{ alignItems: currentBanner.textAlign === 'center' ? 'center' : currentBanner.textAlign === 'right' ? 'flex-end' : 'flex-start' }}
                >
                  <h2 className={`${bannerType === 'abstract_split' ? 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl' : 'text-3xl sm:text-4xl md:text-6xl'} font-black text-white uppercase leading-[1.1] tracking-tight`}>
                    {currentBanner.title}
                  </h2>
                  
                  {/* Dashed Accent under title (Only Abstract Split) */}
                  {bannerType === 'abstract_split' && (
                    <div className="flex gap-1 mt-4 opacity-50">
                      <div className={`h-1 w-8 skew-x-[-45deg] ${theme.line}`} />
                      <div className={`h-1 w-4 skew-x-[-45deg] ${theme.line}`} />
                      <div className={`h-1 w-2 skew-x-[-45deg] ${theme.line}`} />
                      <div className={`h-1 w-2 skew-x-[-45deg] ${theme.line}`} />
                    </div>
                  )}
                </motion.div>
              )}

              {currentBanner.buttonText && currentBanner.buttonLink && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link 
                    to={currentBanner.buttonLink}
                    className={bannerType === 'abstract_split'
                      ? `inline-block px-8 py-2.5 rounded-full border text-white font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm text-sm border-white/50`
                      : `group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] hover:scale-105 active:scale-95 uppercase tracking-widest text-xs md:text-sm border border-white/10`
                    }
                  >
                    {bannerType === 'full_image' && <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black" />}
                    <span className="relative z-10">{currentBanner.buttonText}</span>
                    {bannerType === 'full_image' && <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />}
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Website URL at bottom (Only Abstract Split) */}
            {bannerType === 'abstract_split' && (
              <div className="absolute bottom-6 left-8 md:left-16 lg:left-20 text-xs text-white/50 font-light tracking-widest hidden md:block">
                www.damodartraders.com
              </div>
            )}
          </div>

          {/* ----------------- RIGHT IMAGE AREA (Only Abstract Split) ----------------- */}
          
          {bannerType === 'abstract_split' && (
            <div className="w-full md:w-1/2 h-[200px] sm:h-[220px] md:h-full relative flex items-center justify-center p-4 sm:p-8 md:p-12 pointer-events-none mb-4 md:mb-0">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full blur-2xl ${theme.blob}`} />
              </div>
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                className="relative w-full max-w-[400px] h-full flex items-center justify-center"
              >
                <motion.img 
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  src={currentBanner.image} 
                  alt={currentBanner.title} 
                  className="w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] rounded-2xl pointer-events-auto"
                />
                
                {/* Fake reflection shadow */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[60%] h-4 bg-black/40 blur-xl rounded-full" />
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ----------------- NAVIGATION CONTROLS ----------------- */}
      
      {activeBanners.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 ${bannerType === 'abstract_split' ? 'w-10 h-10 bg-white/5 hover:bg-white/10' : 'w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 shadow-xl hover:scale-110'} backdrop-blur-md rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-20`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={handleNext}
            className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 ${bannerType === 'abstract_split' ? 'w-10 h-10 bg-white/5 hover:bg-white/10' : 'w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 shadow-xl hover:scale-110'} backdrop-blur-md rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-20`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className={`absolute z-20 ${bannerType === 'abstract_split' ? 'bottom-4 right-8 md:right-16 flex gap-2' : 'bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10'}`}>
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${bannerType === 'abstract_split'
                  ? (idx === currentIndex ? `w-6 h-1.5 ${theme.line}` : 'bg-white/30 hover:bg-white/50 w-1.5 h-1.5')
                  : (idx === currentIndex ? 'bg-blue-400 w-8 h-2 shadow-[0_0_10px_rgba(96,165,250,0.8)]' : 'bg-white/40 hover:bg-white/70 w-2 h-2')
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
