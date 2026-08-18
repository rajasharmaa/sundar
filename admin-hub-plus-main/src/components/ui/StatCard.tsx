import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  variant: 'products' | 'inquiries' | 'users' | 'alerts';
  icon?: LucideIcon;
  isLoading?: boolean;
  trend?: number; // percentage change
}

export function StatCard({
  title,
  value,
  description,
  variant,
  icon: Icon,
  isLoading,
  trend,
}: StatCardProps) {
  // Define color schemes based on variant
  const colors = {
    products: 'from-green-500/20 to-green-600/5 text-green-600 border-green-200/50 bg-green-100',
    inquiries: 'from-emerald-500/20 to-emerald-600/5 text-emerald-600 border-emerald-200/50 bg-emerald-100',
    users: 'from-purple-500/20 to-purple-600/5 text-purple-600 border-purple-200/50 bg-purple-100',
    alerts: 'from-rose-500/20 to-rose-600/5 text-rose-600 border-rose-200/50 bg-rose-100',
  };

  const scheme = colors[variant];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 group',
        `border-${variant}-200/50`
      )}
    >
      {/* Subtle Background Gradient */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-100 transition-opacity duration-500',
        scheme.split(' ').slice(0, 2).join(' ')
      )} />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </h3>
          
          <div className="flex items-baseline gap-3 mt-2">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {isLoading ? (
                <div className="h-9 w-24 bg-slate-200 animate-pulse rounded-lg" />
              ) : (
                value
              )}
            </div>
            
            {/* Trend Indicator */}
            {!isLoading && trend !== undefined && (
              <div className={cn(
                "flex items-center text-xs font-bold px-2 py-0.5 rounded-full",
                trend > 0 ? "text-emerald-700 bg-emerald-100" : 
                trend < 0 ? "text-rose-700 bg-rose-100" : 
                "text-slate-600 bg-slate-100"
              )}>
                {trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : 
                 trend < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : 
                 <Minus className="w-3 h-3 mr-1" />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          
          <p className="text-sm text-slate-500 mt-2 font-medium">{description}</p>
        </div>
        
        {Icon && (
          <div
            className={cn(
              'p-3.5 rounded-xl shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3',
              scheme.split(' ').slice(2).join(' ') // Get text and bg colors
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
