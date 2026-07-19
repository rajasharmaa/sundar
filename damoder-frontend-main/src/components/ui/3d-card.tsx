// src/components/ui/3d-card.tsx
import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useAnimations';

interface Card3DProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  tiltEnabled?: boolean;
  glowEnabled?: boolean;
  elevation?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'glass' | 'solid';
  animateOnHover?: boolean;
}

const Card3D = forwardRef<HTMLDivElement, Card3DProps>(
  ({
    children,
    className,
    tiltEnabled = true,
    glowEnabled = true,
    elevation = 'md',
    variant = 'default',
    animateOnHover = true,
    ...props
  }, ref) => {
    const reducedMotion = useReducedMotion();

    const elevationClasses = {
      sm: 'shadow-sm hover:shadow-md',
      md: 'shadow-md hover:shadow-lg',
      lg: 'shadow-lg hover:shadow-xl',
      xl: 'shadow-xl hover:shadow-2xl'
    };

    const variantClasses = {
      default: 'bg-white border border-gray-200',
      glass: 'bg-white/80 backdrop-blur-sm border border-white/20',
      solid: 'bg-white border-0'
    };

    const cardClasses = cn(
      'card-3d rounded-xl transition-all duration-300 ease-out',
      elevationClasses[elevation],
      variantClasses[variant],
      glowEnabled && 'card-3d-glow',
      animateOnHover && !reducedMotion && 'hover-lift',
      className
    );

    return (
      <div
        ref={ref}
        className={cardClasses}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card3D.displayName = 'Card3D';

// Pre-built card variations
interface ProductCard3DProps extends Omit<Card3DProps, 'children'> {
  image?: string;
  title: string;
  description?: string;
  price?: string;
  badge?: string;
  actionButton?: ReactNode;
  imageAlt?: string;
  onImageLoadError?: () => void;
}

const ProductCard3D = forwardRef<HTMLDivElement, ProductCard3DProps>(
  ({
    image,
    title,
    description,
    price,
    badge,
    actionButton,
    imageAlt = 'Product image',
    onImageLoadError,
    className,
    ...props
  }, ref) => {
    return (
      <Card3D
        ref={ref}
        className={cn('overflow-hidden group', className)}
        {...props}
      >
        {/* Image section */}
        <div className="relative aspect-video overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={imageAlt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={onImageLoadError}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-gray-400">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
          
          {/* Badge */}
          {badge && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
              {badge}
            </div>
          )}
          
          {/* Action button overlay */}
          {actionButton && (
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {actionButton}
            </div>
          )}
        </div>

        {/* Content section */}
        <div className="p-5">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          
          {description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {description}
            </p>
          )}
          
          {price && (
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">{price}</span>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>4.8</span>
              </div>
            </div>
          )}
        </div>
      </Card3D>
    );
  }
);

ProductCard3D.displayName = 'ProductCard3D';

// Category card variation
interface CategoryCard3DProps extends Omit<Card3DProps, 'children'> {
  icon: ReactNode;
  title: string;
  description: string;
  count?: number;
  href?: string;
  isTrending?: boolean;
}

const CategoryCard3D = forwardRef<HTMLDivElement, CategoryCard3DProps>(
  ({
    icon,
    title,
    description,
    count,
    href,
    isTrending = false,
    className,
    ...props
  }, ref) => {
    const content = (
      <Card3D
        ref={ref}
        className={cn('h-full', className)}
        {...props}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Icon */}
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg">
              {icon}
            </div>
            
            {isTrending && (
              <div className="inline-flex items-center gap-1 ml-2 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                Trending
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {description}
            </p>
          </div>

          {/* Count */}
          {count !== undefined && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">{count} products</span>
              <div className="flex items-center gap-1 text-blue-600">
                <span className="text-sm font-medium">Explore</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </Card3D>
    );

    if (href) {
      return (
        <a href={href} className="block group">
          {content}
        </a>
      );
    }

    return content;
  }
);

CategoryCard3D.displayName = 'CategoryCard3D';

export { Card3D, ProductCard3D, CategoryCard3D };
export type { Card3DProps, ProductCard3DProps, CategoryCard3DProps };