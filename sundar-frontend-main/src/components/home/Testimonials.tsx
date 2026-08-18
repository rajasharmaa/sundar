import { motion } from 'framer-motion';
import { Star, Quote, Building2 } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      company: 'UltraTech Cements',
      role: 'Purchasing Head',
      content: 'We have been using Sundar Corporation\'s HDPE bags for our bulk cement packaging. Their quality consistency and timely delivery have significantly improved our supply chain efficiency.',
      rating: 5,
    },
    {
      id: 2,
      name: 'Amit Sharma',
      company: 'AgroFert India',
      role: 'Operations Manager',
      content: 'The custom printed PP woven sacks provided by Sundar Corp have enhanced our brand visibility. Their team is very responsive and understands industrial requirements perfectly.',
      rating: 5,
    },
    {
      id: 3,
      name: 'Vikram Singh',
      company: 'Global Logistics',
      role: 'Director',
      content: 'Their FIBC jumbo bags are incredibly durable and meet international safety standards. We have zero complaints regarding load-bearing capacity.',
      rating: 5,
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-navy uppercase tracking-tight mb-6">
              Trusted by Industry <span className="text-[#00C878]">Leaders</span>
            </h2>
            <p className="text-gray-500 font-medium leading-relaxed">
              Our commitment to quality and service has made us the preferred packaging partner for top industrial brands across India.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <ScrollReveal key={t.id} delay={idx * 100}>
              <div className="bg-[#F5F7F6] p-8 rounded-2xl relative h-full flex flex-col transition-all hover:-translate-y-2 hover:shadow-xl border border-gray-100">
                <Quote className="absolute top-6 right-6 w-12 h-12 text-[#00C878]/10" />
                <div className="flex gap-1 mb-6">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 font-medium leading-relaxed mb-8 flex-1 italic">
                  "{t.content}"
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#00C878] shadow-sm border border-gray-100">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy">{t.name}</h4>
                    <p className="text-sm text-gray-500 font-medium">
                      {t.role}, <span className="text-[#00C878]">{t.company}</span>
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
