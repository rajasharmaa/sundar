import { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';

// Static FAQ Array (Issue 17: Moved outside component to prevent re-creation)
const FAQS = [
  {
    q: "Can we request customized sizing and heavy-duty material grades for industrial lines?",
    a: "Yes, we coordinate directly with steel and casting mills to source customized sizing, wall thicknesses, and special pressure rating specifications. You can input these custom parameters directly inside the requirements details field."
  },
  {
    q: "Do you supply official Material Test Certificates (MTC) and ISO sheets with orders?",
    a: "Absolutely. All certified GI/CI fittings, industrial valves, and flanges are delivered with official manufacturer's Material Test Certificates (MTC), BIS certifications, and ISO 9001 quality check reports."
  },
  {
    q: "How are corporate/business GST invoices and commercial billing processed?",
    a: "We are a fully compliant corporate business entity. We provide formal GSTIN-enabled invoices for all industrial dispatches. Enter your organization's GST details in the Business Name field during submission."
  },
  {
    q: "What is your logistics range and average shipping timeline across Central India?",
    a: "We have regular distribution dispatches running across Madhya Pradesh, Gujarat, Maharashtra, and Rajasthan. Standard ready-stock items are shipped within 24 hours, and bulk dispatches arrive in 3-7 business days."
  },
  {
    q: "Is there a minimum order quantity (MOQ) requirement for Wholesale Pricing rates?",
    a: "Wholesale bulk pricing is active for standard factory pack bundles (typically MOQ of 50 units or standard pipe configurations). For mixed industrial material lists, our desk coordinates customized bulk discounts."
  }
] as const;

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ScrollReveal>
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xl mb-8">
        <div className="max-w-2xl mb-6">
          <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mb-0.5">Knowledge Hub</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Sourcing FAQs</h2>
          <p className="text-slate-500 text-xs font-semibold mt-0.5">Common answers about custom configurations, documentation, and industrial logistics.</p>
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
                    <HelpCircle size={15} className="text-blue-500 flex-shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={15}
                    className={`text-slate-455 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
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
