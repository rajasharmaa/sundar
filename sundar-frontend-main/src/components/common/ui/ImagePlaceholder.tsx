import React from 'react';
import { PackageOpen } from 'lucide-react';

interface ImagePlaceholderProps {
  className?: string;
  text?: string;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ 
  className = "", 
  text = "PRODUCT IMAGE COMING SOON" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center bg-[#F5F7F6] border border-[#E5E7EB] text-center p-6 w-full h-full min-h-[200px] ${className}`}>
      <PackageOpen size={48} className="text-[#64748B] mb-4 opacity-50" strokeWidth={1} />
      <div className="space-y-2">
        <h4 className="text-[12px] font-black text-[#07111F] tracking-[0.2em] uppercase">
          Sundar Corporation
        </h4>
        <p className="text-[10px] font-bold text-[#64748B] tracking-widest uppercase opacity-80">
          {text}
        </p>
      </div>
    </div>
  );
};
