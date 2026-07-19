// src/components/ui/animated-button.tsx
import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePressAnimation, useReducedMotion } from '@/hooks/useAnimations';
import { Slot } from '@radix-ui/react-slot';

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
  ripple?: boolean;
  pulse?: boolean;
  glow?: boolean;
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    asChild = false,
    ripple = true,
    pulse = false,
    glow = false,
    disabled,
    ...props
  }, ref) => {
    const reducedMotion = useReducedMotion();
    const { isPressed, transform, events } = usePressAnimation();
    
    const Comp = asChild ? Slot : 'button';
    
    const variantClasses = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 shadow-sm hover:shadow-md',
      outline: 'border border-gray-300 hover:border-gray-400 text-gray-700 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md',
      ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
      destructive: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg'
    };

    const sizeClasses = {
      sm: 'h-9 px-3 py-2 text-sm rounded-md',
      md: 'h-10 px-4 py-2 text-sm rounded-lg',
      lg: 'h-11 px-8 py-2 text-base rounded-lg',
      icon: 'h-10 w-10 p-0 rounded-lg'
    };

    const buttonClasses = cn(
      'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none btn-press-effect',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
      glow && 'hover-glow',
      pulse && 'animate-pulse',
      className
    );

    const buttonStyle = {
      ...(ripple && !reducedMotion ? { transform } : {}),
      willChange: 'transform'
    };

    return (
      <Comp
        ref={ref}
        className={buttonClasses}
        style={buttonStyle}
        disabled={disabled || loading}
        {...(ripple && !reducedMotion ? events : {})}
        {...props}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

// Pre-built button variations
interface IconButtonProps extends Omit<AnimatedButtonProps, 'children' | 'size'> {
  icon: ReactNode;
  label?: string;
  iconPosition?: 'left' | 'right';
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ 
    icon, 
    label, 
    iconPosition = 'left',
    className,
    ...props 
  }, ref) => {
    return (
      <AnimatedButton
        ref={ref}
        className={cn('gap-2', className)}
        {...props}
      >
        {iconPosition === 'left' && icon}
        {label && <span>{label}</span>}
        {iconPosition === 'right' && icon}
      </AnimatedButton>
    );
  }
);

IconButton.displayName = 'IconButton';

interface SocialButtonProps extends Omit<AnimatedButtonProps, 'children' | 'variant'> {
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'whatsapp' | 'google';
  label?: string;
  iconOnly?: boolean;
}

const SocialButton = forwardRef<HTMLButtonElement, SocialButtonProps>(
  ({ 
    platform, 
    label, 
    iconOnly = false,
    className,
    ...props 
  }, ref) => {
    const platformConfig = {
      facebook: { 
        variant: 'primary' as const, 
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        )
      },
      twitter: { 
        variant: 'primary' as const, 
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        )
      },
      linkedin: { 
        variant: 'primary' as const, 
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        )
      },
      instagram: { 
        variant: 'primary' as const, 
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
        )
      },
      whatsapp: { 
        variant: 'primary' as const, 
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        )
      },
      google: { 
        variant: 'outline' as const, 
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
          </svg>
        )
      }
    };

    const config = platformConfig[platform];

    return (
      <AnimatedButton
        ref={ref}
        variant={config.variant}
        className={cn(
          'gap-2',
          platform === 'google' && 'border-gray-300 hover:border-gray-400',
          className
        )}
        {...props}
      >
        {config.icon}
        {!iconOnly && (
          <span>
            {label || `Continue with ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
          </span>
        )}
      </AnimatedButton>
    );
  }
);

SocialButton.displayName = 'SocialButton';

export { AnimatedButton, IconButton, SocialButton };
export type { AnimatedButtonProps, IconButtonProps, SocialButtonProps };