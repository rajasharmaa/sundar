import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Shield, MessageSquare, Paperclip } from 'lucide-react';
import { ListSkeleton } from '@/components/skeletons/SkeletonLoader';

interface Inquiry {
  _id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  phone?: string;
  companyName?: string;
  productName?: string;
  city?: string;
  state?: string;
  country?: string;
  replyMessage?: string;
  replySubject?: string;
  repliedAt?: string;
  updatedAt?: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

interface InquiryTabProps {
  inquiries: Inquiry[];
  loadingInquiries: boolean;
  inquiriesError: any;
  isHindi: boolean;
  activeTheme: {
    primary: string;
    text: string;
    shadow: string;
    ring: string;
  };
  navigate: (path: string) => void;
}

const InquiryTab = ({
  inquiries,
  loadingInquiries,
  inquiriesError,
  isHindi,
  activeTheme,
  navigate
}: InquiryTabProps) => {
  const [expandedInquiryId, setExpandedInquiryId] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isHindi ? 'सहायता और पूछताछ टिकट' : 'Support Tickets'}
          </h2>
          <p className="text-slate-500 mt-1">
            {isHindi ? 'अपने उत्पाद संबंधी पूछताछ और उनके जवाबों को ट्रैक करें' : 'Track the status of your product inquiries'}
          </p>
        </div>
      </div>

      {loadingInquiries ? (
        <ListSkeleton count={4} />
      ) : inquiriesError ? (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100">
          {isHindi ? 'पूछताछ लोड करने में विफलता। कृपया पृष्ठ रीफ्रेश करें।' : 'Failed to load inquiries. Please refresh the page.'}
        </div>
      ) : inquiries.length > 0 ? (
        <div className="space-y-4">
          {inquiries.map((inquiry) => {
            const isExpanded = expandedInquiryId === inquiry._id;
            return (
              <div 
                key={inquiry._id} 
                className={`border border-slate-200 rounded-2xl transition-all duration-300 overflow-hidden bg-white ${
                  isExpanded ? `border-blue-500 shadow-md ring-1 ${activeTheme.ring}` : 'hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/5'
                }`}
              >
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className={`px-3 py-1 text-[10px] tracking-wider uppercase font-bold rounded-full border ${
                          inquiry.status.toLowerCase() === 'new' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          inquiry.status.toLowerCase() === 'resolved' || inquiry.status.toLowerCase() === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {inquiry.status}
                        </span>
                        <span className="text-sm font-semibold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(inquiry.createdAt).toLocaleDateString(isHindi ? 'hi-IN' : 'en-US')}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg truncate">{inquiry.subject}</h4>
                      {!isExpanded && (
                        <p className="text-slate-600 text-sm mt-1 line-clamp-2">{inquiry.message}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => setExpandedInquiryId(isExpanded ? null : inquiry._id)}
                      className={`shrink-0 px-5 py-2.5 font-bold rounded-xl transition-all duration-300 text-sm border ${
                        isExpanded 
                          ? 'bg-slate-950 text-white border-slate-950 hover:bg-slate-800' 
                          : 'bg-slate-50 hover:bg-blue-600 hover:text-white border-slate-200 hover:border-blue-600 text-slate-700'
                      }`}
                    >
                      {isExpanded ? (isHindi ? 'विवरण बंद करें' : 'Close Details') : (isHindi ? 'पूछताछ देखें' : 'View Thread')}
                    </button>
                  </div>

                  {/* Framer Motion height drop animation for thread */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 pt-6 border-t border-slate-100 space-y-6">
                          {/* Inquiry Details Info Grid */}
                          {(inquiry.productName || inquiry.companyName || inquiry.city) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                              {inquiry.productName && (
                                <div>
                                  <span className="text-xs font-semibold text-slate-400 block mb-0.5 uppercase tracking-wider">
                                    {isHindi ? 'उत्पाद रुचि' : 'Product Interest'}
                                  </span>
                                  <span className="font-bold text-slate-800">{inquiry.productName}</span>
                                </div>
                              )}
                              {inquiry.companyName && (
                                <div>
                                  <span className="text-xs font-semibold text-slate-400 block mb-0.5 uppercase tracking-wider">
                                    {isHindi ? 'कंपनी' : 'Company'}
                                  </span>
                                  <span className="font-bold text-slate-800">{inquiry.companyName}</span>
                                </div>
                              )}
                              {(inquiry.city || inquiry.country) && (
                                <div>
                                  <span className="text-xs font-semibold text-slate-400 block mb-0.5 uppercase tracking-wider">
                                    {isHindi ? 'स्थान' : 'Location'}
                                  </span>
                                  <span className="font-bold text-slate-800">
                                    {[inquiry.city, inquiry.state || inquiry.country].filter(Boolean).join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Ticket Chat Messages Thread */}
                          <div className="space-y-6">
                            {/* User's Original Message */}
                            <div className="flex flex-col items-start max-w-[85%]">
                              <div className="bg-slate-100 text-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-200 text-sm shadow-sm relative">
                                <p className="font-black text-slate-900 mb-1">
                                  {isHindi ? 'आपकी पूछताछ' : 'Your Inquiry'}
                                </p>
                                <p className="whitespace-pre-wrap break-words">{inquiry.message}</p>
                                
                                {inquiry.attachmentUrl && (
                                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-2">
                                    <Paperclip className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    <a 
                                      href={inquiry.attachmentUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5"
                                    >
                                      {inquiry.attachmentName || (isHindi ? 'संलग्न दस्तावेज देखें' : 'View Attachment')}
                                    </a>
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-semibold mt-1.5 ml-2">
                                {new Date(inquiry.createdAt).toLocaleString(isHindi ? 'hi-IN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {/* Admin response */}
                            {inquiry.replyMessage ? (
                              <div className="flex flex-col items-end max-w-[85%] ml-auto">
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 rounded-2xl rounded-tr-none border border-blue-700 text-sm shadow-md">
                                  <div className="flex items-center gap-1.5 font-bold text-white mb-1">
                                    <Shield className="w-3.5 h-3.5 text-blue-200" />
                                    {isHindi ? 'दामोदर सपोर्ट टीम' : 'Damodar Support Team'}
                                  </div>
                                  <p className="text-blue-100 font-bold mb-2 text-[10px] uppercase tracking-wider">{inquiry.replySubject}</p>
                                  <p className="whitespace-pre-wrap break-words text-white leading-relaxed">{inquiry.replyMessage}</p>
                                </div>
                                <span className="text-[10px] text-slate-400 font-semibold mt-1.5 mr-2">
                                  {isHindi ? 'जवाब मिला' : 'Replied on'} {new Date(inquiry.repliedAt || inquiry.updatedAt || Date.now()).toLocaleString(isHindi ? 'hi-IN' : 'en-US', { dateStyle: 'short', timeStyle: 'short' })}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end max-w-[85%] ml-auto">
                                <div className="bg-slate-50 text-slate-600 p-4 rounded-2xl rounded-tr-none border border-slate-200 border-dashed text-sm">
                                  <div className="flex items-center gap-2 text-slate-500 font-bold mb-1">
                                    <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                                    {isHindi ? 'समीक्षा प्रगति पर है' : 'Review in Progress'}
                                  </div>
                                  <p>
                                    {isHindi 
                                      ? 'हमारे तकनीकी प्रतिनिधि आपकी पूछताछ विनिर्देशों की समीक्षा कर रहे हैं। हम शीघ्र ही यहाँ जवाब पोस्ट करेंगे।' 
                                      : 'Our sales and engineering representatives are reviewing your inquiry specifications. We will post a reply here shortly.'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-10 h-10 text-blue-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {isHindi ? 'कोई सक्रिय पूछताछ टिकट नहीं' : 'No Active Inquiries'}
          </h3>
          <p className="text-slate-500 max-w-sm mb-6">
            {isHindi ? 'थोक मूल्य निर्धारण या कस्टम विनिर्देशों की आवश्यकता है? हमें एक पूछताछ भेजें।' : 'Need bulk pricing or custom specifications? Send us an inquiry.'}
          </p>
          <button onClick={() => navigate('/contact')} className={`px-6 py-3 text-white font-bold rounded-xl transition-colors shadow-lg ${activeTheme.primary} ${activeTheme.shadow}`}>
            {isHindi ? 'बिक्री टीम से संपर्क करें' : 'Contact Sales'}
          </button>
        </div>
      )}
    </div>
  );
};

export default InquiryTab;
