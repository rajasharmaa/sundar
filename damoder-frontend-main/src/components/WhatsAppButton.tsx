import { MessageCircle } from 'lucide-react';
import { useLocation, useParams } from 'react-router-dom';

const WhatsAppButton = () => {
    const location = useLocation();
    const params = useParams();

    const isProductDetailsPage = params.id && location.pathname.startsWith('/products/');

    const EXCLUDED_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/account', '/rfq', '/contact'];
    const isExcluded = EXCLUDED_PATHS.some(path => 
      location.pathname === path || location.pathname.startsWith(path + '/')
    );

    if (isExcluded) {
        return null;
    }

    const phoneNumber = import.meta.env.VITE_WHATSAPP_PHONE || '+919876543210';
    const message = encodeURIComponent("Hello Damodar Traders, I'm interested in your industrial products.");
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${message}`;

    return (
        <div className={`fixed bottom-[90px] lg:bottom-6 right-4 lg:right-6 z-[999] group ${isProductDetailsPage ? 'hidden lg:block' : ''}`}>
            <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 group-hover:scale-125 transition-all duration-500 animate-pulse" />
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full text-white shadow-2xl transform transition-all duration-500 hover:scale-110 hover:rotate-12 group"
            >
                <MessageCircle className="w-6 h-6 lg:w-8 lg:h-8 drop-shadow-lg" />

                {/* Tooltip */}
                <div className="absolute right-full mr-4 px-4 py-2 bg-white text-gray-800 text-sm font-bold rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-green-50 hidden lg:block">
                    Chat with Sales Expert 💬
                </div>
            </a>
        </div>
    );
};

export default WhatsAppButton;
