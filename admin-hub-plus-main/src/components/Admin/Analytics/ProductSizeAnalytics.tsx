import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';
import { Card } from '@/components/ui/card';
import { Package, Ruler, TrendingUp } from 'lucide-react';

interface ProductSizeData {
  productId: string;
  name: string;
  category: string;
  image?: string;
  totalSizes: number;
  sizes: string;
  minPrice: number;
  maxPrice: number;
  views: number;
}

interface SummaryData {
  totalProducts: number;
  totalSizeOptions: number;
  avgSizesPerProduct: number;
  mostCommonSizes: Array<{ size: string; count: number }>;
}

export function ProductSizeAnalytics() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['products-size-analytics'],
    queryFn: async () => {
      const response = await analyticsService.getProductSizeAnalytics();
      return response.data;
    },
    staleTime: 60000,
  });

  const products: ProductSizeData[] = analyticsData?.products || [];
  const summary: SummaryData = analyticsData?.summary || {
    totalProducts: 0,
    totalSizeOptions: 0,
    avgSizesPerProduct: 0,
    mostCommonSizes: []
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Ruler className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-bold">Product Size Analytics</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{summary.totalProducts}</div>
              <div className="text-sm text-green-700">Total Products</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <Ruler className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{summary.totalSizeOptions}</div>
              <div className="text-sm text-green-700">Total Size Options</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold">{summary.avgSizesPerProduct}</div>
              <div className="text-sm text-purple-700">Avg Sizes/Product</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Most Common Sizes */}
      {summary.mostCommonSizes.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            Most Common Sizes
          </h4>
          <div className="flex flex-wrap gap-2">
            {summary.mostCommonSizes.map((item, index) => (
              <div
                key={item.size}
                className="bg-orange-50 border border-orange-200 rounded-md px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-orange-600">#{index + 1}</span>
                  <span className="font-semibold text-sm">{item.size}</span>
                  <span className="text-xs text-orange-500">({item.count} products)</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Product Size Details Table */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Ruler className="w-5 h-5 text-green-600" />
          Product Size Details
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3 px-4 text-sm font-semibold">Product Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Available Sizes</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Size Count</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Price Range</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Views</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.productId} className="border-b hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-md"
                          />
                        )}
                        <div>
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-muted-foreground">{product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{product.category}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.split(', ').map((size) => (
                          <span
                            key={size}
                            className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded border border-green-200"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded font-medium">
                        {product.totalSizes} sizes
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="text-muted-foreground">
                        ₹{product.minPrice.toLocaleString()} - ₹{product.maxPrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-medium text-purple-600">
                        {product.views.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
