import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CHART_COLORS } from '@/utils/constants';
import { MapPin, Building2, TrendingUp, Eye } from 'lucide-react';

export function AnalyticsCharts() {
  // Fetch inquiries by city
  const { data: cityData, isLoading: cityLoading } = useQuery({
    queryKey: ['inquiries-by-city-chart'],
    queryFn: () => analyticsService.getInquiriesByLocation('city', 10),
    staleTime: 60000,
  });

  // Fetch inquiries by company
  const { data: companyData, isLoading: companyLoading } = useQuery({
    queryKey: ['inquiries-by-company-chart'],
    queryFn: () => analyticsService.getInquiriesByCompany(10),
    staleTime: 60000,
  });

  // Fetch inquiry trends
  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: ['inquiry-trends-chart'],
    queryFn: () => analyticsService.getInquiryTrends(30),
    staleTime: 60000,
  });

  // Fetch top viewed products
  const { data: viewedData, isLoading: viewedLoading } = useQuery({
    queryKey: ['top-viewed-products-chart'],
    queryFn: () => analyticsService.getTopViewedProducts(10),
    staleTime: 60000,
  });

  const isLoading = cityLoading || companyLoading || trendLoading || viewedLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Transform city data for chart
  const cityChartData = cityData?.map((item: any) => ({
    name: item.location,
    inquiries: item.count,
  })) || [];

  // Transform company data for chart
  const companyChartData = companyData?.map((item: any) => ({
    name: item.companyName,
    inquiries: item.inquiryCount,
  })) || [];

  // Transform trend data for chart
  const trendChartData = trendData?.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    inquiries: item.count,
    hotLeads: item.hotLeads,
  })) || [];

  // Transform viewed products data for chart
  const viewedChartData = viewedData?.map((item: any) => ({
    name: item.name?.length > 20 ? `${item.name.substring(0, 20)}...` : item.name,
    views: item.views,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Row 1: Inquiries by City & Company */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inquiries by City */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-green-600" />
              Top Cities by Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cityChartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No location data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cityChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                  <Bar 
                    dataKey="inquiries" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Inquiries by Company */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="w-5 h-5 text-purple-600" />
              Top Companies by Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {companyChartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No company data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={companyChartData}
                  layout="vertical"
                  margin={{ left: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis 
                    type="category" 
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                  <Bar 
                    dataKey="inquiries" 
                    fill="#a855f7" 
                    radius={[0, 4, 4, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Inquiry Trends & Top Viewed Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inquiry Trends Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Inquiry Trends (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendChartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No trend data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="inquiries" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#22c55e' }}
                    activeDot={{ r: 6 }}
                    name="Total Inquiries"
                    animationDuration={1000}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hotLeads" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#ef4444' }}
                    activeDot={{ r: 6 }}
                    name="Hot Leads"
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Viewed Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="w-5 h-5 text-orange-600" />
              Most Viewed Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewedChartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No product view data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={viewedChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                  <Bar 
                    dataKey="views" 
                    fill="#f97316" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
