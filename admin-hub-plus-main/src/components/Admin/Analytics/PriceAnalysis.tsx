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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { CHART_COLORS } from '@/utils/constants';

export function PriceAnalysis() {
  const { data, isLoading } = useQuery({
    queryKey: ['price-range'],
    queryFn: analyticsService.getPriceRange,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No price data available
      </div>
    );
  }

  const chartData = data.priceRanges.map((item) => ({
    name: `₹${item.range}`,
    count: item.count,
    percentage: parseFloat(item.percentage),
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="analytics-stat analytics-stat-blue">
          <div className="text-sm text-info font-medium">Min Price</div>
          <div className="text-2xl font-bold">{formatCurrency(data.statistics.minPrice)}</div>
        </div>
        <div className="analytics-stat analytics-stat-green">
          <div className="text-sm text-success font-medium">Max Price</div>
          <div className="text-2xl font-bold">{formatCurrency(data.statistics.maxPrice)}</div>
        </div>
        <div className="analytics-stat analytics-stat-purple">
          <div className="text-sm font-medium" style={{ color: 'hsl(270, 60%, 50%)' }}>Avg Price</div>
          <div className="text-2xl font-bold">{formatCurrency(parseFloat(data.statistics.avgPrice))}</div>
        </div>
        <div className="analytics-stat analytics-stat-orange">
          <div className="text-sm font-medium" style={{ color: 'hsl(36, 100%, 45%)' }}>Median Price</div>
          <div className="text-2xl font-bold">{formatCurrency(parseFloat(data.statistics.medianPrice))}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-card border rounded-lg p-6">
          <h4 className="font-semibold mb-4">Price Range Distribution</h4>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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

        {/* Pie Chart */}
        <div className="bg-card border rounded-lg p-6">
          <h4 className="font-semibold mb-4">Price Distribution (Pie)</h4>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.filter((d) => d.count > 0)}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                  labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-card border rounded-lg p-6">
        <h4 className="font-semibold mb-4">Summary</h4>
        <p className="text-muted-foreground">
          Total products with pricing: <strong className="text-foreground">{data.statistics.totalProductsWithPrice}</strong>
        </p>
      </div>
    </div>
  );
}
