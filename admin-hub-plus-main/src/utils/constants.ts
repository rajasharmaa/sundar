// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
  { value: 'pipes', label: 'Pipes' },
  { value: 'fittings', label: 'Fittings' },
  { value: 'valves', label: 'Valves' },
  { value: 'gi-fittings', label: 'G.I Fittings' },
  { value: 'ci-fittings', label: 'C.I Fittings' },
  { value: 'pvc-fittings', label: 'PVC Fittings' },
  { value: 'ms-fittings', label: 'MS Fittings' },
  { value: 'ss-fittings', label: 'SS Fittings' },
  { value: 'gi-pipes', label: 'G.I Pipes' },
  { value: 'ss-pipes', label: 'SS Pipes' },
  { value: 'column-pipes', label: 'Column Pipes' },
  { value: 'ball-valves', label: 'Ball Valves' },
  { value: 'check-valves-nrv', label: 'Check Valves (NRV)' },
  { value: 'foot-valves', label: 'Foot Valves' },
  { value: 'air-valves', label: 'Air Valves' },
  { value: 'clamps-and-clips', label: 'Clamps & Clips' },
  { value: 'hose-clips', label: 'Hose Clips' },
  { value: 'u-clips', label: 'U-Clips' },
  { value: 'taiwan-clips', label: 'Taiwan Clips' },
  { value: 'hdpe-clips', label: 'HDPE Clips' },
  { value: 'flanges', label: 'Flanges' },
  { value: 'ci-flanges', label: 'CI Flanges' },
  { value: 'pvc-flanges', label: 'PVC Flanges' },
  { value: 'adjustable-flanges', label: 'Adjustable Flanges' },
  { value: 'borewell-accessories', label: 'Borewell Accessories' },
  { value: 'hose-and-connectors', label: 'Hose & Connectors' },
  { value: 'hose-nipples', label: 'Hose Nipples' },
  { value: 'hose-connectors', label: 'Hose Connectors' },
  { value: 'jet-connectors', label: 'Jet Connectors' },
  { value: 'socket-nipples', label: 'Socket Nipples' },
  { value: 'bore-caps', label: 'Bore Caps' },
  { value: 'jet-pump-accessories', label: 'Jet Pump Accessories' },
  { value: 'group-fittings', label: 'Group Fittings' },
  { value: 'column-pipe-parts', label: 'Column Pipe Parts' },
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
