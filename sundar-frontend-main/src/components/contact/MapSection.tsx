import { MapPin, ExternalLink } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

export function MapSection() {
  return (
    <ScrollReveal delay={0.2} distance={40}>
      <div className="bg-white rounded-2xl p-4 shadow-2xl shadow-slate-200 border border-slate-100">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2.5 bg-green-600 text-white rounded-lg shadow-lg shadow-green-600/20">
                <MapPin size={18} />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Our Hub.</h3>
            </div>
            <p className="text-slate-600 text-xs font-semibold mb-6 leading-relaxed">
              Visit our flagship showroom and distribution center in the heart of Indore's industrial district.
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Location Coordinates</p>
                <p className="text-slate-800 font-bold text-xs">Panchmukhi Hanuman Mandir Rd, Musakhedi, Indore, MP 452001</p>
              </div>
              <a
                href="https://www.google.com/maps?q=22.6802222,75.9127778"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-white border-2 border-slate-100 text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-xl hover:border-green-600 hover:text-green-600 transition-all flex items-center justify-center gap-1.5"
              >
                Open in Maps
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
          <div className="lg:col-span-2 h-[350px] rounded-xl overflow-hidden border border-slate-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3681.45!2d75.9127778!3d22.6802222!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDQwJzQ4LjgiTiA3NcKwNTQnNDYuMCJF!5e0!3m2!1sen!2sin!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale hover:grayscale-0 transition-all duration-700"
              title="Indore Showroom Google Maps Location"
            ></iframe>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

export default MapSection;
