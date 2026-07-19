import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/api/api-client';
import {
  Target, Eye, Medal, Handshake, Shield,
  Building, Award, Users, Clock, TrendingUp, MapPin,
  Star, CheckCircle, ArrowRight, ChevronRight, ChevronLeft, Globe,
  Factory, Truck, Package, HeadphonesIcon, Sparkles,
  Quote, ShieldCheck, BadgeCheck, FileText, Download, ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import ScrollReveal from '@/components/ScrollReveal';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const About = () => {
  const { settings } = useSiteSettings();
  const [stats, setStats] = useState([
    { icon: Clock, value: '15+', label: 'Years of Excellence', suffix: 'Years', key: 'experience' },
    { icon: Users, value: '5000+', label: 'Satisfied Clients', suffix: 'Clients', key: 'clients' },
    { icon: Package, value: '2500+', label: 'Products Range', suffix: 'Products', key: 'products' },
    { icon: MapPin, value: 'Pan-India', label: 'Service Coverage', suffix: 'Delivery', key: 'coverage' },
    { icon: Award, value: '25+', label: 'Industry Awards', suffix: 'Awards', key: 'awards' },
    { icon: Truck, value: '98%', label: 'On-Time Delivery', suffix: 'Rate', key: 'delivery' },
  ]);

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.metrics.getStats();
        if (response?.success && response.data) {
          const apiStats = response.data;
          setStats(prev => prev.map(stat => {
            if (stat.key === 'clients' && apiStats.totalClients) return { ...stat, value: `${apiStats.totalClients}+` };
            if (stat.key === 'products' && apiStats.totalProducts) return { ...stat, value: `${apiStats.totalProducts}+` };
            return stat;
          }));
        }
      } catch (err) {
        // Fallback to defaults already in state
      }
    };
    fetchStats();
  }, []);

  const values = [
    { icon: Medal, title: 'Quality Excellence', description: 'Every product undergoes rigorous pressure and dimensional testing to meet international standards.', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    { icon: Handshake, title: 'Customer Commitment', description: 'Building lasting partnerships through dedicated sourcing managers and on-site support.', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { icon: Shield, title: 'Integrity First', description: 'Operating with complete transparency, GST compliant billing, and certified mill reports.', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  ];

  const milestones = [
    { year: '2011', title: 'Foundation & Sourcing Desk', description: 'Started operations in Indore, Madhya Pradesh, to bridge the demand for premium pipe fittings.' },
    { year: '2014', title: 'Specialized Valves Casting', description: 'Collaborated with casting mills to expand product portfolio to include specialized industrial valves.' },
    { year: '2017', title: 'PAN-India Logistic Network', description: 'Established regular distribution dispatches across Gujarat, Maharashtra, Rajasthan, and beyond.' },
    { year: '2023', title: 'ISO Audits & Sizing Upgrades', description: 'Recognized as Indore’s premier B2B industrial partner with full ISO 9001:2015 audit certificates.' },
  ];

  const testimonials = [
    {
      quote: "Damodar Traders has been our primary supplier for industrial fittings and valves for the past 5 years. Their BIS compliance and prompt dispatches have kept our project running with zero down-time.",
      author: "Rajesh Mehta",
      role: "Operations Director, Narmada Pipes & Projects Ltd.",
      rating: 5
    },
    {
      quote: "The technical review desk is outstanding. They helped us size our casting mill flanges and provided full Material Test Certificates (MTC) with delivery. Complete professionalism.",
      author: "Dr. A. K. Banerjee",
      role: "Chief Piping Consultant, Central Infrastructure Systems",
      rating: 5
    },
    {
      quote: "GST-compliant corporate invoicing, transparent bulk discounts, and ready-to-dispatch stocks. Highly recommended B2B partner in Central India.",
      author: "Vikram Rathi",
      role: "Procurement Manager, Rathi Metals Group",
      rating: 5
    }
  ];

  const galleryItems = [
    { title: "Flagship Indore Showroom", desc: "Sample inspection desk for GI & CI pipe fittings.", category: "Distribution" },
    { title: "Indore HQ Warehouse", desc: "10,000+ Sq Ft storage facility with ready stocks.", category: "Logistics" },
    { title: "Quality Testing Division", desc: "Rigorous dimensional and hydrostatic testing area.", category: "Quality" },
    { title: "Corporate Sourcing Desk", desc: "Engineers compiling technical sizing list quotes.", category: "Commercial" }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>About Damodar Traders | Premium B2B Industrial Piping & Valve Solutions</title>
        <meta name="description" content="Discover the legacy of Damodar Traders, Indore's leading supplier of GI/CI pipe fittings, industrial valves, and flanges since 2011. Read our story, certifications, and customer reviews." />
        <meta name="keywords" content="About Damodar Traders, industrial pipe fittings Indore, CI GI pipe fittings, B2B industrial valves, ISO certified supplier, Damodar Prasad Sharma" />
      </Helmet>

      <IndustrialBackground />
      <Navbar />

      <main className="pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Premium Industrial Hero Banner */}
          <div className="relative bg-slate-900 text-white rounded-[3rem] px-6 sm:px-10 py-16 sm:py-24 overflow-hidden mb-16 shadow-2xl border border-slate-800">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative max-w-4xl mx-auto text-center space-y-8">
              <ScrollReveal>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles size={14} className="text-blue-400 animate-pulse" />
                  25+ Years Legacy of Trust
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <h1 className="text-4xl sm:text-7xl font-black tracking-tight leading-none uppercase">
                  Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Reliability</span> & Quality
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p className="text-slate-350 text-sm sm:text-lg max-w-3xl mx-auto font-medium leading-relaxed">
                  Damodar Traders has been the structural backbone of industrial piping supply in Indore and across India. 
                  We supply heavy-duty GI & CI fittings, flanges, and valves backed by official manufacturer’s MTC.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  <Link
                    to="/products"
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl transition-all hover:scale-105"
                  >
                    Explore Products Catalog
                  </Link>
                  <Link
                    to="/contact"
                    className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl transition-all hover:scale-105"
                  >
                    Contact Sourcing Desk
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Interactive Stats Grid */}
          <ScrollReveal>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-20">
              {stats.map((stat, i) => (
                <div key={stat.key} className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:border-blue-500 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <stat.icon size={20} />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Vision & Mission Cards */}
          <div className="grid lg:grid-cols-2 gap-8 mb-20">
            <ScrollReveal direction="right" distance={40}>
              <div className="relative group bg-slate-900 rounded-[3rem] p-8 sm:p-12 overflow-hidden h-full border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Target size={28} />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">Our Mission</h2>
                  <p className="text-slate-300 font-semibold leading-relaxed text-sm">
                    To supply standard-compliant, high-durability piping systems and components to commercial and industrial segments. We focus on zero-leak operation, complete technical sizing verification, and fast logistics dispatch to prevent mill downtime.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" distance={40}>
              <div className="relative group bg-white rounded-[3rem] p-8 sm:p-12 shadow-2xl border border-slate-150 overflow-hidden h-full">
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <Eye size={28} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Our Vision</h2>
                  <p className="text-slate-500 font-semibold leading-relaxed text-sm">
                    To build a digitally enabled B2B industrial infrastructure sourcing platform that makes bulk procurement seamless, fully transparent, and mill-certified for construction, manufacturing, and municipal dispatches across PAN-India by 2030.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Interactive Sourcing Legacy Timeline */}
          <ScrollReveal>
            <div className="bg-white rounded-[3rem] p-8 sm:p-12 border border-slate-150 shadow-xl mb-20">
              <div className="max-w-2xl mb-12">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-1">Company Journey</span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">Our Legacy & Milestones</h2>
                <p className="text-slate-500 text-sm font-semibold mt-1">Tracing our growth from a local supplier to a trusted national industrial partner.</p>
              </div>

              <div className="relative border-l-2 border-slate-100 pl-6 sm:pl-10 space-y-12 ml-4">
                {milestones.map((milestone, i) => (
                  <div key={milestone.year} className="relative group">
                    {/* Circle Node */}
                    <div className="absolute -left-[35px] sm:-left-[51px] top-1 w-6 h-6 bg-white border-4 border-blue-600 rounded-full group-hover:bg-blue-600 transition-colors" />
                    
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300">
                      <span className="text-2xl font-black text-blue-600 block mb-2">{milestone.year}</span>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">{milestone.title}</h3>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Showroom & Warehouse Gallery */}
          <ScrollReveal>
            <div className="bg-slate-900 text-white rounded-[3rem] p-8 sm:p-12 overflow-hidden mb-20 border border-slate-850 shadow-2xl">
              <div className="max-w-2xl mb-12">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] block mb-1">Infrastructure Visuals</span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Our Showroom & Warehousing Hub</h2>
                <p className="text-slate-350 text-sm font-semibold mt-1">Take a tour of our fully equipped distribution infrastructure located in Indore.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {galleryItems.map((item, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors duration-300 flex flex-col justify-between h-48 group">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-900/40 px-2.5 py-1 rounded-md">
                        {item.category}
                      </span>
                      <h3 className="font-extrabold text-sm text-white mt-4 leading-tight group-hover:text-blue-300 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed mt-2">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Founder Section */}
          <ScrollReveal>
            <div className="grid lg:grid-cols-12 gap-12 items-center mb-20 bg-white rounded-[3rem] p-8 sm:p-12 border border-slate-150 shadow-xl">
              <div className="lg:col-span-5 relative">
                <div className="absolute -inset-4 bg-blue-500/5 rounded-[4rem] blur-[80px] pointer-events-none" />
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 max-w-md mx-auto">
                  <img
                    src={settings.founderImage}
                    alt="Founder Damodar Prasad Sharma"
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-4 left-4 right-4 p-5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-100">
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">DAMODAR PRASAD SHARMA</h3>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Founder & Managing Director</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <Quote size={54} className="text-blue-600/10" />
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight leading-none">
                  "Quality is not an accident; it is the result of continuous testing and integrity."
                </h2>
                <p className="text-slate-500 text-sm font-semibold leading-relaxed">
                  With over 35 years of dedicated industrial experience, Mr. Sharma founded Damodar Traders with a core mission: to provide Indian B2B industries with zero-defect pipe fittings and flow accessories. Under his stewardship, we have scaled to service major corporate projects.
                </p>
                <div className="flex gap-8 border-t border-slate-100 pt-6">
                  <div>
                    <div className="text-2xl font-black text-slate-900">35+</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Years B2B Experience</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">5000+</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Satisfied Businesses</div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Verification & Trust Badges Section */}
          <ScrollReveal>
            <div className="bg-white rounded-[3rem] p-8 sm:p-12 border border-slate-150 shadow-xl mb-20 text-center">
              <div className="max-w-2xl mx-auto mb-12">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-1">Certifications</span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">Quality Badges & Trust Signals</h2>
                <p className="text-slate-500 text-sm font-semibold mt-1">We maintain compliant, audited operations and supply chain certifications.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: ShieldCheck, title: "ISO 9001:2015 Approved", desc: "Quality management and supply checks are fully audited." },
                  { icon: BadgeCheck, title: "GST Billing Compliant", desc: "GSTIN-registered commercial invoicing for tax benefit audits." },
                  { icon: Award, title: "BIS Standard Fittings", desc: "Supplying ISI & BIS-approved dimensional cast steel products." },
                  { icon: FileText, title: "Verified MTC Dispatches", desc: "Material Test Certificates sent automatically with physical orders." }
                ].map((item, idx) => (
                  <div key={idx} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col items-center">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl mb-4">
                      <item.icon size={28} />
                    </div>
                    <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-2">{item.title}</h3>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Testimonials Slider */}
          <ScrollReveal>
            <div className="bg-white rounded-[3rem] p-8 sm:p-12 border border-slate-150 shadow-xl mb-20 relative overflow-hidden">
              <div className="max-w-2xl mb-10">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-1">Feedback</span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">Client Testimonials</h2>
                <p className="text-slate-500 text-sm font-semibold mt-1">Read what corporate engineers and purchasing heads say about our dispatches.</p>
              </div>

              <div className="relative min-h-[160px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTestimonial}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-3xl text-center space-y-4"
                  >
                    <p className="text-slate-700 font-semibold text-sm sm:text-base leading-relaxed italic">
                      "{testimonials[currentTestimonial].quote}"
                    </p>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wide">
                        {testimonials[currentTestimonial].author}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                        {testimonials[currentTestimonial].role}
                      </p>
                    </div>
                    <div className="flex justify-center gap-1">
                      {Array.from({ length: testimonials[currentTestimonial].rating }).map((_, i) => (
                        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={prevTestimonial}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Core Values */}
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-1">Our DNA</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">Our Core Values</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-20">
              {values.map((val, i) => (
                <div key={val.title} className="bg-white p-8 rounded-[2.5rem] border border-slate-150 shadow-xl flex flex-col items-center text-center">
                  <div className={`w-16 h-16 ${val.color} border rounded-2xl flex items-center justify-center mb-6`}>
                    <val.icon size={26} />
                  </div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-4">{val.title}</h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">{val.description}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Final Call to Action */}
          <ScrollReveal>
            <div className="relative bg-blue-600 text-white rounded-[3rem] p-10 sm:p-20 overflow-hidden text-center shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_70%)] pointer-events-none" />
              <h2 className="text-3xl sm:text-6xl font-black leading-none uppercase tracking-tight mb-6">
                Ready to Build the Future?
              </h2>
              <p className="text-blue-100 text-sm font-semibold max-w-xl mx-auto mb-10 leading-relaxed">
                Partner with India’s most reliable industrial supply experts for GI/CI pipe fittings and valves.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all shadow-xl hover:scale-105"
              >
                <span>Start a Partnership</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </ScrollReveal>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
