// components/InteractiveStats.tsx
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import {
  Users, Package, Clock, Award,
  TrendingUp, Target, BarChart3, Percent,
  LucideIcon
} from 'lucide-react';
import CountUp from 'react-countup';

interface StatItem {
  icon: LucideIcon;
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  duration?: number;
  color?: string;
  gradient?: string;
  description?: string;
}

interface InteractiveStatsProps {
  stats?: StatItem[];
  animated?: boolean;
  layout?: 'grid' | 'carousel' | 'list';
  className?: string;
  delay?: number;
  withSparkles?: boolean;
}

const InteractiveStats = ({
  stats = [
    { icon: Users, value: 1500, label: 'Happy Clients', suffix: '+', duration: 2.5, color: 'text-blue-600', gradient: 'from-blue-500 to-cyan-500' },
    { icon: Package, value: 5000, label: 'Products', suffix: '+', duration: 3, color: 'text-green-600', gradient: 'from-green-500 to-emerald-500' },
    { icon: Clock, value: 12, label: 'Years Experience', suffix: '+', duration: 2, color: 'text-purple-600', gradient: 'from-purple-500 to-pink-500' },
    { icon: Award, value: 25, label: 'Industry Awards', suffix: '+', duration: 2.8, color: 'text-amber-600', gradient: 'from-amber-500 to-orange-500' },
  ],
  animated = true,
  layout = 'grid',
  className = '',
  delay = 0.1,
  withSparkles = true
}: InteractiveStatsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });
  const controls = useAnimation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isInView) {
      setIsVisible(true);
      controls.start('visible');
    }
  }, [isInView, controls]);

  // Mouse move effect for cards
  useEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      const cards = containerElement.querySelectorAll('.stat-card');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 25;
        const rotateY = (centerX - x) / 25;

        (card as HTMLElement).style.transform =
          `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });
    };

    const handleMouseLeave = () => {
      const cards = containerElement.querySelectorAll('.stat-card');
      cards.forEach((card) => {
        (card as HTMLElement).style.transform =
          'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    };

    containerElement.addEventListener('mousemove', handleMouseMove);
    containerElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      containerElement.removeEventListener('mousemove', handleMouseMove);
      containerElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: delay
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const renderStatCard = (stat: StatItem, index: number) => (
    <motion.div
      key={index}
      className="stat-card group relative p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"

      whileHover={{ y: -10 }}
    >
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
      />

      {/* Animated Border */}
      <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon Container */}
        <div className="mb-6">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-md`}>
              <stat.icon className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Floating Sparkles */}
          {withSparkles && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 bg-yellow-400 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Animated Number */}
        <div className="mb-2">
          <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-cyan-600 transition-all duration-300">
            {animated && isVisible ? (
              <CountUp
                start={0}
                end={stat.value}
                duration={stat.duration}
                suffix={stat.suffix}
                prefix={stat.prefix}
                separator=","
                decimals={0}
              />
            ) : (
              `${stat.prefix || ''}${stat.value}${stat.suffix || ''}`
            )}
          </div>
        </div>

        {/* Label */}
        <div className={`text-lg font-semibold ${stat.color} mb-2`}>
          {stat.label}
        </div>

        {/* Description */}
        {stat.description && (
          <p className="text-sm text-gray-600 mt-2">
            {stat.description}
          </p>
        )}

        {/* Progress Indicator */}
        <div className="mt-4">
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${stat.gradient}`}
              initial={{ width: 0 }}
              animate={isVisible ? { width: '100%' } : { width: 0 }}
              transition={{ duration: stat.duration || 2, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Hover Effect Elements */}
      <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150" />
      <div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150 delay-150" />
    </motion.div>
  );

  if (layout === 'carousel') {
    return (
      <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
        <motion.div
          className="flex space-x-6"
          animate={controls}
          variants={containerVariants}
          initial="hidden"
        >
          {stats.map((stat, index) => (
            <div key={index} className="min-w-[300px]">
              {renderStatCard(stat, index)}
            </div>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={controls}
    >
      {stats.map((stat, index) => renderStatCard(stat, index))}
    </motion.div>
  );
};

// Advanced Stats with Charts
export const AdvancedStats = ({ stats }: { stats: StatItem[] }) => {
  const [activeStat, setActiveStat] = useState(0);

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      {/* Stats Cards */}
      <div className="space-y-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${activeStat === index
                ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-lg'
                : 'bg-white border border-gray-200 hover:border-blue-300'
              }`}
            onClick={() => setActiveStat(index)}
            whileHover={{ x: 10 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${activeStat === index ? 'bg-blue-500' : 'bg-gray-300'}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Animated Chart */}
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8">
        <div className="text-white mb-6">
          <h3 className="text-2xl font-bold mb-2">Growth Overview</h3>
          <p className="text-gray-400">Real-time statistics and trends</p>
        </div>

        <div className="h-64 relative">
          {/* Animated Bars */}
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className={`absolute bottom-0 w-12 rounded-t-lg ${stat.gradient?.replace('bg-gradient-to-br ', 'bg-gradient-to-t ')
                }`}
              style={{
                left: `${index * 25}%`,
                height: '0%'
              }}
              animate={{
                height: activeStat === index ? '100%' : `${(stat.value / Math.max(...stats.map(s => s.value))) * 80}%`
              }}
              transition={{ duration: 0.8, type: "spring" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Stats Comparison Component
export const StatsComparison = ({
  stats1,
  stats2,
  title1 = "Current Year",
  title2 = "Previous Year"
}: {
  stats1: StatItem[];
  stats2: StatItem[];
  title1?: string;
  title2?: string;
}) => {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{title1}</h3>
          <div className="space-y-4">
            {stats1.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.gradient}`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700">{stat.label}</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {stat.value}{stat.suffix}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{title2}</h3>
          <div className="space-y-4">
            {stats2.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.gradient}`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700">{stat.label}</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {stat.value}{stat.suffix}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Indicators */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Growth Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats1.map((stat, index) => {
            const growth = ((stat.value - stats2[index].value) / stats2[index].value) * 100;
            return (
              <div key={index} className="text-center p-4 bg-white rounded-xl">
                <div className={`text-2xl font-bold ${growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InteractiveStats;