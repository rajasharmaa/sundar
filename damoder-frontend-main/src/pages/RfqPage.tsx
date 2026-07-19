import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRfq } from '@/context/RfqContext';
import { api } from '@/services/api/api-client';
import { useAuth } from '@/context/AuthContext';
import { getOptimizedUrl } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import CaptchaWidget from '@/components/inquiry/CaptchaWidget';
import {
  ClipboardList, Trash2, ArrowRight, Building2, MapPin,
  User, Mail, Phone, MessageSquare, ShieldCheck, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const GSTIN_STATE_MAP: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh'
};

export default function RfqPage() {
  const { rfqItems, removeFromRfq, updateQuantity, togglePriceType, clearRfq, rfqCount } = useRfq();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const language = i18n.language;

  // Form States
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    companyName: '',
    businessType: 'wholesale',
    location: '',
    gstNumber: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gstValidated, setGstValidated] = useState<boolean | null>(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'gstNumber') {
      const val = value.toUpperCase().replace(/\s/g, '');
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

      if (val.length === 15) {
        if (gstRegex.test(val)) {
          setGstValidated(true);
          const stateCode = val.substring(0, 2);
          const detectedState = GSTIN_STATE_MAP[stateCode];
          if (detectedState) {
            setFormData(prev => ({
              ...prev,
              gstNumber: val,
              location: prev.location ? `${prev.location}, ${detectedState}` : detectedState
            }));
            toast.success(`GSTIN Verified: Auto-filled state: ${detectedState}`);
          }
        } else {
          setGstValidated(false);
          toast.error('Invalid GSTIN Format');
        }
      } else {
        setGstValidated(null);
      }
    }
  };

  const handleQtyChange = (productId: string, quantity: number, selectedSize?: string) => {
    updateQuantity(productId, quantity, selectedSize);
  };

  const handlePriceToggle = (productId: string, priceType: '100' | '50', selectedSize?: string) => {
    togglePriceType(productId, priceType, selectedSize);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rfqItems.length === 0) {
      toast.error('Your inquiry cart is empty');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill out all required contact fields');
      return;
    }

    if (!captchaVerified) {
      toast.error('Please solve the security question to verify you are not a robot.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Map products array
      const productsPayload = rfqItems.map(item => {
        const matchingSize = item.product.sizeOptions?.find(s => s.size === item.selectedSize);
        const basePrice = item.priceType === '50'
          ? (matchingSize?.price_50_percent || 0)
          : (matchingSize?.price_100_percent || 0);

        return {
          productId: item.product.id || item.product._id,
          productName: item.product.name,
          productCode: item.product.productCode || '',
          quantity: item.quantity,
          selectedSize: item.selectedSize || 'Standard',
          priceType: item.priceType,
          unitPrice: basePrice
        };
      });

      const payload = {
        ...formData,
        subject: `Bulk B2B RFQ - ${rfqItems.length} Products Requested`,
        products: productsPayload,
        inquiryType: 'bulk'
      };

      await api.inquiries.submit(payload);
      toast.success('Your B2B quote request has been sent successfully!');
      clearRfq();
      navigate('/account');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to submit quote request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total RFQ estimate
  const rfqTotal = rfqItems.reduce((sum, item) => {
    const matchingSize = item.product.sizeOptions?.find(s => s.size === item.selectedSize);
    const price = item.priceType === '50'
      ? (matchingSize?.price_50_percent || 0)
      : (matchingSize?.price_100_percent || 0);
    return sum + (price * item.quantity);
  }, 0);

  return (
    <>
      <IndustrialBackground />
      <Navbar />

      <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 min-h-screen">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
              {language === 'hi' ? 'RFQ पूछताछ बास्केट' : 'Inquiry Basket / RFQ'}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
              {language === 'hi' ? 'कोटेशन प्राप्त करने के लिए सामान जोड़ें' : 'Manage your project needs and request wholesale rates.'}
            </p>
          </div>
        </div>

        {rfqItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <ClipboardList className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-800">Your basket is empty</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm">
              Explore our industrial pipes, valves, and fittings to build your RFQ list.
            </p>
            <Link
              to="/products"
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold rounded-xl transition-all shadow-md shadow-blue-500/10 hover:-translate-y-0.5"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: RFQ Items List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-md p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span>Selected Products</span>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-bold">
                    {rfqItems.length} unique items
                  </span>
                </h2>

                <div className="divide-y divide-slate-100">
                  {rfqItems.map((item, index) => {
                    const productId = item.product.id || item.product._id;
                    const matchingSize = item.product.sizeOptions?.find(s => s.size === item.selectedSize);
                    const unitPrice = item.priceType === '50'
                      ? (matchingSize?.price_50_percent || 0)
                      : (matchingSize?.price_100_percent || 0);

                    return (
                      <div key={`${productId}-${item.selectedSize}-${index}`} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex gap-4 items-center min-w-0 flex-1">
                          <div className="w-16 h-16 bg-slate-50 rounded-xl border p-2 flex items-center justify-center shrink-0">
                            <img
                              src={getOptimizedUrl(
                                (item.product.images?.[0] as any)?.url || 
                                (typeof item.product.images?.[0] === 'string' ? item.product.images[0] : null) || 
                                item.product.image || 
                                '/placeholder.svg'
                              )}
                              alt={item.product.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate hover:text-blue-600 transition-colors">
                              <Link to={`/products/${productId}`}>{item.product.name}</Link>
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {item.selectedSize && (
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                  Size: {item.selectedSize}
                                </span>
                              )}
                              {item.product.productCode && (
                                <span className="text-[10px] font-bold text-slate-400 font-mono">
                                  #{item.product.productCode}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                          {/* Price Type Switcher */}
                          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handlePriceToggle(productId, '100', item.selectedSize)}
                              className={`px-3 py-1 rounded text-[10px] font-black uppercase transition-all ${item.priceType === '100'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                              Standard
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePriceToggle(productId, '50', item.selectedSize)}
                              className={`px-3 py-1 rounded text-[10px] font-black uppercase transition-all ${item.priceType === '50'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                              Wholesale (50%)
                            </button>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(productId, item.quantity - 1, item.selectedSize)}
                              className="w-7 h-7 flex items-center justify-center bg-slate-50 hover:bg-slate-100 border rounded font-black text-slate-700 text-sm transition-colors active:scale-95"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm font-bold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQtyChange(productId, item.quantity + 1, item.selectedSize)}
                              className="w-7 h-7 flex items-center justify-center bg-slate-50 hover:bg-slate-100 border rounded font-black text-slate-700 text-sm transition-colors active:scale-95"
                            >
                              +
                            </button>
                          </div>

                          {/* Price representation */}
                          <div className="text-right w-24 shrink-0">
                            <p className="text-xs text-slate-400">Rate: ₹{unitPrice.toFixed(2)}</p>
                            <p className="text-sm font-bold text-slate-900 tabular-nums mt-0.5">
                              ₹{(unitPrice * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => removeFromRfq(productId, item.selectedSize)}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition-colors shrink-0"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: B2B Inquiry Form */}
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-md p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Request Quotes</h3>

                {/* Estimate Summary */}
                <div className="bg-slate-50 border p-4 rounded-2xl space-y-2 mb-6">
                  <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <span>Inquiry Size:</span>
                    <span>{rfqCount} item(s)</span>
                  </div>
                  <div className="flex justify-between items-end border-t pt-2 mt-2">
                    <span className="text-sm font-bold text-slate-700">Estimated Total:</span>
                    <span className="text-xl font-black text-blue-600 tabular-nums">
                      ₹{rfqTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* B2B Details Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase">
                      Contact Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="John Doe"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase">
                      Business Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="john@company.com"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase">
                      Phone / Mobile <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="98765 43210"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="Damodar Traders Ltd"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase">
                        Business Type
                      </label>
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="wholesale">Wholesaler</option>
                        <option value="contractor">Contractor</option>
                        <option value="builder">Builder</option>
                        <option value="retail">Retailer</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase">
                        GSTIN (B2B Tax ID)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="gstNumber"
                          value={formData.gstNumber}
                          onChange={handleInputChange}
                          maxLength={15}
                          placeholder="27AAAAA1111A1Z1"
                          className={`w-full px-3 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase ${gstValidated === true
                            ? 'border-green-300 bg-green-50/20'
                            : gstValidated === false
                              ? 'border-red-300 bg-red-50/20'
                              : 'border-slate-200'
                            }`}
                        />
                        {gstValidated === true && (
                          <ShieldCheck className="absolute right-3 top-3 w-4 h-4 text-green-600" />
                        )}
                        {gstValidated === false && (
                          <AlertCircle className="absolute right-3 top-3 w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase">
                      State / Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Mumbai, Maharashtra"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase">
                      Additional Message
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="State any specific requests, customized sizes or delivery schedules here..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>

                  <CaptchaWidget onVerify={setCaptchaVerified} />

                  <button
                    type="submit"
                    disabled={isSubmitting || !captchaVerified}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 text-center flex items-center justify-center gap-2 mt-6"
                  >
                    {isSubmitting ? (
                      'Sending Request...'
                    ) : (
                      <>
                        <span>Submit Bulk B2B RFQ</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
