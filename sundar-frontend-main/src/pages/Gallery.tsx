import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import ScrollReveal from '@/components/ScrollReveal';

const galleryItems = [
  { id: 1, title: 'Manufacturing Plant', category: 'Infrastructure', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80' },
  { id: 2, title: 'Quality Control Lab', category: 'Quality', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80' },
  { id: 3, title: 'Warehouse Storage', category: 'Logistics', image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&q=80' },
  { id: 4, title: 'BOPP Printing Press', category: 'Machinery', image: 'https://images.unsplash.com/photo-1531685250784-afb523812244?auto=format&fit=crop&q=80' },
  { id: 5, title: 'Extrusion Line', category: 'Machinery', image: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&q=80' },
  { id: 6, title: 'Finished Goods Dispatch', category: 'Logistics', image: 'https://images.unsplash.com/photo-1586528116311-ad8ed7e66a6a?auto=format&fit=crop&q=80' },
];

const Gallery = () => {
  return (
    <>
      <Helmet>
        <title>Infrastructure & Gallery | Sundar Corporation</title>
        <meta name="description" content="Explore our state-of-the-art manufacturing infrastructure and quality control facilities." />
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
            <h1 className="text-5xl md:text-8xl font-black text-gray-900 leading-none tracking-tighter uppercase mb-6">
              OUR <span className="text-blue-600">INFRASTRUCTURE</span>
            </h1>
            <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
              State-of-the-art facilities equipped with modern machinery to deliver premium packaging solutions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryItems.map((item, index) => (
              <ScrollReveal key={item.id} delay={index * 0.1}>
                <div className="group relative rounded-[2rem] overflow-hidden shadow-lg h-[400px]">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full self-start mb-4">
                      {item.category}
                    </span>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Gallery;
