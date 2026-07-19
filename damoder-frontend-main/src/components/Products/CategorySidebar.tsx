import React from 'react';
import { ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';

interface Category {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  productCount?: number;
  active?: boolean;
}

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  isLoading?: boolean;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  isLoading = false
}) => {
  // Get icon component from icon name
  const getCategoryIcon = (iconName: string | undefined) => {
    if (!iconName) return Icons.Package;
    
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.Package;
  };

  if (isLoading) {
    return (
      <div className="w-full lg:w-64 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-6"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-64 bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Icons.Layers className="w-6 h-6 text-blue-600" />
          Categories
        </h2>
        <p className="text-sm text-gray-500 mt-1">Browse by category</p>
      </div>

      {/* All Categories Button */}
      <button
        key="category-sidebar-all"
        onClick={() => onSelectCategory(null)}
        className={`w-full flex items-center justify-between px-4 py-3 min-h-[48px] rounded-lg transition-all duration-200 mb-3 touch-manipulation active:scale-95 ${
          selectedCategory === null
            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
            : 'hover:bg-gray-50 text-gray-700'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icons.Grid3X3 className="w-5 h-5" />
          <span className="font-medium">All Products</span>
        </div>
        {selectedCategory === null && <ChevronRight className="w-5 h-5" />}
      </button>

      {/* Category List */}
      <div className="space-y-1">
        {categories.map((category, index) => {
          const IconComponent = getCategoryIcon(category.icon);
          const isSelected = selectedCategory === category.slug;

          return (
            <button
              key={`category-sidebar-${category._id || category.id || index}`}
              onClick={() => onSelectCategory(category.slug)}
              className={`w-full flex items-center justify-between px-4 py-3 min-h-[48px] rounded-lg transition-all duration-200 group touch-manipulation active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected
                      ? 'bg-white/20'
                      : 'bg-gray-100 group-hover:bg-blue-50'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'}`} />
                </div>
                <div className="text-left">
                  <div className="font-medium">{category.name}</div>
                  <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                    {category.productCount !== undefined ? `${category.productCount} products` : '0 products'}
                  </div>
                </div>
              </div>
              {isSelected && <ChevronRight className="w-5 h-5" />}
            </button>
          );
        })}
      </div>

      {/* Categories Count */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          {categories.length} {categories.length === 1 ? 'category' : 'categories'} available
        </div>
      </div>
    </div>
  );
};

export default CategorySidebar;
