import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import RememberMe from './RememberMe';

interface LoginFormProps {
  formData: { email: string; password: '' };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isCheckingServer: boolean;
  isServerWarming: boolean;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
  rememberMeChecked: boolean;
  onRememberMeChange: () => void;
  capsLockActive: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  isLoading,
  isCheckingServer,
  isServerWarming,
  showPassword,
  togglePasswordVisibility,
  rememberMeChecked,
  onRememberMeChange,
  capsLockActive,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 xs:space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={onInputChange}
            required
            disabled={isLoading || isCheckingServer}
            className="w-full pl-10 pr-4 py-3 xs:py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all hover:border-gray-400 min-h-[48px] text-sm xs:text-base"
            placeholder="Enter your email"
            autoComplete="email"
            inputMode="email"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <Link
            to={`/forgot-password${formData.email ? `?email=${encodeURIComponent(formData.email)}` : ''}`}
            className="text-xs xs:text-sm text-green-600 hover:text-green-800 transition-colors touch-target"
          >
            Forgot Password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={onInputChange}
            required
            disabled={isLoading || isCheckingServer}
            className="w-full pl-10 pr-12 py-3 xs:py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all hover:border-gray-400 min-h-[48px] text-sm xs:text-base"
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-target"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {capsLockActive && (
          <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
            <span>⚠ Caps Lock is ON</span>
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <RememberMe checked={rememberMeChecked} onChange={onRememberMeChange} />
      </div>

      <button
        type="submit"
        disabled={
          isLoading ||
          isCheckingServer ||
          isServerWarming ||
          !formData.email.trim() ||
          !formData.password.trim()
        }
        className="w-full py-3.5 xs:py-4 bg-gradient-to-r from-green-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] transform min-h-[48px] text-sm xs:text-base"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Authenticating...</span>
          </div>
        ) : isCheckingServer ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </div>
        ) : isServerWarming ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Server Starting...</span>
          </div>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            <span>Login to Account</span>
          </>
        )}
      </button>
    </form>
  );
};

export default LoginForm;
