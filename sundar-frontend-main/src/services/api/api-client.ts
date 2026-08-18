/**
 * 🚀 UNIFIED PRODUCTION-GRADE API CLIENT
 * 
 * Single source of truth for all API communications
 * Implements secure token refresh, exponential backoff, and centralized error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosHeaders, AxiosAdapter } from 'axios';
import { ENV_CONFIG, onApiUrlChange } from '@/config/environment';
import logger from '@/lib/logger';
import { Product } from './endpoints';
import { SiteSettings } from '@/types';

// ============================================
// CONFIGURATION
// ============================================

const API_CONFIG = {
  BASE_URL: ENV_CONFIG.API_URL,
  TIMEOUT: ENV_CONFIG.REQUEST_TIMEOUT,
  MAX_RETRIES: ENV_CONFIG.RETRY_ATTEMPTS,
  // Exponential backoff: 1s, 2s, 4s
  RETRY_DELAY_BASE: 1000,
  RETRYABLE_STATUS_CODES: [502, 503, 504],
  REFRESH_RETRY_DELAY: 2000,

  // Enhanced retry configuration
  COLD_START_TIMEOUT: 15000, // 15 seconds for cold start detection
  MAX_COLD_START_RETRIES: 3,
  CONNECTION_REFUSED_RETRY_DELAY: 3000, // 3 seconds
  MAX_CONNECTION_REFUSED_RETRIES: 2,

  // 🔥 NEW: Request deduplication window (ms)
  DEDUPLICATION_WINDOW: 100,

  // 🔥 UPDATED: Cache duration for GET requests (ms)
  // Reduced from 5 minutes to 30 seconds for better real-time updates
  CACHE_DURATION: 30 * 1000, // 30 seconds
} as const;

// ============================================
// AUTH ENDPOINTS (Never trigger refresh)
// ============================================

const AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh-token',
  '/auth/logout'
  // 🔓 REMOVED /auth/status: Allowing it to trigger refresh if token is expired
] as const;

// ============================================
// PUBLIC ENDPOINTS (Never trigger refresh)
// ============================================

const PUBLIC_ENDPOINTS = [
  '/products',
  '/health',
  '/metrics'
] as const;

// ============================================
// REFRESH STATE MANAGEMENT
// ============================================

// ============================================
// CSRF TOKEN STATE (Moved to top for hoisting/scope access)
// ============================================
let csrfToken: string | null = null;
let csrfPromise: Promise<string | null> | null = null;

const fetchCsrfToken = async (): Promise<string | null> => {
  if (csrfToken) return csrfToken;
  if (csrfPromise) return csrfPromise;

  csrfPromise = axios.get(`${API_CONFIG.BASE_URL}/csrf-token`, { withCredentials: true })
    .then(res => {
      csrfToken = res.data.csrfToken || null;
      return csrfToken;
    })
    .catch(err => {
      logger.error('Failed to fetch CSRF token', err);
      return null;
    })
    .finally(() => {
      csrfPromise = null;
    });

  return csrfPromise;
};


let isRefreshing = false;
let failedRequests: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: AxiosRequestConfig;
}> = [];

// 🔥 NEW: Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>();

// 🔥 NEW: Response cache for GET requests
const responseCache = new Map<string, {
  data: any;
  timestamp: number;
  ttl: number;
}>();

const processQueue = (error: AxiosError | null, success: boolean = false) => {
  logger.info(`Processing request queue - ${failedRequests.length} requests, success: ${success}`);

  failedRequests.forEach(({ resolve, reject, config }) => {
    if (success) {
      // Use raw axios here to avoid interceptor recursion during retry
      // but manually re-attach current auth data
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
      resolve(apiClient(config));
    } else {
      reject(error);
    }
  });

  failedRequests = [];
};

// 🔐 RACE CONDITION PREVENTION: Limit queue size to prevent memory issues
const MAX_QUEUED_REQUESTS = 50;

// ============================================
// AUTH STATE REFERENCE
// ============================================

interface AuthStateRef {
  isAuthenticated: boolean;
}

let authStateRef: AuthStateRef = { isAuthenticated: false };

export const setAuthStateRef = (state: AuthStateRef) => {
  authStateRef = state;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const isAuthEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;
  return AUTH_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

const isPublicEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;
  // Check for exact matches
  if (PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint))) {
    return true;
  }
  // Also check for /products/:id pattern
  if (/^\/products\/[a-f0-9]{24}(\?.*)?$/.test(url)) {
    logger.debug('Matched product by ID pattern as public endpoint', { url });
    return true;
  }
  return false;
};

const isWishlistEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;
  return url.includes('/wishlist') || url.includes('/recently-viewed');
};

const isWishlistRequest = (config: AxiosRequestConfig): boolean => {
  return isWishlistEndpoint(config.url);
};

const isAuthenticated = (): boolean => {
  // Enhanced check: React state OR presence of tokens in storage/cookies
  const hasLocalToken = !!localStorage.getItem('auth_token') ||
    !!localStorage.getItem('auth_tokens_v2') ||
    document.cookie.includes('accessToken=') ||
    document.cookie.includes('refreshToken=');

  return authStateRef.isAuthenticated === true || hasLocalToken;
};

// 🔥 ENHANCED COLD START DETECTION AND HANDLING
const isColdStartError = (error: AxiosError): boolean => {
  if (!error.response) return false;

  const status = error.response.status;
  const data = error.response.data as ErrorResponseData;

  // Check for explicit cold start indicators
  if (status === 503) {
    return data?.isColdStart === true ||
      data?.coldStart === true ||
      (data?.message?.toLowerCase().includes('initializing') ||
        data?.message?.toLowerCase().includes('warming') ||
        data?.message?.toLowerCase().includes('cold start'));
  }

  // Also check for 401 that might be server-related during cold start
  if (status === 401) {
    const errorMessage = data?.message?.toLowerCase() || '';
    return errorMessage.includes('service unavailable') ||
      errorMessage.includes('server') ||
      errorMessage.includes('initializing') ||
      errorMessage.includes('cold start');
  }

  return false;
};

// 🔥 SERVER SLEEP DETECTION
const isServerSleepError = (error: AxiosError): boolean => {
  if (!error.response) {
    // Connection refused or network errors during server sleep
    const message = error.message || '';
    const errorCode = error.code || '';

    return message.includes('ECONNREFUSED') ||
      message.includes('connection refused') ||
      message.includes('Network Error') ||
      errorCode === 'ECONNREFUSED' ||
      errorCode === 'ENOTFOUND';
  }

  // 503 Service Unavailable often indicates server sleep
  return error.response.status === 503;
};

// 🔥 RETRYABLE ERROR DETECTION
const isRetryableError = (error: AxiosError): boolean => {
  // Network errors that are definitely retryable
  if (!error.response) {
    const message = error.message || '';
    const errorCode = error.code || '';

    // Connection refused / network errors
    const isConnectionError = message.includes('Network Error') ||
      message.includes('connection refused') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ECONNABORTED') ||
      message.includes('connect ECONNREFUSED') ||
      errorCode === 'ECONNREFUSED' ||
      errorCode === 'ENOTFOUND' ||
      errorCode === 'EAI_AGAIN';

    if (isConnectionError) {
      return true;
    }

    // Timeout errors
    const isTimeout = message.includes('timeout') ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT';

    if (isTimeout) {
      return true;
    }

    // Other network issues
    return false;
  }

  // Server errors that are retryable
  // Only retry for 502, 503, 504 - never for 401/403/400
  const status = error.response.status;
  return API_CONFIG.RETRYABLE_STATUS_CODES.includes(status as 502 | 503 | 504) ||
    status === 500; // Also retry 500 server errors
};

// NEW FUNCTION: Check if error should NOT be retried (auth errors)
const isNonRetryableError = (error: AxiosError): boolean => {
  if (!error.response) {
    return false; // Network errors are retryable
  }

  const status = error.response.status;
  // Don't retry for authentication/authorization errors
  return status === 401 || status === 403 || status === 400;
};

// Define response data interfaces for better type safety
interface ErrorResponseData {
  requiresLogin?: boolean;
  isColdStart?: boolean;
  coldStart?: boolean;
  retryAfter?: number;
  success?: boolean;
  message?: string;
  code?: string;
  serverInstanceId?: string;
}

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
  _coldStartRetry?: boolean;
}

const isAuthFailure = (error: AxiosError): boolean => {
  if (!error.response) return false;

  const status = error.response.status;
  const config = error.config as ExtendedAxiosRequestConfig;
  const data = error.response.data as ErrorResponseData;

  // 🔥 ENHANCED LOGGING: Log all 401 errors for debugging
  if (status === 401 || status === 403) {
    logger.warn('🔐 Authentication error detected:', {
      status,
      url: config.url,
      method: config.method,
      message: data?.message,
      code: data?.code,
      requiresLogin: data?.requiresLogin,
      hasToken: !!localStorage.getItem('auth_token'),
      timestamp: new Date().toISOString()
    });

    // 401/403 with requiresLogin=true means auth definitely failed
    if (data?.requiresLogin === true) {
      logger.info('🔐 Definite auth failure detected (requiresLogin)', {
        status,
        message: data.message
      });
      return true;
    }

    // 🔥 SPECIFIC CHECK: Allow wishlist, recently-viewed and auth/status 401s to trigger refresh
    if (isWishlistRequest(config || {}) || config?.url?.includes('/auth/status') || config?.url?.includes('/users/recently-viewed')) {
      logger.debug('401 detected on recoverable endpoint - allowing refresh attempt', {
        url: config.url
      });
      return false;
    }

    // Explicit check for refresh token failure - this is always terminal
    if (config?.url?.includes('/auth/refresh-token')) {
      logger.info('🔐 Token refresh failed - terminal auth failure');
      return true;
    }

    // For other endpoints, only treat as terminal if explicitly flagged
    // Standard 401s without requiresLogin=true should be handled by the refresh logic.
    // If refresh logic fails, it will call triggerLogout.
    return false;
  }

  return false;
};

const calculateRetryDelay = (retryCount: number): number => {
  // Exponential backoff: 1s, 2s, 4s
  return Math.min(
    API_CONFIG.RETRY_DELAY_BASE * Math.pow(2, retryCount),
    10000 // Max 10 seconds
  );
};

// ============================================
// REQUEST DEDUPLICATION & CACHING
// ============================================

// 🔥 NEW: Generate cache key from request config
const generateCacheKey = (config: AxiosRequestConfig): string => {
  const method = config.method?.toUpperCase() || 'GET';
  const url = config.url || '';
  const params = JSON.stringify(config.params || {});
  return `${method}:${url}:${params}`;
};

// 🔥 NEW: Check if response is cached and valid
const getCachedResponse = (cacheKey: string): any | null => {
  const cached = responseCache.get(cacheKey);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > cached.ttl) {
    // Cache expired
    responseCache.delete(cacheKey);
    return null;
  }

  logger.debug('Cache hit', { cacheKey, age: now - cached.timestamp });
  return cached.data;
};

// 🔥 NEW: Cache response
const cacheResponse = (cacheKey: string, data: any, ttl?: number): void => {
  responseCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl: ttl || API_CONFIG.CACHE_DURATION
  });

  logger.debug('Response cached', { cacheKey, ttl });
};

// 🔥 NEW: Clear cache for specific pattern
export const clearCache = (pattern?: string): void => {
  if (!pattern) {
    responseCache.clear();
    logger.info('Cache cleared completely');
    return;
  }

  responseCache.forEach((_, key) => {
    if (key.includes(pattern)) {
      responseCache.delete(key);
    }
  });

  logger.info('Cache cleared for pattern', { pattern });
};

// 🔥 NEW: Invalidate cache for specific product
export const invalidateProductCache = (productId: string): void => {
  const cacheKeyPattern = `/products/${productId}`;
  clearCache(cacheKeyPattern);

  // Also trigger storage event to notify other tabs
  localStorage.setItem(`product_update_${productId}`, Date.now().toString());

  // Dispatch custom event to refresh ProductDetails page if open
  window.dispatchEvent(new CustomEvent('product-refresh', {
    detail: { productId }
  }));

  logger.info('Product cache invalidated', { productId });
};

// 🔥 NEW: Custom Axios adapter for caching and request deduplication
const defaultAdapter = axios.getAdapter(axios.defaults.adapter);

const cachingAdapter: AxiosAdapter = async (config) => {
  if (!defaultAdapter) {
    throw new Error('Default Axios adapter is not available.');
  }

  // Only handle GET requests
  const isGet = config.method?.toUpperCase() === 'GET';

  // Exclude non-cacheable endpoints
  const isCacheable = isGet &&
    !config.url?.includes('/auth/status') &&
    !config.url?.includes('/health') &&
    !config.url?.includes('/metrics') &&
    !config.url?.includes('/csrf-token');

  if (!isCacheable) {
    return defaultAdapter(config);
  }

  const cacheKey = generateCacheKey(config);

  // 1. Check response cache
  const cached = responseCache.get(cacheKey);
  if (cached) {
    const now = Date.now();
    if (now - cached.timestamp <= cached.ttl) {
      logger.debug('Cache hit from adapter', { cacheKey });
      return {
        ...cached.data,
        config
      };
    } else {
      responseCache.delete(cacheKey);
    }
  }

  // 2. Check pending request (deduplication)
  if (pendingRequests.has(cacheKey)) {
    logger.debug('Deduplicating concurrent GET request', { cacheKey });
    const response = await pendingRequests.get(cacheKey);
    return {
      ...response,
      config
    };
  }

  // 3. Perform request and store promise
  const requestPromise = (async () => {
    try {
      const response = await defaultAdapter(config);

      const responseToCache = {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      };

      cacheResponse(cacheKey, responseToCache, API_CONFIG.CACHE_DURATION);
      return response;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

// ============================================
// REQUEST QUEUE MANAGEMENT
// ============================================

// Queue processing is now handled above in REFRESH STATE MANAGEMENT section

// ============================================
// TOKEN REFRESH LOGIC
// ============================================

// Forward reference to apiClient (will be assigned after creation)
// eslint-disable-next-line prefer-const
let apiClient: AxiosInstance;

// Cold start state management
let isColdStartDetected = false;
let coldStartRetryCount = 0;
const MAX_COLD_START_RETRIES = 3;

const refreshToken = async (): Promise<boolean> => {
  try {
    logger.info('🔐 Attempting token refresh', {
      isRefreshing
    });

    const localRefreshToken = localStorage.getItem('refresh_token');

    // Fetch and attach CSRF token to prevent 403 Forbidden errors
    const csrf = await fetchCsrfToken();

    const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh-token`, {
      refreshToken: localRefreshToken
    }, {
      withCredentials: true,
      headers: {
        'X-Cold-Start': 'true',
        'X-Refresh-Token': localRefreshToken || '',
        ...(csrf ? { 'X-CSRF-Token': csrf } : {})
      }
    });

    if (response?.data?.success) {
      // 🔥 CROSS-ORIGIN COMPATIBILITY: Use token from response body if available
      // This handles scenarios where cookies are blocked by the browser
      const accessToken = response.data.accessToken || response.data.data?.accessToken;
      const newRefreshToken = response.data.refreshToken || response.data.data?.refreshToken;

      if (accessToken) {
        localStorage.setItem('auth_token', accessToken);
        logger.info('🔐 Token refreshed successfully from response body');
      }

      if (newRefreshToken) {
        localStorage.setItem('refresh_token', newRefreshToken);
      }

      if (accessToken || newRefreshToken || document.cookie.includes('accessToken=')) {
        return true;
      }

      logger.warn('🔐 Token refresh succeeded but no token found in response or cookies');
      return false;
    }
    return false;
  } catch (error) {
    const axiosError = error as AxiosError;

    // Check for cold start condition (503 with isColdStart flag)
    const responseData = axiosError.response?.data as ErrorResponseData;
    const isColdStart = axiosError.response?.status === 503 &&
      (responseData?.isColdStart ||
        responseData?.coldStart);

    if (isColdStart) {
      logger.info('❄️ Cold start detected during token refresh, scheduling retry', {
        status: axiosError.response?.status,
        retryAfter: responseData?.retryAfter,
        serverInstanceId: responseData?.serverInstanceId
      });
      // Don't logout on cold start - schedule retry
      return false;
    }

    // If it's definitely an auth failure (401/403 with requiresLogin), logout
    if (isAuthFailure(axiosError)) {
      logger.warn('🔐 Token refresh failed with auth error - logging out', {
        status: axiosError.response?.status,
        message: (axiosError.response?.data as ErrorResponseData)?.message
      });
      triggerLogout('token_refresh_auth_failed');
      return false;
    }

    // For network errors, return false but don't logout
    logger.warn('Token refresh failed with network error - preserving session', {
      status: axiosError.response?.status,
      message: axiosError.message
    });
    return false;
  }
};

// ============================================
// ENHANCED RETRY LOGIC WITH SERVER SLEEP RESILIENCE
// ============================================

// Circuit breaker state
let circuitBreakerOpen = false;
let failureCount = 0;
const MAX_FAILURES = 5;
const CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute

// Server sleep detection and handling
const serverSleepDetected = false;
const serverWakeRetryCount = 0;
const MAX_SERVER_WAKE_RETRIES = 4;

const executeRetryRequest = async (config: AxiosRequestConfig) => {
  return axios({
    ...config,
    baseURL: config.baseURL || API_CONFIG.BASE_URL
  });
};

// Enhanced retry handler with better connection refused and cold start handling
const handleRetry = async (
  config: ExtendedAxiosRequestConfig,
  error: AxiosError,
  retryCount: number = 0
): Promise<AxiosRequestConfig | unknown> => {
  config._retryCount = retryCount;
  // Circuit breaker protection
  if (circuitBreakerOpen) {
    logger.warn('Circuit breaker is open, not retrying request');
    return Promise.reject(error);
  }

  if (retryCount >= API_CONFIG.MAX_RETRIES) {
    logger.error(`Max retries (${API_CONFIG.MAX_RETRIES}) exceeded`, {
      url: config.url,
      method: config.method,
      retryCount,
      originalError: error.message
    });

    // Open circuit breaker on too many failures
    if (error.response?.status === 503 || !error.response) {
      failureCount++;
      if (failureCount >= MAX_FAILURES) {
        circuitBreakerOpen = true;
        logger.error('Opening circuit breaker due to repeated failures');
        setTimeout(() => {
          circuitBreakerOpen = false;
          failureCount = 0;
          logger.info('Circuit breaker reset');
        }, CIRCUIT_BREAKER_TIMEOUT);
      }
    }

    return Promise.reject(error);
  }

  // Check if this is a retryable error
  if (!isRetryableError(error)) {
    logger.debug('Non-retryable error, skipping retry', {
      url: config.url,
      status: error.response?.status,
      message: error.message
    });
    return Promise.reject(error);
  }

  // Special handling for connection refused
  const isConnectionRefused = !error.response &&
    (error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('connection refused') ||
      error.code === 'ECONNREFUSED');

  if (isConnectionRefused && retryCount < API_CONFIG.MAX_CONNECTION_REFUSED_RETRIES) {
    logger.info(`Connection refused detected, retrying in ${API_CONFIG.CONNECTION_REFUSED_RETRY_DELAY}ms (attempt ${retryCount + 1}/${API_CONFIG.MAX_CONNECTION_REFUSED_RETRIES})`, {
      url: config.url,
      retryCount: retryCount + 1
    });

    await new Promise(resolve => setTimeout(resolve, API_CONFIG.CONNECTION_REFUSED_RETRY_DELAY));

    try {
      const response = await executeRetryRequest(config);
      logger.info('✅ Connection restored after retry', { url: config.url });
      return response;
    } catch (retryError) {
      // If it's still connection refused, continue with regular retry logic
      const isStillConnectionRefused = !error.response &&
        (error.message?.includes('ECONNREFUSED') || error.code === 'ECONNREFUSED');

      if (isStillConnectionRefused) {
        return handleRetry(config, retryError as AxiosError, retryCount + 1);
      }
      return Promise.reject(retryError);
    }
  }

  // 🔥 ENHANCED COLD START HANDLING
  if (isColdStartError(error) && retryCount < API_CONFIG.MAX_COLD_START_RETRIES) {
    const coldStartDelay = Math.min(
      API_CONFIG.RETRY_DELAY_BASE * Math.pow(2, retryCount) * 2, // Double delay for cold starts
      10000
    );

    logger.info(`Cold start detected, retrying in ${coldStartDelay}ms (attempt ${retryCount + 1}/${API_CONFIG.MAX_COLD_START_RETRIES})`, {
      url: config.url,
      retryCount: retryCount + 1,
      serverMessage: (error.response?.data as ErrorResponseData)?.message
    });

    // Dispatch event to inform UI about server wake-up
    window.dispatchEvent(new CustomEvent('server-waking-up', {
      detail: {
        message: 'Server is initializing, please wait...',
        retryAfter: coldStartDelay / 1000
      }
    }));

    await new Promise(resolve => setTimeout(resolve, coldStartDelay));

    try {
      const response = await executeRetryRequest(config);
      logger.info('✅ Server awake after cold start retry', { url: config.url });

      // Dispatch server awake event
      window.dispatchEvent(new CustomEvent('server-awake'));

      return response;
    } catch (retryError) {
      // If still cold start, continue retrying
      if (isColdStartError(retryError as AxiosError)) {
        return handleRetry(config, retryError as AxiosError, retryCount + 1);
      }
      return Promise.reject(retryError);
    }
  }

  // 🔥 ENHANCED SERVER SLEEP HANDLING
  if (isServerSleepError(error) && retryCount < API_CONFIG.MAX_CONNECTION_REFUSED_RETRIES) {
    const sleepDelay = Math.min(
      API_CONFIG.RETRY_DELAY_BASE * Math.pow(2, retryCount) * 1.5, // Moderate delay for server sleep
      8000
    );

    logger.info(`Server sleep detected, retrying in ${sleepDelay}ms (attempt ${retryCount + 1}/${API_CONFIG.MAX_CONNECTION_REFUSED_RETRIES})`, {
      url: config.url,
      retryCount: retryCount + 1,
      errorType: !error.response ? 'connection_refused' : 'service_unavailable'
    });

    await new Promise(resolve => setTimeout(resolve, sleepDelay));

    try {
      const response = await executeRetryRequest(config);
      logger.info('✅ Server responsive after sleep retry', { url: config.url });
      return response;
    } catch (retryError) {
      // If still server sleep, continue retrying
      if (isServerSleepError(retryError as AxiosError)) {
        return handleRetry(config, retryError as AxiosError, retryCount + 1);
      }
      return Promise.reject(retryError);
    }
  }

  // Calculate delay with exponential backoff and jitter for regular retries
  const baseDelay = Math.min(
    Math.pow(2, retryCount) * API_CONFIG.RETRY_DELAY_BASE + Math.random() * 1000,
    30000 // Max 30 seconds
  );

  const totalDelay = baseDelay;

  logger.warn(`Retrying request (${retryCount + 1}/${API_CONFIG.MAX_RETRIES}) in ${Math.round(totalDelay / 1000)}s`, {
    url: config.url,
    method: config.method,
    status: error.response?.status,
    isColdStart: isColdStartError(error),
    isServerSleep: isServerSleepError(error),
    isConnectionRefused,
    baseDelay,
    totalDelay
  });

  // Wait for delay
  await new Promise(resolve => setTimeout(resolve, totalDelay));

  // Reset failure count on successful retry
  try {
    const response = await executeRetryRequest(config);
    return response;
  } catch (retryError) {
    return handleRetry(config, retryError as AxiosError, retryCount + 1);
  }
};

// ============================================
// CREATE API CLIENT
// ============================================

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    adapter: cachingAdapter
  });

  // Request interceptor
  client.interceptors.request.use(
    async (config) => {
      // Attach CSRF Token for mutating requests
      const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
      if (config.method && mutatingMethods.includes(config.method.toUpperCase())) {
        if (config.url && !config.url.includes('/csrf-token')) {
          const token = await fetchCsrfToken();
          if (token) {
            if (config.headers instanceof AxiosHeaders) {
              config.headers.set('X-CSRF-Token', token);
            } else {
              config.headers = config.headers || {};
              (config.headers as Record<string, string>)['X-CSRF-Token'] = token;
            }
          }
        }
      }

      // 🔥 CRITICAL FIX: Attach Authorization header if token exists
      let token = localStorage.getItem('auth_token');

      // Fallback to alternative token storage if primary is missing
      if (!token) {
        const tokens = localStorage.getItem('auth_tokens_v2');
        if (tokens) {
          try {
            const parsed = JSON.parse(tokens);
            token = parsed.accessToken;
          } catch (e) {
            console.debug('Failed to parse auth_tokens_v2');
          }
        }
      }

      if (token) {
        // 🔥 FIX: Properly handle Axios headers for v1.x
        if (config.headers) {
          // If headers exists, set the Authorization header
          if (config.headers instanceof AxiosHeaders) {
            // AxiosHeaders instance - use set method
            config.headers.set('Authorization', `Bearer ${token}`);
          } else {
            // Plain object or Record - direct assignment
            (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
          }
        } else {
          // If headers is undefined, create a new AxiosHeaders instance
          config.headers = new AxiosHeaders({
            'Authorization': `Bearer ${token}`
          });
        }
      }

      // 🔥 CRITICAL FIX: Ensure withCredentials is enabled for cookie-based auth fallback
      config.withCredentials = true;

      // Add debug logging for wishlist requests
      if (isWishlistEndpoint(config.url)) {
        logger.debug('Wishlist request initiated', {
          url: config.url,
          method: config.method,
          hasCookies: document.cookie.includes('accessToken=') || document.cookie.includes('refreshToken='),
          hasHeader: !!token,
          isAuthenticated: isAuthenticated(),
          withCredentials: config.withCredentials
        });
      }

      // Remove custom headers for health checks to prevent CORS issues
      if (config.url?.includes('/health')) {
        delete config.headers['X-Health-Check'];
        delete config.headers['X-Cold-Start'];
        delete config.headers['X-Background-Check'];
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => {
      // Add debug logging for wishlist responses
      if (isWishlistEndpoint(response.config?.url)) {
        logger.debug('Wishlist request completed', {
          url: response.config?.url,
          status: response.status,
          hasData: !!response.data,
          success: response.data?.success ?? true
        });
      }
      return response;
    },
    async (error: AxiosError) => {
      const config = error.config as ExtendedAxiosRequestConfig;

      // Add error logging
      if (isWishlistEndpoint(config?.url)) {
        logger.debug('Wishlist request failed', {
          url: config?.url,
          status: error.response?.status,
          message: error.message,
          hasResponse: !!error.response
        });
      }

      let activeError = error;

      // No config or no response
      if (!config || !activeError.response) {
        // Handle retryable network errors
        if (isRetryableError(activeError)) {
          try {
            return await handleRetry(config, activeError, config._retryCount || 0);
          } catch (retryError) {
            activeError = retryError as AxiosError;
          }
        } else {
          return Promise.reject(activeError);
        }
      }

      // Check if this is a non-retryable error (auth errors)
      // 🔥 CRITICAL FIX: Explicitly allow 401s to pass through so they can be handled by refresh logic
      if (isNonRetryableError(activeError) && activeError.response?.status !== 401) {
        logger.debug('Non-retryable error (validation/forbidden), skipping retry', {
          url: config.url,
          status: activeError.response?.status,
          message: activeError.message
        });
        return Promise.reject(activeError);
      }

      // Never refresh for auth endpoints or public endpoints
      if (isAuthEndpoint(config.url) || isPublicEndpoint(config.url)) {
        logger.debug('Skipping refresh for auth/public endpoint', { url: config.url });
        // But still handle retries for auth endpoints
        if (isRetryableError(activeError)) {
          return handleRetry(config, activeError, config._retryCount || 0);
        }
        return Promise.reject(activeError);
      }

      // 🔥 CRITICAL FIX: Enhanced wishlist endpoint handling
      if (isWishlistRequest(config)) {
        logger.info('Wishlist request failed', {
          status: activeError.response?.status,
          isAuthenticated: isAuthenticated(),
          url: config.url,
          hasRetry: !!config._retry,
          retryCount: config._retryCount
        });

        // 🔥 ALLOW token refresh for wishlist requests
        // This ensures users don't get stuck in a "logged out" state for wishlist actions
        logger.debug('Wishlist request failed - allowing retry logic to handle potential refresh');

        // Handle cold start scenarios
        const responseData = activeError.response.data as ErrorResponseData;
        const isColdStart = activeError.response.status === 503 &&
          (responseData?.isColdStart || responseData?.coldStart);

        if (isColdStart) {
          logger.info('Wishlist request failed due to cold start - preserving session');
          return Promise.reject(activeError);
        }

        // 🔥 Handle 401 specifically
        if (activeError.response.status === 401) {
          // If already retried or handled, reject to prevent loop
          if (config._retry || (activeError as ExtendedAxiosError).__wishlist_401_handled) {
            logger.info('Wishlist 401 (already retried) - preserving session, will show login prompt');

            Object.defineProperty(activeError, '__wishlist_401_handled', {
              value: true,
              writable: false,
              enumerable: false,
              configurable: false
            });
            return Promise.reject(activeError);
          }

          // If first time 401, let it pass to main refresh logic
          logger.debug('Wishlist 401 (first attempt) - passing to refresh logic');
        } else {
          // For other errors (500, network, etc.), preserve session
          logger.info('Wishlist request failed with non-auth error - preserving session', {
            status: activeError.response.status,
            message: (activeError.response.data as ErrorResponseData)?.message
          });
          return Promise.reject(activeError);
        }
      }

      // Already retried
      if (config._retry) {
        return Promise.reject(activeError);
      }

      // Handle retryable errors (but not if already retried)
      if (isRetryableError(activeError) && !config._retry) {
        return handleRetry(config, activeError, config._retryCount || 0);
      }

      // Check for cold start condition
      const coldStartResponseData = error.response.data as ErrorResponseData;
      const isColdStartResponse = error.response.status === 503 &&
        (coldStartResponseData?.isColdStart ||
          coldStartResponseData?.coldStart);

      if (isColdStartResponse && !config._coldStartRetry && coldStartRetryCount < MAX_COLD_START_RETRIES) {
        config._coldStartRetry = true;
        coldStartRetryCount++;

        // Calculate delay based on retry count and server suggestion
        const suggestedDelay = coldStartResponseData?.retryAfter || 5;
        const calculatedDelay = Math.min(suggestedDelay * 1000, 10000); // Max 10 seconds
        const coldStartDelay = calculatedDelay * coldStartRetryCount; // Progressive delay

        logger.info(`Cold start detected, retrying in ${coldStartDelay}ms (attempt ${coldStartRetryCount}/${MAX_COLD_START_RETRIES})`);

        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, coldStartDelay));

        try {
          const response = await executeRetryRequest(config);
          coldStartRetryCount = 0; // Reset on success
          isColdStartDetected = false;
          return response;
        } catch (retryError) {
          const retryAxiosError = retryError as AxiosError;
          const retryResponseData = retryAxiosError.response?.data as ErrorResponseData;

          // If retry also gets cold start, continue retrying
          if (retryAxiosError.response?.status === 503 &&
            (retryResponseData?.isColdStart || retryResponseData?.coldStart)) {
            return Promise.reject(retryError);
          }

          // If it's an auth failure, logout
          if (isAuthFailure(retryAxiosError)) {
            triggerLogout('auth_failed_after_cold_start_retry');
            return Promise.reject(retryError);
          }

          // If it's a 401 (expired token), assign to activeError so it falls through to the 401 refresh logic!
          if (retryAxiosError.response?.status === 401) {
            logger.info('401 detected after cold start retry - falling through to refresh token logic');
            activeError = retryAxiosError;
          } else {
            return Promise.reject(retryError);
          }
        }
      }

      // Handle different error statuses appropriately
      if (activeError.response.status === 503) {
        // Server unavailable (likely cold start) - don't logout
        const responseData = activeError.response.data as ErrorResponseData;
        const isColdStartResponse = responseData?.isColdStart ||
          responseData?.coldStart ||
          activeError.response.status === 503;

        if (isColdStartResponse) {
          logger.info('Server unavailable (possible cold start) - preserving session', {
            status: activeError.response.status,
            message: responseData?.message,
            retryAfter: responseData?.retryAfter
          });

          // Dispatch event to inform UI about server wake-up
          window.dispatchEvent(new CustomEvent('server-waking-up', {
            detail: {
              message: responseData?.message || 'Server is waking up, please wait...',
              retryAfter: responseData?.retryAfter || 10
            }
          }));

          return Promise.reject(activeError);
        }
      }

      if (activeError.response.status !== 401) {
        return Promise.reject(activeError);
      }

      // 🔥 CRITICAL SAFEGUARD: Check if this 401 was already handled by wishlist logic
      if ((activeError as ExtendedAxiosError).__wishlist_401_handled === true) {
        logger.info('Skipping refresh - wishlist 401 already handled');
        return Promise.reject(activeError);
      }

      // Check if this is a genuine auth failure or a temporary issue
      const responseData = activeError.response.data as ErrorResponseData;
      const isGenuineAuthFailure = isAuthFailure(activeError) ||
        (responseData?.requiresLogin === true) ||
        (responseData?.code &&
          ['USER_NOT_FOUND', 'PASSWORD_CHANGED', 'PASSWORD_VERSION_MISMATCH'].includes(responseData.code));

      // Don't refresh if it's a genuine auth failure
      if (isGenuineAuthFailure) {
        logger.info('Genuine auth failure - skipping refresh', {
          status: activeError.response.status,
          code: responseData?.code,
          message: responseData?.message,
          url: config.url
        });
        return Promise.reject(activeError);
      }

      // Check if this 401 might be due to server issues (like Render cold start)
      // This can happen when server is waking up and returns 401 instead of 503
      const errorMessage = responseData?.message?.toLowerCase() || '';
      const isServerRelated401 = errorMessage.includes('service unavailable') ||
        errorMessage.includes('server') ||
        errorMessage.includes('cold start') ||
        errorMessage.includes('initializing');

      if (isServerRelated401) {
        logger.info('401 appears to be server-related - preserving session and retrying', {
          url: config.url,
          status: activeError.response.status,
          message: responseData?.message
        });

        // Wait and retry once
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
          const retryResponse = await client(config);
          logger.info('✅ Request succeeded after server-related 401 retry', { url: config.url });
          return retryResponse;
        } catch (retryError) {
          // If retry also fails with server-related issues, preserve session
          const retryResponseData = (retryError as AxiosError).response?.data as ErrorResponseData;
          const retryErrorMessage = retryResponseData?.message?.toLowerCase() || '';
          const isStillServerRelated = retryErrorMessage.includes('service unavailable') ||
            retryErrorMessage.includes('server') ||
            retryErrorMessage.includes('cold start') ||
            retryErrorMessage.includes('initializing');

          if (isStillServerRelated) {
            logger.info('Server issues persist - preserving session', { url: config.url });
            return Promise.reject(retryError);
          }

          // If it's a genuine auth failure after server wake, handle appropriately
          if (isAuthFailure(retryError as AxiosError)) {
            triggerLogout('auth_failed_after_server_wake');
            return Promise.reject(retryError);
          }

          // If it's a standard 401, fall through to refresh logic
          if ((retryError as AxiosError).response?.status === 401) {
            logger.info('401 detected after server wake retry - falling through to refresh token logic');
            activeError = retryError as AxiosError;
          } else {
            return Promise.reject(retryError);
          }
        }
      }

      // Don't refresh if not authenticated (except for wishlist which is handled above)
      if (!isAuthenticated()) {
        logger.info('Skipping refresh - user not authenticated', { url: config.url });
        return Promise.reject(activeError);
      }

      // For other 401 errors (potentially due to expired tokens), try refresh with enhanced logic
      logger.info('401 detected - attempting token refresh with queue management', {
        url: config.url,
        status: activeError.response.status,
        message: responseData?.message,
        code: responseData?.code
      });

      // 🔥 ENHANCED TOKEN REFRESH QUEUE MANAGEMENT
      if (isRefreshing) {
        logger.info('Token refresh already in progress - queuing request', { url: config.url });

        // 🔐 FIX: Prevent unlimited queue growth
        if (failedRequests.length >= MAX_QUEUED_REQUESTS) {
          logger.warn('Request queue full - rejecting oldest request');
          // Remove oldest request to make room
          failedRequests.shift();
        }

        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedRequests.push({ resolve, reject, config });
        });
      }

      // Start refresh process
      config._retry = true;
      isRefreshing = true;

      try {
        const refreshSuccess = await refreshToken();

        if (refreshSuccess) {
          logger.info('✅ Token refresh successful - processing queued requests', {
            queuedCount: failedRequests.length
          });

          // Add small delay to ensure cookies propagate
          await new Promise(r => setTimeout(r, 100));

          // Process queued requests with success
          processQueue(null, true);
          // Retry original request
          return client(config);
        } else {
          logger.warn('❌ Token refresh failed - processing queued requests with failure', {
            queuedCount: failedRequests.length
          });
          // Process queued requests with failure
          processQueue(activeError, false);

          // Only logout on definitive auth failure
          if (isGenuineAuthFailure) {
            triggerLogout('auth_failed_after_refresh');
          }
          return Promise.reject(activeError);
        }
      } catch (refreshError) {
        logger.error('Token refresh threw exception', { error: refreshError });
        processQueue(refreshError, false);
        return Promise.reject(activeError);
      } finally {
        isRefreshing = false;
      }
    }
  );

  return client;
};

// ============================================
// LOGOUT TRIGGER
// ============================================

const triggerLogout = (reason: string) => {
  // Clear localStorage
  localStorage.removeItem('auth_user');
  localStorage.removeItem('has_session');

  // Dispatch event for AuthContext to handle
  window.dispatchEvent(new CustomEvent('auth:logout-required', {
    detail: { reason }
  }));
};

// ============================================
// EXPORT API CLIENT
// ============================================

const apiClientInstance = createApiClient();
apiClient = apiClientInstance;

// Listen for dynamic API URL updates from environment config
onApiUrlChange((newUrl) => {
  apiClientInstance.defaults.baseURL = newUrl;
  (API_CONFIG as any).BASE_URL = newUrl;
  logger.info(`🔄 API client base URL updated dynamically to: ${newUrl}`);
});

export { apiClientInstance as apiClient };

export default apiClientInstance;

// ============================================
// API ENDPOINTS
// ============================================

import { mockProducts, mockCategories } from './mockData';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Define specific response types
interface AuthResponse {
  success: boolean;
  data?: {
    user?: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
    token?: string;
    refreshToken?: string;
  };
  message?: string;
}

interface UserResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt?: string;
    updatedAt?: string;
    avatarColor?: string;
    avatarIcon?: string;
    businessName?: string;
    businessType?: string;
    themeColor?: string;
  };
  message?: string;
}

interface WishlistResponse {
  success: boolean;
  data?: {
    items: Product[];
    count?: number;
  };
  message?: string;
}

interface InquiryResponse {
  success: boolean;
  data?: {
    id: string;
    _id?: string;
    userId?: string;
    productId?: string;
    subject: string;
    message: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
  } | any[];
  message?: string;
}

interface ExtendedAxiosError extends AxiosError {
  __wishlist_401_handled?: boolean;
}

export const api = {
  auth: {
    login: (data: { email: string; password: string; rememberMe?: boolean }) =>
      apiClient.post<ApiResponse<AuthResponse['data']>>('/auth/login', data).then(res => res.data),
    register: (data: { name: string; email: string; password: string; phone?: string }) =>
      apiClient.post<ApiResponse<AuthResponse['data']>>('/auth/register', data).then(res => res.data),
    logout: () => apiClient.post<ApiResponse<{ success: boolean; message?: string }>>('/auth/logout').then(res => res.data),
    status: () => Promise.resolve({ success: false, message: 'Not authenticated' } as any),
    refreshToken: () => apiClient.post<ApiResponse<AuthResponse['data']>>('/auth/refresh-token').then(res => res.data),
    checkEmail: (email: string) => apiClient.get<ApiResponse<{ success: boolean; exists?: boolean; message?: string }>>(`/auth/check-email?email=${encodeURIComponent(email)}`).then(res => res.data),
    forgotPassword: (email: string) => apiClient.post<ApiResponse<{ success: boolean; message?: string }>>('/auth/forgot-password', { email }).then(res => res.data),
    resetPassword: (data: { token: string; password: string }) => apiClient.post<ApiResponse<{ success: boolean; message?: string }>>('/auth/reset-password', data).then(res => res.data),
    googleLogin: () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      window.location.href = `${apiUrl.replace('/api/v1', '')}/auth/google`;
    }
  },
  products: {
    getAll: () => apiClient.get<ApiResponse<Product[]>>('/products').then(res => (res.data as any).data || res.data),
    getAllRaw: () => apiClient.get<ApiResponse<Product[]>>('/products').then(res => res.data),
    getPopular: () => apiClient.get<ApiResponse<Product[]>>('/products/featured').then(res => (res.data as any).data || res.data),
    getById: (id: string, skipCache = false) => apiClient.get<ApiResponse<Product>>(`/products/${id}`).then(res => res.data),
    getByCategory: (category: string) => apiClient.get<ApiResponse<Product[]>>(`/products?category=${category}`).then(res => (res.data as any).data || res.data),
    search: (query: string) => apiClient.get<ApiResponse<Product[]>>(`/products/search?q=${query}`).then(res => (res.data as any).data || res.data),
    getSuggestions: (query: string) => apiClient.get<ApiResponse<Product[]>>(`/products/suggestions?q=${query}`).then(res => (res.data as any).data || res.data),
    getRelated: (id: string, limit?: number) => apiClient.get<ApiResponse<Product[]>>(`/products/${id}/related?limit=${limit || 4}`).then(res => (res.data as any).data || res.data),
    getPopularInCategory: (category: string, limit?: number, exclude?: string) => apiClient.get<ApiResponse<Product[]>>(`/products?category=${category}&limit=${limit || 4}&exclude=${exclude || ''}`).then(res => (res.data as any).data || res.data),
    trackView: (id: string) => apiClient.post(`/products/${id}/view`).then(res => res.data)
  },
  categories: {
    getAll: () => apiClient.get<ApiResponse<any[]>>('/categories').then(res => (res.data as any).data || res.data)
  },
  user: {
    getProfile: () => Promise.resolve({ success: false } as any),
    updateProfile: (data: Partial<UserResponse['data']>) => Promise.resolve({ success: false } as any),
    // Recently viewed products
    getRecentlyViewed: (limit?: number) => Promise.resolve([] as Product[]),
    trackRecentlyViewed: (productId: string) => Promise.resolve({ success: true, message: 'Tracked' }),
    clearRecentlyViewed: () => Promise.resolve({ success: true, message: 'Cleared' })
  },
  wishlist: {
    get: () => Promise.resolve({ items: [], count: 0 } as any),
    add: (productId: string) => Promise.resolve({ items: [mockProducts.find(p => p.id === productId)!], count: 1 } as any),
    remove: (productId: string) => Promise.resolve({ items: [], count: 0 } as any)
  },
  rfq: {
    get: () => apiClient.get<ApiResponse<any>>('/rfq').then(res => res.data),
    sync: (items: any[]) => apiClient.post<ApiResponse<any>>('/rfq/sync', { items }).then(res => res.data)
  },
  inquiries: {
    submit: (data: any) => apiClient.post<ApiResponse<any>>('/inquiries', data).then(res => res.data),
    getUserInquiries: () => apiClient.get<ApiResponse<any>>('/inquiries/user').then(res => {
      const result = res.data;
      const inquiries = Array.isArray(result) ? result : (result?.data || []);
      return inquiries;
    })
  },
  metrics: {
    getHealth: () => Promise.resolve({ success: true, status: 'ok' }),
    getStats: () => Promise.resolve({ success: true, data: { totalProducts: 50, totalClients: 5000, testedRate: '100%', certification: 'ISO 9001:2015' } })
  },
  settings: {
    get: () => apiClient.get<ApiResponse<SiteSettings>>('/settings').then(res => res.data),
    update: (data: SiteSettings) => apiClient.put<{ success: boolean; message: string; data: SiteSettings }>('/settings', data).then(res => res.data),
    upload: (formData: FormData) => apiClient.post<{ success: boolean; url: string; publicId: string }>('/settings/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(res => res.data)
  },
  client: apiClient
};

// Export types
export type { Product } from './endpoints';

// Export for backward compatibility
export { api as secureApi };
export const secureApiUtils = {
  clearAuthState: () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name.startsWith("accessToken") || name.startsWith("refreshToken")) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    });
    triggerLogout('manual_clear');
  }
};