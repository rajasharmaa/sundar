// pages/TermsConditions.tsx
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FileText, Scale, Shield, AlertTriangle, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import ScrollReveal from '@/components/ScrollReveal';

const TermsConditions = () => {
  const effectiveDate = 'January 1, 2024';

  const sections = [
    {
      title: 'Acceptance of Terms',
      icon: CheckCircle,
      content: 'By accessing and using Damodar Traders website and services, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.',
      points: [
        'You must be at least 18 years old or have legal authority to enter into contracts',
        'You agree to provide accurate and complete information',
        'You are responsible for maintaining the confidentiality of your account'
      ]
    },
    {
      title: 'Product Information & Pricing',
      icon: Scale,
      content: 'We strive to provide accurate product information and pricing. However, errors may occur.',
      points: [
        'Prices are subject to change without notice',
        'Product availability may vary',
        'We reserve the right to correct pricing errors',
        'Quotations are valid for 30 days from issue date'
      ]
    },
    {
      title: 'Ordering & Payment',
      icon: BookOpen,
      content: 'All orders are subject to acceptance and availability.',
      points: [
        'Orders are confirmed upon receipt of payment',
        'Payment must be received before shipment',
        'Accepted payment methods: Bank Transfer, Credit Card, UPI',
        'Taxes and shipping charges are additional'
      ]
    },
    {
      title: 'Shipping & Delivery',
      icon: Shield,
      content: 'Delivery times are estimates and may vary based on location and product availability.',
      points: [
        'Standard delivery: 3-7 business days',
        'Express delivery available at additional cost',
        'Risk of loss passes to buyer upon delivery',
        'International shipping available upon request'
      ]
    },
    {
      title: 'Returns & Refunds',
      icon: AlertTriangle,
      content: 'We accept returns under specific conditions.',
      points: [
        'Returns must be initiated within 7 days of delivery',
        'Products must be unused and in original packaging',
        'Custom or special-order items cannot be returned',
        'Refunds processed within 14 business days'
      ]
    },
    {
      title: 'Warranty & Liability',
      icon: XCircle,
      content: 'Our products come with standard warranties as specified.',
      points: [
        'Standard warranty: 1 year from date of purchase',
        'Warranty covers manufacturing defects only',
        'Proper installation and maintenance required',
        'Liability limited to product replacement or refund'
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Terms & Conditions - Damodar Traders | Legal Agreement</title>
        <meta
          name="description"
          content="Terms and conditions for using Damodar Traders website and services. Read our legal agreement before making purchases."
        />
      </Helmet>

      <IndustrialBackground />
      <Navbar />

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-[100px] lg:pb-0">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            Legal Agreement
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms & <span className="text-blue-600">Conditions</span>
          </h1>

          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Please read these terms carefully before using our website or placing an order.
            These terms govern your use of Damodar Traders services.
          </p>

          <div className="mt-6 text-sm text-gray-500">
            Effective Date: {effectiveDate}
          </div>
        </motion.div>

        {/* Important Notice */}
        <ScrollReveal distance={30}>
           <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-[2rem] p-8 mb-8 border border-red-200 shadow-sm">
             <div className="flex items-start gap-4">
               <div className="p-3 bg-red-100 rounded-lg shadow-inner">
                 <AlertTriangle className="w-6 h-6 text-red-600" />
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase tracking-tighter">Important Notice</h2>
                 <p className="text-gray-700 leading-relaxed font-medium">
                   These Terms and Conditions constitute a legally binding agreement between you
                   and Damodar Traders. By accessing our website, placing an order, or using our
                   services, you acknowledge that you have read, understood, and agree to be bound
                   by these terms.
                 </p>
               </div>
             </div>
           </div>
        </ScrollReveal>

        {/* Terms Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <ScrollReveal key={section.title} delay={index * 0.05} distance={20}>
                <div className="bg-white rounded-[2rem] shadow-lg border border-gray-200 overflow-hidden group hover:border-blue-600 transition-all duration-500">
                  <div className="p-6 md:p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-4 bg-gray-100 rounded-xl group-hover:bg-blue-50 transition-colors">
                        <Icon className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 uppercase tracking-tighter">{section.title}</h3>
                        <p className="text-gray-600 mt-2 font-medium">{section.content}</p>
                      </div>
                    </div>

                    {section.points && (
                      <ul className="space-y-3 ml-14">
                        {section.points.map((point, pointIndex) => (
                          <li key={pointIndex} className="flex items-start gap-3">
                            <div className="mt-1 flex-shrink-0">
                              <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform"></div>
                            </div>
                            <span className="text-gray-700 font-medium">{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Additional Clauses */}
        <ScrollReveal delay={0.2} distance={40}>
           <div className="mt-12 bg-gradient-to-br from-gray-50 to-white rounded-[2rem] p-8 border border-gray-200 shadow-sm">
             <h3 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tighter">Additional Legal Clauses</h3>
   
             <div className="grid md:grid-cols-2 gap-10">
               <div className="p-6 bg-white rounded-2xl border border-gray-50">
                 <h4 className="font-black text-gray-800 mb-4 uppercase tracking-widest text-xs">Intellectual Property</h4>
                 <p className="text-gray-600 font-medium leading-relaxed">
                   All content on this website, including text, graphics, logos, and images,
                   is the property of Damodar Traders and protected by intellectual property laws.
                   You may not reproduce, distribute, or modify any content without our written permission.
                 </p>
               </div>
   
               <div className="p-6 bg-white rounded-2xl border border-gray-50">
                 <h4 className="font-black text-gray-800 mb-4 uppercase tracking-widest text-xs">Governing Law</h4>
                 <p className="text-gray-600 font-medium leading-relaxed">
                   These Terms shall be governed by and construed in accordance with the laws of India.
                   Any disputes arising from these Terms shall be subject to the exclusive jurisdiction
                   of the courts in Indore, Madhya Pradesh.
                 </p>
               </div>
   
               <div className="p-6 bg-white rounded-2xl border border-gray-50">
                 <h4 className="font-black text-gray-800 mb-4 uppercase tracking-widest text-xs">Force Majeure</h4>
                 <p className="text-gray-600 font-medium leading-relaxed">
                   We shall not be liable for any failure or delay in performance due to circumstances
                   beyond our reasonable control, including natural disasters, government actions,
                   or supply chain disruptions.
                 </p>
               </div>
   
               <div className="p-6 bg-white rounded-2xl border border-gray-50">
                 <h4 className="font-black text-gray-800 mb-4 uppercase tracking-widest text-xs">Amendments</h4>
                 <p className="text-gray-600 font-medium leading-relaxed">
                   We reserve the right to modify these Terms at any time. Changes will be effective
                   immediately upon posting on our website. Your continued use of our services
                   constitutes acceptance of the modified Terms.
                 </p>
               </div>
             </div>
           </div>
        </ScrollReveal>

        {/* Contact for Clarification */}
        <ScrollReveal delay={0.3} distance={40}>
           <div className="mt-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[3rem] p-12 text-center text-white shadow-2xl shadow-blue-600/20">
             <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">Need Clarification?</h3>
             <p className="text-blue-100 mb-10 max-w-2xl mx-auto font-medium">
               If you have any questions about these Terms & Conditions or need clarification
               on any points, please don't hesitate to contact our legal team.
             </p>
   
             <div className="flex flex-wrap justify-center gap-4">
               <a
                 href="mailto:legal@damodartraders.com"
                 className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 hover:text-white transition-all shadow-xl"
               >
                 <FileText className="w-5 h-5" />
                 Contact Legal Department
               </a>
               <a
                 href="/contact"
                 className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white border border-blue-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-400 transition-all shadow-lg"
               >
                 Customer Support
               </a>
             </div>
           </div>
        </ScrollReveal>

        {/* Acceptance Section */}
        <ScrollReveal delay={0.4} distance={20}>
           <div className="mt-12 text-center">
             <p className="text-gray-700 text-lg mb-6 font-bold">
               By using our website and services, you acknowledge that you have read,
               understood, and agree to be bound by these Terms & Conditions.
             </p>
   
             <div className="inline-flex items-center gap-3 px-6 py-2 bg-green-50 text-green-700 rounded-full text-xs font-black uppercase tracking-widest">
               <CheckCircle size={16} />
               <span>Last updated: {effectiveDate}</span>
             </div>
           </div>
        </ScrollReveal>
      </main>

      <Footer />
    </>
  );
};

export default TermsConditions;