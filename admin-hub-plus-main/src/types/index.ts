// Product Types

// 📏 Size Option with Dual-Tier Pricing (Damodar Traders Price List)
export interface SizeOption {
  size: string;
  price_100_percent: number;  // Standard price
  price_50_percent: number;   // Wholesale/discounted price
  availability?: boolean;
  stock?: number;
}

export interface Specification {
  key: string;
  value: string;
}

export interface ProductImage {
  url: string;
  publicId: string;
  order: number;
}

export interface Product {
  _id: string;
  name: string;
  image: string;
  imagePublicId?: string;
  images?: ProductImage[];
  category: 'pipes' | 'fittings' | 'valves' | 'other' | 'G.I. Fittings' | 'C.I. Fittings' | 'Pipe Nipples' | 'Pipe Clamps' | 'Pipe Bends' | 'Adapters' | 'Washers' | 'Flanges' | 'Tubes' | 'Accessories';
  brand?: string;
  productCode?: string;
  description: string;
  sizeOptions: SizeOption[];
  discount: number;
  material: string;
  pressureRating: string;
  temperatureRange: string;
  standards: string;
  application: string;
  specifications?: Specification[];
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  priceUpdatedAt?: string;
  views?: number;
  wishlistCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  category: string;
  brand?: string;
  productCode?: string;
  description: string;
  sizeOptions: SizeOption[];
  discount?: number;
  material?: string;
  pressureRating?: string;
  temperatureRange?: string;
  standards?: string;
  application?: string;
  specifications?: Specification[];
  featured?: boolean;
  image?: File;
  images?: File[];
}

// Inquiry Types
export type InquiryStatus = 'new' | 'pending' | 'completed';

export interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  attachmentUrl?: string;
  attachmentName?: string;
  // Business Information (Optional)
  companyName?: string;
  businessName?: string;
  businessType?: string;
  location?: string;
  gstNumber?: string;
  customerType?: 'retail' | 'wholesaler' | 'manufacturer' | 'contractor' | 'trader' | 'other';
  source?: 'website' | 'google' | 'social_media' | 'reference';
  status: InquiryStatus;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
  totalEstimatedValue?: number;
  products?: Array<{
    productId: string;
    productName: string;
    productCode?: string;
    quantity: number;
    selectedSize?: string;
    priceType: '100' | '50';
    unitPrice: number;
    totalPrice: number;
  }>;
  // Auto-Collected Data (NEW)
  productId?: string;
  productName?: string;
  productCode?: string;
  selectedSize?: string;
  priceType?: '100' | '50';
  sizePrice100?: number;
  sizePrice50?: number;
  city?: string;
  state?: string;
  country?: string;
  ipAddress?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  userAgent?: string;
  pageSource?: string;
  // Lead Quality & Contact Tracking
  leadQuality?: 'hot' | 'warm' | 'cold';
  contactedAt?: string;
  contactNotes?: string;
  // Reply Information
  replyMessage?: string;
  replySubject?: string;
  repliedAt?: string;
}

// Analytics Types
export interface SizeDistributionItem {
  size: string;
  count: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  totalPrice: number;
  percentage: string;
  products: Array<{
    productId: string;
    name: string;
    price: number;
    category: string;
    material: string;
  }>;
}

export interface SizeDistributionResponse {
  totalSizeOptions: number;
  sizeDistribution: SizeDistributionItem[];
  summary: {
    totalUniqueSizes: number;
    mostCommonSize: SizeDistributionItem | null;
    leastCommonSize: SizeDistributionItem | null;
  };
}

export interface PriceRangeItem {
  range: string;
  count: number;
  percentage: string;
}

export interface PriceRangeResponse {
  priceRanges: PriceRangeItem[];
  statistics: {
    minPrice: number;
    maxPrice: number;
    avgPrice: string;
    medianPrice: string;
    totalProductsWithPrice: number;
  };
}

export interface FilteredProductsResponse {
  totalFound: number;
  filters: {
    size?: string;
    minPrice?: string;
    maxPrice?: string;
    category?: string;
  };
  products: Array<Product & {
    matchingSizeOptions: SizeOption[];
    matchCount: number;
  }>;
}

// User & Auth Types
export interface AdminUser {
  id: string;
  username: string;
}

export interface User {
  _id: string;
  id?: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  users: User[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface WishlistItem {
  _id: string;
  userId: string;
  user?: {
    name: string;
    email: string;
  };
  productId: string;
  product?: {
    name: string;
    image: string;
    category: string;
  };
  addedAt: string;
}

export interface WishlistStats {
  totalWishlistItems: number;
  uniqueUsersWithWishlist: number;
  mostWishedProduct: {
    productId: string;
    name: string;
    count: number;
  } | null;
  averageItemsPerUser: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Stats Types
export interface DashboardStats {
  totalProducts: number;
  totalInquiries: number;
  totalUsers: number;
  newInquiries: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface VirtualTourSettings {
  previewImage: string;
  iframeUrl: string;
  googleMapsUrl: string;
}

export interface ShopPhotoSettings {
  image: string;
  caption: string;
  description: string;
}

export interface BannerSettings {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  placement?: 'home_middle' | 'contact_page' | 'popup';
  bannerType?: 'abstract_split' | 'full_image';
  themeColor?: 'blue' | 'green' | 'red' | 'dark';
  textAlign?: 'left' | 'center' | 'right';
}

export interface SiteSettings {
  logo: string;
  founderImage: string;
  virtualTour: VirtualTourSettings;
  shopPhotos: ShopPhotoSettings[];
  banners: BannerSettings[];
}

