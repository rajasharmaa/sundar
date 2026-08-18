// src/components/PageTransition.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useReducedMotion } from '@/hooks/useAnimations';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const PageTransition = ({ children, className }: PageTransitionProps) => {
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate page loading for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className={className}>
      {/* Loading indicator */}
      {isLoading && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-green-600 z-50"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reducedMotion ? 0 : -20 }}
          transition={{ duration: reducedMotion ? 0 : 0.3, ease: "easeInOut" }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Pre-built transition wrappers
interface FadeTransitionProps {
  children: ReactNode;
  className?: string;
}

const FadeTransition = ({ children, className }: FadeTransitionProps) => {
  const location = useLocation();
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeInOut" }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

interface SlideTransitionProps {
  children: ReactNode;
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

const SlideTransition = ({
  children,
  direction = 'horizontal',
  className
}: SlideTransitionProps) => {
  const location = useLocation();
  const reducedMotion = useReducedMotion();

  const getVariants = () => {
    if (direction === 'horizontal') {
      return {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 }
      };
    } else {
      return {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -30 }
      };
    }
  };

  const variants = getVariants();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{ duration: reducedMotion ? 0 : 0.3, ease: "easeInOut" }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Staggered content animation
interface StaggeredContentProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

const StaggeredContent = ({
  children,
  className,
  delay = 0.1,
  staggerDelay = 0.1
}: StaggeredContentProps) => {
  const reducedMotion = useReducedMotion();

  // Wrap children with motion divs for staggered animation
  const wrappedChildren = Array.isArray(children)
    ? children.map((child, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
          delay: delay + (index * staggerDelay)
        }}
      >
        {child}
      </motion.div>
    ))
    : (
      <motion.div
        initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay }}
      >
        {children}
      </motion.div>
    );

  return (
    <div className={className}>
      {wrappedChildren}
    </div>
  );
};

// Loading screen component
interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  className?: string;
}

const LoadingScreen = ({
  message = "Loading...",
  showProgress = true,
  className
}: LoadingScreenProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <div className={`fixed inset-0 bg-white z-50 flex items-center justify-center ${className || ''}`}>
      <div className="text-center">
        <motion.div
          className="w-16 h-16 mx-auto mb-6 relative"
          animate={reducedMotion ? {} : { rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-green-600 border-t-transparent rounded-full"></div>
        </motion.div>

        <motion.p
          className="text-lg font-medium text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>

        {showProgress && (
          <motion.div
            className="w-48 h-2 bg-gray-200 rounded-full mt-4 mx-auto overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 -green- rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export {
  PageTransition,
  FadeTransition,
  SlideTransition,
  StaggeredContent,
  LoadingScreen
};

export type {
  PageTransitionProps,
  FadeTransitionProps,
  SlideTransitionProps,
  StaggeredContentProps,
  LoadingScreenProps
};