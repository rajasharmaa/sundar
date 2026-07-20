import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Loader2 } from 'lucide-react';

interface AuthLoadingOverlayProps {
  show: boolean;
  message: string;
  progress: number;
}

export function AuthLoadingOverlay({ show, message, progress }: AuthLoadingOverlayProps) {
  // Use a proper circular progress SVG calculation
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050505]/95 md:bg-[#050505]/80 md:backdrop-blur-md"
        >
          {/* Animated Background Glows - Only visible on desktop to prevent mobile lag */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.4, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[100px]"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[100px]"
            />
          </div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.05, opacity: 0, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative text-center max-w-sm md:max-w-md w-[90%] md:w-full px-6 py-10 md:px-8 md:py-12 rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl overflow-hidden"
          >
            {/* Subtle light streak - Desktop only */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none hidden md:block"
            />

            <div className="relative mb-6 md:mb-8">
              {/* Circular Progress SVG */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background Circle */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="4"
                    className="origin-center translate-x-[4px] translate-y-[4px] md:translate-x-[19px] md:translate-y-[19px] scale-[0.75] md:scale-100"
                  />
                  {/* Animated Progress Circle */}
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    fill="transparent"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    className="origin-center translate-x-[4px] translate-y-[4px] md:translate-x-[19px] md:translate-y-[19px] scale-[0.75] md:scale-100"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#818CF8" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    {progress < 100 ? (
                      <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-white animate-spin" />
                    ) : (
                      <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent mb-2 md:mb-3 tracking-tight">
                Damodar Traders
              </h2>
              <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
                <Lock className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-400" />
                <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-blue-400 font-semibold">
                  Logging In...
                </span>
              </div>
            </motion.div>

            <p className="text-white/80 text-sm mb-6 md:mb-8 px-2 md:px-4 min-h-[20px]">
              {message || "Please wait while we connect securely..."}
            </p>

            <div className="relative bg-white/5 rounded-full h-1.5 w-full max-w-[200px] md:max-w-[240px] mx-auto overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-indigo-500"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>

            <div className="mt-6 md:mt-8 flex items-center justify-center gap-2 text-[9px] md:text-[10px] uppercase tracking-widest text-white/30">
              <span className="w-6 md:w-8 h-[1px] bg-white/10"></span>
              Securing Connection
              <span className="w-6 md:w-8 h-[1px] bg-white/10"></span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}