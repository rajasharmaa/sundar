import React, { Component, ErrorInfo, ReactNode } from 'react';
import logger from '@/lib/logger';

// 🔐 ERROR BOUNDARY PROPS
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean; // Show error details in production
}

// 🔐 ERROR BOUNDARY STATE
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

// 🔐 PRODUCTION ERROR REPORTING SERVICE
class ErrorReportingService {
  private static instance: ErrorReportingService;

  private constructor() { }

  static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  generateErrorId(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  reportError(error: Error, errorInfo?: ErrorInfo, errorId?: string): void {
    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Simulate sending to external service like Sentry/NewRelic
      logger.error('Production Error Report:', {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

      // Here you would integrate with actual error reporting service
      // Example: Sentry.captureException(error);
    }
  }

  getErrorMessage(error: Error): string {
    // Categorize errors for user-friendly messages with enhanced classification
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('etimedout')) {
      return 'Network connection failed. Please check your internet connection and try again.';
    }

    // Authentication errors
    if (message.includes('unauthorized') ||
      message.includes('401') ||
      message.includes('403') ||
      message.includes('forbidden') ||
      message.includes('authentication')) {
      return 'Authentication required. Please log in to continue.';
    }

    // Resource loading errors
    if (message.includes('chunk') ||
      message.includes('loading') ||
      message.includes('module') ||
      message.includes('import')) {
      return 'Failed to load application resources. Please refresh the page or try again later.';
    }

    // Memory errors
    if (message.includes('out of memory') ||
      message.includes('allocation') ||
      message.includes('heap')) {
      return 'Application ran out of memory. Please close other tabs and restart the application.';
    }

    // Database/API errors
    if (message.includes('database') ||
      message.includes('500') ||
      message.includes('server') ||
      message.includes('service unavailable') ||
      message.includes('503')) {
      return 'Service temporarily unavailable. Please try again in a few moments.';
    }

    // Validation errors
    if (message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required')) {
      return 'Invalid input provided. Please check your entries and try again.';
    }

    // Rate limiting
    if (message.includes('rate limit') ||
      message.includes('429') ||
      message.includes('too many requests')) {
      return 'Too many requests. Please wait a moment before trying again.';
    }

    return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
  }
}

// 🔐 UNIVERSAL ERROR BOUNDARY COMPONENT
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorService: ErrorReportingService;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    this.errorService = ErrorReportingService.getInstance();
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    const errorId = ErrorReportingService.getInstance().generateErrorId();
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Generate unique error ID for tracking
    const errorId = this.state.errorId || this.errorService.generateErrorId();

    // Log the error with comprehensive context
    logger.error('React Error Boundary caught an error:', {
      errorId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });

    // Report to external error monitoring service
    this.errorService.reportError(error, errorInfo, errorId);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({ error, errorInfo, errorId });
  }

  handleRetry = () => {
    // Clear error state and attempt recovery
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined
    });
  };

  handleReload = () => {
    // Force page reload for critical errors
    window.location.reload();
  };

  handleCopyError = () => {
    // Copy error details to clipboard for user support
    const errorDetails = `
Error ID: ${this.state.errorId}
Message: ${this.state.error?.message}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
Browser: ${navigator.userAgent}
    `.trim();

    navigator.clipboard.writeText(errorDetails).then(() => {
      alert('Error details copied to clipboard!');
    }).catch(() => {
      // Fallback for browsers that don't support clipboard API
      prompt('Copy this error information:', errorDetails);
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Enhanced default fallback UI with production features
      const userFriendlyMessage = this.state.error
        ? this.errorService.getErrorMessage(this.state.error)
        : 'An unexpected error occurred';

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
          <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center border border-red-100 dark:border-gray-700">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
              <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Error Title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Application Error
            </h2>

            {/* User-friendly message */}
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {userFriendlyMessage}
            </p>

            {/* Error ID for support */}
            {this.state.errorId && (
              <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Error ID: <span className="font-mono text-gray-700 dark:text-gray-300">{this.state.errorId}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Please include this ID when contacting support
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <button
                onClick={this.handleRetry}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Reload Page
              </button>
            </div>

            {/* Advanced Options */}
            {(this.props.showDetails || process.env.NODE_ENV === 'development') && this.state.error && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="space-y-4">
                  <button
                    onClick={this.handleCopyError}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                  >
                    Copy Error Details
                  </button>

                  <details className="text-left">
                    <summary className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                      Technical Details
                    </summary>
                    <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-60 font-mono">
                        <strong>Message:</strong> {this.state.error.message}
                        {'\n\n'}
                        <strong>Stack Trace:</strong>
                        {this.state.error.stack}
                        {'\n\n'}
                        <strong>Component Stack:</strong>
                        {this.state.errorInfo?.componentStack}
                      </pre>
                    </div>
                  </details>
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Need help? Contact support with the error ID above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;