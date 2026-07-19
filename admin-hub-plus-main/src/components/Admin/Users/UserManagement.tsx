import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import type { User } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { UserCard } from './UserCard';
import { UserFilters } from './UserFilters';
import { UsersStats } from './UsersStats';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Users, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

type FilterValue = 'all' | 'active' | 'inactive' | 'admin' | 'user';

export function UserManagement() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
    refetchInterval: 60000, // Auto-refresh every minute
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      userService.updateStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated');
    },
    onError: () => {
      toast.error('Failed to update user status');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'user' | 'admin' }) =>
      userService.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated');
    },
    onError: () => {
      toast.error('Failed to update user role');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
      setUserToDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete user');
    },
  });

  const filteredUsers = users.filter((user) => {
    switch (activeFilter) {
      case 'active':
        return user.isActive;
      case 'inactive':
        return !user.isActive;
      case 'admin':
        return user.role === 'admin';
      case 'user':
        return user.role === 'user';
      default:
        return true;
    }
  });

  const handleStatusChange = (id: string, isActive: boolean) => {
    updateStatusMutation.mutate({ id, isActive });
  };

  const handleRoleChange = (id: string, role: 'user' | 'admin') => {
    updateRoleMutation.mutate({ id, role });
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete._id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">User Management</h2>
        <p className="text-muted-foreground">Manage registered users and their permissions</p>
      </div>

      {/* Statistics Cards */}
      <UsersStats users={users} />

      {/* Filter Buttons */}
      <UserFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} users={users} />

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No Users Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {activeFilter === 'all'
              ? 'No users registered yet'
              : `No ${activeFilter} users`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredUsers.map((user, index) => (
            <div key={user._id} style={{ animationDelay: `${index * 50}ms` }}>
              <UserCard
                user={user}
                onStatusChange={handleStatusChange}
                onRoleChange={handleRoleChange}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{userToDelete?.name}"? This will permanently remove 
              all their data including inquiries and wishlist. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
