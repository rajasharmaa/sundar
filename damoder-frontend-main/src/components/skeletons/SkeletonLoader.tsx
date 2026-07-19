// src/components/SkeletonLoader.tsx
import { motion } from 'framer-motion';

// 🔧 Global Skeleton Theme
const SKELETON_CONFIG = {
  baseColor: 'bg-gray-200',
  highlightColor: 'bg-gray-300',
  animationDuration: 1.5,
  borderRadius: 'rounded-lg',
  shimmerGradient: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)'
};

// 🔧 Shimmer Animation Component
const Shimmer = () => (
  <motion.div
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
    initial={{ x: '-100%' }}
    animate={{ x: '100%' }}
    transition={{
      duration: SKELETON_CONFIG.animationDuration,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

// 🔧 Base Skeleton Wrapper
interface SkeletonWrapperProps {
  className?: string;
  children?: React.ReactNode;
  showShimmer?: boolean;
}

const SkeletonWrapper = ({ 
  className = '', 
  children, 
  showShimmer = true 
}: SkeletonWrapperProps) => (
  <div className={`relative overflow-hidden ${SKELETON_CONFIG.baseColor} ${SKELETON_CONFIG.borderRadius} ${className}`}>
    {children}
    {showShimmer && <Shimmer />}
  </div>
);

// 🔧 Card Skeleton - For product cards, category cards
export const CardSkeleton = ({ count = 1 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <motion.div
        key={index}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        {/* Image skeleton */}
        <SkeletonWrapper className="w-full h-48" />
        
        <div className="p-4">
          {/* Title skeleton */}
          <SkeletonWrapper className="h-5 w-3/4 mb-2" />
          
          {/* Description skeleton */}
          <SkeletonWrapper className="h-4 w-full mb-1" />
          <SkeletonWrapper className="h-4 w-5/6 mb-3" />
          
          {/* Price skeleton */}
          <div className="flex items-center justify-between">
            <SkeletonWrapper className="h-6 w-16" />
            <SkeletonWrapper className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

// 🔧 List Skeleton - For lists, tables
export const ListSkeleton = ({ 
  count = 5, 
  hasAvatar = true, 
  hasActions = false 
}: { 
  count?: number; 
  hasAvatar?: boolean; 
  hasActions?: boolean; 
}) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, index) => (
      <motion.div
        key={index}
        className="flex items-center p-4 bg-white rounded-lg border border-gray-100"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        {hasAvatar && (
          <SkeletonWrapper className="w-12 h-12 rounded-full mr-4" />
        )}
        
        <div className="flex-1">
          <SkeletonWrapper className="h-5 w-1/3 mb-2" />
          <SkeletonWrapper className="h-4 w-2/3" />
        </div>
        
        {hasActions && (
          <div className="flex space-x-2">
            <SkeletonWrapper className="h-8 w-8 rounded" />
            <SkeletonWrapper className="h-8 w-8 rounded" />
          </div>
        )}
      </motion.div>
    ))}
  </div>
);

// 🔧 Page Header Skeleton
export const PageHeaderSkeleton = () => (
  <div className="mb-8">
    <SkeletonWrapper className="h-10 w-64 mb-4" />
    <SkeletonWrapper className="h-5 w-96 max-w-full" />
  </div>
);

// 🔧 Text Content Skeleton
export const TextSkeleton = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonWrapper
        key={index}
        className={`h-4 ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
);

// 🔧 Profile Section Skeleton
export const ProfileSkeleton = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center mb-6">
      <SkeletonWrapper className="w-20 h-20 rounded-full mr-6" />
      <div className="flex-1">
        <SkeletonWrapper className="h-7 w-48 mb-2" />
        <SkeletonWrapper className="h-5 w-32" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SkeletonWrapper className="h-12" />
      <SkeletonWrapper className="h-12" />
      <SkeletonWrapper className="h-12" />
      <SkeletonWrapper className="h-12" />
    </div>
  </div>
);

// 🔧 Dashboard Stats Skeleton
export const DashboardStatsSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {Array.from({ length: count }).map((_, index) => (
      <motion.div
        key={index}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <SkeletonWrapper className="h-5 w-24 mb-2" />
            <SkeletonWrapper className="h-8 w-32" />
          </div>
          <SkeletonWrapper className="w-12 h-12 rounded-full" />
        </div>
      </motion.div>
    ))}
  </div>
);

// 🔧 Form Skeleton
export const FormSkeleton = ({ 
  fields = 3,
  hasSubmit = true
}: { 
  fields?: number; 
  hasSubmit?: boolean; 
}) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index}>
          <SkeletonWrapper className="h-5 w-24 mb-2" />
          <SkeletonWrapper className="h-12 w-full" />
        </div>
      ))}
      
      {hasSubmit && (
        <div className="pt-4">
          <SkeletonWrapper className="h-12 w-full" />
        </div>
      )}
    </div>
  </div>
);

// 🔧 Table Skeleton
export const TableSkeleton = ({ 
  rows = 5, 
  columns = 4 
}: { 
  rows?: number; 
  columns?: number; 
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    {/* Table header */}
    <div className="border-b border-gray-200 p-4">
      <div className="grid grid-cols-12 gap-4">
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonWrapper key={index} className="h-5" />
        ))}
      </div>
    </div>
    
    {/* Table rows */}
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <motion.div
          key={rowIndex}
          className="p-4 grid grid-cols-12 gap-4 items-center"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: rowIndex * 0.05 }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonWrapper key={colIndex} className="h-4" />
          ))}
        </motion.div>
      ))}
    </div>
  </div>
);

// 🔧 Media Gallery Skeleton
export const MediaGallerySkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <motion.div
        key={index}
        className="aspect-square rounded-lg overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <SkeletonWrapper className="w-full h-full" />
      </motion.div>
    ))}
  </div>
);

// 🔧 Search Bar Skeleton
export const SearchSkeleton = () => (
  <div className="relative mb-8">
    <SkeletonWrapper className="h-14 w-full" />
    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-2">
      <SkeletonWrapper className="w-6 h-6 rounded-full" />
      <SkeletonWrapper className="w-6 h-6 rounded-full" />
    </div>
  </div>
);

// 🔧 Banner/Image Skeleton
export const BannerSkeleton = ({ height = 'h-64' }: { height?: string }) => (
  <div className={`relative ${height} rounded-xl overflow-hidden mb-8`}>
    <SkeletonWrapper className="w-full h-full" />
  </div>
);

// 🔧 Combined Page Skeleton (Header + Content)
export const PageSkeleton = ({ 
  hasHeader = true,
  content = 'cards',
  itemCount = 8
}: { 
  hasHeader?: boolean;
  content?: 'cards' | 'list' | 'table' | 'profile' | 'dashboard' | 'hero' | 'features' | 'categories' | 'contact' | 'stats' | 'dashboard-stats' | 'media-gallery' | 'search' | 'banner' | 'form' | 'text' | 'page-header' | 'table-data' | 'list-items' | 'profile-card' | 'stats-cards' | 'gallery' | 'search-bar' | 'banner-image' | 'form-fields' | 'text-content' | 'page-title' | 'table-rows' | 'list-with-avatar' | 'profile-section';
  itemCount?: number;
}) => (
  <div className="animate-pulse">
    {hasHeader && <PageHeaderSkeleton />}
    
    {content === 'cards' && <CardSkeleton count={itemCount} />}
    {content === 'list' && <ListSkeleton count={itemCount} />}
    {content === 'table' && <TableSkeleton rows={itemCount} />}
    {content === 'profile' && <ProfileSkeleton />}
    {content === 'dashboard' && <DashboardSkeleton />}
    {content === 'hero' && <HeroSkeleton />}
    {content === 'features' && <FeaturesSkeleton />}
    {content === 'categories' && <CategoriesSkeleton />}
    {content === 'contact' && <ContactFormSkeleton />}
    {content === 'stats' && <StatsSkeleton />}
    {content === 'dashboard-stats' && <DashboardStatsSkeleton count={itemCount} />}
    {content === 'media-gallery' && <MediaGallerySkeleton count={itemCount} />}
    {content === 'search' && <SearchSkeleton />}
    {content === 'banner' && <BannerSkeleton height="h-64" />}
    {content === 'form' && <FormSkeleton fields={itemCount} hasSubmit={true} />}
    {content === 'text' && <TextSkeleton lines={itemCount} />}
    {content === 'page-header' && <PageHeaderSkeleton />}
    {content === 'table-data' && <TableSkeleton rows={itemCount} columns={4} />}
    {content === 'list-items' && <ListSkeleton count={itemCount} hasAvatar={true} hasActions={false} />}
    {content === 'profile-card' && <ProfileSkeleton />}
    {content === 'stats-cards' && <DashboardStatsSkeleton count={itemCount} />}
    {content === 'gallery' && <MediaGallerySkeleton count={itemCount} />}
    {content === 'search-bar' && <SearchSkeleton />}
    {content === 'banner-image' && <BannerSkeleton height="h-64" />}
    {content === 'form-fields' && <FormSkeleton fields={itemCount} hasSubmit={true} />}
    {content === 'text-content' && <TextSkeleton lines={itemCount} />}
    {content === 'page-title' && <PageHeaderSkeleton />}
    {content === 'table-rows' && <TableSkeleton rows={itemCount} columns={4} />}
    {content === 'list-with-avatar' && <ListSkeleton count={itemCount} hasAvatar={true} hasActions={false} />}
    {content === 'profile-section' && <ProfileSkeleton />}
  </div>
);

// 🔧 Enhanced Loading Overlay Component with Progressive Indicators
export const LoadingOverlay = ({ 
  isLoading = false,
  message = 'Loading...',
  variant = 'fullscreen' as 'fullscreen' | 'component' | 'page',
  showProgress = false,
  progress = 0,
  showSteps = false,
  currentStep = 0,
  totalSteps = 0
}: { 
  isLoading?: boolean; 
  message?: string;
  variant?: 'fullscreen' | 'component' | 'page';
  showProgress?: boolean;
  progress?: number;
  showSteps?: boolean;
  currentStep?: number;
  totalSteps?: number;
}) => {
  if (!isLoading) return null;
  
  const overlayClasses = {
    fullscreen: 'fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm',
    page: 'absolute inset-0 z-40 flex items-center justify-center bg-white/80 backdrop-blur-sm',
    component: 'absolute inset-0 z-30 flex items-center justify-center bg-white/70 backdrop-blur-xs rounded-lg'
  };
  
  return (
    <div className={overlayClasses[variant]}>
      <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-white shadow-xl border border-gray-100">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-700 font-medium">{message}</p>
          
          {/* Progress Bar */}
          {showProgress && (
            <div className="mt-4 w-48 bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          
          {/* Step Indicators */}
          {showSteps && totalSteps > 0 && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index < currentStep 
                    ? 'bg-green-500' 
                    : index === currentStep 
                      ? 'bg-blue-500 animate-pulse' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Progress Percentage */}
          {showProgress && (
            <p className="mt-2 text-sm text-gray-500 font-medium">{Math.round(progress)}% Complete</p>
          )}
        </div>
      </div>
    </div>
  );
};

// 🔧 Hero Section Skeleton
export const HeroSkeleton = () => (
  <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
    </div>
    
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="space-y-8">
        {/* Badge skeleton */}
        <div className="flex justify-center">
          <SkeletonWrapper className="h-8 w-48 rounded-full" />
        </div>
        
        {/* Main heading skeleton */}
        <div className="space-y-4">
          <SkeletonWrapper className="h-16 w-3/4 mx-auto" />
          <SkeletonWrapper className="h-16 w-2/3 mx-auto" />
        </div>
        
        {/* Description skeleton */}
        <div className="max-w-3xl mx-auto space-y-4">
          <SkeletonWrapper className="h-6 w-full" />
          <SkeletonWrapper className="h-6 w-5/6 mx-auto" />
          <SkeletonWrapper className="h-6 w-4/5 mx-auto" />
        </div>
        
        {/* CTA buttons skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <SkeletonWrapper className="h-14 w-48 rounded-xl" />
          <SkeletonWrapper className="h-14 w-40 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

// 🔧 Stats Section Skeleton
export const StatsSkeleton = () => (
  <div className="py-16 bg-gradient-to-b from-white to-blue-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <motion.div
            key={index}
            className="text-center p-6 bg-white rounded-2xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex justify-center mb-4">
              <SkeletonWrapper className="w-12 h-12 rounded-xl" />
            </div>
            <SkeletonWrapper className="h-10 w-16 mx-auto mb-2" />
            <SkeletonWrapper className="h-5 w-24 mx-auto" />
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

// 🔧 Features Section Skeleton
export const FeaturesSkeleton = () => (
  <div className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <SkeletonWrapper className="h-12 w-96 mx-auto mb-6" />
        <SkeletonWrapper className="h-6 w-80 mx-auto" />
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <motion.div
            key={index}
            className="p-8 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex justify-center mb-6">
              <SkeletonWrapper className="w-16 h-16 rounded-2xl" />
            </div>
            <SkeletonWrapper className="h-6 w-3/4 mx-auto mb-3" />
            <SkeletonWrapper className="h-4 w-full mb-1" />
            <SkeletonWrapper className="h-4 w-5/6 mx-auto" />
            <div className="mt-6 pt-6 border-t border-gray-200/50">
              <div className="flex items-center gap-2">
                <SkeletonWrapper className="w-4 h-4 rounded-full" />
                <SkeletonWrapper className="h-4 w-20" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

// 🔧 Categories Section Skeleton
export const CategoriesSkeleton = () => (
  <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <SkeletonWrapper className="h-12 w-96 mx-auto mb-6" />
        <SkeletonWrapper className="h-6 w-80 mx-auto mb-8" />
        
        {/* Filter buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <SkeletonWrapper className="h-10 w-24 rounded-lg" />
          <SkeletonWrapper className="h-10 w-28 rounded-lg" />
        </div>
        
        {/* Search bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <SkeletonWrapper className="h-12 w-full rounded-xl" />
        </div>
      </div>
      
      {/* Categories grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <motion.div
            key={index}
            className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="relative h-48 overflow-hidden">
              <SkeletonWrapper className="w-full h-full" />
              <div className="absolute top-4 left-4">
                <SkeletonWrapper className="h-6 w-20 rounded-full" />
              </div>
            </div>
            
            <div className="p-6">
              <SkeletonWrapper className="h-6 w-3/4 mb-3" />
              <SkeletonWrapper className="h-4 w-full mb-1" />
              <SkeletonWrapper className="h-4 w-5/6 mb-4" />
              
              <div className="flex items-center justify-between mb-4">
                <SkeletonWrapper className="h-5 w-16" />
                <SkeletonWrapper className="h-8 w-8 rounded-full" />
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <SkeletonWrapper className="h-6 w-20 rounded-full" />
                <SkeletonWrapper className="h-6 w-24 rounded-full" />
                <SkeletonWrapper className="h-6 w-16 rounded-full" />
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <SkeletonWrapper className="h-4 w-24" />
                <SkeletonWrapper className="h-8 w-8 rounded" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

// 🔧 Contact Form Skeleton
export const ContactFormSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
    <div className="mb-8">
      <SkeletonWrapper className="h-8 w-64 mb-3" />
      <SkeletonWrapper className="h-5 w-80" />
    </div>
    
    <div className="space-y-6">
      <div>
        <SkeletonWrapper className="h-5 w-20 mb-2" />
        <SkeletonWrapper className="h-12 w-full" />
      </div>
      
      <div>
        <SkeletonWrapper className="h-5 w-24 mb-2" />
        <SkeletonWrapper className="h-12 w-full" />
      </div>
      
      <div>
        <SkeletonWrapper className="h-5 w-20 mb-2" />
        <SkeletonWrapper className="h-32 w-full" />
      </div>
      
      <div className="pt-4">
        <SkeletonWrapper className="h-12 w-full" />
      </div>
    </div>
  </div>
);

// 🔧 Dashboard Skeleton
export const DashboardSkeleton = () => (
  <div className="animate-pulse">
    {/* Welcome header */}
    <div className="mb-8">
      <SkeletonWrapper className="h-8 w-64 mb-2" />
      <SkeletonWrapper className="h-5 w-80" />
    </div>
    
    {/* Stats cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <SkeletonWrapper className="h-5 w-32 mb-2" />
              <SkeletonWrapper className="h-8 w-20" />
            </div>
            <SkeletonWrapper className="w-12 h-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
    
    {/* Recent activity */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <SkeletonWrapper className="h-6 w-48 mb-6" />
      <ListSkeleton count={5} />
    </div>
  </div>
);

export default SkeletonWrapper;