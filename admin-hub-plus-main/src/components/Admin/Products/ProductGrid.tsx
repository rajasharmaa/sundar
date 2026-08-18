import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Package } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onViewDetails: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductGrid({ products, isLoading, onViewDetails, onDelete }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">No Products Found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add your first product to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((product, index) => (
        <div key={product._id || (product as any).id || index} style={{ animationDelay: `${index * 50}ms` }}>
          <ProductCard
            product={product}
            onViewDetails={onViewDetails}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
}
