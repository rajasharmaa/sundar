// React Core
import { lazy, Suspense, useState, useEffect, useCallback } from "react";

// Third-party Libraries
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";

// UI Components
import { Toaster } from "@/components/common/ui/toaster";
import { Toaster as Sonner } from "@/components/common/ui/sonner";
import { TooltipProvider } from "@/components/common/ui/tooltip";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ScrollOffsetProvider } from "@/components/ui/ScrollOffsetProvider";
import PopupBanner from "@/components/PopupBanner";

// Context Providers
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CompareProvider } from "@/context/CompareContext";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { RfqProvider } from "@/context/RfqContext";

// Components
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import WhatsAppButton from "@/components/WhatsAppButton";
import { AuthLoadingWrapper } from "@/components/AuthLoadingWrapper";
import { ServerStatusOverlay } from "@/components/common/ServerStatusOverlay";
import FloatingInquiryButton from "@/components/inquiry/FloatingInquiryButton";
import MobileBottomNavbar from "@/components/layout/MobileBottomNavbar";
import logger from "@/lib/logger";



// 🔧 OPTIMIZED CODE SPLITTING WITH PRELOADING
const Index = lazy(() => import("@/pages/Index"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Categories = lazy(() => import("@/pages/Categories"));
const Products = lazy(() => import("@/pages/Products"));
const ProductDetails = lazy(() => import("@/pages/ProductDetails"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Account = lazy(() => import("@/pages/Account"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('@/pages/TermsConditions'));
const RfqPage = lazy(() => import("@/pages/RfqPage"));
// Note: UIDemo only loaded in dev mode
const UIDemo = import.meta.env.DEV
  ? lazy(() => import("@/pages/UIDemo"))
  : lazy(() => Promise.resolve({ default: () => null }));
const Blog = lazy(() => import('@/pages/Blog'));
const Careers = lazy(() => import('@/pages/Careers'));
const Certifications = lazy(() => import('@/pages/Certifications'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Events = lazy(() => import('@/pages/Events'));
const Resources = lazy(() => import('@/pages/Resources'));

// 🔧 ENHANCED GLOBAL ERROR HANDLING
const setupGlobalErrorHandling = () => {
  // Handle uncaught JavaScript errors (including ChunkLoadErrors)
  window.addEventListener('error', (event) => {
    logger.error('Global JavaScript Error:', {
      message: event.error?.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      url: window.location.href
    });

    // 🔧 M1-7 FIX: Handle chunk loading errors in the same listener (was duplicate)
    if (
      event.error?.message?.includes('ChunkLoadError') ||
      event.message?.includes('Loading chunk') ||
      event.error?.name === 'ChunkLoadError'
    ) {
      logger.warn('Chunk loading failed, attempting reload:', event.error?.message);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled Promise Rejection:', {
      reason: event.reason,
      promise: event.promise,
      url: window.location.href
    });
    event.preventDefault();
  });
};

// 🚀 PERFORMANCE: Preload critical routes with priority
const preloadCriticalRoutes = () => {
  // Preload commonly visited pages with priority
  setTimeout(() => {
    // Priority 1: Most visited pages
    import("./pages/Products");
    import("./pages/Categories");

    // Priority 2: Secondary pages
    setTimeout(() => {
      import("./pages/ProductDetails");
      import("./pages/About");
    }, 1000);
  }, 1000); // Start after initial render
};

// 🚀 PERFORMANCE: Lazy load heavy 3D component only when needed
const Product3DView = lazy(() => import('@/components/pages/Product3DView'));

// 🔧 OPTIMIZED QUERY CLIENT FOR FREE TIER - ENHANCED CACHING
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // 🔥 FIX: Reduced from 30min to 2min so price changes reflect quickly
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes garbage collection
      refetchOnWindowFocus: true,  // Re-fetch when user switches tabs back — picks up price changes
      refetchOnMount: true,        // Always check for fresh data on mount
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// 🔧 MINIMAL LOADING SPINNER FOR ROUTE TRANSITIONS ONLY
const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="md" />
  </div>
);

const AppRoutes = () => {
  const location = useLocation();

  return (
    <PageTransition>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/rfq" element={<RfqPage />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        {import.meta.env.DEV && <Route path="/ui-demo" element={<UIDemo />} />}
        <Route path="/blog" element={<Blog />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/certifications" element={<Certifications />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/events" element={<Events />} />
        <Route path="/catalog" element={<Resources />} />
        <Route path="/specs" element={<Resources />} />
        <Route path="/guides" element={<Resources />} />
        {/* /wishlist redirects to /account (wishlist tab is inside Account) */}
        <Route path="/wishlist" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
};

const App = () => {
  // Setup global error handling
  useEffect(() => {
    setupGlobalErrorHandling();
    preloadCriticalRoutes();
  }, []);

  // Render app with auth loading overlay
  return (
    <HelmetProvider>
      <AccessibilityProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <AuthProvider>
                <SocketProvider>
                  <WishlistProvider>
                    <CompareProvider>
                      <RfqProvider>
                        <AuthLoadingWrapper />
                        <ServerStatusOverlay />
                        <WhatsAppButton />
                        <FloatingInquiryButton />
                        <PopupBanner />
                        <MobileBottomNavbar />
                        <ErrorBoundary
                          showDetails={import.meta.env.DEV}
                          onError={(error, errorInfo) => {
                            console.error('Global Error Boundary caught:', error, errorInfo);
                          }}
                        >
                          {/* Global scroll offset provider for fixed navbar */}
                          <ScrollOffsetProvider offset={100}>
                            <Suspense fallback={<RouteLoader />}>
                              <div className="pb-20 md:pb-0">
                                <AppRoutes />
                              </div>
                            </Suspense>
                          </ScrollOffsetProvider>
                        </ErrorBoundary>
                      </RfqProvider>
                    </CompareProvider>
                  </WishlistProvider>
                </SocketProvider>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </AccessibilityProvider>
    </HelmetProvider>
  );
};

export default App;