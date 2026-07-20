// 🔥 ENVIRONMENT CONFIGURATION MANAGER
// Separates development and production configurations with fallback safety

import logger from '../lib/logger';

const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';
const isStaging = import.meta.env.VITE_APP_ENV === 'staging';

// Base URLs with fallback chain
const DEV_API_URL = 'http://localhost:3000/api/v1';
const PROD_API_URL = 'https://damodar-v1-0.onrender.com/api/v1';

const checkUrl = async (url: string): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second timeout
  try {
    const response = await fetch(`${url.replace('/api/v1', '')}/health`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      logger.info(`✅ Backend detected at: ${url}`);
      return url;
    }
    throw new Error(`Health check failed for ${url}`);
  } catch (error) {
    clearTimeout(timeoutId);
    logger.debug(`Backend not available at ${url}:`, error);
    throw error;
  }
};

// 🔥 AUTO-DETECT BACKEND AVAILABILITY
const detectBackendAvailability = async (): Promise<string> => {
  // Try common local development ports
  const localPorts = [5000, 3000, 8000, 4000, 8080];
  
  for (const port of localPorts) {
    try {
      const localUrl = `http://localhost:${port}/api/v1`;
      await checkUrl(localUrl);
      return localUrl;
    } catch (error) {
      // Continue to next port
    }
  }

  logger.debug('Local backend checks failed, checking production fallback...');
  try {
    const prodUrl = 'https://damodar-v1-0.onrender.com/api/v1';
    await checkUrl(prodUrl);
    return prodUrl;
  } catch (prodError) {
    logger.warn('⚠️ No backend detected, using default configuration');
    return DEV_API_URL;
  }
};

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

// API URL with multiple fallback layers and auto-detection
const getApiUrl = async (): Promise<string> => {
  const envUrl = import.meta.env.VITE_API_URL;

  // Priority 1: Environment-specific URLs
  if (currentEnv === 'production') {
    return import.meta.env.VITE_PROD_API_URL || PROD_API_URL;
  }

  if (currentEnv === 'staging') {
    return import.meta.env.VITE_STAGING_API_URL || envUrl || DEV_API_URL;
  }

  // Priority 2: Explicit development URL (If you set this in .env, we trust it unconditionally)
  if (envUrl) {
    logger.info(`✅ Using explicit VITE_API_URL from .env: ${envUrl}`);
    return envUrl;
  }

  // Priority 3: Auto-detect backend availability
  try {
    const detectedUrl = await detectBackendAvailability();
    return detectedUrl;
  } catch (error) {
    console.warn('Backend detection failed:', error);
  }

  // Priority 4: Auto-detect based on hostname
  const isLocalhost = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.');

  if (isLocalhost) {
    return DEV_API_URL;
  }

  // Priority 5: Production as fallback
  return PROD_API_URL;
};

// Environment-specific configuration
export const ENV_CONFIG = {
  // Environment Detection
  isDevelopment: currentEnv === 'development',
  isProduction: currentEnv === 'production',
  isStaging: currentEnv === 'staging',
  environment: currentEnv,

  // API Configuration with fallback safety
  API_URL: DEV_API_URL, // Will be updated after detection

  // Frontend URL with proper detection
  FRONTEND_URL: isProduction
    ? (import.meta.env.VITE_PROD_FRONTEND_URL || 'https://damoder.vercel.app')
    : (import.meta.env.VITE_FRONTEND_URL ||
      (window.location.origin !== 'null' ? window.location.origin : 'http://localhost:5173')),

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