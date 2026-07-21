import { useEffect, useRef, useState, useCallback, useMemo, lazy, Suspense } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Phone, Mail, MapPin, Star, Award, Shield,
  Truck, Users, Target, Eye, Clock, Factory, Building,
  CheckCircle, MessageSquare, Search, Zap, Sparkles, Monitor,
  Layout, Globe, Calendar, ArrowRight, ExternalLink, Play, Pause,
  ChevronLeft, Package, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import TypewriterText from '@/components/TypewriterText';
import InteractiveStats from '@/components/InteractiveStats';
import { useAnimationCleanup, useMountedRef } from '@/lib/memory-leak-prevention';
import { api } from '@/services/api/api-client';
import logger from '@/lib/logger';
import MouseParticles from '@/components/MouseParticles';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO/MetaTags';
import { Product } from '@/types';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import BannerCarousel from '@/components/BannerCarousel';

// Lazy load components
const MediaGallery = lazy(() => import('@/components/MediaGallery'));
const ShopSlider = lazy(() => import('@/components/ShopSlider'));
const FeaturedProductsSlider = lazy(() => import('@/components/FeaturedProductsSlider'));

interface HomepageCategory {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  productCount?: number;
  trending?: boolean;
  productImages?: string[];
}

const isSafeImage = (url?: string): boolean => {
  if (!url) return false;
  return /^\//.test(url) || /^https?:\/\//.test(url);
};

const CategorySlideshow = ({ category, index }: { category: HomepageCategory, index: number }) => {
  const images = category.productImages && category.productImages.length > 0 
    ? category.productImages 
    : (isSafeImage(category.image) ? [category.image] : ['/placeholder.svg']);
    
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      // Pick a random image instead of sequential
      setCurrentIdx(prev => {
        let nextIdx;
        do {
          nextIdx = Math.floor(Math.random() * images.length);
        } while (nextIdx === prev && images.length > 1);
        return nextIdx;
      });
    }, 3500 + (index * 700)); // Randomize stagger
    
    return () => clearInterval(interval);
  }, [images.length, index]);

  // For very large sets, only render a subset to prevent DOM bloat
  const displayImages = images.slice(0, 10);

  return (
    <>
      {displayImages.map((img, i) => (
        <img
          key={img + i}
          src={img}
          alt={category.name}
          width={420}
          height={256}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ${i === currentIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          loading={index === 0 && i === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />
      ))}
    </>
  );
};

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const Index = () => {
  const { t } = useTranslation();
  const { settings } = useSiteSettings();
  const heroRef = useRef<HTMLDivElement>(null);
  const whyChooseUsRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const isMounted = useMountedRef();
  const statsRef = useRef<(HTMLDivElement | null)[]>([]);
  const featuresRef = useRef<(HTMLDivElement | null)[]>([]);
  const categoryCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const scrollCleanupRef = useRef<boolean>(false);
  const { addAnimation, killAnimations } = useAnimationCleanup(() => {
    ScrollTrigger.getAll().forEach(t => t.kill());
  });

  const [categories, setCategories] = useState<HomepageCategory[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  // Fetch dynamic data from API
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);
        const [cats, prods] = await Promise.all([
          api.categories.getAll(),
          // Fetch all products so we can filter featured ones correctly
          api.products.getAll()
        ]);

        const prodList = Array.isArray(prods) ? prods : (prods as any)?.data || [];
        
        if (Array.isArray(cats)) {
          const enrichedCats = cats.map(cat => {
            const catProds = prodList.filter(p => {
              if (typeof p.category === 'string') return p.category === cat._id || p.category === cat.name;
              return p.category?._id === cat._id || p.category?.name === cat.name;
            });
            const allImages = catProds.flatMap(p => p.images || (p.image ? [p.image] : [])).filter(isSafeImage);
            return {
              ...cat,
              productImages: allImages.length > 0 ? allImages : undefined
            };
          });
          setCategories(enrichedCats);
        }
        
        // Filter for featured products that were explicitly ticked
        const featuredProds = prodList.filter(p => p.featured === true);
        setFeaturedProducts(featuredProds.slice(0, 8)); // Show top 8
      } catch (err) {
        logger.error('Failed to fetch home data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const companyInfo = {
    name: 'Damodar Traders',
    phone: '+91 9876543210',
    since: 2011,
    address: '1st floor, 37 Ellora plaza, 3, Maharani Rd, Indore, Madhya Pradesh 452007',
    workingHours: {
      weekdays: '9:00 AM - 6:00 PM',
      saturday: '9:00 AM - 4:00 PM'
    },
    stats: {
      clients: '1500+',
      products: '5000+',
      experience: '12+',
      awards: '25+',
      corporateClients: '500+',
      rating: '4.9/5',
      repeatBusiness: '98%'
    }
  };

  const heroTexts = [
    t('home.heroText1'),
    t('home.heroText2'),
    t('home.heroText3', { count: companyInfo.stats.clients }),
    t('home.heroText4')
  ];

  const sectionTitles = [
    'Why Choose Damodar Traders',
    'Unmatched Quality Standards',
    'Reliable Industrial Solutions',
    'Customer-First Approach'
  ];

  const categoriesTitles = [
    'Our Industrial Solutions',
    'Premium Quality Products',
    'Industry-Grade Materials',
    'Expert Engineering Solutions'
  ];

  const stats = [
    { icon: Users, value: companyInfo.stats.clients, label: t('home.happyClients'), color: 'text-blue-600' },
    { icon: Package, value: companyInfo.stats.products, label: t('home.products'), color: 'text-green-600' },
    { icon: Clock, value: companyInfo.stats.experience, label: t('home.yearsExperience'), color: 'text-purple-600' },
    { icon: Award, value: companyInfo.stats.awards, label: t('home.industryAwards'), color: 'text-amber-600' }
  ];

  const features = [
    { icon: Shield, title: t('home.qualityCertified'), description: t('home.qualityCertifiedDesc') },
    { icon: Truck, title: t('home.fastDelivery'), description: t('home.fastDeliveryDesc') },
    { icon: MessageSquare, title: t('home.support247'), description: t('home.support247Desc') },
    { icon: Award, title: t('home.industryLeader'), description: t('home.industryLeaderDesc', { year: companyInfo.since }) }
  ];
  const filteredCategories = categories.filter(cat => {
    if (!cat) return false;
    const name = cat.name || '';
    const description = cat.description || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === 'trending') return matchesSearch && cat.trending;
    return matchesSearch;
  });


  useEffect(() => {
    if (scrollCleanupRef.current) return;
    scrollCleanupRef.current = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return () => {
        scrollCleanupRef.current = false;
      };
    }

    const ctx = gsap.context(() => {
      // Desktop animations
      if (window.innerWidth > 768) {
        // Hero Parallax
        gsap.fromTo(heroRef.current,
          { y: 0 },
          {
            y: -50,
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true
            }
          }
        );

        // Section-based animations
        statsRef.current.forEach((el, i) => {
          if (el) {
            gsap.from(el, {
              y: 30,
              opacity: 0,
              duration: 0.6,
              delay: i * 0.1,
              scrollTrigger: {
                trigger: el,
                start: 'top 80%',
                once: true
              }
            });
          }
        });

        featuresRef.current.forEach((el, i) => {
          if (el) {
            gsap.from(el, {
              y: 40,
              opacity: 0,
              duration: 0.6,
              delay: i * 0.1,
              scrollTrigger: {
                trigger: whyChooseUsRef.current,
                start: 'top 70%',
                once: true
              }
            });
          }
        });

        gsap.from(ctaRef.current, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 80%',
            once: true
          }
        });
      }

      // Floating elements
      const floating = gsap.to('.floating-element', {
        y: 10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.2
      });
      addAnimation(floating);
    });

    return () => {
      scrollCleanupRef.current = false;
      killAnimations();
      ctx.revert();
    };
  }, [killAnimations, addAnimation]);

  // Bulletproof 3D Card Stack "Fan Spread" Animation
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return () => {};
    }

    let ctx: gsap.Context | null = null;
    const timeout = setTimeout(() => {
      ctx = gsap.context(() => {
        const validCount = Math.min(filteredCategories.length, 5);
        const cards = categoryCardsRef.current.slice(0, validCount).filter(el => el != null);

        if (cards.length === 0) return;

        gsap.set(cards, { clearProps: "all" });

        if (window.innerWidth < 1024) {
          // On mobile/tablet, reset opacity and position to default CSS flow
          gsap.set(cards, { opacity: 1, position: 'relative' });
          return;
        }

        gsap.set(cards, {
          opacity: (i) => i === 0 ? 1 : 0,
          scale: 1,
          y: 0,
          x: 0,
          rotate: 0,
          zIndex: (i) => cards.length - i,
          transformOrigin: "bottom center"
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: categoriesRef.current,
            start: 'top top',
            end: `+=${Math.min(cards.length * 300, 2500)}`,
            pin: true,
            scrub: 1.5,
            invalidateOnRefresh: true,
          }
        });

        const isMobile = window.innerWidth < 768;
        cards.forEach((card, i) => {
          if (i === 0) return;

          const angle = (i % 2 === 0 ? 1 : -1) * Math.ceil(i / 2) * (isMobile ? 10 : 15);
          const xOffset = (i % 2 === 0 ? 1 : -1) * Math.ceil(i / 2) * (isMobile ? 50 : 120);
          const yOffset = Math.ceil(i / 2) * (isMobile ? 20 : 40);

          tl.to(card, {
            rotate: angle,
            x: xOffset,
            y: yOffset,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
          }, "fanOut");
        });

        cards.forEach((card, i) => {
          tl.to(card, {
            y: window.innerHeight + 200,
            rotate: (i % 2 === 0 ? 45 : -45),
            opacity: 0,
            scale: 0.8,
            duration: 1,
            ease: "power1.in",
          }, `drop${i}`);
        });
      }, categoriesRef);
    }, 150);

    return () => {
      clearTimeout(timeout);
      if (ctx) {
        ctx.revert();
      }
    };
  }, [filteredCategories]);

  return (
    <>
      <SEO
        title="Damodar Traders - Premium CI & GI Pipe Fittings | Industrial Solutions"
        description={`Leading manufacturer of high-quality CI & GI pipe fittings, industrial valves, and pipe solutions since ${companyInfo.since}. ISO certified with ${companyInfo.stats.clients} satisfied clients.`}
        keywords="pipe fittings, CI pipes, GI pipes, industrial valves, foot valves, pipe manufacturers, industrial suppliers"
        canonical="https://damodartraders.com"
        image="https://damodartraders.com/logo.jpg"
        og={{
          title: "Damodar Traders - Premium CI & GI Pipe Fittings | Industrial Solutions",
          description: `Leading manufacturer of high-quality CI & GI pipe fittings, industrial valves, and pipe solutions since ${companyInfo.since}. ISO certified with ${companyInfo.stats.clients} satisfied clients.`,
          image: "https://damodartraders.com/logo.jpg"
        }}
        twitter={{
          card: "summary_large_image",
          title: "Damodar Traders - Premium CI & GI Pipe Fittings | Industrial Solutions",
          description: `Leading manufacturer of high-quality CI & GI pipe fittings, industrial valves, and pipe solutions since ${companyInfo.since}.`,
          image: "https://damodartraders.com/logo.jpg"
        }}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": companyInfo.name,
          "image": "https://damodartraders.com/logo.jpg",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": companyInfo.address.split(',')[0],
            "addressLocality": "Indore",
            "addressRegion": "Madhya Pradesh",
            "postalCode": "452007",
            "addressCountry": "IN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 22.717964,
            "longitude": 75.857387
          },
          "url": "https://damodartraders.com",
          "telephone": companyInfo.phone,
          "priceRange": "₹₹",
          "openingHours": [
            "Mo-Fr 09:00-18:00",
            "Sa 09:00-16:00"
          ],
          "founder": "Damodar Prasad Sharma",
          "foundingDate": companyInfo.since.toString(),
          "awards": "ISO 9001 Certified",
          "sameAs": [
            "https://www.facebook.com/damodartraders",
            "https://www.instagram.com/damodartraders"
          ]
        }}
      />

      <IndustrialBackground />
      <Navbar />

      <main className="relative z-10 overflow-hidden pb-[100px] lg:pb-0 space-y-6 xs:space-y-8 sm:space-y-12">
        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20">
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>

            {/* Interactive Mouse Particles (Antigravity Style) */}
            <MouseParticles />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 py-8 xs:py-12 sm:py-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 xs:px-4 xs:py-2 bg-blue-50/80 backdrop-blur-sm rounded-full mb-6 xs:mb-8 border border-blue-100 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-blue-600" aria-hidden="true" />
                <span className="text-xs xs:text-sm font-bold text-blue-700">{t('home.excellenceSince', { year: companyInfo.since })}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                id="head"
                className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black mb-6 xs:mb-8 tracking-tight"
              >
                <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-blue-700 bg-clip-text text-transparent">
                  {t('nav.home') === 'Home' ? companyInfo.name : 'दामोदर ट्रेडर्स'}
                </span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                id="head1"
                className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-6 xs:mb-8 min-h-[70px] xs:min-h-[75px] sm:min-h-[85px] md:min-h-[95px] flex items-center justify-center w-full max-w-4xl mx-auto"
              >
                <TypewriterText
                  texts={heroTexts}
                  speed={80}
                  delay={1500}
                  cursorColor="text-blue-600"
                  className="text-center"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="max-w-3xl mx-auto space-y-4 xs:space-y-6 mb-8 xs:mb-10 sm:mb-12"
              >
                <p className="pera1 text-base xs:text-lg md:text-xl text-gray-600 leading-relaxed px-4">
                  {t('home.establishedDesc', { year: companyInfo.since, name: t('nav.home') === 'Home' ? companyInfo.name : 'दामोदर ट्रेडर्स' })}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="hero-cta flex flex-col xs:flex-row gap-5 justify-center items-center mt-8 xs:mt-10 sm:mt-12 px-4 w-full max-w-2xl"
              >
                <Link to="/products" className="group w-full xs:w-auto px-10 py-4 bg-blue-600 text-white font-black rounded-full hover:bg-blue-700 transition-all duration-300 shadow-xl hover:shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 uppercase tracking-wider text-sm">
                  <span>{t('home.exploreProducts')}</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" aria-hidden="true" />
                </Link>
                <Link to="/contact" className="group w-full xs:w-auto px-10 py-4 bg-white border-2 border-gray-200 text-gray-900 font-black rounded-full hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 uppercase tracking-wider text-sm">
                  <span>{t('home.getQuote')}</span>
                  <Phone className="w-5 h-5" aria-hidden="true" />
                </Link>
              </motion.div>
            </motion.div>
          </div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 scroll-indicator">
            <ChevronRight className="w-6 h-6 text-blue-600 animate-bounce rotate-90" aria-hidden="true" />
          </div>
        </section>

        {/* Stats Section - ASSEMBLY EFFECT */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="py-12 xs:py-16 sm:py-20 bg-gradient-to-b from-white to-blue-50"
        >
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 lg:gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  ref={(el) => (statsRef.current[i] = el)}
                  variants={itemVariants}
                  className="text-center p-4 xs:p-5 sm:p-6 bg-white rounded-xl xs:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col justify-center border border-gray-100"
                >
                  <div className="flex justify-center mb-2 xs:mb-3">
                    <div className="p-2 xs:p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg xs:rounded-xl">
                      <stat.icon className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 text-blue-600" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="text-2xl xs:text-3xl sm:text-4xl font-black text-gray-900 mb-1 xs:mb-2 tracking-tighter">{stat.value}</div>
                  <div className="text-[10px] xs:text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-widest px-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Why Choose Us - ASSEMBLY EFFECT */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="py-24 bg-white relative overflow-hidden"
        >
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 relative z-10">
            <motion.div variants={itemVariants} className="text-center mb-20">
              <h2 className="text-3xl xs:text-4xl md:text-7xl font-black text-gray-900 mb-6 px-4 leading-none tracking-tighter uppercase">
                {t('home.whyChooseUs')}
              </h2>
              <p className="text-lg xs:text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto px-4 leading-relaxed font-semibold">
                {t('home.whyChooseUsDesc')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  ref={(el) => (featuresRef.current[i] = el)}
                  variants={itemVariants}
                  whileHover={{ y: -15, rotate: 1 }}
                  className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-[0_15px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_80px_rgba(37,99,235,0.1)] transition-all duration-700 group h-full flex flex-col relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                  <div className="inline-flex p-5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-8 group-hover:rotate-12 transition-transform duration-500 shadow-xl shadow-blue-200 relative z-10">
                    <feature.icon className="w-10 h-10 text-white" aria-hidden="true" />
                  </div>

                  <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tighter relative z-10">{feature.title}</h3>
                  <p className="text-base text-gray-600 font-medium leading-relaxed mb-8 relative z-10">{feature.description}</p>

                  <div className="mt-auto pt-8 border-t border-gray-50 flex items-center justify-between relative z-10">
                    <span className="text-xs font-black text-blue-600 tracking-widest uppercase">Expertise</span>
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Dynamic Banners - Middle Placement */}
        {settings?.banners && settings.banners.filter(b => b.isActive && b.image && (b.placement === 'home_middle' || !b.placement)).length > 0 && (
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 py-8">
            <BannerCarousel banners={settings.banners.filter(b => b.placement === 'home_middle' || !b.placement)} />
          </div>
        )}

        {/* Categories Section - 3D SWAP EFFECT */}
        <section ref={categoriesRef} className="py-32 bg-gray-900 relative overflow-hidden">
          {/* Background Accents */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-blue-600/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-cyan-600/10 rounded-full blur-[80px]" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row gap-20 items-center">

              {/* Left Side: Info & Filters */}
              <div className="lg:w-1/2">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-4xl md:text-7xl font-black text-white mb-8 leading-none tracking-tighter uppercase">
                    {t('home.ourSolutions')}
                  </h2>
                  <p className="text-xl text-gray-400 font-medium mb-12 max-w-xl">
                    {t('home.ourSolutionsDesc')}
                  </p>

                  {/* Modern Filter Tabs */}
                  <div className="flex gap-4 mb-12">
                    {['all', 'trending'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveCategory(tab)}
                        className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeCategory === tab ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                      >
                        {tab === 'all' ? t('home.allProducts') : t('home.trending')}
                      </button>
                    ))}
                  </div>

                  <div className="relative max-w-md group">
                    <label htmlFor="category-search" className="sr-only">
                      {t('home.searchSolutions')}
                    </label>
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      id="category-search"
                      type="text"
                      placeholder={t('home.searchSolutions')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 rounded-[2rem] text-white focus:outline-none focus:border-blue-500 transition-all backdrop-blur-md"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Right Side: 3D Card Stack Swap */}
              <div className="lg:w-1/2 relative min-h-[550px] w-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0 mt-12 lg:mt-0">
                {isLoading ? (
                  <div className="w-full max-w-[420px] bg-white/5 p-10 rounded-[3rem] border border-white/10 animate-pulse">
                    <div className="w-full h-64 bg-white/10 rounded-[3.5rem] mb-8" />
                    <div className="h-6 w-3/4 bg-white/10 rounded-full mb-4" />
                    <div className="h-4 w-full bg-white/10 rounded-full mb-2" />
                    <div className="h-4 w-5/6 bg-white/10 rounded-full mb-8" />
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        {[...Array(3)].map((_, j) => (
                          <div key={j} className="w-8 h-8 rounded-full bg-white/10" />
                        ))}
                      </div>
                      <div className="h-12 w-12 bg-white/10 rounded-2xl" />
                    </div>
                  </div>
                ) : filteredCategories.length > 0 ? (
                  filteredCategories.slice(0, 5).map((category, i) => (
                    <div
                      key={category._id || category.id || category.name || i}
                      ref={(el) => (categoryCardsRef.current[i] = el)}
                      className="lg:absolute relative w-full max-w-[420px] will-change-transform"
                    >
                      <Link to={`/products?category=${category._id || category.id || category.slug || category.name?.toLowerCase().replace(/\s+/g, '-')}`} className="block">
                        <div className="bg-white rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl group border border-white/50">
                          <div className="relative h-56 sm:h-64 overflow-hidden">
                          <CategorySlideshow category={category} index={i} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            {category.trending && (
                              <div className="absolute top-6 left-6 bg-orange-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                TRENDING
                              </div>
                            )}
                            <div className="absolute bottom-6 left-6 text-white">
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{t('home.collection')}</span>
                              <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">{category.name}</h3>
                            </div>
                          </div>
                          <div className="p-10">
                            <p className="text-gray-600 font-medium mb-8 line-clamp-2">{category.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex -space-x-2">
                                {[...Array(3)].map((_, j) => (
                                  <div key={j} className="w-8 h-8 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center">
                                    <div className="w-4 h-4 bg-blue-600 rounded-full" />
                                  </div>
                                ))}
                                <div className="pl-4 text-xs font-black text-blue-600">+{t('home.variations', { count: category.productCount })}</div>
                              </div>
                              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                <ChevronRight />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 font-black uppercase tracking-widest">{t('home.noSolutions')}</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Media Gallery Section */}
        <Suspense fallback={<div className="h-64 bg-gray-900 animate-pulse rounded-3xl" />}>
          <MediaGallery />
        </Suspense>

        {/* Featured Products Section */}
        {featuredProducts && featuredProducts.length > 0 && (
          <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse rounded-3xl" />}>
            <FeaturedProductsSlider products={featuredProducts} />
          </Suspense>
        )}

        {/* Shop Showcase Section */}
        <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse rounded-3xl" />}>
          <ShopSlider />
        </Suspense>

        {/* Trust Bar */}
        <section className="py-16 xs:py-20 sm:py-24 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 xs:mb-16">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {t('home.trustedByLeaders')}
              </h2>
              <p className="text-base xs:text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {t('home.satisfiedCustomers', { count: companyInfo.stats.clients })}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-amber-600 mb-4">
                    <Star className="w-5 h-5 fill-current" aria-hidden="true" />
                    <Star className="w-5 h-5 fill-current" aria-hidden="true" />
                    <Star className="w-5 h-5 fill-current" aria-hidden="true" />
                    <Star className="w-5 h-5 fill-current" aria-hidden="true" />
                    <Star className="w-5 h-5 fill-current" aria-hidden="true" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{companyInfo.stats.rating}</div>
                  <div className="text-sm text-gray-600">{t('home.customerRating')}</div>
                </div>
                <div className="text-center">
                  <Zap className="w-12 h-12 text-green-600 mx-auto mb-4" aria-hidden="true" />
                  <div className="text-4xl font-bold text-gray-900 mb-2">{companyInfo.stats.repeatBusiness}</div>
                  <div className="text-sm text-gray-600">{t('home.repeatBusiness')}</div>
                </div>
                <div className="text-center">
                  <Factory className="w-12 h-12 text-blue-600 mx-auto mb-4" aria-hidden="true" />
                  <div className="text-4xl font-bold text-gray-900 mb-2">{companyInfo.stats.corporateClients}</div>
                  <div className="text-sm text-gray-600">{t('home.corporateClients')}</div>
                </div>
              </div>

              <div className="mt-6 xs:mt-8 text-center">
                <p className="text-sm xs:text-base text-gray-700 italic max-w-3xl mx-auto leading-relaxed">
                  {`"${t('home.ceoQuote')}"`}
                </p>
                <div className="mt-4 xs:mt-6">
                  <p className="font-bold text-gray-900">Rajesh Mehta</p>
                  <p className="text-sm text-gray-600">CEO, Mehta Industries</p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Call to Action - MODERN INDUSTRIAL HUB */}
        <motion.section
          ref={ctaRef}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="relative py-32 overflow-hidden bg-gray-900"
        >
          {/* Animated Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600 rounded-full blur-[80px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-[4rem] border border-white/10 p-12 md:p-20 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <Zap size={120} className="text-white" />
              </div>

              <div className="max-w-4xl space-y-8">
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-full text-white text-xs font-black uppercase tracking-widest">
                  <Shield size={14} />
                  <span>ISO 9001:2015 Certified</span>
                </motion.div>

                <motion.h2 variants={itemVariants} className="text-4xl md:text-7xl font-black text-white leading-none tracking-tighter uppercase">
                  READY TO <span className="text-blue-500">REVOLUTIONIZE</span> <br /> YOUR INDUSTRY?
                </motion.h2>

                <motion.p variants={itemVariants} className="text-xl text-gray-400 font-medium max-w-2xl leading-relaxed">
                  Get in touch with our experts for customized solutions, bulk orders, and specialized industrial requirements.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 pt-8">
                  <Link to="/contact" className="group px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all duration-300 shadow-xl shadow-blue-900/40 flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest text-sm">
                    <span>Request Quote</span>
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                  <Link to="/products" className="group px-10 py-5 bg-white/5 border border-white/20 text-white font-black rounded-2xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest text-sm backdrop-blur-md">
                    <span>Browse Catalog</span>
                    <Package size={20} />
                  </Link>
                </motion.div>
              </div>

              {/* Modern Stat Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-20 border-t border-white/10">
                {[
                  { label: 'Experience', value: '12+ Years' },
                  { label: 'Certification', value: 'ISO 9001' },
                  { label: 'Network', value: 'Pan-India' },
                  { label: 'Support', value: '24/7 Live' }
                ].map((stat, i) => (
                  <motion.div key={i} variants={itemVariants} className="space-y-1">
                    <div className="text-3xl font-black text-white uppercase tracking-tighter">{stat.value}</div>
                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Visit Our Showroom - PREMIUM SPLIT LAYOUT */}
        <section className="py-32 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-20 items-center">

              {/* Showroom Details */}
              <div className="lg:w-1/2 space-y-10">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-4xl md:text-7xl font-black text-gray-900 mb-8 leading-none tracking-tighter uppercase">
                    VISIT OUR <br /> <span className="text-blue-600">SHOWROOM</span>
                  </h2>

                  <div className="space-y-8">
                    <div className="flex gap-6 items-start group">
                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                        <MapPin size={28} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-1">Location</h4>
                        <p className="text-lg font-bold text-gray-700 leading-snug">{companyInfo.address}</p>
                      </div>
                    </div>

                    <div className="flex gap-6 items-start group">
                      <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 flex-shrink-0 group-hover:bg-green-600 group-hover:text-white transition-all duration-500 shadow-sm">
                        <Clock size={28} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-green-600 uppercase tracking-widest mb-1">Business Hours</h4>
                        <p className="text-lg font-bold text-gray-700 leading-snug">Mon - Fri: 9AM - 6PM | Sat: 9AM - 4PM</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-10">
                    <a
                      href="https://www.google.com/maps/place/Damodar+Traders/@22.717964,75.857387,17z"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all duration-300 flex items-center gap-3 uppercase tracking-widest text-xs"
                    >
                      <Globe size={18} />
                      <span>Google Maps</span>
                    </a>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-8 py-4 bg-blue-50 text-blue-600 font-black rounded-2xl hover:bg-blue-100 transition-all duration-300 flex items-center gap-3 uppercase tracking-widest text-xs"
                    >
                      <Eye size={18} />
                      <span>360° Tour</span>
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Interactive Preview */}
              <div className="lg:w-1/2 w-full">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  className="relative group cursor-pointer"
                  onClick={() => setIsModalOpen(true)}
                >
                  <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-cyan-50 rounded-[3.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white aspect-[4/3]">
                    <img
                      src={settings.virtualTour.previewImage}
                      alt="Showroom Preview"
                      width={800}
                      height={600}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent flex items-end p-12">
                      <div className="space-y-2">
                        <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-2">Interactive</div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">EXPLORE SHOWROOM</h3>
                        <p className="text-white/70 font-medium">Click to launch 360° Virtual Experience</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/50 animate-pulse">
                        <Play size={32} className="ml-1" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Photosphere Modal */}
      <div id="photosphere-modal" className={`fixed inset-0 z-[9999] ${isModalOpen ? '' : 'hidden'}`}>
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        ></div>
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{companyInfo.name} - 360° View</h3>
                  <p className="text-sm text-gray-600">Interactive Virtual Tour</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close 360° view"
              >
                <ChevronRight className="w-6 h-6 text-gray-600 rotate-180" aria-hidden="true" />
              </button>
            </div>
            <div className="aspect-video w-full bg-gray-100">
              {(() => {
                let url = settings.virtualTour.iframeUrl || '';
                if (url.includes('<iframe') && url.includes('src=')) {
                  const match = url.match(/src="([^"]+)"/);
                  if (match) url = match[1];
                }

                if (url && !url.includes('/embed') && !url.includes('my.matterport.com')) {
                  return (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200">
                      <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
                      <h3 className="text-lg font-bold text-slate-800 mb-2">Virtual Tour Unavailable</h3>
                      <p className="text-sm text-slate-500 max-w-md">
                        The virtual tour could not be loaded because the configured link is a standard webpage rather than an embeddable map. 
                      </p>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Open in New Tab
                      </a>
                    </div>
                  );
                }

                return (
                  <iframe
                    src={url}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${companyInfo.name} 360° Virtual Tour`}
                    className="w-full h-full"
                  ></iframe>
                );
              })()}
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{companyInfo.address}</p>
                    <p className="text-xs text-gray-600">Drag to explore • Scroll to zoom</p>
                  </div>
                </div>
                <a
                  href={settings.virtualTour.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Index;