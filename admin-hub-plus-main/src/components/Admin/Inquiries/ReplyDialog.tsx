import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import type { Inquiry } from '@/types';
import { Mail, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReplyDialogProps {
  inquiry: Inquiry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendReply: (data: { to: string; subject: string; message: string }) => Promise<void>;
}

export function ReplyDialog({ inquiry, open, onOpenChange, onSendReply }: ReplyDialogProps) {
  const [replySubject, setReplySubject] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Pre-fill subject and message when inquiry changes
  useEffect(() => {
    if (inquiry && open) {
      setReplySubject(`Re: ${inquiry.subject}`);
      setReplyMessage(`Dear ${inquiry.name},\n\nThank you for your inquiry.\n\n---\nOriginal Message:\n${inquiry.message}\n\nBest Regards,\nDamodar Traders`);
    }
  }, [inquiry, open]);

  const handleSend = async () => {
    if (!inquiry || !replySubject.trim() || !replyMessage.trim()) {
      toast.error('Please fill in subject and message');
      return;
    }

    setIsSending(true);
    try {
      await onSendReply({
        to: inquiry.email,
        subject: replySubject,
        message: replyMessage
      });
      
      toast.success('Reply sent successfully!');
      handleClose();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Failed to send reply. Please try again.';
      toast.error(errorMessage);
      console.error('Reply error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setReplySubject('');
    setReplyMessage('');
    onOpenChange(false);
  };

  if (!inquiry) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Reply to {inquiry.name}
          </DialogTitle>
          <DialogDescription>
            Send a response to the customer's inquiry
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* To Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            <Input
              value={inquiry.email}
              readOnly
              className="bg-muted cursor-not-allowed"
            />
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input
              value={replySubject}
              onChange={(e) => setReplySubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply here..."
              rows={10}
              className="resize-none"
            />
          </div>

          {/* Original Message Preview */}
          <div className="border-t pt-4 mt-4">
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground mb-2">
                View Original Inquiry
              </summary>
              <div className="bg-muted p-3 rounded-md">
                <p className="font-medium mb-1">{inquiry.subject}</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{inquiry.message}</p>
              </div>
            </details>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={isSending || !replySubject.trim() || !replyMessage.trim()}
            className="gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Reply
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
