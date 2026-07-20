// components/Navbar.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Sparkles, User, LogOut, Heart, ArrowRight, Search, Phone, Mail, Clock, Languages, Eye, ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useRfq } from '@/context/RfqContext';
import { type User as UserType } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalSearch from '@/components/pages/GlobalSearch';
import { api } from '@/services/api/api-client';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AccessibilityWidget from '@/components/AccessibilityWidget';
import { useAccessibility } from '@/context/AccessibilityContext';
import { Layers, Sliders, Settings, Package, Shield } from 'lucide-react';
import { downloadCatalog } from '@/utils/catalogHelper';

import { useSiteSettings } from '@/hooks/useSiteSettings';

const getCategoryDetails = (name: string, isHindi: boolean) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('pipe')) {
    return {
      title: isHindi ? 'औद्योगिक पाइप' : 'Industrial Pipes',
      sub: isHindi ? 'सीमलेस और वेल्डेड' : 'Seamless & Welded ASTM',
      icon: Layers
    };
  }
  if (lowerName.includes('fitting')) {
    return {
      title: isHindi ? 'पाइप फिटिंग्स' : 'Precision Fittings',
      sub: isHindi ? 'उच्च दबाव फ्लैंगेस' : 'High Pressure Forging',
      icon: Settings
    };
  }
  if (lowerName.includes('valve')) {
    return {
      title: isHindi ? 'नियंत्रण वाल्व' : 'Control Valves',
      sub: isHindi ? 'गेट, ग्लोब और बॉल' : 'Gate, Globe & Ball API',
      icon: Sliders
    };
  }
  if (lowerName.includes('flange') || lowerName.includes('gasket')) {
    return {
      title: isHindi ? 'फ्लैंगेस और गास्केट' : 'Flanges & Gaskets',
      sub: isHindi ? 'रिसाव-मुक्त सील' : 'Leak-proof Seal Joints',
      icon: Shield
    };
  }
  // Default fallback
  return {
    title: name.charAt(0).toUpperCase() + name.slice(1),
    sub: isHindi ? 'गुणवत्ता प्रमाणित' : 'Certified Engineering',
    icon: Package
  };
};

import logger from '@/lib/logger';
import { useHoverEffect, useReducedMotion } from '@/hooks/useAnimations';

// Register plugins
// 🔐 CRITICAL FIX: GSAP PLUGIN REGISTRATION WITH ERROR HANDLING
if (typeof window !== 'undefined') {
  try {
    gsap.registerPlugin(ScrollTrigger);
  } catch (err) {
    // Silently fail in production, warn in development
    if (process.env.NODE_ENV === 'development') {
      logger.warn('GSAP ScrollTrigger registration failed:', err);
    }
  }
}

// --- CUSTOM HOOKS ---

function useOutsideClick(ref: React.RefObject<HTMLElement>, callback: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback, enabled]);
}

function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (locked) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = originalStyle; };
    }
  }, [locked]);
}

// --- HELPER FUNCTIONS ---

const isRouteActive = (currentPath: string, targetPath: string) => {
  if (targetPath === '/') return currentPath === '/';
  return currentPath.startsWith(targetPath);
};

// --- MOBILE OPTIMIZATIONS ---
// Ensure touch targets are large enough for mobile
const MIN_TOUCH_TARGET_SIZE = 44; // Minimum recommended touch target size in pixels

// Mobile-first responsive classes - FIXED for better touch targets
const mobileClasses = {
  navHeight: 'h-16 sm:h-20',
  logoSize: 'h-8 sm:h-10 w-auto',
  buttonPadding: 'p-3 sm:p-2.5',
  textSizes: {
    logo: 'text-base sm:text-lg',
    navItem: 'text-sm sm:text-base',
    userMenu: 'text-xs sm:text-sm'
  }
};

// Mobile-specific styles for better touch experience
const mobileStyles = {
  touchTargetMin: 'min-h-[44px] min-w-[44px]', // iOS minimum touch target
  navItemPadding: 'px-4 py-3 sm:px-4 sm:py-2.5',
  menuItemPadding: 'px-4 py-3 sm:px-4 sm:py-2.5',
  buttonRounded: 'rounded-lg md:rounded-full'
};

// Company info (kept for potential future use)
const COMPANY = {
  phone: '+91 9876543210',
  email: 'info@damodartraders.com'
} as const;

// --- MAIN NAVBAR COMPONENT ---

interface NavbarProps {
  variant?: 'default' | 'transparent';
}

const Navbar = ({ variant = 'default' }: NavbarProps) => {
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const { rfqCount } = useRfq();
  const location = useLocation();

  // Refs
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLElement>(null);
  const accessibilityRef = useRef<HTMLDivElement>(null);
  const mobileAccessibilityRef = useRef<HTMLDivElement>(null);

  // State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showMobileAccessibility, setShowMobileAccessibility] = useState(false);

  const { i18n, t } = useTranslation();

  const { language, setLanguage } = useAccessibility();

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    window.dispatchEvent(new Event('languageChange'));
  }, [language, setLanguage]);

  // Refs
  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
    setIsMobileProductsOpen(false);
    setShowAccessibility(false);
    setShowMobileAccessibility(false);
  }, [location.pathname]);

  // Handle outside clicks - User Menu & Accessibility
  useOutsideClick(userMenuRef, () => setShowUserMenu(false), showUserMenu);
  useOutsideClick(accessibilityRef, () => setShowAccessibility(false), showAccessibility);
  useOutsideClick(mobileAccessibilityRef, () => setShowMobileAccessibility(false), showMobileAccessibility);

  // Lock body scroll when mobile menu is open
  useLockBodyScroll(isMobileMenuOpen);

  // Scroll listener for sticky effect - FIXED for better sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50); // Trigger at 50px scroll
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); const [categories, setCategories] = useState<any[]>([]);

  // Fetch dynamic categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.categories.getAll();
        if (response && Array.isArray(response)) {
          setCategories(response);
        }
      } catch (err) {
        logger.error('Failed to fetch categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
        setIsMobileMenuOpen(false);
        setIsMobileProductsOpen(false);
        setShowAccessibility(false);
        setShowMobileAccessibility(false);
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);

  // Variants for staggered entrance
  const navVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: -10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setShowUserMenu(false);
      setIsMobileMenuOpen(false);
    } catch (error) {
      logger.error('Logout failed', error);
    }
  }, [logout]);

  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen(v => !v), []);
  const toggleMobileProductsMenu = useCallback(() => setIsMobileProductsOpen(v => !v), []);

  // Cast user
  const typedUser = user as unknown as UserType | null;

  // --- Styling Logic ---
  // Using transparent overlay mode?
  const isTransparentMode = variant === 'transparent';
  // Is currently transparent? (Mode active AND not scrolled AND menu closed)
  const isCurrentlyTransparent = isTransparentMode && !scrolled && !isMobileMenuOpen;

  const textColorClass = isCurrentlyTransparent ? 'text-white' : 'text-gray-700';

  // 🔥 NEW: Premium Glassmorphism & Floating Style
  const bgClass = isCurrentlyTransparent
    ? 'bg-transparent border-transparent'
    : scrolled
      ? 'bg-white/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(59,130,246,0.08)] border-b border-white/40 mt-4 mx-auto max-w-[95%] rounded-3xl'
      : 'bg-white/90 backdrop-blur-xl border-b border-gray-100/50';

  const positionClass = 'fixed';
  const zIndexClass = 'z-[100]';

  return (
    <>
      {/* 🌟 Background Bloom Effect */}
      {scrolled && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80%] h-24 bg-blue-400/10 blur-[100px] pointer-events-none z-[90]" />
      )}

      {/* Main Navbar - Desktop only (lg+) */}
      <motion.nav
        ref={navbarRef}
        initial="hidden"
        animate="visible"
        variants={navVariants}
        className={`${positionClass} ${zIndexClass} top-0 left-0 right-0 transition-all duration-300 w-full ${bgClass} hidden lg:block`}
        aria-label="Main Navigation"
      >
        {scrolled && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)] z-50 origin-left rounded-t-3xl"
          />
        )}

        <div className="max-w-[1600px] mx-auto px-6">
          <div className={`flex items-center justify-between gap-8 ${mobileClasses.navHeight}`}>

            {/* Left: Logo */}
            <motion.div variants={itemVariants} className="flex-shrink-0">
              <Logo isDark={!isCurrentlyTransparent} />
            </motion.div>

            {/* Center: Desktop Nav - Ultra-Wide Spacing */}
            <motion.div variants={itemVariants} className="flex items-center gap-14 flex-1 justify-center">
              <DesktopNav
                user={user}
                wishlist={wishlist}
                currentPath={location.pathname}
                showUserMenu={showUserMenu}
                setShowUserMenu={setShowUserMenu}
                handleLogout={handleLogout}
                userMenuRef={userMenuRef}
                textColorClass={textColorClass}
                isTransparent={isCurrentlyTransparent}
                categories={categories}
              />
            </motion.div>

            {/* Right: Search & Actions */}
            <motion.div variants={itemVariants} className="flex items-center gap-6 flex-shrink-0">
              <div className="w-64 group/search">
                <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-transparent via-transparent to-transparent group-hover/search:from-blue-100 group-hover/search:via-blue-400 group-hover/search:to-blue-100 transition-all duration-700">
                  <div className="bg-white/90 backdrop-blur-sm rounded-[15px]">
                    <GlobalSearch />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* Accessibility Settings Dropdown */}
              <motion.div variants={itemVariants} className="relative" ref={accessibilityRef}>
                <button
                  onClick={() => setShowAccessibility(!showAccessibility)}
                  className={`relative p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${isCurrentlyTransparent
                    ? 'text-white hover:bg-white/20'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                    } ${showAccessibility ? 'bg-blue-50 text-blue-600' : ''}`}
                  title="Accessibility & Language Settings"
                  aria-label="Accessibility Options"
                  aria-expanded={showAccessibility}
                >
                  <Eye size={20} />
                </button>
                <AccessibilityWidget
                  isDropdown={true}
                  isOpen={showAccessibility}
                  setIsOpen={setShowAccessibility}
                  align="right"
                />
              </motion.div>



              <motion.div variants={itemVariants}>
                <Link
                  to="/account"
                  className={`relative p-2.5 rounded-xl transition-all duration-300 group flex items-center justify-center ${isCurrentlyTransparent
                    ? 'text-white hover:bg-white/20'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  aria-label="Wishlist"
                >
                  <motion.div
                    whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }}
                    whileTap={{ scale: 0.8 }}
                    className="flex items-center justify-center"
                  >
                    <Heart
                      size={24}
                      className={`transition-all duration-300 ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'text-gray-600'}`}
                    />
                    {wishlist.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-lg border-2 border-white animate-bounce-subtle">
                        {wishlist.length}
                      </span>
                    )}
                  </motion.div>
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link
                  to="/rfq"
                  className={`relative p-2.5 rounded-xl transition-all duration-300 group flex items-center justify-center ${isCurrentlyTransparent
                    ? 'text-white hover:bg-white/20'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  aria-label="RFQ Inquiry List"
                >
                  <motion.div
                    whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }}
                    whileTap={{ scale: 0.8 }}
                    className="flex items-center justify-center"
                  >
                    <ClipboardList
                      size={24}
                      className={`transition-all duration-300 ${rfqCount > 0 ? 'text-blue-500 fill-blue-500 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'text-gray-600'}`}
                    />
                    {rfqCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-lg border-2 border-white animate-bounce-subtle">
                        {rfqCount}
                      </span>
                    )}
                  </motion.div>
                </Link>
              </motion.div>

              <div className="h-6 w-px bg-gray-200" />

              <motion.div variants={itemVariants} className="relative" ref={userMenuRef}>
                {user ? (
                  <UserMenuDropdown
                    user={user}
                    showUserMenu={showUserMenu}
                    setShowUserMenu={setShowUserMenu}
                    handleLogout={handleLogout}
                    isTransparent={isCurrentlyTransparent}
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <Link
                      to="/login"
                      className={`text-sm font-bold px-4 py-2 rounded-xl transition-all duration-300 ${isCurrentlyTransparent
                        ? 'text-white hover:bg-white/20'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                        }`}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-0.5"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>
      {/* Mobile Top Bar (sm/md only) */}
      <nav className={`fixed top-0 left-0 right-0 lg:hidden ${zIndexClass} ${bgClass} transition-all duration-300`}>
        <div className="px-4 sm:px-6 flex items-center justify-between h-16">
          <Logo isDark={!isCurrentlyTransparent} />
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Accessibility for Mobile */}
            <div className="relative" ref={mobileAccessibilityRef}>
              <button
                onClick={() => setShowMobileAccessibility(!showMobileAccessibility)}
                className={`p-2.5 min-h-[44px] min-w-[44px] rounded-xl transition-all duration-300 flex items-center justify-center ${isCurrentlyTransparent
                  ? 'text-white hover:bg-white/10'
                  : 'text-gray-600 hover:bg-gray-100'
                  } ${showMobileAccessibility ? 'bg-blue-50/50 text-blue-600' : ''}`}
                title="Accessibility & Language Settings"
                aria-label="Accessibility Options"
                aria-expanded={showMobileAccessibility}
              >
                <Eye size={24} />
              </button>
              <AccessibilityWidget
                isDropdown={true}
                isOpen={showMobileAccessibility}
                setIsOpen={setShowMobileAccessibility}
                align="right"
              />
            </div>
            <Link
              to="/account"
              className={`p-2.5 min-h-[44px] min-w-[44px] rounded-xl transition-all duration-300 flex items-center justify-center relative ${isCurrentlyTransparent
                ? 'text-white hover:bg-white/10'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
              aria-label="Wishlist"
            >
              <Heart
                size={24}
                className={`transition-all duration-300 ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'text-current'
                  }`}
              />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-lg border-2 border-white animate-bounce-subtle">
                  {wishlist.length}
                </span>
              )}
            </Link>
            {/* Removed redundant RFQ button - now in MobileBottomNavbar */}
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileNav
            isMobileMenuOpen={isMobileMenuOpen}
            isMobileProductsOpen={isMobileProductsOpen}
            user={typedUser}
            wishlist={wishlist}
            currentPath={location.pathname}
            toggleMobileMenu={toggleMobileMenu}
            toggleMobileProductsMenu={toggleMobileProductsMenu}
            handleLogout={handleLogout}
            categories={categories}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// --- SUB COMPONENTS ---

const Logo = ({ isDark = true }: { isDark?: boolean }) => {
  const { isHovered, events } = useHoverEffect();
  const reducedMotion = useReducedMotion();
  const { settings } = useSiteSettings();

  return (
    <Link
      to="/"
      className="relative flex items-center gap-1.5 sm:gap-2.5 group"
      aria-label="Damodar Traders Home"
      {...events}
    >
      <div className={`relative transition-transform duration-500 ${!reducedMotion && isHovered ? 'scale-105' : 'scale-100'}`}>
        <div className={`absolute inset-0 bg-blue-500/20 blur-xl rounded-full transition-transform duration-500 ${!reducedMotion && isHovered ? 'scale-125 opacity-100' : 'scale-0 opacity-0'}`} />

        <div className={`relative backdrop-blur-sm rounded-xl p-1 sm:p-1.5 border shadow-sm transition-all duration-300 ${isDark
          ? 'bg-white/80 border-blue-50 group-hover:border-blue-100'
          : 'bg-white/10 border-white/20 hover:bg-white/20'
          } ${!reducedMotion && isHovered ? 'shadow-lg scale-105' : 'shadow-sm scale-100'}`}>
          <img
            src={settings.logo}
            alt="Damodar Traders"
            className={`${mobileClasses.logoSize} w-auto object-contain relative z-10`}
            loading="eager"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('bg-blue-50');
              e.currentTarget.parentElement?.classList.remove('p-1', 'sm:p-1.5');
              e.currentTarget.parentElement?.classList.add('p-2');
              e.currentTarget.parentElement?.setAttribute('data-error', 'true');
            }}
          />
          <div className="hidden data-[error=true]:flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg text-blue-600 font-bold text-xs sm:text-base">
            DT
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <span className={`font-bold ${mobileClasses.textSizes.logo} tracking-tight leading-none whitespace-nowrap transition-colors ${isDark ? 'text-gray-900 group-hover:text-blue-700' : 'text-white group-hover:text-blue-200'
          }`}>
          Damodar Traders
        </span>
        <span className={`text-[8px] sm:text-[10px] font-medium tracking-widest uppercase ${isDark ? 'text-gray-500' : 'text-blue-100'
          }`}>
          Quality & Trust
        </span>
      </div>
    </Link>
  );
};

interface DesktopNavProps {
  user: UserType | null;
  wishlist: any[];
  currentPath: string;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  handleLogout: () => Promise<void>;
  userMenuRef: React.RefObject<HTMLDivElement>;
  textColorClass: string;
  isTransparent: boolean;
  categories: any[];
}

// Modernized Desktop Navigation Component
const DesktopNav = ({
  user,
  wishlist,
  currentPath,
  showUserMenu,
  setShowUserMenu,
  handleLogout,
  userMenuRef,
  textColorClass,
  isTransparent,
  categories
}: DesktopNavProps) => {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';
  const [isProductsHovered, setIsProductsHovered] = useState(false);

  return (
    <div className="flex items-center gap-5">
      {/* Navigation Links */}
      <div className="flex items-center gap-3">
        {/* Home */}
        <div className="nav-item-desktop">
          <NavLink
            href="/"
            isActive={isRouteActive(currentPath, '/')}
            isTransparent={isTransparent}
          >
            {t('nav.home')}
          </NavLink>
        </div>

        {/* Products with Mega Menu */}
        <div
          className="relative nav-item-desktop"
          onMouseEnter={() => setIsProductsHovered(true)}
          onMouseLeave={() => setIsProductsHovered(false)}
        >
          <button
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${isRouteActive(currentPath, '/products')
              ? 'bg-blue-50 text-blue-700'
              : `${textColorClass} hover:bg-blue-50 hover:text-blue-600`
              }`}
            aria-haspopup="menu"
            aria-expanded={isProductsHovered}
          >
            <span className="uppercase tracking-wide">
              <VerticalScrambleText text={t('nav.products')} isHovered={isProductsHovered} />
            </span>
            <ChevronDown size={14} className={`transition-transform duration-300 ${isProductsHovered ? 'rotate-180' : ''}`} />
          </button>

          {/* Modern Mega Menu Dropdown - STATE CONTROLLED */}
          <AnimatePresence>
            {isProductsHovered && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[720px] bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] border border-slate-100 z-50 overflow-hidden flex text-left"
              >
                {/* Left Panel: Blue Gradient Branding & Action */}
                <div className="w-[32%] bg-gradient-to-b from-blue-600 to-blue-800 p-6 text-white flex flex-col justify-between text-left shrink-0">
                  <div className="space-y-4">
                    <span className="inline-block px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-100">
                      {isHindi ? 'औद्योगिक सूची' : 'Enterprise Deck'}
                    </span>
                    <h4 className="text-lg font-extrabold uppercase leading-tight text-white">
                      {isHindi ? 'दामोदर उत्पाद' : 'Engineering Catalog'}
                    </h4>
                    <p className="text-[11px] text-blue-100/80 leading-relaxed font-normal">
                      {isHindi
                        ? 'उच्च दबाव द्रव नियंत्रण, औद्योगिक पाइपलाइनों और निर्माण के लिए प्रमाणित पुर्जे।'
                        : 'ASME, ASTM, and BIS certified structural pipes, high-pressure fittings, and process valves.'}
                    </p>
                  </div>

                  <button
                    onClick={downloadCatalog}
                    className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 text-[10px] font-extrabold rounded-lg transition-colors uppercase tracking-wider shadow-sm min-h-[36px] w-full text-center"
                  >
                    <span>{isHindi ? 'कैटलॉग डाउनलोड' : 'Download Catalog'}</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                {/* Right Panel: Category grid */}
                <div className="w-[68%] p-6 flex flex-col justify-between text-left">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {isHindi ? 'श्रेणियां चुनें' : 'Select Category'}
                      </span>
                      <Link to="/categories" className="text-blue-600 hover:text-blue-700 text-[10px] font-bold uppercase tracking-widest">
                        {t('nav.allCategories')}
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {(categories.length > 0 ? categories : ['Pipes', 'Fittings', 'Valves']).map((item: any, index: number) => {
                        const name = typeof item === 'string' ? item : item.name;
                        const slug = typeof item === 'string' ? item.toLowerCase() : (item.slug || item.name.toLowerCase().replace(/\s+/g, ''));

                        // Dynamic details
                        const details = getCategoryDetails(name, isHindi);
                        const IconComponent = details.icon;

                        return (
                          <Link
                            key={index}
                            to={`/products?category=${slug}`}
                            className="flex items-center gap-3 p-3 bg-slate-50/50 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-100 rounded-xl transition-all duration-200 group text-left min-h-[44px]"
                          >
                            <div className="p-2 bg-white rounded-lg border border-slate-200/60 text-slate-500 group-hover:text-blue-600 transition-colors">
                              <IconComponent size={16} />
                            </div>
                            <div className="space-y-0.5">
                              <span className="block text-xs font-bold text-slate-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                {details.title}
                              </span>
                              <span className="block text-[10px] text-slate-400 font-semibold truncate max-w-[140px]">
                                {details.sub}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">{isHindi ? 'आईएसओ प्रमाणित स्टॉक' : 'All items are ISO 9001:2015 compliant'}</span>
                    <Link to="/products" className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1">
                      <span>{isHindi ? 'सभी उत्पाद देखें' : 'View all products'}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* About */}
        <div className="nav-item-desktop">
          <NavLink
            href="/about"
            isActive={isRouteActive(currentPath, '/about')}
            isTransparent={isTransparent}
          >
            {t('nav.about')}
          </NavLink>
        </div>

        {/* Contact */}
        <div className="nav-item-desktop">
          <NavLink
            href="/contact"
            isActive={isRouteActive(currentPath, '/contact')}
            isTransparent={isTransparent}
          >
            {t('nav.contact')}
          </NavLink>
        </div>
      </div>
    </div>
  );
};

// User Menu Dropdown Component
interface UserMenuDropdownProps {
  user: UserType;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  handleLogout: () => Promise<void>;
  isTransparent: boolean;
}

const UserMenuDropdown = ({
  user,
  showUserMenu,
  setShowUserMenu,
  handleLogout,
  isTransparent
}: UserMenuDropdownProps) => {
  const textColorClass = isTransparent ? 'text-white' : 'text-gray-900';

  return (
    <div>
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className={`flex items-center gap-2 pl-2 pr-3 py-2 rounded-xl border transition-all duration-300 ${showUserMenu
          ? 'border-blue-200 bg-blue-50'
          : isTransparent
            ? 'border-white/20 hover:border-white hover:bg-white/10'
            : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
          }`}
        aria-haspopup="menu"
        aria-expanded={showUserMenu}
      >
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md ring-2 ring-white">
          <User size={18} />
        </div>
        <div className="flex flex-col items-start max-w-[120px]">
          <span className={`text-xs font-bold truncate ${isTransparent ? 'text-white' : 'text-gray-900'}`}>
            {user.name?.split(' ')[0]}
          </span>
          <span className={`text-[10px] truncate ${isTransparent ? 'text-blue-100' : 'text-gray-500'}`}>
            My Account
          </span>
        </div>
        <ChevronDown size={14} className={`${textColorClass} transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
      </button>

      {/* Enhanced Dropdown Menu */}
      {showUserMenu && (
        <div
          className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          role="menu"
        >
          {/* User Info Header */}
          <div className="px-6 py-5 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="p-2 space-y-1">
            <Link
              to="/account"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
              role="menuitem"
              onClick={() => setShowUserMenu(false)}
            >
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <User size={18} className="text-blue-600" />
              </div>
              <div>
                <div className="font-semibold">My Account</div>
                <div className="text-xs text-gray-500">Manage profile</div>
              </div>
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors"
              role="menuitem"
              onClick={() => setShowUserMenu(false)}
            >
              <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center">
                <Heart size={18} className="text-rose-600" />
              </div>
              <div>
                <div className="font-semibold">Wishlist</div>
                <div className="text-xs text-gray-500">Saved items</div>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              role="menuitem"
            >
              <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center">
                <LogOut size={18} className="text-rose-600" />
              </div>
              <div>
                <div className="font-semibold">Sign Out</div>
                <div className="text-xs text-gray-500">Logout securely</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};



const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

const VerticalScrambleText = ({ text, className, isHovered: externalHover }: { text: string; className?: string; isHovered?: boolean }) => {
  // If the text contains non-ASCII characters (e.g. Hindi), disable splitting/scramble animation
  // to prevent breaking Unicode combining diacritics/matras (e.g. "मुख्य" rendering as "म ु ख ्य")
  const [internalHover, setInternalHover] = useState(false);
  const isEnglish = /^[a-zA-Z0-9\s\-_.,!&()]+$/.test(text);
  
  if (!isEnglish) {
    return <span className={className}>{text}</span>;
  }

  const upperText = text.toUpperCase();
  const isHovered = externalHover !== undefined ? externalHover : internalHover;

  return (
    <span
      className={`flex items-center gap-0 ${className ?? ''}`}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      {upperText.split("").map((char, i) => {
        // Render space as a fixed-width gap, not an overflowed span
        if (char === ' ') {
          return <span key={i} className="inline-block w-[0.35em]" />;
        }
        return (
          <span key={i} className="relative inline-block overflow-hidden h-[1.2em]">
            <motion.span
              animate={isHovered ? { y: ["0%", "-100%", "-200%", "-300%", "0%"] } : { y: 0 }}
              transition={{
                duration: 0.4,
                delay: i * 0.03,
                ease: "easeInOut",
              }}
              className="flex flex-col"
            >
              <span className="h-[1.2em] flex items-center">{char}</span>
              <span className="h-[1.2em] flex items-center text-blue-500">{CHARS[Math.floor(Math.random() * CHARS.length)]}</span>
              <span className="h-[1.2em] flex items-center text-cyan-500">{CHARS[Math.floor(Math.random() * CHARS.length)]}</span>
              <span className="h-[1.2em] flex items-center text-blue-600">{char}</span>
            </motion.span>
          </span>
        );
      })}
    </span>
  );
};

const NavLink = ({ href, isActive, children, isTransparent }: { href: string; isActive: boolean; children: string; isTransparent?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isEnglish = /^[a-zA-Z0-9\s\-_.,!&()]+$/.test(children);

  return (
    <Link
      to={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 relative inline-flex items-center whitespace-nowrap ${isActive
        ? 'text-blue-700'
        : isTransparent
          ? 'text-white hover:text-white'
          : 'text-gray-600 hover:text-blue-600'
        }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Active background */}
      <motion.span
        className="absolute inset-0 rounded-xl -z-10 bg-blue-50 shadow-sm border border-blue-100/60"
        initial={false}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.2 }}
      />
      {/* Hover background */}
      {!isActive && (
        <motion.span
          className="absolute inset-0 rounded-xl -z-10 bg-blue-50/70"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={isHovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.15 }}
        />
      )}
      <span className={`relative z-10 ${isEnglish ? 'uppercase tracking-wide' : ''}`}>
        <VerticalScrambleText text={children} isHovered={isHovered} />
      </span>
    </Link>
  );
};

const MobileMenuButton = ({ isMobileMenuOpen, toggleMobileMenu, isTransparent }: { isMobileMenuOpen: boolean; toggleMobileMenu: () => void; isTransparent: boolean }) => (
  <button
    onClick={toggleMobileMenu}
    className={`lg:hidden relative ${mobileClasses.buttonPadding} ${mobileStyles.touchTargetMin} ${mobileStyles.buttonRounded} transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 touch-target ${isTransparent
      ? 'hover:bg-white/20 text-white'
      : 'hover:bg-gray-100/80 bg-white/50 text-gray-800'
      }`}
    aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
    aria-expanded={isMobileMenuOpen}
  >
    {isMobileMenuOpen
      ? <X size={26} className="text-gray-800" />
      : <Menu size={26} className="text-current" />
    }
  </button>
);

interface MobileNavProps {
  isMobileMenuOpen: boolean;
  isMobileProductsOpen: boolean;
  user: UserType | null;
  wishlist: any[];
  currentPath: string;
  toggleMobileMenu: () => void;
  toggleMobileProductsMenu: () => void;
  handleLogout: () => Promise<void>;
  categories: any[];
}

const MobileNav = ({
  isMobileMenuOpen,
  isMobileProductsOpen,
  user,
  wishlist,
  currentPath,
  toggleMobileMenu,
  toggleMobileProductsMenu,
  handleLogout,
  categories
}: MobileNavProps) => {
  const { t } = useTranslation();

  const containerRef = useRef<HTMLDivElement>(null);

  // Initial Hide
  useGSAP(() => {
    gsap.set(containerRef.current, { yPercent: 100, autoAlpha: 0 });
  }, { scope: containerRef });

  // Mobile Animations
  useGSAP(() => {
    const tl = gsap.timeline();

    if (isMobileMenuOpen) {
      tl.to(containerRef.current, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.6,
        ease: 'power4.out'
      })
        .fromTo('.mobile-stagger-item',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'power2.out' },
          '-=0.3'
        );
    } else {
      tl.to(containerRef.current, {
        yPercent: 100,
        autoAlpha: 0,
        duration: 0.5,
        ease: 'power4.in'
      });
    }
  }, { scope: containerRef, dependencies: [isMobileMenuOpen] });

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[110] bg-white lg:hidden h-screen w-full flex flex-col overscroll-contain mobile-overflow-hidden ${mobileStyles.touchTargetMin}`}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
      tabIndex={-1}
      style={{
        visibility: isMobileMenuOpen ? 'visible' : 'hidden',
        pointerEvents: isMobileMenuOpen ? 'auto' : 'none'
      }}
    >
      {/* 1. Mobile Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <Logo isDark={true} /> {/* Mobile menu is always white/light theme */}
        </div>

        <button
          onClick={toggleMobileMenu}
          className={`p-3 -mr-3 ${mobileStyles.touchTargetMin} text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors`}
          aria-label="Close menu"
        >
          <X size={28} />
        </button>
      </div>

      {/* 2. Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 mobile-overflow-hidden overscroll-contain">
        <div className="flex flex-col space-y-2 pb-24">
          <div className="mobile-stagger-item">
            <MobileEntry href="/" isActive={isRouteActive(currentPath, '/')} onClick={toggleMobileMenu}>
              {t('nav.home')}
            </MobileEntry>
          </div>

          <div className="mobile-stagger-item">
            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all">
              <button
                onClick={toggleMobileProductsMenu}
                className={`w-full flex items-center justify-between px-5 py-4 ${mobileStyles.touchTargetMin} bg-white hover:bg-gray-50 transition-colors`}
                aria-expanded={isMobileProductsOpen}
              >
                <span className={`text-lg font-medium ${isMobileProductsOpen ? 'text-blue-600' : 'text-gray-800'}`}>
                  {t('nav.products')}
                </span>
                <ChevronDown
                  size={20}
                  className={`text-gray-400 transition-transform duration-300 ${isMobileProductsOpen ? 'rotate-180 text-blue-600' : ''}`}
                />
              </button>

              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out bg-gray-50/50 ${isMobileProductsOpen ? 'grid-rows-[1fr] border-t border-gray-100' : 'grid-rows-[0fr]'
                  }`}
              >
                <div className="overflow-hidden min-h-0">
                  <div className="py-2">
                    <MobileSubLink href="/categories" onClick={toggleMobileMenu} isFirst>
                      {t('home.allCategories')}
                    </MobileSubLink>
                    {categories.length > 0 ? (
                      categories.map((item: any, index: number) => (
                        <MobileSubLink
                          key={`${item._id || item.id || 'mob-cat'}-${index}`}
                          href={`/products?category=${item.slug || item.name.toLowerCase().replace(/\s+/g, '')}`}
                          onClick={toggleMobileMenu}
                        >
                          {item.name}
                        </MobileSubLink>
                      ))
                    ) : (
                      ['Pipes', 'Fittings', 'Valves'].map((item, index) => (
                        <MobileSubLink
                          key={`mob-default-${index}`}
                          href={`/products?category=${item.toLowerCase()}`}
                          onClick={toggleMobileMenu}
                        >
                          {item}
                        </MobileSubLink>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mobile-stagger-item">
            <MobileEntry href="/about" isActive={isRouteActive(currentPath, '/about')} onClick={toggleMobileMenu}>
              {t('nav.about')}
            </MobileEntry>
          </div>
          <div className="mobile-stagger-item">
            <MobileEntry href="/contact" isActive={isRouteActive(currentPath, '/contact')} onClick={toggleMobileMenu}>
              {t('nav.contact')}
            </MobileEntry>
          </div>

          <div className="pt-4 mobile-stagger-item">
            <GlobalSearch />
          </div>
        </div>
      </div>

      {/* 3. Sticky Bottom Auth */}
      <div className="sticky bottom-0 left-0 right-0 p-6 border-t border-gray-100 bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50 mobile-stagger-item">
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 px-1">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl border border-blue-200">
                {user.name?.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">{user.name}</div>
                <div className="text-gray-500 text-sm">{user.email}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/account"
                onClick={toggleMobileMenu}
                className={`flex items-center justify-center gap-2 py-3.5 ${mobileStyles.touchTargetMin} bg-gray-100 text-gray-800 rounded-xl font-semibold hover:bg-gray-200 transition-colors`}
              >
                <User size={18} />
                {t('nav.account')}
              </Link>
              <button
                onClick={async () => { await handleLogout(); toggleMobileMenu(); }}
                className={`flex items-center justify-center gap-2 py-3.5 ${mobileStyles.touchTargetMin} bg-rose-50 text-rose-600 rounded-xl font-semibold hover:bg-rose-100 transition-colors`}
              >
                <LogOut size={18} />
                {t('common.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/login"
              onClick={toggleMobileMenu}
              className={`flex items-center justify-center py-4 ${mobileStyles.touchTargetMin} bg-gray-100 text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors`}
            >
              {t('auth.login')}
            </Link>
            <Link
              to="/register"
              onClick={toggleMobileMenu}
              className={`flex items-center justify-center py-4 ${mobileStyles.touchTargetMin} bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors`}
            >
              {t('auth.register')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Styling helper for mobile links - FIXED touch targets
const MobileEntry = ({ href, isActive, onClick, children }: { href: string; isActive: boolean; onClick: () => void; children: React.ReactNode }) => (
  <Link
    to={href}
    onClick={onClick}
    className={`flex items-center justify-between w-full ${mobileStyles.menuItemPadding} ${mobileStyles.touchTargetMin} rounded-2xl text-lg font-medium transition-all mobile-nav-item ${isActive
      ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
      : 'text-gray-700 hover:bg-gray-50 active:scale-[0.98]'
      }`}
  >
    <span>{children}</span>
    {isActive && <div className="w-2 h-2 rounded-full bg-blue-600" />}
    {!isActive && <ArrowRight size={20} className="text-gray-300" />}
  </Link>
);

const MobileSubLink = ({ href, onClick, children, isFirst }: { href: string; onClick: () => void; children: React.ReactNode; isFirst?: boolean }) => (
  <Link
    to={href}
    onClick={onClick}
    className={`block ${mobileStyles.menuItemPadding} text-base text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 transition-colors border-l-2 border-transparent hover:border-blue-500 ml-4 pl-4 ${mobileStyles.touchTargetMin} touch-target-sm`}
  >
    {children}
  </Link>
);

export default Navbar;
