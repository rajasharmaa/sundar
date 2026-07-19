import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Check, X as XIcon } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';
import { getOptimizedUrl } from '@/lib/utils';

interface CompareTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Comparison Table Modal
 * Side-by-side product comparison table
 */
export const CompareTableModal = ({ isOpen, onClose }: CompareTableModalProps) => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  if (!isOpen) return null;

  // Define attributes to compare
  const attributes: Array<{ key: string; label: string; format?: (v: any) => string }> = [
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price', format: (v: any) => typeof v === 'number' ? `₹${v.toFixed(2)}` : 'N/A' },
    { key: 'rating', label: 'Rating', format: (v: any) => v ? `⭐ ${Number(v).toFixed(1)}` : 'Not rated' },
    { key: 'description', label: 'Description' },
    { key: 'material', label: 'Material' },
    { key: 'sizeOptions', label: 'Available Sizes', format: (v: any) => Array.isArray(v) ? v.join(', ') : 'N/A' },
    { key: 'packagingDetails', label: 'Packaging', format: (v: any) => v || 'Standard' },
    { key: 'deliveryTime', label: 'Delivery Time', format: (v: any) => v || '7-10 days' },
    { key: 'minimumOrder', label: 'Min Order', format: (v: any) => v || '1 piece' }
  ];

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Product Comparison</h2>
                <div className="flex gap-2">
                  <button
                    onClick={clearCompare}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Table Container */}
              <div className="flex-1 overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-900 min-w-[200px]">
                        Attribute
                      </th>
                      {compareList.map((product) => (
                        <th key={product.id} className="p-4 min-w-[250px]">
                          <div className="relative group">
                            <button
                              onClick={() => removeFromCompare(product.id)}
                              className="absolute top-2 right-2 p-1.5 bg-red-50 hover:bg-red-500 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <img
                              src={getOptimizedUrl(product.image)}
                              alt={product.name}
                              className="w-full aspect-square object-cover rounded-xl mb-3 border border-gray-200"
                            />
                            <h3 className="font-bold text-gray-900">{product.name}</h3>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {attributes.map((attr, idx) => (
                      <tr
                        key={attr.key}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        <td className="p-4 font-semibold text-gray-900 border-t border-gray-200">
                          {attr.label}
                        </td>
                        {compareList.map((product) => (
                          <td
                            key={product.id}
                            className="p-4 text-gray-700 border-t border-gray-200"
                          >
                            {attr.format
                              ? attr.format(product[attr.key])
                              : product[attr.key] || 'N/A'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CompareTableModal;
