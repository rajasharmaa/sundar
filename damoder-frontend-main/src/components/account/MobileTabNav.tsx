// components/account/MobileTabNav.tsx
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface MobileTabNavProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const MobileTabNav = ({ tabs, activeTab, onTabChange }: MobileTabNavProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active tab to center when it changes for premium mobile UX
  useEffect(() => {
    if (containerRef.current) {
      const activeElement = containerRef.current.querySelector('[aria-current="page"]');
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeTab]);

  return (
    <div className="lg:hidden bg-white border-b border-gray-200 shadow-sm w-full">
      <div 
        ref={containerRef}
        className="flex overflow-x-auto scrollbar-hide w-full whitespace-nowrap scroll-smooth"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`shrink-0 min-w-max flex flex-col items-center justify-center py-3 px-5 transition-all relative touch-target ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active background */}
              {isActive && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-blue-50"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              
              {/* Icon with badge */}
              <div className="relative z-10 mb-1">
                <Icon
                  className={`w-5 h-5 xs:w-6 xs:h-6 ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              
              {/* Label */}
              <span className={`relative z-10 text-[10px] xs:text-xs font-medium whitespace-nowrap ${
                isActive ? 'text-blue-600 font-semibold' : 'text-gray-500'
              }`}>
                {tab.label}
              </span>
              
              {/* Active indicator line */}
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  layoutId="activeTabIndicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileTabNav;
