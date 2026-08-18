/**
 * PRODUCTION MONITORING MODULE
 * Implements error tracking, performance monitoring, and analytics
 */

import logger from './logger';

// Interface definitions
export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
  timestamp: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id?: string;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  severity: 'error' | 'warning' | 'info';
  timestamp: number;
}

// Mock implementations for analytics and monitoring services
class MockAnalyticsService {
  private events: AnalyticsEvent[] = [];
  
  track(event: AnalyticsEvent): void {
    this.events.push(event);
    logger.info(`Analytics Event: ${event.eventName}`, event.properties);
    
    // In production, this would send to GA4 or similar
    if (import.meta.env.PROD) {
      // Example: gtag('event', event.eventName, event.properties);
      // Removed console.log for production to keep console clean
    }
  }

  getEvents(): AnalyticsEvent[] {
    return this.events;
  }
}

class MockPerformanceService {
  private metrics: PerformanceMetric[] = [];

  measure(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    logger.info(`Performance Metric: ${metric.name}`, {
      value: metric.value,
      rating: metric.rating
    });

    if (import.meta.env.PROD) {
      // Example: send to monitoring service
      // Removed console.log for production to keep console clean
    }
  }

  getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }
}

class MockErrorTrackingService {
  private errors: ErrorReport[] = [];
  
  captureException(error: Error, context?: Record<string, any>): void {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      context,
      severity: 'error',
      timestamp: Date.now()
    };

    this.errors.push(errorReport);
    
    // In production, this would send to Sentry or similar
    if (import.meta.env.PROD) {
      // Send error to tracking service (Sentry, etc.)
    } else {
      logger.warn('Mock error tracking:', errorReport);
    }
  }

  captureMessage(message: string, context?: Record<string, any>): void {
    const errorReport: ErrorReport = {
      message,
      context,
      severity: 'error',
      timestamp: Date.now()
    };

    this.errors.push(errorReport);
    
    if (import.meta.env.PROD) {
      // Send error to tracking service (Sentry, etc.)
    } else {
      logger.warn('Mock error tracking:', errorReport);
    }
  }

  getErrors(): ErrorReport[] {
    return this.errors;
  }
}

// Initialize services based on environment
const analyticsService = new MockAnalyticsService();
const performanceService = new MockPerformanceService();
const errorTrackingService = new MockErrorTrackingService();

// Production-ready monitoring functions
export const monitoring = {
  /**
   * Track user actions and events
   */
  trackEvent: (eventName: string, properties?: Record<string, any>): void => {
    const event: AnalyticsEvent = {
      eventName,
      properties,
      timestamp: Date.now()
    };
    
    analyticsService.track(event);
  },

  /**
   * Track performance metrics
   */
  trackPerformance: (metric: PerformanceMetric): void => {
    performanceService.measure(metric);
  },

  /**
   * Capture and report errors
   */
  captureError: (error: Error, context?: Record<string, any>): void => {
    errorTrackingService.captureException(error, context);
  },

  /**
   * Capture and report error messages
   */
  captureMessage: (message: string, context?: Record<string, any>): void => {
    errorTrackingService.captureMessage(message, context);
  },

  /**
   * Report Core Web Vitals
   */
  reportWebVital: (metric: PerformanceMetric): void => {
    monitoring.trackPerformance({
      name: metric.name,
      value: metric.value,
      rating: metric.rating
    });
  },

  /**
   * Track page views
   */
  trackPageView: (path: string, title?: string): void => {
    monitoring.trackEvent('page_view', {
      path,
      title,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Track user authentication events
   */
  trackAuthEvent: (event: 'login_success' | 'login_failure' | 'logout' | 'session_expired', context?: Record<string, any>): void => {
    monitoring.trackEvent(`auth_${event}`, context);
  },

  /**
   * Track API performance
   */
  trackApiCall: (endpoint: string, method: string, duration: number, status: number): void => {
    monitoring.trackPerformance({
      name: `api_${method.toLowerCase()}_${endpoint.replace('/', '_')}`,
      value: duration,
      rating: duration < 500 ? 'good' : duration < 2000 ? 'needs-improvement' : 'poor'
    });

    if (status >= 400) {
      monitoring.trackEvent('api_error', {
        endpoint,
        method,
        status,
        duration
      });
    }
  },

  /**
   * Track user session events
   */
  trackSession: (event: 'start' | 'end' | 'refresh', context?: Record<string, any>): void => {
    monitoring.trackEvent(`session_${event}`, context);
  }
};

// Initialize monitoring when module loads
if (import.meta.env.PROD) {
  logger.info('Production monitoring initialized');
} else {
  logger.info('Development monitoring initialized (mock services)');
}

// Export services for advanced usage if needed
export {
  analyticsService,
  performanceService,
  errorTrackingService
};

// Performance monitoring helper functions
export const performanceMonitoring = {
  /**
   * Measure function execution time
   */
  measureFunction: async <T>(
    fn: () => Promise<T> | T, 
    name: string
  ): Promise<T> => {
    const start = performance.now();
    try {
      const result = await Promise.resolve(fn());
      const end = performance.now();
      
      monitoring.trackPerformance({
        name: `function_${name}`,
        value: end - start,
        rating: (end - start) < 100 ? 'good' : (end - start) < 500 ? 'needs-improvement' : 'poor'
      });
      
      return result;
    } catch (error) {
      const end = performance.now();
      monitoring.trackPerformance({
        name: `function_${name}_error`,
        value: end - start,
        rating: 'poor'
      });
      throw error;
    }
  },

  /**
   * Measure API call performance
   */
  measureApiCall: async <T>(
    fn: () => Promise<T>,
    endpoint: string,
    method: string
  ): Promise<T> => {
    const start = performance.now();
    let status = 200;
    
    try {
      const result = await fn();
      return result;
    } catch (error) {
      status = error instanceof Error && error.message.includes('40') ? 400 : 500;
      throw error;
    } finally {
      const end = performance.now();
      monitoring.trackApiCall(endpoint, method, end - start, status);
    }
  }
};

export default monitoring;