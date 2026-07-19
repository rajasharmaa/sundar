import api from './api';
import type { User, UsersResponse } from '@/types';

export const userService = {
  /**
   * Get all registered users
   */
  async getAll(): Promise<User[]> {
    const response = await api.get('/admin/users');
    return (response.data as UsersResponse).users || [];
  },

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    const response = await api.get(`/admin/users/${id}`);
    return response.data as User;
  },

  /**
   * Update user status (active/inactive)
   */
  async updateStatus(id: string, isActive: boolean): Promise<void> {
    await api.patch(`/admin/users/${id}/status`, { isActive });
  },

  /**
   * Update user role
   */
  async updateRole(id: string, role: 'user' | 'admin'): Promise<void> {
    await api.patch(`/admin/users/${id}/role`, { role });
  },

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },

  /**
   * Get user statistics
   */
  async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    newUsersThisMonth: number;
  }> {
    const response = await api.get('/admin/users/stats');
    return response.data as any;
  }
};
