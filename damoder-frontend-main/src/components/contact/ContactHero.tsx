import { Sparkles } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

// Static procurement benefits list
const HERO_STATS = [
  { val: "Est. 2011", desc: "Industrial Legacy" },
  { val: "Certified", desc: "Quality Standards" },
  { val: "Ready Stock", desc: "Indore Distribution" },
  { val: "PAN-India", desc: "Logistics Partners" }
] as const;

export function ContactHero() {
  return (
    <div className="relative bg-slate-900 text-white rounded-2xl px-6 sm:px-10 py-10 sm:py-12 overflow-hidden mb-8 shadow-2xl border border-slate-800">
      {/* Visual Accents */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center space-y-4">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles size={14} className="text-blue-400 animate-pulse" />
            Industrial Sourcing Desk
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
            Sourcing & Custom <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Fitting Quotes</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto font-medium leading-relaxed">
            Transmit your custom material sizing lists, fittings parameters, and valve requirements directly to our commercial desk. Get custom estimates compiled in real-time.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 max-w-3xl mx-auto">
            {HERO_STATS.map((stat, i) => (
              <div
                key={i}
                className="p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="text-lg sm:text-xl font-black text-blue-400">{stat.val}</div>
                <div className="text-[8px] text-slate-400 uppercase tracking-widest font-black mt-0.5">{stat.desc}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

export default ContactHero;
