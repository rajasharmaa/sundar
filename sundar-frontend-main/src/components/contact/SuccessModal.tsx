import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, MessageCircle } from 'lucide-react';

interface SuccessModalProps {
  show: boolean;
  ticketNumber: string;
  onClose: () => void;
  onWhatsAppRedirect: () => void;
}

export function SuccessModal({ show, ticketNumber, onClose, onWhatsAppRedirect }: SuccessModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative bg-white rounded-2xl p-6 md:p-10 max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar text-center shadow-2xl border border-slate-100"
          >
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
              <CheckCircle2 size={40} />
            </div>

            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Quote Request Queued</h3>

            {/* Inquiry Ticket Display */}
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 mb-6">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Your Request Ticket</p>
              <p className="text-base font-black text-green-600 mt-1">{ticketNumber}</p>
              <p className="text-[9px] text-slate-500 font-bold mt-1">Please quote this ID for future updates</p>
            </div>

            <p className="text-slate-500 text-sm font-semibold mb-6 leading-relaxed">
              Your technical specifications have been received. A Sales Executive will contact you within 24 business hours.
            </p>

            {/* Direct WhatsApp Callout */}
            <div className="mb-8 pt-4 border-t border-slate-100 flex flex-col gap-2">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Prefer Immediate Chat?
              </p>
              <button
                type="button"
                onClick={onWhatsAppRedirect}
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle size={15} />
                Send Sizing on WhatsApp
              </button>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-green-600 transition-all shadow-xl"
            >
              Confirm & Return
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default SuccessModal;

