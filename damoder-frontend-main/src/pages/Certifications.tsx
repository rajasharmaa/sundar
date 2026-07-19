import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Award, ShieldCheck, CheckCircle2, Download, ExternalLink, FileText, BadgeCheck, Globe, Star } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import ScrollReveal from '@/components/ScrollReveal';

const Certifications = () => {
  const certifications = [
    {
      title: 'ISO 9001:2015',
      organization: 'International Organization for Standardization',
      description: 'Quality Management Systems certification ensuring consistent product quality and customer satisfaction.',
      issued: '2022',
      expiry: '2025',
      id: 'QMS/9001/2022/104',
      icon: ShieldCheck,
      color: 'bg-blue-600'
    },
    {
      title: 'BIS Certification',
      organization: 'Bureau of Indian Standards',
      description: 'Compliance with Indian quality standards for manufacturing industrial pipe fittings and valves.',
      issued: '2023',
      expiry: '2026',
      id: 'BIS/IND/452007/22',
      icon: BadgeCheck,
      color: 'bg-emerald-600'
    },
    {
      title: 'NSIC Registration',
      organization: 'National Small Industries Corporation',
      description: 'Registered as a quality-compliant small-scale industrial unit for government tenders and projects.',
      issued: '2021',
      expiry: '2024',
      id: 'NSIC/SPR/2021/88',
      icon: Award,
      color: 'bg-amber-600'
    },
    {
      title: 'MSME Certified',
      organization: 'Ministry of MSME, Govt. of India',
      description: 'Recognized industrial unit under the Micro, Small and Medium Enterprises development act.',
      issued: '2011',
      expiry: 'Lifetime',
      id: 'UDYAM-MP-23-0001234',
      icon: CheckCircle2,
      color: 'bg-purple-600'
    }
  ];

  const standards = [
    'ASTM A105 / A105M',
    'ANSI B16.5 / B16.9',
    'DIN 2527 / 2573',
    'BS 10 Table D/E/F',
    'JIS B2220',
    'IS 1239 / 3589'
  ];

  return (
    <>
      <Helmet>
        <title>Certifications - Damodar Traders | Quality Assurance & Standards</title>
        <meta name="description" content="Explore Damodar Traders' quality certifications including ISO 9001:2015, BIS, and MSME. Our commitment to international industrial standards." />
      </Helmet>

      <IndustrialBackground />
      <Navbar />

      <main className="relative z-10 pt-24 pb-20 overflow-hidden">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-xs font-black uppercase tracking-widest mb-6"
          >
            <ShieldCheck size={14} />
            <span>Excellence Certified</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-black text-gray-900 leading-none tracking-tighter uppercase mb-8"
          >
            QUALITY <span className="text-blue-600">ASSURANCE</span> <br /> & STANDARDS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 font-medium max-w-3xl mx-auto leading-relaxed"
          >
            Our commitment to quality is backed by international certifications and rigorous adherence
            to global industrial standards.
          </motion.p>
        </section>

        {/* Certifications Grid */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="grid md:grid-cols-2 gap-8">
            {certifications.map((cert, i) => (
              <ScrollReveal key={cert.title} delay={i * 0.1} distance={30}>
                <div className="group relative bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 h-full">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className={`w-20 h-20 ${cert.color} rounded-3xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-500`}>
                      <cert.icon size={40} />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{cert.title}</h3>
                        <div className="flex gap-2">
                          <button className="p-2 bg-gray-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors">
                            <Download size={18} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-black text-blue-600 uppercase tracking-widest">{cert.organization}</p>
                      <p className="text-gray-600 font-medium leading-relaxed">{cert.description}</p>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Certificate ID</p>
                          <p className="text-sm font-bold text-gray-900">{cert.id}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Validity</p>
                          <p className="text-sm font-bold text-gray-900">{cert.issued} - {cert.expiry}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Technical Standards */}
        <ScrollReveal distance={60}>
          <section className="bg-gray-900 py-32 rounded-[4rem] mx-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
            <div className="relative z-10 max-w-7xl mx-auto px-10">
              <div className="flex flex-col lg:flex-row gap-20 items-center">
                <div className="lg:w-1/2">
                  <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-none tracking-tighter uppercase">
                    GLOBAL <span className="text-blue-500">TECHNICAL</span> <br /> COMPLIANCE
                  </h2>
                  <p className="text-xl text-gray-400 font-medium mb-12">
                    We strictly adhere to international manufacturing and dimensional standards to ensure
                    flawless integration into your industrial systems.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {standards.map((std, i) => (
                      <div key={std} className="flex items-center gap-3 text-white/80 font-bold group">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                          <FileText size={14} />
                        </div>
                        <span>{std}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:w-1/2">
                  <div className="relative p-10 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl">
                    <div className="space-y-8">
                      <div className="flex gap-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                          <Globe size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-white uppercase tracking-tighter">Global Export Quality</h4>
                          <p className="text-gray-400 text-sm font-medium">Standardized for international markets across USA, Europe, and Middle East.</p>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                          <Star size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-white uppercase tracking-tighter">Third-Party Inspection</h4>
                          <p className="text-gray-400 text-sm font-medium">Equipped for TPI by EIL, RITES, Lloyd's, and other major agencies.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal delay={0.2}>
          <section className="max-w-4xl mx-auto px-6 text-center py-32">
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-8">NEED COPIES OF OUR CERTIFICATES?</h2>
            <p className="text-gray-600 font-medium mb-10">Download our complete quality dossier for your vendor registration process.</p>
            <button className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 uppercase tracking-widest text-xs flex items-center gap-3 mx-auto">
              <Download size={18} />
              <span>Download Quality Pack</span>
            </button>
          </section>
        </ScrollReveal>
      </main>

      <Footer />
    </>
  );
};

export default Certifications;
