// components/TypewriterText.tsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  texts: string[];
  speed?: number;
  delay?: number;
  className?: string;
  cursorColor?: string;
  cursorBlinkSpeed?: number;
  onComplete?: () => void;
}

const TypewriterText = ({ 
  texts, 
  speed = 80, // Slower speed for better readability
  delay = 1500, // Longer pause at end
  className = '',
  cursorColor = 'text-blue-600',
  cursorBlinkSpeed = 0.7,
  onComplete
}: TypewriterTextProps) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const timeout = setTimeout(() => {
      const currentWord = texts[currentIndex];
      
      if (!isDeleting) {
        // Typing forward
        if (currentText.length < currentWord.length) {
          setCurrentText(currentWord.substring(0, currentText.length + 1));
        } else {
          // Pause at the end before deleting
          setIsPaused(true);
          pauseTimeoutRef.current = setTimeout(() => {
            setIsPaused(false);
            setIsDeleting(true);
          }, delay);
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentWord.substring(0, currentText.length - 1));
        } else {
          // Move to next word
          setIsDeleting(false);
          const nextIndex = (currentIndex + 1) % texts.length;
          setCurrentIndex(nextIndex);
          
          // Check if we've completed all texts in current cycle
          if (nextIndex === 0 && onComplete) {
            onComplete();
          }
          
          // Short pause before starting next word
          setIsPaused(true);
          pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), 500);
        }
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [currentText, currentIndex, isDeleting, isPaused, texts, speed, delay, onComplete]);

  return (
    // 🔧 M4-7 FIX: Added aria-live and aria-atomic so screen readers announce typewriter changes
    <div
      className={`relative inline-block min-w-[300px] sm:min-w-[400px] md:min-w-[500px] lg:min-w-[600px] ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="relative block w-full overflow-visible whitespace-nowrap" role="text">
        {currentText}
        {/* Simplified cursor without AnimatePresence */}
        <motion.span
          className={`inline-block w-1 h-8 ml-1 mb-2 ${cursorColor} align-middle`}
          animate={{ opacity: [1, 0, 1] }}
          transition={{
            duration: cursorBlinkSpeed,
            repeat: Infinity,
            ease: "linear"
          }}
          aria-hidden="true"
        />
        
        {/* Optional gradient overlay */}
        <span className="absolute -inset-2 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </span>
      
      {/* Optional subtle background for better readability */}
      <span className="absolute -inset-4 bg-gradient-to-r from-blue-50/20 to-cyan-50/20 rounded-lg -z-10 blur-sm" />
    </div>
  );
};

// Advanced Typewriter with multiple lines
export const MultiLineTypewriter = ({ 
  lines,
  lineDelay = 500,
  ...props 
}: { 
  lines: string[][];
  lineDelay?: number;
} & Omit<TypewriterTextProps, 'texts' | 'onComplete'>) => {
  const [activeLine, setActiveLine] = useState(0);
  const [completedLines, setCompletedLines] = useState<number[]>([]);

  const handleLineComplete = () => {
    const current = activeLine;
    setCompletedLines(prev => [...prev, current]);
    
    if (current < lines.length - 1) {
      setTimeout(() => setActiveLine(current + 1), lineDelay);
    }
  };

  return (
    <div className="space-y-2">
      {lines.map((textGroup, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: index === activeLine ? 1 : 
                    completedLines.includes(index) ? 0.7 : 0.3,
            y: 0
          }}
          transition={{ duration: 0.5 }}
          className="transition-all duration-300"
        >
          {index <= activeLine && (
            <TypewriterText 
              texts={textGroup} 
              {...props}
              onComplete={index === activeLine ? handleLineComplete : undefined}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};

// Hook-based version for maximum flexibility
export const useTypewriter = (texts: string[], options?: {
  speed?: number;
  delay?: number;
  loop?: boolean;
  onTypingComplete?: () => void;
  onCycleComplete?: () => void;
}) => {
  const {
    speed = 50,
    delay = 1000,
    loop = true,
    onTypingComplete,
    onCycleComplete
  } = options || {};

  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const pauseRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPaused || isHovered) return;

    const timeout = setTimeout(() => {
      const currentWord = texts[currentIndex];
      
      if (!isDeleting) {
        if (currentText.length < currentWord.length) {
          setCurrentText(currentWord.substring(0, currentText.length + 1));
        } else {
          setIsPaused(true);
          onTypingComplete?.();
          
          pauseRef.current = setTimeout(() => {
            setIsPaused(false);
            setIsDeleting(true);
          }, delay);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(currentWord.substring(0, currentText.length - 1));
        } else {
          setIsDeleting(false);
          const nextIndex = loop ? (currentIndex + 1) % texts.length : currentIndex + 1;
          
          if (nextIndex === 0 || nextIndex >= texts.length) {
            onCycleComplete?.();
          }
          
          if (nextIndex < texts.length) {
            setCurrentIndex(nextIndex);
            setIsPaused(true);
            pauseRef.current = setTimeout(() => setIsPaused(false), 500);
          }
        }
      }
    }, isDeleting ? speed / 2 : speed);

    return () => {
      clearTimeout(timeout);
      if (pauseRef.current) clearTimeout(pauseRef.current);
    };
  }, [
    currentText, 
    currentIndex, 
    isDeleting, 
    isPaused, 
    isHovered,
    texts, 
    speed, 
    delay, 
    loop,
    onTypingComplete,
    onCycleComplete
  ]);

  const pause = () => setIsHovered(true);
  const resume = () => setIsHovered(false);
  const reset = () => {
    setCurrentText('');
    setCurrentIndex(0);
    setIsDeleting(false);
    setIsPaused(false);
  };

  return {
    text: currentText,
    currentIndex,
    isTyping: !isDeleting && !isPaused,
    isDeleting,
    isPaused,
    pause,
    resume,
    reset
  };
};

// Enhanced Typewriter Component using the hook
export const EnhancedTypewriterText = (props: TypewriterTextProps & {
  onHoverPause?: boolean;
  physicsCursor?: boolean;
}) => {
  const {
    texts,
    speed,
    delay,
    className,
    cursorColor = 'text-blue-600',
    cursorBlinkSpeed = 0.7,
    onComplete,
    onHoverPause = true,
    physicsCursor = false
  } = props;

  const {
    text,
    isTyping,
    pause,
    resume
  } = useTypewriter(texts, {
    speed,
    delay,
    onCycleComplete: onComplete
  });

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={onHoverPause ? pause : undefined}
      onMouseLeave={onHoverPause ? resume : undefined}
    >
      <span className="relative">
        {text}
        {physicsCursor ? (
          <motion.span
            className={`inline-block w-0.5 h-6 ml-1 ${cursorColor} align-middle`}
            animate={{
              opacity: [1, 0.7, 1],
              scaleY: [1, 1.1, 1]
            }}
            transition={{
              duration: cursorBlinkSpeed,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ) : (
          <motion.span
            className={`inline-block w-0.5 h-6 ml-1 ${cursorColor} align-middle`}
            animate={{ opacity: [1, 0, 1] }}
            transition={{
              duration: cursorBlinkSpeed,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}
      </span>
    </div>
  );
};

export default TypewriterText;