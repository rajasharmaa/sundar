import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Bell, Menu } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ADMIN_ROUTES } from '@/utils/constants';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: analyticsService.getStats,
    staleTime: 30000,
  });

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate(ADMIN_ROUTES.LOGIN);
    } catch {
      toast.error('Logout failed');
    }
  };

  const hasNewInquiries = stats?.newInquiries ? stats.newInquiries > 0 : false;

  return (
    <header className="h-20 px-6 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Mobile Menu Trigger & Title */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="hidden md:flex flex-col">
          <h1 className="text-xl font-bold text-slate-900 leading-none">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage your product showcase and inquiries</p>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          {hasNewInquiries && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-slate-900 leading-none">{user?.username || 'Super Admin'}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium capitalize">{user?.role || 'Administrator'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold text-lg border border-green-200">
            {(user?.username || 'A').charAt(0).toUpperCase()}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="ml-2 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 shadow-sm rounded-xl"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
