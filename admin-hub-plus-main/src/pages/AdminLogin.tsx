import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_ROUTES } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Lock, User, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || ADMIN_ROUTES.PANEL;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // If already authenticated, redirect to admin panel
  if (isAuthenticated && !authLoading) {
    return <Navigate to={ADMIN_ROUTES.PANEL} replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login({
        username: data.username,
        password: data.password,
      });
      toast.success('Login successful!');
      navigate(from, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(222,47%,8%)] p-4">
      <div className="login-container animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">
            Sundar Corporation
            <span className="admin-badge">ADMIN</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">Administrator Panel</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              autoFocus
              {...register('username')}
              className={errors.username ? 'border-destructive' : ''}
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                Logging in...
                <LoadingSpinner size="sm" className="ml-2" />
              </>
            ) : (
              'Login to Admin Panel'
            )}
          </Button>
        </form>

        {/* Back Link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
