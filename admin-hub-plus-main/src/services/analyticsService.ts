import api from './api';
import type { 
  SizeDistributionResponse, 
  PriceRangeResponse, 
  FilteredProductsResponse,
  DashboardStats 
} from '@/types';

export interface FilterParams {
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
}

export const analyticsService = {
  // Get dashboard stats
  async getStats(): Promise<DashboardStats> {
    const response = await api.get('/admin/stats');
    return (response.data as any).data || {} as DashboardStats;
  },

  // Get size distribution analytics
  async getSizeDistribution(): Promise<SizeDistributionResponse> {
    const response = await api.get('/admin/products/analytics/size-distribution');
    return response.data;
  },

  // Get price range analytics
  async getPriceRange(): Promise<PriceRangeResponse> {
    const response = await api.get('/admin/products/analytics/price-range');
    return response.data;
  },

  // Filter products by size and price
  async filterBySize(filters: FilterParams): Promise<FilteredProductsResponse> {
    const params = new URLSearchParams();
    
    if (filters.size) params.append('size', filters.size);
    if (filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
    if (filters.category) params.append('category', filters.category);

    const response = await api.get<FilteredProductsResponse>(
      `/admin/products/filter/by-size?${params.toString()}`
    );
    return response.data;
  },

  // 🎯 NEW: Get inquiries by location (city, state, country)
  async getInquiriesByLocation(groupBy: 'city' | 'state' | 'country' = 'city', limit: number = 10) {
    const response = await api.get(`/admin/analytics/inquiries/location?groupBy=${groupBy}&limit=${limit}`);
    return (response.data as any).data || [];
  },

  // 🎯 NEW: Get inquiries by company
  async getInquiriesByCompany(limit: number = 10) {
    const response = await api.get(`/admin/analytics/inquiries/company?limit=${limit}`);
    return (response.data as any).data || [];
  },

  // 🎯 NEW: Get top viewed products
  async getTopViewedProducts(limit: number = 10) {
    const response = await api.get(`/admin/analytics/products/top-viewed?limit=${limit}`);
    return (response.data as any).data || [];
  },

  // 🎯 NEW: Get inquiry trends over time
  async getInquiryTrends(days: number = 30) {
    const response = await api.get(`/admin/analytics/inquiries/trends?days=${days}`);
    return (response.data as any).data || [];
  },

  // 🎯 NEW: Get popular categories
  async getPopularCategories(limit: number = 10) {
    const response = await api.get(`/admin/analytics/categories/popular?limit=${limit}`);
    return (response.data as any).data || [];
  },

  // 🎯 NEW: Get most inquired products
  async getMostInquiredProducts(limit: number = 10) {
    const response = await api.get(`/admin/stats/most-inquired-products?limit=${limit}`);
    return (response.data as any).data || [];
  },

  // 📊 NEW: Get product size analytics
  async getProductSizeAnalytics() {
    const response = await api.get(`/admin/analytics/products/size-details`);
    return response.data;
  },
};
