import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { Package, MessageSquare, Users, AlertCircle, RefreshCw, BarChart3, Eye, MapPin, Building, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import type { AdminTab } from './AdminTabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalyticsCharts } from './Dashboard/AnalyticsCharts';
import { motion } from 'framer-motion';

interface DashboardProps {
  onTabChange: (tab: AdminTab) => void;
}

// Type definitions to resolve TypeScript any errors
interface LocationData {
  location: string;
  companyCount: number;
  count: number;
}

interface CompanyData {
  companyName: string;
  locationCount: number;
  inquiryCount: number;
}

interface TopProduct {
  _id: string;
  name: string;
  image?: string;
  category: string;
  views: number;
  featured?: boolean;
}

interface InquiredProduct {
  productId: string;
  productName: string;
  image?: string;
  lastInquiry: string;
  inquiryCount: number;
}

export function Dashboard({ onTabChange }: DashboardProps) {
  const { data: stats, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: analyticsService.getStats,
    staleTime: 30000,
  });

  const { data: locationData, isLoading: isLocationLoading } = useQuery({
    queryKey: ['inquiries-by-location'],
    queryFn: () => analyticsService.getInquiriesByLocation('city', 5),
    staleTime: 60000,
  });

  const { data: companyData, isLoading: isCompanyLoading } = useQuery({
    queryKey: ['inquiries-by-company'],
    queryFn: () => analyticsService.getInquiriesByCompany(5),
    staleTime: 60000,
  });

  const { data: topProducts, isLoading: isProductsLoading } = useQuery({
    queryKey: ['top-viewed-products'],
    queryFn: () => analyticsService.getTopViewedProducts(5),
    staleTime: 60000,
  });

  const { data: mostInquiredProducts, isLoading: isInquiredLoading } = useQuery({
    queryKey: ['most-inquired-products'],
    queryFn: () => analyticsService.getMostInquiredProducts(5),
    staleTime: 60000,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="space-y-8 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Executive Dashboard</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Platform overview and real-time analytics</p>
        </div>
        <Button
          onClick={() => refetch()}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-none shadow-none font-bold rounded-xl"
          disabled={isRefetching}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          {isRefetching ? 'Syncing...' : 'Sync Data'}
        </Button>
      </div>

      {/* Stats Grid - Bento Style */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Catalog"
          value={stats?.totalProducts ?? 0}
          description="Active products in inventory"
          variant="products"
          icon={Package}
          isLoading={isLoading}
          trend={4.2}
        />
        <StatCard
          title="Total Inquiries"
          value={stats?.totalInquiries ?? 0}
          description="Customer leads received"
          variant="inquiries"
          icon={MessageSquare}
          isLoading={isLoading}
          trend={12.5}
        />
        <StatCard
          title="Registered Users"
          value={stats?.totalUsers ?? 0}
          description="Verified B2B accounts"
          variant="users"
          icon={Users}
          isLoading={isLoading}
          trend={2.4}
        />
        <StatCard
          title="Pending Action"
          value={stats?.newInquiries ?? 0}
          description="Inquiries needing response"
          variant="alerts"
          icon={AlertCircle}
          isLoading={isLoading}
        />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column - Detailed Analytics & Insights */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Main Chart Area */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Performance Analytics
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Traffic and engagement metrics over time</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <AnalyticsCharts />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Products by View */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-emerald-600" />
                    Trending Products
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Most viewed catalog items</p>
                </div>
              </div>
              
              <div className="space-y-4 flex-1">
                {isProductsLoading ? (
                  Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
                ) : (
                  topProducts?.slice(0, 4).map((product: TopProduct, index: number) => (
                    <div key={product._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                        <img src={product.image || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-0 left-0 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg">{index + 1}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{product.name}</p>
                        <p className="text-xs text-slate-500 font-medium truncate">{product.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-emerald-600 flex items-center justify-end gap-1">
                          {product.views} <Eye className="w-3 h-3" />
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Button onClick={() => onTabChange('products')} variant="ghost" className="w-full mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold text-sm">
                View All Products <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>

            {/* Most Inquired Products */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    High-Intent Products
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Generating the most inquiries</p>
                </div>
              </div>
              
              <div className="space-y-4 flex-1">
                {isInquiredLoading ? (
                  Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
                ) : (
                  mostInquiredProducts?.slice(0, 4).map((product: InquiredProduct, index: number) => (
                    <div key={product.productId} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                        <img src={product.image || '/placeholder.svg'} alt={product.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-0 left-0 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg">{index + 1}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{product.productName}</p>
                        <p className="text-xs text-slate-500 font-medium truncate">Lead: {new Date(product.lastInquiry).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                          {product.inquiryCount} leads
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Button onClick={() => onTabChange('inquiries')} variant="ghost" className="w-full mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold text-sm">
                Review Inquiries <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Right Column - Secondary Data & Action Widgets */}
        <div className="space-y-6">
          
          {/* Quick Actions Widget */}
          <motion.div variants={itemVariants} className="bg-slate-900 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-slate-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
            <h3 className="text-lg font-bold text-white mb-4 relative z-10">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <button onClick={() => onTabChange('products')} className="flex flex-col items-center justify-center gap-2 p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all duration-300 text-white group">
                <Package className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Manage Products</span>
              </button>
              <button onClick={() => onTabChange('inquiries')} className="flex flex-col items-center justify-center gap-2 p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all duration-300 text-white group">
                <MessageSquare className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Review Leads</span>
              </button>
              <button onClick={() => onTabChange('bulk-prices')} className="col-span-2 flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all duration-300 text-white group">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-bold">Update Bulk Pricing</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </motion.div>

          {/* Demographics: Top Companies */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-600" />
                Top B2B Companies
              </h3>
            </div>
            <div className="space-y-3">
              {isCompanyLoading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)
              ) : (
                companyData?.slice(0, 4).map((company: CompanyData, index: number) => (
                  <div key={company.companyName} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{company.companyName}</p>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{company.locationCount} locations</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-purple-700">{company.inquiryCount}</span>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Reqs</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Demographics: Top Cities */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                Geographic Heat
              </h3>
            </div>
            <div className="space-y-3">
              {isLocationLoading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)
              ) : (
                locationData?.slice(0, 4).map((loc: LocationData, index: number) => (
                  <div key={loc.location} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-rose-200 hover:bg-rose-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{loc.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-rose-700">{loc.count}</span>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Leads</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* System Insights Alert */}
          <motion.div variants={itemVariants} className="bg-amber-50 rounded-2xl p-5 border border-amber-200 relative overflow-hidden">
            <div className="flex gap-3 relative z-10">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">Price Tracking Active</h4>
                <p className="text-xs text-amber-700 mt-1 font-medium leading-relaxed">System is monitoring product prices. Remember to update bulk pricing tiers when making adjustments.</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
