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
    { name: 'HDPE Bags', path: '/products?category=hdpe' },
    { name: 'PP Woven Sacks', path: '/products?category=pp' },
    { name: 'BOPP Bags', path: '/products?category=bopp' },
    { name: 'FIBC Jumbo Bags', path: '/products?category=fibc' },
    { name: 'Packaging Accessories', path: '/products?category=other' },
  ];

  const companyLinks = [
    { name: 'About Sundar Corporation', path: '/about' },
    { name: 'Custom Manufacturing', path: '/custom-manufacturing' },
    { name: 'Blog & Insights', path: '/blog' },
    { name: 'FAQ', path: '/faq' },
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
    <footer className="bg-[#0B2023] text-[#FDFBF7]/90 pt-20 pb-28 lg:pb-12 border-t border-[#FDFBF7]/10 relative z-20 overflow-hidden">

      {/* Decorative radial glows for premium vibe */}
      <div className="absolute top-0 left-1/4 w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] bg-[#22c55e]/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] bg-amber-500/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">


        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-10 lg:gap-12 mb-16 text-left">

          {/* Corporate Profile / Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-3 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-lg inline-block">
                <img src={settings.logo} alt="Sundar Corporation Logo" className="h-8 w-auto object-contain" />
              </div>
              <div>
                <h3 className="text-white font-black tracking-tight text-lg uppercase leading-none">
                  Sundar Corporation <span className="text-[#22c55e] font-extrabold text-sm block">PACKAGING SOLUTIONS</span>
                </h3>
              </div>
            </div>

            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              Supplying world-class BOPP, PP woven, and FIBC bulk bags to India's major agricultural and industrial sectors since 2017. Committed to high load tolerances and quality compliance.
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
                    className="w-11 h-11 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-white/70 hover:bg-[#22c55e] hover:text-white hover:border-[#22c55e] transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Solutions Column */}
          <div className="col-span-1 lg:col-span-3 space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-2 border-[#22c55e] pl-2">Solutions</h4>
            <ul className="space-y-2.5">
              {productLinks.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="text-white/70 hover:text-[#22c55e] text-xs font-semibold flex items-center gap-1 group transition-colors py-2">
                    <ChevronRight className="w-3 h-3 text-white/40 group-hover:text-[#22c55e] transition-colors" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="col-span-1 lg:col-span-3 space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-2 border-[#22c55e] pl-2">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="text-white/70 hover:text-[#22c55e] text-xs font-semibold flex items-center gap-1 group transition-colors py-2">
                    <ChevronRight className="w-3 h-3 text-white/40 group-hover:text-[#22c55e] transition-colors" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div className="col-span-1 lg:col-span-2 space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-2 border-[#22c55e] pl-2">Resources</h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={downloadCatalog}
                  className="text-white/70 hover:text-[#22c55e] text-xs font-semibold flex items-center gap-1.5 group transition-colors border-none bg-transparent p-0 py-2 cursor-pointer min-h-0 min-w-0"
                >
                  <Download className="w-3.5 h-3.5 text-white/50 group-hover:text-[#22c55e]" />
                  <span>Product Catalog PDF</span>
                </button>
              </li>
              <li>
                <Link to="/about#specs" className="text-white/70 hover:text-[#22c55e] text-xs font-semibold flex items-center gap-1.5 group transition-colors py-2">
                  <FileText className="w-3.5 h-3.5 text-white/50 group-hover:text-[#22c55e]" />
                  <span>Technical Standards</span>
                </Link>
              </li>
              <li>
                <Link to="/about#certifications" className="text-white/70 hover:text-[#22c55e] text-xs font-semibold flex items-center gap-1.5 group transition-colors py-2">
                  <Award className="w-3.5 h-3.5 text-white/50 group-hover:text-[#22c55e]" />
                  <span>ISO Certification</span>
                </Link>
              </li>
              <li>
                <Link to="/contact#faq" className="text-white/70 hover:text-[#22c55e] text-xs font-semibold flex items-center gap-1.5 group transition-colors py-2">
                  <HelpCircle className="w-3.5 h-3.5 text-white/50 group-hover:text-[#22c55e]" />
                  <span>FAQs & Support Help</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* 3. Address and Quick Contacts Hub */}
        <div className="border-t border-white/10 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left text-xs text-white/70">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#22c55e] mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-white block mb-0.5">Corporate HQ</span>
              <span>Panchmukhi Hanuman Mandir Rd, Musakhedi, Indore, MP 452001</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-[#22c55e] mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-white block mb-0.5">Contact Sales Helpdesk</span>
              <a href="tel:+919893053053" className="hover:text-[#22c55e] transition-colors block">+91 98930 53053 (Harish Singhal)</a>
              <a href="tel:+919826053653" className="hover:text-[#22c55e] transition-colors block">+91 98260 53653 (Pravesh Singhal)</a>
              <a href="mailto:sundarcorporation@yahoo.com" className="block text-white/50 mt-0.5 hover:text-[#22c55e] transition-colors">sundarcorporation@yahoo.com</a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-[#22c55e] mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-white block mb-0.5">Depot Timings</span>
              <span>Mon - Fri: 9:00 AM - 6:00 PM</span>
              <span className="block text-white/50 mt-0.5">Saturday: 9:00 AM - 4:00 PM</span>
            </div>
          </div>
        </div>

        {/* 4. Certifications & Copyright Footer bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">

          {/* ISO / GST Verification badges */}
          <div className="flex flex-wrap items-center gap-6 text-white/60 text-xs font-semibold">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
              <span>ISO 9001:2015 Quality System</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              <Award className="w-4 h-4 text-[#22c55e]" />
              <span>GST Registered Corporate Supplies</span>
            </div>
          </div>

          {/* Copyright Info */}
          <p className="text-[10px] font-bold text-white/40 tracking-wider uppercase">
            © {new Date().getFullYear()} Sundar Corporation. ALL RIGHTS RESERVED.
          </p>

          {/* Legal / Policy Links */}
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
            <Link to="/privacy-policy" className="text-white/40 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-conditions" className="text-white/40 hover:text-white transition-colors">Terms of Supply</Link>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
