import { MessageSquare } from 'lucide-react';
import { InquiryForm } from './InquiryForm';
import type { Product } from '@/services/api/api-client';

interface SizeOption {
  size: string;
  price_100_percent: number;
  price_50_percent: number;
}

interface InquiryButtonProps {
  product: Product;
  selectedSize?: SizeOption | null;
}

export function InquiryButton({ product, selectedSize }: InquiryButtonProps) {
  return (
    <InquiryForm
      productId={product.id}
      productName={product.name}
      selectedSize={selectedSize || undefined}
      productCode={(product as any).productCode}
      trigger={
        <button className="col-span-2 flex items-center justify-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:-green- hover:-green- transition-all duration-200 group active:scale-95">
          <MessageSquare className="w-4 h-4 text-gray-600 group-hover:-green-" />
          <span className="text-sm font-medium text-gray-700 group-hover:-green-">Send Inquiry</span>
        </button>
      }
    />
  );
}
