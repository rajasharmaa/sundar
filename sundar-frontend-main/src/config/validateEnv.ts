/**
 * Validates required environment variables at build time
 */

function validateEnv() {
  const required = ['VITE_API_URL'];
  const optional = ['VITE_GOOGLE_CLIENT_ID', 'VITE_SENTRY_DSN'];

  // Check required variables
  for (const key of required) {
    const value = import.meta.env[key as keyof ImportMetaEnv];
    if (!value) {
      throw new Error(`❌ Missing required environment variable: ${key}`);
    }

    // Validate URL format for VITE_API_URL
    if (key === 'VITE_API_URL') {
      try {
        new URL(value);
      } catch {
        throw new Error(`❌ Invalid URL for ${key}: ${value}`);
      }
    }
  }

  // Validate optional variables (if present)
  for (const key of optional) {
    const value = import.meta.env[key as keyof ImportMetaEnv];
    if (value) {
      // Sentry DSN format validation
      if (key === 'VITE_SENTRY_DSN' && !value.startsWith('https://')) {
        throw new Error(`❌ Invalid Sentry DSN: ${value}`);
      }
    }
  }


}

validateEnv();

export const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
};

export default config;