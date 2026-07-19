// Custom hook for consistent API error handling and loading states
import { useState, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import logger from '@/lib/logger';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retryCount: number;
}

interface UseApiHandlerOptions {
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrors?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
}

export function useApiHandler<T = any>(options: UseApiHandlerOptions = {}) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    retryCount: 0
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (
    apiCall: () => Promise<T>,
    onSuccess?: (data: T) => void,
    onError?: (error: any) => void
  ) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    const {
      showSuccessToast = false,
      successMessage = 'Operation completed successfully',
      showErrors = true,
      retryOnError = false,
      maxRetries = 3
    } = optionsRef.current;

    const currentRetryCount = stateRef.current.retryCount;

    try {
      logger.debug('API call started', {
        hasSuccessCallback: !!onSuccess,
        hasErrorCallback: !!onError,
        showSuccessToast,
        showErrors
      });

      const data = await apiCall();

      setState({
        data,
        loading: false,
        error: null,
        retryCount: 0
      });

      if (showSuccessToast) {
        toast({
          title: "✅ Success",
          description: successMessage,
        });
      }

      if (onSuccess) {
        logger.debug('Calling success callback');
        onSuccess(data);
      }

      logger.debug('API call completed successfully');
      return data;
    } catch (error: any) {
      // Handle abort errors silently
      if (error.name === 'AbortError') {
        logger.debug('Request aborted by user or cleanup');
        return null;
      }

      const errorMessage = error.message || 'An unexpected error occurred';
      const errorContext = {
        message: errorMessage,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        retryCount: currentRetryCount + 1,
        maxRetries,
        willRetry: retryOnError && currentRetryCount < maxRetries
      };

      logger.error('API call failed', errorContext);

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }));

      if (showErrors && (!retryOnError || currentRetryCount >= maxRetries)) {
        const userFriendlyMessage = getUserFriendlyErrorMessage(error);
        toast({
          title: "🚨 Error",
          description: userFriendlyMessage,
          variant: "destructive",
        });
      }

      if (onError) {
        logger.debug('Calling error callback');
        onError(error);
      }

      throw error;
    }
  }, []);

  // Helper function to get user-friendly error messages
  const getUserFriendlyErrorMessage = (error: any): string => {
    const message = error.message?.toLowerCase() || '';
    const status = error.response?.status;

    // Network errors
    if (message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      status === 0) {
      return 'Network connection failed. Please check your internet connection.';
    }

    // Authentication errors
    if (status === 401 || status === 403 ||
      message.includes('unauthorized') ||
      message.includes('forbidden')) {
      return 'Authentication required. Please log in to continue.';
    }

    // Server errors
    if (status === 500 || status === 502 || status === 503 ||
      message.includes('server') ||
      message.includes('service unavailable')) {
      return 'Service temporarily unavailable. Please try again in a few moments.';
    }

    // Rate limiting
    if (status === 429 || message.includes('rate limit')) {
      return 'Too many requests. Please wait a moment before trying again.';
    }

    // Validation errors
    if (status === 400 || message.includes('validation')) {
      return 'Invalid input provided. Please check your entries and try again.';
    }

    // Default message
    return error.message || 'An unexpected error occurred. Please try again.';
  };

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      retryCount: 0
    });
  }, []);

  const retry = useCallback(() => {
    const { maxRetries = 3 } = optionsRef.current;
    if (stateRef.current.retryCount < maxRetries) {
      setState(prev => ({
        ...prev,
        retryCount: prev.retryCount + 1
      }));
    }
  }, []);

  // Cleanup on unmount
  // useEffect(() => {
  //   return () => {
  //     if (abortControllerRef.current) {
  //       abortControllerRef.current.abort();
  //     }
  //   };
  // }, []);

  return {
    ...state,
    execute,
    reset,
    retry,
    isLoading: state.loading,
    hasError: !!state.error,
    isSuccess: !state.loading && !state.error && state.data !== null
  };
}

// Specialized hooks for common operations
export function useProductApi() {
  return useApiHandler<any[]>({
    showErrors: true,
    retryOnError: true
  });
}

export function useAuthApi() {
  return useApiHandler<any>({
    showSuccessToast: true,
    showErrors: true
  });
}

export function useMutationApi<T>() {
  return useApiHandler<T>({
    showSuccessToast: true,
    successMessage: 'Changes saved successfully',
    showErrors: true
  });
}