import { motion } from 'framer-motion';
import { Star, TrendingUp, Clock, Tag, Award } from 'lucide-react';

export type BadgeType = 'new' | 'popular' | 'trending' | 'bestseller' | 'updated';

interface ProductBadgeProps {
  type: BadgeType;
  className?: string;
}

/**
 * Product Badge Component
 * Displays badges for products (New, Popular, Trending, etc.)
 */
export const ProductBadge = ({ type, className = '' }: ProductBadgeProps) => {
  const badgeConfig = {
    new: {
      label: 'New',
      icon: Clock,
      colors: 'bg-gradient-to-r from-green-500 to-cyan-500 text-white',
      description: 'Recently added product'
    },
    popular: {
      label: 'Popular',
      icon: Star,
      colors: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
      description: 'Highly viewed product'
    },
    trending: {
      label: 'Trending',
      icon: TrendingUp,
      colors: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
      description: 'Rising in popularity'
    },
    bestseller: {
      label: 'Best Seller',
      icon: Award,
      colors: 'bg-gradient-to-r -green- to-pink-500 text-white',
      description: 'Top selling product'
    },
    updated: {
      label: 'Updated',
      icon: Tag,
      colors: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
      description: 'Recently updated'
    }
  };

  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${config.colors} ${className}`}
      title={config.description}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </motion.div>
  );
};

export default ProductBadge;
