// 🔥 ENVIRONMENT CONFIGURATION MANAGER
// Separates development and production configurations with fallback safety

import logger from '../lib/logger';

const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';
const isStaging = import.meta.env.VITE_APP_ENV === 'staging';

// No hardcoded URLs, relying solely on environment variables

// Determine environment automatically
const getEnvironmentType = (): 'development' | 'production' | 'staging' => {
  // Check for explicit staging
  if (isStaging) return 'staging';

  // Check for production indicators
  if (isProduction || window.location.hostname.includes('vercel.app') || window.location.hostname.includes('damoder.com')) {
    return 'production';
  }

  // Default to development
  return 'development';
};

const currentEnv = getEnvironmentType();

// API URL directly from environment variables
const getApiUrl = async (): Promise<string> => {
  const envUrl = import.meta.env.VITE_API_URL;

  if (envUrl) {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    if ((envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const fixedUrl = envUrl.replace(/localhost|127\.0\.0\.1/, hostname);
      logger.info(`✅ Using dynamic VITE_API_URL for network/mobile testing: ${fixedUrl}`);
      return fixedUrl;
    }
    logger.info(`✅ Using explicit VITE_API_URL from .env: ${envUrl}`);
    return envUrl;
  }

  logger.warn('⚠️ No VITE_API_URL found in environment variables! Please set it in .env or Vercel dashboard.');
  return '';
};

// Environment-specific configuration
export const ENV_CONFIG = {
  // Environment Detection
  isDevelopment: currentEnv === 'development',
  isProduction: currentEnv === 'production',
  isStaging: currentEnv === 'staging',
  environment: currentEnv,

  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || '', // Will be updated by initializeApiUrl

  // Frontend URL
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL ||
    (typeof window !== 'undefined' && window.location.origin !== 'null' ? window.location.origin : 'http://localhost:5173'),

  // Cookie Settings
  COOKIE_SETTINGS: {
    secure: currentEnv === 'production',
    sameSite: 'none' as const,
    path: '/',
    httpOnly: true
  },

  // Security Settings
  ENABLE_LOGGING: isDevelopment || import.meta.env.VITE_ENABLE_LOGGING === 'true',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,

  // Performance Settings
  REQUEST_TIMEOUT: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT || '60000'),
  CACHE_TTL: parseInt(import.meta.env.VITE_CACHE_TTL || '300000'),
  RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_RETRY_ATTEMPTS || '3'),

  // Deployment Domains
  VERCEL_DOMAIN: import.meta.env.VITE_VERCEL_DOMAIN,
  RENDER_DOMAIN: import.meta.env.VITE_RENDER_DOMAIN,

  // Auth Storage Keys
  JWT_STORAGE_KEY: import.meta.env.VITE_JWT_STORAGE_KEY || 'damoder_auth_token',
  REFRESH_TOKEN_KEY: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'damoder_refresh_token'
} as const;

// Validation function
export const validateEnvironment = (): string[] => {
  const errors: string[] = [];

  if (!ENV_CONFIG.API_URL) {
    errors.push('VITE_API_URL is required');
  }

  if (!ENV_CONFIG.GOOGLE_CLIENT_ID) {
    errors.push('VITE_GOOGLE_CLIENT_ID is required for Google OAuth');
  }

  return errors;
};

type ApiUrlListener = (url: string) => void;
const urlListeners = new Set<ApiUrlListener>();

export const onApiUrlChange = (listener: ApiUrlListener): () => void => {
  urlListeners.add(listener);
  if (ENV_CONFIG.API_URL) {
    listener(ENV_CONFIG.API_URL);
  }
  return () => {
    urlListeners.delete(listener);
  };
};

const notifyApiUrlChange = (url: string) => {
  urlListeners.forEach(listener => {
    try {
      listener(url);
    } catch (err) {
      logger.error('Error executing API URL change listener:', err);
    }
  });
};

// 🔥 Initialize API URL with backend detection
export const initializeApiUrl = async (): Promise<void> => {
  try {
    const detectedUrl = await getApiUrl();
    // Update readonly config property for runtime API URL changes
    (ENV_CONFIG as any).API_URL = detectedUrl;
    logger.info('✅ API URL initialized:', detectedUrl);
    notifyApiUrlChange(detectedUrl);
  } catch (error) {
    logger.warn('⚠️ Failed to initialize API URL, using default:', error);
  }
};

// Helper functions
export const isCrossOrigin = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const apiOrigin = new URL(ENV_CONFIG.API_URL).origin;
    const frontendOrigin = new URL(ENV_CONFIG.FRONTEND_URL).origin;
    return apiOrigin !== frontendOrigin;
  } catch {
    return false;
  }
};

export const getCookieDomain = (): string | undefined => {
  if (isDevelopment) return undefined;

  try {
    return new URL(ENV_CONFIG.FRONTEND_URL).hostname;
  } catch {
    return undefined;
  }
};

export default ENV_CONFIG;