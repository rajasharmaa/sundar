import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { UploadCloud, CheckCircle2, ChevronRight, ChevronLeft, Package, Box, Image as ImageIcon, MapPin } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SEO from '../components/SEO/MetaTags';
import { api } from '@/services/api/api-client';
import { toast } from 'sonner';

type FormData = {
  // Step 1: Product
  category: string;
  dimensions: string;
  quantity: string;
  material: string;
  // Step 2: Design
  printingRequired: string;
  colors: string;
  designFile: FileList | null;
  // Step 3: Contact
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};

const steps = [
  { id: 'product', title: 'Product Details', icon: Box },
  { id: 'design', title: 'Design & Artwork', icon: ImageIcon },
  { id: 'contact', title: 'Contact Info', icon: MapPin },
];

const RequestQuote = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      printingRequired: 'yes',
      quantity: '5000'
    }
  });

  const watchPrinting = watch('printingRequired');

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Format RFQ data as an Inquiry
      const messageBody = `
RFQ Details:
Category: ${data.category}
Dimensions: ${data.dimensions}
Quantity: ${data.quantity}
Material: ${data.material}
Printing Required: ${data.printingRequired}
Colors: ${data.colors}
Additional Notes: ${data.notes || 'None'}
      `.trim();

      if (data.designFile && data.designFile.length > 0) {
        // Send as multipart/form-data if there is a file
        const formData = new window.FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('phone', data.phone);
        formData.append('companyName', data.company);
        formData.append('subject', `Request for Quote: ${data.category}`);
        formData.append('message', messageBody);
        formData.append('pageSource', 'Request Quote Form');
        formData.append('file', data.designFile[0]);

        await api.inquiries.submit(formData);
      } else {
        // Send as JSON if no file
        await api.inquiries.submit({
          name: data.name,
          email: data.email,
          phone: data.phone,
          companyName: data.company,
          subject: `Request for Quote: ${data.category}`,
          message: messageBody,
          pageSource: 'Request Quote Form',
        });
      }

      setIsSuccess(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit quote request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <SEO 
        title="Request a Custom Quote | Sundar Corporation"
        description="Get a customized quote for your bulk packaging requirements. We offer competitive pricing for BOPP bags and PP woven sacks."
      />
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-black text-navy uppercase tracking-tight mb-4">
              Request a <span className="text-amber-500">Quote</span>
            </h1>
            <p className="text-navy/60 font-medium max-w-xl mx-auto">
              Provide us with your requirements and our team will get back to you with a competitive pricing estimate within 24 hours.
            </p>
          </div>

          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-12 rounded-2xl shadow-xl text-center border border-navy/5"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-display font-black text-navy uppercase tracking-tight mb-4">Quote Request Sent</h2>
              <p className="text-navy/60 font-medium mb-8 max-w-md mx-auto">
                Thank you for your interest. Our manufacturing specialists are reviewing your requirements and will contact you shortly.
              </p>
              <button 
                onClick={() => window.location.href = '/'}
                className="px-8 py-4 bg-navy text-white font-bold uppercase tracking-wider text-sm rounded hover:bg-navy-light transition-colors"
              >
                Return Home
              </button>
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-navy/5">
              {/* Progress Bar */}
              <div className="flex border-b border-navy/5">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  return (
                    <div 
                      key={step.id} 
                      className={`flex-1 p-4 md:p-6 flex items-center justify-center gap-3 transition-colors ${
                        isActive ? 'bg-navy text-white' : 
                        isCompleted ? 'bg-amber-50 text-amber-600' : 'bg-white text-navy/40'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isActive ? 'bg-white/20' : 
                        isCompleted ? 'bg-amber-200' : 'bg-navy/5'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                      </div>
                      <span className="hidden md:block font-bold uppercase tracking-wider text-xs">{step.title}</span>
                    </div>
                  );
                })}
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-12">
                <AnimatePresence mode="wait">
                  {currentStep === 0 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-2xl font-display font-black text-navy uppercase tracking-tight mb-6">Product Details</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-2">Product Category *</label>
                          <select 
                            {...register('category', { required: true })}
                            className="w-full p-4 bg-navy/5 border border-transparent rounded focus:border-amber-500 focus:bg-white outline-none transition-all font-medium"
                          >
                            <option value="">Select Category</option>
                            <option value="bopp-bags">BOPP Printed Bags</option>
                            <option value="pp-woven">PP Woven Sacks</option>
                            <option value="jumbo-bags">Jumbo Bags (FIBC)</option>
                            <option value="other">Other Packaging</option>
                          </select>
                          {errors.category && <span className="text-red-500 text-xs mt-1 block">This field is required</span>}
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-2">Estimated Quantity *</label>
                          <select 
                            {...register('quantity', { required: true })}
                            className="w-full p-4 bg-navy/5 border border-transparent rounded focus:border-amber-500 focus:bg-white outline-none transition-all font-medium"
                          >
                            <option value="1000-5000">1,000 - 5,000 pcs</option>
                            <option value="5000-10000">5,000 - 10,000 pcs</option>
                            <option value="10000-50000">10,000 - 50,000 pcs</option>
                            <option value="50000+">50,000+ pcs</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-2">Dimensions (W x L x Gusset)</label>
                          <input 
                            type="text" 
                            {...register('dimensions')}
                            placeholder="e.g. 10 x 15 x 3 inches"
                            className="w-full p-4 bg-navy/5 border border-transparent rounded focus:border-amber-500 focus:bg-white outline-none transition-all font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-2">Material / GSM</label>
                          <input 
                            type="text" 
                            {...register('material')}
                            placeholder="e.g. 60 GSM, Laminated"
                            className="w-full p-4 bg-navy/5 border border-transparent rounded focus:border-amber-500 focus:bg-white outline-none transition-all font-medium"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 1 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-2xl font-display font-black text-navy uppercase tracking-tight mb-6">Design & Artwork</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-3">Custom Printing Required?</label>
                          <div className="flex gap-4">
                            <label className="flex-1 cursor-pointer">
                              <input type="radio" value="yes" {...register('printingRequired')} className="peer sr-only" />
                              <div className="p-4 text-center border-2 border-navy/10 rounded font-bold uppercase tracking-wider text-sm text-navy/60 peer-checked:border-amber-500 peer-checked:text-amber-600 peer-checked:bg-amber-50 transition-all">
                                Yes, Custom Print
                              </div>
                            </label>
                            <label className="flex-1 cursor-pointer">
                              <input type="radio" value="no" {...register('printingRequired')} className="peer sr-only" />
                              <div className="p-4 text-center border-2 border-navy/10 rounded font-bold uppercase tracking-wider text-sm text-navy/60 peer-checked:border-navy peer-checked:text-navy peer-checked:bg-navy/5 transition-all">
                                No, Plain Bags
                              </div>
                            </label>
                          </div>
                        </div>

                        {watchPrinting === 'yes' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6">
                            <div>
                              <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-2">Number of Colors</label>
                              <select 
                                {...register('colors')}
                                className="w-full p-4 bg-navy/5 border border-transparent rounded focus:border-amber-500 focus:bg-white outline-none transition-all font-medium"
                              >
                                <option value="1-2">1-2 Colors</option>
                                <option value="3-4">3-4 Colors</option>
                                <option value="5-8">5-8 Colors (Full Color)</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-2">Upload Reference Artwork (Optional)</label>
                              <label className="block border-2 border-dashed border-navy/20 rounded-lg p-10 text-center hover:bg-navy/5 transition-colors cursor-pointer relative">
                                {watch('designFile') && watch('designFile')?.[0] ? (
                                  <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <p className="font-bold text-navy mb-1">{watch('designFile')![0].name}</p>
                                    <p className="text-xs text-emerald-600 font-medium">Click to change file</p>
                                  </div>
                                ) : (
                                  <>
                                    <UploadCloud className="w-12 h-12 text-navy/30 mx-auto mb-4" />
                                    <p className="font-bold text-navy mb-1">Click to upload or drag & drop</p>
                                    <p className="text-xs text-navy/50 uppercase tracking-wider">PDF, AI, JPG, or PNG (Max 10MB)</p>
                                  </>
                                )}
                                <input type="file" accept=".pdf,.ai,.jpg,.jpeg,.png" {...register('designFile')} className="hidden" />
                              </label>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-2xl font-display font-black text-navy uppercase tracking-tight mb-6">Contact Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-2">Full Name *</label>
                          <input 
                            type="text" 
                            {...register('name', { required: true })}
                            className="w-full p-4 bg-navy/5 border border-transparent rounded focus:border-amber-500 focus:bg-white outline-none transition-all font-medium"
                          />
                          {errors.name && <span className="text-red-500 text-xs mt-1 block">This field is required</span>}
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-2">Company Name *</label>
                          <input 
                            type="text" 
                            {...register('company', { required: true })}
                            className="w-full p-4 bg-navy/5 border border-transparent rounded focus:border-amber-500 focus:bg-white outline-none transition-all font-medium"
                          />
                          {errors.company && <span className="text-red-500 text-xs mt-1 block">This field is required</span>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-2">Email Address *</label>
                          <input 
                            type="email" 
                            {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                            className="w-full p-4 bg-navy/5 border border-transparent rounded focus:border-amber-500 focus:bg-white outline-none transition-all font-medium"
                          />
                          {errors.email && <span className="text-red-500 text-xs mt-1 block">Valid email is required</span>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-2">Phone Number *</label>
                          <input 
                            type="tel" 
                            {...register('phone', { required: true })}
                            className="w-full p-4 bg-navy/5 border border-transparent rounded focus:border-amber-500 focus:bg-white outline-none transition-all font-medium"
                          />
                          {errors.phone && <span className="text-red-500 text-xs mt-1 block">This field is required</span>}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-2">Shipping Location / Delivery Address</label>
                          <input 
                            type="text" 
                            {...register('address')}
                            className="w-full p-4 bg-navy/5 border border-transparent rounded focus:border-amber-500 focus:bg-white outline-none transition-all font-medium"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-2">Additional Notes</label>
                          <textarea 
                            {...register('notes')}
                            rows={4}
                            className="w-full p-4 bg-navy/5 border border-transparent rounded focus:border-amber-500 focus:bg-white outline-none transition-all font-medium resize-none"
                          ></textarea>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-12 pt-6 border-t border-navy/10">
                  {currentStep > 0 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex items-center gap-2 px-6 py-3 text-navy font-bold uppercase tracking-wider text-sm hover:bg-navy/5 rounded transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {currentStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2 px-8 py-4 bg-navy text-white font-bold uppercase tracking-wider text-sm rounded hover:bg-navy-light transition-colors shadow-lg"
                    >
                      Next Step <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-10 py-4 bg-amber-500 text-navy font-black uppercase tracking-wider text-sm rounded hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-70"
                    >
                      {isSubmitting ? 'Requesting...' : 'Request Quote'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RequestQuote;
