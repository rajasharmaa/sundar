import { motion, useInView, useAnimation, Variant } from 'framer-motion';
import { useEffect, useRef, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
}

const ScrollReveal = ({
  children,
  width = "100%",
  className = "",
  delay = 0,
  direction = 'up',
  distance = 50,
  duration = 0.8
}: ScrollRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  const getVariants = () => {
    const hidden: Variant = { opacity: 0 };
    const visible: Variant = { opacity: 1 };

    switch (direction) {
      case 'up': hidden.y = distance; visible.y = 0; break;
      case 'down': hidden.y = -distance; visible.y = 0; break;
      case 'left': hidden.x = distance; visible.x = 0; break;
      case 'right': hidden.x = -distance; visible.x = 0; break;
    }

    return {
      hidden,
      visible: {
        ...visible,
        transition: {
          duration,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }
      }
    };
  };

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "visible" }} className={className}>
      <motion.div
        variants={getVariants()}
        initial="hidden"
        animate={mainControls}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ScrollReveal;
