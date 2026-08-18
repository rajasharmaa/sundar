import { cn } from '@/lib/utils';
import { LayoutDashboard, Package, BarChart3, MessageSquare, Users, Heart, Layers, DollarSign, Command, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export type AdminTab = 'dashboard' | 'products' | 'inventory' | 'users' | 'wishlist' | 'analytics' | 'inquiries' | 'categories' | 'bulk-prices' | 'settings';

interface AdminTabsProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'analytics', label: 'Product Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'inquiries', label: 'Inquiries & Leads', icon: <MessageSquare className="w-5 h-5" /> },
  { id: 'products', label: 'Product Catalog', icon: <Package className="w-5 h-5" /> },
  { id: 'inventory', label: 'Stock & Inventory', icon: <Package className="w-5 h-5" /> },
  { id: 'categories', label: 'Category Settings', icon: <Layers className="w-5 h-5" /> },
  { id: 'bulk-prices', label: 'Bulk Pricing', icon: <DollarSign className="w-5 h-5" /> },
  { id: 'users', label: 'User Management', icon: <Users className="w-5 h-5" /> },
  { id: 'wishlist', label: 'Wishlist Insights', icon: <Heart className="w-5 h-5" /> },
  { id: 'settings', label: 'Site Settings', icon: <Settings className="w-5 h-5" /> },
];

export function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
  return (
    <aside className="hidden md:flex flex-col w-72 h-screen bg-slate-950 border-r border-slate-800 shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-900/50">
          <Command className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight leading-none">Hub Plus</h2>
          <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">Admin Portal</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        <div className="mb-4 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          Main Navigation
        </div>

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative group',
                isActive
                  ? 'text-white bg-green-600/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-green-600 rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex items-center gap-3 w-full">
                <div className={cn(
                  'transition-colors duration-300',
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-green-400'
                )}>
                  {tab.icon}
                </div>
                <span className="font-semibold text-sm">{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">System Status</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm text-slate-300 font-semibold">All Systems Operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
