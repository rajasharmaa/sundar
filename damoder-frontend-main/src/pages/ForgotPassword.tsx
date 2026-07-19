// src/pages/ForgotPassword.tsx
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api/api-client';
import { useToast } from '@/hooks/use-toast';
import IndustrialBackground from '@/components/IndustrialBackground';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [logoError, setLogoError] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await api.auth.forgotPassword(email);
      
      toast({
        title: 'Check Your Email',
        description: 'Password reset instructions have been sent if an account exists.',
        className: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0',
      });
      
      setIsSubmitted(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Please try again later';
      setErrors({ email: errorMessage });
      toast({
        title: 'Failed to Send',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password - Damodar Traders</title>
        <meta name="description" content="Reset your Damodar Traders password" />
      </Helmet>

      <IndustrialBackground />

      <div className="min-h-screen flex items-center justify-center px-5 py-10">
        <motion.div
          className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-gray-200"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <Link to="/login" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>

          <div className="text-center mb-8">
            <Link to="/">
              {logoError ? (
                <div className="h-12 flex items-center justify-center bg-blue-50 text-blue-600 font-black px-6 rounded-2xl border border-blue-100 mx-auto w-max text-lg uppercase tracking-wider mb-4 shadow-sm">
                  Damodar Traders
                </div>
              ) : (
                <img
                  src={settings.logo}
                  alt="Damodar Traders"
                  className="h-12 mx-auto mb-4"
                  onError={() => setLogoError(true)}
                />
              )}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {isSubmitted ? 'Check Your Email' : 'Reset Password'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isSubmitted 
                ? 'We sent instructions to your email'
                : 'Enter your email to reset your password'
              }
            </p>
          </div>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-700 mb-6">
                If an account exists with <span className="font-semibold">{email}</span>, 
                you will receive password reset instructions shortly.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
                >
                  Return to Login
                </button>
                <button
                  onClick={() => {
                    setEmail('');
                    setIsSubmitted(false);
                  }}
                  className="w-full py-3 bg-gray-200 text-gray-800 font-medium rounded-xl hover:bg-gray-300 transition-all duration-300"
                >
                  Try Another Email
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-900">Forgot Your Password?</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Enter your email address and we'll send you instructions to reset your password.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) {
                          setErrors({ email: undefined });
                        }
                      }}
                      required
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Reset Instructions'
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPassword;