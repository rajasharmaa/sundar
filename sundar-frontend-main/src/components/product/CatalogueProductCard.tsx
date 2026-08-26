import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface Product {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  category: string;
  imageUrl?: string;
  image?: string;
  sizeOptions?: any[];
  brand?: string;
  inStock?: boolean;
}

interface CatalogueProductCardProps {
  product: Product;
  isFeatured?: boolean; // If true, make it a larger 2-column card in the grid
}

export const CatalogueProductCard: React.FC<CatalogueProductCardProps> = ({ product, isFeatured }) => {
  const { settings } = useSiteSettings();
  const productId = product.slug || product._id || product.id;

  // Safe image resolution
  const imageSrc = product.imageUrl || product.image || '/assets/masterbatch.png'; // Fallback

  // Normalize category for display
  const displayCategory = useMemo(() => {
    const cat = (product.category || '').toUpperCase();
    if (cat.includes('HDPE')) return 'HDPE PACKAGING';
    if (cat.includes('PP') || cat.includes('WOVEN')) return 'PP WOVEN SOLUTIONS';
    if (cat.includes('BOPP')) return 'BOPP LAMINATED';
    if (cat.includes('FIBC') || cat.includes('BULK')) return 'FIBC BULK BAGS';
    return cat || 'INDUSTRIAL PACKAGING';
  }, [product.category]);

  // Construct metadata string (e.g., BRAND • SIZE)
  const metadata = useMemo(() => {
    const parts = [];
    if (product.brand) parts.push(product.brand);

    if (product.sizeOptions && Array.isArray(product.sizeOptions) && product.sizeOptions.length > 0) {
      // Find range or just first size
      const sizes = product.sizeOptions.map(s => s.size).filter(Boolean);
      if (sizes.length === 1) parts.push(sizes[0]);
      else if (sizes.length > 1) parts.push(`${sizes.length} Sizes Available`);
    } else {
      parts.push('CUSTOM PRINT');
    }

    return parts.length > 0 ? parts.join(' • ') : 'CUSTOM SPECIFICATIONS';
  }, [product.brand, product.sizeOptions]);

  return (
    <Link to={`/products/${productId}`} className={`block group h-full ${isFeatured ? 'md:col-span-2' : ''} pt-4`}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3 }}
        className="relative flex flex-col h-full bg-white rounded-t-full rounded-b-[32px] shadow-sm overflow-visible transition-all duration-300 hover:shadow-2xl"
      >
        {/* NEW Badge */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-emerald-700 text-xs font-black tracking-widest px-5 py-1.5 rounded-full shadow-md z-20 border border-emerald-600/20">
          NEW
        </div>

        {/* Top Arch Image Area */}
        <div className={`relative bg-gradient-to-b from-emerald-50/70 to-emerald-50/10 rounded-t-full flex items-center justify-center p-8 pt-12 overflow-hidden ${isFeatured ? 'aspect-[4/3] md:aspect-[3/2]' : 'aspect-square md:aspect-[4/5]'}`}>

          {/* Subtle decoration in background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#d1fae5_0%,_transparent_60%)]"></div>

          {/* White scanning brackets overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[65%] z-10 pointer-events-none opacity-80">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-white rounded-tl-2xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-white rounded-tr-2xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-white rounded-bl-2xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-white rounded-br-2xl"></div>
          </div>

          <motion.img
            src={imageSrc}
            alt={product.name}
            className="relative z-20 w-3/4 h-3/4 object-contain filter drop-shadow-xl"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = settings.manufacturingImage || '/manufacturing.jpg';
              (e.target as HTMLImageElement).classList.remove('object-contain');
              (e.target as HTMLImageElement).classList.add('object-cover', 'opacity-50', 'rounded-full');
            }}
          />

        </div>

        {/* Content Area */}
        <div className="pt-4 pb-10 px-6 flex flex-col flex-grow text-center relative bg-white rounded-b-[32px]">

          {/* Product Name */}
          <h3 className="font-black text-emerald-700 text-xl md:text-2xl mb-5 leading-tight">
            {product.name}
          </h3>

          {/* Thin line with View Details Pill */}
          <div className="relative w-full h-[2px] bg-emerald-600/20 my-2 flex justify-center items-center">
            <div className="bg-emerald-600 text-white text-xs font-black px-4 py-1.5 rounded-full z-10 tracking-widest shadow-md">
              VIEW DETAILS
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-400 font-medium leading-relaxed mt-5 px-2 line-clamp-2">
            {product.description || "High-performance industrial packaging engineered for ultimate strength and durability."}
          </p>
        </div>
      </motion.div>
    </Link>
  );
};


