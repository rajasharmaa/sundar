import type { User } from '@/types';
import { Users, UserCheck, UserX, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsersStatsProps {
  users: User[];
}

export function UsersStats({ users }: UsersStatsProps) {
  const stats = [
    {
      label: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'All registered accounts'
    },
    {
      label: 'Active Users',
      value: users.filter(u => u.isActive).length,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Currently active accounts'
    },
    {
      label: 'Inactive Users',
      value: users.filter(u => !u.isActive).length,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Deactivated accounts'
    },
    {
      label: 'Admins',
      value: users.filter(u => u.role === 'admin').length,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Administrator accounts'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "bg-card rounded-lg border p-4 transition-all duration-300 hover:shadow-md",
            stat.bgColor
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <stat.icon className={cn("w-8 h-8", stat.color)} />
            <span className={cn("text-3xl font-bold", stat.color)}>{stat.value}</span>
          </div>
          <h3 className="font-semibold text-sm mb-1">{stat.label}</h3>
          <p className="text-xs text-muted-foreground">{stat.description}</p>
        </div>
      ))}
    </div>
  );
}
