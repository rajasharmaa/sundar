import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, MessageSquare, Phone, Mail, ArrowRight, Search, Plus, Minus } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import ScrollReveal from '@/components/ScrollReveal';

const FAQ = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = [
    { id: 'general', label: 'General Info' },
    { id: 'ordering', label: 'Ordering & Payment' },
    { id: 'shipping', label: 'Shipping & Delivery' },
    { id: 'technical', label: 'Technical Specs' }
  ];

  const faqs = {
    general: [
      {
        q: 'How long has Damodar Traders been in business?',
        a: "Damodar Traders was founded in 2011. Since then, we've grown into a leading industrial supplier in Central India, serving over 1500+ satisfied clients nationwide."
      },
      {
        q: 'Are your products ISO certified?',
        a: 'Yes, we are an ISO 9001:2015 certified company. Our products also comply with BIS and international standards like ASTM, ANSI, and DIN.'
      },
      {
        q: 'Do you provide test certificates for your products?',
        a: 'Absolutely. We provide Material Test Certificates (MTC) and Third-Party Inspection (TPI) reports for all our products upon request.'
      }
    ],
    ordering: [
      {
        q: 'What is the minimum order quantity (MOQ)?',
        a: 'MOQ varies by product. For standard items like pipes and fittings, we support both small and bulk orders. Please contact our sales team for specific item requirements.'
      },
      {
        q: 'Do you offer special pricing for bulk orders?',
        a: 'Yes, we have a multi-tier pricing structure for wholesale and industrial bulk orders. You can request a custom quote through our website or via WhatsApp.'
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept RTGS, NEFT, IMPS, and all major digital payment methods. For regular corporate clients, we also offer credit terms subject to credit verification.'
      }
    ],
    shipping: [
      {
        q: 'Do you deliver across India?',
        a: 'Yes, we have a robust logistics network that ensures pan-India delivery, including remote industrial sites.'
      },
      {
        q: 'What is the typical lead time for delivery?',
        a: 'For in-stock items, we offer same-day or next-day dispatch. Custom orders or non-stock items typically take 7-15 working days depending on the manufacturing schedule.'
      }
    ],
    technical: [
      {
        q: 'Can you provide custom-fabricated components?',
        a: 'Yes, we provide custom fabrication services for flanges, fittings, and specialized industrial components based on your technical drawings and specifications.'
      },
      {
        q: 'What pressure ratings do your valves support?',
        a: 'Our valves range from standard Class 150 up to high-pressure Class 2500, suitable for various industrial applications from HVAC to oil and gas.'
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>FAQs - Damodar Traders | Help & Support Center</title>
        <meta name="description" content="Find answers to common questions about industrial pipes, fittings, ordering, and shipping at Damodar Traders support center." />
      </Helmet>

      <IndustrialBackground />
      <Navbar />

      <main className="relative z-10 pt-24 pb-20">
        {/* Header Section */}
        <section className="max-w-7xl mx-auto px-6 mb-20">
           <div className="relative p-12 md:p-20 bg-gray-900 rounded-[3rem] overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
              <div className="relative z-10 max-w-2xl">
                 <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-blue-400 font-black uppercase tracking-widest text-xs mb-6"
                 >
                    <HelpCircle size={14} />
                    <span>Support Center</span>
                 </motion.div>
                 <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-7xl font-black text-white leading-none tracking-tighter uppercase mb-8"
                 >
                    FREQUENTLY ASKED <span className="text-blue-500">QUESTIONS</span>
                 </motion.h1>
                 
                 <div className="relative group max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                       type="text" 
                       placeholder="Search your question..."
                       className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                 </div>
              </div>
           </div>
        </section>

        {/* Content Section */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
           <div className="flex flex-col lg:flex-row gap-20">
              {/* Sidebar Tabs */}
              <div className="lg:w-1/4">
                 <ScrollReveal direction="right" distance={40}>
                    <div className="space-y-3">
                       {categories.map((cat) => (
                          <button
                             key={cat.id}
                             onClick={() => { setActiveTab(cat.id); setOpenIndex(0); }}
                             className={`w-full flex items-center justify-between p-5 rounded-2xl font-black uppercase tracking-tighter text-sm transition-all ${
                                activeTab === cat.id 
                                   ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-2' 
                                   : 'bg-white text-gray-500 hover:bg-gray-50'
                             }`}
                          >
                             <span>{cat.label}</span>
                             <ArrowRight size={16} className={activeTab === cat.id ? 'opacity-100' : 'opacity-0'} />
                          </button>
                       ))}
                    </div>
                 </ScrollReveal>
              </div>

              {/* Accordion List */}
              <div className="lg:w-3/4">
                 <div className="space-y-4">
                    {faqs[activeTab as keyof typeof faqs].map((faq, i) => (
                       <ScrollReveal key={faq.q} delay={i * 0.1} distance={20}>
                          <div
                             className={`bg-white rounded-[2rem] border transition-all duration-500 ${
                                openIndex === i ? 'border-blue-200 shadow-xl' : 'border-gray-100'
                             }`}
                          >
                             <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between p-8 text-left"
                             >
                                <span className={`text-xl font-black uppercase tracking-tighter transition-colors ${
                                   openIndex === i ? 'text-blue-600' : 'text-gray-900'
                                }`}>
                                   {faq.q}
                                </span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                   openIndex === i ? 'bg-blue-600 text-white rotate-180' : 'bg-gray-50 text-gray-400'
                                }`}>
                                   {openIndex === i ? <Minus size={18} /> : <Plus size={18} />}
                                </div>
                             </button>
                             
                             <AnimatePresence>
                                {openIndex === i && (
                                   <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                   >
                                      <div className="p-8 pt-0 text-gray-600 font-medium leading-relaxed text-lg">
                                         {faq.a}
                                      </div>
                                   </motion.div>
                                )}
                             </AnimatePresence>
                          </div>
                       </ScrollReveal>
                    ))}
                 </div>
              </div>
           </div>
        </section>

        {/* Contact Help Section */}
        <section className="max-w-7xl mx-auto px-6">
           <div className="grid md:grid-cols-3 gap-8">
              {[
                 { icon: MessageSquare, title: 'Chat on WhatsApp', info: 'Instant response within 1 hour', link: 'https://wa.me/919876543210' },
                 { icon: Phone, title: 'Call Our Experts', info: 'Available Mon-Sat, 9AM - 6PM', link: 'tel:+919876543210' },
                 { icon: Mail, title: 'Email Support', info: 'Response time: 24 hours', link: 'mailto:info@damodartraders.com' }
              ].map((item, i) => (
                 <ScrollReveal key={item.title} delay={i * 0.1} distance={30}>
                    <a 
                       href={item.link}
                       className="group bg-white p-10 rounded-[3rem] border border-gray-100 hover:border-blue-600 transition-all duration-500 hover:-translate-y-2 block h-full"
                    >
                       <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <item.icon size={28} />
                       </div>
                       <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900 mb-2">{item.title}</h3>
                       <p className="text-gray-500 font-medium">{item.info}</p>
                    </a>
                 </ScrollReveal>
              ))}
           </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default FAQ;
