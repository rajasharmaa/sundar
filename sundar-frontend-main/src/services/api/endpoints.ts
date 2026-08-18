// 📍 API ENDPOINTS
// Centralized endpoint definitions for all API calls

// Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  STATUS: `${API_BASE_URL}/auth/status`,
  CHECK_EMAIL: `${API_BASE_URL}/auth/check-email`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  GOOGLE_LOGIN: `${API_BASE_URL}/auth/google`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`,
  CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`
} as const;

// Products endpoints
export const PRODUCTS_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/products`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/products/${id}`,
  GET_BY_CATEGORY: (category: string) => `${API_BASE_URL}/products/category/${category}`,
  SEARCH: `${API_BASE_URL}/products/search`,
  GET_SUGGESTIONS: `${API_BASE_URL}/products/search/suggestions`,
  GET_POPULAR: `${API_BASE_URL}/products/popular`
} as const;

// Users endpoints
export const USERS_ENDPOINTS = {
  GET_ME: `${API_BASE_URL}/users/me`,
  GET_PROFILE: `${API_BASE_URL}/users/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/users/profile`
} as const;

// Inquiries endpoints
export const INQUIRIES_ENDPOINTS = {
  SUBMIT: `${API_BASE_URL}/inquiries`,
  GET_USER_INQUIRIES: `${API_BASE_URL}/inquiries/user`,
  GET_ALL: `${API_BASE_URL}/inquiries`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/inquiries/${id}`,
  UPDATE_STATUS: (id: string) => `${API_BASE_URL}/inquiries/${id}/status`
} as const;

// Wishlist endpoints
export const WISHLIST_ENDPOINTS = {
  GET: `${API_BASE_URL}/wishlist`,
  ADD: `${API_BASE_URL}/wishlist`,
  REMOVE: (id: string) => `${API_BASE_URL}/wishlist/${id}`
} as const;

// Metrics endpoints
export const METRICS_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/metrics/health`,
  STATS: `${API_BASE_URL}/metrics/stats`
} as const;

// Export all endpoints grouped by feature
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  PRODUCTS: PRODUCTS_ENDPOINTS,
  USERS: USERS_ENDPOINTS,
  INQUIRIES: INQUIRIES_ENDPOINTS,
  WISHLIST: WISHLIST_ENDPOINTS,
  METRICS: METRICS_ENDPOINTS
} as const;

// Utility functions for endpoint construction
export const buildQueryString = (params: Record<string, unknown>): string => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(key, String(item)));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  return queryParams.toString();
};

export const buildUrlWithParams = (baseUrl: string, params: Record<string, unknown>): string => {
  const queryString = buildQueryString(params);
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

// Type definitions for API responses
export interface ApiResponse<T = unknown> {
  data?: T;
  success?: boolean;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Common error response structure
export interface ApiError {
  message: string;
  error?: string;
  status?: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Size option type with dual-tier pricing
export interface SizeOption {
  size: string;
  price_100_percent: number;  // Standard price (100%)
  price_50_percent: number;   // Wholesale/discounted price (50%)
  availability?: boolean;
  stock?: number;
}

// Specification type
export interface Specification {
  key: string;
  value: string;
}

// Product type definition
export interface Product {
  id: string;
  _id?: string;
  name: string;
  category: string;
  brand?: string;
  productCode?: string;
  image: string;
  images?: string[];
  description: string;
  shortDescription?: string;
  sizeOptions: SizeOption[];
  specifications?: Specification[];
  material?: string;
  bagSize?: string;
  weight?: string;
  printType?: string;
  closure?: string;
  discount?: number;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  priceUpdatedAt?: string;
  views?: number;
  wishlistCount?: number;
  themeColor?: string;
  external?: boolean;
  affiliateLink?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  benefits?: { title: string; desc?: string; image?: string; }[];
  industries?: { name: string; desc?: string; image?: string; }[];
  faqs?: { q: string; a: string; }[];
  createdAt?: string;
  updatedAt?: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
}