import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  error: string | null;
  hasTip?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, hasTip = false }) => {
  if (!error) return null;

  return (
    <motion.div
      initial={{ x: -10 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 500 }}
      className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-red-800">Login Failed</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          {hasTip && (
            <p className="text-xs text-red-600 mt-2 italic">
              Tip: Check your email and password, or try again in a moment
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorMessage;
