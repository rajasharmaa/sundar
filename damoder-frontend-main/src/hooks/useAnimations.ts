// src/hooks/useAnimations.ts
import { useState, useEffect, useCallback, useRef } from 'react';

// Animation configuration
const ANIMATION_CONFIG = {
  // Timing constants
  DURATIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    XL: 800
  },
  
  // Easing functions
  EASING: {
    STANDARD: 'cubic-bezier(0.4, 0, 0.2, 1)',
    DECELERATE: 'cubic-bezier(0, 0, 0.2, 1)',
    ACCELERATE: 'cubic-bezier(0.4, 0, 1, 1)',
    SHARP: 'cubic-bezier(0.4, 0, 0.6, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  
  // 3D Transform defaults
  TILT: {
    MAX_ROTATION: 12, // degrees
    PERSPECTIVE: 1000
  },
  
  // Parallax settings
  PARALLAX: {
    DEFAULT_SPEED: 0.5,
    MOBILE_SPEED: 0.2
  }
};

// Check for reduced motion preference
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// Hook for 3D card tilt effect
export const useTiltEffect = (isEnabled: boolean = true) => {
  const reducedMotion = useReducedMotion();
  const [transform, setTransform] = useState('');
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !isEnabled) return;
    
    const element = elementRef.current;
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * ANIMATION_CONFIG.TILT.MAX_ROTATION;
    const rotateY = ((centerX - x) / centerX) * ANIMATION_CONFIG.TILT.MAX_ROTATION;
    
    const glowX = (x / rect.width) * 100;
    const glowY = (y / rect.height) * 100;
    
    setTransform(`
      perspective(${ANIMATION_CONFIG.TILT.PERSPECTIVE}px) 
      rotateX(${rotateX}deg) 
      rotateY(${rotateY}deg) 
      scale3d(1.02, 1.02, 1.02)
    `);
  }, [reducedMotion, isEnabled]);

  const handleMouseLeave = useCallback(() => {
    if (reducedMotion || !isEnabled) return;
    setTransform('');
  }, [reducedMotion, isEnabled]);

  return {
    ref: elementRef,
    transform,
    events: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave
    }
  };
};

// Hook for parallax scrolling effect
export const useParallax = (speed: number = ANIMATION_CONFIG.PARALLAX.DEFAULT_SPEED) => {
  const reducedMotion = useReducedMotion();
  const [offset, setOffset] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    
    const handleScroll = () => {
      const element = elementRef.current;
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const elementTop = rect.top + scrollTop;
      const viewportHeight = window.innerHeight;
      
      // Only apply parallax when element is in viewport
      if (rect.bottom > 0 && rect.top < viewportHeight) {
        const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
        const parallaxOffset = progress * speed * 100;
        setOffset(parallaxOffset);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, reducedMotion]);

  return {
    ref: elementRef,
    style: {
      transform: `translateY(${offset}px)`
    }
  };
};

// Hook for smooth hover effects
export const useHoverEffect = () => {
  const reducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (!reducedMotion) setIsHovered(true);
  }, [reducedMotion]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return {
    isHovered,
    events: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    }
  };
};

// Hook for button press animations
export const usePressAnimation = () => {
  const reducedMotion = useReducedMotion();
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = useCallback(() => {
    if (!reducedMotion) setIsPressed(true);
  }, [reducedMotion]);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPressed(false);
  }, []);

  return {
    isPressed,
    transform: isPressed && !reducedMotion ? 'scale(0.95)' : 'scale(1)',
    events: {
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave
    }
  };
};

// Hook for staggered animations
export const useStaggeredAnimation = (itemsCount: number, delay: number = 100) => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    for (let i = 0; i < itemsCount; i++) {
      const timer = setTimeout(() => {
        setVisibleItems(prev => [...prev, i]);
      }, i * delay);
      timers.push(timer);
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [itemsCount, delay]);

  return visibleItems;
};

// Hook for intersection observer animations
export const useIntersectionAnimation = (threshold: number = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return {
    ref: elementRef,
    isVisible
  };
};

// Utility functions
export const springAnimation = (stiffness: number = 100, damping: number = 10) => ({
  type: 'spring',
  stiffness,
  damping
});

export const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: ANIMATION_CONFIG.DURATIONS.NORMAL / 1000,
      easing: ANIMATION_CONFIG.EASING.STANDARD
    }
  }
};

export const slideInVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: ANIMATION_CONFIG.DURATIONS.NORMAL / 1000,
      easing: ANIMATION_CONFIG.EASING.DECELERATE
    }
  }
};

// Export configuration for external use
export { ANIMATION_CONFIG };