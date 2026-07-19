import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '@/services/wishlistService';
import type { WishlistItem } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { WishlistCard } from './WishlistCard';
import { WishlistStatsCards } from './WishlistStatsCards';
import { WishlistFilters } from './WishlistFilters';
import { Heart, TrendingUp } from 'lucide-react';

type SortOption = 'newest' | 'oldest' | 'user' | 'product';

export function WishlistManagement() {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: wishlists = [], isLoading } = useQuery({
    queryKey: ['wishlists'],
    queryFn: wishlistService.getAll,
    refetchInterval: 60000, // Auto-refresh every minute
  });

  const { data: stats } = useQuery({
    queryKey: ['wishlist-stats'],
    queryFn: wishlistService.getStats,
  });

  const filteredAndSortedWishlists = useMemo(() => {
    let filtered = [...wishlists];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item => {
        const userName = item.user?.name?.toLowerCase() || '';
        const productName = item.product?.name?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return userName.includes(query) || productName.includes(query);
      });
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime());
        break;
      case 'user':
        filtered.sort((a, b) => (a.user?.name || '').localeCompare(b.user?.name || ''));
        break;
      case 'product':
        filtered.sort((a, b) => (a.product?.name || '').localeCompare(b.product?.name || ''));
        break;
    }

    return filtered;
  }, [wishlists, searchQuery, sortBy]);

  // Group by user for display
  const groupedByUser = useMemo(() => {
    const groups: Record<string, WishlistItem[]> = {};
    filteredAndSortedWishlists.forEach(item => {
      const userId = item.userId;
      if (!groups[userId]) {
        groups[userId] = [];
      }
      groups[userId].push(item);
    });
    return groups;
  }, [filteredAndSortedWishlists]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Wishlist Management</h2>
        <p className="text-muted-foreground">View and manage all user wishlists</p>
      </div>

      {/* Statistics Cards */}
      {stats && <WishlistStatsCards stats={stats} />}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
        <WishlistFilters 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalItems={wishlists.length}
        />
        
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['wishlists'] })}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Wishlists Grid */}
      {filteredAndSortedWishlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No Wishlist Items Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery ? 'Try a different search term' : 'Users haven\'t added any products to wishlist yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByUser).map(([userId, items]) => (
            <div key={userId} className="bg-card rounded-lg border shadow-sm overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 border-b flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                  {items[0]?.user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="font-semibold">{items[0]?.user?.name || 'Unknown User'}</h4>
                  <p className="text-xs text-muted-foreground">
                    {items.length} item{items.length > 1 ? 's' : ''} • {items[0]?.user?.email || 'No email'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {items.map((item, index) => (
                  <WishlistCard key={item._id} item={item} index={index} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Most Wished Products Section */}
      <MostWishedProducts />
    </div>
  );
}

// Most Wished Products Component
function MostWishedProducts() {
  const { data: mostWished = [], isLoading } = useQuery({
    queryKey: ['most-wished-products'],
    queryFn: () => wishlistService.getMostWished(5),
  });

  if (isLoading || mostWished.length === 0) return null;

  return (
    <div className="mt-8 bg-gradient-to-r from-pink-50 to-red-50 rounded-lg border border-pink-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="w-6 h-6 text-pink-600" />
        <h3 className="text-lg font-bold">Most Wished Products</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {mostWished.map((product, index) => (
          <div key={product.productId} className="bg-white rounded-md p-3 border border-pink-100">
            <div className="text-xs text-muted-foreground mb-1">#{index + 1}</div>
            <div className="font-semibold text-sm truncate">{product.name}</div>
            <div className="text-xs text-pink-600 font-medium mt-1">
              {product.count} wish{product.count > 1 ? 'es' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
