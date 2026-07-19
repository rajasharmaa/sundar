import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Users, Briefcase, MapPin, Clock, ArrowRight, Star, Heart, TrendingUp, Shield, Building, Globe } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import ScrollReveal from '@/components/ScrollReveal';

const Careers = () => {
   const [selectedDept, setSelectedDept] = useState('All');

   const departments = ['All', 'Sales & Marketing', 'Engineering', 'Operations', 'Quality Control'];

   const jobs = [
      {
         id: 1,
         title: 'Senior Sales Engineer (Industrial)',
         location: 'Indore / Pan-India',
         type: 'Full-time',
         dept: 'Sales & Marketing',
         experience: '5-8 Years',
         description: 'Looking for a dynamic individual to lead our industrial sales efforts and manage corporate client relationships.'
      },
      {
         id: 2,
         title: 'QA/QC Engineer',
         location: 'Indore Facility',
         type: 'Full-time',
         dept: 'Quality Control',
         experience: '3-5 Years',
         description: 'Ensure all outgoing products meet our strict ISO 9001:2015 and BIS standards through rigorous testing.'
      },
      {
         id: 3,
         title: 'Supply Chain Coordinator',
         location: 'Indore',
         type: 'Full-time',
         dept: 'Operations',
         experience: '2-4 Years',
         description: 'Manage logistics and warehouse operations to ensure on-time delivery across our pan-India network.'
      }
   ];

   const benefits = [
      { icon: TrendingUp, title: 'Career Growth', desc: 'Continuous learning and clear paths for professional advancement.' },
      { icon: Shield, title: 'Health Insurance', desc: 'Comprehensive medical coverage for you and your immediate family.' },
      { icon: Heart, title: 'Work-Life Balance', desc: 'Flexible timings and a supportive environment that values your time.' },
      { icon: Globe, title: 'Travel Exposure', desc: 'Opportunities to visit major industrial hubs and client sites across India.' }
   ];

   return (
      <>
         <Helmet>
            <title>Careers - Damodar Traders | Join Our Team</title>
            <meta name="description" content="Join the team at Damodar Traders. Explore career opportunities in industrial sales, engineering, and operations." />
         </Helmet>

         <IndustrialBackground />
         <Navbar />

         <main className="relative z-10 pt-24 pb-20">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 mb-32 text-center">
               <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-10 shadow-2xl shadow-blue-600/30 rotate-12"
               >
                  <Users size={40} />
               </motion.div>
               <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl md:text-8xl font-black text-gray-900 leading-none tracking-tighter uppercase mb-8"
               >
                  BUILD YOUR <span className="text-blue-600">FUTURE</span> <br /> WITH US
               </motion.h1>
               <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
                  Join a team of passionate professionals dedicated to revolutionizing
                  industrial solutions in India.
               </p>
            </section>

            {/* Culture & Benefits */}
            <section className="max-w-7xl mx-auto px-6 mb-32">
               <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {benefits.map((benefit, i) => (
                     <ScrollReveal key={benefit.title} delay={i * 0.1} distance={30}>
                        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50 hover:border-blue-600 transition-all duration-500 h-full">
                           <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                              <benefit.icon size={24} />
                           </div>
                           <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900 mb-3">{benefit.title}</h3>
                           <p className="text-gray-500 font-medium text-sm leading-relaxed">{benefit.desc}</p>
                        </div>
                     </ScrollReveal>
                  ))}
               </div>
            </section>

            {/* Job Listings Section */}
            <section className="max-w-7xl mx-auto px-6 mb-32">
               <div className="flex flex-col lg:flex-row gap-12 items-start">
                  <div className="lg:w-1/3">
                     <ScrollReveal direction="right" distance={40}>
                        <div className="sticky top-32 bg-gray-900 rounded-[3rem] p-10 text-white overflow-hidden">
                           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]" />
                           <h2 className="relative z-10 text-3xl font-black uppercase tracking-tighter mb-8">OPEN POSITIONS</h2>
                           <div className="relative z-10 space-y-3">
                              {departments.map((dept) => (
                                 <button
                                    key={dept}
                                    onClick={() => setSelectedDept(dept)}
                                    className={`w-full text-left px-6 py-3 rounded-xl font-bold text-sm transition-all ${selectedDept === dept ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                                       }`}
                                 >
                                    {dept}
                                 </button>
                              ))}
                           </div>
                           <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                    <Building size={20} />
                                 </div>
                                 <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Headquarters</p>
                                    <p className="text-sm font-bold">Indore, Madhya Pradesh</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </ScrollReveal>
                  </div>

                  <div className="lg:w-2/3 space-y-6">
                     {jobs.filter(j => selectedDept === 'All' || j.dept === selectedDept).map((job, i) => (
                        <ScrollReveal key={job.id} delay={i * 0.1} distance={20}>
                           <div className="group bg-white rounded-[3rem] p-10 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500">
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                                 <div>
                                    <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full mb-4 inline-block">
                                       {job.dept}
                                    </span>
                                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">
                                       {job.title}
                                    </h3>
                                 </div>
                                 <button className="px-8 py-3 bg-gray-900 text-white font-black rounded-xl hover:bg-blue-600 transition-all uppercase tracking-widest text-[10px] flex items-center gap-2">
                                    Apply Now <ArrowRight size={14} />
                                 </button>
                              </div>

                              <p className="text-gray-600 font-medium mb-8 leading-relaxed max-w-2xl">
                                 {job.description}
                              </p>

                              <div className="flex flex-wrap gap-6 pt-6 border-t border-gray-50">
                                 <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                                    <MapPin size={14} /> {job.location}
                                 </div>
                                 <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                                    <Clock size={14} /> {job.type}
                                 </div>
                                 <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                                    <Briefcase size={14} /> {job.experience}
                                 </div>
                              </div>
                           </div>
                        </ScrollReveal>
                     ))}
                  </div>
               </div>
            </section>

            {/* CTA Section */}
            <ScrollReveal delay={0.2} distance={40}>
               <section className="max-w-7xl mx-auto px-6">
                  <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-[4rem] p-12 lg:p-24 text-center text-white">
                     <h2 className="text-4xl md:text-6xl font-black leading-none tracking-tighter uppercase mb-8">
                        DON'T SEE THE <br /> RIGHT ROLE?
                     </h2>
                     <p className="text-xl text-blue-100 font-medium mb-12 max-w-2xl mx-auto">
                        We're always looking for talented individuals. Send us your CV and we'll keep you in mind for future openings.
                     </p>
                     <a
                        href="mailto:careers@damodartraders.com"
                        className="inline-flex items-center gap-4 bg-white text-blue-600 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-100 transition-all shadow-xl shadow-black/20"
                     >
                        <span>Send Your Resume</span>
                        <ArrowRight size={18} />
                     </a>
                  </div>
               </section>
            </ScrollReveal>
         </main>

         <Footer />
      </>
   );
};

export default Careers;
