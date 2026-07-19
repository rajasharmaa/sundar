// src/pages/Register.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import IndustrialBackground from '@/components/IndustrialBackground';
import { User, Mail, Lock, Phone, ArrowLeft, Check, X, Eye, EyeOff } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useSiteSettings } from '@/hooks/useSiteSettings';

// ✅ Unified password configuration
const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  MIN_STRENGTH: 3, // Uppercase + Number + Special required
};

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isLoading } = useAuth();
  const { toast } = useToast();
  const { settings } = useSiteSettings();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [logoError, setLogoError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailFromQuery = params.get('email');
    if (emailFromQuery) {
      // Sanitize the email search query parameter to strip < and > characters
      const sanitizedEmail = emailFromQuery.replace(/[<>]/g, '');
      setFormData(prev => ({ ...prev, email: sanitizedEmail }));
    }
  }, [location.search]);

  useEffect(() => {
    if (formData.password) {
      const strength = calculatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const validateField = (name: string, value: string, currentPassword?: string) => {
    const newErrors = { ...errors };

    if (name === 'name') {
      if (!value.trim()) {
        newErrors.name = 'Name is required';
      } else if (value.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      } else {
        delete newErrors.name;
      }
    }

    if (name === 'email') {
      if (!value) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = 'Invalid email format';
      } else {
        delete newErrors.email;
      }
    }

    if (name === 'phone') {
      // Correct phone validation regex for India after stripping separators
      const strippedPhone = value.replace(/[\s\-()]/g, '');
      if (value && !/^(\+91)?[6-9]\d{9}$/.test(strippedPhone)) {
        newErrors.phone = 'Invalid Indian phone number';
      } else {
        delete newErrors.phone;
      }
    }

    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      if (!value) {
        newErrors.password = 'Password is required';
      } else if (value.length < PASSWORD_CONFIG.MIN_LENGTH) {
        newErrors.password = `Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters`;
      } else if (strength < PASSWORD_CONFIG.MIN_STRENGTH) {
        newErrors.password = 'Password must meet all complexity requirements.';
      } else {
        delete newErrors.password;
      }

      // Also validate confirmPassword if it exists, since password changed
      const confirmVal = formData.confirmPassword;
      if (confirmVal) {
        if (value !== confirmVal) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
      }
    }

    if (name === 'confirmPassword') {
      const pwdVal = currentPassword !== undefined ? currentPassword : formData.password;
      if (pwdVal !== value) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < PASSWORD_CONFIG.MIN_LENGTH) {
      newErrors.password = `Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters`;
    } else if (passwordStrength < PASSWORD_CONFIG.MIN_STRENGTH) {
      newErrors.password = 'Password must meet all complexity requirements.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    const strippedPhone = formData.phone.replace(/[\s\-()]/g, '');
    if (formData.phone && !/^(\+91)?[6-9]\d{9}$/.test(strippedPhone)) {
      newErrors.phone = 'Invalid Indian phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    // Client-side rate limiting: max 5 attempts per minute
    const now = Date.now();
    const attemptsStr = localStorage.getItem('register_attempts');
    let attempts: number[] = attemptsStr ? JSON.parse(attemptsStr) : [];
    
    attempts = attempts.filter(timestamp => now - timestamp < 60000);
    
    if (attempts.length >= 5) {
      toast({
        title: 'Too Many Attempts',
        description: 'You have exceeded the limit of 5 registration attempts per minute. Please wait and try again later.',
        variant: 'destructive',
      });
      return;
    }
    
    attempts.push(now);
    localStorage.setItem('register_attempts', JSON.stringify(attempts));

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined
      });

      toast({
        title: 'Registration Successful!',
        description: 'Your account has been created. Please log in.',
        className: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0',
      });

      navigate('/login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Please try again';
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-orange-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    if (passwordStrength === 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength === 1) return 'Very Weak';
    if (passwordStrength === 2) return 'Weak';
    if (passwordStrength === 3) return 'Medium';
    if (passwordStrength === 4) return 'Good';
    return 'Strong';
  };

  return (
    <>
      <SEO title="Register" description="Create your Damodar Traders account" noIndex={true} />

      <IndustrialBackground />

      <div className="min-h-screen flex items-center justify-center px-5 py-10">
        <motion.div
          className="w-full max-w-md bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/50"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
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
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Join Damodar Traders today</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, name: val }));
                      validateField('name', val);
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                </div>
                {errors.name && (
                  <p id="name-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <X className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
                {formData.name.trim().length >= 2 && !errors.name && (
                  <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Name is valid
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, email: val }));
                      validateField('email', val);
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter your email"
                    autoComplete="email"
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <X className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
                {formData.email && !errors.email && (
                  <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Email is valid
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, phone: val }));
                      validateField('phone', val);
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="+91 1234567890"
                    autoComplete="tel"
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                  />
                </div>
                {errors.phone && (
                  <p id="phone-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <X className="w-4 h-4" />
                    {errors.phone}
                  </p>
                )}
                {formData.phone && !errors.phone && (
                  <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Phone number is valid
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, password: val }));
                      validateField('password', val);
                    }}
                    className={`w-full pl-10 pr-10 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {formData.password && (
                  <div className="mt-2" aria-live="polite">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Password Strength:</span>
                      <span className={`text-xs font-medium ${passwordStrength >= 5 ? 'text-green-600' :
                        passwordStrength >= 4 ? 'text-blue-600' :
                          passwordStrength >= 3 ? 'text-yellow-600' :
                            passwordStrength >= 2 ? 'text-orange-500' : 'text-red-600'
                        }`}>
                        {getStrengthText()}
                      </span>
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getStrengthColor()} transition-all duration-300`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p id="password-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <X className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
                {formData.password && !errors.password && (
                  <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Password is valid
                  </p>
                )}

                <ul className="mt-2 space-y-1" aria-live="polite">
                  <li className="flex items-center gap-2 text-xs text-gray-600">
                    <Check className={`w-3 h-3 ${formData.password.length >= 8 ? 'text-green-500' : 'text-gray-300'}`} />
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2 text-xs text-gray-600">
                    <Check className={`w-3 h-3 ${/[a-z]/.test(formData.password) ? 'text-green-500' : 'text-gray-300'}`} />
                    At least one lowercase letter
                  </li>
                  <li className="flex items-center gap-2 text-xs text-gray-600">
                    <Check className={`w-3 h-3 ${/[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-gray-300'}`} />
                    At least one uppercase letter
                  </li>
                  <li className="flex items-center gap-2 text-xs text-gray-600">
                    <Check className={`w-3 h-3 ${/[0-9]/.test(formData.password) ? 'text-green-500' : 'text-gray-300'}`} />
                    At least one number
                  </li>
                  <li className="flex items-center gap-2 text-xs text-gray-600">
                    <Check className={`w-3 h-3 ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-500' : 'text-gray-300'}`} />
                    At least one special character
                  </li>
                </ul>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, confirmPassword: val }));
                      validateField('confirmPassword', val);
                    }}
                    className={`w-full pl-10 pr-10 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p id="confirmPassword-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <X className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
                {formData.password && formData.confirmPassword && (
                  <p className={`mt-1 text-sm flex items-center gap-1 ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <Check className="w-4 h-4" />
                        Passwords Match
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Passwords Don't Match
                      </>
                    )}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                ) : (
                  <>
                    <User className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Log in here
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs text-blue-800">
              By creating an account, you agree to our{' '}
              <Link to="/terms-conditions" className="font-medium hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy-policy" className="font-medium hover:underline">Privacy Policy</Link>.
              Your password is securely encrypted and never stored in plain text.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Register;