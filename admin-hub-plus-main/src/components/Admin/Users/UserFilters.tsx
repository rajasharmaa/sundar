import type { User } from '@/types';
import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  users: User[];
}

const FILTERS = [
  { value: 'all', label: 'All Users', count: 0 },
  { value: 'active', label: 'Active', count: 0 },
  { value: 'inactive', label: 'Inactive', count: 0 },
  { value: 'admin', label: 'Admins', count: 0 },
  { value: 'user', label: 'Users', count: 0 }
];

export function UserFilters({ activeFilter, onFilterChange, users }: UserFiltersProps) {
  // Calculate counts for each filter
  const filtersWithCounts = FILTERS.map(filter => ({
    ...filter,
    count: filter.value === 'all' 
      ? users.length
      : filter.value === 'active'
      ? users.filter(u => u.isActive).length
      : filter.value === 'inactive'
      ? users.filter(u => !u.isActive).length
      : filter.value === 'admin'
      ? users.filter(u => u.role === 'admin').length
      : users.filter(u => u.role === 'user').length
  }));

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filtersWithCounts.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            'filter-button',
            activeFilter === filter.value && 'active'
          )}
        >
          <Filter className="w-4 h-4 mr-1.5" />
          {filter.label}
          <span className="ml-1.5 bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded-full">
            {filter.count}
          </span>
        </button>
      ))}
    </div>
  );
}
