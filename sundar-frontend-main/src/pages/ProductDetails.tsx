import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, Check, ShieldCheck,
  ChevronDown, Settings, Loader2, AlertCircle, Phone,
  MoveRight, Maximize2, Layers, CheckCircle2,
  Factory, Shield, Box, Hexagon, Package, MessageSquare, PackageOpen
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO/MetaTags';
import { api, type Product } from '@/services/api/api-client';
import logger from '@/lib/logger';
import { InquiryForm } from '@/components/product/InquiryForm';
import { ImagePlaceholder } from '@/components/common/ui/ImagePlaceholder';
import RelatedProducts from '@/components/product/RelatedProducts';
import RecentlyViewed from '@/components/product/RecentlyViewed';

// Interfaces
interface SizeOption {
  size: string;
  price_100_percent: number;
  price_50_percent: number;
  availability?: boolean;
  stock?: number;
  description?: string;
  image?: string;
}

interface ProductWithSizes extends Product {
  sizeOptions: SizeOption[];
  material?: string;
  bagSize?: string;
  weight?: string;
  printType?: string;
  closure?: string;
  faqs?: { q: string; a: string; }[];
  price?: number;
}

const SALES_PHONE = import.meta.env.VITE_SALES_PHONE || '+91 98765 43210';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductWithSizes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive States
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [activeIndustryIndex, setActiveIndustryIndex] = useState<number | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Scroll hooks
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScrollY } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroOpacity = useTransform(heroScrollY, [0, 0.8], [1, 0]);

  // Fetch product data
  const fetchProduct = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.products.getById(id);

      if (response.data) {
        let productData: any = response.data;
        if (productData.data) productData = productData.data;
        if (productData.product) productData = productData.product;

        setProduct(productData as ProductWithSizes);
      } else {
        throw new Error((response.data as any)?.message || 'Product not found');
      }
    } catch (err: any) {
      logger.error('Failed to fetch product:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [fetchProduct]);

  // Data directly from Admin Panel (No dummy data)
  const features = product?.benefits || [];
  const industries = product?.industries || [];
  const faqs = product?.faqs || [];

  const specs = product ? [
    { label: 'Material', value: product.material || 'Premium Grade Resin' },
    { label: 'Capacity', value: product.weight || '25kg - 50kg Standard' },
    { label: 'Size', value: product.bagSize || 'Customizable' },
    { label: 'Printing', value: product.printType || 'Flexographic / Multi-color' },
    { label: 'Application', value: 'Heavy Industrial / Bulk' },
  ] : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7F6] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#00C878] animate-spin mb-4" />
        <p className="text-[var(--theme-color)] font-bold uppercase tracking-widest text-sm">Loading Premium Experience</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#F5F7F6] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[var(--theme-color)] mx-auto mb-6" />
          <h2 className="text-4xl font-black text-[var(--theme-color)] mb-4 tracking-tight">Product Not Found</h2>
          <Link to="/products" className="text-[#00C878] font-bold tracking-widest uppercase text-sm hover:text-[var(--theme-color)] transition-colors">
            Return to Catalogue →
          </Link>
        </div>
      </div>
    );
  }

  // Extract all valid images from product data (handles both string arrays and object arrays from admin)
  const validImagesRaw = [product.image, ...(product.images || [])];
  const validImages = Array.from(new Set(validImagesRaw.map(img => {
    if (typeof img === 'string') return img;
    if (img && typeof img === 'object') {
      if ('url' in img) return (img as any).url as string;
      if ('secure_url' in img) return (img as any).secure_url as string;
      if ('src' in img) return (img as any).src as string;
    }
    return '';
  }).filter(img => typeof img === 'string' && img.trim() !== '')));

  // Highlight first word logic for Hero
  const nameParts = product.name.split(' ');
  const highlightedWord = nameParts[0];
  const restOfName = nameParts.slice(1).join(' ');
  const categoryName = typeof product.category === 'string' ? product.category : ((product.category as any)?.name || 'Category');

  return (
    <>
      <SEO
        title={product.name}
        description={product.shortDescription || product.description.substring(0, 160)}
        image={validImages[0]}
        type="product"
        productData={{
          name: product.name,
          price: product.price || 0,
          currency: 'INR',
          brand: product.brand || 'Sundar Corporation',
          availability: product.inStock !== false ? 'in stock' : 'out of stock'
        }}
      />

      <Navbar />

      <main className="w-full bg-[#FFFFFF] font-sans selection:bg-[#00C878] selection:text-white pt-[72px]" style={{ "--theme-color": product.themeColor || "#07111F" } as React.CSSProperties}>

        {/* 1. SPLIT-SCREEN HERO SECTION (Reference Image Style) */}
        <section ref={heroRef} className="relative w-full min-h-[100vh] lg:min-h-[800px] flex flex-col lg:flex-row overflow-hidden bg-[var(--theme-color)]">
          
          {/* LEFT HALF (Navy) */}
          <div className="relative w-full lg:w-1/2 bg-[var(--theme-color)] pt-32 pb-40 lg:pb-20 px-8 lg:px-20 flex flex-col justify-center items-start lg:items-end z-10">
            {/* Rotated Background Text */}
            <div className="absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-white/[0.03] font-black text-[60px] lg:text-[100px] tracking-widest uppercase whitespace-nowrap pointer-events-none">
              Specifications
            </div>

            <motion.div
              style={{ opacity: heroOpacity }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10 text-left lg:text-right max-w-sm lg:pr-[240px] xl:pr-[280px] w-full lg:w-auto"
            >
              {/* Vertical Specs List */}
              <div className="flex flex-col gap-10">
                {Array.isArray(product.specifications) && product.specifications.length > 0 ? (
                  product.specifications.slice(0, 4).map((spec: any, idx: number) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-[#00C878] font-bold text-sm tracking-widest uppercase mb-1">{spec.name}:</span>
                      <span className="text-[#F5F7F6] text-xl font-medium">{spec.value}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="text-[#00C878] font-bold text-sm tracking-widest uppercase mb-1">Material:</span>
                      <span className="text-[#F5F7F6] text-xl font-medium">100% Virgin PP/HDPE</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#00C878] font-bold text-sm tracking-widest uppercase mb-1">Strength:</span>
                      <span className="text-[#F5F7F6] text-xl font-medium">Industrial Grade</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#00C878] font-bold text-sm tracking-widest uppercase mb-1">Sizes:</span>
                      <span className="text-[#F5F7F6] text-xl font-medium">Customizable</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#00C878] font-bold text-sm tracking-widest uppercase mb-1">Usage:</span>
                      <span className="text-[#F5F7F6] text-xl font-medium">Heavy Duty Packaging</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          {/* RIGHT HALF (Emerald Green) */}
          <div className="relative w-full lg:w-1/2 bg-[#00C878] pt-40 lg:pt-20 pb-32 px-8 lg:px-20 flex flex-col justify-center items-start z-10 lg:pl-[240px] xl:pl-[280px]">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10 w-full max-w-lg"
            >
              <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-10" style={{ fontFamily: 'serif' }}>
                {product.name}
              </h1>

              <div className="flex items-center gap-8 mb-10">
                <div className="flex items-center gap-4">
                  <div className="text-white">
                    <div className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Brand</div>
                    <div className="text-white font-bold">{product.brand || "Sundar Corp"}</div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Stock</div>
                  <div className="text-white font-bold">{product.inStock !== false ? 'Available' : 'On Demand'}</div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <Link to={`/request-quote?product=${product.slug || product._id}`} className="flex items-center gap-4 bg-[var(--theme-color)] text-white rounded px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors shadow-2xl group">
                  Request Quote
                  <div className="bg-white rounded p-1.5 group-hover:scale-110 transition-transform">
                    <Package className="text-[var(--theme-color)] w-4 h-4" />
                  </div>
                </Link>
                <a href={`https://wa.me/${SALES_PHONE.replace(/[^0-9]/g, '')}?text=I'm interested in ${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#25D366] text-white rounded px-6 py-4 font-bold uppercase tracking-widest text-sm hover:bg-[#128C7E] transition-colors shadow-lg">
                  <Phone className="w-5 h-5" />
                  WhatsApp Us
                </a>
              </div>
            </motion.div>
          </div>

          {/* CENTER FLOATING IMAGE & MULTI-IMAGE THUMBNAILS */}
          <div className="absolute top-[15%] lg:top-1/2 left-1/2 -translate-x-1/2 lg:-translate-y-1/2 w-[90%] max-w-[400px] lg:max-w-[500px] xl:max-w-[550px] aspect-[4/5] lg:aspect-[3/4] z-30 pointer-events-auto flex flex-col items-center justify-center">
            
            {/* Elegant Floating Pedestal (Pulsing Animation) */}
            <motion.div 
              animate={{ scale: [1, 1.05, 1], opacity: [0.8, 0.4, 0.8] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-[85%] left-1/2 -translate-x-1/2 w-[60%] h-[15%] pointer-events-none"
            >
              <div className="absolute inset-0 bg-black/30 blur-xl rounded-full"></div>
              <div className="absolute inset-x-8 bottom-1/2 h-2 bg-white/20 blur-sm rounded-full"></div>
              <div className="absolute inset-x-12 bottom-1/2 h-1 bg-white/40 blur-[2px] rounded-full"></div>
            </motion.div>

            {/* Product Image (Floating Animation) */}
            <div className="relative w-full h-[85%] flex items-center justify-center z-10 pointer-events-none">
              <AnimatePresence mode="wait">
                {validImages.length > 0 && (
                  <motion.div
                    key={activeImageIndex}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <motion.img 
                      animate={{ y: [0, -15, 0] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      src={validImages[activeImageIndex]} 
                      alt={product.name} 
                      className="w-full h-full object-contain filter drop-shadow-[0_30px_30px_rgba(0,0,0,0.4)]"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Multiple Images Thumbnail Gallery */}
            {validImages.length > 1 && (
              <div className="relative z-20 mt-8 flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20 shadow-xl">
                {validImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-300 ${activeImageIndex === idx ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover bg-white" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Scroll Indicator */}
          <div className="hidden lg:flex absolute bottom-8 left-12 flex-col items-center gap-3 opacity-50 z-20">
            <span className="text-[9px] font-bold text-white tracking-[0.3em] uppercase rotated-text" style={{ writingMode: 'vertical-rl' }}>
              Scroll
            </span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-[1px] h-[40px] bg-white/30"
            />
          </div>
        </section>

        {/* 4. PRODUCT QUICK FACTS */}
        <section className="bg-white border-b border-[#F5F7F6]">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#F5F7F6]">
              {[
                { label: "MATERIAL", value: specs[0]?.value.split(' ')[0] || "HDPE" },
                { label: "CAPACITY", value: specs[1]?.value.split(' ')[0] || "25-50KG" },
                { label: "PRINTING", value: "CUSTOM" },
                { label: "APPLICATION", value: "INDUSTRIAL" }
              ].map((fact, idx) => (
                <div key={idx} className="p-8 lg:p-12 text-center group hover:bg-[#F5F7F6] transition-colors duration-500">
                  <div className="text-2xl lg:text-3xl font-black text-[var(--theme-color)] mb-2">{fact.value}</div>
                  <div className="text-[10px] font-bold text-[#64748B] tracking-[0.2em] uppercase">{fact.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. PRODUCT STORY SECTION (Editorial) */}
        <section className="py-24 lg:py-32 bg-[#FFFFFF]">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-12 gap-16 lg:gap-24">

              {/* Left Editorial Heading */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="lg:col-span-6 flex gap-8"
              >
                <div className="hidden sm:block">
                  <div className="text-[10px] font-bold text-[#00C878] tracking-[0.2em] uppercase" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                    01 // Product Story
                  </div>
                </div>
                <div>
                  <h2 className="text-4xl lg:text-[52px] font-black text-[var(--theme-color)] leading-[1.1] tracking-tight">
                    Built for strength.<br />
                    Designed for demanding<br />
                    <span className="text-[#64748B]">industrial packaging.</span>
                  </h2>
                </div>
              </motion.div>

              {/* Right Content */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="lg:col-span-5 lg:col-start-8"
              >
                <div className="prose prose-lg text-[#111827] leading-[1.8] mb-10">
                  <p className="text-[#64748B]">
                    {product.description || "Manufactured from premium grade materials using advanced extrusion and weaving technology, these solutions are designed to withstand the most demanding storage and transportation environments. Engineered specifically for bulk handling, our packaging ensures product integrity from our manufacturing floor to your customer's destination."}
                  </p>
                </div>

                <a href="#specifications" className="inline-flex items-center gap-3 text-[11px] font-bold text-[var(--theme-color)] tracking-[0.2em] uppercase hover:text-[#00C878] transition-colors group">
                  Explore Specifications
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>

            </div>
          </div>
        </section>

        {/* 7. INTERACTIVE FEATURES */}
        {features.length > 0 && (
          <section className="py-24 lg:py-32 bg-[var(--theme-color)] text-white overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="mb-16 lg:mb-24">
              <h2 className="text-4xl lg:text-[52px] font-black tracking-tight">Why This Product Performs</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

              {/* Left: Interactive List */}
              <div className="space-y-2">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setActiveFeatureIndex(idx)}
                    className="group cursor-pointer border-b border-white/10 last:border-0 pb-6 mb-6"
                  >
                    <div className="flex gap-6 items-start">
                      <span className={`text-sm font-bold tracking-[0.2em] transition-colors duration-300 mt-2 ${activeFeatureIndex === idx ? 'text-[#00C878]' : 'text-white/30'}`}>
                        0{idx + 1}
                      </span>
                      <div>
                        <h3 className={`text-2xl lg:text-4xl font-black tracking-tight transition-colors duration-300 mb-4 ${activeFeatureIndex === idx ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
                          {feature.title}
                        </h3>
                        <AnimatePresence>
                          {activeFeatureIndex === idx && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-[#64748B] text-lg lg:text-xl leading-relaxed"
                            >
                              {feature.desc}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Dynamic Image (Bright Photography Studio) */}
              <div 
                className="hidden lg:block relative aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl border border-black/5"
                style={{ backgroundColor: '#e5e7eb' }} // Light gray base
              >
                {/* 3D Studio SVG Environment */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <radialGradient id="center-spot" cx="50%" cy="0%" r="70%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                      <stop offset="40%" stopColor="#ffffff" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="side-spot" cx="50%" cy="0%" r="70%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                      <stop offset="40%" stopColor="#ffffff" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="floor-grad" x1="0%" y1="75%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#9ca3af" stopOpacity="0.4" />
                    </linearGradient>
                    <filter id="soft-blur" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" />
                    </filter>
                  </defs>

                  {/* Base Gray Wall */}
                  <rect width="100" height="100" fill="#d1d5db" />
                  
                  {/* Left Spotlight */}
                  <ellipse cx="15" cy="-5" rx="35" ry="80" fill="url(#side-spot)" transform="rotate(-15 15 -5)" filter="url(#soft-blur)" />
                  
                  {/* Right Spotlight */}
                  <ellipse cx="85" cy="-5" rx="35" ry="80" fill="url(#side-spot)" transform="rotate(15 85 -5)" filter="url(#soft-blur)" />
                  
                  {/* Center Main Spotlight */}
                  <ellipse cx="50" cy="-10" rx="45" ry="90" fill="url(#center-spot)" filter="url(#soft-blur)" />

                  {/* Infinity Cove Floor */}
                  <rect x="0" y="75" width="100" height="25" fill="url(#floor-grad)" />
                  <ellipse cx="50" cy="75" rx="60" ry="8" fill="#ffffff" filter="url(#soft-blur)" opacity="0.8" />
                  
                  {/* Central Floor Highlight (under product) */}
                  <ellipse cx="50" cy="85" rx="35" ry="8" fill="#ffffff" filter="url(#soft-blur)" />
                </svg>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeatureIndex}
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                    className="absolute inset-0 w-full h-full flex items-center justify-center p-12 z-10"
                  >
                    {(() => {
                      const activeImage = features[activeFeatureIndex]?.image || (validImages.length > 0 ? validImages[activeFeatureIndex % validImages.length] : null);
                      
                      return activeImage ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          {/* Dark Contact Shadow for Bright Floor */}
                          <div className="absolute bottom-[2%] w-[40%] h-[12px] bg-black/40 blur-md rounded-[100%]" />
                          <div className="absolute bottom-[3%] w-[25%] h-[8px] bg-black/60 blur-sm rounded-[100%]" />
                          
                          <motion.img
                            src={activeImage}
                            alt={`${product.name} Feature`}
                            className="relative w-full h-[90%] object-contain z-10"
                            style={{ filter: `drop-shadow(0 25px 25px rgba(0,0,0,0.3))` }}
                            animate={{ 
                              y: [-5, 5, -5],
                            }}
                            transition={{
                              repeat: Infinity,
                              duration: 5,
                              ease: "easeInOut"
                            }}
                          />
                        </div>
                      ) : (
                        <ImagePlaceholder className="rounded-2xl bg-black/5 border-black/10 text-black/30 relative z-10" />
                      );
                    })()}
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>
        </section>
        )}

        {/* 8. PRODUCT RANGE (Horizontal Scroll) */}
        {product.sizeOptions && product.sizeOptions.length > 0 && (
          <section className="py-24 lg:py-32 bg-[#F5F7F6] overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mb-16 flex items-end justify-between">
              <div>
                <div className="text-[10px] font-bold text-[#64748B] tracking-[0.2em] uppercase mb-4">
                  02 // Product Variants
                </div>
                <h2 className="text-4xl lg:text-[52px] font-black text-[var(--theme-color)] tracking-tight">Explore The Range</h2>
              </div>
              <div className="hidden md:flex items-center gap-4 text-[10px] font-bold text-[var(--theme-color)] tracking-[0.2em] uppercase">
                Swipe to explore <MoveRight size={16} />
              </div>
            </div>

            <div className="flex overflow-x-auto pb-16 px-6 lg:px-12 snap-x snap-mandatory hide-scrollbar gap-8">
              {product.sizeOptions.map((variant, idx) => (
                <div
                  key={idx}
                  className="min-w-[85vw] md:min-w-[500px] lg:min-w-[600px] snap-center bg-white p-8 lg:p-12 rounded-[24px] group hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-500 border border-[#E5E7EB]"
                >
                  <div className="relative w-full aspect-[16/10] bg-[#F5F7F6] rounded-[16px] overflow-hidden mb-8 flex items-center justify-center p-8">
                    {variant.image || validImages[0] ? (
                      <img
                        src={variant.image || validImages[0]}
                        alt={`${product.name} ${variant.size} - Sundar Corporation`}
                        className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <ImagePlaceholder className="rounded-xl" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-black text-[var(--theme-color)] mb-4">
                      {variant.size}
                    </h3>
                    <p className="text-[#64748B] text-lg leading-relaxed mb-8">
                      {variant.description || `Industrial specification tailored for ${variant.size} capacity. Ideal for standard logistics and bulk handling.`}
                    </p>
                    <a href="#product-inquiry" className="inline-flex items-center gap-2 text-[11px] font-bold text-[#00C878] tracking-[0.2em] uppercase hover:text-[var(--theme-color)] transition-colors">
                      Inquire Option <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 10. INDUSTRIES WE SERVE (Creative Horizontal Accordion) */}
        {industries.length > 0 && (
          <section className="relative py-24 lg:py-32 bg-[var(--theme-color)] text-white overflow-hidden">
          {/* Subtle Glow Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#00C878]/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="mb-16 lg:mb-24 text-center flex flex-col items-center">
              <div className="text-[10px] font-bold text-[#00C878] tracking-[0.2em] uppercase mb-6 flex items-center gap-4">
                <span className="w-12 h-[1px] bg-[#00C878]/50"></span>
                03 // Applications
                <span className="w-12 h-[1px] bg-[#00C878]/50"></span>
              </div>
              <h2 className="text-4xl lg:text-[64px] font-black tracking-tight leading-[1.05]">
                Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/30">Impact.</span>
              </h2>
            </div>

            <div className="flex flex-col lg:flex-row w-full h-[600px] lg:h-[550px] gap-4">
              {industries.map((ind, idx) => {
                const activeIdx = activeIndustryIndex !== null ? activeIndustryIndex : 0;
                const isActive = activeIdx === idx;
                const Icons = [Layers, Factory, Shield, Box, Hexagon];
                const Icon = Icons[idx % Icons.length];
                
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setActiveIndustryIndex(idx)}
                    onClick={() => setActiveIndustryIndex(idx)}
                    className={`group relative rounded-[32px] overflow-hidden transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] border border-white/5 cursor-pointer bg-white/[0.02]
                      ${isActive ? 'flex-[4] lg:flex-[5] bg-white/[0.05] border-white/10 shadow-[0_0_40px_rgba(0,200,120,0.1)]' : 'flex-1 hover:bg-white/[0.04]'}
                    `}
                  >
                    {/* Background Layer 1: Radial Glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-[#00C878]/10 via-transparent to-transparent transition-opacity duration-1000 z-0 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                    
                    {/* Background Layer 2: Abstract Grid */}
                    <div className={`absolute inset-0 transition-opacity duration-1000 z-0 ${isActive ? 'opacity-[0.03]' : 'opacity-[0.01]'}`} style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

                    {/* Background Layer 3: Giant Icon Watermark */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none transition-all duration-[1500ms] ease-out z-0 ${isActive ? 'opacity-[0.04] scale-[3.5] rotate-[15deg]' : 'opacity-[0.01] scale-[1] rotate-0'}`}>
                      <Icon size={240} strokeWidth={1} />
                    </div>

                    {/* Background Layer 4: Giant Typographic Watermark */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none transition-all duration-[2000ms] ease-out flex items-center justify-center z-0 ${isActive ? 'opacity-[0.03] scale-100 rotate-[-5deg]' : 'opacity-0 scale-50 rotate-0'}`}>
                      <span className="text-[100px] lg:text-[220px] font-black whitespace-nowrap leading-none tracking-tighter">
                        {ind.name}
                      </span>
                    </div>
                    
                    {/* Top-Right Big Number */}
                    <div className={`absolute top-6 lg:top-8 right-6 lg:right-8 text-5xl lg:text-7xl font-black transition-colors duration-700 leading-none select-none pointer-events-none z-10 ${isActive ? 'text-white/20' : 'text-white/5 group-hover:text-white/10'}`}>
                      0{idx + 1}
                    </div>

                    <div className="relative z-10 w-full h-full overflow-hidden">
                      
                      {/* Collapsed Text */}
                      <div 
                        className={`absolute inset-0 flex items-center justify-center lg:items-end lg:justify-center lg:pb-12 transition-all duration-700
                          ${isActive ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100 delay-200'}`}
                      >
                        <div className="lg:hidden text-lg font-black text-white/50 uppercase tracking-[0.2em] whitespace-nowrap">
                          {ind.name}
                        </div>
                        <div className="hidden lg:block text-2xl font-black text-white/40 uppercase tracking-[0.3em] whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                          {ind.name}
                        </div>
                      </div>

                      {/* Expanded Content */}
                      <div 
                        className={`absolute bottom-0 left-0 w-full lg:w-[450px] p-8 lg:p-12 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-end h-full
                          ${isActive ? 'opacity-100 translate-y-0 lg:translate-x-0 delay-100' : 'opacity-0 translate-y-12 lg:translate-y-0 lg:-translate-x-24 pointer-events-none'}`}
                      >
                        <div>
                          <div className={`w-14 h-14 bg-[#00C878] rounded-[16px] mb-8 flex items-center justify-center transform transition-transform duration-1000 ${isActive ? 'rotate-[-10deg] scale-100' : 'rotate-0 scale-50'}`}>
                            <Icon size={24} className="text-[var(--theme-color)]" />
                          </div>
                          <h3 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight leading-[1.1]">
                            {ind.name}
                          </h3>
                          <p className="text-white/70 text-lg leading-relaxed max-w-sm font-medium">
                            {ind.desc}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        )}

        {/* 11 & 12. TECHNICAL SPECIFICATIONS & CUSTOMIZATION */}
        <section id="specifications" className="bg-[#FFFFFF]">
          <div className="grid lg:grid-cols-2">

            {/* Left: Specs (Dark) */}
            <div className="bg-[#08131F] text-white p-12 lg:p-24 flex flex-col justify-center">
              <div className="text-[10px] font-bold text-[#00C878] tracking-[0.2em] uppercase mb-8">
                04 // Technical Data
              </div>
              <h2 className="text-4xl lg:text-[52px] font-black tracking-tight mb-16">
                Technical<br />Specifications
              </h2>

              <div className="w-full">
                {specs.map((spec, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center py-6 border-t border-white/10 last:border-b">
                    <span className="w-1/3 text-xs font-bold text-[#64748B] tracking-[0.2em] uppercase mb-2 sm:mb-0">
                      {spec.label}
                    </span>
                    <span className="w-2/3 text-lg lg:text-xl font-bold text-white">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Customization (Light) */}
            <div className="bg-[#F5F7F6] p-12 lg:p-24 flex flex-col justify-center">
              <h2 className="text-3xl lg:text-[42px] font-black text-[var(--theme-color)] tracking-tight mb-6">
                Made Around Your Requirements.
              </h2>
              <p className="text-lg text-[#64748B] mb-12 leading-relaxed">
                We engineer packaging solutions specifically for your production line. Interactive customization available for all bulk orders.
              </p>

              <div className="flex flex-wrap gap-4 mb-16">
                {['SIZE', 'COLOR', 'PRINTING', 'LAMINATION', 'PACKAGING'].map((opt, i) => (
                  <div key={i} className="px-6 py-3 bg-white border border-[#E5E7EB] rounded-full text-[11px] font-bold text-[var(--theme-color)] tracking-[0.2em] hover:bg-[var(--theme-color)] hover:text-white transition-colors duration-300 cursor-pointer shadow-sm">
                    {opt}
                  </div>
                ))}
              </div>

              <a href="#product-inquiry" className="inline-flex items-center gap-3 text-[11px] font-bold text-[var(--theme-color)] tracking-[0.2em] uppercase hover:text-[#00C878] transition-colors group">
                Discuss Your Requirements
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

          </div>
        </section>

        {/* 13. WHY SUNDAR CORPORATION */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-16">

            <div className="lg:col-span-5">
              <div className="text-[10px] font-bold text-[#64748B] tracking-[0.2em] uppercase mb-4">
                05 // Why Sundar
              </div>
              <h2 className="text-4xl lg:text-[52px] font-black text-[var(--theme-color)] tracking-tight leading-tight mb-8">
                More Than Packaging.<br />
                Engineered Partnership.
              </h2>
              <p className="text-lg text-[#64748B] leading-relaxed max-w-md">
                We don't just supply bags. We provide reliability to the world's most demanding supply chains.
              </p>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              {[
                { title: "CONSISTENT QUALITY", desc: "Rigorous testing and ISO-certified manufacturing." },
                { title: "RELIABLE SUPPLY", desc: "Uninterrupted logistics and high-volume capacity." },
                { title: "CUSTOM SOLUTIONS", desc: "Engineered specifically for your application." },
                { title: "INDUSTRIAL EXPERIENCE", desc: "Decades of proven manufacturing expertise." }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="flex gap-8 border-b border-[#E5E7EB] py-8 last:border-0"
                >
                  <span className="text-4xl lg:text-5xl font-black text-[#F5F7F6]">
                    0{idx + 1}
                  </span>
                  <div>
                    <h3 className="text-xl lg:text-2xl font-black text-[var(--theme-color)] mb-2">{item.title}</h3>
                    <p className="text-[#64748B]">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

        {/* 15. FAQ */}
        {faqs.length > 0 && (
          <section className="py-24 lg:py-32 bg-[#F5F7F6]">
          <div className="max-w-[1000px] mx-auto px-6 lg:px-12">
            <h2 className="text-4xl lg:text-[52px] font-black text-[var(--theme-color)] tracking-tight mb-16 text-center">
              Questions?<br />We've Got Answers.
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden transition-all duration-300 hover:shadow-lg"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-8 text-left focus:outline-none"
                  >
                    <span className="text-lg lg:text-xl font-bold text-[var(--theme-color)]">
                      {faq.q}
                    </span>
                    <div className={`shrink-0 transition-transform duration-300 ${openFaqIndex === idx ? 'rotate-180 text-[#00C878]' : 'text-[#64748B]'}`}>
                      <ChevronDown size={24} />
                    </div>
                  </button>
                  <AnimatePresence>
                    {openFaqIndex === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="px-8 pb-8 text-[#64748B] text-lg leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
          </section>
        )}

        {/* 16. RELATED PRODUCTS (Strict Category Mapping) */}
        <section className="py-24 bg-white border-t border-[#E5E7EB]">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <RelatedProducts productId={product.id || (product as any)._id} category={product.category as string} limit={4} />
          </div>
        </section>

        {/* RECENTLY VIEWED PRODUCTS */}
        <section className="py-24 bg-[#F5F7F6] border-t border-[#E5E7EB]">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <RecentlyViewed />
          </div>
        </section>

        {/* 17. FINAL CTA */}
        <section id="product-inquiry" className="relative py-32 bg-[var(--theme-color)] overflow-hidden">
          {/* Animated Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00C878]/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">

            <div>
              <h2 className="text-4xl lg:text-[64px] font-black text-white tracking-tight leading-[1.05] mb-8">
                Let's Build the Right<br />Packaging Solution.
              </h2>
              <p className="text-xl text-[#64748B] mb-12 leading-relaxed max-w-lg">
                Tell us what you're packaging, and our engineering team will help you find the exact specifications you need.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href={`tel:${SALES_PHONE}`} className="px-10 py-5 border border-white/20 hover:border-white text-white font-bold uppercase tracking-widest text-xs transition-colors duration-300 flex items-center justify-center gap-3 bg-white/5">
                  <Phone size={16} /> Contact Our Team
                </a>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-8 lg:p-12 shadow-2xl relative z-20 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-industrial/10 rounded-full flex items-center justify-center mb-6">
                <PackageOpen className="w-10 h-10 text-industrial" />
              </div>
              <h3 className="text-3xl font-black text-navy uppercase tracking-tight mb-4">
                Get a Custom Quote
              </h3>
              <p className="text-gray-500 font-medium mb-10 max-w-sm">
                Receive detailed pricing, lead times, and engineering specifications for {product.name}.
              </p>
              <InquiryForm 
                productId={product.id || (product as any)._id || ''} 
                productName={product.name} 
                trigger={
                  <button className="w-full inline-flex items-center justify-center gap-3 px-8 py-5 bg-industrial text-navy font-black uppercase tracking-widest text-sm rounded hover:bg-industrial-dark transition-colors shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    <MessageSquare className="w-5 h-5" />
                    Request Quote
                  </button>
                }
              />
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </>
  );
};
