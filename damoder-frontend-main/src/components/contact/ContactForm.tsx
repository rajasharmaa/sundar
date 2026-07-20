import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Building2, CheckCircle2, FileText, Download, X, MessageSquare, Send 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api, apiClient } from '@/services/api/api-client';
import { collectClientData } from '@/utils/clientDataUtils';
import CaptchaWidget from '@/components/inquiry/CaptchaWidget';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  companyName: string;
  businessType: string;
  priceType: string;
  message: string;
}

interface ContactFormProps {
  onSuccess: (ticketId: string) => void;
}

export function ContactForm({ onSuccess }: ContactFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: 'Bulk Order',
    companyName: '',
    businessType: 'retail',
    priceType: 'Standard Pricing',
    message: ''
  });

  // 💾 sessionStorage Auto Save (Issue 8: Load from sessionStorage on mount)
  useEffect(() => {
    const savedStep = sessionStorage.getItem('contact_form_step');
    const savedData = sessionStorage.getItem('contact_form_data');
    if (savedStep) {
      const parsedStep = parseInt(savedStep, 10);
      if (parsedStep >= 1 && parsedStep <= 3) {
        setStep(parsedStep);
      }
    }
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.debug('Failed to parse saved contact form data');
      }
    }
  }, []);

  // 💾 sessionStorage Auto Save (Save step and data on changes)
  useEffect(() => {
    sessionStorage.setItem('contact_form_step', step.toString());
  }, [step]);

  useEffect(() => {
    sessionStorage.setItem('contact_form_data', JSON.stringify(formData));
  }, [formData]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear specific field errors dynamically
    setFormErrors(prev => {
      const copy = { ...prev };
      if (name === 'name' && value.trim().length >= 2) delete copy.name;
      if (name === 'email' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) delete copy.email;
      if (name === 'phone') {
        const stripped = value.replace(/\D/g, '');
        const finalVal = stripped.length === 12 && stripped.startsWith('91') 
          ? stripped.slice(2) 
          : stripped;
        if (/^[6-9]\d{9}$/.test(finalVal)) delete copy.phone;
      }
      if (name === 'message' && value.trim().length >= 20) delete copy.message;
      return copy;
    });
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // File size validation (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File Too Large',
          description: 'Maximum allowed attachment size is 5MB.',
        });
        return;
      }
      setAttachedFile(file);
      toast({
        title: 'Drawing/BOQ Attached',
        description: `${file.name} queued successfully.`,
      });
    }
  }, [toast]);

  const removeFile = useCallback(() => {
    setAttachedFile(null);
  }, []);

  // Multi-step validation helper
  const validateStep = useCallback((currentStep: number): boolean => {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        errors.name = 'Full Name is required';
      } else if (formData.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
      }

      if (!formData.email) {
        errors.email = 'Email address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Invalid email address format';
      }

      const strippedPhone = formData.phone.replace(/\D/g, '');
      const finalPhone = strippedPhone.length === 12 && strippedPhone.startsWith('91') 
        ? strippedPhone.slice(2) 
        : strippedPhone;

      if (!formData.phone) {
        errors.phone = 'Phone number is required';
      } else if (!/^[6-9]\d{9}$/.test(finalPhone)) {
        errors.phone = 'Invalid phone number. Must be a 10-digit Indian number starting with 6-9';
      }
    }

    if (currentStep === 2) {
      if (formData.companyName && formData.companyName.trim().length < 2) {
        errors.companyName = 'Company name must be at least 2 characters';
      }
    }

    if (currentStep === 3) {
      if (!formData.message.trim()) {
        errors.message = 'Inquiry requirements are required';
      } else if (formData.message.trim().length < 20) {
        errors.message = 'Please describe your sizing requirements in at least 20 characters';
      }
      
      // Spam protection (repetitive character check)
      const nonSpaceMsg = formData.message.trim().replace(/\s/g, '');
      if (nonSpaceMsg.length >= 20) {
        const uniqueChars = new Set(nonSpaceMsg).size;
        if (uniqueChars / nonSpaceMsg.length < 0.15) {
          errors.message = 'Message lacks detail/contains repetitive spam text.';
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const resetCaptcha = () => {
    setCaptchaVerified(false);
    setCaptchaKey(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🛡️ Honeypot Field Check (bot protection) - silent reject
    if (honeypot) {
      onSuccess(`DT-2026-${Math.floor(100000 + Math.random() * 900000)}`);
      // Clear storage
      sessionStorage.removeItem('contact_form_step');
      sessionStorage.removeItem('contact_form_data');
      return;
    }

    // Validation
    if (!validateStep(3)) {
      toast({
        variant: 'destructive',
        title: 'Validation Failed',
        description: 'Please correct the errors in the form before submitting.',
      });
      return;
    }

    if (!captchaVerified) {
      toast({
        variant: "destructive",
        title: "Captcha Verification Required",
        description: "Please solve the math problem to prove you are human.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Collect basic metadata (Mentioned in privacy notice)
      const clientData = await collectClientData();
      
      let response;

      // ☁️ Send payload as FormData to handle Cloudinary upload on backend
      if (attachedFile) {
        const formDataPayload = new FormData();
        formDataPayload.append('file', attachedFile);
        formDataPayload.append('name', formData.name);
        formDataPayload.append('email', formData.email);
        formDataPayload.append('phone', formData.phone);
        formDataPayload.append('subject', formData.subject);
        formDataPayload.append('companyName', formData.companyName);
        formDataPayload.append('businessType', formData.businessType);
        formDataPayload.append('priceType', formData.priceType);
        formDataPayload.append('message', formData.message);
        
        // Metadata fields
        Object.entries(clientData).forEach(([key, val]) => {
          formDataPayload.append(key, String(val));
        });
        formDataPayload.append('source', 'Website - Contact Page');

        response = await apiClient.post('/inquiries', formDataPayload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then(res => res.data);
      } else {
        const payload = {
          ...formData,
          ...clientData,
          source: 'Website - Contact Page'
        };
        response = await api.inquiries.submit(payload);
      }

      // Generate Ticket Number
      const generatedTicket = (response as any)?.inquiryId || (response as any)?.data?.id || `DT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Clear Form Details & sessionStorage on success
      sessionStorage.removeItem('contact_form_step');
      sessionStorage.removeItem('contact_form_data');
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Bulk Order',
        companyName: '',
        businessType: 'retail',
        priceType: 'Standard Pricing',
        message: ''
      });
      setAttachedFile(null);
      setStep(1);

      // Force Captcha Reset
      resetCaptcha();

      onSuccess(generatedTicket);

    } catch (error: any) {
      console.error('Inquiry Submission Failed:', error);
      
      // Keep captcha verified state or reset? Resetting is safer to prevent automated retries
      resetCaptcha();

      toast({
        variant: "destructive",
        title: "Submission Error",
        description: error.response?.data?.error?.message || error.response?.data?.message || "Please check your details and try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-150 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500" />

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">

        {/* Step Tracker Progress Bar */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
          <div className="flex gap-2 items-center">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                  step === s
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : step > s
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
            ))}
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Step {step} of 3
          </span>
        </div>

        {/* Step 1: Your Contact Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shadow-sm">
                <User size={16} />
              </div>
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Your Contact Details</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider ml-0.5 flex items-center gap-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-semibold text-slate-800 text-base sm:text-sm shadow-inner ${
                    formErrors.name ? 'border-rose-500' : 'border-slate-100'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[10px] text-rose-500 font-bold ml-1">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider ml-0.5 flex items-center gap-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@company.com"
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-semibold text-slate-800 text-base sm:text-sm shadow-inner ${
                    formErrors.email ? 'border-rose-500' : 'border-slate-100'
                  }`}
                />
                {formErrors.email && (
                  <p className="text-[10px] text-rose-500 font-bold ml-1">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider ml-0.5 flex items-center gap-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 99933 04543"
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-semibold text-slate-800 text-base sm:text-sm shadow-inner ${
                    formErrors.phone ? 'border-rose-500' : 'border-slate-100'
                  }`}
                />
                {formErrors.phone && (
                  <p className="text-[10px] text-rose-500 font-bold ml-1">{formErrors.phone}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider ml-0.5 flex items-center gap-1">
                  Inquiry Type
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-semibold text-slate-850 text-base sm:text-sm shadow-inner"
                >
                  <option value="Bulk Order">Bulk Order</option>
                  <option value="Product Quotation">Product Quotation</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Company Details */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg shadow-sm">
                <Building2 size={16} />
              </div>
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Your Company Details</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider ml-0.5">
                  Company / Business Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Acme Industrial Ltd"
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-semibold text-slate-800 text-base sm:text-sm shadow-inner ${
                    formErrors.companyName ? 'border-rose-500' : 'border-slate-100'
                  }`}
                />
                {formErrors.companyName && (
                  <p className="text-[10px] text-rose-500 font-bold ml-1">{formErrors.companyName}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider ml-0.5">
                  Business Type
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-semibold text-slate-850 text-base sm:text-sm shadow-inner"
                >
                  <option value="retail">Retail</option>
                  <option value="wholesaler">Wholesale Distributor</option>
                  <option value="manufacturer">Industrial End-User</option>
                  <option value="contractor">Construction Contractor</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider ml-0.5 block mb-1">
                  Price Preference
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Standard Pricing', 'Bulk Order Pricing'].map((type) => {
                    const isBulk = type.includes('Bulk');
                    const selected = formData.priceType === type;
                    return (
                      <div
                        key={type}
                        onClick={() => setFormData(prev => ({ ...prev, priceType: type }))}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between shadow-sm ${
                          selected
                            ? isBulk
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                              : 'border-blue-500 bg-blue-50 text-blue-800'
                            : 'border-slate-100 bg-slate-50 text-slate-650 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-extrabold text-xs uppercase tracking-wide">{type}</span>
                          <span className="text-[9px] text-slate-455 font-bold mt-0.5">
                            {isBulk ? 'Discounted wholesale rates' : 'Regular sourcing pricing'}
                          </span>
                        </div>
                        {selected && (
                          <CheckCircle2 size={16} className={isBulk ? 'text-emerald-600' : 'text-blue-600'} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 📎 File Upload */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider ml-0.5">
                  Attach BOQ / Technical Drawings (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-500 transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    className="hidden"
                  />
                  {attachedFile ? (
                    <div className="flex items-center justify-between bg-white border border-slate-150 p-2.5 rounded-lg max-w-sm mx-auto shadow-sm">
                      <div className="flex items-center gap-2 overflow-hidden pr-2">
                        <FileText className="text-blue-500 flex-shrink-0" size={18} />
                        <span className="text-xs font-bold text-slate-700 truncate text-left">
                          {attachedFile.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-xs text-rose-500 hover:text-rose-700 font-bold px-2 py-1 rounded hover:bg-rose-50 flex items-center gap-0.5"
                      >
                        <X size={12} />
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="file-upload" className="cursor-pointer block space-y-1.5">
                      <Download size={20} className="mx-auto text-slate-400" />
                      <span className="text-xs font-extrabold text-blue-600 block">
                        Click to select drawing, PDF or BOQ list
                      </span>
                      <span className="text-[8px] text-slate-455 block font-bold uppercase">
                        PDF, Excel, Word or Images (Max 5MB)
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Product Sizing Requirements */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg shadow-sm">
                <MessageSquare size={16} />
              </div>
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Product & Sizing Requirements</h3>
            </div>

            {/* Honeypot field (anti-spam) */}
            <div className="absolute overflow-hidden -top-[9999px] -left-[9999px] h-0 w-0">
              <input
                type="text"
                name="website_url"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                placeholder="If you are human, leave this blank"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider ml-0.5 block">
                Specify Sizing Requirements <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                maxLength={1000}
                placeholder="Provide product codes, custom sizing bounds, materials (GI/CI), and estimated volume..."
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-semibold text-slate-800 text-base sm:text-sm resize-none shadow-inner h-36 ${
                  formErrors.message ? 'border-rose-500' : 'border-slate-100'
                }`}
              ></textarea>
              <div className="flex justify-between items-center px-1">
                {formErrors.message ? (
                  <p className="text-[10px] text-rose-500 font-bold">{formErrors.message}</p>
                ) : (
                  <span />
                )}
                <span className="text-[10px] font-bold text-slate-450">
                  {formData.message.length} / 1000 characters
                </span>
              </div>
            </div>

            {/* CAPTCHA Widget */}
            <div className="relative border border-slate-100 p-3 rounded-xl bg-slate-50/50">
              <CaptchaWidget key={captchaKey} onVerify={setCaptchaVerified} />
              <button
                type="button"
                onClick={resetCaptcha}
                className="absolute right-14 top-3 text-[9px] font-bold uppercase text-slate-400 hover:text-blue-600"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black uppercase tracking-widest text-xs rounded-xl transition-all"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (validateStep(step)) {
                  setStep(prev => prev + 1);
                }
              }}
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all"
            >
              Next Step
            </button>
          ) : (
            <button
              disabled={isSubmitting || !captchaVerified}
              type="submit"
              className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Submit quote request
                  <Send size={13} />
                </>
              )}
            </button>
          )}
        </div>

        <p className="text-[9px] text-slate-400 text-center font-bold">
          To prevent spam and verify transaction security, we collect basic browser metadata. Read our{' '}
          <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a>.
        </p>

      </form>
    </div>
  );
}

export default ContactForm;
