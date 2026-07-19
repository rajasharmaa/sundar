/**
 * AnchorLink Component
 * Professional anchor link component with automatic navbar offset compensation
 * 
 * Features:
 * - Smooth scrolling with proper offset
 * - Active state highlighting
 * - URL hash management
 * - Keyboard accessibility
 * - Reduced motion support
 */

import { Link } from 'react-router-dom';
import { scrollToElement } from '@/utils/scrollUtils';
import { useReducedMotion } from '@/hooks/useAnimations';

interface AnchorLinkProps {
  /** The ID of the target element to scroll to */
  href: string;
  /** Children elements (link text, icons, etc.) */
  children: React.ReactNode;
  /** Custom offset in pixels (default: auto-detects navbar height) */
  offset?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to update URL hash (default: true) */
  updateHash?: boolean;
  /** Callback function after scroll completes */
  onScrollComplete?: () => void;
  /** Disable smooth scrolling for this link */
  disableSmoothScroll?: boolean;
  /** Aria label for accessibility */
  ariaLabel?: string;
}

export const AnchorLink = ({
  href,
  children,
  offset,
  className = '',
  updateHash = true,
  onScrollComplete,
  disableSmoothScroll = false,
  ariaLabel
}: AnchorLinkProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  // Extract just the ID from the href (remove # if present)
  const targetId = href.replace(/^#/, '');
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    const shouldSmoothScroll = !disableSmoothScroll && !prefersReducedMotion;
    
    scrollToElement(targetId, {
      offset,
      smooth: shouldSmoothScroll,
      behavior: shouldSmoothScroll ? 'smooth' : 'auto'
    });
    
    // Update URL hash if needed
    if (updateHash) {
      const newUrl = `${window.location.pathname}${window.location.search}#${targetId}`;
      window.history.pushState({}, '', newUrl);
    }
    
    // Execute callback after scroll animation
    if (onScrollComplete) {
      const scrollDuration = shouldSmoothScroll ? 500 : 100;
      setTimeout(onScrollComplete, scrollDuration);
    }
  };
  
  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
      role="link"
      tabIndex={0}
    >
      {children}
    </a>
  );
};

/**
 * NavAnchorLink Component
 * Specialized AnchorLink for navigation with active state tracking
 */
interface NavAnchorLinkProps extends Omit<AnchorLinkProps, 'updateHash'> {
  /** Current path for active state detection */
  currentPath?: string;
  /** Base path for route matching */
  basePath?: string;
  /** Class name when link is active */
  activeClassName?: string;
}

export const NavAnchorLink = ({
  href,
  children,
  offset,
  className = '',
  activeClassName = 'active',
  currentPath,
  basePath,
  onScrollComplete,
  disableSmoothScroll = false,
  ariaLabel
}: NavAnchorLinkProps) => {
  const targetId = href.replace(/^#/, '');
  const prefersReducedMotion = useReducedMotion();
  
  // Check if this section is currently in viewport
  const isActive = typeof window !== 'undefined' && 
    document.getElementById(targetId)?.getAttribute('data-active') === 'true';
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    const shouldSmoothScroll = !disableSmoothScroll && !prefersReducedMotion;
    
    scrollToElement(targetId, {
      offset,
      smooth: shouldSmoothScroll,
      behavior: shouldSmoothScroll ? 'smooth' : 'auto'
    });
    
    // Update URL hash
    const newUrl = `${window.location.pathname}${window.location.search}#${targetId}`;
    window.history.pushState({}, '', newUrl);
    
    if (onScrollComplete) {
      const scrollDuration = shouldSmoothScroll ? 500 : 100;
      setTimeout(onScrollComplete, scrollDuration);
    }
  };
  
  const combinedClassName = `${className}${isActive ? ` ${activeClassName}` : ''}`;
  
  return (
    <a
      href={href}
      onClick={handleClick}
      className={combinedClassName}
      aria-label={ariaLabel}
      role="link"
      aria-current={isActive ? 'location' : undefined}
      tabIndex={0}
      data-section={targetId}
    >
      {children}
    </a>
  );
};

export default AnchorLink;
