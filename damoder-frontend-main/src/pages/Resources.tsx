import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, HelpCircle, ArrowRight, FileDown, Layers, Wrench } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import ScrollReveal from '@/components/ScrollReveal';
import { useLocation } from 'react-router-dom';
import { downloadCatalog } from '@/utils/catalogHelper';

const Resources = () => {
   const location = useLocation();
   const [activeTab, setActiveTab] = useState('catalog');

   useEffect(() => {
      const path = location.pathname.replace('/', '');
      if (['catalog', 'specs', 'guides'].includes(path)) {
         setActiveTab(path);
      }
   }, [location.pathname]);

   const tabs = [
      { id: 'catalog', label: 'Product Catalog', icon: FileDown },
      { id: 'specs', label: 'Technical Specs', icon: Layers },
      { id: 'guides', label: 'Installation Guides', icon: Wrench }
   ];

   const resourceData = {
      catalog: [
         { title: 'Full Industrial Catalog 2024', size: '12.5 MB', type: 'PDF', version: 'v4.2' },
         { title: 'Pipe Fittings & Flanges', size: '5.2 MB', type: 'PDF', version: 'v2.1' },
         { title: 'Valves & Automation Range', size: '8.1 MB', type: 'PDF', version: 'v3.5' }
      ],
      specs: [
         { title: 'ASTM A105 Material Specs', size: '1.2 MB', type: 'PDF', version: '2023' },
         { title: 'ANSI B16.5 Dimensional Data', size: '2.4 MB', type: 'PDF', version: '2024' },
         { title: 'Pressure-Temperature Ratings', size: '0.8 MB', type: 'PDF', version: 'v1.0' }
      ],
      guides: [
         { title: 'Valve Installation Manual', size: '3.1 MB', type: 'PDF', version: 'v2.0' },
         { title: 'Pipe Support Layout Guide', size: '4.5 MB', type: 'PDF', version: 'v1.2' },
         { title: 'Maintenance Best Practices', size: '1.5 MB', type: 'PDF', version: 'v3.0' }
      ]
   };

   return (
      <>
         <Helmet>
            <title>Technical Resources - Damodar Traders | Downloads & Specs</title>
            <meta name="description" content="Download technical specifications, product catalogs, and installation guides for industrial pipe fittings and valves." />
         </Helmet>

         <IndustrialBackground />
         <Navbar />

         <main className="relative z-10 pt-24 pb-20">
            {/* Header */}
            <section className="max-w-7xl mx-auto px-6 mb-20 text-center">
               <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl md:text-8xl font-black text-gray-900 leading-none tracking-tighter uppercase mb-8"
               >
                  TECHNICAL <br /> <span className="text-blue-600">RESOURCES</span>
               </motion.h1>
               <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
                  Access our complete library of product documentation, engineering data, and maintenance guides.
               </p>
            </section>

            {/* Tabs */}
            <section className="max-w-7xl mx-auto px-6 mb-16">
               <ScrollReveal direction="down" distance={20}>
                  <div className="flex flex-wrap justify-center gap-4 bg-white p-4 rounded-[2.5rem] shadow-xl border border-gray-100">
                     {tabs.map((tab) => (
                        <button
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id)}
                           className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${activeTab === tab.id
                                 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                 : 'bg-white text-gray-400 hover:bg-gray-50'
                              }`}
                        >
                           <tab.icon size={16} />
                           <span>{tab.label}</span>
                        </button>
                     ))}
                  </div>
               </ScrollReveal>
            </section>

            {/* Resources Grid */}
            <section className="max-w-7xl mx-auto px-6 mb-32">
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <AnimatePresence mode="wait">
                     <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25 }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:col-span-2 lg:col-span-3"
                     >
                        {resourceData[activeTab as keyof typeof resourceData].map((item, i) => (
                           <ScrollReveal key={item.title} delay={i * 0.1} distance={30}>
                              <div
                                 className="group bg-white rounded-[3rem] p-10 border border-gray-100 hover:border-blue-600 shadow-lg hover:shadow-2xl transition-all duration-500 h-full"
                              >
                                 <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <FileDown size={28} />
                                 </div>
                                 <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-4 leading-tight">
                                    {item.title}
                                 </h3>
                                 <div className="flex flex-wrap gap-4 mb-10">
                                    <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                                       {item.type} • {item.size}
                                    </span>
                                    <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                                       Version {item.version}
                                    </span>
                                 </div>
                                 <button 
                                    onClick={() => {
                                       if (activeTab === 'catalog') {
                                          downloadCatalog();
                                       } else {
                                          window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
                                       }
                                    }}
                                    className="w-full flex items-center justify-between p-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all group/btn"
                                 >
                                    <span>Download Now</span>
                                    <Download size={18} className="group-hover/btn:translate-y-1 transition-transform" />
                                 </button>
                              </div>
                           </ScrollReveal>
                        ))}
                     </motion.div>
                  </AnimatePresence>
               </div>
            </section>

            {/* Help Section */}
            <section className="max-w-4xl mx-auto px-6 text-center">
               <ScrollReveal delay={0.2} distance={40}>
                  <div className="bg-gray-50 rounded-[4rem] p-16 border border-gray-100">
                     <HelpCircle className="text-blue-600 mx-auto mb-6" size={40} />
                     <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-4">CAN'T FIND WHAT YOU'RE LOOKING FOR?</h2>
                     <p className="text-gray-600 font-medium mb-8">Our technical team can provide specific drawings or material certificates upon request.</p>
                     <button className="text-blue-600 font-black uppercase tracking-widest text-xs flex items-center gap-2 mx-auto hover:gap-4 transition-all">
                        <span>Request Custom Docs</span>
                        <ArrowRight size={16} />
                     </button>
                  </div>
               </ScrollReveal>
            </section>
         </main>

         <Footer />
      </>
   );
};

export default Resources;
