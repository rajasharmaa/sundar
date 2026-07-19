import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, Heart, MessageSquare, ArrowRight, Sparkles, Package, Settings, ArrowUpRight } from 'lucide-react';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import { DashboardSkeleton } from '@/components/skeletons/SkeletonLoader';

interface DashboardTabProps {
  user: any;
  wishlistCount: number;
  inquiriesCount: number;
  activeTheme: {
    primary: string;
    text: string;
    shadow: string;
  };
  isHindi: boolean;
  onTabChange: (tabId: string) => void;
  navigate: (path: string) => void;
}

const DashboardTab = ({
  user,
  wishlistCount,
  inquiriesCount,
  activeTheme,
  isHindi,
  onTabChange,
  navigate
}: DashboardTabProps) => {

  // Hoisted regular function to calculate profile completeness score (Issue 1)
  function calculateCompletion() {
    let score = 30; // base score for email & register
    if (user?.name) score += 20;
    if (user?.phone) score += 20;
    if (user?.businessName) score += 15;
    if (user?.avatarColor) score += 15;
    return score;
  }

  const { data: userStats, isLoading: loadingStats } = useQuery({
    queryKey: ['user-stats', user?.id, wishlistCount, inquiriesCount],
    queryFn: async () => {
      // Simulated B2B stats calculation loading delay
      await new Promise(resolve => setTimeout(resolve, 600));
      return {
        profileCompletion: calculateCompletion(),
        wishlistCount,
        inquiriesCount,
      };
    },
    enabled: !!user,
  });

  // Animation Variant Helpers
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
          <h2 className="text-2xl font-bold text-slate-900">
            {isHindi ? 'खाता सारांश' : 'Dashboard Overview'}
          </h2>
          <p className="text-slate-500 mt-1">
            {isHindi ? 'आपके व्यावसायिक इंटरैक्शन के रीयल-टाइम आँकड़े' : 'Real-time statistics of your business interactions'}
          </p>
        </div>
      </div>

      {loadingStats ? (
        <DashboardSkeleton />
      ) : (
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Stat 1: Account Health */}
          <motion.div 
            variants={scaleItem}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:border-slate-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-slate-900">{userStats?.profileCompletion}%</span>
            </div>
            <h3 className="font-bold text-slate-700">{isHindi ? 'खाता पूर्णता' : 'Account Completeness'}</h3>
            <div className="w-full bg-slate-100 h-2.5 rounded-full mt-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${userStats?.profileCompletion}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`${activeTheme.primary} h-full rounded-full`}
              />
            </div>
          </motion.div>

          {/* Stat 2: Wishlist Count */}
          <motion.div 
            variants={scaleItem}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:border-slate-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <span className="text-2xl font-black text-slate-900">{userStats?.wishlistCount}</span>
            </div>
            <h3 className="font-bold text-slate-700">{isHindi ? 'सहेजे गए उत्पाद' : 'Saved Products'}</h3>
            <button 
              onClick={() => onTabChange('wishlist')} 
              className={`text-sm font-bold mt-2 flex items-center gap-1 hover:underline ${activeTheme.text}`}
            >
              {isHindi ? 'सूची देखें' : 'View Wishlist'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* Stat 3: Active Inquiries */}
          <motion.div 
            variants={scaleItem}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:border-slate-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-slate-900">{userStats?.inquiriesCount}</span>
            </div>
            <h3 className="font-bold text-slate-700">{isHindi ? 'सक्रिय पूछताछ टिकट' : 'Active Inquiries'}</h3>
            <button 
              onClick={() => onTabChange('inquiries')} 
              className={`text-sm font-bold mt-2 flex items-center gap-1 hover:underline ${activeTheme.text}`}
            >
              {isHindi ? 'स्थिति जाँचे' : 'Check Status'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Quick Actions Panel */}
      <div className="mt-8 bg-slate-900 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl" />
        <h3 className="text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          {isHindi ? 'त्वरित विकल्प' : 'Quick Actions'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          <button 
            onClick={() => navigate('/products')} 
            className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 text-white">
              <Package className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">{isHindi ? 'उत्पाद कैटलॉग देखें' : 'Browse Catalog'}</span>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          </button>
          <button 
            onClick={() => onTabChange('profile')} 
            className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 text-white">
              <Settings className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold">{isHindi ? 'खाता सेटिंग्स' : 'Account Settings'}</span>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>

      {/* Recently Viewed Panel */}
      <div className="mt-8 pt-8 border-t border-slate-100">
        <RecentlyViewed limit={5} showClearButton={true} />
      </div>
    </div>
  );
};

export default DashboardTab;
