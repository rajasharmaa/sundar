/**
 * ScrollOffsetProvider Component
 * Global provider that ensures proper scroll offset for fixed navbar
 * 
 * This component:
 * 1. Intercepts all anchor link clicks
 * 2. Applies smooth scrolling with proper offset
 * 3. Works globally across the entire app
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollOffsetProviderProps {
  children: React.ReactNode;
  /** Offset in pixels (default: 100px for navbar) */
  offset?: number;
}

export const ScrollOffsetProvider = ({
  children,
  offset = 100
}: ScrollOffsetProviderProps) => {
  const location = useLocation();

  useEffect(() => {
    // Handle hash changes on route navigation
    if (location.hash) {
      const elementId = location.hash.replace('#', '');
      const element = document.getElementById(elementId);

      if (element) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          scrollToElementWithOffset(elementId, offset);
        }, 100);
      }
    } else {
      // No hash - scroll to top
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    // Global click handler for all anchor links
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLAnchorElement;

      // Check if clicked element is an anchor link
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        const elementId = target.getAttribute('href')?.substring(1);

        if (elementId) {
          event.preventDefault();

          const element = document.getElementById(elementId);
          if (element) {
            scrollToElementWithOffset(elementId, offset);

            // Update URL hash without triggering scroll
            window.history.pushState({}, '', `#${elementId}`);
          }
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [offset]);

  return <>{children}</>;
};

/**
 * Helper function to scroll to element with offset
 */
const scrollToElementWithOffset = (elementId: string, offset: number) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
};

export default ScrollOffsetProvider;
