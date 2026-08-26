// React Core
import { lazy, Suspense, useEffect } from "react";

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
import { MotionConfig } from "framer-motion";

// Context Providers
import { AccessibilityProvider } from "@/context/AccessibilityContext";

// Components
import ErrorBoundary from "@/components/common/ErrorBoundary";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomNavbar from "@/components/layout/MobileBottomNavbar";
import logger from "@/lib/logger";

// Lazy-loaded Pages
const Index = lazy(() => import("@/pages/Index"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Categories = lazy(() => import("@/pages/Categories"));
const CategoryDetails = lazy(() => import("@/pages/CategoryDetails"));
const Products = lazy(() => import("@/pages/Products"));
const ProductDetails = lazy(() => import("@/pages/ProductDetails"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('@/pages/TermsConditions'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogArticle = lazy(() => import('@/pages/BlogArticle'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Manufacturing = lazy(() => import('@/pages/Manufacturing'));
const RequestQuote = lazy(() => import('@/pages/RequestQuote'));
const Gallery = lazy(() => import('@/pages/Gallery'));
const Exports = lazy(() => import('@/pages/Exports'));
const Sustainability = lazy(() => import('@/pages/Sustainability'));

// Global Error Handling
const setupGlobalErrorHandling = () => {
  window.addEventListener('error', (event) => {
    logger.error('Global JavaScript Error:', {
      message: event.error?.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      url: window.location.href
    });

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

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled Promise Rejection:', {
      reason: event.reason,
      promise: event.promise,
      url: window.location.href
    });
    event.preventDefault();
  });
};

// Preload critical routes
const preloadCriticalRoutes = () => {
  setTimeout(() => {
    import("./pages/Products");
    import("./pages/Categories");
    setTimeout(() => {
      import("./pages/ProductDetails");
      import("./pages/About");
    }, 1000);
  }, 1000);
};

// Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  },
});

// Route Loader
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
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:slug" element={<CategoryDetails />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/custom-manufacturing" element={<Manufacturing />} />
        <Route path="/request-quote" element={<RequestQuote />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogArticle />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/exports" element={<Exports />} />
        <Route path="/sustainability" element={<Sustainability />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
};

const App = () => {
  useEffect(() => {
    setupGlobalErrorHandling();
    preloadCriticalRoutes();
  }, []);

  return (
    <HelmetProvider>
      <AccessibilityProvider>
        <MotionConfig>
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
                <WhatsAppButton />
                <MobileBottomNavbar />
                <ErrorBoundary
                  showDetails={import.meta.env.DEV}
                  onError={(error, errorInfo) => {
                    console.error('Global Error Boundary caught:', error, errorInfo);
                  }}
                >
                  <ScrollOffsetProvider offset={100}>
                    <Suspense fallback={<RouteLoader />}>
                      <div className="pb-20 md:pb-0 min-h-screen flex flex-col w-full">
                        <AppRoutes />
                      </div>
                    </Suspense>
                  </ScrollOffsetProvider>
                </ErrorBoundary>
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </MotionConfig>
      </AccessibilityProvider>
    </HelmetProvider>
  );
};

export default App;