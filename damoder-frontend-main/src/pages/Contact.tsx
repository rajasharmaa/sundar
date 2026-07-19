import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Phone, CheckCircle2, Building2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import ScrollReveal from '@/components/ScrollReveal';
import { SEO } from '@/components/SEO';
import {
  ContactHero,
  ContactForm,
  FAQSection,
  ContactSidebar,
  SuccessModal,
  MapSection
} from '@/components/contact';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import BannerCarousel from '@/components/BannerCarousel';

const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '+919993304543';
const CONTACT_PHONE_1 = import.meta.env.VITE_SALES_PHONE || '+91 99933 04543';

export function Contact() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const { settings } = useSiteSettings();

  // 🌐 Dynamic domain schemas to avoid hardcoding staging/prod domains (Issue 13)
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://damodartraders.com';

  const jsonLdSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${currentOrigin}/#organization`,
      "name": "Damodar Traders",
      "url": currentOrigin,
      "logo": `${currentOrigin}/logo.png`,
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": CONTACT_PHONE_1,
        "contactType": "sales",
        "areaServed": "IN",
        "availableLanguage": ["en", "hi"]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `${currentOrigin}/#localbusiness`,
      "name": "Damodar Traders",
      "image": `${currentOrigin}/logo.png`,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "37 Ellora Plaza, Maharani Road",
        "addressLocality": "Indore",
        "addressRegion": "MP",
        "postalCode": "452007",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "22.717462",
        "longitude": "75.856994"
      },
      "telephone": CONTACT_PHONE_1,
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        "opens": "09:00",
        "closes": "19:00"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "@id": `${currentOrigin}/contact/#webpage`,
      "url": `${currentOrigin}/contact`,
      "name": "Industrial Sourcing Desk | Contact Damodar Traders"
    }
  ];

  const handleWhatsAppRedirect = () => {
    const dynamicPhone = WHATSAPP_PHONE.replace(/[+\s]/g, '');
    const defaultMsg = encodeURIComponent("Hello Damodar Traders, I would like to submit a product query list.");
    window.open(`https://wa.me/${dynamicPhone}?text=${defaultMsg}`, '_blank');
  };

  const handleFormSuccess = (ticketId: string) => {
    setTicketNumber(ticketId);
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 🚀 Dynamic structured schemas inside <Helmet> (Issue 14) */}
      <SEO
        title="Industrial Sourcing Desk & Contact"
        description="CI Pipe Fittings, GI Fittings, Valves, Flanges, Industrial Products Supplier in Indore MP. Connect with Damodar Traders for customized commercial sizing and quote reviews."
        noIndex={false}
        jsonLd={jsonLdSchemas}
      />

      <IndustrialBackground />
      <Navbar />

      <main className="pt-20 pb-12 lg:pt-24 lg:pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <ContactHero />

          {/* Dynamic Banners - Contact Page Placement */}
          {settings?.banners && settings.banners.filter(b => b.isActive && b.image && b.placement === 'contact_page').length > 0 && (
            <div className="mb-8">
              <BannerCarousel banners={settings.banners.filter(b => b.placement === 'contact_page')} />
            </div>
          )}

          {/* Sourcing Flow Description */}
          <ScrollReveal>
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xl mb-8">
              <div className="max-w-2xl mb-6">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mb-0.5">Process Flow</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Our Sourcing Process</h2>
                <p className="text-slate-500 text-xs font-semibold mt-0.5">How we process your technical specifications from submission to logistics dispatch.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {[
                  { step: "01", title: "Submit Details", desc: "Fill in custom sizes, quantities, and material list specs." },
                  { step: "02", title: "Technical Review", desc: "Our desk reviews pressure, standards & dimensions." },
                  { step: "03", title: "Get Price Quote", desc: "We coordinate with factories to offer bulk rates." },
                  { step: "04", title: "Secure Dispatch", desc: "MTC certified fittings shipped within 3-7 business days." }
                ].map((proc, i) => (
                  <div key={i} className="relative group p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-300">
                    <span className="absolute top-2 right-2 text-2xl font-black text-blue-500/10 group-hover:text-blue-500/25 transition-colors">{proc.step}</span>
                    <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-wider mb-1 mt-2">{proc.title}</h3>
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">{proc.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Form & Sidebar Layout Grid */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <ScrollReveal direction="right" distance={40}>
                <ContactForm onSuccess={handleFormSuccess} />
              </ScrollReveal>
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <ContactSidebar />
            </div>
          </div>

          {/* Showroom & Logistics Hub statistics */}
          <ScrollReveal delay={0.1}>
            <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 overflow-hidden relative shadow-2xl my-8 border border-slate-850">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />
              <div className="grid md:grid-cols-2 gap-6 items-center relative z-10">
                <div className="space-y-4">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block">Flagship Showroom</span>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Visit Indore's Sourcing Showroom</h2>
                  <p className="text-slate-350 text-xs font-semibold leading-relaxed">
                    Explore our fully stocked distribution center at Ellora Plaza, Indore. Inspect sample GI fittings, CI pipes, heavy-duty valves, and flanges in person.
                  </p>
                  <div className="flex flex-col gap-2 font-bold text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>On-site Material Inspection desk</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>Instant corporate quote estimation compiled on site</span>
                    </div>
                  </div>
                </div>
                {/* Visual Representation Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="h-36 rounded-xl bg-gradient-to-br from-blue-600/30 to-cyan-500/20 flex flex-col items-center justify-center border border-white/5 relative overflow-hidden group">
                    <Building2 size={48} className="text-blue-400 opacity-60 group-hover:scale-110 transition-transform duration-500" />
                    <span className="absolute bottom-2.5 left-2.5 text-[8px] font-black uppercase tracking-widest text-white bg-slate-950/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                      Indore HQ & Distribution Center
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                      <span className="text-sm font-black text-blue-400">Ready Inventory</span>
                      <p className="text-[8px] text-slate-455 uppercase font-black tracking-widest mt-0.5">Warehouse Status</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                      <span className="text-sm font-black text-blue-400">GI / CI Fittings</span>
                      <p className="text-[8px] text-slate-455 uppercase font-black tracking-widest mt-0.5">Valves & Accessories</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <FAQSection />

          <MapSection />

        </div>
      </main>

      <Footer />

      {/* Floating Action Widget with z-index separation and layout safeguards (Issue 10 / 21) */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-[999] flex flex-col gap-2.5">
        <motion.button
          onClick={handleWhatsAppRedirect}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="w-11 h-11 sm:w-13 sm:h-13 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-emerald-750 transition-colors border border-emerald-500/20 cursor-pointer"
          title="WhatsApp Inquiry"
        >
          <MessageCircle size={22} className="sm:w-6 sm:h-6" />
        </motion.button>
        <motion.a
          href={`tel:${CONTACT_PHONE_1.replace(/\s/g, '')}`}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="w-11 h-11 sm:w-13 sm:h-13 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-blue-700 transition-colors border border-blue-500/20 cursor-pointer flex-shrink-0"
          title="Call Sales Hotline"
        >
          <Phone size={20} className="sm:w-5 sm:h-5" />
        </motion.a>
      </div>

      <SuccessModal
        show={showSuccess}
        ticketNumber={ticketNumber}
        onClose={() => setShowSuccess(false)}
        onWhatsAppRedirect={handleWhatsAppRedirect}
      />
    </div>
  );
}

export default Contact;