import { useState } from 'react';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Label } from '@/components/common/ui/label';
import { Textarea } from '@/components/common/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Loader2, X } from 'lucide-react';
import { api } from '@/services/api/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import logger from '@/lib/logger';

interface InquiryFormProps {
  productId: string;
  productName: string;
  selectedSize?: { size: string; price_100_percent: number; price_50_percent: number };
  productCode?: string;
  trigger?: React.ReactNode;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  location: string;
  priceType: '100' | '50';
  message: string;
}

export function InquiryForm({ productId, productName, selectedSize, productCode, trigger }: InquiryFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    location: '',
    priceType: '100', // Default to standard price
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.companyName.trim() || !formData.location.trim() || !formData.message.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }

    // Phone validation (basic)
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid phone number (minimum 10 digits)',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare inquiry data with all required fields
      const inquiryData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.companyName,
        message: formData.message,
        productId,
        productName,
        pageSource: window.location.href
      };

      // Add selected size if provided
      if (selectedSize) {
        inquiryData.selectedSize = selectedSize.size;
        inquiryData.priceType = formData.priceType; // Changed from selectedPriceType to priceType
        inquiryData.sizePrice100 = selectedSize.price_100_percent;
        inquiryData.sizePrice50 = selectedSize.price_50_percent;
      }

      // Add debug log
      console.log('🔍 Submitting inquiry with data:', {
        selectedSize: inquiryData.selectedSize,
        priceType: inquiryData.priceType,
        sizePrice100: inquiryData.sizePrice100,
        sizePrice50: inquiryData.sizePrice50,
        productName: inquiryData.productName
      });


      const subject = `Inquiry about ${productName}${selectedSize ? ` - Size: ${selectedSize.size}` : ''}`;
      if (subject.length >= 5) {
        inquiryData.subject = subject;
      } else {
        inquiryData.subject = `Product Inquiry - ${new Date().toLocaleDateString()}`;
      }

      // Ensure message meets minimum length requirement (10 chars)
      if (formData.message.trim().length < 10) {
        toast({
          title: 'Validation Error',
          description: 'Message must be at least 10 characters long',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      logger.debug('Submitting inquiry', { subject: inquiryData.subject, productId: inquiryData.productId, selectedSize: inquiryData.selectedSize });

      // Submit inquiry
      await api.inquiries.submit(inquiryData);

      toast({
        title: 'Inquiry Sent!',
        description: 'We\'ll get back to you within 24 hours',
        variant: 'default'
      });

      // Reset form and close dialog
      setFormData({
        name: '',
        email: '',
        phone: '',
        companyName: '',
        location: '',
        priceType: '100',
        message: ''
      });
      setOpen(false);

    } catch (error: any) {
      logger.error('Inquiry submission error', error);

      // Extract error message safely and truncate if too long
      let errorMessage = 'Failed to send inquiry. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = String(error.response.data.message);
      } else if (error.response?.data?.error) {
        errorMessage = String(error.response.data.error);
      } else if (error.message) {
        errorMessage = String(error.message);
      } else if (typeof error.response?.data === 'string') {
        errorMessage = String(error.response.data);
      } else if (error.response?.data) {
        // Handle case where error.response.data is an object
        errorMessage = String(error.response.data.message || error.response.data.error || JSON.stringify(error.response.data));
      }

      // Truncate very long error messages for better mobile display
      if (errorMessage.length > 200) {
        errorMessage = errorMessage.substring(0, 200) + '...';
      }

      toast({
        title: 'Submission Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <div onClick={() => setOpen(true)}>
        {trigger || (
          <Button className="gap-2 bg-industrial text-navy hover:bg-industrial-dark font-black shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300">
            <MessageSquare className="w-4 h-4" />
            Request Quote
          </Button>
        )}
      </div>

      {/* Modal Overlay */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
              >
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg sm:max-w-xl my-4 sm:my-8 overflow-hidden max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto animate-in zoom-in-95 duration-200">
                  {/* Header */}
                  <div className="bg-navy/5 border-b border-navy/10 p-4 sm:p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-industrial rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-navy" />
                        </div>
                        <div className="pt-0.5">
                          <h3 className="text-lg font-bold text-gray-900">Product Inquiry</h3>
                          <p className="text-xs text-gray-600 mt-1">Fill in the details below and we'll get back to you within 24 hours</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setOpen(false)}
                        disabled={isSubmitting}
                        className="p-2 hover:bg-white/80 rounded-lg transition-all disabled:opacity-50 -mt-1.5 -mr-1.5 flex-shrink-0"
                        aria-label="Close modal"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="p-4 sm:p-5">
                    <div className="space-y-4">
                      {/* Product Info Banner */}
                      <div className="bg-navy/5 border border-navy/10 rounded-lg p-3">
                        <p className="text-xs text-navy/70 font-semibold uppercase tracking-wide mb-1">Product Details</p>
                        <p className="text-sm font-bold text-navy truncate">{productName}</p>
                        {selectedSize && (
                          <p className="text-xs text-navy/70 mt-1">
                            Selected Size: <span className="font-semibold">{selectedSize.size}</span>
                          </p>
                        )}
                      </div>

                      {/* Contact Information Section */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-1.5">Contact Information</h4>

                        <div className="grid sm:grid-cols-2 gap-3">
                          {/* Name Field */}
                          <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-semibold text-gray-700">
                              Full Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="John Doe"
                              disabled={isSubmitting}
                              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-200 text-sm"
                              required
                            />
                          </div>

                          {/* Email Field */}
                          <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold text-gray-700">
                              Email Address <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="john@example.com"
                              disabled={isSubmitting}
                              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-200 text-sm"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          {/* Phone Field */}
                          <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-xs font-semibold text-gray-700">
                              Phone Number <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="+91 98765 43210"
                              disabled={isSubmitting}
                              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-200 text-sm"
                              required
                            />
                          </div>

                          {/* Location Field */}
                          <div className="space-y-1.5">
                            <Label htmlFor="location" className="text-xs font-semibold text-gray-700">
                              Location / City <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="location"
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                              placeholder="Mumbai, Delhi, etc."
                              disabled={isSubmitting}
                              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-200 text-sm"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Business Information Section */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-1.5">Business Details</h4>

                        {/* Company Name Field */}
                        <div className="space-y-1.5">
                          <Label htmlFor="companyName" className="text-xs font-semibold text-gray-700">
                            Company Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="companyName"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            placeholder="Your Company Pvt. Ltd."
                            disabled={isSubmitting}
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-200 text-sm"
                            required
                          />
                        </div>

                        {/* Price Type Selection */}
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-gray-700">Price Type Preference <span className="text-red-500">*</span></Label>
                          <div className="grid sm:grid-cols-2 gap-2">
                            <label className={`flex items-center justify-center p-2.5 border-2 rounded-lg cursor-pointer transition-all duration-200 ${formData.priceType === '100'
                              ? 'border-green-500 bg-green-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}>
                              <input
                                type="radio"
                                name="priceType"
                                value="100"
                                checked={formData.priceType === '100'}
                                onChange={(e) => setFormData({ ...formData, priceType: e.target.value as '100' | '50' })}
                                className="sr-only"
                              />
                              <div className="text-center">
                                <div className="font-bold text-green-700 text-xs">Standard Price</div>
                                <div className="text-xs text-gray-600 mt-0.5">Regular Pricing</div>
                              </div>
                            </label>

                            <label className={`flex items-center justify-center p-2.5 border-2 rounded-lg cursor-pointer transition-all duration-200 ${formData.priceType === '50'
                              ? 'border-green-500 bg-green-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}>
                              <input
                                type="radio"
                                name="priceType"
                                value="50"
                                checked={formData.priceType === '50'}
                                onChange={(e) => setFormData({ ...formData, priceType: e.target.value as '100' | '50' })}
                                className="sr-only"
                              />
                              <div className="text-center">
                                <div className="font-bold text-green-700 text-xs">Wholesale Price</div>
                                <div className="text-xs text-gray-600 mt-0.5">Bulk Order Pricing</div>
                                <div className="text-xs text-green-600 font-bold mt-0.5 bg-green-100 inline-block px-1.5 py-0.5 rounded">Save 50%</div>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Message Section */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-1.5">Your Message</h4>

                        <div className="space-y-1.5">
                          <Label htmlFor="message" className="text-xs font-semibold text-gray-700">
                            Message <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="I'm interested in this product. Please provide more details..."
                            rows={4}
                            disabled={isSubmitting}
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-industrial focus:border-industrial focus:bg-white transition-all duration-200 resize-none text-sm"
                            required
                          />
                          <p className="text-xs text-gray-500">Minimum 10 characters</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
                        <Button
                          type="submit"
                          className="flex-1 bg-industrial hover:bg-industrial-dark text-navy font-black py-2.5 px-4 rounded-md shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md min-h-[40px] text-sm uppercase tracking-widest"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-1.5">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Sending...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <Send className="w-4 h-4" />
                              <span>Send Message</span>
                            </div>
                          )}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setOpen(false)}
                          disabled={isSubmitting}
                          className="sm:w-auto px-6 py-2.5 border-2 border-gray-300 text-gray-700 bg-white rounded-md font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 min-h-[40px] text-sm"
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>

                      {/* Privacy Notice */}
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-2 text-center">
                        <p className="text-xs text-gray-600">
                          🔒 <span className="font-medium">Your data is secure.</span> We only use your information to respond to this inquiry.
                        </p>
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
