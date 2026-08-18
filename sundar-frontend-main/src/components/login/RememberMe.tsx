import React from 'react';
import { Check } from 'lucide-react';

interface RememberMeProps {
  checked: boolean;
  onChange: () => void;
}

export const RememberMe: React.FC<RememberMeProps> = ({ checked, onChange }) => {
  return (
    <label className="flex items-center gap-3 group cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
        aria-label="Remember me on this device"
      />
      <div
        className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
          checked
            ? 'bg-green-600 border-green-600 shadow-sm'
            : 'bg-white border-gray-300 group-hover:border-green-400'
        }`}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white" />}
      </div>
      <span>Remember me</span>
    </label>
  );
};

export default RememberMe;
