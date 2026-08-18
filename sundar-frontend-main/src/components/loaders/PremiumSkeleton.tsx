import React from 'react';

// Generic skeleton component
const PremiumSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
};

// Card skeleton component
const PremiumCardSkeleton: React.FC = () => (
  <div className="animate-pulse bg-white rounded-xl shadow-md overflow-hidden">
    <div className="bg-gray-200 h-48"></div>
    <div className="p-6">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-24"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
      </div>
    </div>
  </div>
);

// List skeleton component
const PremiumListSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <div className="bg-gray-200 rounded-full h-12 w-12"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

// Stats skeleton component
const PremiumStatsSkeleton: React.FC = () => (
  <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-6">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white p-6 rounded-lg shadow">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

// Search skeleton component
const PremiumSearchSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="flex space-x-4 mb-6">
      <div className="flex-1">
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="w-24">
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
      ))}
    </div>
  </div>
);

export { 
  PremiumSkeleton, 
  PremiumCardSkeleton,
  PremiumListSkeleton, 
  PremiumStatsSkeleton, 
  PremiumSearchSkeleton 
};
export default PremiumSkeleton;