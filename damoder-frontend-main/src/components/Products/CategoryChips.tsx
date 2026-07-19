import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryChipsProps {
  selectedCategory: string;
  onSelectCategory: (value: string) => void;
}

const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
      <div className="flex gap-2 sm:gap-3 min-w-max">
        {/* All Categories Button */}
        <button
          key="category-chip-all"
          onClick={() => onSelectCategory('all')}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 xs:py-3 rounded-xl font-semibold transition-all duration-200 border-2 min-h-[44px] touch-manipulation active:scale-95 ${selectedCategory === 'all'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-transparent shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
        >
          <Icons.Grid3X3 className="w-4 h-4" />
          <span className="text-sm whitespace-nowrap">All</span>
        </button>

        {/* Category Chips */}
        {[
          { value: 'pipes', label: 'Pipes', icon: Icons.Layers },
          { value: 'fittings', label: 'Fittings', icon: Icons.Wrench },
          { value: 'valves', label: 'Valves', icon: Icons.Filter },
          { value: 'other', label: 'Other', icon: Icons.Package },
        ].map((category) => {
          const IconComponent = category.icon;
          const isSelected = selectedCategory === category.value;

          return (
            <button
              key={`category-chip-${category.value}`}
              onClick={() => onSelectCategory(category.value)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 xs:py-3 rounded-xl font-semibold transition-all duration-200 border-2 min-h-[44px] touch-manipulation active:scale-95 ${isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-transparent shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
            >
              <div
                className={`p-1.5 rounded-lg ${isSelected
                    ? 'bg-white/20'
                    : 'bg-gray-100'
                  }`}
              >
                <IconComponent className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <span className="text-sm whitespace-nowrap">{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryChips;
