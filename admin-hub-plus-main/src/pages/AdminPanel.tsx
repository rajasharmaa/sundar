import { useState } from 'react';
import { AdminHeader } from '@/components/Admin/AdminHeader';
import { AdminTabs, AdminTab } from '@/components/Admin/AdminTabs';
import { Dashboard } from '@/components/Admin/Dashboard';
import { ProductManagement } from '@/components/Admin/Products/ProductManagement';
import { CatalogManagement } from '@/components/Admin/Catalog/CatalogManagement';
import { AnalyticsPanel } from '@/components/Admin/Analytics/AnalyticsPanel';
import { InquiryManagement } from '@/components/Admin/Inquiries/InquiryManagement';
import { CategoryManagement } from '@/components/Admin/Categories/CategoryManagement';
import { SiteSettingsPanel } from '@/components/Admin/Settings/SiteSettingsPanel';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <AdminTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        <AdminHeader onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <div className="absolute inset-0 bg-slate-50 -z-10" />
          {/* Subtle background pattern for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none -z-10" />

          <div className="max-w-[1600px] mx-auto p-4 md:p-8 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {activeTab === 'dashboard' && <Dashboard onTabChange={setActiveTab} />}
                {activeTab === 'products' && <ProductManagement />}
                {activeTab === 'catalog' && <CatalogManagement />}
                {activeTab === 'analytics' && <AnalyticsPanel />}
                {activeTab === 'inquiries' && <InquiryManagement />}
                {activeTab === 'categories' && <CategoryManagement />}
                {activeTab === 'settings' && <SiteSettingsPanel />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
