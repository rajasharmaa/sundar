import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

/**
 * Dynamic Breadcrumb Navigation Component
 * - Auto-generates breadcrumbs based on route if items not provided
 * - Supports structured data for SEO
 * - Mobile-responsive with proper wrapping and text truncation
 * - Prevents overflow on small screens (320px - 430px)
 */
export const Breadcrumbs = ({ items, className = '' }: BreadcrumbsProps) => {
  const location = useLocation();

  // Generate breadcrumbs from route if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathname = location.pathname;
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];

    let accumulatedPath = '';
    
    paths.forEach((path, index) => {
      accumulatedPath += `/${path}`;
      
      // Convert path to readable label
      let label = path.replace(/-/g, ' ').replace(/\+/g, ' ');
      label = label.charAt(0).toUpperCase() + label.slice(1);
      
      // Special cases for common routes
      if (path === 'products') label = 'Products';
      if (path === 'categories') label = 'Categories';
      if (path === 'about') label = 'About Us';
      if (path === 'contact') label = 'Contact';
      if (path === 'account') label = 'My Account';
      if (path === 'login') label = 'Login';
      if (path === 'register') label = 'Register';
      
      breadcrumbs.push({
        label,
        href: index === paths.length - 1 ? undefined : accumulatedPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  // Generate structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `https://damodartraders.com${item.href}` : undefined
    }))
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Breadcrumb Navigation - Mobile Responsive */}
      <div className="w-full overflow-hidden">
        <nav 
          className={`flex flex-wrap items-center gap-1 xs:gap-1.5 text-sm w-full max-w-full ${className}`}
          aria-label="Breadcrumb"
        >
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            
            return (
              <motion.div
                key={index}
                className="flex items-center min-w-0 flex-shrink-0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {/* Separator */}
                {index > 0 && (
                  <ChevronRight 
                    className="w-3.5 h-3.5 xs:w-4 xs:h-4 mx-0.5 text-gray-400 flex-shrink-0" 
                    aria-hidden="true"
                  />
                )}
                
                {/* Breadcrumb Item */}
                {isLast ? (
                  <span 
                    className="font-semibold text-gray-900 px-2 py-1 rounded-md bg-gray-100 max-w-[100px] xs:max-w-[120px] sm:max-w-[150px] truncate block"
                    aria-current="page"
                    title={item.label}
                  >
                    {item.href === '/' ? (
                      <span className="flex items-center gap-1">
                        <Home className="w-3.5 h-3.5 xs:w-4 xs:h-4 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>
                    ) : (
                      <span className="truncate">{item.label}</span>
                    )}
                  </span>
                ) : (
                  <Link
                    to={item.href!}
                    className="text-gray-600 hover:text-blue-600 transition-colors px-2 py-1 rounded-md hover:bg-gray-50 max-w-[100px] xs:max-w-[120px] sm:max-w-[150px] truncate block"
                    title={item.label}
                  >
                    {item.href === '/' ? (
                      <span className="flex items-center gap-1">
                        <Home className="w-3.5 h-3.5 xs:w-4 xs:h-4 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>
                    ) : (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Breadcrumbs;
