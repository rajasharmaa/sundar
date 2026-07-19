import api from './api';
import type { LoginCredentials, AdminUser } from '@/types';

export interface AuthStatusResponse {
  authenticated: boolean;
  username?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  refreshToken: string;
  redirect: string;
}

export const authService = {
  // Check authentication status
  async checkStatus(): Promise<AuthStatusResponse> {
    const response = await api.get<AuthStatusResponse>('/admin/status');
    return response.data;
  },

  // Login
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/admin/login', credentials);
    return response.data;
  },

  // Logout
  async logout(): Promise<{ message: string; redirect: string }> {
    try {
      const response = await api.post('/admin/logout');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Refresh access token using refresh token cookie
  async refreshToken(): Promise<string | null> {
    try {
      const response = await api.post('/admin/refresh-token');
      
      if (response.data.success && response.data.token) {
        return response.data.token;
      }
      
      return null;
    } catch (error: any) {
      const status = error.response?.status;
      const isNetworkOrServerError = !status || status >= 500 || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED';
      
      if (!isNetworkOrServerError) {
        return null;
      }
      
      // Re-throw network or server errors so the caller knows it was a transient error
      throw error;
    }
  },

  // Get current user from session
  async getCurrentUser(): Promise<AdminUser | null> {
    try {
      const status = await this.checkStatus();
      if (status.authenticated && status.username) {
        return {
          id: 'admin',
          username: status.username,
        };
      }
      return null;
    } catch {
      return null;
    }
  },
};
