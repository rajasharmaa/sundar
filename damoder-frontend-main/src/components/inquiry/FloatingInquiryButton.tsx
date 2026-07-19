import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import QuickInquiryModal from './QuickInquiryModal';

export function FloatingInquiryButton() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const EXCLUDED_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/account', '/rfq', '/contact'];
  const isExcluded = EXCLUDED_PATHS.some(path => 
    location.pathname === path || location.pathname.startsWith(path + '/')
  );

  if (isExcluded) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-44 lg:bottom-28 right-6 z-40 p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 group hidden lg:flex"
          aria-label="Open inquiry form"
        >
          {/* Icon */}
          <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />

          {/* Tooltip */}
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden lg:block">
            Quick Inquiry
            <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-900 rotate-45"></span>
          </span>

          {/* Pulse Animation Ring */}
          <span className="absolute inset-0 rounded-full bg-blue-400 opacity-75 animate-ping"></span>
        </motion.button>
      </AnimatePresence>

      {/* Close Button (when modal is open) */}
      {isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed bottom-24 lg:bottom-6 right-28 z-40 p-3 bg-red-600 text-white rounded-full shadow-xl hover:bg-red-700 transition-all duration-300 lg:flex hidden items-center gap-2"
          aria-label="Close inquiry form"
        >
          <X className="w-5 h-5" />
          <span className="text-sm font-medium">Close</span>
        </motion.button>
      )}

      {/* Quick Inquiry Modal */}
      <QuickInquiryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

export default FloatingInquiryButton;
