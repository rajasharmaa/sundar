import React from 'react';

interface ProductSkeletonProps {
  count?: number;
}

const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse flex flex-col"
        >
          {/* Image Skeleton */}
          <div className="aspect-[4/3] bg-gray-100"></div>

          {/* Content Skeleton */}
          <div className="p-4 space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded w-1/4"></div>
              <div className="h-5 bg-gray-100 rounded w-full"></div>
            </div>

            {/* Price section */}
            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
              <div className="h-6 bg-gray-100 rounded w-1/3"></div>
              <div className="h-4 bg-gray-100 rounded w-1/4"></div>
            </div>

            {/* Button */}
            <div className="h-10 bg-gray-100 rounded-lg w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};


export default ProductSkeleton;
