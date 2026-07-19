/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * PRODUCTION-GRADE LOGGER
 * Features: Environment-aware logging, no sensitive data exposure
 */

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

// Sensitive patterns to redact
const SENSITIVE_PATTERNS = [
  /token["\s:=]+([^\s"',}]+)/gi,
  /password["\s:=]+([^\s"',}]+)/gi,
  /bearer\s+([^\s]+)/gi,
  /authorization["\s:=]+([^\s"',}]+)/gi,
  /email["\s:=]+([^\s"',}]+)/gi,
];

function redactSensitive(message: string): string {
  if (!message || typeof message !== 'string') return message;
  
  let redacted = message;
  SENSITIVE_PATTERNS.forEach(pattern => {
    redacted = redacted.replace(pattern, (match, capture) => {
      const prefix = match.substring(0, match.length - capture.length);
      return prefix + '[REDACTED]';
    });
  });
  return redacted;
}

function formatArgs(...args: any[]): any[] {
  return args.map(arg => {
    if (typeof arg === 'string') {
      return redactSensitive(arg);
    }
    if (typeof arg === 'object' && arg !== null) {
      try {
        return JSON.parse(redactSensitive(JSON.stringify(arg)));
      } catch {
        return arg;
      }
    }
    return arg;
  });
}

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDev) {
      console.log(`[INFO] ${message}`, ...formatArgs(...args));
    } else if (isProd) {
      // Production: Only log to monitored service (e.g., Sentry)
      // console.log not called in production
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, ...formatArgs(...args));
    } else if (isProd) {
      // Production: Only log warnings in development or to monitored service
    }
  },

  debug: (message: string, ...args: any[]) => {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, ...formatArgs(...args));
    }
    // Never log debug in production
  },

  error: (message: string, error?: any) => {
    if (isDev) {
      console.error(`[ERROR] ${message}`, error);
    } else if (isProd) {
      // Production: Log to error tracking service (Sentry, LogRocket, etc.)
      // Don't expose stack traces to console
      console.error(`[ERROR] ${message}`);
      // Could send to error tracking service here
      // sentryCapture({ message, error });
    }
  },

  table: (data: any) => {
    if (isDev && typeof console.table === 'function') {
      console.table(data);
    }
  }
};

export default logger;
