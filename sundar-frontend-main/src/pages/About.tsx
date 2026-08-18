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
          const apiStats = response.data as any;
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
    { icon: Medal, title: 'Quality Excellence', description: 'Every product undergoes rigorous tensile strength, UV resistance, and load-bearing tests to meet international standards.', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    { icon: Handshake, title: 'Customer Commitment', description: 'Building lasting partnerships through dedicated account managers and bulk supply reliability.', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
    { icon: Shield, title: 'Integrity First', description: 'Operating with complete transparency, GST compliant billing, and certified load-test reports.', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  ];

  const milestones = [
    { year: '2017', title: 'Foundation & Vision', description: 'Established Sundar Corporation to deliver high-quality packaging solutions, starting with HDPE and PP bags.' },
    { year: '2019', title: 'Expanding Product Range', description: 'Introduced BOPP bags and Polypropylene Bulk Bags to cater to agriculture and industrial sectors.' },
    { year: '2021', title: 'PAN-India Distribution Network', description: 'Expanded our distribution footprint across major states, ensuring timely and reliable deliveries nationwide.' },
    { year: '2023', title: 'Quality Standards & Growth', description: 'Recognized as a leading wholesaler and manufacturer, maintaining moral & ethical business practices with optimum quality fabrics.' },
  ];

  const testimonials = [
    {
      quote: "Sundar Corporation has been our primary supplier for BOPP and FIBC bulk bags for the past 5 years. Their load-test compliance and prompt dispatches have kept our logistics running with zero down-time.",
      author: "Rajesh Mehta",
      role: "Operations Director, Mehta Logistics",
      rating: 5
    },
    {
      quote: "The technical review desk is outstanding. They helped us customize our PP woven sacks for agricultural exports and provided full UV-resistance test certificates with delivery.",
      author: "Dr. A. K. Banerjee",
      role: "Chief Packaging Consultant, Central Agro Systems",
      rating: 5
    },
    {
      quote: "GST-compliant corporate invoicing, transparent bulk discounts, and ready-to-dispatch stocks of high-GSM jumbo bags. Highly recommended B2B partner.",
      author: "Vikram Rathi",
      role: "Purchasing Manager, Rathi Polymers",
      rating: 5
    }
  ];

  const galleryItems = [
    { title: "Flagship Indore Showroom", desc: "Sample inspection desk for premium HDPE & PP Bags.", category: "Distribution" },
    { title: "Indore HQ Warehouse", desc: "10,000+ Sq Ft storage facility with ready stocks of bulk bags.", category: "Logistics" },
    { title: "Quality Testing Division", desc: "Rigorous tensile and drop testing area for heavy-duty sacks.", category: "Quality" },
    { title: "Corporate Manufacturing Desk", desc: "Packaging experts compiling custom dimensional quotes.", category: "Commercial" }
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
        <title>About Sundar Corporation | Premium Packaging Bags Manufacturer</title>
        <meta name="description" content="Discover the legacy of Sundar Corporation, a leading Manufacturer, Wholesaler and Trader of HDPE Bags, PP Bags, BOPP Bags, Polypropylene Bulk Bags, and Jute Bags since 2017." />
        <meta name="keywords" content="About Sundar Corporation, packaging bags manufacturer, HDPE Bags, PP Bags, BOPP Bags, Polypropylene Bulk Bags, Jute Bags, Sundar Corporation R. Singhal" />
      </Helmet>

      <IndustrialBackground />
      <Navbar />

      <main className="pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Premium Industrial Hero Banner */}
          <div
            className="relative bg-slate-900 text-white rounded-[3rem] px-6 sm:px-10 py-16 sm:py-24 overflow-hidden mb-16 shadow-2xl border border-slate-800 bg-cover bg-center"
            style={settings.aboutUsBanner ? { backgroundImage: `url(${settings.aboutUsBanner})` } : {}}
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
            <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative max-w-4xl mx-auto text-center space-y-8">
              <ScrollReveal>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles size={14} className="text-green-400 animate-pulse" />
                  Quality You Can Trust Since 2017
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <h1 className="text-4xl sm:text-7xl font-black tracking-tight leading-none uppercase">
                  Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">Durability</span> & Strength
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p className="text-slate-350 text-sm sm:text-lg max-w-3xl mx-auto font-medium leading-relaxed">
                  Established in 2017, Sundar Corporation is a leading Manufacturer, Wholesaler and Trader of HDPE Bags, PP Bags, BOPP Bags, Polypropylene Bulk Bags, and Jute Bags. Supported by a highly skilled team, we deliver unmatched packaging solutions.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  <Link
                    to="/products"
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl transition-all hover:scale-105"
                  >
                    Explore Products Catalog
                  </Link>
                  <Link
                    to="/contact"
                    className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl transition-all hover:scale-105"
                  >
                    Contact Manufacturing Desk
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Interactive Stats Grid */}
          <ScrollReveal>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-20">
              {stats.map((stat, i) => (
                <div key={stat.key} className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:border-green-500 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
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
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                    <Target size={28} />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">Our Mission</h2>
                  <p className="text-slate-300 font-semibold leading-relaxed text-sm">
                    To supply standard-compliant, high-durability packaging solutions to commercial and industrial segments. We focus on zero-defect manufacturing, complete quality verification, and fast logistics dispatch to ensure ultimate client satisfaction.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" distance={40}>
              <div className="relative group bg-white rounded-[3rem] p-8 sm:p-12 shadow-2xl border border-slate-150 overflow-hidden h-full">
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-50 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <Eye size={28} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Our Vision</h2>
                  <p className="text-slate-500 font-semibold leading-relaxed text-sm">
                    To build a digitally enabled B2B packaging infrastructure platform that makes bulk ordering seamless, fully transparent, and quality-certified for agriculture, retail, and manufacturing sectors across PAN-India by 2030.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Interactive Manufacturing Legacy Timeline */}
          <ScrollReveal>
            <div className="bg-white rounded-[3rem] p-8 sm:p-12 border border-slate-150 shadow-xl mb-20">
              <div className="max-w-2xl mb-12">
                <span className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] block mb-1">Company Journey</span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">Our Legacy & Milestones</h2>
                <p className="text-slate-500 text-sm font-semibold mt-1">Tracing our growth from a local supplier to a trusted national packaging partner.</p>
              </div>

              <div className="relative border-l-2 border-slate-100 pl-6 sm:pl-10 space-y-12 ml-4">
                {milestones.map((milestone, i) => (
                  <div key={milestone.year} className="relative group">
                    {/* Circle Node */}
                    <div className="absolute -left-[35px] sm:-left-[51px] top-1 w-6 h-6 bg-white border-4 border-green-600 rounded-full group-hover:bg-green-600 transition-colors" />

                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300">
                      <span className="text-2xl font-black text-green-600 block mb-2">{milestone.year}</span>
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
                <span className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em] block mb-1">Infrastructure Visuals</span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Our Showroom & Warehousing Hub</h2>
                <p className="text-slate-350 text-sm font-semibold mt-1">Take a tour of our fully equipped distribution infrastructure located in Indore.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {galleryItems.map((item, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors duration-300 flex flex-col justify-between h-48 group">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-green-400 bg-green-900/40 px-2.5 py-1 rounded-md">
                        {item.category}
                      </span>
                      <h3 className="font-extrabold text-sm text-white mt-4 leading-tight group-hover:text-green-300 transition-colors">
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
                <div className="absolute -inset-4 bg-green-500/5 rounded-[4rem] blur-[80px] pointer-events-none" />
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 max-w-md mx-auto">
                  <img
                    src={settings.founderImage || '/placeholder.svg'}
                    alt="Founder Sundar Corporation R. Singhal"
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-4 left-4 right-4 p-5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-100">
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Mr. R. Singhal</h3>
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mt-1">CEO & Mentor</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <Quote size={54} className="text-green-600/10" />
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight leading-none">
                  "Quality is not an accident; it is the result of continuous testing and integrity."
                </h2>
                <p className="text-slate-500 text-sm font-semibold leading-relaxed">
                  Under the guiding principle of our mentor Mr. Ritesh Singhal, our organization continues to walk the path of growth, quality, and trust — building long-term relationships with our clients through consistency and reliability. We are well-supported by a team of highly skilled professionals who possess rich industry experience across their respective domains of business operations.
                </p>
                <div className="flex gap-8 border-t border-slate-100 pt-6">
                  <div>
                    <div className="text-2xl font-black text-slate-900">7+</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Years Experience</div>
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
                <span className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] block mb-1">Company Facts</span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">Business Information</h2>
                <p className="text-slate-500 text-sm font-semibold mt-1">Key details and facts about our business operations.</p>
              </div>

              <div className="overflow-x-auto text-left max-w-4xl mx-auto">
                <table className="w-full text-sm text-left text-slate-600 mb-10">
                  <thead className="text-xs text-slate-800 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-4">Detail</th>
                      <th scope="col" className="px-6 py-4">Information</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-900">Year of Establishment</td>
                      <td className="px-6 py-4">2017</td>
                    </tr>
                    <tr className="bg-white border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-900">Nature of Business</td>
                      <td className="px-6 py-4">Trader – Wholesaler/Distributor</td>
                    </tr>
                    <tr className="bg-white border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-900">Additional Business</td>
                      <td className="px-6 py-4">Manufacturing, Retail, Wholesale</td>
                    </tr>
                    <tr className="bg-white border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-900">Legal Status</td>
                      <td className="px-6 py-4">Proprietorship</td>
                    </tr>
                    <tr className="bg-white border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-900">Number of Employees</td>
                      <td className="px-6 py-4">Up to 10 People</td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-900">GST Registration</td>
                      <td className="px-6 py-4">Since 2017</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="max-w-4xl mx-auto border-t border-slate-100 pt-10">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6">Our Bankers</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700">Kotak Mahindra Bank</div>
                  <div className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700">IndusInd Bank</div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Testimonials Slider */}
          <ScrollReveal>
            <div className="bg-white rounded-[3rem] p-8 sm:p-12 border border-slate-150 shadow-xl mb-20 relative overflow-hidden">
              <div className="max-w-2xl mb-10">
                <span className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] block mb-1">Feedback</span>
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
              <span className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] block mb-1">Our DNA</span>
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
            <div className="relative bg-green-600 text-white rounded-[3rem] p-10 sm:p-20 overflow-hidden text-center shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_70%)] pointer-events-none" />
              <h2 className="text-3xl sm:text-6xl font-black leading-none uppercase tracking-tight mb-6">
                Ready to Build the Future?
              </h2>
              <p className="text-green-100 text-sm font-semibold max-w-xl mx-auto mb-10 leading-relaxed">
                Collaborated with leading mills to expand product portfolio to include specialized bulk and BOPP bags, becoming your supply experts for premium packaging solutions and woven sacks.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all shadow-xl hover:scale-105"
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
