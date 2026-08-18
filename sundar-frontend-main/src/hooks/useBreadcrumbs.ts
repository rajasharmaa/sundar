import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Custom hook for generating breadcrumbs based on route
 * Can be extended with custom breadcrumb logic per route
 */
export const useBreadcrumbs = (customItems?: BreadcrumbItem[]) => {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    // If custom items provided, use them
    if (customItems && customItems.length > 0) {
      return [
        { label: 'Home', href: '/' },
        ...customItems
      ];
    }

    // Auto-generate from route
    const pathname = location.pathname;
    const paths = pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];

    let accumulatedPath = '';
    
    paths.forEach((path, index) => {
      accumulatedPath += `/${path}`;
      
      // Convert path to readable label
      let label = path.replace(/-/g, ' ').replace(/\+/g, ' ');
      label = label.charAt(0).toUpperCase() + label.slice(1);
      
      // Special cases for common routes
      const labelMap: Record<string, string> = {
        products: 'Products',
        categories: 'Categories',
        about: 'About Us',
        contact: 'Contact',
        account: 'My Account',
        login: 'Login',
        register: 'Register',
        'privacy-policy': 'Privacy Policy',
        'terms-conditions': 'Terms & Conditions'
      };
      
      if (labelMap[path]) {
        label = labelMap[path];
      }
      
      items.push({
        label,
        href: index === paths.length - 1 ? undefined : accumulatedPath
      });
    });

    return items;
  }, [location.pathname, customItems]);

  return breadcrumbs;
};

export default useBreadcrumbs;
