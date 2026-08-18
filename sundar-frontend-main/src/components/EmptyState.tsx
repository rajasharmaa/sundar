// src/components/EmptyState.tsx
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useAnimations';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionButton?: ReactNode;
  secondaryAction?: ReactNode;
  illustration?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'illustrated';
}

const EmptyState = ({
  icon,
  title,
  description,
  actionButton,
  secondaryAction,
  illustration,
  className,
  size = 'md',
  variant = 'default'
}: EmptyStateProps) => {
  const reducedMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-xl'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: reducedMotion ? 0 : 20 
    },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };

  return (
    <motion.div
      className={cn(
        'text-center mx-auto px-4',
        sizeClasses[size],
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
    >
      {/* Illustration */}
      {(illustration || variant === 'illustrated') && (
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {illustration || (
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-100 -green- mb-6">
              <div className="text-green-600">
                {icon}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Icon (if no illustration) */}
      {variant !== 'illustrated' && !illustration && (
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-100 -green-">
            <div className="text-green-600">
              {icon}
            </div>
          </div>
        </motion.div>
      )}

      {/* Title */}
      <motion.h3 
        className="text-2xl font-bold text-gray-900 mb-3"
        initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p 
        className="text-gray-600 mb-8 leading-relaxed"
        initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {description}
      </motion.p>

      {/* Actions */}
      {(actionButton || secondaryAction) && (
        <motion.div 
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {actionButton}
          {secondaryAction}
        </motion.div>
      )}
    </motion.div>
  );
};

// Pre-built empty state variations
interface WishlistEmptyStateProps {
  onBrowseProducts?: () => void;
  className?: string;
}

const WishlistEmptyState = ({ 
  onBrowseProducts,
  className 
}: WishlistEmptyStateProps) => {
  return (
    <EmptyState
      icon={
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      }
      title="Your wishlist is empty"
      description="Save products you love to your wishlist and easily find them later. Start browsing our collection now!"
      actionButton={
        <button
          onClick={onBrowseProducts}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg btn-press"
        >
          Browse Products
        </button>
      }
      secondaryAction={
        <button className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
          Learn More
        </button>
      }
      className={className}
    />
  );
};

interface CartEmptyStateProps {
  onShopNow?: () => void;
  className?: string;
}

const CartEmptyState = ({ 
  onShopNow,
  className 
}: CartEmptyStateProps) => {
  return (
    <EmptyState
      icon={
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      }
      title="Your cart is empty"
      description="Looks like you haven't added anything to your cart yet. Discover amazing products and start shopping!"
      actionButton={
        <button
          onClick={onShopNow}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg btn-press"
        >
          Shop Now
        </button>
      }
      className={className}
    />
  );
};

interface SearchEmptyStateProps {
  searchTerm?: string;
  onClearSearch?: () => void;
  className?: string;
}

const SearchEmptyState = ({ 
  searchTerm,
  onClearSearch,
  className 
}: SearchEmptyStateProps) => {
  return (
    <EmptyState
      icon={
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      title={searchTerm ? `No results for "${searchTerm}"` : "No search results"}
      description={
        searchTerm 
          ? "Try adjusting your search terms or browse our categories instead."
          : "Try searching for products or browse our categories."
      }
      actionButton={
        onClearSearch && (
          <button
            onClick={onClearSearch}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg btn-press"
          >
            Clear Search
          </button>
        )
      }
      className={className}
    />
  );
};

interface OrdersEmptyStateProps {
  onStartShopping?: () => void;
  className?: string;
}

const OrdersEmptyState = ({ 
  onStartShopping,
  className 
}: OrdersEmptyStateProps) => {
  return (
    <EmptyState
      icon={
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      }
      title="No orders yet"
      description="You haven't placed any orders yet. Start shopping and your order history will appear here."
      actionButton={
        <button
          onClick={onStartShopping}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg btn-press"
        >
          Start Shopping
        </button>
      }
      className={className}
    />
  );
};

interface NotificationsEmptyStateProps {
  className?: string;
}

const NotificationsEmptyState = ({ className }: NotificationsEmptyStateProps) => {
  return (
    <EmptyState
      icon={
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      }
      title="No notifications"
      description="You're all caught up! We'll notify you when there are important updates or offers."
      className={className}
    />
  );
};

export {
  EmptyState,
  WishlistEmptyState,
  CartEmptyState,
  SearchEmptyState,
  OrdersEmptyState,
  NotificationsEmptyState
};

export type {
  EmptyStateProps,
  WishlistEmptyStateProps,
  CartEmptyStateProps,
  SearchEmptyStateProps,
  OrdersEmptyStateProps,
  NotificationsEmptyStateProps
};