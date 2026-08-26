import React, { useRef } from 'react';
import { motion, animate, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '@/hooks/useSiteSettings';

// -- Typing Animation Components --
const LoopingTypewriter = ({ texts, typingSpeed = 100, deletingSpeed = 50, pauseTime = 2500 }: { texts: string[], typingSpeed?: number, deletingSpeed?: number, pauseTime?: number }) => {
  const [text, setText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [loopNum, setLoopNum] = React.useState(0);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    const current = texts[loopNum % texts.length];

    if (isDeleting) {
      timer = setTimeout(() => {
        setText(current.substring(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setLoopNum(loopNum + 1);
        }
      }, deletingSpeed);
    } else {
      timer = setTimeout(() => {
        setText(current.substring(0, text.length + 1));
        if (text.length === current.length) {
          timer = setTimeout(() => setIsDeleting(true), pauseTime);
        }
      }, typingSpeed);
    }
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, texts]);

  return <span>{text}</span>;
};

const BlinkingCursor = ({ delay = 0 }: { delay?: number }) => (
  <motion.span
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 1, 1, 0] }}
    transition={{ delay, duration: 1, repeat: Infinity, repeatType: "loop", times: [0, 0.1, 0.5, 0.6] }}
    className="inline-block w-[4px] h-[0.85em] bg-[#22c55e] ml-2 translate-y-[2px]"
  />
);

const AnimatedCounter = ({ from = 0, to }: { from?: number, to: number }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(nodeRef, { once: true, margin: "-100px" });

  React.useEffect(() => {
    if (inView && nodeRef.current) {
      const controls = animate(from, to, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate(value) {
          if (nodeRef.current) {
            nodeRef.current.textContent = Math.round(value).toString();
          }
        },
      });
      return () => controls.stop();
    }
  }, [from, to, inView]);

  return <span ref={nodeRef}>{from}</span>;
};

interface HeroSectionProps {
  companyInfo: any;
}

const HeroSection: React.FC<HeroSectionProps> = ({ companyInfo }) => {
  const { t } = useTranslation();
  const { settings } = useSiteSettings();

  const heroTitle = settings?.banners && settings.banners.length > 0 && settings.banners[0].title
    ? settings.banners[0].title
    : "Find Your Inspired Packaging Design";

  const heroSubtitle = settings?.banners && settings.banners.length > 0 && settings.banners[0].subtitle
    ? settings.banners[0].subtitle
    : "Whether it's custom printed BOPP bags or bulk PP woven sacks, we are always dedicated to bringing your vision to life.";

  const images = [
    "/hero/Screenshot 2026-08-14 161556.png",
    "/hero/Screenshot 2026-08-14 161646.png",
    "/hero/Screenshot 2026-08-14 162040.png",
    "/hero/Screenshot 2026-08-14 162244.png",
    "/hero/Screenshot 2026-08-14 185840.png"
  ];

  return (
    <section className="relative w-full bg-white overflow-hidden pb-10">

      {/* Top Cream Section */}
      <div className="relative bg-[#FDFBF7] pt-28 pb-12 px-6 flex flex-col items-center text-center z-20">

        {/* Subtle Animated Background Orbs */}
        <motion.div
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 md:left-32 w-32 h-32 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, 40, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-40 right-10 md:right-32 w-48 h-48 bg-[#0B2023]/5 rounded-full blur-3xl pointer-events-none"
        />

        {/* Gallery masks have been moved inside the gallery container */}

        <h1 className="text-4xl md:text-5xl lg:text-[4.2rem] font-serif font-bold text-[#0B2023] max-w-4xl leading-[1.15] mb-6 tracking-tight z-20">
          <span className="block">
            {heroTitle.split("Packaging")[0].trim()}
          </span>
          <span className="block min-h-[1.2em]">
            <LoopingTypewriter texts={["Packaging Design", "Custom Solutions", "BOPP Bags", "Woven Sacks"]} />
            <BlinkingCursor />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-sm md:text-base text-gray-500 max-w-xl mb-8 leading-relaxed font-medium z-20"
        >
          {heroSubtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative z-20 mb-4"
        >
          <Link
            to="/request-quote"
            className="group relative inline-flex items-center justify-center px-6 py-3 bg-[#0B2023] text-white rounded-full font-semibold text-sm hover:bg-[#12363b] hover:shadow-[0_0_20px_rgba(11,32,35,0.3)] transition-all duration-300 overflow-hidden"
          >
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"></div>

            <span className="relative z-10">Book A Consultation</span>
            <div className="relative z-10 ml-3 bg-white text-[#0B2023] rounded-full p-1 transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </motion.div>
      </div>

      {/* The Curved Gallery */}
      <div className="relative z-10 w-full bg-white flex justify-center items-center gap-2 md:gap-4 lg:gap-6 h-[55vw] md:h-[45vw] lg:h-[38vw] px-4 md:px-10 py-[12vw] md:py-[10vw] lg:py-[8vw]">

        {/* Top Smile Curve Mask */}
        <svg
          viewBox="0 0 1440 200"
          className="absolute top-0 left-0 w-full h-[12vw] md:h-[10vw] lg:h-[8vw] pointer-events-none z-20"
          preserveAspectRatio="none"
        >
          <path d="M0,0 Q720,200 1440,0 Z" fill="#FDFBF7"></path>
        </svg>

        {images.map((img, index) => {
          let curveClass = "";
          if (index === 0 || index === 4) curveClass = "-translate-y-[6vw] md:-translate-y-[5vw] lg:-translate-y-[4vw]";
          else if (index === 1 || index === 3) curveClass = "translate-y-[0vw]";
          else curveClass = "translate-y-[6vw] md:translate-y-[5vw] lg:translate-y-[4vw]";

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
              className={`group flex-1 relative h-full cursor-pointer bg-transparent ${curveClass}`}
            >
              <motion.div
                animate={{ y: ["0%", "-4%", "0%"] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.5,
                }}
                className="w-full h-full"
              >
                <img
                  src={img}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110"
                />
              </motion.div>
            </motion.div>
          );
        })}

        {/* Bottom Smile Curve Mask */}
        <svg
          viewBox="0 0 1440 200"
          className="absolute bottom-0 left-0 w-full h-[12vw] md:h-[10vw] lg:h-[8vw] pointer-events-none z-20"
          preserveAspectRatio="none"
        >
          <path d="M0,0 Q720,200 1440,0 L1440,200 L0,200 Z" fill="#FDFBF7"></path>
        </svg>
      </div>

      {/* Statistics Section */}
      <div className="relative z-20 w-full bg-[#FDFBF7] pt-10 lg:pt-16">

        {/* Stats Grid */}
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center pb-12">

          <div className="flex flex-col items-center">
            <div className="text-5xl lg:text-7xl font-bold text-[#0B2023] flex items-center justify-center tracking-tighter">
              <AnimatedCounter to={260} /><span className="text-[#22c55e] font-medium ml-1">+</span>
            </div>
            <div className="text-[11px] font-bold text-[#0B2023] uppercase tracking-[0.1em] mt-4 mb-2">
              PROJECT COMPLETED
            </div>
            <p className="text-[11px] text-gray-500 max-w-[200px] leading-relaxed">
              Over 200 successful projects completed, showcasing our extensive experience and portfolio.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-5xl lg:text-7xl font-bold text-[#0B2023] flex items-center justify-center tracking-tighter">
              <AnimatedCounter to={15} /><span className="text-[#22c55e] font-medium ml-1">+</span>
            </div>
            <div className="text-[11px] font-bold text-[#0B2023] uppercase tracking-[0.1em] mt-4 mb-2">
              YEARS OF EXPERTISE
            </div>
            <p className="text-[11px] text-gray-500 max-w-[200px] leading-relaxed">
              Over 200 successful projects completed, showcasing our extensive experience and portfolio.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-5xl lg:text-7xl font-bold text-[#0B2023] flex items-center justify-center tracking-tighter">
              <AnimatedCounter to={15} /><span className="text-[#22c55e] font-medium ml-1">+</span>
            </div>
            <div className="text-[11px] font-bold text-[#0B2023] uppercase tracking-[0.1em] mt-4 mb-2">
              HAPPY CLIENTS
            </div>
            <p className="text-[11px] text-gray-500 max-w-[200px] leading-relaxed">
              Proudly serving more than 150 satisfied clients who have trusted us with their packaging needs.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
