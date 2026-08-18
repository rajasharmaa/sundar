import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sliders, Check } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface MultiSelectFilterProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Multi-Select Filter Component
 * Allows selecting multiple filter values with mobile-friendly bottom sheet
 */
export const MultiSelectFilter = ({
  title,
  options,
  selectedValues,
  onChange,
  isOpen,
  onClose
}: MultiSelectFilterProps) => {
  const [localSelected, setLocalSelected] = useState<string[]>(selectedValues);

  useEffect(() => {
    setLocalSelected(selectedValues);
  }, [selectedValues]);

  const handleToggle = (value: string) => {
    setLocalSelected(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const handleApply = () => {
    onChange(localSelected);
    onClose();
  };

  const handleClear = () => {
    setLocalSelected([]);
    onChange([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl z-50 max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Options List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleToggle(option.value)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all touch-target"
                  style={localSelected.includes(option.value)
                    ? { borderColor: '#3b82f6', backgroundColor: '#eff6ff' }
                    : { borderColor: '#e5e7eb', backgroundColor: 'white' }
                  }
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                        localSelected.includes(option.value)
                          ? 'bg-green-600 border-green-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {localSelected.includes(option.value) && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </div>
                  {option.count !== undefined && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {option.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={handleClear}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex-1 touch-target"
              >
                Clear All
              </button>
              <button
                onClick={handleApply}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-cyan-700 transition-all flex-1 touch-target"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MultiSelectFilter;
