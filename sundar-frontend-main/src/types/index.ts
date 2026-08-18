// Application-wide type definitions

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user';
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SizeOption {
  size: string;
  price_100_percent: number;  // Standard price (100%)
  price_50_percent: number;   // Wholesale/discounted price (50%)
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
  id: string;
  _id?: string;
  name: string;
  category: string | Category;
  brand?: string;
  productCode?: string;
  images: string[];
  image?: string;
  description: string;
  shortDescription?: string;
  sizeOptions: SizeOption[];
  specifications?: Record<string, string>;
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
  benefits?: { title: string; desc?: string; image?: string; }[];
  industries?: { name: string; desc?: string; image?: string; }[];
  faqs?: { q: string; a: string; }[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  selectedSize?: string;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
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
  manufacturingImage?: string;
  aboutUsBanner?: string;
  contactUsBanner?: string;
  productsBanner?: string;
}