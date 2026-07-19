// 🔧 Memory Leak Prevention Utilities
// Provides hooks and utilities to prevent common React memory leaks

import { useEffect, useRef, useState } from 'react';
import logger from './logger';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------
type CleanupFunction = () => void;
type EffectCallback = () => CleanupFunction | void;

// -----------------------------------------------------------------------------
// HOOKS
// -----------------------------------------------------------------------------

/**
 * useEffect with automatic cleanup on unmount
 * Ensures cleanup functions are always called
 */
export function useSafeEffect(effect: EffectCallback, deps?: React.DependencyList) {
  const cleanupRef = useRef<CleanupFunction | null>(null);

  useEffect(() => {
    // Clean up previous effect if it exists
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Run new effect
    const cleanup = effect();
    cleanupRef.current = typeof cleanup === 'function' ? cleanup : null;

    // Return cleanup function
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, deps);
}

/**
 * useMountedRef - Tracks component mount state
 * Prevents state updates on unmounted components
 */
export function useMountedRef() {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedRef;
}

/**
 * useSafeState - State setter that checks if component is mounted
 * Prevents "Can't perform state update on unmounted component" warnings
 */
export function useSafeState<S>(initialState: S | (() => S)) {
  const [state, setState] = useState(initialState);
  const mountedRef = useMountedRef();

  const safeSetState: typeof setState = (value) => {
    if (mountedRef.current) {
      setState(value);
    }
  };

  return [state, safeSetState] as const;
}

/**
 * useAnimationCleanup - Properly cleans up GSAP/animation libraries
 * Prevents memory leaks from ongoing animations
 */
export function useAnimationCleanup(cleanupCallback: CleanupFunction) {
  const animationRefs = useRef<Array<GSAPTween | GSAPTimeline>>([]);

  // Add animation to tracking
  const addAnimation = (animation: GSAPTween | GSAPTimeline) => {
    animationRefs.current.push(animation);
  };

  // Kill all tracked animations
  const killAnimations = () => {
    animationRefs.current.forEach(anim => {
      if (anim && typeof anim.kill === 'function') {
        anim.kill();
      }
    });
    animationRefs.current = [];
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      killAnimations();
      if (cleanupCallback) {
        cleanupCallback();
      }
    };
  }, []);

  return { addAnimation, killAnimations };
}

/**
 * useEventListener - Safely adds/removes event listeners
 * Automatically cleans up on unmount
 */
export function useEventListener(
  target: EventTarget,
  event: string,
  handler: EventListener,
  options?: boolean | AddEventListenerOptions
) {
  useEffect(() => {
    target.addEventListener(event, handler, options);

    return () => {
      target.removeEventListener(event, handler, options);
    };
  }, [target, event, handler, options]);
}

/**
 * useIntersectionObserver - Safe Intersection Observer hook
 * Automatically disconnects observer on unmount
 */
export function useIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const observe = (element: Element) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(callback, options);
    observerRef.current.observe(element);
  };

  const unobserve = (element: Element) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element);
    }
  };

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  return { observe, unobserve };
}

/**
 * useDebounce - Debounced effect execution
 * Prevents excessive re-renders and API calls
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const mountedRef = useMountedRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        setDebouncedValue(value);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, mountedRef]);

  return debouncedValue;
}

/**
 * useThrottle - Throttled effect execution
 * Limits execution frequency
 */
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastExecutionTime = useRef(0);
  const mountedRef = useMountedRef();

  useEffect(() => {
    const now = Date.now();

    if (now - lastExecutionTime.current >= delay) {
      if (mountedRef.current) {
        setThrottledValue(value);
        lastExecutionTime.current = now;
      }
    } else {
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          setThrottledValue(value);
          lastExecutionTime.current = now;
        }
      }, delay - (now - lastExecutionTime.current));

      return () => clearTimeout(timer);
    }
  }, [value, delay, mountedRef]);

  return throttledValue;
}

/**
 * useApiCall - Safe API call with automatic cleanup
 * Prevents state updates after component unmount
 */
export function useApiCall<T>() {
  const mountedRef = useMountedRef();
  const abortControllerRef = useRef<AbortController | null>(null);

  const callApi = async (
    apiFunction: () => Promise<T>,
    onSuccess?: (data: T) => void,
    onError?: (error: any) => void
  ): Promise<T | null> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      logger.debug('Aborting previous request');
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      logger.debug('Starting API call with abort signal');
      const result = await apiFunction();

      if (mountedRef.current) {
        logger.debug('API call successful, calling success callback');
        onSuccess?.(result);
        return result;
      }

      logger.debug('Component unmounted, discarding result');
      return null;
    } catch (error: any) {
      // Handle abort errors silently
      if (error.name === 'AbortError') {
        logger.debug('Request was aborted');
        return null;
      }

      // Handle other errors
      if (mountedRef.current) {
        logger.error('API call failed', {
          message: error.message,
          status: error.response?.status,
          url: error.config?.url
        });
        onError?.(error);
      } else {
        logger.debug('Component unmounted, not calling error callback');
      }

      return null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        logger.debug('Cleaning up abort controller on unmount');
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { callApi, abortController: abortControllerRef.current };
}

// -----------------------------------------------------------------------------
// UTILITY FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * createSafeCallback - Wraps callback to prevent execution on unmounted components
 */
export function createSafeCallback<T extends (...args: any[]) => any>(
  callback: T,
  mountedRef: React.RefObject<boolean>
): T {
  return ((...args: Parameters<T>) => {
    if (mountedRef.current) {
      return callback(...args);
    }
  }) as T;
}

/**
 * batchUpdates - Batches multiple state updates for better performance
 */
export function batchUpdates(callback: () => void) {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(callback);
  } else {
    setTimeout(callback, 0);
  }
}

/**
 * measurePerformance - Utility to measure component render performance
 */
export function measurePerformance(name: string, callback: () => void) {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    callback();
    const end = performance.now();
    console.log(`⏱️ ${name} render time: ${(end - start).toFixed(2)}ms`);
  } else {
    callback();
  }
}

// -----------------------------------------------------------------------------
// GSAP SPECIFIC UTILITIES
// -----------------------------------------------------------------------------

/**
 * safeGsapKill - Safely kills GSAP animations
 */
export function safeGsapKill(target: gsap.DOMTarget | GSAPTween | GSAPTimeline) {
  try {
    if (typeof target === 'object' && 'kill' in target) {
      target.kill();
    } else {
      gsap.killTweensOf(target);
    }
  } catch (error) {
    console.warn('Failed to kill GSAP animation:', error);
  }
}

/**
 * createGsapCleanup - Creates cleanup function for GSAP animations
 */
export function createGsapCleanup(...animations: Array<gsap.DOMTarget | GSAPTween | GSAPTimeline>) {
  return () => {
    animations.forEach(safeGsapKill);
  };
}

export default {
  useSafeEffect,
  useMountedRef,
  useSafeState,
  useAnimationCleanup,
  useEventListener,
  useIntersectionObserver,
  useDebounce,
  useThrottle,
  useApiCall,
  createSafeCallback,
  batchUpdates,
  measurePerformance,
  safeGsapKill,
  createGsapCleanup
};