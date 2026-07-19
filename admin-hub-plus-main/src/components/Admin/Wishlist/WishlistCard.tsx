import type { WishlistItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Heart, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WishlistCardProps {
  item: WishlistItem;
  index: number;
}

export function WishlistCard({ item, index }: WishlistCardProps) {
  const addedDate = formatDistanceToNow(new Date(item.addedAt), { addSuffix: true });

  return (
    <div
      className="bg-card rounded-md border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Product Image */}
      <div className="relative h-40 bg-muted overflow-hidden">
        <img
          src={item.product?.image || '/placeholder.svg'}
          alt={item.product?.name || 'Product'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        <div className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-pink-500">
          <Heart className="w-4 h-4 fill-current" />
        </div>
        {item.product?.category && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
            {item.product.category}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 space-y-2">
        <div>
          <h4 className="font-semibold text-sm line-clamp-2 mb-1">
            {item.product?.name || 'Unknown Product'}
          </h4>
          <p className="text-xs text-muted-foreground">
            Added {addedDate}
          </p>
        </div>

        {/* User Info */}
        {item.user && (
          <div className="pt-2 border-t flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
              {item.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{item.user.name}</div>
              <div className="text-xs text-muted-foreground truncate">{item.user.email}</div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => window.open(`/products/${item.productId}`, '_blank')}
          className="w-full mt-2 py-1.5 text-xs bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          View Product
        </button>
      </div>
    </div>
  );
}
