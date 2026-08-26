import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Globe, Plane, ShieldCheck, MapPin, Package, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import ScrollReveal from '@/components/ScrollReveal';

const Exports = () => {
  const regions = [
    { name: 'Middle East', desc: 'Serving major industrial hubs in UAE, Saudi Arabia, and Oman with heavy-duty FIBC bags.' },
    { name: 'Africa', desc: 'Supplying durable agricultural packaging to Kenya, Nigeria, and South Africa.' },
    { name: 'Europe', desc: 'Exporting premium BOPP bags for retail applications adhering to strict EU standards.' },
    { name: 'Asia Pacific', desc: 'Delivering custom packaging solutions to Southeast Asian manufacturing zones.' }
  ];

  return (
    <>
      <Helmet>
        <title>Global Exports | Sundar Corporation</title>
        <meta name="description" content="Sundar Corporation's international presence and export division, delivering premium packaging worldwide." />
      </Helmet>
      
      <IndustrialBackground />
      <Navbar />

      <main className="relative z-10 pt-24 pb-20">
        <section className="max-w-7xl mx-auto px-6 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-6 text-blue-600 font-black uppercase tracking-widest text-sm">
              <Globe size={20} />
              <span>International Division</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-gray-900 leading-none tracking-tighter uppercase mb-6">
              GLOBAL <span className="text-blue-600">REACH</span>
            </h1>
            <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
              Exporting high-performance industrial packaging solutions to over 20 countries worldwide.
            </p>
          </motion.div>

          <ScrollReveal>
            <div className="bg-gray-900 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden mb-20">
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600 rounded-full blur-[120px] opacity-20 -mr-64 -mt-64" />
              
              <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-8">
                    Export Excellence
                  </h2>
                  <p className="text-gray-300 text-lg font-medium leading-relaxed mb-8">
                    Our dedicated export division ensures seamless international trade. From specialized packaging conforming to international standards to efficient logistics management, we handle the complexities of global supply chains.
                  </p>
                  <ul className="space-y-4 mb-10">
                    {[
                      'Compliance with international quality standards',
                      'Customized packaging for sea freight',
                      'Dedicated account managers for international clients',
                      'Timely dispatch and tracking'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-gray-200 font-medium">
                        <ShieldCheck className="text-blue-400" size={20} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-colors inline-flex items-center gap-3">
                    Contact Export Division <ArrowRight size={18} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {regions.map((region, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                      <MapPin className="text-blue-400 mb-4" size={24} />
                      <h3 className="text-xl font-black uppercase tracking-tight mb-2">{region.name}</h3>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed">{region.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
          
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Exports;
