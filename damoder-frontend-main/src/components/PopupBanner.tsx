import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function PopupBanner() {
  const { settings } = useSiteSettings();
  const [isOpen, setIsOpen] = useState(false);

  const popupBanners = settings?.banners?.filter(b => b.isActive && b.image && b.placement === 'popup') || [];
  const activePopup = popupBanners.length > 0 ? popupBanners[0] : null;

  useEffect(() => {
    // Only show if there's an active popup banner
    if (!activePopup) return;

    // Check if the user has already seen the popup in this session
    const hasSeenPopup = sessionStorage.getItem(`seen_popup_${activePopup.id}`);
    
    if (!hasSeenPopup) {
      // Delay the popup slightly so it doesn't jarringly appear instantly
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000); // 3 seconds delay
      return () => clearTimeout(timer);
    }
  }, [activePopup]);

  const handleClose = () => {
    setIsOpen(false);
    if (activePopup) {
      sessionStorage.setItem(`seen_popup_${activePopup.id}`, 'true');
    }
  };

  if (!activePopup) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20, rotateX: 10 }}
            transition={{ type: "spring", damping: 20, stiffness: 300, duration: 0.6 }}
            className="relative w-full max-w-3xl bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col md:flex-row z-10 border border-white/10"
            style={{ perspective: "1000px" }}
          >
            {/* Elegant Glow Effect Behind Modal */}
            <div className="absolute -inset-[100%] bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-600/30 blur-3xl opacity-50 pointer-events-none" />

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 min-w-[44px] min-h-[44px] bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-xl border border-white/10 hover:scale-110 shadow-xl"
            >
              <X className="w-5 h-5 text-white/80 hover:text-white" />
            </button>

            {/* Image Section - Stylized */}
            <div className="w-full md:w-1/2 h-56 md:h-auto relative overflow-hidden">
              <motion.img
                src={activePopup.image}
                alt={activePopup.title}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="w-full h-full object-cover"
              />
              {/* Premium Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/10 via-transparent to-slate-900 md:block hidden" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent md:hidden" />
              
              {/* Promotional Floating Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: -10 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                className="absolute top-6 left-6 bg-gradient-to-r from-yellow-400 to-amber-600 text-slate-900 font-black px-4 py-2 rounded-xl shadow-2xl uppercase tracking-widest text-[10px] transform -rotate-12 border border-yellow-300/50"
              >
                Special Offer
              </motion.div>
            </div>

            {/* Text Section */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-slate-900 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 md:hidden" />
              
              {activePopup.subtitle && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-cyan-400 font-bold tracking-[0.2em] uppercase mb-3 text-[10px]"
                >
                  {activePopup.subtitle}
                </motion.p>
              )}
              
              {activePopup.title && (
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl md:text-4xl font-black text-white mb-6 leading-[1.1] uppercase tracking-tight"
                >
                  {activePopup.title}
                </motion.h2>
              )}

              {activePopup.buttonText && activePopup.buttonLink && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-2"
                >
                  <Link
                    to={activePopup.buttonLink}
                    onClick={handleClose}
                    className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.7)] hover:-translate-y-1 uppercase tracking-widest text-xs w-full md:w-auto overflow-hidden border border-white/10"
                  >
                    <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />
                    <span className="relative z-10">{activePopup.buttonText}</span>
                    <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                </motion.div>
              )}
              
              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={handleClose}
                className="mt-6 py-2 px-4 min-h-[44px] items-center justify-center text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest text-center md:text-left relative inline-flex w-fit mx-auto md:mx-0 group"
              >
                No Thanks, Continue Exploring
                <span className="absolute bottom-2 left-4 right-4 h-px bg-slate-500 group-hover:bg-white transition-all duration-300" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
