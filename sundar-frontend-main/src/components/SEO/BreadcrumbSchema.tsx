// 🍞 BREADCRUMB STRUCTURED DATA
// JSON-LD schema for breadcrumb navigation

import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
  name?: string;
  url?: string;
  label?: string;  // Alternative property name
  href?: string;   // Alternative property name
}

interface BreadcrumbSchemaProps {
  breadcrumbs: BreadcrumbItem[];
}

/**
 * Generate BreadcrumbList JSON-LD schema
 * Helps Google understand site navigation
 */
export const BreadcrumbSchema: React.FC<BreadcrumbSchemaProps> = ({ breadcrumbs }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name || crumb.label || 'Page',
      "item": crumb.url || crumb.href || window.location.origin
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default BreadcrumbSchema;
