// hooks/useTapFeedback.ts
import { useState, useCallback } from 'react';

interface TapFeedbackOptions {
  duration?: number;
  scale?: number;
  onVibrate?: boolean;
}

/**
 * Custom hook for providing tactile feedback on tap/click interactions
 * Includes visual scaling and optional haptic feedback
 */
export function useTapFeedback(options: TapFeedbackOptions = {}) {
  const {
    duration = 150,
    scale = 0.95,
    onVibrate = true,
  } = options;

  const [isPressed, setIsPressed] = useState(false);

  const handlePressStart = useCallback(() => {
    setIsPressed(true);
    
    // Haptic feedback if supported and enabled
    if (onVibrate && navigator.vibrate) {
      navigator.vibrate(10); // Light tap vibration
    }
  }, [onVibrate]);

  const handlePressEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handlePressCancel = useCallback(() => {
    setIsPressed(false);
  }, []);

  return {
    isPressed,
    handlers: {
      onMouseDown: handlePressStart,
      onMouseUp: handlePressEnd,
      onMouseLeave: handlePressCancel,
      onTouchStart: handlePressStart,
      onTouchEnd: handlePressEnd,
      onTouchCancel: handlePressCancel,
    },
    style: {
      transform: isPressed ? `scale(${scale})` : 'scale(1)',
      transition: `transform ${duration}ms ease-out`,
    },
  };
}

/**
 * Simplified hook for quick tap animations with framer-motion
 * Returns variants that can be used with motion components
 */
export function useTapAnimation(scale = 0.95, duration = 0.1) {
  return {
    tap: {
      scale,
      transition: {
        duration,
        ease: 'easeOut',
      },
    },
  };
}

export default useTapFeedback;
