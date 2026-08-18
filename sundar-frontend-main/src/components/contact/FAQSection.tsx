import { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';

// Static FAQ Array (Issue 17: Moved outside component to prevent re-creation)
const FAQS = [
  {
    q: "Can we request custom printing and specific bag dimensions?",
    a: "Yes, we manufacture bags exactly according to your required specifications. We offer up to 8-color high-speed Flexo printing on PP/HDPE woven bags, and full photographic quality printing on BOPP laminated bags."
  },
  {
    q: "Is there a minimum order quantity (MOQ) for custom manufactured bags?",
    a: "Our standard MOQ for custom printed PP Woven bags is typically 10,000 units to ensure manufacturing efficiency. For unprinted (plain) bags or specific BOPP requirements, please request a quote as MOQs may vary."
  },
  {
    q: "What is the typical lead time for custom manufacturing and printing?",
    a: "For new custom designs, the lead time is typically 15-20 business days, which includes the time required for cylinder engraving and initial proofing. Repeat orders are much faster and are usually processed within 10-12 days."
  },
  {
    q: "Do you supply Material Test Reports or Quality verification?",
    a: "Absolutely. Quality is our priority. All our HDPE/PP woven bags and industrial packaging products undergo rigorous testing for tensile strength, GSM accuracy, and drop testing. We can provide standard quality check reports with your dispatch."
  },
  {
    q: "How are corporate GST invoices and commercial billing processed?",
    a: "We are a fully compliant corporate business entity. We provide formal GSTIN-enabled tax invoices for all bulk manufacturing dispatches. Simply provide your organization's GST details during the quote process."
  }
] as const;

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ScrollReveal>
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xl mb-8">
        <div className="max-w-2xl mb-6">
          <span className="text-[9px] font-black text-industrial uppercase tracking-widest block mb-0.5">Knowledge Hub</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Manufacturing FAQs</h2>
          <p className="text-slate-500 text-xs font-semibold mt-0.5">Common answers about custom printing, MOQs, and production timelines.</p>
        </div>

        <div className="space-y-3 max-w-4xl">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50/50 hover:bg-slate-50 transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex justify-between items-center px-4 py-3.5 text-left font-bold text-slate-800 text-xs focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle size={15} className="text-industrial flex-shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={15}
                    className={`text-slate-455 transition-transform duration-300 ${isOpen ? 'rotate-180 text-industrial' : ''}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="px-4 pb-4 pt-1 text-[11px] text-slate-550 leading-relaxed font-semibold border-t border-slate-150 bg-white">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollReveal>
  );
}

export default FAQSection;
