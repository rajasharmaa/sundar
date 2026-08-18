import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Inquiry } from '@/types';
import { 
  Phone, Mail, MapPin, Calendar, Clock, Monitor, Smartphone, Tablet,
  Globe, Building2, User, Package, Link as LinkIcon, MessageSquare,
  ExternalLink, Copy, Check, FileText, Users, Briefcase, ShieldCheck, ClipboardList,
  Paperclip
} from 'lucide-react';
import { useState } from 'react';

interface InquiryDetailDialogProps {
  inquiry: Inquiry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InquiryDetailDialog({ inquiry, open, onOpenChange }: InquiryDetailDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!inquiry) return null;

  // Debug log for pricing data
  console.log('🔍 InquiryDetailDialog - Pricing Data:', {
    productName: inquiry.productName,
    selectedSize: inquiry.selectedSize,
    priceType: inquiry.priceType,
    sizePrice100: inquiry.sizePrice100,
    sizePrice50: inquiry.sizePrice50,
    productCode: inquiry.productCode
  });

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getDeviceIcon = () => {
    switch (inquiry.deviceType) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getLeadQualityColor = (quality?: string) => {
    switch (quality) {
      case 'hot': return 'bg-red-100 text-red-800 border-red-300';
      case 'warm': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cold': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'new': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white shadow-2xl border border-slate-200">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
            <MessageSquare className="w-5.5 h-5.5 text-green-600 shrink-0" />
            Inquiry Details
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {/* Header Section - Improved responsive layout */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
            <div className="flex-1 min-w-0 w-full sm:w-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{inquiry.name}</h3>
              <div className="flex flex-wrap gap-2">
                <Badge className={getStatusColor(inquiry.status)}>
                  {inquiry.status?.toUpperCase()}
                </Badge>
                <Badge className={getLeadQualityColor(inquiry.leadQuality)}>
                  {inquiry.leadQuality?.toUpperCase() || 'WARM'} Lead
                </Badge>
                {!inquiry.read && (
                  <Badge variant="destructive">Unread</Badge>
                )}
              </div>
            </div>
            <div className="text-right text-sm text-gray-500 shrink-0">
              <div className="flex items-center gap-2 justify-end mb-1">
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{formatDate(inquiry.createdAt)}</span>
              </div>
              <div className="text-xs">ID: {inquiry._id?.slice(-8)}</div>
            </div>
          </div>

          {/* Contact Information - Fixed grid and overflow */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 shrink-0" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg overflow-hidden">
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Phone className="w-4 h-4 shrink-0 text-gray-500" />
                  <span className="text-sm truncate">{inquiry.phone || 'Not provided'}</span>
                  {inquiry.phone && (
                    <button
                      onClick={() => copyToClipboard(inquiry.phone || '', 'phone')}
                      className="ml-auto shrink-0 text-gray-400 hover:text-gray-600"
                    >
                      {copiedField === 'phone' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-4 h-4 shrink-0 text-gray-500" />
                  <span className="text-sm truncate">{inquiry.email}</span>
                  {inquiry.email && (
                    <button
                      onClick={() => copyToClipboard(inquiry.email, 'email')}
                      className="ml-auto shrink-0 text-gray-400 hover:text-gray-600"
                    >
                      {copiedField === 'email' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-4 h-4 shrink-0 text-gray-500" />
                  <span className="text-sm truncate">{inquiry.businessName || inquiry.companyName || 'Not provided'}</span>
                </div>
                {inquiry.businessType && (
                  <div className="flex items-center gap-2 min-w-0">
                    <Briefcase className="w-4 h-4 shrink-0 text-gray-500" />
                    <span className="text-sm truncate">Type: {inquiry.businessType}</span>
                  </div>
                )}
                {inquiry.gstNumber && (
                  <div className="flex items-center gap-2 min-w-0">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-green-600" />
                    <span className="text-sm font-bold text-slate-800">GSTIN: {inquiry.gstNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 shrink-0 text-gray-500" />
                  <span className="text-sm truncate">
                    {[inquiry.city, inquiry.state, inquiry.country].filter(Boolean).join(', ') || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Context - Better containment */}
          {inquiry.products && inquiry.products.length > 0 ? (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 shrink-0 text-green-600" />
                B2B Request For Quote (RFQ) - {inquiry.products.length} Items
              </h4>
              <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-250 text-slate-700 font-bold uppercase tracking-wider">
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Size</th>
                      <th className="p-3">Price Type</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {inquiry.products.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-100/50">
                        <td className="p-3 font-semibold text-slate-900">
                          {item.productName}
                          {item.productCode && <span className="text-[10px] text-slate-400 font-mono block mt-0.5">#{item.productCode}</span>}
                        </td>
                        <td className="p-3 font-bold">{item.selectedSize || 'Standard'}</td>
                        <td className="p-3">
                          {item.priceType === '50' ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] py-0">Wholesale (50%)</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 border-green-300 text-[10px] py-0">Standard (100%)</Badge>
                          )}
                        </td>
                        <td className="p-3 text-center font-semibold tabular-nums">{item.quantity}</td>
                        <td className="p-3 text-right font-medium tabular-nums">₹{item.unitPrice?.toFixed(2) || '0.00'}</td>
                        <td className="p-3 text-right font-bold text-slate-900 tabular-nums">₹{((item.unitPrice || 0) * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="bg-green-50/50 font-bold border-t-2 border-slate-300">
                      <td colSpan={5} className="p-3 text-slate-700">Estimated RFQ Total Value:</td>
                      <td className="p-3 text-right text-sm text-green-600 font-black tabular-nums">
                        ₹{(inquiry.totalEstimatedValue || inquiry.products.reduce((sum, p) => sum + ((p.unitPrice || 0) * p.quantity), 0)).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (inquiry.productName || inquiry.selectedSize || inquiry.priceType) ? (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 shrink-0" />
                Product & Pricing Details
              </h4>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-4 rounded-lg overflow-hidden space-y-3">
                {inquiry.productName && (
                  <div className="flex items-start gap-2">
                    <Package className="w-4 h-4 shrink-0 text-purple-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-purple-700 mb-0.5">Product:</div>
                      <div className="font-medium text-purple-900 truncate">{inquiry.productName}</div>
                    </div>
                  </div>
                )}
                
                {inquiry.productCode && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 shrink-0 text-purple-600" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-purple-700 mb-0.5">Product Code:</div>
                      <div className="text-sm text-purple-900 font-mono truncate">{inquiry.productCode}</div>
                    </div>
                  </div>
                )}
                
                {inquiry.selectedSize && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 shrink-0 text-purple-600" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-purple-700 mb-0.5">Selected Size:</div>
                      <div className="text-sm text-purple-900 font-semibold">{inquiry.selectedSize}</div>
                    </div>
                  </div>
                )}
                
                {inquiry.priceType && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 shrink-0 text-purple-600" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-purple-700 mb-0.5">Price Type:</div>
                      <div className="text-sm">
                        {(inquiry.priceType === '100' || inquiry.priceType === 'Standard (100%)') ? (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            Standard (100%)
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            Wholesale (50%)
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {(inquiry.sizePrice100 || inquiry.sizePrice50) && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 shrink-0 text-purple-600" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-purple-700 mb-0.5">Pricing Details:</div>
                      <div className="text-sm">
                        {inquiry.sizePrice100 && (
                          <span className="mr-4 text-purple-900">
                            Standard Price: <span className="font-bold">₹{inquiry.sizePrice100.toFixed(2)}</span>
                          </span>
                        )}
                        {inquiry.sizePrice50 && (
                          <span className="text-green-700 font-bold">
                            Wholesale Price: <span className="font-bold">₹{inquiry.sizePrice50.toFixed(2)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {inquiry.productId && (
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 shrink-0 text-purple-600" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-purple-700 mb-0.5">Product ID:</div>
                      <div className="text-sm text-purple-900 font-mono truncate">ID: {inquiry.productId.toString().slice(-8)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Inquiry Message - Fixed overflow */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 shrink-0" />
              Message
            </h4>
            <div className="bg-white border border-gray-200 p-4 rounded-lg overflow-hidden">
              <div className="text-sm text-gray-600 mb-2 font-medium truncate">{inquiry.subject}</div>
              <p className="text-gray-800 whitespace-pre-wrap break-words max-w-full">{inquiry.message}</p>
            </div>
          </div>

          {/* Attached Document */}
          {inquiry.attachmentUrl && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Paperclip className="w-4 h-4 shrink-0 text-green-600" />
                Attached Document
              </h4>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="w-8 h-8 text-green-500 shrink-0" />
                  <div className="truncate">
                    <div className="text-sm font-bold text-slate-800 truncate">{inquiry.attachmentName || 'Attachment'}</div>
                    <div className="text-[10px] text-slate-500">Uploaded via Cloudinary</div>
                  </div>
                </div>
                <a 
                  href={inquiry.attachmentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Document
                </a>
              </div>
            </div>
          )}

          {/* Admin Response - If reply exists */}
          {inquiry.replyMessage && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-green-600" />
                Response Sent to Customer
              </h4>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg overflow-hidden">
                <div className="text-sm text-green-800 font-medium truncate mb-2">{inquiry.replySubject || `Re: ${inquiry.subject}`}</div>
                <p className="text-gray-800 text-sm whitespace-pre-wrap break-words max-w-full">{inquiry.replyMessage}</p>
                {inquiry.repliedAt && (
                  <div className="text-[10px] text-gray-400 mt-3 text-right">
                    Replied on {formatDate(inquiry.repliedAt)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Auto-Collected Data - Fixed grid layout */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Monitor className="w-4 h-4 shrink-0" />
              Technical Details (Auto-Collected)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg overflow-hidden">
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2 text-sm min-w-0">
                  {getDeviceIcon()}
                  <span className="capitalize truncate">{inquiry.deviceType || 'Desktop'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <Globe className="w-4 h-4 shrink-0 text-gray-500" />
                  <span className="truncate">{inquiry.browser || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <MapPin className="w-4 h-4 shrink-0 text-gray-500" />
                  <span className="truncate">IP: {inquiry.ipAddress || 'Not collected'}</span>
                </div>
              </div>
              <div className="space-y-2 min-w-0">
                <div className="text-sm min-w-0">
                  <div className="text-gray-500 mb-1 truncate">Page Source:</div>
                  <a 
                    href={inquiry.pageSource || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline flex items-center gap-1 truncate"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{inquiry.pageSource || 'Direct'}</span>
                  </a>
                </div>
                <div className="text-sm min-w-0">
                  <div className="text-gray-500 mb-1 truncate">Referrer:</div>
                  <div className="truncate">{inquiry.pageSource ? 'Web' : 'Direct'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline & Notes - Better spacing */}
          {(inquiry.contactedAt || inquiry.contactNotes) && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                Contact History
              </h4>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg space-y-3 overflow-hidden">
                {inquiry.contactedAt && (
                  <div className="flex items-center gap-2 text-sm min-w-0">
                    <Check className="w-4 h-4 shrink-0 text-green-600" />
                    <span className="truncate">Contacted on: {formatDate(inquiry.contactedAt)}</span>
                  </div>
                )}
                {inquiry.contactNotes && (
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-600 mb-1 truncate">Notes:</div>
                    <p className="text-sm text-gray-700 break-words">{inquiry.contactNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions - Responsive layout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t mt-4">
            <a
              href={`tel:${inquiry.phone}`}
              className="w-full"
            >
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                <Phone className="w-4 h-4 mr-2 shrink-0" />
                <span className="truncate">Call</span>
              </Button>
            </a>
            <a
              href={`mailto:${inquiry.email}`}
              className="w-full"
            >
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                <Mail className="w-4 h-4 mr-2 shrink-0" />
                <span className="truncate">Email</span>
              </Button>
            </a>
            <a
              href={`https://wa.me/${inquiry.phone?.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(inquiry.name)},%20regarding%20your%20inquiry%20about%20${encodeURIComponent(inquiry.productName || 'our%20products')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                <MessageSquare className="w-4 h-4 mr-2 shrink-0" />
                <span className="truncate">WhatsApp</span>
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
