// pages/ResetPassword.tsx
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { api } from '../services/api/api-client';
import IndustrialBackground from '@/components/IndustrialBackground';
import { Lock, Check, X, Key, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const token = searchParams.get('token');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setPasswordStrength({
        length: value.length >= 12,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast({
        title: 'Invalid Reset Link',
        description: 'The reset link is invalid or expired.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Passwords Mismatch',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    // Check password strength
    const strengthScore = Object.values(passwordStrength).filter(v => v).length;
    if (strengthScore < 3) {
      toast({
        title: 'Weak Password',
        description: 'Please choose a stronger password.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await api.auth.resetPassword({
        token,
        password: formData.password,
      });

      toast({
        title: 'Password Reset Successful!',
        description: 'You can now login with your new password.',
        className: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0',
      });

      navigate('/login');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to reset password. Please try again.';
      toast({
        title: 'Reset Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const strengthScore = Object.values(passwordStrength).filter(v => v).length;
  const strengthColor = strengthScore >= 4 ? 'bg-green-500' :
    strengthScore >= 3 ? 'bg-yellow-500' :
      strengthScore >= 2 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <>
      <Helmet>
        <title>Reset Password - Damodar Traders</title>
        <meta name="description" content="Reset your Damodar Traders account password" />
      </Helmet>

      <IndustrialBackground />

      <div className="min-h-screen flex items-center justify-center px-5 py-10">
        <motion.div
          className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-gray-200"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back to Login Link */}
          <div className="mb-6">
            <Link to="/login" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-4">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-gray-600 mt-2">
              Create a new password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter new password"
                  />
                </div>

                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">Password Strength</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${strengthColor} text-white`}>
                        {strengthScore >= 4 ? 'Strong' :
                          strengthScore >= 3 ? 'Good' :
                            strengthScore >= 2 ? 'Fair' : 'Weak'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthColor} transition-all duration-300`}
                        style={{ width: `${strengthScore * 20}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {[
                        { key: 'length', label: 'At least 12 characters' },
                        { key: 'uppercase', label: 'Uppercase letter' },
                        { key: 'lowercase', label: 'Lowercase letter' },
                        { key: 'number', label: 'Number' },
                        { key: 'special', label: 'Special character' },
                      ].map((req) => (
                        <div key={req.key} className="flex items-center gap-2">
                          {passwordStrength[req.key as keyof typeof passwordStrength] ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={`text-xs ${passwordStrength[req.key as keyof typeof passwordStrength] ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-300 ring-red-200'
                      : 'border-gray-300'
                      }`}
                    placeholder="Confirm new password"
                  />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <X className="w-4 h-4" />
                    Passwords do not match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !token}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Resetting...
                  </div>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    Reset Password
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Token Status */}
          {!token && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-900">Invalid Reset Link</h3>
                  <p className="text-sm text-red-700 mt-1">
                    The password reset link is invalid or has expired. Please request a new reset link.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to="/login"
                  className="block w-full py-2 bg-red-600 text-white text-center font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">Need Help?</h3>
            <p className="text-sm text-blue-700 mb-3">
              If you're having trouble resetting your password, please contact our support team.
            </p>
            <a
              href="mailto:support@damodartraders.com"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Contact Support →
            </a>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ResetPassword;