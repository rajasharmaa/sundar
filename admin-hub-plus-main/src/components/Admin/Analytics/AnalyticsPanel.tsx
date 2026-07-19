import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';
import { formatCurrency, generateCSV, downloadFile } from '@/utils/helpers';
import { cn } from '@/lib/utils';
import { SizeDistribution } from './SizeDistribution';
import { PriceAnalysis } from './PriceAnalysis';
import { AnalyticsFilters } from './AnalyticsFilters';
import { ProductSizeAnalytics } from './ProductSizeAnalytics';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Download, Layers, DollarSign, Filter, Package } from 'lucide-react';

type AnalyticsView = 'sizeDistribution' | 'priceAnalysis' | 'filteredResults' | 'productSizeAnalytics';

export function AnalyticsPanel() {
  const [activeView, setActiveView] = useState<AnalyticsView>('sizeDistribution');

  const { data: sizeData, isLoading: sizeLoading } = useQuery({
    queryKey: ['size-distribution'],
    queryFn: analyticsService.getSizeDistribution,
    staleTime: 60000,
  });

  const { data: priceData, isLoading: priceLoading } = useQuery({
    queryKey: ['price-range'],
    queryFn: analyticsService.getPriceRange,
    staleTime: 60000,
  });

  const handleExportCSV = () => {
    if (!sizeData) return;

    const csvContent = generateCSV(
      sizeData.sizeDistribution.map((item) => ({
        size: item.size,
        count: item.count,
        minPrice: item.minPrice,
        maxPrice: item.maxPrice,
        avgPrice: item.avgPrice.toFixed(2),
        percentage: item.percentage,
      })),
      [
        { key: 'size', label: 'Size' },
        { key: 'count', label: 'Count' },
        { key: 'minPrice', label: 'Min Price (₹)' },
        { key: 'maxPrice', label: 'Max Price (₹)' },
        { key: 'avgPrice', label: 'Avg Price (₹)' },
        { key: 'percentage', label: 'Percentage (%)' },
      ]
    );

    downloadFile(csvContent, `size-distribution-${Date.now()}.csv`, 'text/csv');
  };

  const isLoading = sizeLoading || priceLoading;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Product Analytics & Size Management</h2>
        <Button onClick={handleExportCSV} disabled={!sizeData} className="export-btn">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Quick Stats */}
      {!isLoading && sizeData && priceData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="analytics-stat analytics-stat-blue">
            <div className="text-sm text-info font-medium">Total Sizes</div>
            <div className="text-3xl font-bold">{sizeData.summary.totalUniqueSizes}</div>
          </div>
          <div className="analytics-stat analytics-stat-purple">
            <div className="text-sm font-medium" style={{ color: 'hsl(270, 60%, 50%)' }}>Avg Price</div>
            <div className="text-2xl font-bold">{formatCurrency(parseFloat(priceData.statistics.avgPrice))}</div>
          </div>
          <div className="analytics-stat analytics-stat-green">
            <div className="text-sm text-success font-medium">Price Range</div>
            <div className="text-lg font-bold">
              {formatCurrency(priceData.statistics.minPrice)} - {formatCurrency(priceData.statistics.maxPrice)}
            </div>
          </div>
          <div className="analytics-stat analytics-stat-orange">
            <div className="text-sm font-medium" style={{ color: 'hsl(36, 100%, 45%)' }}>Most Common</div>
            <div className="text-lg font-bold truncate">
              {sizeData.summary.mostCommonSize?.size || '-'}
            </div>
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveView('sizeDistribution')}
          className={cn(
            'tab-button flex items-center gap-2',
            activeView === 'sizeDistribution' && 'active'
          )}
        >
          <Layers className="w-4 h-4" />
          Size Distribution
        </button>
        <button
          onClick={() => setActiveView('priceAnalysis')}
          className={cn(
            'tab-button flex items-center gap-2',
            activeView === 'priceAnalysis' && 'active'
          )}
        >
          <DollarSign className="w-4 h-4" />
          Price Analysis
        </button>
        <button
          onClick={() => setActiveView('productSizeAnalytics')}
          className={cn(
            'tab-button flex items-center gap-2',
            activeView === 'productSizeAnalytics' && 'active'
          )}
        >
          <Package className="w-4 h-4" />
          Product Sizes
        </button>
        <button
          onClick={() => setActiveView('filteredResults')}
          className={cn(
            'tab-button flex items-center gap-2',
            activeView === 'filteredResults' && 'active'
          )}
        >
          <Filter className="w-4 h-4" />
          Filtered Products
        </button>
      </div>

      {/* Content */}
      {activeView === 'sizeDistribution' && <SizeDistribution />}
      {activeView === 'priceAnalysis' && <PriceAnalysis />}
      {activeView === 'productSizeAnalytics' && <ProductSizeAnalytics />}
      {activeView === 'filteredResults' && <AnalyticsFilters />}
    </div>
  );
}
