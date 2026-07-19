import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X, User, Hash, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '@/context/AccessibilityContext';

interface WhatsAppOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  selectedSize?: { size: string; price_100_percent: number; price_50_percent: number };
  priceType?: '100' | '50';
  phoneNumber?: string;
}

const WhatsAppOrderModal: React.FC<WhatsAppOrderModalProps> = ({
  isOpen,
  onClose,
  productName,
  selectedSize,
  priceType = '50',
  phoneNumber = '919876543210'
}) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [remarks, setRemarks] = useState('');
  const { t } = useTranslation();
  const { language, highContrast } = useAccessibility();

  const handleOrder = () => {
    if (!name.trim()) {
      const errorMsg = language === 'hi' ? 'कृपया अपना नाम दर्ज करें' : 'Please enter your name';
      alert(errorMsg);
      return;
    }

    const selectedPrice = priceType === '100' 
      ? selectedSize?.price_100_percent 
      : selectedSize?.price_50_percent;
    
    const priceLabel = priceType === '100' 
      ? (language === 'hi' ? 'सामान्य मूल्य' : 'Standard Price') 
      : (language === 'hi' ? 'थोक मूल्य' : 'Wholesale Price');
      
    const totalAmount = selectedPrice ? selectedPrice * quantity : 0;
    
    // Construct localized message
    let message = '';
    if (language === 'hi') {
      message = `नमस्ते दामोदर ट्रेडर्स,%0A%0Aमैं एक ऑर्डर प्लेस करना चाहता हूँ:%0A%0A👤 *ग्राहक का नाम:* ${encodeURIComponent(name)}%0A📦 *उत्पाद:* ${encodeURIComponent(productName)}${selectedSize ? `%0A📏 *साइज:* ${selectedSize.size}%0A💰 *दर:* ₹${selectedPrice?.toFixed(2)} (${priceLabel})` : ''}%0A🔢 *मात्रा (पीस):* ${quantity}${remarks ? `%0A📍 *डिलिवरी का पता / टिप्पणी:* ${encodeURIComponent(remarks)}` : ''}${totalAmount ? `%0A💵 *कुल अनुमानित राशि:* ₹${totalAmount.toFixed(2)}` : ''}%0A%0Aकृपया मेरे ऑर्डर की पुष्टि करें और डिलीवरी का विवरण साझा करें। धन्यवाद!`;
    } else {
      message = `Hi Damodar Traders,%0A%0AI would like to place an order:%0A%0A👤 *Customer Name:* ${encodeURIComponent(name)}%0A📦 *Product:* ${encodeURIComponent(productName)}${selectedSize ? `%0A📏 *Size:* ${selectedSize.size}%0A💰 *Price:* ₹${selectedPrice?.toFixed(2)} (${priceLabel})` : ''}%0A🔢 *Quantity:* ${quantity}${remarks ? `%0A📍 *Delivery Address:* ${encodeURIComponent(remarks)}` : ''}${totalAmount ? `%0A💵 *Total Estimate:* ₹${totalAmount.toFixed(2)}` : ''}%0A%0APlease confirm my order and share delivery details. Thank you!`;
    }
    
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    onClose();
  };

  return (
    <>
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border border-blue-50 animate-in zoom-in-95 duration-200 ${
                  highContrast ? 'border-4 border-black bg-white text-black' : ''
                }`}
              >
                {/* Header */}
                <div className={`bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white flex justify-between items-center ${
                  highContrast ? 'bg-black text-white border-b-2 border-black' : ''
                }`}>
                  <div>
                    <h3 className="text-xl font-extrabold flex items-center gap-2">
                      <MessageCircle className="w-6 h-6 animate-pulse" />
                      {t('whatsapp.modalTitle')}
                    </h3>
                    <p className="text-green-100 text-xs font-semibold mt-1">
                      {language === 'hi' ? 'सीधी और सरल ऑर्डर प्रक्रिया' : 'Direct and simple ordering process'}
                    </p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="text-white hover:bg-green-700/50 p-2 rounded-full transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className={`bg-gray-50 p-4 rounded-2xl border border-gray-100/50 ${
                    highContrast ? 'border-2 border-black bg-white text-black' : ''
                  }`}>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                      {language === 'hi' ? 'चयनित उत्पाद' : 'Selected Product'}
                    </p>
                    <p className="font-extrabold text-gray-900 mt-1">{productName}</p>
                    {selectedSize && (
                      <p className="text-sm font-semibold text-gray-600 mt-1">
                        {language === 'hi' ? 'साइज' : 'Size'}: {selectedSize.size}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        {t('whatsapp.fullName')}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-semibold ${
                            highContrast ? 'border-2 border-black text-black' : ''
                          }`}
                          placeholder={language === 'hi' ? 'उदा. रमेश कुमार' : 'e.g., Ramesh Kumar'}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        {t('whatsapp.quantity')}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Hash className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-semibold ${
                            highContrast ? 'border-2 border-black text-black' : ''
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        {t('whatsapp.remarks')}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <textarea
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          className={`block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-semibold h-20 ${
                            highContrast ? 'border-2 border-black text-black' : ''
                          }`}
                          placeholder={language === 'hi' ? 'उदा. गांव: रामपुर, जिला: इंदौर, मध्य प्रदेश' : 'e.g., Village: Rampur, Dist: Indore, MP'}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className={`p-6 bg-gray-50 border-t border-gray-100 flex flex-col gap-3 ${
                  highContrast ? 'bg-white border-t-2 border-black' : ''
                }`}>
                  <button
                    onClick={handleOrder}
                    className={`w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-600/20 active:scale-95 ${
                      highContrast ? 'bg-black text-white hover:bg-black/90' : ''
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    {t('whatsapp.sendButton')}
                  </button>
                  <p className="text-[10px] text-center text-gray-500 font-medium">
                    {language === 'hi' 
                      ? 'ऑर्डर संदेश भेजने के लिए आपको व्हाट्सएप पर पुनः निर्देशित किया जाएगा' 
                      : 'You will be redirected to WhatsApp to send this message'}
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default WhatsAppOrderModal;
