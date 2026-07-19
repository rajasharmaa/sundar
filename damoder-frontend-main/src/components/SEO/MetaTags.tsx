// 🎯 REUSABLE SEO META COMPONENT
// Dynamic meta tags for all pages

import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  keywords?: string;
  noIndex?: boolean;
  // Product-specific
  productData?: {
    name: string;
    price: number;
    currency: string;
    brand?: string;
    availability?: 'in stock' | 'out of stock' | 'pre-order';
    rating?: number;
    reviewCount?: number;
  };
  // Open Graph
  og?: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
  };
  // Twitter
  twitter?: {
    card?: 'summary_large_image' | 'summary';
    title?: string;
    description?: string;
    image?: string;
  };
  jsonLd?: any | any[];
}

const SITE_NAME = 'Damodar Traders';
const BASE_URL = 'https://damodartraders.com';
const DEFAULT_IMAGE = '/og-image.jpg';
const TWITTER_HANDLE = '@damodartraders';

/**
 * SEO Component - Dynamic meta tags generator
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description = 'Premium industrial products for superior performance and durability. Browse our comprehensive catalog of pipes, fittings, valves, and accessories.',
  canonical,
  image = DEFAULT_IMAGE,
  type = 'website',
  keywords,
  noIndex = false,
  productData,
  og = {},
  twitter = {},
  jsonLd
}) => {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const currentPath = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') : '';
  const canonicalUrl = canonical || `${BASE_URL}${currentPath}`;
  const ogImage = og.image || image;
  const ogUrl = og.url || canonicalUrl;
  
  // Generate structured data for products
  const productSchema = productData ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productData.name,
    "description": description,
    "image": image,
    "brand": productData.brand || SITE_NAME,
    "offers": {
      "@type": "Offer",
      "price": productData.price,
      "priceCurrency": productData.currency,
      "availability": `https://schema.org/${productData.availability === 'in stock' ? 'InStock' : 'OutOfStock'}`,
      "url": canonicalUrl
    },
    ...(productData.rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": productData.rating,
        "reviewCount": productData.reviewCount || 0
      }
    })
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={og.title || fullTitle} />
      <meta property="og:description" content={og.description || description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitter.card || 'summary_large_image'} />
      <meta name="twitter:title" content={twitter.title || fullTitle} />
      <meta name="twitter:description" content={twitter.description || description} />
      <meta name="twitter:image" content={twitter.image || ogImage} />
      {TWITTER_HANDLE && <meta name="twitter:creator" content={TWITTER_HANDLE} />}
      
      {/* Additional SEO */}
      <meta name="author" content={SITE_NAME} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* Structured Data (JSON-LD) */}
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
      {jsonLd && (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
