/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { secureApi, secureApiUtils, setAuthStateRef } from '../services/api/api-client';
import logger from '@/lib/logger';
import sessionManager from '@/lib/session-manager';
import { useToast } from '@/hooks/use-toast';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
interface User {
  id: string;
  _id?: string;  // MongoDB ObjectId
  email: string;
  name: string;
  role: 'user';
  avatar?: string;
  phone?: string;
  createdAt?: string;
  avatarColor?: string;
  avatarIcon?: string;
  businessName?: string;
  businessType?: string;
  themeColor?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authReady: boolean;
  initializing: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: () => Promise<void>;
  checkAuth: (force?: boolean) => Promise<boolean>;
  checkEmailExists: (email: string) => Promise<boolean>;
  error: string | null;
  serverStatus: 'ready' | 'waking' | 'error';
  resetError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize from session manager if available (Enhanced Cross-Origin Resilience)
  const [user, setUser] = useState<User | null>(() => {
    try {
      return sessionManager.loadSession();
    } catch {
      return null;
    }
  });

  const [authReady, setAuthReady] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [serverStatus, setServerStatus] = useState<'ready' | 'waking' | 'error'>('ready');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!user);
  const [error, setError] = useState<string | null>(null);

  // Sync user state to session manager and global auth state ref
  useEffect(() => {
    setAuthStateRef({ isAuthenticated: !!user });
    if (user) {
      sessionManager.saveSession(user);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [user]);

  // ---------------------------------------------------------------------------
  // Core Auth Actions
  // ---------------------------------------------------------------------------

  const lastAuthCheckRef = useRef<number>(0);
  // 🔧 FIX M1-2: Use a ref to track isAuthenticated so checkAuth closure is always stable
  const isAuthenticatedRef = useRef<boolean>(!!user);
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  const checkAuth = useCallback(async (force = false): Promise<boolean> => {
    const now = Date.now();
    if (!force && now - lastAuthCheckRef.current < 5000) { // Throttled to 5 seconds
      return isAuthenticatedRef.current; // ✅ Always reads current value via ref
    }

    lastAuthCheckRef.current = now;

    try {
      // Primary check for tokens in cookies or localStorage
      const hasTokens = document.cookie.includes('accessToken=') ||
        document.cookie.includes('refreshToken=') ||
        !!localStorage.getItem('auth_token');

      if (!hasTokens) {
        setUser(null);
        return false;
      }

      const response = await secureApi.auth.status();
      const userData = (response as any)?.user || (response as any)?.data?.user || response;

      if (userData && ((userData as any).id || (userData as any)._id || (userData as any).email)) {
        setUser(userData as User);
        setIsAuthenticated(true);
        return true;
      }

      setUser(null);
      return false;
    } catch (err: any) {
      const status = err.response?.status;

      // Keep existing session on network or server errors
      if (!status || status >= 500 || err.code === 'NETWORK_ERROR') {
        return isAuthenticatedRef.current; // ✅ Ref, not stale closure
      }

      // Clear session only on definitive auth failures
      if (status === 401 || status === 403) {
        logger.debug('checkAuth: Auth failure detected, returning false', { status });
        return false;
      }

      return isAuthenticatedRef.current; // ✅ Ref, not stale closure
    }
  }, []); // ✅ Stable reference — no longer depends on isAuthenticated

  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await secureApi.auth.login({ email, password, rememberMe });
      const userData = 'user' in response ? response.user : response;
      const accessToken = 'accessToken' in response ? response.accessToken : undefined;
      const refreshToken = 'refreshToken' in response ? (response as any).refreshToken : undefined;

      if (userData) {
        setUser(userData as User);
        setIsAuthenticated(true);
        if (accessToken) {
          localStorage.setItem('auth_token', accessToken as string);
        }
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken as string);
        }
        logger.info('✅ Login successful', { userId: (userData as any).id || (userData as any)._id });
        // 🔧 M1-10 prep: Notify SocketContext via event (replaces 2s polling)
        window.dispatchEvent(new Event('auth:login-success'));
      }
    } catch (err: any) {
      logger.error('Login failed', err);
      const msg = err.response?.status === 429 ? 'Too many attempts. Please try again later.' :
        (err.response?.status >= 500 ? 'Service unavailable. Please retry shortly.' : 'Invalid email or password');
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      await secureApi.auth.register(data);
      toast({
        title: 'Registration Successful!',
        description: 'Please log in with your new account.',
        className: 'bg-green-600 text-white border-0',
      });
      navigate('/login');
    } catch (err: any) {
      logger.error('Registration failed', err);
      const msg = err.response?.status === 409 ? 'Email already exists.' : (err.message || 'Registration failed.');
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await secureApi.auth.logout();
    } catch (err) {
      logger.error('Logout API failed', err);
    } finally {
      setUser(null);
      // 🔐 Clear only auth-related data, preserve other localStorage
      sessionManager.clearSession();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_tokens_v2');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('has_session');
      secureApiUtils.clearAuthState();
      setIsLoading(false);
      // 🔧 M1-1 FIX: Use only navigate() — removed window.location.href which caused double redirect
      navigate('/login');
    }
  };

  const googleLogin = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');
      // 🔧 M1-4 FIX: Corrected path from /auth/google to /api/v1/auth/google
      window.location.href = `${apiUrl}/api/v1/auth/google`;
    } catch (err) {
      setError('Failed to initiate Google Login');
      logger.error(err);
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const res = await secureApi.auth.checkEmail(email);
      return (res as any)?.exists || false;
    } catch (err) {
      return false;
    }
  };

  const resetError = () => setError(null);

  // Unified Initialization
  useEffect(() => {
    const init = async () => {
      setInitializing(true);
      try {
        const hasTokens = document.cookie.includes('accessToken=') ||
          document.cookie.includes('refreshToken=') ||
          !!localStorage.getItem('auth_token');

        if (hasTokens) {
          await checkAuth(true);
        }
      } catch (err) {
        logger.warn('Auth initialization error', err);
      } finally {
        setInitializing(false);
        setAuthReady(true);
      }
    };
    init();
  }, [checkAuth]);

  // Auth Event Listeners
  useEffect(() => {
    const handleLogoutRequired = (event: CustomEvent) => {
      const reason = event.detail?.reason || 'unknown';
      if (!isAuthenticated) return;

      // Special handling for wishlist 401s - don't logout
      if (reason.toLowerCase().includes('wishlist')) {
        setError('Please login to save wishlist to cloud');
        return;
      }

      // Check for terminal failures
      const isTerminal = reason.includes('token_refresh_auth_failed') ||
        reason.includes('manual_logout') ||
        event.detail?.status === 401;

      if (isTerminal) {
        logger.info('Definite auth failure - logging out', { reason });
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth_tokens_v2');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('has_session');
        sessionManager.clearSession();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    };

    const handleWaking = () => setServerStatus('waking');
    const handleAwake = () => setServerStatus('ready');

    window.addEventListener('auth:logout-required', handleLogoutRequired as EventListener);
    window.addEventListener('server-waking-up', handleWaking);
    window.addEventListener('server-awake', handleAwake);

    return () => {
      window.removeEventListener('auth:logout-required', handleLogoutRequired);
      window.removeEventListener('server-waking-up', handleWaking);
      window.removeEventListener('server-awake', handleAwake);
    };
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        authReady,
        initializing,
        login,
        register,
        logout,
        googleLogin,
        checkAuth,
        checkEmailExists,
        error,
        serverStatus,
        resetError
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

export default AuthContext;
