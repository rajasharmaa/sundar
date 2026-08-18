// @/components/LoadingSpinner.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Variant definitions using cva
const spinnerVariants = cva(
  'animate-spin rounded-full border-t-transparent',
  {
    variants: {
      size: {
        xs: 'h-3 w-3 border',
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-12 w-12 border-4',
        xl: 'h-16 w-16 border-4',
      },
      variant: {
        default: 'border-gray-200',
        primary: 'border-gray-200 border-t-blue-600',
        secondary: 'border-gray-200 border-t-purple-600',
        success: 'border-gray-200 border-t-green-600',
        warning: 'border-gray-200 border-t-yellow-600',
        danger: 'border-gray-200 border-t-red-600',
        light: 'border-gray-100 border-t-gray-400',
        dark: 'border-gray-700 border-t-gray-300',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  }
);

interface LoadingSpinnerProps 
  extends VariantProps<typeof spinnerVariants>,
    React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  showLabel?: boolean;
  fullPage?: boolean;
  center?: boolean;
  overlay?: boolean;
  backdropBlur?: boolean;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ 
    className,
    size,
    variant,
    label = 'Loading...',
    showLabel = false,
    fullPage = false,
    center = false,
    overlay = false,
    backdropBlur = false,
    ...props 
  }, ref) => {
    
    const spinnerElement = (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={label}
        className={cn(
          'inline-flex flex-col items-center justify-center',
          {
            'fixed inset-0 z-50': fullPage,
            'absolute inset-0 z-40': overlay && !fullPage,
            'flex items-center justify-center min-h-[200px]': center && !fullPage,
          },
          className
        )}
        {...props}
      >
        {overlay && (
          <div 
            className={cn(
              'absolute inset-0 bg-background/80',
              { 'backdrop-blur-sm': backdropBlur }
            )} 
            aria-hidden="true"
          />
        )}
        
        <div className={cn(
          'relative z-10 flex flex-col items-center gap-2',
          { 'text-center': showLabel }
        )}>
          <div className={cn(spinnerVariants({ size, variant }))} />
          {showLabel && (
            <span 
              className="text-sm text-muted-foreground font-medium"
              aria-hidden="true"
            >
              {label}
            </span>
          )}
        </div>
        
        {/* Screen reader only text */}
        <span className="sr-only">{label}</span>
      </div>
    );

    return spinnerElement;
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

// Shadcn UI compatible version
export const Spinner = LoadingSpinner;

// Specialized spinner components for common use cases
export const FullPageSpinner = (props: Omit<LoadingSpinnerProps, 'fullPage'>) => (
  <LoadingSpinner fullPage {...props} />
);

export const ButtonSpinner = ({ size = 'sm', ...props }: LoadingSpinnerProps) => (
  <LoadingSpinner size={size} showLabel={false} {...props} />
);

export const InlineSpinner = (props: LoadingSpinnerProps) => (
  <LoadingSpinner center={false} overlay={false} {...props} />
);

// With percentage/progress
interface ProgressSpinnerProps extends LoadingSpinnerProps {
  progress?: number;
  showProgress?: boolean;
}

export const ProgressSpinner = ({
  progress,
  showProgress = true,
  label,
  ...props
}: ProgressSpinnerProps) => {
  const displayLabel = label || (progress !== undefined ? `Loading ${progress}%` : 'Loading');
  
  return (
    <LoadingSpinner
      label={displayLabel}
      showLabel={showProgress}
      {...props}
    >
      {progress !== undefined && showProgress && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-foreground">
            {progress}%
          </span>
        </div>
      )}
    </LoadingSpinner>
  );
};

// Gradient spinner variant
export const GradientSpinner = (props: LoadingSpinnerProps) => (
  <div className="relative">
    <div 
      className={cn(
        'absolute inset-0 animate-spin rounded-full bg-gradient-to-r from-green-500 -green- to-pink-500 blur-sm',
        spinnerVariants({ size: props.size })
      )}
    />
    <LoadingSpinner 
      variant="default"
      className="relative z-10"
      {...props}
    />
  </div>
);

// Pulse spinner (alternative animation)
export const PulseSpinner = ({
  size = 'md',
  className,
  ...props
}: LoadingSpinnerProps) => {
  const sizeMap = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div
      role="status"
      aria-label={props.label || 'Loading'}
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <div className={cn(
        'animate-pulse rounded-full bg-primary',
        sizeMap[size as keyof typeof sizeMap]
      )} />
      <span className="sr-only">{props.label || 'Loading'}</span>
    </div>
  );
};

// Dark/light mode aware spinner
export const AdaptiveSpinner = (props: LoadingSpinnerProps) => {
  return (
    <LoadingSpinner
      variant="default"
      className={cn(
        "border-gray-200 dark:border-gray-700",
        "border-t-blue-600 dark:border-t-blue-400",
        props.className
      )}
      {...props}
    />
  );
};

export default LoadingSpinner;