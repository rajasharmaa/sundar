/**
 * 🚀 CLEAN API CLIENT
 * Simple, focused API client for Sundar Corporation catalogue website.
 * Only handles: Products, Categories, Settings, and Inquiries.
 */

import axios, { AxiosInstance } from 'axios';
import { ENV_CONFIG, onApiUrlChange } from '@/config/environment';
import logger from '@/lib/logger';
import { Product } from './endpoints';
import { SiteSettings } from '@/types';
import { mockProducts, mockCategories } from './mockData';

// ============================================
// CONFIGURATION
// ============================================

const API_CONFIG = {
  BASE_URL: ENV_CONFIG.API_URL,
  TIMEOUT: ENV_CONFIG.REQUEST_TIMEOUT || 15000,
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 60 * 1000, // 1 minute cache for GET requests
} as const;

// ============================================
// SIMPLE RESPONSE CACHE
// ============================================

const responseCache = new Map<string, { data: any; timestamp: number }>();

const getCached = (key: string): any | null => {
  const cached = responseCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > API_CONFIG.CACHE_DURATION) {
    responseCache.delete(key);
    return null;
  }
  return cached.data;
};

const setCache = (key: string, data: any) => {
  responseCache.set(key, { data, timestamp: Date.now() });
};

export const clearCache = (pattern?: string): void => {
  if (!pattern) {
    responseCache.clear();
    return;
  }
  responseCache.forEach((_, key) => {
    if (key.includes(pattern)) responseCache.delete(key);
  });
};

// ============================================
// CREATE API CLIENT
// ============================================

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Simple retry on server errors
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config;
      if (!config) return Promise.reject(error);

      // Only retry GET requests on server errors (502, 503, 504)
      const isRetryable =
        config.method?.toUpperCase() === 'GET' &&
        error.response?.status &&
        [502, 503, 504].includes(error.response.status);

      const retryCount = config._retryCount || 0;

      if (isRetryable && retryCount < API_CONFIG.MAX_RETRIES) {
        config._retryCount = retryCount + 1;
        const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, retryCount);
        logger.warn(`Retrying request (${retryCount + 1}/${API_CONFIG.MAX_RETRIES})`, {
          url: config.url,
          status: error.response?.status,
        });
        await new Promise((r) => setTimeout(r, delay));
        return client(config);
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// ============================================
// EXPORT API CLIENT
// ============================================

const apiClient = createApiClient();

// Listen for dynamic API URL updates
onApiUrlChange((newUrl) => {
  apiClient.defaults.baseURL = newUrl;
  (API_CONFIG as any).BASE_URL = newUrl;
  logger.info(`🔄 API client base URL updated to: ${newUrl}`);
});

export { apiClient };
export default apiClient;

// ============================================
// API ENDPOINTS
// ============================================

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const api = {
  products: {
    getAll: () =>
      apiClient
        .get<ApiResponse<Product[]>>('/products')
        .then((res) => (res.data as any).data || res.data),
    getAllRaw: () =>
      apiClient.get<ApiResponse<Product[]>>('/products').then((res) => res.data),
    getPopular: () =>
      apiClient
        .get<ApiResponse<Product[]>>('/products/featured')
        .then((res) => (res.data as any).data || res.data),
    getById: (id: string) =>
      apiClient.get<ApiResponse<Product>>(`/products/${id}`).then((res) => res.data),
    getByCategory: (category: string) =>
      apiClient
        .get<ApiResponse<Product[]>>(`/products?category=${category}`)
        .then((res) => (res.data as any).data || res.data),
    search: (query: string) =>
      apiClient
        .get<ApiResponse<Product[]>>(`/products/search?q=${query}`)
        .then((res) => (res.data as any).data || res.data),
    getSuggestions: (query: string) =>
      apiClient
        .get<ApiResponse<Product[]>>(`/products/suggestions?q=${query}`)
        .then((res) => (res.data as any).data || res.data),
    getRelated: (id: string, limit?: number) =>
      apiClient
        .get<ApiResponse<Product[]>>(`/products/${id}/related?limit=${limit || 4}`)
        .then((res) => (res.data as any).data || res.data),
    getPopularInCategory: (category: string, limit?: number, exclude?: string) =>
      apiClient
        .get<ApiResponse<Product[]>>(
          `/products?category=${category}&limit=${limit || 4}&exclude=${exclude || ''}`
        )
        .then((res) => (res.data as any).data || res.data),
    trackView: (id: string) =>
      apiClient.post(`/products/${id}/view`).then((res) => res.data),
  },
  categories: {
    getAll: () =>
      apiClient
        .get<ApiResponse<any[]>>('/categories')
        .then((res) => (res.data as any).data || res.data),
  },
  inquiries: {
    submit: (data: any) =>
      apiClient.post<ApiResponse<any>>('/inquiries', data).then((res) => res.data),
    getUserInquiries: () =>
      apiClient.get<ApiResponse<any>>('/inquiries/user').then((res) => {
        const result = res.data;
        return Array.isArray(result) ? result : (result as any)?.data || [];
      }),
  },
  // Kept for backward compat - but these are no-ops since no auth system
  auth: {
    login: (_data: any) => Promise.resolve({ success: false, message: 'Auth not available' }),
    register: (_data: any) => Promise.resolve({ success: false, message: 'Auth not available' }),
    logout: () => Promise.resolve({ success: true }),
    status: () => Promise.resolve({ success: false, message: 'Not authenticated' } as any),
    refreshToken: () => Promise.resolve({ success: false }),
    checkEmail: (_email: string) => Promise.resolve({ success: false }),
    forgotPassword: (_email: string) => Promise.resolve({ success: false }),
    resetPassword: (_data: any) => Promise.resolve({ success: false }),
    googleLogin: () => {},
  },
  user: {
    getProfile: () => Promise.resolve({ success: false } as any),
    updateProfile: (_data: any) => Promise.resolve({ success: false } as any),
    getRecentlyViewed: (_limit?: number) => Promise.resolve([] as Product[]),
    trackRecentlyViewed: (_productId: string) =>
      Promise.resolve({ success: true, message: 'Tracked' }),
    clearRecentlyViewed: () => Promise.resolve({ success: true, message: 'Cleared' }),
  },
  wishlist: {
    get: () => Promise.resolve({ items: [], count: 0 } as any),
    add: (productId: string) =>
      Promise.resolve({
        items: [mockProducts.find((p) => p.id === productId)!],
        count: 1,
      } as any),
    remove: (_productId: string) => Promise.resolve({ items: [], count: 0 } as any),
  },
  rfq: {
    get: () => apiClient.get<ApiResponse<any>>('/rfq').then((res) => res.data),
    sync: (items: any[]) =>
      apiClient.post<ApiResponse<any>>('/rfq/sync', { items }).then((res) => res.data),
  },
  metrics: {
    getHealth: () => Promise.resolve({ success: true, status: 'ok' }),
    getStats: () =>
      Promise.resolve({
        success: true,
        data: {
          totalProducts: 50,
          totalClients: 5000,
          testedRate: '100%',
          certification: 'ISO 9001:2015',
        },
      }),
  },
  settings: {
    get: () =>
      apiClient.get<ApiResponse<SiteSettings>>('/settings').then((res) => res.data),
    update: (data: SiteSettings) =>
      apiClient
        .put<{ success: boolean; message: string; data: SiteSettings }>('/settings', data)
        .then((res) => res.data),
    upload: (formData: FormData) =>
      apiClient
        .post<{ success: boolean; url: string; publicId: string }>(
          '/settings/upload',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then((res) => res.data),
  },
  client: apiClient,
};

// Export types
export type { Product } from './endpoints';

// Backward compatibility exports
export { api as secureApi };
export const secureApiUtils = {
  clearAuthState: () => {
    localStorage.clear();
    sessionStorage.clear();
  },
};