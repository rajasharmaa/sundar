// pages/PrivacyPolicy.tsx
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Mail, Phone, User, FileText, Check } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import ScrollReveal from '@/components/ScrollReveal';

const PrivacyPolicy = () => {
  const lastUpdated = 'January 1, 2024';

  const sections = [
    {
      title: 'Information We Collect',
      icon: User,
      points: [
        'Personal Information: Name, email address, phone number, company details',
        'Business Information: Industry type, purchase history, delivery addresses',
        'Usage Data: Website interactions, product views, search queries',
        'Payment Information: Transaction details (processed securely through payment gateways)',
        'Communication Data: Inquiries, support requests, feedback'
      ]
    },
    {
      title: 'How We Use Your Information',
      icon: Shield,
      points: [
        'Process and fulfill your orders',
        'Provide customer support and technical assistance',
        'Send order confirmations and shipping updates',
        'Improve our products and services',
        'Send marketing communications (with your consent)',
        'Comply with legal obligations'
      ]
    },
    {
      title: 'Data Security',
      icon: Lock,
      points: [
        'Encryption of sensitive data during transmission',
        'Secure storage on protected servers',
        'Regular security audits and updates',
        'Limited access to authorized personnel only',
        'Compliance with industry security standards'
      ]
    },
    {
      title: 'Your Rights',
      icon: Check,
      points: [
        'Access your personal data',
        'Correct inaccurate information',
        'Request deletion of your data',
        'Opt-out of marketing communications',
        'Data portability rights',
        'Withdraw consent at any time'
      ]
    },
    {
      title: 'Contact Information',
      icon: Mail,
      points: [
        'Email: privacy@damodartraders.com',
        'Phone: +91 98765 43210',
        'Address: 1st floor, 37 Ellora plaza, 3, Maharani Rd, Indore, MP 452007',
        'Data Protection Officer: dpo@damodartraders.com'
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Privacy Policy - Damodar Traders | Data Protection</title>
        <meta
          name="description"
          content="Damodar Traders' privacy policy. Learn how we collect, use, and protect your personal and business information."
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
            <Lock className="w-4 h-4" />
            Data Protection
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Privacy <span className="text-blue-600">Policy</span>
          </h1>

          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how Damodar Traders collects,
            uses, and protects your information.
          </p>

          <div className="mt-6 text-sm text-gray-500">
            Last Updated: {lastUpdated}
          </div>
        </motion.div>

        {/* Introduction */}
        <ScrollReveal distance={30}>
           <div className="bg-gradient-to-br from-blue-50 to-white rounded-[2rem] p-8 mb-8 border border-blue-100 shadow-sm">
             <div className="flex items-start gap-4">
               <div className="p-3 bg-blue-100 rounded-lg">
                 <FileText className="w-6 h-6 text-blue-600" />
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
                 <p className="text-gray-700 leading-relaxed">
                   At Damodar Traders, we are committed to protecting your privacy and ensuring
                   the security of your personal and business information. This Privacy Policy
                   outlines our practices regarding the collection, use, and disclosure of
                   information we receive through our website and services.
                 </p>
               </div>
             </div>
           </div>
        </ScrollReveal>

        {/* Policy Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <ScrollReveal key={section.title} delay={index * 0.05} distance={20}>
                <div className="bg-white rounded-[2rem] shadow-lg border border-gray-200 overflow-hidden group hover:border-blue-600 transition-colors duration-500">
                  <div className="p-6 md:p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`p-3 rounded-lg transition-colors duration-500 ${section.title === 'Contact Information' ? 'bg-blue-100 group-hover:bg-blue-600' : 'bg-gray-100 group-hover:bg-blue-50'}`}>
                        <Icon className={`w-6 h-6 transition-colors duration-500 ${section.title === 'Contact Information' ? 'text-blue-600 group-hover:text-white' : 'text-gray-700 group-hover:text-blue-600'}`} />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900">{section.title}</h3>
                      </div>
                    </div>

                    <ul className="space-y-3">
                      {section.points.map((point, pointIndex) => (
                        <li key={pointIndex} className="flex items-start gap-3">
                          <div className="mt-1 flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform"></div>
                          </div>
                          <span className="text-gray-700 font-medium">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Additional Information */}
        <ScrollReveal delay={0.2} distance={40}>
           <div className="mt-12 bg-gradient-to-br from-gray-50 to-white rounded-[2rem] p-8 border border-gray-200 shadow-sm">
             <h3 className="text-2xl font-bold text-gray-900 mb-6">Additional Information</h3>
   
             <div className="grid md:grid-cols-2 gap-8">
               <div>
                 <h4 className="font-bold text-gray-800 mb-3">Cookies & Tracking</h4>
                 <p className="text-gray-700 mb-4">
                   We use cookies and similar tracking technologies to enhance your browsing
                   experience, analyze website traffic, and understand where our visitors come from.
                 </p>
                 <ul className="space-y-2 text-gray-700 font-medium">
                   <li className="flex items-center gap-2">
                     <Check className="w-4 h-4 text-green-500" />
                     Essential cookies for website functionality
                   </li>
                   <li className="flex items-center gap-2">
                     <Check className="w-4 h-4 text-green-500" />
                     Analytics cookies for improving our services
                   </li>
                   <li className="flex items-center gap-2">
                     <Check className="w-4 h-4 text-green-500" />
                     Marketing cookies (opt-in required)
                   </li>
                 </ul>
               </div>
   
               <div>
                 <h4 className="font-bold text-gray-800 mb-3">Third-Party Services</h4>
                 <p className="text-gray-700 mb-4">
                   We may share information with trusted third-party services for:
                 </p>
                 <ul className="space-y-2 text-gray-700 font-medium">
                   <li className="flex items-center gap-2">
                     <Eye className="w-4 h-4 text-blue-500" />
                     Payment processing and invoicing
                   </li>
                   <li className="flex items-center gap-2">
                     <Eye className="w-4 h-4 text-blue-500" />
                     Shipping and delivery services
                   </li>
                   <li className="flex items-center gap-2">
                     <Eye className="w-4 h-4 text-blue-500" />
                     Customer support platforms
                   </li>
                   <li className="flex items-center gap-2">
                     <Eye className="w-4 h-4 text-blue-500" />
                     Analytics and marketing tools
                   </li>
                 </ul>
               </div>
             </div>
           </div>
        </ScrollReveal>

        {/* Policy Updates */}
        <ScrollReveal delay={0.3} distance={40}>
           <div className="mt-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2rem] p-8 border border-amber-200">
             <div className="flex items-start gap-4">
               <div className="p-3 bg-amber-100 rounded-lg">
                 <Eye className="w-6 h-6 text-amber-600" />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-gray-900 mb-3">Policy Updates</h3>
                 <p className="text-gray-700 mb-4 font-medium">
                   We may update this Privacy Policy from time to time. We will notify you of any
                   changes by posting the new Privacy Policy on this page and updating the "Last Updated"
                   date.
                 </p>
                 <p className="text-gray-700 font-medium">
                   You are advised to review this Privacy Policy periodically for any changes.
                   Changes to this Privacy Policy are effective when they are posted on this page.
                 </p>
               </div>
             </div>
           </div>
        </ScrollReveal>

        {/* Consent Section */}
        <ScrollReveal delay={0.4} distance={40}>
           <div className="mt-12 text-center">
             <p className="text-gray-700 text-lg mb-6 font-bold">
               By using our website and services, you consent to our Privacy Policy and agree to its terms.
             </p>
   
             <div className="flex flex-wrap justify-center gap-4">
               <a
                 href="mailto:privacy@damodartraders.com"
                 className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
               >
                 <Mail className="w-5 h-5" />
                 Contact Privacy Team
               </a>
               <a
                 href="/contact"
                 className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-gray-200 text-gray-800 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all shadow-lg"
               >
                 <Phone className="w-5 h-5" />
                 General Contact
               </a>
             </div>
           </div>
        </ScrollReveal>
      </main>

      <Footer />
    </>
  );
};

export default PrivacyPolicy;