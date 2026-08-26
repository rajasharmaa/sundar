// components/layout/Navbar.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronRight, ArrowRight, Search, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/api/api-client';
import { useAccessibility } from '@/context/AccessibilityContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import logger from '@/lib/logger';

// --- HELPER FUNCTIONS ---

const isRouteActive = (currentPath: string, targetPath: string) => {
  if (targetPath === '/') return currentPath === '/';
  return currentPath.startsWith(targetPath);
};

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

// --- MAIN NAVBAR ---

interface NavbarProps {
  variant?: 'default' | 'transparent';
}

const Navbar = ({ variant = 'default' }: NavbarProps) => {
  const location = useLocation();
  const navbarRef = useRef<HTMLElement>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const { i18n, t } = useTranslation();
  const { language, setLanguage } = useAccessibility();

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    window.dispatchEvent(new Event('languageChange'));
  }, [language, setLanguage]);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileProductsOpen(false);
  }, [location.pathname]);

  useLockBodyScroll(isMobileMenuOpen);

  // Scroll listener for sticky effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        setIsMobileMenuOpen(false);
        setIsMobileProductsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);

  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen(v => !v), []);
  const toggleMobileProductsMenu = useCallback(() => setIsMobileProductsOpen(v => !v), []);

  const isTransparentMode = variant === 'transparent';
  const isCurrentlyTransparent = isTransparentMode && !scrolled && !isMobileMenuOpen;
  const textColorClass = isCurrentlyTransparent ? 'text-white' : 'text-gray-700';

  const bgClass = isCurrentlyTransparent
    ? 'bg-transparent border-transparent'
    : scrolled
      ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200'
      : 'bg-white border-b border-gray-100';

  return (
    <>
      {/* Background Bloom removed for cleaner look */}

      {/* Desktop Navbar (lg+) */}
      <motion.nav
        ref={navbarRef}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`fixed z-[100] top-0 left-0 right-0 transition-all duration-300 w-full ${bgClass} hidden lg:block`}
        aria-label="Main Navigation"
      >
        {scrolled && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="absolute top-0 left-0 right-0 h-0.5 bg-industrial z-50 origin-left"
          />
        )}

        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between gap-8 h-16 sm:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo isDark={!isCurrentlyTransparent} />
            </div>

            {/* Desktop Nav Links */}
            <div className="flex items-center gap-8 flex-1 justify-center">
              <DesktopNav
                currentPath={location.pathname}
                textColorClass={textColorClass}
                isTransparent={isCurrentlyTransparent}
                categories={categories}
              />
            </div>

            {/* Right: CTA + Language */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={toggleLanguage}
                className={`p-2 rounded-lg transition-colors ${isCurrentlyTransparent ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}
                aria-label="Toggle Language"
              >
                <Languages size={18} />
              </button>
              <Link
                to="/request-quote"
                className="text-sm font-bold text-navy bg-amber-500 hover:bg-amber-400 px-6 py-2.5 rounded shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-colors duration-300 uppercase tracking-wider"
              >
                Request Quote
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Top Bar */}
      <nav className={`fixed top-0 left-0 right-0 lg:hidden z-[100] ${bgClass} transition-all duration-300`}>
        <div className="px-3 sm:px-6 flex items-center justify-between h-16">
          <div className="flex-shrink-0 scale-[0.85] sm:scale-100 origin-left">
            <Logo isDark={!isCurrentlyTransparent} />
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggleLanguage}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors hidden sm:block ${isCurrentlyTransparent ? 'text-white' : 'text-gray-600'}`}
              aria-label="Toggle Language"
            >
              <Languages size={18} />
            </button>
            <Link
              to="/request-quote"
              className="text-xs sm:text-xs font-bold uppercase tracking-wider px-3 py-2 bg-amber-500 text-navy rounded shadow-sm hover:bg-amber-400 transition-colors mr-1 whitespace-nowrap"
            >
              Get Quote
            </Link>
            <button
              onClick={toggleMobileMenu}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isCurrentlyTransparent ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-100 text-gray-800'}`}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Full-screen Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[110] bg-white lg:hidden h-screen w-full flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <Logo isDark={true} />
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleLanguage}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Toggle Language"
                >
                  <Languages size={20} />
                </button>
                <button onClick={toggleMobileMenu} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close menu">
                  <X size={28} />
                </button>
              </div>
            </div>

            {/* Mobile Links */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="flex flex-col space-y-1 pb-10">
                <MobileEntry href="/" isActive={isRouteActive(location.pathname, '/')} onClick={toggleMobileMenu}>
                  {t('nav.home')}
                </MobileEntry>

                {/* Products Accordion */}
                <div className="rounded-2xl overflow-hidden transition-all duration-300">
                  <button
                    onClick={toggleMobileProductsMenu}
                    className={`flex items-center justify-between w-full px-4 py-4 min-h-[44px] rounded-2xl text-[17px] font-medium transition-all duration-300 ${
                      isMobileProductsOpen || isRouteActive(location.pathname, '/products') || isRouteActive(location.pathname, '/categories')
                        ? 'bg-[#22c55e]/5 text-[#22c55e]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-expanded={isMobileProductsOpen}
                  >
                    <span className="tracking-wide">{t('nav.products')}</span>
                    <motion.div animate={{ rotate: isMobileProductsOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                      <ChevronDown size={20} className={isMobileProductsOpen ? 'text-[#22c55e]' : 'text-gray-400'} />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isMobileProductsOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-2 py-2 mb-2 bg-gray-50/50 rounded-b-2xl -mt-4 pt-6">
                          <MobileSubLink href="/categories" onClick={toggleMobileMenu} isActive={isRouteActive(location.pathname, '/categories')}>
                            {t('home.allCategories')}
                          </MobileSubLink>
                          {categories.length > 0 && categories.map((item: any, index: number) => {
                            const slug = item.slug || item.name.toLowerCase().replace(/\s+/g, '');
                            const isCatActive = location.search.includes(`category=${slug}`);
                            return (
                              <MobileSubLink
                                key={`${item._id || item.id || 'mob-cat'}-${index}`}
                                href={`/products?category=${slug}`}
                                onClick={toggleMobileMenu}
                                isActive={isCatActive}
                              >
                                {item.name}
                              </MobileSubLink>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <MobileEntry href="/custom-manufacturing" isActive={isRouteActive(location.pathname, '/custom-manufacturing')} onClick={toggleMobileMenu}>
                  Custom Manufacturing
                </MobileEntry>
                <MobileEntry href="/about" isActive={isRouteActive(location.pathname, '/about')} onClick={toggleMobileMenu}>
                  {t('nav.about')}
                </MobileEntry>
                <MobileEntry href="/blog" isActive={isRouteActive(location.pathname, '/blog')} onClick={toggleMobileMenu}>
                  Blog
                </MobileEntry>
                <MobileEntry href="/contact" isActive={isRouteActive(location.pathname, '/contact')} onClick={toggleMobileMenu}>
                  {t('nav.contact')}
                </MobileEntry>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- SUB COMPONENTS ---

const Logo = ({ isDark = true }: { isDark?: boolean }) => {
  const { settings } = useSiteSettings();

  return (
    <Link to="/" className="relative flex items-center gap-2 group" aria-label="Sundar Corporation Home">
      <div className={`relative backdrop-blur-sm rounded-xl p-1.5 border shadow-sm transition-all duration-300 ${isDark
        ? 'bg-white/80 border-gray-100 group-hover:border-emerald-200'
        : 'bg-white/10 border-white/20 hover:bg-white/20'
        }`}>
        <img
          src={settings.logo}
          alt="Sundar Corporation"
          className="h-8 sm:h-10 w-auto object-contain"
          loading="eager"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      <div className="flex flex-col">
        <span className={`font-black text-base sm:text-lg tracking-tight leading-none whitespace-nowrap transition-colors uppercase ${isDark ? 'text-[#0B2023] group-hover:text-[#22c55e]' : 'text-white group-hover:text-[#22c55e]'}`}>
          Sundar Corporation
        </span>
        <span className={`text-[8px] sm:text-xs font-bold tracking-widest uppercase ${isDark ? 'text-gray-400' : 'text-white/60'}`}>
          Quality & Trust
        </span>
      </div>
    </Link>
  );
};

// Desktop Navigation
interface DesktopNavProps {
  currentPath: string;
  textColorClass: string;
  isTransparent: boolean;
  categories: any[];
}

const DesktopNav = ({ currentPath, textColorClass, isTransparent, categories }: DesktopNavProps) => {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';
  const [isProductsHovered, setIsProductsHovered] = useState(false);

  return (
    <div className="flex items-center gap-6">
      <NavLink href="/" isActive={isRouteActive(currentPath, '/')} isTransparent={isTransparent}>
        {t('nav.home')}
      </NavLink>

      {/* Products with Mega Menu */}
      <div
        className="relative"
        onMouseEnter={() => setIsProductsHovered(true)}
        onMouseLeave={() => setIsProductsHovered(false)}
      >
        <button
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[15px] font-medium transition-all duration-300 whitespace-nowrap ${isRouteActive(currentPath, '/products')
            ? 'bg-[#22c55e]/10 text-[#22c55e] shadow-sm'
            : `${textColorClass} hover:bg-gray-50 hover:text-[#22c55e]`
            }`}
          aria-haspopup="menu"
          aria-expanded={isProductsHovered}
        >
          <span>{t('nav.products')}</span>
          <ChevronDown size={16} className={`transition-transform duration-300 ${isProductsHovered ? 'rotate-180 text-[#22c55e]' : 'text-gray-400'}`} />
        </button>

        <AnimatePresence>
          {isProductsHovered && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[700px] bg-white rounded-xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)] border-t-2 border-[#22c55e] z-50 overflow-hidden"
            >
              <div className="flex w-full bg-white">
                {[0, 1, 2].map((colIndex) => {
                  const activeCategories = categories.length > 0 ? categories : [];
                  const itemsPerCol = Math.ceil(activeCategories.length / 3);
                  const colItems = activeCategories.slice(colIndex * itemsPerCol, (colIndex + 1) * itemsPerCol);

                  return (
                    <div key={colIndex} className={`w-1/3 p-5 flex flex-col gap-2.5 ${colIndex !== 2 ? 'border-r border-gray-100' : ''}`}>
                      {colItems.map((item: any, itemIndex: number) => {
                        const name = typeof item === 'string' ? item : item.name;
                        const slug = typeof item === 'string' ? item.toLowerCase() : (item.slug || item.name.toLowerCase().replace(/\s+/g, ''));

                        return (
                          <Link
                            key={itemIndex}
                            to={`/products?category=${slug}`}
                            className="flex items-center gap-2 text-slate-500 hover:text-[#22c55e] transition-colors group"
                          >
                            <ChevronRight size={12} strokeWidth={3} className="text-[#22c55e] group-hover:translate-x-1 transition-transform" />
                            <span className="text-[13px] font-medium">{name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">
                  {isHindi ? 'सभी पैकेजिंग समाधान' : 'Explore all our packaging solutions'}
                </span>
                <div className="flex items-center gap-5">
                  <Link to="/categories" className="text-slate-500 hover:text-[#22c55e] font-bold text-xs uppercase tracking-widest transition-colors">
                    {isHindi ? 'श्रेणियाँ' : 'All Categories'}
                  </Link>
                  <Link to="/products" className="text-[#22c55e] hover:text-[#16a34a] font-bold text-xs uppercase tracking-widest flex items-center gap-1 transition-colors">
                    <span>{isHindi ? 'सभी उत्पाद' : 'View All'}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NavLink href="/custom-manufacturing" isActive={isRouteActive(currentPath, '/custom-manufacturing')} isTransparent={isTransparent}>
        Custom Manufacturing
      </NavLink>
      <NavLink href="/about" isActive={isRouteActive(currentPath, '/about')} isTransparent={isTransparent}>
        {t('nav.about')}
      </NavLink>
      <NavLink href="/contact" isActive={isRouteActive(currentPath, '/contact')} isTransparent={isTransparent}>
        {t('nav.contact')}
      </NavLink>
    </div>
  );
};

// Simple Nav Link
const NavLink = ({ href, isActive, children, isTransparent }: { href: string; isActive: boolean; children: string; isTransparent?: boolean }) => {
  return (
    <Link
      to={href}
      className={`px-4 py-2.5 rounded-lg text-[15px] font-medium transition-all duration-300 whitespace-nowrap ${isActive
        ? 'bg-[#22c55e]/10 text-[#22c55e] shadow-sm'
        : isTransparent
          ? 'text-white hover:bg-white/10'
          : 'text-gray-600 hover:text-[#22c55e] hover:bg-gray-50'
        }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
};

// Mobile Link
const MobileEntry = ({ href, isActive, onClick, children }: { href: string; isActive: boolean; onClick: () => void; children: React.ReactNode }) => (
  <Link
    to={href}
    onClick={onClick}
    className={`flex items-center justify-between w-full px-4 py-4 min-h-[44px] rounded-2xl text-[17px] font-medium transition-all duration-300 group ${isActive
      ? 'bg-[#22c55e]/5 text-[#22c55e]'
      : 'text-gray-700 hover:bg-gray-50 active:scale-[0.98]'
      }`}
  >
    <span className="tracking-wide">{children}</span>
    {isActive ? (
      <motion.div layoutId="activeMobileIndicator" className="w-2 h-2 rounded-full bg-[#22c55e]" />
    ) : (
      <ArrowRight size={18} className="text-gray-300 group-hover:text-[#22c55e] transition-colors" />
    )}
  </Link>
);

const MobileSubLink = ({ href, onClick, children, isActive }: { href: string; onClick: () => void; children: React.ReactNode; isActive?: boolean }) => (
  <Link
    to={href}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 text-[15px] font-medium rounded-xl transition-all duration-300 ${
      isActive 
        ? 'text-[#22c55e] bg-white shadow-sm' 
        : 'text-gray-600 hover:text-[#22c55e] hover:bg-white'
    }`}
  >
    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive ? 'bg-[#22c55e]' : 'bg-gray-300'}`} />
    {children}
  </Link>
);

export default Navbar;

