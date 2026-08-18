// 🔥 SERVER HEALTH CHECK UTILITY
// Pre-login server status detection with cold start awareness

import logger from '@/lib/logger';
import { ENV_CONFIG } from '@/config/environment';

interface HealthCheckResult {
  isHealthy: boolean;
  isColdStart: boolean;
  retryAfter?: number;
  message?: string;
  responseTime: number;
}

interface ServerStatus {
  isHealthy: boolean;
  isColdStart: boolean;
  isWarming: boolean;
  lastCheck: number;
  retryAfter?: number;
}

// Server status cache
let serverStatus: ServerStatus = {
  isHealthy: false,
  isColdStart: false,
  isWarming: false,
  lastCheck: 0
};

// Cache expiration (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

/**
 * Check if server status cache is still valid
 */
const isCacheValid = (): boolean => {
  return Date.now() - serverStatus.lastCheck < CACHE_EXPIRATION;
};

/**
 * Detect if we're in a production environment
 */
const isProductionEnvironment = (): boolean => {
  return ENV_CONFIG.isProduction || 
         window.location.hostname.includes('vercel.app') ||
         window.location.hostname.includes('damoder.com');
};

/**
 * Get health endpoint URL
 */
const getHealthEndpoint = (): string => {
  const baseUrl = ENV_CONFIG.API_URL.replace('/api/v1', '');
  return `${baseUrl}/health`;
};

/**
 * Perform health check with timeout and retry logic
 */
export const checkServerHealth = async (options: {
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
} = {}): Promise<HealthCheckResult> => {
  const { timeout = 10000, retries = 2, signal } = options;
  
  // Return cached result if still valid and server is healthy
  if (isCacheValid() && serverStatus.isHealthy && !serverStatus.isColdStart) {
    logger.debug('Using cached server health status');
    return {
      isHealthy: true,
      isColdStart: false,
      responseTime: 0
    };
  }

  const healthEndpoint = getHealthEndpoint();
  const startTime = Date.now();

  logger.info('🔍 Checking server health...', { endpoint: healthEndpoint });

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // Use signal if provided
      if (signal) {
        signal.addEventListener('abort', () => controller.abort());
      }

      const response = await fetch(healthEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
          // Removed custom headers to prevent CORS issues
        },
        signal: controller.signal,
        // Don't include credentials for health check
        credentials: 'omit'
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      
      // Since backend health endpoint now always returns 200, we don't need to check response.ok
      const data = await response.json();
      const isColdStart = data.coldStart || data.isColdStart || false;
      
      logger.info('✅ Server health check successful', {
        status: response.status,
        isColdStart,
        uptime: data.uptime,
        responseTime
      });

      // Update cache
      serverStatus = {
        isHealthy: true,
        isColdStart: isColdStart,
        isWarming: isColdStart,
        lastCheck: Date.now()
      };

      return {
        isHealthy: true,
        isColdStart: isColdStart,
        responseTime
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      // Handle different error types
      const isTimeout = error.name === 'AbortError' || error.name === 'TimeoutError';
      const isNetworkError = error.name === 'TypeError' && error.message.includes('fetch');
      const isConnectionRefused = error.message?.includes('ECONNREFUSED') || 
                                error.message?.includes('connection refused');

      logger.warn(`Health check attempt ${attempt} failed`, {
        error: error.message,
        isTimeout,
        isNetworkError,
        isConnectionRefused,
        responseTime
      });

      // If this is the last attempt, return a safe result to not block the UI
      if (attempt === retries + 1) {
        serverStatus = {
          isHealthy: true, // Mark as healthy to allow UI to proceed
          isColdStart: true, // Indicate it's still warming up
          isWarming: true,
          lastCheck: Date.now()
        };

        return {
          isHealthy: true, // Always return true to not block UI
          isColdStart: true, // But indicate server is still starting
          message: isTimeout 
            ? 'Server check timed out but continuing' 
            : isNetworkError 
              ? 'Server unreachable but continuing' 
              : 'Server unavailable but continuing',
          responseTime
        };
      }

      // Wait before retry with exponential backoff
      const retryDelay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  // This should never be reached due to the loop logic
  return {
    isHealthy: false,
    isColdStart: false,
    responseTime: Date.now() - startTime
  };
};

/**
 * Wait for server to be ready with progress updates
 */
export const waitForServerReady = async (
  onProgress?: (progress: number, message: string) => void
): Promise<boolean> => {
  const maxWaitTime = 60000; // 60 seconds max
  const checkInterval = 3000; // Check every 3 seconds
  const startTime = Date.now();

  // Initial check
  const initialCheck = await checkServerHealth();
  
  if (initialCheck.isHealthy) {
    onProgress?.(100, 'Server is ready!');
    return true;
  }

  if (!initialCheck.isColdStart) {
    onProgress?.(0, 'Server appears to be down');
    return false;
  }

  // Server is in cold start, wait for it to warm up
  onProgress?.(10, 'Server is starting up...');
  
  let lastProgress = 10;
  
  while (Date.now() - startTime < maxWaitTime) {
    const check = await checkServerHealth();
    
    if (check.isHealthy) {
      onProgress?.(100, 'Server is ready!');
      return true;
    }
    
    if (!check.isColdStart) {
      onProgress?.(lastProgress, 'Server failed to start');
      return false;
    }
    
    // Update progress based on retryAfter if available
    const elapsed = Date.now() - startTime;
    const estimatedTotal = (check.retryAfter || 15) * 1000;
    const progress = Math.min(90, Math.round((elapsed / estimatedTotal) * 80) + 10);
    
    if (progress > lastProgress) {
      lastProgress = progress;
      onProgress?.(progress, `Server warming up... (${Math.round(elapsed/1000)}s)`);
    }
    
    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }

  onProgress?.(90, 'Server warmup taking longer than expected');
  return false;
};

/**
 * Get current server status from cache
 */
export const getServerStatus = (): ServerStatus => {
  // Return fresh status if cache expired
  if (!isCacheValid()) {
    return {
      isHealthy: false,
      isColdStart: false,
      isWarming: false,
      lastCheck: 0
    };
  }
  
  return { ...serverStatus };
};

/**
 * Clear server status cache
 */
export const clearServerStatus = (): void => {
  serverStatus = {
    isHealthy: false,
    isColdStart: false,
    isWarming: false,
    lastCheck: 0
  };
  logger.debug('Server status cache cleared');
};

/**
 * Pre-flight check before login attempts
 */
export const preflightLoginCheck = async (
  onProgress?: (progress: number, message: string) => void
): Promise<{ canProceed: boolean; message?: string }> => {
  try {
    onProgress?.(0, 'Checking server status...');
    
    const health = await checkServerHealth({ timeout: 15000 });
    
    if (health.isHealthy && !health.isColdStart) {
      onProgress?.(100, 'Server is ready for login');
      return { canProceed: true };
    }
    
    if (health.isColdStart) {
      onProgress?.(20, 'Server is initializing...');
      
      // Don't wait indefinitely for server to be ready - allow login to proceed
      // const serverReady = await waitForServerReady(onProgress);
      
      // Allow login to proceed during cold start to prevent blocking UI
      onProgress?.(100, 'Server warming up, allowing login...');
      return { canProceed: true, message: 'Server is waking up, login may take slightly longer' };
    }
    
    // Even if server seems down, allow login to proceed to prevent blocking UI
    onProgress?.(100, 'Continuing with login...');
    return { 
      canProceed: true, 
      message: 'Server may be waking up, please try login' 
    };
    
  } catch (error: any) {
    logger.error('Preflight login check failed', { error: error.message });
    // Always allow proceeding to prevent blocking UI
    return { 
      canProceed: true, 
      message: 'Unable to connect to authentication service, but continuing' 
    };
  }
};

export default {
  checkServerHealth,
  waitForServerReady,
  getServerStatus,
  clearServerStatus,
  preflightLoginCheck
};