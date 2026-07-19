import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import {
  MapPin, Phone, Clock, Facebook, Twitter, Instagram, Linkedin,
  ShieldCheck, Download, FileText, ChevronRight, Send,
  Award, HelpCircle
} from 'lucide-react';
import { useState } from 'react';
import { downloadCatalog } from '@/utils/catalogHelper';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { settings } = useSiteSettings();

  const productLinks = [
    { name: 'Pipes & Tubes', path: '/products?category=pipes' },
    { name: 'Industrial Fittings', path: '/products?category=fittings' },
    { name: 'Valves & Controls', path: '/products?category=valves' },
    { name: 'Flanges & Gaskets', path: '/products?category=flanges' },
    { name: 'Pipe Supports', path: '/products?category=supports' },
  ];

  const companyLinks = [
    { name: 'About Damodar', path: '/about' },
    { name: 'Showroom Virtual Tour', path: '/#showroom' },
    { name: 'Quality Certifications', path: '/about#certifications' },
    { name: 'Contact Sales', path: '/contact' },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-[#0F172A] text-slate-300 pt-20 pb-12 border-t border-slate-800 relative z-20 overflow-hidden">

      {/* Decorative radial glows for premium vibe */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* 1. Newsletter Strip at the Top */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 mb-16">
          <div className="flex items-center gap-5 text-center lg:text-left">
            <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <Send className="w-6 h-6 rotate-12" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">Stay Updated With Industrial Trends</h3>
              <p className="text-slate-400 text-sm mt-0.5">Subscribe to our monthly technical digest for standards & product availability.</p>
            </div>
          </div>

          <form onSubmit={handleSubscribe} className="flex gap-3 w-full lg:w-auto flex-col sm:flex-row">
            {subscribed ? (
              <div className="text-green-400 text-xs font-bold py-3 px-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                ✓ Thank you for subscribing to Damodar technical logs!
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  placeholder="Enter Corporate Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 lg:w-80 px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm min-h-[44px]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors uppercase tracking-wider text-xs min-h-[44px]"
                >
                  Subscribe
                </button>
              </>
            )}
          </form>
        </div>

        <div className="container-mobile">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-10 lg:gap-12 mb-16 text-left">

          {/* Corporate Profile / Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-3 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-lg inline-block">
                <img src={settings.logo} alt="Damodar Traders Logo" className="h-8 w-auto object-contain" />
              </div>
              <div>
                <h3 className="text-white font-black tracking-tight text-lg uppercase leading-none">
                  DAMODAR <span className="text-blue-500 font-extrabold text-sm block">TRADERS</span>
                </h3>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Supplying world-class piping components, structural steels, and process valves to India's major infrastructure projects since 2011. Committed to quality certificates and strict tolerances.
            </p>

            {/* Social Media Links */}
            <div className="flex gap-3 pt-2">
              {[
                { icon: Facebook, href: 'https://www.facebook.com', label: 'Facebook' },
                { icon: Twitter, href: 'https://www.twitter.com', label: 'Twitter' },
                { icon: Instagram, href: 'https://www.instagram.com', label: 'Instagram' },
                { icon: Linkedin, href: 'https://www.linkedin.com', label: 'LinkedIn' }
              ].map((soc, sIdx) => {
                const Icon = soc.icon;
                return (
                  <a
                    key={sIdx}
                    href={soc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit our ${soc.label} page`}
                    className="w-10 h-10 bg-slate-800 border border-slate-700/60 rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Solutions Column */}
          <div className="col-span-1 lg:col-span-3 space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-2 border-blue-600 pl-2">Solutions</h4>
            <ul className="space-y-2.5">
              {productLinks.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="text-slate-400 hover:text-blue-400 text-xs font-semibold flex items-center gap-1 group transition-colors">
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition-colors" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="col-span-1 lg:col-span-3 space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-2 border-blue-600 pl-2">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="text-slate-400 hover:text-blue-400 text-xs font-semibold flex items-center gap-1 group transition-colors">
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition-colors" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div className="col-span-1 lg:col-span-2 space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-2 border-blue-600 pl-2">Resources</h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={downloadCatalog}
                  className="text-slate-400 hover:text-blue-400 text-xs font-semibold flex items-center gap-1.5 group transition-colors border-none bg-transparent p-0 cursor-pointer min-h-0 min-w-0"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                  <span>Product Catalog PDF</span>
                </button>
              </li>
              <li>
                <Link to="/about#specs" className="text-slate-400 hover:text-blue-400 text-xs font-semibold flex items-center gap-1.5 group transition-colors">
                  <FileText className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                  <span>Technical Standards</span>
                </Link>
              </li>
              <li>
                <Link to="/about#certifications" className="text-slate-400 hover:text-blue-400 text-xs font-semibold flex items-center gap-1.5 group transition-colors">
                  <Award className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                  <span>ISO Certification</span>
                </Link>
              </li>
              <li>
                <Link to="/contact#faq" className="text-slate-400 hover:text-blue-400 text-xs font-semibold flex items-center gap-1.5 group transition-colors">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                  <span>FAQs & Support Help</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* 3. Address and Quick Contacts Hub */}
        <div className="border-t border-slate-800/80 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left text-xs text-slate-400">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-300 block mb-0.5">Corporate HQ</span>
              <span>1st floor, 37 Ellora plaza, 3, Maharani Rd, Indore, MP 452007</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-300 block mb-0.5">Contact Sales Helpdesk</span>
              <a href="tel:+919876543210" className="hover:text-white transition-colors">+91 98765 43210</a>
              <span className="block text-slate-500 mt-0.5">info@damodartraders.com</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-300 block mb-0.5">Depot Timings</span>
              <span>Mon - Fri: 9:00 AM - 6:00 PM</span>
              <span className="block text-slate-500 mt-0.5">Saturday: 9:00 AM - 4:00 PM</span>
            </div>
          </div>
        </div>

        {/* 4. Certifications & Copyright Footer bar */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">

          {/* ISO / GST Verification badges */}
          <div className="flex flex-wrap items-center gap-6 text-slate-500 text-xs font-semibold">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>ISO 9001:2015 Quality System</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
              <Award className="w-4 h-4 text-blue-500" />
              <span>GST Registered Corporate Supplies</span>
            </div>
          </div>

          {/* Copyright Info */}
          <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
            © {new Date().getFullYear()} DAMODAR TRADERS. ALL RIGHTS RESERVED.
          </p>

          {/* Legal / Policy Links */}
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
            <Link to="/privacy-policy" className="text-slate-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-conditions" className="text-slate-500 hover:text-white transition-colors">Terms of Supply</Link>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;