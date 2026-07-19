import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/authService';
import type { AdminUser, AuthState, LoginCredentials } from '@/types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Securely initialize state from localStorage
  const [state, setState] = useState<AuthState>(() => {
    const userStr = localStorage.getItem('admin_user');
    
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        // Basic validation of the stored user object
        if (parsedUser && typeof parsedUser === 'object' && parsedUser.username) {
          return {
            isAuthenticated: true,
            user: parsedUser,
            isLoading: false,
          };
        }
      } catch (e) {
        // Clear corrupt storage
        localStorage.removeItem('admin_user');
      }
    }
    return {
      isAuthenticated: false,
      user: null,
      isLoading: true,
    };
  });

  // Token refresh interval (refresh every 6 hours to prevent expiration)
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const refreshInterval = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
    
    const refreshTimer = setInterval(async () => {
      try {
        await authService.refreshToken();
      } catch (error) {
        // Auto-refresh failed silently
      }
    }, refreshInterval);

    return () => clearInterval(refreshTimer);
  }, [state.isAuthenticated]);

  const checkAuth = useCallback(async () => {
    const hasSession = !!localStorage.getItem('admin_user');
    
    try {
      // If we don't have local state yet, show loading spinner
      if (!state.isAuthenticated) {
        setState((prev) => ({ ...prev, isLoading: true }));
      }
      
      const status = await authService.checkStatus();
      
      if (status.authenticated && status.username) {
        const verifiedUser = { id: 'admin', username: status.username };
        localStorage.setItem('admin_user', JSON.stringify(verifiedUser));
        setState({
          isAuthenticated: true,
          user: verifiedUser,
          isLoading: false,
        });
      } else {
        // Safe clear if backend explicitly says not authenticated
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_refresh_token');
        setState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
    } catch (error: any) {
      // Differentiate between transient network/server issues and definitive session expiration
      const status = error.response?.status;
      const isNetworkOrServerError = !status || status >= 500 || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED';
      
      if (isNetworkOrServerError && hasSession) {
        // Server is sleeping or connection dropped; preserve user's local session for usability
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      } else {
        // Definite invalid/expired session, securely clean storage and state
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_refresh_token');
        setState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
    }
  }, [state.isAuthenticated]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      await authService.login(credentials);
      await checkAuth();
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue with logout even if API fails
    } finally {
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh_token');
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
