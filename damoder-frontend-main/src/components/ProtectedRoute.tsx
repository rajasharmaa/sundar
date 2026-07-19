/**
 * PROTECTED ROUTE COMPONENT
 * Guards routes that require authentication
 * Handles loading states and redirects properly
 */

import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '@/context/AuthContext';
import logger from '@/lib/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const authContext = useContext(AuthContext);
  const location = useLocation();

  // Defensive: Handle case where AuthContext is not available (shouldn't happen but prevents crashes)
  if (!authContext) {
    logger.warn('AuthContext not available, showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const { isAuthenticated, isLoading, authReady, initializing } = authContext;

  // ------------------------------------------
  // Auth initialization state - show loading
  // ------------------------------------------
  if (!authReady || initializing) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // Loading state - show nothing or fallback
  // ------------------------------------------
  if (isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ------------------------------------------
  // Not authenticated - redirect to login
  // ------------------------------------------
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ------------------------------------------
  // Authenticated - render children
  // ------------------------------------------
  return <>{children}</>;
}

export default ProtectedRoute;
