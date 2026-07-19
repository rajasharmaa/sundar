// components/account/NavigationSidebar.tsx
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  badge?: number;
}

interface NavigationSidebarProps {
  activeTab: string;
  navigationTabs: NavItem[];
  onTabChange: (tabId: string) => void;
  userProfile: {
    name: string;
    email: string;
    role: string;
  };
  onEditProfile?: () => void;
  onUploadPhoto?: () => void;
}

const NavigationSidebar = ({ 
  activeTab, 
  navigationTabs, 
  onTabChange,
  userProfile,
  onEditProfile,
  onUploadPhoto
}: NavigationSidebarProps) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'user': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <motion.div
      className="lg:col-span-1"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* User Profile Card */}
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg border-4 border-white">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-xl">
                  {userProfile.name?.charAt(0) || 'U'}
                </div>
              </div>
              <button 
                onClick={onUploadPhoto}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border-2 border-blue-200 flex items-center justify-center shadow-sm hover:bg-blue-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-1">{userProfile.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{userProfile.email}</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(userProfile.role)}`}>
              {userProfile.role?.charAt(0)?.toUpperCase() + userProfile.role?.slice(1)}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="p-3">
          {navigationTabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center justify-between w-full p-4 text-left rounded-xl transition-all duration-300 mb-1 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 text-blue-700 shadow-sm'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
              whileHover={{ x: 5 }}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <tab.icon size={20} className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'} />
                </div>
                <div>
                  <p className="font-medium">{tab.label}</p>
                  <p className="text-xs text-gray-500">{tab.description}</p>
                </div>
              </div>
              {tab.badge !== undefined && typeof tab.badge === 'number' && !isNaN(tab.badge) && tab.badge > 0 && (
                <span className="bg-blue-500 text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full">
                  {String(Math.floor(tab.badge))}
                </span>
              )}
              <ChevronRight size={18} className={`transition-transform ${activeTab === tab.id ? 'text-blue-500 rotate-90' : 'text-gray-300'}`} />
            </motion.button>
          ))}
        </div>

        {/* Edit Profile Button */}
        <div className="p-4 border-t border-gray-100">
          <motion.button
            onClick={onEditProfile}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Profile
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default NavigationSidebar;