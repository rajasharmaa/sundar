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
          exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050505]/80 backdrop-blur-xl"
        >
          {/* Animated Background Glows */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                x: [0, 50, 0],
                y: [0, -30, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
                x: [0, -40, 0],
                y: [0, 60, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]"
            />
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.1, opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative text-center max-w-md w-full px-8 py-12 rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl overflow-hidden"
          >
            {/* Subtle light streak */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
            />

            <div className="relative mb-8">
              {/* Circular Progress SVG */}
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background Circle */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="4"
                  />
                  {/* Animated Progress Circle */}
                  <motion.circle
                    cx="64"
                    cy="64"
                    r={radius}
                    fill="transparent"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    strokeLinecap="round"
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
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20"
                  >
                    {progress < 100 ? (
                      <Loader2 className="w-8 h-8 text-white animate-spin-slow" />
                    ) : (
                      <ShieldCheck className="w-8 h-8 text-white" />
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent mb-3 tracking-tight">
                Damoder Traders
              </h2>
              <div className="flex items-center justify-center gap-2 mb-6">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-blue-400 font-semibold">
                  Secure Session
                </span>
              </div>
            </motion.div>

            <motion.p
              key={message}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white/60 text-sm mb-8 px-4 h-5"
            >
              {message}
            </motion.p>

            <div className="relative bg-white/5 rounded-full h-1.5 w-full max-w-[240px] mx-auto overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-indigo-500"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-white/30"
            >
              <span className="w-8 h-[1px] bg-white/10"></span>
              Encrypted Authentication
              <span className="w-8 h-[1px] bg-white/10"></span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}