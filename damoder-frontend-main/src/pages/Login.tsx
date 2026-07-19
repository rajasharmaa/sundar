// src/pages/Login.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import logger from '@/lib/logger';
import IndustrialBackground from '@/components/IndustrialBackground';
import { ArrowLeft, UserPlus } from 'lucide-react';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { preflightLoginCheck } from '@/utils/server-health-check';
import { SEO } from '@/components/SEO';
import { AxiosError } from 'axios';
import { useSiteSettings } from '@/hooks/useSiteSettings';

// Subcomponents
import ServerStatusCard from '@/components/login/ServerStatusCard';
import ErrorMessage from '@/components/login/ErrorMessage';
import LoginForm from '@/components/login/LoginForm';
import LoginFooter from '@/components/login/LoginFooter';

interface ServerStatus {
  isWarming: boolean;
  isChecking: boolean;
  progress: number;
  message: string;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error: authError, resetError } = useAuth();
  const { toast } = useToast();
  const { settings } = useSiteSettings();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState('');
  const [localRememberMe, setLocalRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);

  // Unified Server Status State
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    isWarming: false,
    isChecking: false,
    progress: 0,
    message: 'Checking server status...'
  });

  // Local Attempt Counter State
  const [localAttempts, setLocalAttempts] = useState(() => {
    const saved = localStorage.getItem('login_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Refs for timeouts
  const warmupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🔧 SERVER WARMUP PROGRESS HANDLING
  useEffect(() => {
    const handleWarmupProgress = (progress: number, message: string) => {
      setServerStatus(prev => ({
        ...prev,
        isWarming: true,
        progress,
        message,
      }));

      if (progress >= 100) {
        if (warmupTimeoutRef.current) clearTimeout(warmupTimeoutRef.current);
        warmupTimeoutRef.current = setTimeout(() => {
          setServerStatus(prev => ({
            ...prev,
            isWarming: false,
            progress: 0,
            message: '',
          }));
        }, 2000);
      }
    };

    const warmupListener = handleWarmupProgress;

    if (typeof (window as any).addWarmupProgressListener === 'function') {
      (window as any).addWarmupProgressListener(warmupListener);
    }

    return () => {
      if (typeof (window as any).removeWarmupProgressListener === 'function') {
        (window as any).removeWarmupProgressListener(warmupListener);
      }
      if (warmupTimeoutRef.current) {
        clearTimeout(warmupTimeoutRef.current);
      }
    };
  }, []);

  // 🎹 CAPS LOCK DETECTION
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (typeof e.getModifierState === 'function') {
      if (e.getModifierState('CapsLock')) {
        setCapsLockActive(true);
      } else {
        setCapsLockActive(false);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyDown);
    };
  }, [handleKeyDown]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setLocalError('');
    if (authError) resetError();
  }, [authError, resetError]);

  const handleRememberMeToggle = useCallback(() => {
    setLocalRememberMe(prev => !prev);
  }, []);

  // 🔐 ENHANCED ERROR HANDLING (Hiding User Enumeration)
  const handleError = useCallback((err: unknown) => {
    let userFriendlyMessage = 'Login failed. Please try again.';
    let status: number | undefined;
    let errorMessage = '';

    if (err instanceof Error) {
      errorMessage = err.message.toLowerCase();
    }

    // Check for Axios error
    if (err && typeof err === 'object' && 'isAxiosError' in err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      status = axiosErr.response?.status;
      const responseMessage = axiosErr.response?.data?.message?.toLowerCase() || '';

      // Check for User Enumeration Risk: If message contains user/password existence info, show generic message
      if (
        status === 401 ||
        status === 404 ||
        responseMessage.includes('user not found') ||
        responseMessage.includes('incorrect password') ||
        responseMessage.includes('invalid credentials') ||
        responseMessage.includes('no user found')
      ) {
        userFriendlyMessage = 'Invalid email or password. Please check your credentials and try again.';
        
        // Increment attempt counter for auth failures
        const newAttempts = localAttempts + 1;
        setLocalAttempts(newAttempts);
        localStorage.setItem('login_attempts', newAttempts.toString());
        localStorage.setItem('last_failed_attempt', Date.now().toString());

        if (newAttempts >= 5) {
          userFriendlyMessage = 'Too many failed attempts. Your account has been temporarily locked for 5 minutes.';
        } else {
          const attemptsLeft = 5 - newAttempts;
          userFriendlyMessage = `Invalid email or password. You have ${attemptsLeft} attempt(s) left before lockout.`;
        }
      } else if (axiosErr.response?.data?.message) {
        userFriendlyMessage = axiosErr.response.data.message;
      }
    } else if (err instanceof Error) {
      if (err.message === 'LOGIN_TIMEOUT') {
        userFriendlyMessage = 'Network connection failed. Please check your internet connection and try again.';
      } else {
        userFriendlyMessage = err.message;
      }
    }

    // Network / Connection / Timeout categorization
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('connection') ||
      status === 0
    ) {
      userFriendlyMessage = 'Network connection failed. Please check your internet connection and try again.';
    } else if (
      errorMessage.includes('timeout') ||
      errorMessage.includes('timed out') ||
      status === 408
    ) {
      userFriendlyMessage = 'Request timed out. The server may be starting up. Please try again in a moment.';
    } else if (
      status === 503 ||
      status === 502 ||
      errorMessage.includes('unavailable') ||
      errorMessage.includes('500') ||
      errorMessage.includes('service')
    ) {
      userFriendlyMessage = 'Service is temporarily unavailable. Please try again in a few moments.';
    } else if (status === 429 || errorMessage.includes('too many')) {
      userFriendlyMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
    } else if (status === 423 || errorMessage.includes('locked')) {
      userFriendlyMessage = 'Account temporarily locked due to security. Please contact support.';
    }

    setLocalError(userFriendlyMessage);

    // Log error securely (WITHOUT EMAIL OR PASSWORD INFO)
    logger.error('Login failed', {
      status,
      errorMessage: err instanceof Error ? err.message : String(err),
      userFriendlyMessage,
    });
  }, [localAttempts]);

  // 🔐 DEDICATED LOGIN LOGIC
  const performLogin = useCallback(async () => {
    const loginPromise = login(formData.email, formData.password, localRememberMe);

    // Timeout protection
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('LOGIN_TIMEOUT')), 15000)
    );

    await Promise.race([loginPromise, timeoutPromise]);

    toast({
      title: 'Login Successful!',
      description: 'Welcome back to Damodar Traders.',
      className: 'bg-green-600 text-white border-0',
      duration: 3000,
    });

    // Reset attempt counter on success
    localStorage.removeItem('login_attempts');
    localStorage.removeItem('last_failed_attempt');
    setLocalAttempts(0);

    const from = location.state?.from || '/';
    navigate(from, { replace: true });
  }, [formData, localRememberMe, login, navigate, location.state?.from, toast]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔒 Race condition protection
    if (isLoading || serverStatus.isChecking || serverStatus.isWarming) return;

    setLocalError('');
    resetError();

    // Check attempts lockout
    const now = Date.now();
    const lastFailedStr = localStorage.getItem('last_failed_attempt');
    const lastFailed = lastFailedStr ? parseInt(lastFailedStr, 10) : 0;
    
    if (localAttempts >= 5 && now - lastFailed < 5 * 60 * 1000) {
      const minutesLeft = Math.ceil((5 * 60 * 1000 - (now - lastFailed)) / 60000);
      setLocalError(`Too many failed login attempts. Your account is temporarily locked. Please try again in ${minutesLeft} minute(s).`);
      return;
    }

    // Client-side validations
    if (!formData.email.trim()) {
      setLocalError('Please enter your email address');
      return;
    }

    if (!formData.password.trim()) {
      setLocalError('Please enter your password');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setLocalError('Please enter a valid email address');
      return;
    }

    setServerStatus(prev => ({ ...prev, isChecking: true, message: 'Preparing connection...' }));

    try {
      // Preflight server health check
      const serverCheck = await preflightLoginCheck((progress, message) => {
        setServerStatus(prev => ({
          ...prev,
          isChecking: true,
          progress,
          message,
        }));
      });

      if (!serverCheck.canProceed) {
        setServerStatus(prev => ({ ...prev, isChecking: false, isWarming: false }));
        setLocalError(serverCheck.message || 'Server is unavailable. Please try again later.');
        return;
      }

      setServerStatus(prev => ({
        ...prev,
        progress: 100,
        message: 'Server connected successfully',
      }));

      await performLogin();

    } catch (err) {
      handleError(err);
    } finally {
      setServerStatus(prev => ({ ...prev, isChecking: false }));
    }
  }, [formData, isLoading, serverStatus.isChecking, serverStatus.isWarming, localAttempts, performLogin, handleError, resetError]);

  return (
    <>
      <SEO title="Login" description="Login to your Damodar Traders account" noIndex={true} />

      <IndustrialBackground />

      <div className="min-h-screen flex items-center justify-center px-4 xs:px-5 py-8 xs:py-10 relative z-10">
        <motion.div
          className="w-full max-w-md bg-white/90 backdrop-blur-md p-6 xs:p-8 rounded-3xl shadow-2xl border border-white/50"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm xs:text-base text-gray-600 hover:text-blue-600 transition-colors touch-target">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          <div className="text-center mb-6 xs:mb-8">
            <Link to="/">
              {logoError ? (
                <div className="h-12 xs:h-14 sm:h-16 flex items-center justify-center bg-blue-50 text-blue-600 font-black px-6 rounded-2xl border border-blue-100 mx-auto w-max text-lg uppercase tracking-wider mb-3 xs:mb-4 shadow-sm">
                  Damodar Traders
                </div>
              ) : (
                <img
                  src={settings.logo}
                  alt="Damodar Traders"
                  className="h-12 xs:h-14 sm:h-16 mx-auto mb-3 xs:mb-4 object-contain"
                  onError={() => setLogoError(true)}
                />
              )}
            </Link>
            <h1 className="text-2xl xs:text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-sm xs:text-base text-gray-600 mt-2">Login to your account</p>
          </div>

          {/* Server checking and warmup progress */}
          <ServerStatusCard
            isChecking={serverStatus.isChecking}
            isWarming={serverStatus.isWarming}
            progress={serverStatus.progress}
            message={serverStatus.message}
          />

          {/* Error Message Card */}
          <ErrorMessage error={localError || authError} hasTip={!!authError} />

          {/* Main Credentials Form */}
          <LoginForm
            formData={formData as any}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            isCheckingServer={serverStatus.isChecking}
            isServerWarming={serverStatus.isWarming}
            showPassword={showPassword}
            togglePasswordVisibility={togglePasswordVisibility}
            rememberMeChecked={localRememberMe}
            onRememberMeChange={handleRememberMeToggle}
            capsLockActive={capsLockActive}
          />

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <span className="relative px-3 bg-white text-xs text-gray-400 font-medium">Or continue with</span>
          </div>

          <GoogleLoginButton />

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Don't have an account?
            </p>
            <Link
              to="/register"
              className="inline-block w-full py-3.5 bg-gradient-to-r from-gray-900 to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 text-center shadow-lg hover:from-gray-800 hover:to-gray-600 hover:shadow-xl hover:scale-[1.02]"
            >
              <UserPlus className="w-5 h-5 inline mr-2" />
              Create New Account
            </Link>
          </div>

          {/* Policy Links & Copyright Footer */}
          <LoginFooter />
        </motion.div>
      </div>
    </>
  );
};

export default Login;
