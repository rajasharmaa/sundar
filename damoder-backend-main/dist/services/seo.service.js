"use strict";
// 🎯 SEO META TAGS SERVICE
// Generate dynamic metadata for products, categories, and pages
const config = {
    siteName: 'Damodar Traders',
    siteUrl: process.env.SITE_URL || 'https://damodartraders.com',
    twitterHandle: '@damodartraders',
    defaultTitle: 'Premium Industrial Products - Damodar Traders',
    defaultDescription: 'Your trusted partner for high-quality industrial products. Browse our comprehensive catalog of pipes, fittings, valves, and accessories.'
};
/**
 * Generate product metadata for SEO
 * @param {Object} product - Product object
 * @returns {Object} Complete metadata for product page
 */
const generateProductMeta = (product) => {
    if (!product)
        return null;
    const title = `${product.name} | ${config.siteName}`;
    const description = product.description?.substring(0, 160) || config.defaultDescription;
    const url = `${config.siteUrl}/products/${product.slug}`;
    const imageUrl = product.image || `${config.siteUrl}/og-product.jpg`;
    return {
        // Basic Meta Tags
        title,
        description,
        canonical: url,
        // Open Graph (Facebook, LinkedIn)
        og: {
            title,
            description,
            type: 'product',
            url,
            image: imageUrl,
            site_name: config.siteName,
            product: {
                name: product.name,
                brand: product.brand || config.siteName,
                price: {
                    amount: product.price,
                    currency: 'INR'
                },
                availability: product.inStock ? 'in stock' : 'out of stock',
                category: product.category
            }
        },
        // Twitter Card
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            image: imageUrl,
            handle: config.twitterHandle
        },
        // Additional SEO
        robots: 'index, follow',
        keywords: generateProductKeywords(product),
        // Structured Data (JSON-LD)
        structuredData: generateProductSchema(product)
    };
};
/**
 * Generate category metadata for SEO
 * @param {Object} category - Category object
 * @param {number} productCount - Number of products in category
 * @returns {Object} Complete metadata for category page
 */
const generateCategoryMeta = (category, productCount = 0) => {
    if (!category)
        return null;
    const categoryName = category.name || 'Products';
    const title = category.metaTitle || `${categoryName} - Industrial Products | ${config.siteName}`;
    const description = category.metaDescription ||
        `Browse our extensive collection of ${categoryName.toLowerCase()}. High-quality industrial products for superior performance. ${productCount > 0 ? `${productCount} products available.` : ''}`;
    const url = `${config.siteUrl}/products?category=${category.slug}`;
    const imageUrl = category.image || `${config.siteUrl}/og-category.jpg`;
    return {
        // Basic Meta Tags
        title,
        description,
        canonical: url,
        // Open Graph
        og: {
            title,
            description,
            type: 'website',
            url,
            image: imageUrl,
            site_name: config.siteName
        },
        // Twitter Card
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            image: imageUrl,
            handle: config.twitterHandle
        },
        // Additional SEO
        robots: 'index, follow',
        keywords: `${categoryName},industrial products,${categoryName.toLowerCase()} suppliers`,
        // Structured Data
        structuredData: generateCategorySchema(category, productCount)
    };
};
/**
 * Generate metadata for listing pages
 * @param {string} pageTitle - Page title
 * @param {string} pageDescription - Page description
 * @param {string} path - Page path
 * @returns {Object} Complete metadata
 */
const generatePageMeta = (pageTitle, pageDescription, path = '/') => {
    const title = `${pageTitle} | ${config.siteName}`;
    const description = pageDescription || config.defaultDescription;
    const url = `${config.siteUrl}${path}`;
    return {
        title,
        description,
        canonical: url,
        og: {
            title,
            description,
            type: 'website',
            url,
            site_name: config.siteName
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            handle: config.twitterHandle
        },
        robots: 'index, follow'
    };
};
/**
 * Generate product keywords from product data
 * @param {Object} product - Product object
 * @returns {string} Comma-separated keywords
 */
const generateProductKeywords = (product) => {
    const keywords = [
        product.name,
        product.category,
        product.brand,
        ...(product.tags || [])
    ].filter(Boolean);
    return keywords.join(', ');
};
/**
 * Generate Product Schema.org JSON-LD
 * @param {Object} product - Product object
 * @returns {Object} JSON-LD structured data
 */
const generateProductSchema = (product) => {
    return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": product.image,
        "brand": product.brand || config.siteName,
        "sku": product.sku,
        "category": product.category,
        "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "INR",
            "availability": product.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            "url": `${config.siteUrl}/products/${product.slug}`
        },
        "aggregateRating": product.rating > 0 ? {
            "@type": "AggregateRating",
            "ratingValue": product.rating,
            "reviewCount": product.reviews || 0
        } : undefined
    };
};
/**
 * Generate Category/BreadcrumbList Schema.org JSON-LD
 * @param {Object} category - Category object
 * @param {number} productCount - Number of products
 * @returns {Object} JSON-LD structured data
 */
const generateCategorySchema = (category, productCount) => {
    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": category.name,
        "description": category.description,
        "numberOfItems": productCount,
        "url": `${config.siteUrl}/products?category=${category.slug}`
    };
};
/**
 * Generate BreadcrumbList Schema for navigation
 * @param {Array} breadcrumbs - Array of breadcrumb objects {name, url}
 * @returns {Object} JSON-LD structured data
 */
const generateBreadcrumbSchema = (breadcrumbs) => {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": crumb.url
        }))
    };
};
/**
 * Get canonical URL for a page
 * @param {string} path - Page path
 * @returns {string} Full canonical URL
 */
const getCanonicalUrl = (path) => {
    return `${config.siteUrl}${path}`;
};
module.exports = {
    generateProductMeta,
    generateCategoryMeta,
    generatePageMeta,
    generateProductKeywords,
    generateProductSchema,
    generateCategorySchema,
    generateBreadcrumbSchema,
    getCanonicalUrl,
    config
};
