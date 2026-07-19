import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ExternalLink } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';
import { Link } from 'react-router-dom';

interface CompareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTable: () => void;
}

/**
 * Compare Drawer
 * Shows selected products for comparison with quick actions
 */
export const CompareDrawer = ({ isOpen, onClose, onOpenTable }: CompareDrawerProps) => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  if (compareList.length === 0) return null;

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

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 border-t border-gray-200"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Compare Products</h3>
                  <p className="text-sm text-gray-500">{compareList.length} of 4 selected</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clearCompare}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-600"
                    title="Clear all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Product List */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {compareList.map((product) => (
                  <div
                    key={product.id}
                    className="relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200 group"
                  >
                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-500 hover:text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Image */}
                    <Link to={`/products/${product.id}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full aspect-square object-cover"
                      />
                    </Link>

                    {/* Info */}
                    <div className="p-3">
                      <Link to={`/products/${product.id}`}>
                        <h4 className="font-medium text-sm text-gray-900 line-clamp-2 hover:text-blue-600">
                          {product.name}
                        </h4>
                      </Link>
                      {product.price && (
                        <div className="text-lg font-bold text-blue-600 mt-1">
                          ₹{product.price.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add More Placeholder */}
                {Array.from({ length: 4 - compareList.length }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center aspect-square"
                  >
                    <span className="text-gray-400 text-sm">Add product</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={onOpenTable}
                disabled={compareList.length < 2}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-target"
              >
                <ExternalLink className="w-5 h-5" />
                Compare Now ({compareList.length})
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CompareDrawer;
