// src/components/ParallaxSection.tsx
import { useEffect, useRef, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useAnimations';

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  intensity?: number;
  triggerOnce?: boolean;
  threshold?: number;
  animateOnScroll?: boolean;
  backgroundElement?: ReactNode;
  foregroundElement?: ReactNode;
}

const ParallaxSection = ({
  children,
  className,
  speed = 0.5,
  intensity = 50,
  triggerOnce = true,
  threshold = 0.1,
  animateOnScroll = true,
  backgroundElement,
  foregroundElement
}: ParallaxSectionProps) => {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const foregroundRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    if (reducedMotion || !animateOnScroll) return;

    const section = sectionRef.current;
    const background = backgroundRef.current;
    const foreground = foregroundRef.current;

    if (!section) return;

    const handleScroll = () => {
      if (!isVisibleRef.current) return;

      const rect = section.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const sectionTop = rect.top + scrollTop;
      const viewportHeight = window.innerHeight;
      
      // Calculate progress (0 to 1) based on section position in viewport
      const progress = Math.max(0, Math.min(1, 
        (viewportHeight - rect.top) / (viewportHeight + rect.height)
      ));

      // Apply parallax effect
      if (background) {
        const offset = progress * intensity * speed;
        background.style.transform = `translateY(${offset}px)`;
      }

      if (foreground) {
        const offset = progress * intensity * (speed * 0.5);
        foreground.style.transform = `translateY(${-offset}px)`;
      }
    };

    // Intersection Observer for performance
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && triggerOnce) {
          observerRef.current?.unobserve(section);
        }
      },
      { threshold }
    );

    observerRef.current.observe(section);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed, intensity, triggerOnce, threshold, animateOnScroll, reducedMotion]);

  // Animation variants for initial entrance
  const containerVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.section
      ref={sectionRef}
      className={cn('relative overflow-hidden', className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background Element */}
      {backgroundElement && (
        <div
          ref={backgroundRef}
          className="absolute inset-0 z-0 parallax-slow"
          style={{ 
            transform: 'translateY(0px)',
            willChange: 'transform'
          }}
        >
          {backgroundElement}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Foreground Element */}
      {foregroundElement && (
        <div
          ref={foregroundRef}
          className="absolute inset-0 z-20 pointer-events-none parallax-medium"
          style={{ 
            transform: 'translateY(0px)',
            willChange: 'transform'
          }}
        >
          {foregroundElement}
        </div>
      )}
    </motion.section>
  );
};

// Pre-built parallax section variations
interface HeroParallaxProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  floatingElements?: ReactNode[];
  className?: string;
}

const HeroParallax = ({
  title,
  subtitle,
  backgroundImage,
  ctaText,
  onCtaClick,
  floatingElements = [],
  className
}: HeroParallaxProps) => {
  const backgroundElement = backgroundImage ? (
    <div 
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/70 via-green-800/50 -green-" />
    </div>
  ) : (
    <div className="absolute inset-0 bg-gradient-to-br from-green-600 -green- -green-">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.2)_0%,transparent_50%)]" />
    </div>
  );

  const foregroundElement = (
    <div className="absolute inset-0">
      {floatingElements.map((element, index) => (
        <div 
          key={index}
          className="absolute animate-float"
          style={{
            left: `${20 + (index * 15)}%`,
            top: `${30 + (index * 10)}%`,
            animationDelay: `${index * 0.5}s`,
            animationDuration: `${3 + index}s`
          }}
        >
          {element}
        </div>
      ))}
    </div>
  );

  return (
    <ParallaxSection
      className={cn('min-h-screen flex items-center justify-center text-white', className)}
      speed={0.3}
      intensity={30}
      backgroundElement={backgroundElement}
      foregroundElement={foregroundElement}
    >
      <div className="container mx-auto px-4 text-center">
        <motion.h1 
          className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-200"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {title}
        </motion.h1>
        
        {subtitle && (
          <motion.p 
            className="text-xl md:text-2xl mb-10 text-green-100 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {subtitle}
          </motion.p>
        )}

        {ctaText && (
          <motion.button
            className="px-8 py-4 bg-white text-green-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl btn-press"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            onClick={onCtaClick}
          >
            {ctaText}
          </motion.button>
        )}
      </div>
    </ParallaxSection>
  );
};

// Stats parallax section
interface StatsParallaxProps {
  stats: { value: string; label: string; icon?: ReactNode }[];
  title?: string;
  subtitle?: string;
  className?: string;
}

const StatsParallax = ({
  stats,
  title,
  subtitle,
  className
}: StatsParallaxProps) => {
  return (
    <ParallaxSection
      className={cn('py-20 bg-gradient-to-br from-gray-50 to-white', className)}
      speed={0.2}
      intensity={20}
    >
      <div className="container mx-auto px-4">
        {title && (
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
            {subtitle && <p className="text-xl text-gray-600">{subtitle}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              {stat.icon && (
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
                  {stat.icon}
                </div>
              )}
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </ParallaxSection>
  );
};

export { ParallaxSection, HeroParallax, StatsParallax };
export type { ParallaxSectionProps, HeroParallaxProps, StatsParallaxProps };