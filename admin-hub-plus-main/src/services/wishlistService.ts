import api from './api';
import type { WishlistItem, WishlistStats } from '@/types';

export const wishlistService = {
  /**
   * Get all wishlist items across all users
   */
  async getAll(): Promise<WishlistItem[]> {
    const response = await api.get('/admin/wishlists');
    return (response.data as any).wishlists || [];
  },

  /**
   * Get wishlist statistics
   */
  async getStats(): Promise<WishlistStats> {
    const response = await api.get('/admin/wishlists/stats');
    return (response.data as any).data || {} as WishlistStats;
  },

  /**
   * Get wishlists by user ID
   */
  async getByUser(userId: string): Promise<WishlistItem[]> {
    const response = await api.get(`/admin/wishlists/user/${userId}`);
    return response.data as WishlistItem[];
  },

  /**
   * Get most wished products
   */
  async getMostWished(limit = 10): Promise<Array<{ productId: string; name: string; count: number }>> {
    const response = await api.get(`/admin/wishlists/most-wished?limit=${limit}`);
    return (response.data as any).data || [];
  }
};
