import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Leaf, Recycle, Droplets, Sun, Wind, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import ScrollReveal from '@/components/ScrollReveal';

const Sustainability = () => {
  const initiatives = [
    { icon: Recycle, title: 'Zero Waste Manufacturing', desc: '100% of our polymer scrap is recycled in-house to produce secondary packaging materials.' },
    { icon: Sun, title: 'Solar Powered Facilities', desc: '40% of our energy requirements are met through our 2MW rooftop solar installation.' },
    { icon: Droplets, title: 'Water Conservation', desc: 'Closed-loop cooling systems reduce our water consumption by 85% compared to industry averages.' },
    { icon: Leaf, title: 'Eco-friendly Materials', desc: 'Pioneering the use of bio-degradable additives and promoting 100% recyclable PP/HDPE products.' }
  ];

  return (
    <>
      <Helmet>
        <title>Sustainability | Sundar Corporation</title>
        <meta name="description" content="Discover Sundar Corporation's commitment to sustainable manufacturing and eco-friendly packaging solutions." />
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
            <div className="flex items-center justify-center gap-3 mb-6 text-green-600 font-black uppercase tracking-widest text-sm">
              <Leaf size={20} />
              <span>Environmental Responsibility</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-gray-900 leading-none tracking-tighter uppercase mb-6">
              SUSTAINABLE <span className="text-green-600">FUTURE</span>
            </h1>
            <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
              We believe that industrial progress shouldn't come at the cost of the environment. Discover our green manufacturing initiatives.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {initiatives.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100 flex items-start gap-6 group hover:border-green-600 transition-colors h-full">
                  <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-600 transition-colors">
                    <item.icon className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-4 group-hover:text-green-600 transition-colors">{item.title}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <div className="relative rounded-[4rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&q=80" 
                alt="Sustainable Manufacturing" 
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
              
              <div className="absolute inset-0 p-12 lg:p-24 flex flex-col justify-center max-w-3xl">
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-8">
                  The Circular Economy
                </h2>
                <p className="text-gray-300 text-lg font-medium leading-relaxed mb-10">
                  Our BOPP and PP woven bags are designed with the circular economy in mind. Being 100% recyclable, they can be processed into granules at the end of their lifecycle to create new products, reducing the burden on landfills and lowering the overall carbon footprint of your supply chain.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  {['100% Recyclable Output', 'Energy Efficient Processes', 'Reduced Carbon Footprint', 'Ethical Sourcing'].map((point, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="text-green-500" size={24} />
                      <span className="text-white font-bold tracking-wide">{point}</span>
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

export default Sustainability;
