import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface ProductFiltersProps {
  searchQuery?: string;
  onSearch: (query: string) => void;
  onFilterChange: (filters: ProductFilterState) => void;
  isLoading?: boolean;
  selectedBrand?: string;
  selectedSize?: string;
  onBrandChange?: (brand: string) => void;
  onSizeChange?: (size: string) => void;
  activeFilters?: Partial<ProductFilterState>;
}

interface ProductFilterState {
  search: string;
  priceRange: [number, number];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchQuery: searchQueryProp,
  onSearch,
  onFilterChange,
  isLoading = false,
  selectedBrand = '',
  selectedSize = '',
  onBrandChange,
  onSizeChange,
  activeFilters
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFilterState>({
    search: '',
    priceRange: [0, 100000]
  });

  useEffect(() => {
    if (searchQueryProp !== undefined) {
      setSearchQuery(searchQueryProp);
    }
  }, [searchQueryProp]);

  // Synchronize internal filter state with activeFilters prop
  useEffect(() => {
    if (activeFilters) {
      setFilters(prev => ({
        ...prev,
        minPrice: activeFilters.minPrice,
        maxPrice: activeFilters.maxPrice,
        inStock: activeFilters.inStock,
        featured: activeFilters.featured
      }));
    }
  }, [activeFilters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Debounce search
    setTimeout(() => {
      onSearch(value);
      setFilters(prev => ({ ...prev, search: value }));
    }, 300);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearch('');
    setFilters(prev => ({ ...prev, search: '' }));
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleClearAll = () => {
    setFilters({
      search: '',
      priceRange: [0, 100000]
    });
    setSearchQuery('');
    onSearch('');
    onFilterChange({
      search: '',
      priceRange: [0, 100000]
    });
    setShowFilters(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 xs:p-4 mb-4 xs:mb-6">
      {/* Search Bar - Mobile Optimized */}
      <div className="flex flex-col gap-3">
        {/* First Row: Search Bar + Filter Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 xs:w-5 xs:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-9 xs:pl-10 pr-9 xs:pr-10 py-2.5 xs:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm xs:text-base min-h-[44px] touch-target"
              disabled={isLoading}
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 xs:w-5 xs:h-5" />
              </button>
            )}
          </div>

          <button
            onClick={handleToggleFilters}
            className={`px-4 xs:px-6 py-2.5 xs:py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 min-h-[44px] touch-target ${showFilters
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <Filter className="w-4 h-4 xs:w-5 xs:h-5" />
            <span className="whitespace-nowrap">Filters</span>
            {showFilters && <span className="text-xs xs:text-sm">(Active)</span>}
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel - Mobile Responsive */}
      {showFilters && (
        <div className="mt-3 xs:mt-4 pt-3 xs:pt-4 border-t border-gray-200 animate-fadeIn">
          <div className="flex items-center justify-between mb-3 xs:mb-4">
            <h3 className="text-base xs:text-lg font-semibold text-gray-900">Advanced Filters</h3>
            <button
              onClick={handleClearAll}
              className="text-xs xs:text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 xs:gap-4">
            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                placeholder="Filter by brand..."
                value={selectedBrand}
                onChange={(e) => onBrandChange?.(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            {/* Size Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <input
                type="text"
                placeholder="Filter by size (e.g., 1/2 inch)..."
                value={selectedSize}
                onChange={(e) => onSizeChange?.(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined;
                    const newFilters = { ...filters, minPrice: value };
                    setFilters(newFilters);
                    onFilterChange(newFilters);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined;
                    const newFilters = { ...filters, maxPrice: value };
                    setFilters(newFilters);
                    onFilterChange(newFilters);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* In Stock Filter */}
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStock || false}
                  onChange={(e) => {
                    const newFilters = { ...filters, inStock: e.target.checked };
                    setFilters(newFilters);
                    onFilterChange(newFilters);
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
              </label>
            </div>

            {/* Featured Products Filter */}
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.featured || false}
                  onChange={(e) => {
                    const newFilters = { ...filters, featured: e.target.checked };
                    setFilters(newFilters);
                    onFilterChange(newFilters);
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Featured Only</span>
              </label>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.minPrice !== undefined || filters.maxPrice !== undefined || filters.inStock || filters.featured) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.minPrice !== undefined && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Min: ₹{filters.minPrice}
                  <button
                    onClick={() => {
                      const newFilters = { ...filters, minPrice: undefined };
                      setFilters(newFilters);
                      onFilterChange(newFilters);
                    }}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.maxPrice !== undefined && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Max: ₹{filters.maxPrice}
                  <button
                    onClick={() => {
                      const newFilters = { ...filters, maxPrice: undefined };
                      setFilters(newFilters);
                      onFilterChange(newFilters);
                    }}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.inStock && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  In Stock
                  <button
                    onClick={() => {
                      const newFilters = { ...filters, inStock: false };
                      setFilters(newFilters);
                      onFilterChange(newFilters);
                    }}
                    className="hover:text-green-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  Featured
                  <button
                    onClick={() => {
                      const newFilters = { ...filters, featured: false };
                      setFilters(newFilters);
                      onFilterChange(newFilters);
                    }}
                    className="hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
