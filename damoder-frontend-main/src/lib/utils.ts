import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to conditionally join classNames
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency values
 */
export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format dates
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Generate slug from string
 */
export function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

import { ENV_CONFIG } from '@/config/environment';

/**
 * Optimize Cloudinary URLs with auto format and quality
 * And handle relative paths for local uploads
 */
export function getOptimizedUrl(url: string | { url?: string } | undefined): string {
  if (!url) return '/placeholder.svg';

  let cleanUrl = '';
  if (typeof url === 'object' && url !== null) {
    cleanUrl = url.url?.trim() || '';
  } else if (typeof url === 'string') {
    cleanUrl = url.trim();
  }

  if (!cleanUrl) return '/placeholder.svg';

  // Handle invalid placeholder strings from DB seeds
  if (cleanUrl.includes('placeholder') && !cleanUrl.endsWith('.svg')) {
    return '/placeholder.svg';
  }

  // Only process Cloudinary URLs
  if (cleanUrl.includes('cloudinary.com') && cleanUrl.includes('/upload/')) {
    // Avoid double transformation
    if (cleanUrl.includes('f_auto') || cleanUrl.includes('q_auto')) return cleanUrl;

    return cleanUrl.replace('/upload/', '/upload/f_auto,q_auto/');
  }

  // Handle local relative uploads (prepend backend base URL)
  let normalizedUrl = cleanUrl.replace(/\\/g, '/'); // Normalize backslashes to forward slashes
  if (!normalizedUrl.startsWith('/') && !normalizedUrl.startsWith('http')) {
    normalizedUrl = '/' + normalizedUrl;
  }
  
  if (normalizedUrl.startsWith('/uploads/') || normalizedUrl.startsWith('/images/')) {
    const baseUrl = ENV_CONFIG.API_URL.replace('/api/v1', '');
    return `${baseUrl}${normalizedUrl}`;
  }

  return cleanUrl;
}