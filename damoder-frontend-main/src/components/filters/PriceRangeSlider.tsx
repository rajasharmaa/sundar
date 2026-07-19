import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PriceRangeSliderProps {
  minPrice: number;
  maxPrice: number;
  selectedMin: number;
  selectedMax: number;
  onChange: (min: number, max: number) => void;
  currency?: string;
}

/**
 * Price Range Slider Component
 * Dual-handle slider for selecting price range
 */
export const PriceRangeSlider = ({
  minPrice,
  maxPrice,
  selectedMin,
  selectedMax,
  onChange,
  currency = '₹'
}: PriceRangeSliderProps) => {
  const [localMin, setLocalMin] = useState(selectedMin);
  const [localMax, setLocalMax] = useState(selectedMax);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  useEffect(() => {
    setLocalMin(selectedMin);
    setLocalMax(selectedMax);
  }, [selectedMin, selectedMax]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value < localMax) {
      setLocalMin(value);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > localMin) {
      setLocalMax(value);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(null);
      onChange(localMin, localMax);
    }
  };

  const percentage = ((localMax - localMin) / (maxPrice - minPrice)) * 100;
  const minPercentage = ((localMin - minPrice) / (maxPrice - minPrice)) * 100;

  return (
    <div className="space-y-4" onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp}>
      {/* Price Display */}
      <div className="flex items-center justify-between">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Min Price</div>
          <div className="text-lg font-bold text-blue-600">
            {currency}{localMin.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Max Price</div>
          <div className="text-lg font-bold text-blue-600">
            {currency}{localMax.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Slider Track */}
      <div className="relative h-2 bg-gray-200 rounded-full">
        {/* Active Range */}
        <div
          className="absolute h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
          style={{
            left: `${minPercentage}%`,
            width: `${percentage}%`
          }}
        />

        {/* Min Handle */}
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={localMin}
          onChange={handleMinChange}
          onMouseDown={() => setIsDragging('min')}
          onTouchStart={() => setIsDragging('min')}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-none"
          style={{ zIndex: 2 }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-4 border-blue-500 rounded-full shadow-lg pointer-events-none transition-transform"
          style={{ left: `calc(${minPercentage}% - 10px)` }}
        />

        {/* Max Handle */}
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={localMax}
          onChange={handleMaxChange}
          onMouseDown={() => setIsDragging('max')}
          onTouchStart={() => setIsDragging('max')}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-none"
          style={{ zIndex: 2 }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-4 border-cyan-500 rounded-full shadow-lg pointer-events-none transition-transform"
          style={{ left: `calc(${minPercentage + percentage}% - 10px)` }}
        />
      </div>

      {/* Preset Ranges */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'All', min: minPrice, max: maxPrice },
          { label: '< 500', min: minPrice, max: 500 },
          { label: '500-2k', min: 500, max: 2000 },
          { label: '> 2k', min: 2000, max: maxPrice }
        ].map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              setLocalMin(preset.min);
              setLocalMax(preset.max);
              onChange(preset.min, preset.max);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
              localMin === preset.min && localMax === preset.max
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PriceRangeSlider;
