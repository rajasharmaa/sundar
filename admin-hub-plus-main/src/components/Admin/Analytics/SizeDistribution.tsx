import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';
import { formatCurrency } from '@/utils/helpers';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CHART_COLORS } from '@/utils/constants';

export function SizeDistribution() {
  const { data, isLoading } = useQuery({
    queryKey: ['size-distribution'],
    queryFn: analyticsService.getSizeDistribution,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data || data.sizeDistribution.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No size distribution data available
      </div>
    );
  }

  const chartData = data.sizeDistribution.slice(0, 15).map((item) => ({
    name: item.size,
    count: item.count,
    avgPrice: item.avgPrice,
  }));

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="bg-card border rounded-lg p-6">
        <h4 className="font-semibold mb-4">Size Distribution Chart</h4>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                className="text-xs fill-muted-foreground"
              />
              <YAxis className="text-xs fill-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="size-table">
          <thead>
            <tr>
              <th>Size</th>
              <th className="text-center">Count</th>
              <th className="text-right">Avg Price</th>
              <th className="text-right">Price Range</th>
              <th>Distribution</th>
            </tr>
          </thead>
          <tbody>
            {data.sizeDistribution.map((item, index) => (
              <tr key={item.size} className="animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                <td className="font-semibold text-primary">{item.size}</td>
                <td className="text-center font-bold text-stat-products">{item.count}</td>
                <td className="text-right font-mono">{formatCurrency(item.avgPrice)}</td>
                <td className="text-right font-mono text-sm text-muted-foreground">
                  {formatCurrency(item.minPrice)} - {formatCurrency(item.maxPrice)}
                </td>
                <td className="min-w-[150px]">
                  <div className="percentage-bar">
                    <div
                      className="percentage-fill"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{item.percentage}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
