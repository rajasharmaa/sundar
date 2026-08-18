// src/components/ui/hover-card-3d.tsx
import { useState, ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useAnimations';

interface HoverCard3DProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  trigger: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  delay?: number;
}

const HoverCard3D = ({
  children,
  className,
  trigger,
  placement = 'top',
  offset = 10,
  delay = 300,
  ...props
}: HoverCard3DProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  const placementClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const handleMouseEnter = () => {
    if (!reducedMotion) {
      setTimeout(() => setIsVisible(true), delay);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {trigger}
      
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 min-w-[200px] bg-white rounded-xl shadow-xl border border-gray-200 p-4 card-3d hover-lift',
            placementClasses[placement],
            className
          )}
          {...props}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// Pre-built hover card variations
interface ProductHoverCardProps {
  productName: string;
  productDescription: string;
  price: string;
  rating: number;
  image?: string;
  features?: string[];
  onQuickView?: () => void;
}

const ProductHoverCard = ({
  productName,
  productDescription,
  price,
  rating,
  image,
  features = [],
  onQuickView
}: ProductHoverCardProps) => {
  return (
    <HoverCard3D
      trigger={
        <div className="cursor-pointer">
          {productName}
        </div>
      }
      className="max-w-sm"
    >
      <div className="flex gap-4">
        {image && (
          <div className="flex-shrink-0">
            <img
              src={image}
              alt={productName}
              className="w-16 h-16 object-cover rounded-lg"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{productName}</h4>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{productDescription}</p>
          
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-gray-900">{price}</span>
            <div className="flex items-center gap-1">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-current' : 'fill-gray-300'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-500">{rating}</span>
            </div>
          </div>
          
          {features.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <ul className="text-xs text-gray-600 space-y-1">
                {features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {onQuickView && (
            <button
              onClick={onQuickView}
              className="mt-4 w-full py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 btn-press"
            >
              Quick View
            </button>
          )}
        </div>
      </div>
    </HoverCard3D>
  );
};

export { HoverCard3D, ProductHoverCard };
export type { HoverCard3DProps, ProductHoverCardProps };