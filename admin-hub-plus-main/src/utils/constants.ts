// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Admin Routes
export const ADMIN_ROUTES = {
  LOGIN: '/admin-login',
  PANEL: '/admin',
  DASHBOARD: '/admin/dashboard',
  PRODUCTS: '/admin/products',
  ANALYTICS: '/admin/analytics',
  INQUIRIES: '/admin/inquiries',
} as const;

// Product Categories
export const PRODUCT_CATEGORIES = [
  { value: 'hdpe-bags', label: 'HDPE Bags' },
  { value: 'pp-bags', label: 'PP Bags' },
  { value: 'bopp-bags', label: 'BOPP Bags' },
  { value: 'polypropylene-bulk-bags', label: 'Polypropylene Bulk Bags' },
  { value: 'jute-bags', label: 'Jute Bags' },
  { value: 'packing-material', label: 'Packing Material' },
  { value: 'other', label: 'Other' }
] as const;

// Inquiry Statuses
export const INQUIRY_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
] as const;

// Inquiry Filters
export const INQUIRY_FILTERS = [
  { value: 'all', label: 'All Inquiries' },
  { value: 'new', label: 'New' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'unread', label: 'Unread' },
] as const;

// Price Range Labels
export const PRICE_RANGES = [
  '0-100',
  '101-500',
  '501-1000',
  '1001-5000',
  '5001-10000',
  '10000+',
] as const;

// Chart Colors
export const CHART_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#14b8a6', // teal
] as const;
