import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Phone, Mail, Navigation } from 'lucide-react';

const GoogleMapSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const address = "Panchmukhi Hanuman Mandir Rd, Musakhedi, Indore, MP 452001";
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.751187422998!2d75.8972986!3d22.7003189!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd23035fbbdb%3A0x6b107e33e4c4d5ab!2sMusakhedi%2C%20Indore%2C%20Madhya%20Pradesh%20452001!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin`;

  return (
    <section ref={containerRef} className="py-24 bg-white relative">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-stretch">
          
          {/* LEFT: Contact Info Card */}
          <div className="lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
              className="bg-[#0f172a] rounded-[2rem] p-8 md:p-12 h-full flex flex-col justify-between text-white shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#22c55e]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="relative z-10">
                <span className="text-[#22c55e] font-bold text-xs uppercase tracking-[0.2em] mb-4 block">
                  Headquarters
                </span>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-12">
                  Visit Our <br /> Facility
                </h2>

                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 shrink-0">
                      <MapPin className="w-6 h-6 text-[#22c55e]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Location</h4>
                      <p className="font-medium text-white/90 leading-relaxed">
                        {address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 shrink-0">
                      <Phone className="w-6 h-6 text-[#22c55e]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Call Us</h4>
                      <p className="font-medium text-white/90 leading-relaxed">
                        +91 98930 53053<br />
                        +91 98260 53653
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 shrink-0">
                      <Mail className="w-6 h-6 text-[#22c55e]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Email</h4>
                      <p className="font-medium text-white/90 leading-relaxed">
                        info@sundarcorp.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 relative z-10">
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-[#1ea850] text-white font-bold text-sm uppercase tracking-widest py-4 rounded-xl transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </a>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Map Iframe */}
          <div className="lg:w-2/3 min-h-[400px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full h-full rounded-[2rem] overflow-hidden shadow-lg border border-gray-100"
            >
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Sundar Corporation Location"
              ></iframe>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default GoogleMapSection;
