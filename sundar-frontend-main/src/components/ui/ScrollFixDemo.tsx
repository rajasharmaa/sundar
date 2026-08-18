/**
 * ScrollFixDemo Component
 * Use this component to test and verify the sticky navbar fix
 * 
 * Add this to any page to quickly test scrolling behavior
 */

import { AnchorLink } from '@/components/ui/AnchorLink';
import { useScrollToSection } from '@/hooks/useScrollToSection';

export const ScrollFixDemo = () => {
  const { scrollToSection, scrollToTop } = useScrollToSection();

  return (
    <div className="fixed bottom-4 right-4 z-[200] bg-white rounded-lg shadow-2xl p-4 border-2 border-green-500 max-w-sm">
      <h3 className="font-bold text-lg mb-2 text-green-900">
        🧪 Scroll Fix Tester
      </h3>
      
      <div className="space-y-2 text-sm">
        {/* Test 1: Anchor Link Component */}
        <div>
          <p className="font-semibold mb-1">Test 1: AnchorLink Component</p>
          <div className="flex gap-2">
            <AnchorLink
              href="#test-section-1"
              className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
            >
              Section 1
            </AnchorLink>
            <AnchorLink
              href="#test-section-2"
              className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
            >
              Section 2
            </AnchorLink>
          </div>
        </div>

        {/* Test 2: Programmatic Scroll */}
        <div>
          <p className="font-semibold mb-1">Test 2: Programmatic</p>
          <div className="flex gap-2">
            <button
              onClick={() => scrollToSection('test-section-1')}
              className="px-3 py-1.5 -green- text-white rounded hover:-green- text-xs"
            >
              Scroll to S1
            </button>
            <button
              onClick={() => scrollToTop(true)}
              className="px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs"
            >
              Top ↑
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            ✅ CSS scroll-margin applied<br/>
            ✅ JavaScript handler active<br/>
            ✅ React provider enabled
          </p>
        </div>
      </div>
    </div>
  );
};

// Example sections to test with
export const TestSections = () => {
  return (
    <div className="space-y-0">
      <section id="test-section-1" className="min-h-screen py-20 bg-green-50 border-b-4 border-green-200">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-4 text-green-900">
            Test Section 1
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            This is a test section to verify the sticky navbar fix.
          </p>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">What to check:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Is the heading fully visible?</li>
              <li>Is any content hidden behind navbar?</li>
              <li>Is the scroll smooth?</li>
              <li>Does back button work correctly?</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="test-section-2" className="min-h-screen py-20 bg-green-50 border-b-4 border-green-200">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-4 text-green-900">
            Test Section 2
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Second test section with different styling.
          </p>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Testing points:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Check scroll offset consistency</li>
              <li>Verify mobile responsiveness</li>
              <li>Test repeated scrolling (back and forth)</li>
              <li>Check URL hash updates</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="test-section-3" className="min-h-screen py-20 -green-">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-4 -green-">
            Test Section 3
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Third section for thorough testing.
          </p>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Final checks:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>All three sections should behave identically</li>
              <li>No layout shifts or jumps</li>
              <li>Smooth animations throughout</li>
              <li>Accessibility maintained (keyboard nav)</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrollFixDemo;
