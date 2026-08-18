import type { User } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { 
  MoreVertical, 
  Mail, 
  Phone, 
  Shield, 
  CheckCircle, 
  XCircle,
  Calendar,
  LogOut
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface UserCardProps {
  user: User;
  onStatusChange: (id: string, isActive: boolean) => void;
  onRoleChange: (id: string, role: 'user' | 'admin') => void;
  onDelete: (user: User) => void;
}

export function UserCard({ user, onStatusChange, onRoleChange, onDelete }: UserCardProps) {
  const lastLogin = user.lastLoginAt ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true }) : 'Never';
  const memberSince = formatDistanceToNow(new Date(user.createdAt), { addSuffix: true });

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'user': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Card Header */}
      <div className="p-5 border-b">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg",
              user.avatar ? '' : 'bg-gradient-to-br from-green-500 to-purple-600'
            )}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-medium border", getRoleBadgeColor(user.role))}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-muted rounded transition-colors">
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                <Mail className="w-4 h-4 mr-2" />
                Copy Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = `tel:${user.phone}`}>
                <Phone className="w-4 h-4 mr-2" />
                Call User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onRoleChange(user._id, user.role === 'admin' ? 'user' : 'admin')}
                disabled={user.role === 'admin' && user.email === 'admin@Sundar CorporationCorporation.com'}
              >
                <Shield className="w-4 h-4 mr-2" />
                {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(user)}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{user.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-4 bg-muted/30">
        {/* Status Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {user.isActive ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="text-sm font-medium">Account Status</span>
          </div>
          <Switch
            checked={user.isActive}
            onCheckedChange={(checked) => onStatusChange(user._id, checked)}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Calendar className="w-3 h-3" />
              Member Since
            </div>
            <div className="text-sm font-medium">{memberSince}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Shield className="w-3 h-3" />
              Last Login
            </div>
            <div className="text-sm font-medium">{lastLogin}</div>
          </div>
        </div>

        {/* Verification Badge */}
        <div className="pt-3 border-t flex items-center gap-2">
          {user.emailVerified ? (
            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" />
              Email Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
              <XCircle className="w-3 h-3" />
              Email Not Verified
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
