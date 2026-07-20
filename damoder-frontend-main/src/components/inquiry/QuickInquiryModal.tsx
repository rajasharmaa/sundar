// components/inquiry/QuickInquiryModal.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, Phone, User, Building2, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api/api-client';
import CaptchaWidget from '@/components/inquiry/CaptchaWidget';

interface QuickInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  productName?: string;
}

const QuickInquiryModal = ({ isOpen, onClose, productId, productName }: QuickInquiryModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  
  // Form state with auto-fill from user data
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    companyName: (user as any)?.businessName || (user as any)?.companyName || '',
    message: '',
    subject: productName ? `Inquiry about ${productName}` : 'Product Inquiry',
  });

  // Auto-fill user data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        companyName: (user as any)?.businessName || (user as any)?.companyName || '',
      }));
    }
  }, [isOpen, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in your name, email, and phone number.',
        variant: 'destructive',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    // Captcha check
    if (!captchaVerified) {
      toast({
        title: 'Captcha Required',
        description: 'Please solve the security question to verify you are not a robot.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare inquiry data
      const inquiryData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.companyName,
        subject: formData.subject,
        message: formData.message || `Interested in ${productName || 'your products'}. Please contact me.`,
        productId,
        pageSource: `${window.location.protocol}//${window.location.host}${window.location.pathname}${window.location.search}`,
        referrer: document.referrer || 'direct',
        fullUrl: window.location.href
      };

      // Send inquiry via API
      await api.inquiries.submit(inquiryData);

      setIsSuccess(true);
      
      toast({
        title: 'Inquiry Sent!',
        description: 'We\'ll get back to you shortly.',
        className: 'bg-emerald-600 text-white',
      });

      // Close modal after success animation
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);

    } catch (error: unknown) {
      const err = error as any;
      let errorMsg = 'Failed to send inquiry. Please try again.';
      
      if (err.response?.data?.message) {
        errorMsg = String(err.response.data.message);
      } else if (err.response?.data?.error) {
        errorMsg = String(err.response.data.error);
      } else if (err.message) {
        if (err.code === 'ERR_NETWORK' || err.message.includes('Network')) {
          errorMsg = 'Network error. Please check your internet connection.';
        } else {
          errorMsg = String(err.message);
        }
      }
      
      if (errorMsg.length > 200) {
        errorMsg = errorMsg.substring(0, 200) + '...';
      }
      
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const message = encodeURIComponent(
      `Hi, I'm interested in ${productName || 'your products'}.\n\nName: ${formData.name}\nPhone: ${formData.phone}\nCompany: ${formData.companyName}\n\nMessage: ${formData.message}`
    );
    
    const whatsappNumber = (import.meta.env.VITE_WHATSAPP_PHONE || '+919876543210').replace('+', '').replace(/\s+/g, '');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    
    toast({
      title: 'Opening WhatsApp',
      description: 'Continue your inquiry on WhatsApp.',
    });
    
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with strong blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-end sm:items-center justify-center z-[101] pointer-events-none px-4 sm:px-0">
            <motion.div
              initial={{ y: '100%', opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: '100%', opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl pointer-events-auto overflow-hidden relative"
            >
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-6 h-6 text-blue-400" />
                      Quick Inquiry
                    </h2>
                    <p className="text-sm text-slate-300 mt-1 font-medium">Fast-track your industrial order</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white backdrop-blur-sm"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 sm:p-8 max-h-[calc(90vh-120px)] overflow-y-auto custom-scrollbar">
                {isSuccess ? (
                  /* Success State */
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Inquiry Sent Successfully!</h3>
                    <p className="text-slate-500 max-w-sm">Our sales team has received your request and will contact you shortly with the best pricing.</p>
                  </motion.div>
                ) : (
                  /* Form */
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Product Info Chip */}
                    {productName && (
                      <div className="flex items-start gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-0.5">Inquiring About</p>
                          <p className="text-sm font-semibold text-slate-900">{productName}</p>
                        </div>
                      </div>
                    )}

                    {/* Name Field */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <User className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none transition-all duration-200 font-medium text-slate-900 text-base sm:text-sm placeholder:text-slate-400"
                          placeholder="John Doe"
                          autoComplete="name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Email Field */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative group">
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none transition-all duration-200 font-medium text-slate-900 text-base sm:text-sm placeholder:text-slate-400"
                            placeholder="john@company.com"
                            autoComplete="email"
                          />
                        </div>
                      </div>

                      {/* Phone Field */}
                      <div>
                        <label htmlFor="phone" className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                          Phone Number <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Phone className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                          </div>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            inputMode="tel"
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none transition-all duration-200 font-medium text-slate-900 text-base sm:text-sm placeholder:text-slate-400"
                            placeholder="+91 9876543210"
                            autoComplete="tel"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Company Field */}
                    <div>
                      <label htmlFor="company" className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                        Company Name <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Building2 className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          id="company"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none transition-all duration-200 font-medium text-slate-900 text-base sm:text-sm placeholder:text-slate-400"
                          placeholder="Your Business Pvt. Ltd."
                          autoComplete="organization"
                        />
                      </div>
                    </div>

                    {/* Message Field */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                        Message / Requirements
                      </label>
                      <div className="relative group">
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none transition-all duration-200 resize-none font-medium text-slate-900 text-base sm:text-sm placeholder:text-slate-400"
                          placeholder="Tell us about your specific requirements, bulk quantity needs, or request a quote..."
                        />
                      </div>
                    </div>

                    <CaptchaWidget onVerify={setCaptchaVerified} />

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || !captchaVerified}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.98]"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Processing Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Official Inquiry</span>
                          <Send className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </button>

                    {/* WhatsApp Quick Option */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-slate-400 font-semibold tracking-wider uppercase text-[10px]">
                          Need immediate response?
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleWhatsAppRedirect}
                      className="w-full py-3.5 bg-white border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm group active:scale-[0.98]"
                    >
                      <svg className="w-5 h-5 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span>Connect on WhatsApp</span>
                  </button>
                </form>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default QuickInquiryModal;
