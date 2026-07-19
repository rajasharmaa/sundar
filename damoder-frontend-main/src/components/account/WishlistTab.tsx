import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CardSkeleton } from '@/components/skeletons/SkeletonLoader';
import { getOptimizedUrl } from '@/lib/utils';
import { type Product as ApiProduct } from '@/services/api/api-client';

interface WishlistTabProps {
  wishlist: ApiProduct[];
  wishlistLoading: boolean;
  toggleWishlist: (product: ApiProduct) => void;
  isHindi: boolean;
  activeTheme: {
    primary: string;
    text: string;
    shadow: string;
    borderHover: string;
  };
  navigate: (path: string) => void;
}

const WishlistTab = ({
  wishlist,
  wishlistLoading,
  toggleWishlist,
  isHindi,
  activeTheme,
  navigate
}: WishlistTabProps) => {

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const scaleItem = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            {isHindi ? 'सहेजे गए उत्पाद (विशलिस्ट)' : 'Saved Products'}
          </h2>
          <p className="text-slate-500 mt-1">
            {isHindi ? 'वे उत्पाद जिन्हें आप बाद में खरीदने में रुचि रखते हैं' : "Items you're interested in purchasing"}
          </p>
        </div>
      </div>

      {wishlistLoading ? (
        <CardSkeleton count={3} />
      ) : wishlist.length > 0 ? (
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {wishlist.map((product: ApiProduct) => (
            <motion.div 
              key={product.id || product._id} 
              variants={scaleItem}
              whileHover={{ y: -6 }}
              className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-300 transition-all duration-300 flex flex-col"
            >
              <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                {/* Safe image fallback implementation (Issue 8) */}
                <img 
                  src={getOptimizedUrl(
                    product.image || 
                    product.images?.[0] || 
                    '/placeholder.svg'
                  )} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
                />
                <button 
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm text-rose-500 hover:bg-rose-50 hover:scale-110 transition-all z-10"
                  aria-label={isHindi ? 'पसंदीदा से हटाएं' : 'Remove from wishlist'} // Issue 11
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>
              <div className="p-5 flex flex-col items-start flex-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full mb-3 inline-block border border-blue-100">
                  {product.category}
                </span>
                <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">{product.description}</p>
                <Link 
                  to={`/products/${product.id || product._id}`} 
                  className={`w-full py-2.5 bg-slate-50 hover:text-white border border-slate-200 text-slate-700 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn ${activeTheme.borderHover} hover:bg-blue-600 hover:border-blue-600`}
                >
                  {isHindi ? 'विवरण देखें' : 'View Details'}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-rose-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {isHindi ? 'कोई सहेजा गया उत्पाद नहीं' : 'No Saved Items'}
          </h3>
          <p className="text-slate-500 max-w-sm mb-6">
            {isHindi ? 'आपने अभी तक अपनी विशलिस्ट में कोई उत्पाद नहीं जोड़ा है।' : "You haven't added any products to your wishlist yet."}
          </p>
          <button onClick={() => navigate('/products')} className={`px-6 py-3 text-white font-bold rounded-xl transition-colors shadow-lg ${activeTheme.primary} ${activeTheme.shadow}`}>
            {isHindi ? 'कैटलॉग ब्राउज़ करें' : 'Browse Catalog'}
          </button>
        </div>
      )}
    </div>
  );
};

export default WishlistTab;
