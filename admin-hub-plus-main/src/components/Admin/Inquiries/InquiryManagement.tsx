import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { inquiryService } from '@/services/inquiryService';
import { Inquiry, InquiryStatus } from '@/types';
import { INQUIRY_FILTERS } from '@/utils/constants';
import { InquiryCard } from './InquiryCard';
import { InquiryDetailDialog } from './InquiryDetailDialog';
import { ReplyDialog } from './ReplyDialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, Filter, X, Search, Calendar, Building2, MapPin, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

type FilterValue = 'all' | 'new' | 'pending' | 'completed' | 'unread';



export function InquiryManagement() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [inquiryToDelete, setInquiryToDelete] = useState<Inquiry | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedInquiryForReply, setSelectedInquiryForReply] = useState<Inquiry | null>(null);
  const [selectedInquiryForView, setSelectedInquiryForView] = useState<Inquiry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleView = (inquiry: Inquiry) => {
    setSelectedInquiryForView(inquiry);
    if (!inquiry.read) {
      // Mark as read automatically when opened
      inquiryService.markAsRead(inquiry._id)
        .then(() => {
          refetch(); // Refresh list to update read count/badge
        })
        .catch((err) => console.error(err));
    }
  };
  const [pageSize, setPageSize] = useState(20);
  const [isExporting, setIsExporting] = useState(false);
  const queryClient = useQueryClient();

  const { data: inquiriesData, isLoading, refetch } = useQuery<{ data: Inquiry[]; pagination: any }, Error>({
    queryKey: ['inquiries', currentPage, pageSize, activeFilter],
    queryFn: () => {
      const filters = {
        status: activeFilter !== 'unread' && activeFilter !== 'all' ? activeFilter : '',
        read: activeFilter === 'unread' ? false : undefined,
        page: currentPage,
        limit: pageSize
      };
      return inquiryService.getAll(filters);
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const inquiries: Inquiry[] = inquiriesData?.data || [];
  const pagination = inquiriesData?.pagination || { page: 1, limit: 20, total: 0, pages: 1 };

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InquiryStatus }) =>
      inquiryService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      toast.success('Status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => inquiryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Inquiry deleted');
      setInquiryToDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete inquiry');
    },
  });

  // No need for client-side filtering - backend handles it now

  const handleStatusChange = (id: string, status: InquiryStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleMarkAsRead = (id: string) => {
    // Update read flag first
    inquiryService.markAsRead(id)
      .then(() => {
        toast.success('Marked as read');
        refetch(); // Refresh the inquiries list
      })
      .catch((err) => {
        console.error('Error marking as read:', err);
        toast.error('Failed to mark as read');
      });
  };

  const handleDelete = (inquiry: Inquiry) => {
    setInquiryToDelete(inquiry);
  };

  const handleReply = (inquiry: Inquiry) => {
    setSelectedInquiryForReply(inquiry);
    setReplyDialogOpen(true);
  };

  const handleSendReply = async (data: { to: string; subject: string; message: string }) => {
    if (!selectedInquiryForReply) return;

    await inquiryService.sendReply(selectedInquiryForReply._id, {
      subject: data.subject,
      message: data.message,
      status: 'completed'
    });
    
    // Invalidate queries to refresh list
    queryClient.invalidateQueries({ queryKey: ['inquiries'] });
  };

  const confirmDelete = () => {
    if (inquiryToDelete) {
      deleteMutation.mutate(inquiryToDelete._id);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const csvBlob = await inquiryService.exportCsv(activeFilter);
      const url = window.URL.createObjectURL(csvBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export_${activeFilter}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Leads exported successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export leads');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Customer Inquiries</h2>
        <Button
          onClick={handleExportCsv}
          disabled={isExporting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export Leads (CSV)'}
        </Button>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center gap-3 mb-8 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-fit">
        {INQUIRY_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value as FilterValue)}
            className={cn(
              'px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 relative',
              activeFilter === filter.value 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            {filter.label}
            {filter.value === 'unread' && (
              <span className={cn(
                "ml-2 text-xs px-2 py-0.5 rounded-full font-bold",
                activeFilter === filter.value ? "bg-white/20 text-white" : "bg-green-100 text-green-700"
              )}>
                {inquiries.filter((i) => !i.read).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Inquiries Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <LoadingSpinner size="lg" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">No Leads Found</h3>
          <p className="text-sm font-medium text-slate-500 mt-2 max-w-sm mx-auto">
            {activeFilter === 'all'
              ? "You haven't received any customer inquiries yet. Check back later."
              : `You don't have any ${activeFilter === 'unread' ? 'unread' : activeFilter} inquiries at the moment.`}
          </p>
        </div>
      ) : (
        <>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
          >
            {inquiries.map((inquiry) => (
              <motion.div 
                key={inquiry._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                }}
              >
                <InquiryCard
                  inquiry={inquiry}
                  onStatusChange={handleStatusChange}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  onReply={handleReply}
                  onView={handleView}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-8 bg-white rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="pageSize" className="text-sm">Show:</Label>
              <Select value={pageSize.toString()} onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                Total: {pagination.total} inquiries
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              <span className="text-sm px-4">
                Page {currentPage} of {pagination.pages || 1}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                disabled={currentPage >= pagination.pages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Reply Dialog */}
      <ReplyDialog
        inquiry={selectedInquiryForReply}
        open={replyDialogOpen}
        onOpenChange={setReplyDialogOpen}
        onSendReply={handleSendReply}
      />

      {/* Inquiry Detail Dialog */}
      <InquiryDetailDialog
        inquiry={selectedInquiryForView}
        open={!!selectedInquiryForView}
        onOpenChange={(open) => {
          if (!open) setSelectedInquiryForView(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!inquiryToDelete} onOpenChange={() => setInquiryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inquiry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this inquiry from {inquiryToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
