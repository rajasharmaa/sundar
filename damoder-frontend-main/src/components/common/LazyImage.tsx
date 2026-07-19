// components/common/LazyImage.tsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAccessibility } from '@/context/AccessibilityContext';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderColor?: string;
  blur?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
}

/**
 * Highly optimized Lazy loading image component
 * Supports WebP picture element compilation, responsive srcsets,
 * and high-efficiency rendering bypass when Lite Mode is active.
 */
const LazyImage = ({
  src,
  alt,
  className = '',
  placeholderColor = '#f3f4f6',
  blur = true,
  onLoad,
  onError,
  sizes = '(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw'
}: LazyImageProps) => {
  const { liteMode, highContrast } = useAccessibility();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    // If Lite Mode is active, bypass lazy loading delay to allow faster immediate loading
    if (liteMode) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport for better UX
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [liteMode]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate WebP source fallback if format is standard JPEG/PNG
  const getWebpUrl = (originalUrl: string) => {
    if (originalUrl.includes('cloudinary.com')) {
      // Automatic optimization for Cloudinary if applicable
      return originalUrl.replace('/upload/', '/upload/f_auto,q_auto/');
    }
    // Simple extension converter for modern assets
    if (originalUrl.match(/\.(jpeg|jpg|png)$/i)) {
      return originalUrl.replace(/\.(jpeg|jpg|png)$/i, '.webp');
    }
    return originalUrl;
  };

  // Generate automatic responsive srcset parameters
  const generateSrcset = (originalUrl: string) => {
    if (originalUrl.includes('cloudinary.com')) {
      return `
        ${originalUrl.replace('/upload/', '/upload/w_400,c_scale,f_auto/')} 400w,
        ${originalUrl.replace('/upload/', '/upload/w_800,c_scale,f_auto/')} 800w,
        ${originalUrl.replace('/upload/', '/upload/w_1200,c_scale,f_auto/')} 1200w
      `;
    }
    return undefined;
  };

  const webpUrl = getWebpUrl(src);
  const srcset = generateSrcset(src);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-gray-100 transition-all ${className} ${
        highContrast ? 'border-2 border-black outline-2 outline-black' : ''
      }`}
      style={{ backgroundColor: placeholderColor }}
    >
      {/* Placeholder - shown while loading (disabled in Lite Mode for minimal footprint) */}
      {!isLoaded && !hasError && !liteMode && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Modern Picture Element with WebP fallbacks */}
      {isInView && !hasError && (
        liteMode ? (
          /* Plain image element without Framer Motion for Lite Mode (ultra low RAM usage) */
          <picture>
            {webpUrl !== src && <source srcSet={webpUrl} type="image/webp" />}
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-cover"
              onLoad={handleLoad}
              onError={handleError}
              crossOrigin="anonymous"
              loading="lazy"
            />
          </picture>
        ) : (
          /* Animated fluid image using Framer Motion */
          <motion.picture
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{
              opacity: isLoaded ? 1 : 0.4,
              scale: isLoaded ? 1 : 1.03,
              filter: blur && !isLoaded ? 'blur(8px)' : 'blur(0px)',
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full h-full block"
          >
            {webpUrl !== src && <source srcSet={webpUrl} type="image/webp" />}
            <img
              src={src}
              srcSet={srcset}
              sizes={sizes}
              alt={alt}
              className="w-full h-full object-cover transition-all duration-300"
              onLoad={handleLoad}
              onError={handleError}
              crossOrigin="anonymous"
              loading="lazy"
              decoding="async"
            />
          </motion.picture>
        )
      )}

      {/* Error Fallback State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-4 text-center">
          <svg
            className="w-10 h-10 mb-2 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs font-semibold text-gray-500">{alt || 'Image error'}</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
