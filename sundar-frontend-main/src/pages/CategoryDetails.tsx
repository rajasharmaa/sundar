import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Target, Box, CheckCircle2, ChevronRight, FileText, ArrowRight, Settings, Factory, ChevronDown } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import { api, type Product } from '@/services/api/api-client';
import { ImagePlaceholder } from '@/components/common/ui/ImagePlaceholder';

// Hardcoded rich content for main categories
const categoryContentData: Record<string, any> = {
  'hdpe-bags': {
    title: 'HDPE Bags Manufacturer',
    subtitle: 'High-Density Polyethylene Bags for Industrial & Agricultural Packaging',
    image: '/hdpe-bags-premium.png',
    intro: 'High-Density Polyethylene (HDPE) bags are the backbone of bulk packaging. Known for their exceptional tensile strength and durability, these woven sacks provide excellent protection against moisture, dust, and physical damage during transit.',
    features: [
      'High tensile strength & tear resistance',
      'Excellent moisture and dust protection',
      'Lightweight yet capable of holding heavy loads',
      'Cost-effective bulk packaging solution',
      'Available with or without inner PE liners',
      'Customizable with multi-color printing'
    ],
    manufacturingSteps: [
      { title: 'Extrusion', desc: 'Melting HDPE granules to form flat tapes.', icon: Zap },
      { title: 'Weaving', desc: 'Circular looms weave the tapes into tubular fabric.', icon: Settings },
      { title: 'Cutting & Stitching', desc: 'Precise cutting and bottom stitching for strength.', icon: Target },
      { title: 'Printing', desc: 'Adding brand logos and product information.', icon: Box }
    ],
    finishes: ['Plain Unprinted', 'Flexo Printed', 'Gusseted', 'Valve Type', 'Lined (with PE liner)'],
    applications: ['Fertilizers', 'Chemicals', 'Cement', 'Food Grains', 'Sugar', 'Animal Feed'],
    faqs: [
      { q: 'What is the maximum capacity of your HDPE bags?', a: 'Our standard HDPE bags can hold up to 50kg, but we can customize them for specific load requirements.' },
      { q: 'Are these bags waterproof?', a: 'Standard HDPE bags are moisture-resistant. For complete waterproofing, we recommend adding an inner PE liner or lamination.' }
    ]
  },
  'pp-bags': {
    title: 'PP Woven Sacks Manufacturer',
    subtitle: 'Durable Polypropylene Sacks for Heavy Duty Applications',
    image: 'https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&q=80',
    intro: 'Polypropylene (PP) woven sacks offer superior clarity, strength, and printability compared to standard packaging. They are the preferred choice for industries requiring breathable, strong, and visually appealing packaging.',
    features: [
      'Excellent clarity and gloss',
      'Superior puncture resistance',
      '100% reusable and recyclable',
      'Breathable fabric for agricultural products',
      'Resistant to most acids, alkalis, and solvents',
      'FDA compliant for food contact'
    ],
    manufacturingSteps: [
      { title: 'Tape Extrusion', desc: 'High-grade PP granules are extruded into high-strength tapes.', icon: Zap },
      { title: 'Circular Weaving', desc: 'Weaving tapes into seamless tubular fabrics.', icon: Settings },
      { title: 'Finishing', desc: 'Heat cutting to prevent fraying and bottom folding/stitching.', icon: Target },
      { title: 'Baling', desc: 'Compressing into bales for efficient transportation.', icon: Box }
    ],
    finishes: ['Laminated', 'Unlaminated', 'Perforated (Breathable)', 'Transparent/Translucent'],
    applications: ['Flour & Grain', 'Pulses & Spices', 'Salt', 'Seeds', 'Sand', 'Metal Parts'],
    faqs: [
      { q: 'Can you print my logo in multiple colors?', a: 'Yes, we offer high-quality flexographic printing up to 6 colors on PP woven sacks.' },
      { q: 'What is the difference between PP and HDPE?', a: 'PP offers better clarity, is slightly more rigid, and can withstand higher temperatures compared to HDPE.' },
      { q: 'What are PP woven sacks, and why are they widely used?', a: 'PP woven sacks are durable and tear-resistant packaging solutions made from polypropylene woven fabric. These bags are ideal for agriculture, food, fertilizers, and industrial packaging, offering high tensile strength and moisture resistance.' },
      { q: 'Where can I find reliable PP woven bag suppliers?', a: 'As a trusted packaging manufacturer, our team of experts works tirelessly to ensure that our clients receive the best packaging service globally. We offer custom PP woven packaging bags for bulk orders.' }
    ]
  },
  'bopp-bags': {
    title: 'BOPP Laminated Bags Manufacturer',
    subtitle: 'Premium Multicolor Printed Packaging for Maximum Brand Impact',
    image: '/bopp-bags-premium.png',
    intro: 'Biaxially Oriented Polypropylene (BOPP) laminated bags represent the pinnacle of retail packaging. By combining the strength of a woven sack with the photographic print quality of BOPP film, these bags ensure your product stands out on the shelf while remaining fully protected.',
    features: [
      'Photographic, high-resolution print quality',
      'Reverse printing technology (ink is protected)',
      'Excellent moisture barrier',
      'High gloss or premium matte finishes available',
      'Extremely durable and tear-resistant',
      'Easy to clean and handle'
    ],
    manufacturingSteps: [
      { title: 'Film Printing', desc: 'Reverse printing design onto the BOPP film using rotogravure.', icon: Zap },
      { title: 'Extrusion Coating', desc: 'Bonding the printed BOPP film to the PP woven fabric.', icon: Settings },
      { title: 'Tubing & Gusseting', desc: 'Forming the tube and creating side gussets for volume.', icon: Target },
      { title: 'Cutting & Sewing', desc: 'Finalizing bag shape with heavy-duty stitching.', icon: Box }
    ],
    finishes: ['High Gloss', 'Matte Finish', 'Metallic/Holographic', 'Window (to see product)'],
    applications: ['Premium Pet Food', 'Rice & Premium Grains', 'Specialty Fertilizers', 'Wall Putty', 'Detergents'],
    faqs: [
      { q: 'What is the Minimum Order Quantity (MOQ) for BOPP bags?', a: 'Due to the rotogravure printing process and cylinder setup, our standard MOQ for custom BOPP bags is 10,000 pieces.' },
      { q: 'How many colors can you print?', a: 'We can print photographic quality images with up to 8 colors using our advanced rotogravure machines.' }
    ]
  },
  'polypropylene-bulk-bags': {
    title: 'FIBC Jumbo Bags Manufacturer',
    subtitle: 'Flexible Intermediate Bulk Containers (1 Ton to 2 Ton Capacity)',
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&q=80',
    intro: 'FIBCs, commonly known as Jumbo Bags or Bulk Bags, are the ultimate solution for transporting large volumes of dry, flowable products. Engineered for safety and efficiency, our bags handle loads from 500kg up to 2000kg with ease.',
    features: [
      'High Safe Working Load (SWL) - 500kg to 2000kg',
      'Safety Factor (SF) of 5:1 or 6:1 available',
      'UV stabilized fabric for outdoor storage',
      'Customizable lifting loops and spouts',
      'Significant space and transport cost savings',
      'Available with sift-proof seams for fine powders'
    ],
    manufacturingSteps: [
      { title: 'Heavy Duty Extrusion', desc: 'Extruding ultra-thick tapes for maximum tensile strength.', icon: Zap },
      { title: 'Flat/Circular Weaving', desc: 'Weaving heavy GSM fabric on specialized large looms.', icon: Settings },
      { title: 'Webbing Production', desc: 'Creating high-strength lifting loops.', icon: Target },
      { title: 'Assembly & Testing', desc: 'Manual assembly followed by rigorous load testing.', icon: Box }
    ],
    finishes: ['U-Panel', 'Circular/Tubular', 'Baffle Bags', 'Conductive (Type C/D)', 'UN Certified'],
    applications: ['Mining & Minerals', 'Construction Materials', 'Petrochemicals', 'Agriculture Export', 'Waste Management'],
    faqs: [
      { q: 'What top and bottom options do you offer?', a: 'We offer Open Top, Duffle Top, and Spout Top for filling, and Flat Bottom or Discharge Spout for emptying.' },
      { q: 'Can FIBCs be reused?', a: 'Yes, if designed with a 6:1 Safety Factor (Multi-trip). However, standard 5:1 bags are Single-trip only for safety reasons.' }
    ]
  },
  'jute-bags': {
    title: 'Jute Bags & Gunny Sacks',
    subtitle: 'Traditional, 100% Eco-Friendly and Biodegradable Packaging',
    image: 'https://images.unsplash.com/photo-1592636306606-d9b8b0e7d58a?auto=format&fit=crop&q=80',
    intro: 'Jute bags (Gunny sacks) represent the traditional, environmentally responsible choice for packaging. Completely biodegradable and highly breathable, they remain the gold standard for specific agricultural commodities that need constant aeration.',
    features: [
      '100% natural, biodegradable and eco-friendly',
      'Excellent breathability prevents moisture buildup',
      'High friction surface prevents slipping during stacking',
      'Highly durable and reusable',
      'Zero synthetic microplastics',
      'Maintains product freshness longer'
    ],
    manufacturingSteps: [
      { title: 'Selection & Grading', desc: 'Selecting premium raw jute fibers.', icon: Zap },
      { title: 'Spinning', desc: 'Spinning the natural fibers into strong jute yarn.', icon: Settings },
      { title: 'Weaving', desc: 'Weaving the yarn into hessian or sacking cloth.', icon: Target },
      { title: 'Finishing', desc: 'Cutting, sewing with food-grade oil, and printing.', icon: Box }
    ],
    finishes: ['A-Twill', 'B-Twill', 'Hessian Cloth', 'Food Grade (VOT)', 'Hydrocarbon Free'],
    applications: ['Potatoes & Onions', 'Coffee Beans', 'Cocoa', 'Nuts', 'Tobacco', 'Export Grains'],
    faqs: [
      { q: 'Are your jute bags food grade?', a: 'Yes, we offer Vegetable Oil Treated (VOT) jute bags that are completely hydrocarbon-free and safe for food contact.' },
      { q: 'Do you export jute bags?', a: 'Yes, we export high-quality jute sacks globally, complying with international packaging regulations.' }
    ]
  }
};

const FAQItem = ({ faq }: { faq: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-white/10 rounded-[24px] bg-white/5 overflow-hidden transition-colors hover:bg-white/10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 lg:px-8 py-6 flex items-center justify-between text-left"
      >
        <span className="text-xl font-bold">{faq.q}</span>
        <ChevronDown className={`w-6 h-6 text-[#00C878] transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 lg:px-8 pb-6 text-white/70 leading-relaxed border-t border-white/5 pt-6">
              {faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function CategoryDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [apiCategory, setApiCategory] = useState<any>(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setIsLoadingCategory(true);
        setIsLoading(true);

        // Fetch category details from API
        const categories = await api.categories.getAll();
        const foundCategory = Array.isArray(categories) 
          ? categories.find((c: any) => c.slug === slug || c._id === slug || c.name?.toLowerCase().replace(/\s+/g, '-') === slug)
          : null;
        
        if (foundCategory) {
          setApiCategory(foundCategory);
        }

        // Fetch products
        const allProducts = await api.products.getAll();
        const prodList = Array.isArray(allProducts) ? allProducts : (allProducts as any)?.data || [];
        
        // Filter products robustly by category name OR product name
        const filtered = prodList.filter((p: any) => {
          if (!slug) return false;
          
          // Direct ID or Exact Slug Match
          if (foundCategory && (p.category === foundCategory._id || p.category?._id === foundCategory._id)) {
            return true;
          }

          const catName = (typeof p.category === 'string' ? p.category : p.category?.name || '').toLowerCase();
          const prodName = (p.name || '').toLowerCase();
          
          const matches = (term: string, antiTerm?: string) => {
            const hasTerm = catName.includes(term) || prodName.includes(term);
            if (antiTerm) {
              return hasTerm && !catName.includes(antiTerm) && !prodName.includes(antiTerm);
            }
            return hasTerm;
          };

          if (slug.includes('hdpe')) return matches('hdpe');
          if (slug.includes('bopp')) return matches('bopp');
          if (slug === 'pp-bags' || slug === 'pp-woven-bags') return matches('pp', 'bopp') && !matches('bulk');
          if (slug.includes('bulk') || slug.includes('fibc')) return matches('bulk') || matches('fibc');
          if (slug.includes('jute')) return matches('jute');
          
          return false;
        });
        
        setProducts(filtered);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoadingCategory(false);
        setIsLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [slug]);

  // Merge API data with Fallback data if category is in hardcoded map
  const fallback = slug && categoryContentData[slug] ? categoryContentData[slug] : null;
  const content = apiCategory ? {
    title: apiCategory.name,
    subtitle: apiCategory.description || fallback?.subtitle || `Premium ${apiCategory.name} solutions for your business.`,
    image: apiCategory.categoryImage || apiCategory.image || fallback?.image || 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&q=80',
    intro: fallback?.intro || apiCategory.description || `Explore our high-quality ${apiCategory.name}. Engineered for maximum durability and efficiency.`,
    features: apiCategory.features || fallback?.features || ['High Quality', 'Durable', 'Cost Effective'],
    manufacturingSteps: fallback?.manufacturingSteps || [],
    finishes: fallback?.finishes || [],
    applications: fallback?.applications || [],
    faqs: fallback?.faqs || []
  } : fallback;

  if (isLoadingCategory) {
    return <div className="pt-32 pb-20 text-center min-h-[60vh] flex items-center justify-center font-bold text-slate-500">Loading Configuration...</div>;
  }

  if (!content) {
    return (
      <div className="pt-32 pb-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-navy mb-4">Category Not Found</h1>
        <Link to="/categories" className="text-[#00C878] font-bold hover:underline">Return to Categories</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{content.title} - Sundar Corporation</title>
        <meta name="description" content={content.intro} />
      </Helmet>

      <IndustrialBackground />
      <Navbar />

      <main className="relative z-10">
        
        {/* HERO SECTION */}
        <section className="relative min-h-[70vh] lg:min-h-[80vh] flex items-center justify-center bg-navy text-white overflow-hidden pt-20">
          <div className="absolute inset-0 z-0">
            <motion.img 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10, ease: "easeOut" }}
              src={content.image} 
              alt={content.title} 
              className="w-full h-full object-cover opacity-30" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/50 to-transparent"></div>
          </div>
          
          <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="max-w-4xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-2 text-[10px] font-bold text-[#00C878] tracking-[0.2em] uppercase mb-8"
              >
                <Link to="/" className="hover:text-white transition-colors">HOME</Link>
                <ChevronRight className="w-4 h-4" />
                <Link to="/categories" className="hover:text-white transition-colors">CATEGORIES</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">{slug?.replace(/-/g, ' ')}</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl lg:text-[72px] font-black leading-[1.1] tracking-tight mb-6"
              >
                {content.title}
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl lg:text-2xl text-slate-300 max-w-2xl mb-10 leading-relaxed font-medium"
              >
                {content.subtitle}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <a href="#products" className="bg-[#00C878] hover:bg-[#00A865] text-navy px-8 py-4 rounded-full font-bold transition-all shadow-[0_0_40px_rgba(0,200,120,0.3)] hover:shadow-[0_0_60px_rgba(0,200,120,0.5)] flex items-center gap-2 group text-sm tracking-[0.1em] uppercase">
                  Explore Products
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* INTRODUCTION & FEATURES */}
        <section className="py-24 lg:py-32 bg-white relative">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-center">
              
              <div className="lg:col-span-6">
                <div className="text-[10px] font-bold text-[#64748B] tracking-[0.2em] uppercase mb-4">
                  01 // Overview
                </div>
                <h2 className="text-4xl lg:text-[52px] font-black text-navy tracking-tight leading-tight mb-8">
                  Engineered for <span className="text-[#00C878]">Durability.</span>
                </h2>
                <p className="text-slate-600 text-lg lg:text-xl leading-relaxed mb-12">
                  {content.intro}
                </p>

                <div className="grid sm:grid-cols-2 gap-6">
                  {content.features.map((feature: string, idx: number) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-[#F5F7F6] p-6 rounded-[24px] border border-[#E5E7EB] hover:shadow-xl hover:-translate-y-1 transition-all group"
                    >
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:bg-[#00C878] transition-colors">
                        <CheckCircle2 className="w-6 h-6 text-[#00C878] group-hover:text-white transition-colors" />
                      </div>
                      <h4 className="font-bold text-navy leading-snug">{feature}</h4>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-6 relative">
                <div className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl relative">
                  <img src={content.image} alt={content.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent"></div>
                  
                  <div className="absolute bottom-6 left-6 right-6 lg:bottom-10 lg:left-10 lg:right-10">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 lg:p-8 rounded-[32px] text-white shadow-xl">
                      <div className="flex items-center gap-4 mb-4">
                        <Shield className="w-8 h-8 text-[#00C878]" />
                        <h4 className="text-2xl font-black">Quality Assured</h4>
                      </div>
                      <p className="text-white/80 font-medium">Every product undergoes rigorous testing to meet international standards for strength, safety, and reliability.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* MANUFACTURING PROCESS */}
        {content.manufacturingSteps.length > 0 && (
          <section className="py-24 lg:py-32 bg-navy text-white overflow-hidden relative">
            {/* Subtle Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00C878]/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
              <div className="mb-16 lg:mb-24 text-center">
                <div className="text-[10px] font-bold text-[#00C878] tracking-[0.2em] uppercase mb-4">
                  02 // Production
                </div>
                <h2 className="text-4xl lg:text-[52px] font-black tracking-tight">How It's Made</h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {content.manufacturingSteps.map((step: any, idx: number) => (
                  <div key={idx} className="relative group">
                    {/* Connecting Line */}
                    {idx < content.manufacturingSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-[40px] left-[60%] w-[100%] h-[2px] bg-white/10 z-0">
                        <div className="absolute top-0 left-0 h-full bg-[#00C878] w-0 group-hover:w-full transition-all duration-700"></div>
                      </div>
                    )}

                    <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] hover:bg-white/10 transition-all duration-500 relative z-10 hover:-translate-y-2 h-full flex flex-col">
                      <div className="text-[80px] font-black text-white/5 absolute -top-6 -right-2 pointer-events-none select-none">
                        0{idx + 1}
                      </div>
                      <div className="w-20 h-20 bg-white/10 rounded-[24px] flex items-center justify-center mb-8 backdrop-blur-sm border border-white/10 group-hover:bg-[#00C878] transition-colors duration-500">
                        <step.icon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                      <p className="text-white/60 leading-relaxed font-medium flex-grow">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FINISHES & APPLICATIONS */}
        <section className="py-24 lg:py-32 bg-[#F5F7F6]">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
              
              {/* Finishes */}
              {content.finishes.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-[#64748B] tracking-[0.2em] uppercase mb-4">
                    03 // Customization
                  </div>
                  <h2 className="text-4xl lg:text-[42px] font-black text-navy tracking-tight mb-8">
                    Available Finishes
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {content.finishes.map((finish: string, idx: number) => (
                      <div key={idx} className="bg-white border border-[#E5E7EB] px-6 py-4 rounded-full flex items-center gap-3 hover:border-[#00C878] hover:shadow-lg transition-all cursor-default group">
                        <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-[#00C878] transition-colors"></div>
                        <span className="font-bold text-navy">{finish}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Applications */}
              {content.applications.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-[#64748B] tracking-[0.2em] uppercase mb-4">
                    04 // Usage
                  </div>
                  <h2 className="text-4xl lg:text-[42px] font-black text-navy tracking-tight mb-8">
                    Industries We Serve
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {content.applications.map((app: string, idx: number) => (
                      <div key={idx} className="bg-white p-6 rounded-[24px] border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4 hover:shadow-[0_8px_30px_rgba(0,200,120,0.1)] transition-all">
                        <div className="w-12 h-12 bg-[#00C878]/10 text-[#00C878] rounded-xl flex items-center justify-center flex-shrink-0">
                          <Factory className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-navy text-lg">{app}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* PRODUCTS */}
        <section id="products" className="py-24 lg:py-32 bg-white">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <div className="text-[10px] font-bold text-[#64748B] tracking-[0.2em] uppercase mb-4">
                  05 // Range
                </div>
                <h2 className="text-4xl lg:text-[52px] font-black text-navy tracking-tight">
                  Explore The Collection
                </h2>
              </div>
              <Link to="/products" className="inline-flex items-center gap-2 text-[11px] font-bold text-[#00C878] tracking-[0.2em] uppercase hover:text-navy transition-colors group">
                View All Products <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-[3/4] bg-slate-100 animate-pulse rounded-[32px]"></div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {products.slice(0, 8).map((product) => (
                  <Link 
                    key={product.id} 
                    to={`/products/${product.id}`}
                    className="group relative bg-[#F5F7F6] rounded-[32px] overflow-hidden hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-500 border border-[#E5E7EB] flex flex-col h-full"
                  >
                    <div className="aspect-square relative p-8 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <ImagePlaceholder className="rounded-2xl" />
                      )}
                    </div>
                    <div className="p-8 pt-0 flex flex-col flex-grow bg-white">
                      <div className="pt-8 border-t border-slate-100 flex-grow flex flex-col">
                        <h3 className="text-2xl font-black text-navy mb-3 line-clamp-2">{product.name}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow font-medium">
                          {product.description || "Industrial specification tailored for demanding logistics and bulk handling."}
                        </p>
                        <div className="inline-flex items-center gap-2 text-[11px] font-bold text-navy tracking-[0.2em] uppercase group-hover:text-[#00C878] transition-colors mt-auto">
                          View Specs <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-[#F5F7F6] p-16 rounded-[32px] border border-[#E5E7EB] text-center">
                <Box className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-navy mb-4">No Products Found</h3>
                <p className="text-slate-500 text-lg font-medium">We are currently updating our catalog for this category.</p>
              </div>
            )}
          </div>
        </section>

        {/* FAQS */}
        {content.faqs.length > 0 && (
          <section className="py-24 lg:py-32 bg-[#08131F] text-white">
            <div className="max-w-[1000px] mx-auto px-6 lg:px-12">
              <div className="text-center mb-16">
                <div className="text-[10px] font-bold text-[#00C878] tracking-[0.2em] uppercase mb-4">
                  06 // Support
                </div>
                <h2 className="text-4xl lg:text-[52px] font-black tracking-tight">Frequently Asked Questions</h2>
              </div>
              
              <div className="space-y-4">
                {content.faqs.map((faq: any, idx: number) => (
                  <FAQItem key={idx} faq={faq} />
                ))}
              </div>
            </div>
          </section>
        )}

      </main>

      <Footer />
    </>
  );
}
