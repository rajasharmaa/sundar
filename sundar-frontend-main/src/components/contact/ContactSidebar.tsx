import {
  Phone, Mail, MapPin, Clock
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
// Static Configuration Arrays (Issue 17: Moved outside component to prevent re-creation)
const CONTACT_PHONE_1 = import.meta.env.VITE_SALES_PHONE || '+91 98930 53053';
const CONTACT_PHONE_2 = import.meta.env.VITE_OFFICE_PHONE || '+91 98260 53653';
const CONTACT_EMAIL_1 = import.meta.env.VITE_CONTACT_EMAIL_1 || 'sundarcorporation@yahoo.com';

const DIRECT_CHANNELS = [
  {
    icon: Phone,
    title: 'Call Hotline',
    details: [CONTACT_PHONE_1, CONTACT_PHONE_2],
    action: `tel:${CONTACT_PHONE_1.replace(/\s/g, '')}`,
    color: 'bg-green-500/10 text-green-600'
  },
  {
    icon: Mail,
    title: 'Email Hub',
    details: [CONTACT_EMAIL_1],
    action: `mailto:${CONTACT_EMAIL_1}`,
    color: '-green- -green-'
  },
  {
    icon: MapPin,
    title: 'Indore Headquarters',
    details: ['Panchmukhi Hanuman Mandir Rd', 'Musakhedi, Indore, MP 452001'],
    action: 'https://www.google.com/maps?q=22.6802222,75.9127778',
    color: 'bg-industrial/10 text-industrial'
  }
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


      {/* Working Hours Card */}
      <ScrollReveal direction="left" delay={0.2} distance={40}>
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
          <h3 className="text-sm font-black uppercase tracking-tight mb-4 flex items-center gap-2">
            <Clock className="text-green-400 animate-pulse" size={16} />
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
