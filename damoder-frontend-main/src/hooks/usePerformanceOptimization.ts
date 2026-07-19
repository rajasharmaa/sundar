/**
 * 🚀 PERFORMANCE OPTIMIZATION HOOKS
 * 
 * Centralized hooks for improving application responsiveness
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * 🔥 NEW: Preload images on idle
 * Preloads critical images when browser is idle
 */
export const useImagePreloader = (imageUrls: string[], delay: number = 2000) => {
  useEffect(() => {
    // Don't preload in production if data saver is enabled
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection?.saveData || connection?.effectiveType === 'slow-2g') {
        return; // Skip preloading on slow connections
      }
    }

    const timeoutId = setTimeout(() => {
      imageUrls.forEach((url) => {
        const img = new Image();
        img.src = url;
        // Preload silently - errors are expected for some images
        img.onload = () => {};
        img.onerror = () => {};
      });
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [imageUrls, delay]);
};

/**
 * 🔥 NEW: Debounce function execution
 * Returns a debounced version of the provided function
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }) as T, [callback, delay]);
};

/**
 * 🔥 NEW: Debounced value with immediate option
 * Enhanced debounce that can fire immediately or after delay
 */
export const useDebounceValue = <T,>(value: T, delay: number = 300, immediate: boolean = false): T => {
  const debouncedValue = useRef<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (immediate) {
      debouncedValue.current = value;
      return;
    }

    const handler = setTimeout(() => {
      debouncedValue.current = value;
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay, immediate]);

  return immediate ? value : debouncedValue.current;
};

/**
 * 🔥 NEW: Intersection Observer for lazy loading
 * Efficiently detect when elements enter viewport
 */
export const useIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '50px'
  }
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const observe = useCallback((element: Element | null) => {
    if (!element) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(callback, options);
    observerRef.current.observe(element);
  }, [callback, options]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return observe;
};

/**
 * 🔥 NEW: Memory-efficient event listener
 * Automatically cleans up event listeners
 */
export const useEventListenter = <K extends keyof WindowEventMap>(
  event: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
) => {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event: WindowEventMap[K]) => handlerRef.current(event);
    
    window.addEventListener(event, listener, options);
    
    return () => {
      window.removeEventListener(event, listener, options);
    };
  }, [event, options]);
};

/**
 * 🔥 NEW: Throttle function execution
 * Limits how often a function can be called
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): T => {
  const lastRan = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(((...args: Parameters<T>) => {
    const handler = () => {
      if (Date.now() - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = Date.now();
      } else {
        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Set new timeout
        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRan.current = Date.now();
        }, delay - (Date.now() - lastRan.current));
      }
    };

    handler();
  }) as T, [callback, delay]);
};

/**
 * 🔥 NEW: Deep comparison memoization
 * Performs deep comparison to prevent unnecessary re-renders
 * Use this when memoizing complex objects/arrays that contain non-primitive values
 */
export const useDeepMemo = <T>(value: T, deps: any[]): T => {
  const prevDeps = useRef<any[] | null>(null);
  const memoizedValue = useRef<T>(value);

  if (!prevDeps.current) {
    prevDeps.current = deps;
    memoizedValue.current = value;
    return value;
  }

  // Perform deep comparison of dependencies
  const hasChanged = deps.length !== prevDeps.current.length ||
    deps.some((dep, index) => {
      const prevDep = prevDeps.current![index];
      // Handle primitive values
      if (typeof dep !== 'object' && typeof prevDep !== 'object') {
        return dep !== prevDep;
      }
      // Handle objects/arrays - simple deep comparison
      return JSON.stringify(dep) !== JSON.stringify(prevDep);
    });

  if (hasChanged) {
    prevDeps.current = deps;
    memoizedValue.current = value;
    return value;
  }

  return memoizedValue.current;
};

/**
 * 🔥 NEW: Optimize re-renders with shallow comparison
 * Prevents unnecessary re-renders for object/array props
 */
export const useShallowCompare = <T extends object>(value: T): boolean => {
  const prevValue = useRef<T | null>(null);

  if (!prevValue.current) {
    prevValue.current = value;
    return true;
  }

  const keys = Object.keys(value) as Array<keyof T>;
  const prevKeys = Object.keys(prevValue.current) as Array<keyof T>;

  if (keys.length !== prevKeys.length) {
    prevValue.current = value;
    return true;
  }

  const hasChanged = keys.some(key => {
    return prevValue.current?.[key] !== value[key];
  });

  if (hasChanged) {
    prevValue.current = value;
    return true;
  }

  return false;
};
