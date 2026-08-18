import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface BaseProps {
  label: string;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, BaseProps { }
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, BaseProps {
  options: { value: string; label: string }[];
  placeholder?: string;
}
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, BaseProps { }

const Label = ({ children, required, className = "" }: { children: React.ReactNode; required?: boolean; className?: string }) => (
  <label className={`block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 ${className}`}>
    {children}
    {required && <span className="text-amber-500 ml-1 font-black">*</span>}
  </label>
);

const ErrorMessage = ({ error }: { error?: string }) => (
  <AnimatePresence>
    {error && (
      <motion.div
        initial={{ opacity: 0, height: 0, y: -5 }}
        animate={{ opacity: 1, height: 'auto', y: 0 }}
        exit={{ opacity: 0, height: 0, y: -5 }}
        className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 mt-1.5 ml-1"
      >
        <AlertCircle size={12} className="shrink-0" />
        <span>{error}</span>
      </motion.div>
    )}
  </AnimatePresence>
);

export const FormInput: React.FC<InputProps> = ({ label, error, required, icon, className = "", ...props }) => {
  return (
    <div className="w-full">
      <Label required={required}>{label}</Label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`
            w-full ${icon ? 'pl-11' : 'px-4'} py-3.5 bg-slate-900/50 border-2 rounded-xl outline-none transition-all duration-300
            ${error
              ? 'border-red-500/50 bg-red-500/10 focus:border-red-500'
              : 'border-slate-800 hover:border-slate-700 focus:border-amber-400 focus:bg-slate-900 focus:shadow-lg focus:shadow-amber-400/10'}
            placeholder:text-slate-600 text-slate-100 font-semibold text-sm
            ${className}
          `}
        />
      </div>
      <ErrorMessage error={error} />
    </div>
  );
};

export const FormSelect: React.FC<SelectProps> = ({ label, error, required, icon, options, className = "", ...props }) => {
  return (
    <div className="w-full">
      <Label required={required}>{label}</Label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors pointer-events-none">
            {icon}
          </div>
        )}
        <select
          {...props}
          className={`
            w-full ${icon ? 'pl-11' : 'px-4'} py-3.5 bg-slate-900/50 border-2 rounded-xl outline-none transition-all duration-300 appearance-none
            ${error
              ? 'border-red-500/50 bg-red-500/10 focus:border-red-500'
              : 'border-slate-800 hover:border-slate-700 focus:border-amber-400 focus:bg-slate-900 focus:shadow-lg focus:shadow-amber-400/10'}
            text-slate-100 font-semibold text-sm
            ${className}
          `}
        >
          <option value="" disabled>{props.placeholder || 'Select option'}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none bg-slate-900/50 pl-2">
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <ErrorMessage error={error} />
    </div>
  );
};

export const FormTextarea: React.FC<TextareaProps> = ({ label, error, required, className = "", ...props }) => {
  return (
    <div className="w-full">
      <Label required={required}>{label}</Label>
      <textarea
        {...props}
        className={`
          w-full px-4 py-3.5 bg-slate-900/50 border-2 rounded-xl outline-none transition-all duration-300 min-h-[120px]
          ${error
            ? 'border-red-500/50 bg-red-500/10 focus:border-red-500'
            : 'border-slate-800 hover:border-slate-700 focus:border-amber-400 focus:bg-slate-900 focus:shadow-lg focus:shadow-amber-400/10'}
          placeholder:text-slate-600 text-slate-100 font-semibold text-sm resize-none
          ${className}
        `}
      />
      <ErrorMessage error={error} />
    </div>
  );
};
