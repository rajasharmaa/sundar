import type { WishlistStats } from '@/types';
import { Heart, Users, TrendingUp, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WishlistStatsCardsProps {
  stats: WishlistStats;
}

export function WishlistStatsCards({ stats }: WishlistStatsCardsProps) {
  const statCards = [
    {
      label: 'Total Wishlist Items',
      value: stats.totalWishlistItems,
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      label: 'Users with Wishlist',
      value: stats.uniqueUsersWithWishlist,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Most Wished Product',
      value: stats.mostWishedProduct?.count || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      subtext: stats.mostWishedProduct?.name
    },
    {
      label: 'Avg Items per User',
      value: stats.averageItemsPerUser,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "bg-card rounded-lg border p-4 transition-all duration-300 hover:shadow-md",
            stat.bgColor
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <stat.icon className={cn("w-8 h-8", stat.color)} />
            <span className={cn("text-3xl font-bold", stat.color)}>{stat.value}</span>
          </div>
          <h3 className="font-semibold text-sm mb-1">{stat.label}</h3>
          {stat.subtext ? (
            <p className="text-xs text-muted-foreground truncate mt-1" title={stat.subtext}>
              {stat.subtext}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">All time statistics</p>
          )}
        </div>
      ))}
    </div>
  );
}
