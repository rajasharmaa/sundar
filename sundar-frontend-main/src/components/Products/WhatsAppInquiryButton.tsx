import React, { useState } from 'react';
import { MessageCircle, ShoppingBag } from 'lucide-react';
import WhatsAppOrderModal from './WhatsAppOrderModal';

interface WhatsAppInquiryButtonProps {
  productName: string;
  selectedSize?: { size: string; price_100_percent: number; price_50_percent: number };
  priceType?: '100' | '50';
  phoneNumber?: string;
}

const WhatsAppInquiryButton: React.FC<WhatsAppInquiryButtonProps> = ({
  productName,
  selectedSize,
  priceType = '50', // Default to wholesale price
  phoneNumber = '919876543210' // Default company phone
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="col-span-2 flex items-center justify-center gap-2 p-4 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-200 shadow-lg shadow-green-600/20 active:scale-95 w-full font-semibold"
        aria-label="Order via WhatsApp"
      >
        <ShoppingBag className="w-5 h-5" />
        <span>Order on WhatsApp</span>
      </button>

      <WhatsAppOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={productName}
        selectedSize={selectedSize}
        priceType={priceType}
        phoneNumber={phoneNumber}
      />
    </>
  );
};

export default WhatsAppInquiryButton;
