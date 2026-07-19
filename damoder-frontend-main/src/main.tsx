import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";
import "./styles/mobile-touch.css"; // Mobile touch UX enhancements
import "./styles/accessibility.css"; // High contrast, lite mode, text scaling
import "./i18n"; // Import i18n configuration
import monitoring from "./lib/monitoring";
import logger from "./lib/logger";
import config from "./config/validateEnv"; // This will validate env vars on app start
import { initializeApiUrl } from "./config/environment.ts";
import { registerSW } from "virtual:pwa-register";

// Register PWA service worker for offline support
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New content available. Reload?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    logger.info("PWA is ready to work offline.");
  },
});

// 🔥 Initialize API URL with backend detection
const initializeApp = async () => {
  // Initialize API URL in background to mount UI immediately
  initializeApiUrl().catch((error) => {
    logger.warn('Failed to initialize API URL:', error);
  });

  // Initialize monitoring
  try {
    // Track initial page load
    monitoring.trackEvent('app_start', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      env: config.mode
    });
  } catch (error) {
    // Silently fail in production, log in development
    if (process.env.NODE_ENV === 'development') {
      logger.error('Failed to initialize monitoring:', error);
    }
  }

  // Capture unhandled errors
  window.addEventListener('error', (event) => {
    monitoring.captureError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      message: event.message,
      url: window.location.href
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    monitoring.captureError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      {
        type: 'unhandledrejection',
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    );
  });

  createRoot(document.getElementById("root")!).render(
    <App />
  );
};

initializeApp();
