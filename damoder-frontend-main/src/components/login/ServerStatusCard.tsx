import React from 'react';
import { motion } from 'framer-motion';
import { Server } from 'lucide-react';

interface ServerStatusCardProps {
  isChecking: boolean;
  isWarming: boolean;
  progress: number;
  message: string;
}

export const ServerStatusCard: React.FC<ServerStatusCardProps> = ({
  isChecking,
  isWarming,
  progress,
  message,
}) => {
  if (!isChecking && !isWarming) return null;

  const showChecking = isChecking;
  const showWarming = isWarming && !isChecking;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {showWarming ? (
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Server className="w-6 h-6 text-blue-600" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-800">
            {showWarming ? 'Server Initializing' : 'Connecting to Server'}
          </h3>
          <p className="text-sm text-blue-700 mt-1">{message}</p>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-2 overflow-hidden relative">
            {progress > 0 ? (
              <motion.div
                className="bg-blue-600 h-2 rounded-full absolute left-0 top-0"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <motion.div
                className="bg-blue-600 h-2 rounded-full absolute top-0"
                animate={{
                  left: ['-50%', '100%'],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: 'easeInOut',
                }}
                style={{ width: '50%' }}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ServerStatusCard;
