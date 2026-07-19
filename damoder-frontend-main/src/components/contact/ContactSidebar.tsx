import { 
  Phone, Mail, MapPin, Clock, ShieldCheck, 
  BadgeCheck, Award, FileText, Download 
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { downloadCatalog } from '@/utils/catalogHelper';

// Static Configuration Arrays (Issue 17: Moved outside component to prevent re-creation)
const CONTACT_PHONE_1 = import.meta.env.VITE_SALES_PHONE || '+91 99933 04543';
const CONTACT_PHONE_2 = import.meta.env.VITE_OFFICE_PHONE || '+91 731 4045430';
const CONTACT_EMAIL_1 = import.meta.env.VITE_CONTACT_EMAIL_1 || 'sales@damodartraders.com';
const CONTACT_EMAIL_2 = import.meta.env.VITE_CONTACT_EMAIL_2 || 'info@damodartraders.com';

const DIRECT_CHANNELS = [
  {
    icon: Phone,
    title: 'Call Hotline',
    details: [CONTACT_PHONE_1, CONTACT_PHONE_2],
    action: `tel:${CONTACT_PHONE_1.replace(/\s/g, '')}`,
    color: 'bg-blue-500/10 text-blue-600'
  },
  {
    icon: Mail,
    title: 'Email Hub',
    details: [CONTACT_EMAIL_1, CONTACT_EMAIL_2],
    action: `mailto:${CONTACT_EMAIL_1}`,
    color: 'bg-purple-500/10 text-purple-600'
  },
  {
    icon: MapPin,
    title: 'Indore Headquarters',
    details: ['37 Ellora Plaza, Maharani Road', 'Indore, MP 452007'],
    action: 'https://www.google.com/maps?q=37+Ellora+Plaza,+Maharani+Road,+Indore,+MP+452007',
    color: 'bg-orange-500/10 text-orange-600'
  }
] as const;

const TRUST_BADGES = [
  { icon: ShieldCheck, title: "ISO 9001:2015 Approved", desc: "Quality auditing and testing standards verified.", doc: "iso_certificate.pdf" },
  { icon: BadgeCheck, title: "GST Registered Billing", desc: "Complete transparency with corporate tax invoices.", doc: "gst_certificate.pdf" },
  { icon: Award, title: "BIS Standard Compliance", desc: "All fittings conform to industrial BIS parameters.", doc: "bis_certificate.pdf" },
  { icon: FileText, title: "Genuine Material Test Reports", desc: "MTC validation dispatched on custom sizes.", doc: "mtc_sample.pdf" }
] as const;

export function ContactSidebar() {
  return (
    <div className="space-y-6">
      {/* Direct Channels Contact Card */}
      <ScrollReveal direction="left" distance={40}>
        <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200 border border-slate-100">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest pb-2.5 border-b border-slate-100 mb-4">Direct Channels</h3>
          <div className="space-y-4">
            {DIRECT_CHANNELS.map((info) => (
              <a
                key={info.title}
                href={info.action}
                className="group flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className={`p-3 rounded-xl ${info.color} shadow-sm group-hover:scale-110 transition-transform`}>
                  <info.icon size={20} />
                </div>
                <div>
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{info.title}</h4>
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-slate-800 font-bold leading-tight text-xs sm:text-sm">{detail}</p>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Trust & Verification Badges Widget */}
      <ScrollReveal direction="left" delay={0.1} distance={40}>
        <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200 border border-slate-100 space-y-4">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest pb-2.5 border-b border-slate-100">Verification & Trust</h3>
          <div className="space-y-3">
            {TRUST_BADGES.map((badge, index) => (
              <div key={index} className="flex gap-3 items-start pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0 mt-0.5">
                  <badge.icon size={16} />
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wide">{badge.title}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-relaxed">{badge.desc}</p>
                  <a
                    href={`/documents/${badge.doc}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-0.5 text-[9px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Download size={10} />
                    Verify Document
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Download Catalog Link */}
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={downloadCatalog}
              type="button"
              className="w-full py-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 transition-colors border border-slate-150 rounded-xl flex items-center justify-center gap-1.5 font-black text-[10px] uppercase tracking-wider text-slate-700 cursor-pointer"
            >
              <Download size={13} />
              Download Catalog
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Working Hours Card */}
      <ScrollReveal direction="left" delay={0.2} distance={40}>
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
          <h3 className="text-sm font-black uppercase tracking-tight mb-4 flex items-center gap-2">
            <Clock className="text-blue-400 animate-pulse" size={16} />
            Operational Hours
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Monday - Saturday</span>
              <span className="font-bold">9:00 AM - 7:00 PM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Sunday</span>
              <span className="text-red-400 font-bold">Closed</span>
            </div>
          </div>
          <p className="mt-4 text-[10px] text-slate-400 leading-relaxed font-medium italic">
            * All technical specifications submitted after hours will be prioritized on the next business day.
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
}

export default ContactSidebar;
