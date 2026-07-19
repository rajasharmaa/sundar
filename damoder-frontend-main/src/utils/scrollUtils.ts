/**
 * Smooth Scroll Utilities
 * Professional scroll offset management for fixed/sticky navbars
 */

/**
 * Get the current navbar height including padding and borders
 */
export const getNavbarOffset = (): number => {
  // Try to get from CSS variable first
  const rootStyles = getComputedStyle(document.documentElement);
  const cssOffset = rootStyles.getPropertyValue('--navbar-offset').trim();

  if (cssOffset) {
    return parseFloat(cssOffset) || 90;
  }

  // Fallback: Calculate based on navbar element
  const navbar = document.querySelector('nav[aria-label="Main Navigation"]');
  if (navbar) {
    const rect = navbar.getBoundingClientRect();
    return rect.height + 20; // Add some buffer
  }

  // Default fallback
  return 90;
};

/**
 * Smooth scroll to an element with navbar offset compensation
 * @param elementId - The ID of the element to scroll to
 * @param options - Scroll options
 */
export const scrollToElement = (
  elementId: string,
  options?: {
    offset?: number;
    smooth?: boolean;
    behavior?: ScrollBehavior;
  }
): void => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with id "${elementId}" not found`);
    return;
  }

  const {
    offset = getNavbarOffset(),
    smooth = true,
    behavior = smooth ? 'smooth' : 'auto'
  } = options || {};

  // Calculate position with offset
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior
  });
};

/**
 * Scroll to element using data attribute selector
 * @param selector - Data attribute selector (e.g., '[data-section="products"]')
 * @param offset - Pixel offset from top
 */
export const scrollToSelector = (
  selector: string,
  offset?: number,
  smooth: boolean = true
): void => {
  const element = document.querySelector(selector);
  if (!element) {
    console.warn(`Element with selector "${selector}" not found`);
    return;
  }

  const elementId = element.id || `temp-${Date.now()}`;

  // Temporarily add ID if not present
  if (!element.id) {
    element.setAttribute('id', elementId);
  }

  scrollToElement(elementId, { offset, smooth });

  // Clean up temporary ID
  if (!element.id.startsWith('temp-')) {
    element.removeAttribute('id');
  }
};

/**
 * Get scroll position adjusted for navbar offset
 */
export const getAdjustedScrollPosition = (offset?: number): number => {
  const navbarOffset = offset || getNavbarOffset();
  return window.pageYOffset + navbarOffset;
};

/**
 * Check if an element is currently in the viewport
 * @param elementId - Element ID to check
 * @param threshold - Visibility threshold (0-1)
 */
export const isInViewport = (elementId: string, threshold: number = 0.1): boolean => {
  const element = document.getElementById(elementId);
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  const navbarOffset = getNavbarOffset();

  return (
    rect.top <= navbarOffset &&
    rect.bottom >= 0
  );
};

/**
 * Find the currently visible section
 * @param sectionIds - Array of section IDs to check
 */
export const getCurrentVisibleSection = (sectionIds: string[]): string | null => {
  const navbarOffset = getNavbarOffset();

  for (const id of sectionIds) {
    const element = document.getElementById(id);
    if (!element) continue;

    const rect = element.getBoundingClientRect();

    // Check if element top is near the navbar bottom
    if (rect.top <= navbarOffset && rect.bottom >= navbarOffset) {
      return id;
    }
  }

  return null;
};
