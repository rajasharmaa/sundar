import { Product } from '@/types';
import { formatCurrency, calculateDiscountedPrice, getPriceRange } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Percent } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails, onDelete }: ProductCardProps) {
  const priceRange = getPriceRange(product.sizeOptions);
  const hasDiscount = product.discount > 0;

  return (
    <div className="product-card animate-slide-up">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted">
        <img
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
            <Percent className="w-3 h-3" />
            {product.discount}% OFF
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
        
        {/* Category Badge */}
        <span className="inline-block mt-2 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded capitalize">
          {product.category}
        </span>

        {/* Price */}
        <div className="mt-3 font-mono text-sm">
          {hasDiscount ? (
            <div className="flex items-baseline gap-2">
              <span className="text-muted-foreground line-through">
                {formatCurrency(priceRange.min)}
              </span>
              <span className="text-destructive font-bold">
                {formatCurrency(calculateDiscountedPrice(priceRange.min, product.discount))}
              </span>
            </div>
          ) : (
            <span className="font-semibold text-primary">
              {priceRange.min === priceRange.max
                ? formatCurrency(priceRange.min)
                : `${formatCurrency(priceRange.min)} - ${formatCurrency(priceRange.max)}`}
            </span>
          )}
        </div>

        {/* Size Options Count */}
        <p className="text-xs text-muted-foreground mt-2">
          {product.sizeOptions?.length || 0} size option(s)
        </p>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            onClick={() => onViewDetails(product)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            Details
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(product)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
