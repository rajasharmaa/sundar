import { Settings, LucideIcon } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  badge?: number;
}

interface AccountSidebarProps {
  activeTab: string;
  navigationTabs: NavItem[];
  onTabChange: (tabId: string) => void;
  activeTheme: {
    primary: string;
    text: string;
    shadow: string;
  };
  isHindi: boolean;
}

const AccountSidebar = ({
  activeTab,
  navigationTabs,
  onTabChange,
  activeTheme,
  isHindi
}: AccountSidebarProps) => {
  return (
    <aside className="w-full lg:w-72 flex-shrink-0 hidden lg:block">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden sticky top-24">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
          <Settings className={`w-4 h-4 ${activeTheme.text}`} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isHindi ? 'नेविगेशन सूची' : 'Navigation Menu'}
          </p>
        </div>
        <div className="p-3 flex flex-col gap-1.5">
          {navigationTabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center justify-between w-full p-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                  ? `${activeTheme.primary} shadow-md ${activeTheme.shadow}` 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
                  <span className="font-semibold text-sm">{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full transition-colors duration-300 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default AccountSidebar;
