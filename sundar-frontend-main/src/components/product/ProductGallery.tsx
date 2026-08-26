import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCw, Maximize2, ZoomOut, ZoomIn, Minimize2,
  ArrowLeft, ChevronRight, Tag
} from 'lucide-react';
import { getOptimizedUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const Product3DView = lazy(() => import('@/components/pages/Product3DView'));

interface ProductGalleryProps {
  product: {
    id: string;
    name: string;
    category: string;
    image?: string;
    images?: string[];
    discountPercentage?: number;
    external?: boolean;
  };
  language: 'en' | 'hi';
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ product, language }) => {
  const [isInteractiveView, setIsInteractiveView] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState('');
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Resolve all image URLs safely (handles Issue 9: Image Gallery Edge Case)
  const allImages = React.useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images.filter(Boolean);
    }
    if (product.image) {
      return [product.image];
    }
    return ['/placeholder.svg']; // Safe fallback placeholder
  }, [product.images, product.image]);

  const totalImages = allImages.length;
  const discount = product.discountPercentage || 0;

  // Optimizes rendering by avoiding duplicate getOptimizedUrl processing (Issue 4)
  // The images in transformed product are already optimized, so we retrieve directly
  const getCurrentImageUrl = useCallback(() => {
    return allImages[currentImageIndex] || '/placeholder.svg';
  }, [allImages, currentImageIndex]);

  // Image gallery swipe handlers
  const handleImageSwipe = useCallback((direction: 'left' | 'right') => {
    if (totalImages <= 1) return;
    setCurrentImageIndex(prev => {
      if (direction === 'left') {
        return prev < totalImages - 1 ? prev + 1 : prev;
      } else {
        return prev > 0 ? prev - 1 : prev;
      }
    });
  }, [totalImages]);

  // Fullscreen image viewer with scroll lock cleanup (Issue 7)
  const openFullscreen = useCallback((imageUrl: string) => {
    setFullscreenImage(imageUrl);
    setShowFullscreen(true);
  }, []);

  const closeFullscreen = useCallback(() => {
    setShowFullscreen(false);
    setFullscreenImage('');
  }, []);

  // Sync scroll lock with fullscreen state
  useEffect(() => {
    if (showFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showFullscreen]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  // Keyboard shortcuts for fullscreen and zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showFullscreen) return;

      if (e.key === 'Escape') {
        closeFullscreen();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFullscreen, closeFullscreen, handleZoomIn, handleZoomOut, handleResetZoom]);

  // Drag listeners for interactive view
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const toggleInteractiveView = useCallback(() => {
    setIsInteractiveView(prev => !prev);
    if (!isInteractiveView) {
      setRotation({ x: 0, y: 0 });
      setZoom(1);
    }
  }, [isInteractiveView]);

  return (
    <div className="w-full relative bg-white rounded-3xl shadow-2xl border border-slate-200/70 overflow-hidden transition-all duration-500 hover:shadow-cyan-200/30">
      {/* Discount Sticker */}
      {discount > 0 && (
        <div className="absolute top-4 left-4 z-20">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 rounded-2xl blur-md opacity-60"></div>
            <div className="relative bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-2xl flex items-center gap-1.5 font-black text-sm tracking-wide shadow-md">
              <Tag className="w-4 h-4" />
              {discount}% {language === 'hi' ? 'छूट डील' : 'OFF DEAL'}
            </div>
          </div>
        </div>
      )}

      {/* External API indicator */}
      {product.external && (
        <div className="absolute top-4 left-36 z-20">
          <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold">
            {language === 'hi' ? 'लाइव कैटलॉग' : 'Live Catalog'}
          </Badge>
        </div>
      )}

      {/* Interactive View Toggle Options */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => openFullscreen(getCurrentImageUrl())}
          className="p-2 bg-white/95 text-slate-800 hover:bg-white rounded-xl transition-all shadow-md hover:shadow-lg border border-slate-200 min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0 animate-fade-in"
          aria-label="Fullscreen view"
          title="Fullscreen View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={toggleInteractiveView}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md ${isInteractiveView
              ? 'bg-gradient-to-r from-green-600 to-cyan-600 text-white'
              : 'bg-white/95 text-slate-800 hover:bg-white border border-slate-200'
            }`}
        >
          <RotateCw className="w-4 h-4" />
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">
            {isInteractiveView ? (language === 'hi' ? 'चित्र' : 'Image') : (language === 'hi' ? '3डी' : '3D')}
          </span>
        </button>
      </div>

      {/* Showcase Area */}
      {isInteractiveView ? (
        <div className="relative h-72 sm:h-96 lg:h-[28rem] w-full bg-slate-900">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <RotateCw className="w-8 h-8 text-green-500 animate-spin" />
            </div>
          }>
            <Product3DView productName={product.name} category={product.category} />
          </Suspense>
        </div>
      ) : (
        <div className="relative h-72 sm:h-96 lg:h-[28rem] flex items-center justify-center p-6 bg-gradient-to-b from-slate-50/50 to-white overflow-hidden group">
          {/* Grid lines background */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-60"></div>

          {/* Swipeable & Zoomable Image */}
          <motion.div
            className="w-full h-full flex items-center justify-center relative z-10"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={(e, info) => {
              const threshold = 50;
              if (info.offset.x > threshold) {
                handleImageSwipe('right');
              } else if (info.offset.x < -threshold) {
                handleImageSwipe('left');
              }
            }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={getCurrentImageUrl()}
              alt={product.name}
              className="max-w-[90%] max-h-[90%] object-contain transition-transform duration-500 hover:scale-105 cursor-zoom-in touch-pan-y filter drop-shadow-xl"
              style={{ transform: `scale(${zoom})` }}
              loading="lazy"
              onClick={() => openFullscreen(getCurrentImageUrl())}
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </motion.div>

          {/* Image Index Indicator */}
          {totalImages > 1 && (
            <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-extrabold tracking-wider z-10 border border-slate-800">
              {currentImageIndex + 1} / {totalImages}
            </div>
          )}

          {/* Navigation Arrows */}
          {totalImages > 1 && (
            <>
              {currentImageIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageSwipe('right');
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 text-slate-800 hover:bg-white rounded-full shadow-xl transition-all opacity-0 group-hover:opacity-100 border border-slate-200"
                  aria-label="Prev image"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              {currentImageIndex < totalImages - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageSwipe('left');
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 text-slate-800 hover:bg-white rounded-full shadow-xl transition-all opacity-0 group-hover:opacity-100 border border-slate-200"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </>
          )}

          {/* Zoom Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-xl border border-slate-200/60 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              disabled={zoom <= 1}
              className="p-1.5 hover:bg-slate-100 rounded-lg disabled:opacity-30 text-slate-600"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 min-w-[2.5rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              disabled={zoom >= 3}
              className="p-1.5 hover:bg-slate-100 rounded-lg disabled:opacity-30 text-slate-600"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {zoom > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetZoom();
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                title="Reset Zoom"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Thumbnails list (optimised) */}
      <div className="flex gap-3 p-4 bg-slate-50 border-t border-slate-200/70 overflow-x-auto scrollbar-hide">
        {/* 3D tiles */}
        <button
          onClick={toggleInteractiveView}
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex-shrink-0 flex items-center justify-center transition-all bg-white shadow-sm ${isInteractiveView
              ? 'border-green-500 bg-green-50/50 scale-105 ring-2 ring-green-500/20'
              : 'border-slate-200 hover:border-green-400'
            }`}
        >
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center ${isInteractiveView ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <RotateCw className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </button>

        {/* Regular slides */}
        {allImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentImageIndex(idx);
              setIsInteractiveView(false);
            }}
            className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-2xl border-2 overflow-hidden transition-all bg-white shadow-sm ${idx === currentImageIndex && !isInteractiveView
                ? 'border-green-600 scale-105 ring-2 ring-green-600/20'
                : 'border-slate-200 hover:border-green-400'
              }`}
          >
            <img
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Fullscreen Overlay Portal (renders inside visual context) */}
      <AnimatePresence>
        {showFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
            onClick={closeFullscreen}
          >
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl z-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
                disabled={zoom <= 1}
                className="p-2.5 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed touch-target text-white"
                aria-label="Zoom out"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold text-white min-w-[3.5rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
                disabled={zoom >= 3}
                className="p-2.5 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed touch-target text-white"
                aria-label="Zoom in"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              {zoom > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetZoom();
                  }}
                  className="p-2.5 hover:bg-white/20 rounded-lg transition-colors touch-target text-white"
                  aria-label="Reset zoom"
                  title="Reset Zoom (0)"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              )}
              <div className="w-px h-6 bg-white/20 mx-2"></div>
              <button
                onClick={closeFullscreen}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors font-medium text-sm"
              >
                {language === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            </div>

            <div
              className="max-w-[90vw] max-h-[90vh] p-8 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={fullscreenImage}
                alt="Product fullscreen view"
                className="max-w-full max-h-[85vh] object-contain cursor-grab active:cursor-grabbing transition-transform duration-300"
                style={{ transform: `scale(${zoom})` }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-white/60 text-sm">
              {language === 'hi' ? 'बंद करने के लिए ESC दबाएं • ज़ूम करने के लिए +/- का उपयोग करें' : 'Press ESC to close • Use +/- to zoom'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

