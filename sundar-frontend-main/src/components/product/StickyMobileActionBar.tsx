// components/product/StickyMobileActionBar.tsx
import { motion } from 'framer-motion';
import { MessageSquare, Phone, Share2, Heart } from 'lucide-react';

interface StickyMobileActionBarProps {
  productName: string;
  productPrice?: number;
  onInquiryClick: () => void;
  onWhatsAppClick: () => void;
  onShareClick: () => void;
  onWishlistToggle: () => void;
  isInWishlist: boolean;
}

const StickyMobileActionBar = ({
  productName,
  productPrice,
  onInquiryClick,
  onWhatsAppClick,
  onShareClick,
  onWishlistToggle,
  isInWishlist,
}: StickyMobileActionBarProps) => {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="lg:hidden fixed bottom-[72px] left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg pb-safe"
    >
      {/* Product Info Bar */}
      <div className="bg-gradient-to-r from-green-50 to-cyan-50 px-4 py-2 border-b border-gray-100">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">{productName}</p>
            {productPrice && (
              <p className="text-sm font-bold text-green-600">₹{productPrice.toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-2 p-3 bg-white">
        {/* Inquiry Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onInquiryClick}
          className="flex flex-col items-center justify-center py-2.5 px-2 bg-gradient-to-br from-green-600 to-cyan-600 text-white rounded-xl shadow-md active:scale-[0.95] transition-all min-h-[56px]"
          aria-label="Send inquiry"
        >
          <MessageSquare className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Inquiry</span>
        </motion.button>

        {/* WhatsApp Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onWhatsAppClick}
          className="flex flex-col items-center justify-center py-2.5 px-2 bg-green-600 text-white rounded-xl shadow-md active:scale-[0.95] transition-all min-h-[56px]"
          aria-label="WhatsApp inquiry"
        >
          <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          <span className="text-xs font-medium">WhatsApp</span>
        </motion.button>

        {/* Share Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onShareClick}
          className="flex flex-col items-center justify-center py-2.5 px-2 bg-gray-100 text-gray-700 rounded-xl shadow-sm active:scale-[0.95] transition-all min-h-[56px]"
          aria-label="Share product"
        >
          <Share2 className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Share</span>
        </motion.button>

        {/* Wishlist Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onWishlistToggle}
          className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl shadow-sm active:scale-[0.95] transition-all min-h-[56px] ${isInWishlist
              ? 'bg-rose-50 text-rose-600'
              : 'bg-gray-100 text-gray-700'
            }`}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-5 h-5 mb-1 ${isInWishlist ? 'fill-current' : ''}`} />
          <span className="text-xs font-medium">{isInWishlist ? 'Saved' : 'Save'}</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default StickyMobileActionBar;

