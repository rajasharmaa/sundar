import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, Box, CheckCircle2, ChevronRight, FileText, ArrowRight, Settings } from 'lucide-react';
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
    finishes: ['Plain Unprinted', 'Flexo Printed', 'Gusseted', 'Valve Type', 'Lined (with inner PE liner)'],
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
    finishes: ['Laminated', 'Unlaminated', 'Perforated (for breathability)', 'Transparent/Translucent'],
    applications: ['Flour & Grain', 'Pulses & Spices', 'Salt', 'Seeds', 'Sand', 'Metal Parts'],
    faqs: [
      { q: 'Can you print my logo in multiple colors?', a: 'Yes, we offer high-quality flexographic printing up to 6 colors on PP woven sacks.' },
      { q: 'What is the difference between PP and HDPE?', a: 'PP offers better clarity, is slightly more rigid, and can withstand higher temperatures compared to HDPE.' }
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
    finishes: ['High Gloss', 'Matte Finish', 'Metallic/Holographic', 'Window (to see product inside)'],
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
    finishes: ['U-Panel', 'Circular/Tubular', 'Baffle Bags (Shape Retaining)', 'Conductive (Type C/D)', 'UN Certified'],
    applications: ['Mining & Minerals', 'Construction Materials', 'Petrochemicals', 'Agriculture Bulk Export', 'Waste Management'],
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
      { title: 'Finishing', desc: 'Cutting, sewing with food-grade oil (hydrocarbon-free), and printing.', icon: Box }
    ],
    finishes: ['A-Twill', 'B-Twill', 'Hessian Cloth', 'Food Grade (VOT)', 'Hydrocarbon Free'],
    applications: ['Potatoes & Onions', 'Coffee Beans', 'Cocoa', 'Nuts', 'Tobacco', 'Export Grains'],
    faqs: [
      { q: 'Are your jute bags food grade?', a: 'Yes, we offer Vegetable Oil Treated (VOT) jute bags that are completely hydrocarbon-free and safe for food contact.' },
      { q: 'Do you export jute bags?', a: 'Yes, we export high-quality jute sacks globally, complying with international packaging regulations.' }
    ]
  }
};

export default function CategoryDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [apiCategory, setApiCategory] = useState<any>(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // We will declare content below after fetching

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
        
        // Filter products robustly by category name OR product name (in case category is unpopulated ObjectId)
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
    return <div className="pt-32 pb-20 text-center min-h-[60vh] flex items-center justify-center">Loading...</div>;
  }

  if (!content) {
    // If not a main category, redirect or show simple listing
    return (
      <div className="pt-32 pb-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
        <Link to="/categories" className="text-green-600 hover:underline">Return to Categories</Link>
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

      <main className="relative z-10 pt-24 pb-20">
        
        {/* HERO SECTION */}
        <section className="bg-navy text-white py-16 lg:py-24 relative overflow-hidden">
           <div className="absolute inset-0 z-0">
             <img src={content.image} alt={content.title} className="w-full h-full object-cover opacity-20" />
             <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-transparent"></div>
           </div>
           <div className="max-w-7xl mx-auto px-6 relative z-10">
             <div className="flex items-center gap-2 text-sm text-green-400 mb-6 font-semibold tracking-wider">
               <Link to="/" className="hover:text-white transition-colors">HOME</Link>
               <ChevronRight className="w-4 h-4" />
               <Link to="/categories" className="hover:text-white transition-colors">CATEGORIES</Link>
               <ChevronRight className="w-4 h-4" />
               <span className="text-white uppercase">{slug?.replace(/-/g, ' ')}</span>
             </div>
             <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight max-w-3xl">
               {content.title}
             </h1>
             <p className="text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed">
               {content.subtitle}
             </p>
             <div className="flex flex-wrap gap-4">
               <Link to="/contact" className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-green-900/20 flex items-center gap-2 group">
                 Get Best Quote
                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </Link>
             </div>
           </div>
        </section>

        {/* INTRODUCTION & FEATURES */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-navy mb-6">Introduction</h2>
                <p className="text-slate-600 text-lg leading-relaxed mb-8">
                  {content.intro}
                </p>
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                  <h3 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-green-600" />
                    Key Features
                  </h3>
                  <ul className="space-y-4">
                    {content.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                   <img src={content.image} alt={content.title} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-xs hidden md:block">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-navy">100%</div>
                      <div className="text-sm font-semibold text-slate-500">Quality Assured</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MANUFACTURING PROCESS */}
        <section className="py-20 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-navy mb-4">Our Manufacturing Process</h2>
              <p className="text-slate-600 text-lg">State-of-the-art facilities ensuring precision at every step of production.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {content.manufacturingSteps.map((step: any, idx: number) => (
                <div key={idx} className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 relative group hover:-translate-y-1 transition-all">
                  <div className="w-16 h-16 bg-navy text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:bg-green-600 transition-colors">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <div className="text-green-600 font-black text-sm tracking-widest mb-2 uppercase">Step 0{idx + 1}</div>
                  <h3 className="text-xl font-bold text-navy mb-3">{step.title}</h3>
                  <p className="text-slate-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINISHES & APPLICATIONS */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-navy p-10 rounded-3xl text-white">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <Box className="w-6 h-6 text-green-400" />
                  Types of Finishes Available
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {content.finishes.map((finish: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 bg-white/10 p-4 rounded-xl border border-white/10">
                       <CheckCircle2 className="w-5 h-5 text-green-400" />
                       <span className="font-medium">{finish}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-green-50 p-10 rounded-3xl border border-green-100">
                <h3 className="text-2xl font-bold text-navy mb-8 flex items-center gap-3">
                  <Target className="w-6 h-6 text-green-600" />
                  Industries We Serve
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {content.applications.map((app: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                       <CheckCircle2 className="w-5 h-5 text-green-600" />
                       <span className="font-medium text-navy">{app}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCTS IN THIS CATEGORY */}
        <section className="py-20 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-3xl font-bold text-navy mb-4">Our Products</h2>
                <p className="text-slate-600 text-lg">Browse our range of {content.title.replace('Manufacturer', '')}</p>
              </div>
              <Link to="/products" className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-2">
                View All Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-2xl"></div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 8).map((product) => (
                  <Link 
                    key={product.id} 
                    to={`/products/${product.id}`}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full"
                  >
                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <ImagePlaceholder className="w-full h-full" />
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-bold text-navy text-lg mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-grow">
                        {product.description || "High quality packaging solution by Sundar Corporation."}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">
                          View Details
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-green-600 transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-navy mb-2">No Products Found</h3>
                <p className="text-slate-500">We are updating our catalog for this category.</p>
              </div>
            )}
          </div>
        </section>

        {/* FAQS */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-navy mb-4">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-6">
              {content.faqs.map((faq: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="text-lg font-bold text-navy mb-3 flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm mt-0.5">Q</div>
                    {faq.q}
                  </h4>
                  <p className="text-slate-600 pl-9">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
