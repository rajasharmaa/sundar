import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight, ExternalLink, Users, Clock, Globe, Star, Sparkles } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import ScrollReveal from '@/components/ScrollReveal';

const Events = () => {
  const events = [
    {
      id: 1,
      title: 'Industrial Expo 2024 - Indore',
      date: 'Oct 15 - 18, 2024',
      location: 'Labh Ganga Exhibition Center, Indore',
      description: 'Visit us at Booth A-42 to explore our latest range of high-pressure valves and automated pipe fittings.',
      category: 'Exhibition',
      image: 'https://images.unsplash.com/photo-1540575861501-7ad0582371f3?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 2,
      title: 'Technical Seminar: Smart Flow Controls',
      date: 'Aug 05, 2024',
      location: 'Hotel Sayaji, Indore',
      description: 'A dedicated technical session for plant engineers on implementing IoT-based flow control systems.',
      category: 'Seminar',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 3,
      title: 'Annual Vendor Meet 2024',
      date: 'Dec 20, 2024',
      location: 'Damodar Traders Corporate Office',
      description: 'Connecting our supply partners and discussing the roadmap for the upcoming financial year.',
      category: 'Internal',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Events & Exhibitions - Damodar Traders | Industrial Network</title>
        <meta name="description" content="Join Damodar Traders at upcoming industrial expos, seminars, and exhibitions. Stay connected with our latest events." />
      </Helmet>

      <IndustrialBackground />
      <Navbar />

      <main className="relative z-10 pt-24 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 mb-24 text-center">
           <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-10"
           >
              <Sparkles size={16} />
              <span>Connect With Us</span>
           </motion.div>
           <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-8xl font-black text-gray-900 leading-none tracking-tighter uppercase mb-8"
           >
              EVENTS & <br /> <span className="text-blue-600">EXHIBITIONS</span>
           </motion.h1>
           <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
              We regularly participate in national industrial events and host technical seminars 
              to share our expertise and latest innovations.
           </p>
        </section>

        {/* Featured Event */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
           <ScrollReveal distance={40}>
              <div className="relative rounded-[4rem] overflow-hidden bg-gray-900 h-[500px] flex items-center shadow-2xl">
                 <div className="absolute inset-0">
                    <img 
                       src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1600" 
                       alt="Main Event" 
                       className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
                 </div>
                 
                 <div className="relative z-10 p-12 md:p-20 max-w-2xl">
                    <div className="flex items-center gap-4 text-blue-400 font-black uppercase tracking-widest text-xs mb-6">
                       <Star size={14} className="fill-blue-400" />
                       <span>Next Major Event</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tighter uppercase mb-8">
                       INDORE INDUSTRIAL <br /> EXPO 2024
                    </h2>
                    <div className="flex flex-wrap gap-6 mb-10">
                       <div className="flex items-center gap-3 text-white/80 font-bold">
                          <Calendar size={20} className="text-blue-500" />
                          <span>Oct 15, 2024</span>
                       </div>
                       <div className="flex items-center gap-3 text-white/80 font-bold">
                          <MapPin size={20} className="text-blue-500" />
                          <span>Indore, MP</span>
                       </div>
                    </div>
                    <button className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 uppercase tracking-widest text-xs flex items-center gap-3">
                       Register For Visit <ArrowRight size={18} />
                    </button>
                 </div>
              </div>
           </ScrollReveal>
        </section>

        {/* Events Grid */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
           <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-12">UPCOMING EVENTS</h2>
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {events.map((event, i) => (
                 <ScrollReveal key={event.id} delay={i * 0.1} distance={30}>
                    <div className="group h-full">
                       <div className="relative overflow-hidden rounded-[3rem] mb-8 shadow-lg aspect-[4/3]">
                          <img 
                             src={event.image} 
                             alt={event.title} 
                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute top-6 left-6">
                             <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                                {event.category}
                             </span>
                          </div>
                       </div>
                       <div className="px-4">
                          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-4 group-hover:text-blue-600 transition-colors">
                             {event.title}
                          </h3>
                          <p className="text-gray-600 font-medium mb-8 line-clamp-2">
                             {event.description}
                          </p>
                          <div className="space-y-3 mb-8">
                             <div className="flex items-center gap-3 text-gray-500 font-bold text-xs uppercase tracking-widest">
                                <Calendar size={14} className="text-blue-500" />
                                {event.date}
                             </div>
                             <div className="flex items-center gap-3 text-gray-500 font-bold text-xs uppercase tracking-widest">
                                <MapPin size={14} className="text-blue-500" />
                                {event.location}
                             </div>
                          </div>
                          <button className="flex items-center gap-2 text-gray-900 font-black uppercase tracking-widest text-[10px] group-hover:gap-4 transition-all">
                             <span>Event Details</span>
                             <ArrowRight size={14} />
                          </button>
                       </div>
                    </div>
                 </ScrollReveal>
              ))}
           </div>
        </section>

        {/* Global Presence */}
        <section className="bg-gray-50 py-32 rounded-[4rem] mx-6">
           <ScrollReveal delay={0.2} distance={40}>
              <div className="max-w-7xl mx-auto px-10">
                 <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-none tracking-tighter uppercase">
                       OUR <span className="text-blue-600">INDUSTRIAL</span> NETWORK
                    </h2>
                    <p className="text-xl text-gray-500 font-medium">Beyond Indore, we maintain a strong presence in major industrial hubs.</p>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center opacity-40">
                    {['FICCI', 'CII', 'Engineering Export', 'Industrial Association'].map((item) => (
                       <div key={item} className="text-center font-black text-2xl uppercase tracking-tighter text-gray-400 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                          {item}
                       </div>
                    ))}
                 </div>
              </div>
           </ScrollReveal>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Events;
