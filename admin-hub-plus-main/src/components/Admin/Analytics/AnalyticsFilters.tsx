import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService, FilterParams } from '@/services/analyticsService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PRODUCT_CATEGORIES } from '@/utils/constants';
import { Search, RotateCcw } from 'lucide-react';
import { ProductCard } from '../Products/ProductCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AnalyticsFiltersProps {
  onProductSelect?: (product: any) => void;
}

export function AnalyticsFilters({ onProductSelect }: AnalyticsFiltersProps) {
  const [filters, setFilters] = useState<FilterParams>({
    size: '',
    minPrice: undefined,
    maxPrice: undefined,
    category: '',
  });
  const [appliedFilters, setAppliedFilters] = useState<FilterParams | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['filtered-products', appliedFilters],
    queryFn: () => analyticsService.filterBySize(appliedFilters!),
    enabled: !!appliedFilters,
  });

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const handleReset = () => {
    setFilters({
      size: '',
      minPrice: undefined,
      maxPrice: undefined,
      category: '',
    });
    setAppliedFilters(null);
  };

  return (
    <div className="space-y-6">
      {/* Filter Form */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Filter Products by Size & Price</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <Label>Size Search</Label>
            <Input
              placeholder='e.g., 1/2", 20mm'
              value={filters.size || ''}
              onChange={(e) => setFilters((f) => ({ ...f, size: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Min Price (₹)</Label>
            <Input
              type="number"
              min="0"
              placeholder="Min price"
              value={filters.minPrice || ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  minPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                }))
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label>Max Price (₹)</Label>
            <Input
              type="number"
              min="0"
              placeholder="Max price"
              value={filters.maxPrice || ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  maxPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                }))
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) =>
                setFilters((f) => ({ ...f, category: value === 'all' ? '' : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={handleApplyFilters} disabled={isFetching}>
            <Search className="w-4 h-4 mr-2" />
            Apply Filters
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Results */}
      {appliedFilters && (
        <div className="space-y-4">
          {isLoading || isFetching ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : data ? (
            <>
              <div className="bg-success/10 text-success p-4 rounded-lg">
                Found <strong>{data.totalFound}</strong> products matching your filters
              </div>
              
              {data.products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {data.products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onViewDetails={(p) => onProductSelect?.(p)}
                      onDelete={() => {}}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No products match your filter criteria
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
