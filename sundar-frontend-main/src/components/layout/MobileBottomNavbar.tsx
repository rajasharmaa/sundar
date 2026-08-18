// components/layout/MobileBottomNavbar.tsx
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Package, Layers, MessageSquare, Info } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const MobileBottomNavbar = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'products', label: 'Products', icon: Package, path: '/products' },
    { id: 'categories', label: 'Categories', icon: Layers, path: '/categories' },
    { id: 'contact', label: 'Contact', icon: MessageSquare, path: '/contact' },
    { id: 'about', label: 'About', icon: Info, path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-[9999] flex lg:hidden bg-white/98 backdrop-blur-xl border-t-2 border-green-200 shadow-2xl safe-area-bottom"
        role="navigation"
        aria-label="Mobile bottom navigation"
      >
        <div className="absolute inset-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl" />

        <div className="relative w-full flex items-end justify-around pb-safe min-h-[68px]">
          {navItems.map((item) => {
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
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                  <motion.div
                    className={`absolute inset-0 ${active ? 'bg-gradient-to-t from-green-500/10 to-transparent' : 'bg-transparent'}`}
                    initial={false}
                    animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </div>

                <div className="relative z-10 mb-1">
                  <motion.div
                    animate={{ scale: active ? 1.1 : 1, y: active ? -2 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <Icon
                      className={`w-6 h-6 transition-all duration-200 ${active ? 'text-green-600' : 'text-gray-500'}`}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </motion.div>
                </div>

                <motion.span
                  className={`relative z-10 text-[10px] sm:text-[11px] font-medium whitespace-nowrap transition-all duration-200 ${active ? 'text-green-600 font-semibold' : 'text-gray-500'}`}
                  animate={{ scale: active ? 1.05 : 1 }}
                >
                  {item.label}
                </motion.span>

                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-1 w-1 h-1 bg-green-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        <div className="h-safe-area-inset-bottom bg-white/95 backdrop-blur-xl" />
      </motion.nav>
    </>
  );
};

export default MobileBottomNavbar;
