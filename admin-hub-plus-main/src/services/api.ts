import axios from 'axios';
import { API_BASE_URL, ADMIN_ROUTES } from '@/utils/constants';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let csrfToken: string | null = null;
let csrfPromise: Promise<string | null> | null = null;

const fetchCsrfToken = async (): Promise<string | null> => {
  if (csrfToken) return csrfToken;
  if (csrfPromise) return csrfPromise;

  csrfPromise = axios.get(`${API_BASE_URL}/v1/csrf-token`, { withCredentials: true })
    .then(res => {
      csrfToken = res.data.csrfToken || null;
      return csrfToken;
    })
    .catch(err => {
      // Suppress 404 error log if backend does not support CSRF token endpoint
      if (err.response?.status !== 404) {
        console.warn('CSRF token fetch failed:', err.message);
      }
      return null;
    })
    .finally(() => {
      csrfPromise = null;
    });

  return csrfPromise;
};

// Request interceptor for auth token
api.interceptors.request.use(
  async (config) => {
    // Attach CSRF Token for mutating requests
    const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    if (config.method && mutatingMethods.includes(config.method.toUpperCase())) {
      if (config.url && !config.url.includes('/v1/csrf-token')) {
        const token = await fetchCsrfToken();
        if (token) {
          config.headers['X-CSRF-Token'] = token;
        }
      }
    }

    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
let isRefreshing = false;
let failedRequests: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {

    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve) => {
          failedRequests.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const localRefreshToken = localStorage.getItem('admin_refresh_token');
        const csrfTokenStr = await fetchCsrfToken();
        const response = await axios.post(`${API_BASE_URL}/admin/refresh-token`, {
          refreshToken: localRefreshToken || undefined
        }, { 
          withCredentials: true,
          headers: csrfTokenStr ? { 'X-CSRF-Token': csrfTokenStr } : {}
        });
        const newToken = response.data.token;

        if (response.data.success && newToken) {
          localStorage.setItem('admin_token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Process all queued requests
          failedRequests.forEach(callback => callback(newToken));
          failedRequests = [];

          // Retry original request
          return api(originalRequest);
        } else {
          // No refresh token available or invalid - force logout and redirect
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_refresh_token');
          localStorage.removeItem('admin_user');

          if (window.location.pathname !== '/admin-login') {
            window.location.href = '/admin-login';
          }

          return Promise.reject(error);
        }
      } catch (refreshError: any) {
        // Only clear and redirect if the error is NOT network/server related
        const status = refreshError.response?.status;
        const isNetworkOrServerError = !status || status >= 500 || refreshError.code === 'ERR_NETWORK' || refreshError.code === 'ECONNREFUSED';

        if (!isNetworkOrServerError) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_refresh_token');
          localStorage.removeItem('admin_user');

          // Redirect to login
          if (window.location.pathname !== '/admin-login') {
            window.location.href = '/admin-login';
          }
        }

        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle duplicate 401 check (redundant code removed)
    if (error.response?.status === 401 && originalRequest._retry) {
      // Clear any stored auth data
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
      // Redirect to login
      if (window.location.pathname !== '/admin-login') {
        window.location.href = '/admin-login';
      }
    }

    return Promise.reject(error);
  }
);

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/admin/settings/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.url;
};

export default api;
