// components/layout/MobileBottomNavbar.tsx
import { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Package, Layers, MessageSquare, User, LogIn, Heart, Info } from 'lucide-react';
import AuthContext from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

const MobileBottomNavbar = () => {
  const location = useLocation();
  const authContext = useContext(AuthContext);
  const user = authContext?.user || null;
  const { wishlist } = useWishlist();
  // Always show navbar - removed scroll-based hiding for better UX

  // Navigation items configuration
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      path: '/products',
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Layers,
      path: '/categories',
    },
    {
      id: 'inquiry',
      label: 'Inquiry',
      icon: MessageSquare,
      path: '/contact',
    },
    {
      id: 'account',
      label: user ? 'Account' : 'Login',
      icon: user ? User : LogIn,
      path: user ? '/account' : '/login',
      badge: !user && 0, // Placeholder for future notifications
    },
  ];

  // Check if route is active
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden behind navbar - Mobile and tablet only */}
      <div className="h-[84px] lg:hidden" />

      {/* Bottom Navigation Bar - ALWAYS VISIBLE on mobile and tablet (< lg), HIDDEN on desktop (lg+) */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-[9999] flex lg:hidden bg-white/98 backdrop-blur-xl border-t-2 border-blue-200 shadow-2xl safe-area-bottom"
        role="navigation"
        aria-label="Mobile bottom navigation"
      >
        {/* Glassmorphism background with blur */}
        <div className="absolute inset-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl" />

        {/* Safe area inset for iOS devices */}
        <div className="relative w-full flex items-end justify-around pb-safe min-h-[68px]">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.id}
                to={item.path}
                className="relative flex-1 flex flex-col items-center justify-center py-3 px-2 min-h-[44px] touch-manipulation"
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                {/* Background ripple effect container */}
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                  <motion.div
                    className={`absolute inset-0 ${active
                        ? 'bg-gradient-to-t from-blue-500/10 to-transparent'
                        : 'bg-transparent'
                      }`}
                    initial={false}
                    animate={{
                      scale: active ? 1 : 0,
                      opacity: active ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  />
                </div>

                {/* Icon with badge */}
                <div className="relative z-10 mb-1">
                  <motion.div
                    animate={{
                      scale: active ? 1.1 : 1,
                      y: active ? -2 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <Icon
                      className={`w-6 h-6 transition-all duration-200 ${active
                          ? 'text-blue-600'
                          : 'text-gray-500 group-hover:text-gray-700'
                        }`}
                      strokeWidth={active ? 2.5 : 2}
                    />

                    {/* Wishlist badge for account icon */}
                    {item.id === 'account' && wishlist.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-sm"
                      >
                        {wishlist.length > 9 ? '9+' : wishlist.length}
                      </motion.span>
                    )}
                  </motion.div>
                </div>

                {/* Label text */}
                <motion.span
                  className={`relative z-10 text-[10px] sm:text-[11px] font-medium whitespace-nowrap transition-all duration-200 ${active
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-500'
                    }`}
                  animate={{
                    scale: active ? 1.05 : 1,
                  }}
                >
                  {item.label}
                </motion.span>

                {/* Active indicator dot */}
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-1 w-1 h-1 bg-blue-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Top border gradient for depth */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

        {/* Safe area padding for bottom gesture bar on iOS */}
        <div className="h-safe-area-inset-bottom bg-white/95 backdrop-blur-xl" />
      </motion.nav>
    </>
  );
};

export default MobileBottomNavbar;
