import { Inquiry } from '@/types';
import { formatDateTime } from '@/utils/helpers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { INQUIRY_STATUSES } from '@/utils/constants';
import { Mail, Trash2, Eye, Phone, Building, MapPin, Package, Clock, CheckCircle2, AlertCircle, ChevronRight, MessageSquare, ClipboardList, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';

interface InquiryCardProps {
  inquiry: Inquiry;
  onStatusChange: (id: string, status: Inquiry['status']) => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (inquiry: Inquiry) => void;
  onReply: (inquiry: Inquiry) => void;
  onView: (inquiry: Inquiry) => void;
}

export function InquiryCard({
  inquiry,
  onStatusChange,
  onMarkAsRead,
  onDelete,
  onReply,
  onView,
}: InquiryCardProps) {

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="w-3.5 h-3.5 mr-1" />;
      case 'pending': return <Clock className="w-3.5 h-3.5 mr-1" />;
      case 'completed': return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="relative group h-full">
      {/* Premium glowing background on hover */}
      <div className={cn(
        "absolute -inset-0.5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500",
        !inquiry.read ? "bg-green-400" : "bg-slate-300"
      )} />
      
      <div className={cn(
        "relative flex flex-col h-full bg-white rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden",
        !inquiry.read ? "border-green-200" : "border-slate-200"
      )}>
        
        {/* Clickable Card Body */}
        <div 
          onClick={() => onView(inquiry)}
          className="flex-1 p-5 cursor-pointer hover:bg-slate-50/40 transition-colors duration-200 flex flex-col"
          title="Click to view full inquiry details"
        >
          {/* Unread indicator dot */}
          {!inquiry.read && (
            <span className="absolute top-4 right-4 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          )}

          {/* Header section */}
          <div className="flex items-start gap-4 mb-5 pr-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-lg shrink-0 shadow-sm">
              {getInitials(inquiry.name)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-slate-900 truncate text-lg">{inquiry.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                  getStatusColor(inquiry.status)
                )}>
                  {getStatusIcon(inquiry.status)}
                  {inquiry.status}
                </span>
                {inquiry.attachmentUrl && (
                  <span className="inline-flex items-center text-green-500 bg-green-50 px-1 py-0.5 rounded text-[10px] font-bold" title={`Has attachment: ${inquiry.attachmentName}`}>
                    <Paperclip className="w-3 h-3 mr-0.5 shrink-0" />
                    Doc
                  </span>
                )}
                <span className="text-xs font-medium text-slate-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDateTime(inquiry.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Message Preview */}
          <div className="mb-5 flex-1">
            <h5 className="text-sm font-bold text-slate-900 mb-2 truncate flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              {inquiry.subject}
            </h5>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-sm text-slate-600 line-clamp-3 leading-relaxed relative group-hover:bg-green-50/50 transition-colors duration-300">
              {inquiry.message}
              {/* Fade out long text */}
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-50 group-hover:from-green-50/50 to-transparent" />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-600 truncate" title={inquiry.email}>
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-medium">{inquiry.email}</span>
            </div>
            {inquiry.phone && (
              <div className="flex items-center gap-2 text-xs text-slate-600 truncate">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate font-medium">{inquiry.phone}</span>
              </div>
            )}
            {(inquiry.businessName || inquiry.companyName) && (
              <div className="flex items-center gap-2 text-xs text-slate-600 truncate col-span-2">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate font-medium text-slate-900">{inquiry.businessName || inquiry.companyName}</span>
              </div>
            )}
            {(inquiry.location || inquiry.city) && (
              <div className="flex items-center gap-2 text-xs text-slate-600 truncate col-span-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{inquiry.location || inquiry.city}</span>
              </div>
            )}
          </div>

          {/* Product Interest Box */}
          {inquiry.products && inquiry.products.length > 0 ? (
            <div className="p-3 rounded-xl bg-green-50 border border-green-100 flex items-center justify-between group/product cursor-default" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 bg-green-100 rounded-lg shrink-0">
                  <ClipboardList className="w-4 h-4 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-green-600/80 mb-0.5">B2B Bulk RFQ</p>
                  <p className="text-sm font-bold text-green-900 truncate">{inquiry.products.length} industrial items</p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-600/80 block">Est. Value</span>
                <span className="text-sm font-extrabold text-green-955">₹{(inquiry.totalEstimatedValue || inquiry.products.reduce((sum, p) => sum + ((p.unitPrice || 0) * p.quantity), 0)).toFixed(0)}</span>
              </div>
            </div>
          ) : inquiry.productName ? (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between group/product cursor-default" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 bg-emerald-100 rounded-lg shrink-0">
                  <Package className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/80 mb-0.5">Interested In</p>
                  <p className="text-sm font-bold text-emerald-900 truncate">{inquiry.productName}</p>
                </div>
              </div>
              {inquiry.selectedSize && (
                <div className="shrink-0 text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/80 block">Size</span>
                  <span className="text-sm font-bold text-emerald-900">{inquiry.selectedSize}</span>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Action Footer */}
        <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <Select
            value={inquiry.status}
            onValueChange={(value) => onStatusChange(inquiry._id, value as Inquiry['status'])}
          >
            <SelectTrigger className="h-9 flex-1 bg-white border-slate-200 text-xs font-semibold focus:ring-green-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INQUIRY_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value} className="text-xs font-medium">
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1.5 shrink-0">
            {!inquiry.read && (
              <Button size="sm" variant="outline" onClick={() => onMarkAsRead(inquiry._id)} className="h-9 px-3 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 bg-white" title="Mark as Read">
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            )}
            
            <Button size="sm" variant="default" onClick={() => onReply(inquiry)} className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-semibold">
              <Mail className="w-4 h-4 mr-2" />
              Reply
            </Button>
            
            <Button size="sm" variant="outline" onClick={() => onDelete(inquiry)} className="h-9 w-9 p-0 border-slate-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
