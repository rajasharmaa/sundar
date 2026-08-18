import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, type Product } from '@/services/api/api-client';
import { useToast } from '@/hooks/use-toast';
import { getOptimizedUrl } from '@/lib/utils';

interface QuickPreviewModalProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Quick Preview Modal
 * Fast product preview without navigation
 */
export const QuickPreviewModal = ({ productId, isOpen, onClose }: QuickPreviewModalProps) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (productId && isOpen) {
      fetchProduct();
    }
  }, [productId, isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const fetchProduct = async () => {
    if (!productId) return;

    try {
      setIsLoading(true);
      const response = await api.products.getById(productId);
      
      let productData: any = response.data;
      if (productData?.data) productData = productData.data;
      if (productData?.product) productData = productData.product;
      
      setProduct((productData || response) as Product);
      setCurrentImageIndex(0);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load product details',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleInquiry = () => {
    toast({
      title: 'Inquiry Started',
      description: 'Redirecting to inquiry form...'
    });
    onClose();
    // Could redirect to contact page with product info
  };

  const images = product?.images?.length ? product.images : [product?.image].filter(Boolean);
  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  if (!isOpen) return null;

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
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden pointer-events-auto max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Quick Preview</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              {isLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
              ) : product ? (
                <div className="grid md:grid-cols-2 gap-6 p-6">
                  {/* Image Gallery */}
                  <div className="space-y-4">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
                      <img
                        src={getOptimizedUrl(images[currentImageIndex])}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />

                      {images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>

                          {/* Dots Indicator */}
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                                  }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-green-600 font-semibold mb-2">{product.category}</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600 line-clamp-3">{product.description}</p>
                    </div>

                    {/* Price */}
                    {(product as any).price && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-cyan-50 rounded-xl border border-green-200">
                        <div className="text-sm text-gray-600 mb-1">Price</div>
                        <div className="text-3xl font-bold text-green-600">
                          ₹{(product as any).price.toFixed(2)}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Link
                        to={`/products/${product.id}`}
                        className="flex-1 py-3 bg-gradient-to-r from-green-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-cyan-700 transition-all text-center"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={handleInquiry}
                        className="flex-1 py-3 bg-gradient-to-r -green- to-pink-600 text-white font-semibold rounded-xl hover:-green- hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Mail className="w-5 h-5" />
                        Inquiry
                      </button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex gap-3">

                      <a
                        href={`tel:${import.meta.env.VITE_SALES_PHONE || '+91 9876543210'}`}
                        className="flex-1 py-3 border-2 border-gray-300 hover:border-green-500 hover:text-green-600 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Phone className="w-5 h-5" />
                        Call
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Product not found
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickPreviewModal;
