/**
 * useScrollToSection Hook
 * Provides smooth scrolling functionality with navbar offset compensation
 * 
 * @description Handles anchor link navigation while accounting for fixed/sticky navbars
 * @returns Object containing scrollToSection function
 */

import { useState, useEffect } from 'react';

export const useScrollToSection = () => {
  /**
   * Scroll to a specific element with navbar offset compensation
   * @param elementId - The ID of the element to scroll to
   * @param options - Optional configuration
   * @param options.offset - Additional offset in pixels (default: 90px for navbar)
   * @param options.smooth - Whether to use smooth scrolling (default: true)
   * @param options.callback - Optional callback function after scroll completes
   */
  const scrollToSection = (
    elementId: string,
    options?: {
      offset?: number;
      smooth?: boolean;
      callback?: () => void;
    }
  ) => {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element with id "${elementId}" not found`);
      return;
    }

    const {
      offset = 90, // Default navbar offset
      smooth = true,
      callback
    } = options || {};

    // Get element position relative to viewport
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    // Perform smooth scroll
    window.scrollTo({
      top: offsetPosition,
      behavior: smooth ? 'smooth' : 'auto'
    });

    // Execute callback after scroll animation (approximate timing)
    if (callback && smooth) {
      setTimeout(callback, 500);
    } else if (callback) {
      callback();
    }
  };

  /**
   * Scroll to top of page
   * @param smooth - Whether to use smooth scrolling (default: true)
   */
  const scrollToTop = (smooth: boolean = true) => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto'
    });
  };

  return {
    scrollToSection,
    scrollToTop
  };
};

/**
 * useActiveSection Hook
 * Tracks and highlights the currently visible section in the viewport
 * 
 * @param sectionIds - Array of section IDs to monitor
 * @param options - Configuration options
 * @returns Active section ID
 */
export const useActiveSection = (
  sectionIds: string[],
  options?: {
    rootMargin?: string;
    threshold?: number;
    offset?: number;
  }
) => {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const {
      rootMargin = '-100px 0px -60% 0px', // Adjust for navbar offset
      threshold = 0,
      offset = 90
    } = options || {};

    // Intersection Observer to detect which section is in view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);

            // Update URL hash without triggering scroll
            if (window.history.pushState) {
              const newUrl = `${window.location.pathname}${window.location.search}#${entry.target.id}`;
              window.history.replaceState({}, '', newUrl);
            }
          }
        });
      },
      {
        root: null,
        rootMargin,
        threshold
      }
    );

    // Observe all sections
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    // Cleanup observer on unmount
    return () => {
      observer.disconnect();
    };
  }, [sectionIds, options]);

  return activeSection;
};

export default useScrollToSection;
