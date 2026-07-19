// pages/Account.tsx
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User, MessageSquare, LogOut, Shield, Clock, Heart, Settings, CheckCircle
} from 'lucide-react';

import MobileTabNav from '@/components/account/MobileTabNav';
import AccountSidebar from '@/components/account/AccountSidebar';
import DashboardTab from '@/components/account/DashboardTab';
import ProfileTab from '@/components/account/ProfileTab';
import WishlistTab from '@/components/account/WishlistTab';
import InquiryTab from '@/components/account/InquiryTab';
import RecentlyViewedTab from '@/components/account/RecentlyViewedTab';
import { ProfileSkeleton } from '@/components/skeletons/SkeletonLoader';
import { useAuth } from '@/context/AuthContext';
import { api } from '../services/api/api-client';
import { useWishlist } from '@/context/WishlistContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import logger from '@/lib/logger';

interface Inquiry {
  _id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  phone?: string;
  companyName?: string;
  productName?: string;
  city?: string;
  state?: string;
  country?: string;
  replyMessage?: string;
  replySubject?: string;
  repliedAt?: string;
  updatedAt?: string;
}

// 🎨 Theme Color Mapping
const themeColorMap = {
  blue: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    text: 'text-blue-600',
    border: 'border-blue-600',
    accent: 'bg-blue-50 text-blue-700',
    focus: 'focus:ring-blue-500/20 focus:border-blue-500',
    gradient: 'from-blue-600 to-indigo-700',
    light: 'bg-blue-50',
    shadow: 'shadow-blue-600/10 hover:shadow-blue-600/20',
    ring: 'ring-blue-500/20',
    borderHover: 'hover:border-blue-400'
  },
  emerald: {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    text: 'text-emerald-600',
    border: 'border-emerald-600',
    accent: 'bg-emerald-50 text-emerald-700',
    focus: 'focus:ring-emerald-500/20 focus:border-emerald-500',
    gradient: 'from-emerald-600 to-teal-700',
    light: 'bg-emerald-50',
    shadow: 'shadow-emerald-600/10 hover:shadow-emerald-600/20',
    ring: 'ring-emerald-500/20',
    borderHover: 'hover:border-emerald-400'
  },
  indigo: {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    text: 'text-indigo-600',
    border: 'border-indigo-600',
    accent: 'bg-indigo-50 text-indigo-700',
    focus: 'focus:ring-indigo-500/20 focus:border-indigo-500',
    gradient: 'from-indigo-600 to-purple-700',
    light: 'bg-indigo-50',
    shadow: 'shadow-indigo-600/10 hover:shadow-indigo-600/20',
    ring: 'ring-indigo-500/20',
    borderHover: 'hover:border-indigo-400'
  },
  rose: {
    primary: 'bg-rose-600 hover:bg-rose-700 text-white',
    text: 'text-rose-600',
    border: 'border-rose-600',
    accent: 'bg-rose-50 text-rose-700',
    focus: 'focus:ring-rose-500/20 focus:border-rose-500',
    gradient: 'from-rose-600 to-pink-700',
    light: 'bg-rose-50',
    shadow: 'shadow-rose-600/10 hover:shadow-rose-600/20',
    ring: 'ring-rose-500/20',
    borderHover: 'hover:border-rose-400'
  },
  amber: {
    primary: 'bg-amber-600 hover:bg-amber-700 text-white',
    text: 'text-amber-600',
    border: 'border-amber-600',
    accent: 'bg-amber-50 text-amber-700',
    focus: 'focus:ring-amber-500/20 focus:border-amber-500',
    gradient: 'from-amber-600 to-orange-700',
    light: 'bg-amber-50',
    shadow: 'shadow-amber-600/10 hover:shadow-amber-600/20',
    ring: 'ring-amber-500/20',
    borderHover: 'hover:border-amber-400'
  }
};

// 🌟 Avatar Background Gradients
const avatarGradients = {
  sunset: 'from-orange-500 to-rose-500 text-white',
  emerald: 'from-emerald-500 to-teal-600 text-white',
  cosmic: 'from-indigo-600 to-purple-600 text-white',
  ocean: 'from-blue-500 to-cyan-500 text-white',
  charcoal: 'from-slate-700 to-slate-900 text-white'
};

// 🌟 Background glow colors mapped to theme setting (Issue 5)
const glowColors = {
  blue: { top: 'bg-blue-600/10', bottom: 'bg-cyan-600/10' },
  emerald: { top: 'bg-emerald-600/10', bottom: 'bg-teal-600/10' },
  indigo: { top: 'bg-indigo-600/10', bottom: 'bg-purple-600/10' },
  rose: { top: 'bg-rose-600/10', bottom: 'bg-pink-600/10' },
  amber: { top: 'bg-amber-600/10', bottom: 'bg-orange-600/10' }
};

const Account = () => {
  const navigate = useNavigate();
  const { user, logout, checkAuth } = useAuth();
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  const [activeTab, setActiveTab] = useState('dashboard');
  const { wishlist, toggleWishlist, isLoading: wishlistLoading } = useWishlist();

  // Dynamic values reactive to AuthContext values
  const themeColor = user?.themeColor || 'blue';
  const avatarColor = user?.avatarColor || 'ocean';
  const name = user?.name || '';
  const businessName = user?.businessName || '';

  // Read current layout theme style
  const activeTheme = themeColorMap[themeColor as keyof typeof themeColorMap] || themeColorMap.blue;
  const activeGlow = glowColors[themeColor as keyof typeof glowColors] || glowColors.blue;

  // React query inquiries query (Issue 9: custom state updates removed to prevent race conditions)
  const { data: inquiries = [], isLoading: loadingInquiries, error: inquiriesError } = useQuery({
    queryKey: ['inquiries', user?.id],
    queryFn: async () => {
      try {
        const result = await api.inquiries.getUserInquiries();
        return (result || []) as Inquiry[];
      } catch (error: unknown) {
        logger.error('Inquiries fetch error', error);
        return [] as Inquiry[];
      }
    },
    enabled: !!user,
    refetchOnMount: 'always',
    staleTime: 2 * 60 * 1000,
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error: unknown) {
      logger.error('Logout error', error);
    }
  };

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              {isHindi ? 'प्रमाणीकरण हो रहा है...' : 'Authenticating...'}
            </h2>
            <p className="text-slate-600 mb-8">
              {isHindi ? 'आपके सुरक्षित डैशबोर्ड को तैयार किया जा रहा है' : 'Preparing your secure dashboard'}
            </p>
            <ProfileSkeleton />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const firstName = name.split(' ')?.[0] || 'User';

  const navigationTabs = [
    { id: 'dashboard', label: isHindi ? 'डैशबोर्ड' : 'Dashboard', icon: User, description: isHindi ? 'अवलेषण और आँकड़े' : 'Overview & quick stats' },
    { id: 'profile', label: isHindi ? 'मेरी प्रोफ़ाइल' : 'My Profile', icon: Settings, description: isHindi ? 'व्यक्तिगत और व्यवसाय विवरण' : 'Personal & B2B settings' },
    { id: 'wishlist', label: isHindi ? 'पसंदीदा उत्पाद' : 'Saved Products', icon: Heart, description: isHindi ? 'आपके सहेजे गए उत्पाद' : 'Your wishlist', badge: wishlist?.length || 0 },
    { id: 'recently-viewed', label: isHindi ? 'हाल ही में देखे गए' : 'Recently Viewed', icon: Clock, description: isHindi ? 'हाल ही में देखे गए उत्पाद' : 'Products you recently viewed' },
    { id: 'inquiries', label: isHindi ? 'सहायता टिकट' : 'Support Tickets', icon: MessageSquare, description: isHindi ? 'सक्रिय पूछताछ स्थिति' : 'Active inquiries', badge: inquiries?.length || 0 },
  ];

  // Get gradient background class for active avatar setting
  const getAvatarGradientClass = (gradientKey: string) => {
    return avatarGradients[gradientKey as keyof typeof avatarGradients] || avatarGradients.ocean;
  };

  return (
    <>
      <Helmet>
        <title>{isHindi ? 'मेरा खाता - दामोदर ट्रेडर्स' : 'My Dashboard - Damodar Traders'}</title>
        <meta name="description" content="Manage your Damodar Traders account and industrial orders." />
      </Helmet>

      <Navbar />

      {/* Modern B2B Premium Header */}
      <div className="relative bg-slate-950 pt-32 pb-24 overflow-hidden mt-16 md:mt-20">
        {/* Subtle background grid and glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        
        {/* Dynamic color glow circles depending on theme color setting (Issue 5) */}
        <div className={`absolute top-0 right-1/4 w-96 h-96 ${activeGlow.top} rounded-full blur-3xl pointer-events-none`} />
        <div className={`absolute bottom-0 left-1/4 w-96 h-96 ${activeGlow.bottom} rounded-full blur-3xl pointer-events-none`} />

        <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center justify-between gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full sm:w-auto"
            >
              {/* Dynamic Avatar with gradient preview (Issue 5) */}
              <motion.div 
                whileHover={{ rotate: 5, scale: 1.05 }}
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAvatarGradientClass(avatarColor)} p-[2px] shadow-lg shadow-blue-900/10 relative group shrink-0`}
              >
                <div className="w-full h-full rounded-2xl bg-slate-900/90 flex items-center justify-center text-3xl font-black tracking-tight text-white border border-white/5 backdrop-blur-md">
                  {name.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </div>
              </motion.div>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                  {isHindi ? 'स्वागत है,' : 'Welcome back,'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-400">{firstName}</span>
                </h1>
                <p className="text-slate-400 font-medium mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <Shield className={`w-4 h-4 ${activeTheme.text}`} />
                  {isHindi ? 'सत्यापित व्यावसायिक भागीदार' : 'Verified Business Partner'}
                  {businessName && (
                    <span className="text-slate-500 font-normal">
                      | {businessName}
                    </span>
                  )}
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-center w-full sm:w-auto"
            >
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all duration-300 shadow-lg shadow-black/10"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                {isHindi ? 'सुरक्षित लॉगआउट' : 'Secure Sign Out'}
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-16 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <AccountSidebar
            activeTab={activeTab}
            navigationTabs={navigationTabs}
            onTabChange={handleTabChange}
            activeTheme={activeTheme}
            isHindi={isHindi}
          />

          {/* Mobile Tab Navigation */}
          <MobileTabNav
            tabs={navigationTabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-4 sm:p-6 md:p-8 min-h-[600px]"
              >
                {/* 1. DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                  <DashboardTab
                    user={user}
                    wishlistCount={wishlist?.length || 0}
                    inquiriesCount={inquiries?.length || 0}
                    activeTheme={activeTheme}
                    isHindi={isHindi}
                    onTabChange={handleTabChange}
                    navigate={navigate}
                  />
                )}

                {/* 2. PROFILE TAB */}
                {activeTab === 'profile' && (
                  <ProfileTab
                    user={user}
                    checkAuth={checkAuth}
                    isHindi={isHindi}
                    activeTheme={activeTheme}
                    getAvatarGradientClass={getAvatarGradientClass}
                  />
                )}

                {/* 3. WISHLIST TAB */}
                {activeTab === 'wishlist' && (
                  <WishlistTab
                    wishlist={wishlist}
                    wishlistLoading={wishlistLoading}
                    toggleWishlist={toggleWishlist}
                    isHindi={isHindi}
                    activeTheme={activeTheme}
                    navigate={navigate}
                  />
                )}

                {/* 4. INQUIRIES TAB */}
                {activeTab === 'inquiries' && (
                  <InquiryTab
                    inquiries={inquiries}
                    loadingInquiries={loadingInquiries}
                    inquiriesError={inquiriesError}
                    isHindi={isHindi}
                    activeTheme={activeTheme}
                    navigate={navigate}
                  />
                )}

                {/* 5. RECENTLY VIEWED TAB */}
                {activeTab === 'recently-viewed' && (
                  <RecentlyViewedTab
                    isHindi={isHindi}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Account;