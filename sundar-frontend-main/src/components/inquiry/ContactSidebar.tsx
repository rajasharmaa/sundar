import React from 'react';
import {
  Phone, Mail, MapPin, Clock,
  Linkedin, Twitter, Facebook, Instagram,
  ShieldCheck, Zap, Globe2, BarChart3,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ContactSidebarProps {
  companyInfo: {
    name: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    mapsEmbed: string;
  };
}

const ContactSidebar: React.FC<ContactSidebarProps> = ({ companyInfo }) => {
  return (
    <div className="space-y-6">
      {/* Compact Quick Tips */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-3.5 h-3.5 text-green-600" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Sourcing Optimization</h4>
        </div>
        <div className="space-y-3">
          {[
            "Specify material grades (e.g. SS304 vs SS316)",
            "Include estimated annual or monthly volume",
            "Mention critical delivery deadlines if any"
          ].map((tip, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-1 h-1 rounded-full bg-green-600 mt-1.5 shrink-0" />
              <p className="text-[11px] font-bold text-slate-500 leading-tight">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Stats Card */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-900/5">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Network Stats</h4>
          <BarChart3 size={14} className="text-slate-300" />
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-10">
          {[
            { value: "98%", label: "Fulfillment", sub: "Rate" },
            { value: "1.5k+", label: "Enterprise", sub: "Clients" },
            { value: "24h", label: "Response", sub: "SLA" },
            { value: "10k+", label: "Active", sub: "SKUs" }
          ].map((stat, i) => (
            <div key={i} className="group">
              <p className="text-3xl font-black text-slate-900 tracking-tighter group-hover:text-green-600 transition-colors">
                {stat.value}
              </p>
              <div className="mt-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact & Social Card */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/20 overflow-hidden relative">
        {/* Subtle decorative element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-600/10 rounded-full blur-3xl" />

        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 border-b border-white/5 pb-4 relative z-10">Direct Support</h4>

        <div className="space-y-6 relative z-10">
          {[
            {
              icon: <Phone size={18} />,
              label: "Technical Line",
              value: companyInfo.phone,
              href: `tel:${companyInfo.phone}`
            },
            {
              icon: <Mail size={18} />,
              label: "Inquiry Desk",
              value: companyInfo.email,
              href: `mailto:${companyInfo.email}`
            },
            {
              icon: <MapPin size={18} />,
              label: "Global HQ",
              value: companyInfo.address,
              isAddress: true
            }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 group">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all duration-300 text-slate-400">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="text-sm font-bold hover:text-green-400 transition-colors flex items-center gap-2">
                    {item.value}
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ) : (
                  <p className="text-sm font-bold leading-relaxed">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Social Icons */}
        <div className="mt-10 pt-8 border-t border-white/5 flex items-center gap-3 relative z-10">
          {[
            { Icon: Linkedin, label: 'LinkedIn' },
            { Icon: Twitter, label: 'Twitter' },
            { Icon: Facebook, label: 'Facebook' },
            { Icon: Instagram, label: 'Instagram' }
          ].map((item, i) => (
            <motion.a
              key={i}
              href="#"
              whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,1)', color: '#0f172a' }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 transition-all duration-300"
              title={item.label}
            >
              <item.Icon size={18} />
            </motion.a>
          ))}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex items-center justify-around px-2 pt-4 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
        <ShieldCheck size={20} />
        <Globe2 size={20} />
        <BarChart3 size={20} />
        <Clock size={20} />
      </div>
    </div>
  );
};

export default ContactSidebar;

