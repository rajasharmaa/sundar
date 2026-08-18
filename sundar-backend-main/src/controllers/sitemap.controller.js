// 🗺️ SITEMAP CONTROLLER
// Generate dynamic XML sitemap for SEO

const { connectToDB } = require('../config/database');
const cacheService = require('../utils/cache-service');

const SITE_URL = process.env.SITE_URL || process.env.FRONTEND_URL || 'https://sundarcorporation.com';

/**
 * Generate XML sitemap with products, categories, and static pages (Legacy single sitemap fallback)
 * GET /sitemap-full.xml
 */
const generateSitemap = async (req, res) => {
  try {
    const cacheKey = 'sitemap:main';
    
    // Try cache first (cache for 1 hour)
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      res.setHeader('Content-Type', 'application/xml');
      return res.send(cached);
    }

    const db = await connectToDB();
    
    // Fetch all active products with slugs
    const productsCollection = db.collection('products');
    const products = await productsCollection.find(
      {
        $or: [
          { active: { $ne: false } },
          { isActive: { $ne: false } }
        ]
      },
      { projection: { slug: 1, updatedAt: 1, _id: 0 } }
    ).toArray();

    // Fetch all active categories
    const categoriesCollection = db.collection('categories');
    const categories = await categoriesCollection.find(
      {
        $or: [
          { active: { $ne: false } },
          { isActive: { $ne: false } }
        ]
      },
      { projection: { slug: 1, updatedAt: 1, _id: 0 } }
    ).toArray();

    // Build sitemap XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Static pages
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/products', priority: '0.9', changefreq: 'daily' },
      { path: '/about', priority: '0.8', changefreq: 'weekly' },
      { path: '/contact', priority: '0.8', changefreq: 'weekly' }
    ];

    staticPages.forEach(page => {
      xml += `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    // Category pages
    categories.forEach(category => {
      const lastmod = category.updatedAt 
        ? new Date(category.updatedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      xml += `  <url>
    <loc>${SITE_URL}/products?category=${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    // Product pages
    products.forEach(product => {
      const lastmod = product.updatedAt 
        ? new Date(product.updatedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      xml += `  <url>
    <loc>${SITE_URL}/products/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });

    xml += `</urlset>`;

    // Cache the sitemap
    await cacheService.set(cacheKey, xml, { ttl: 3600 });

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error.message);
    res.status(500).send('Error generating sitemap');
  }
};

/**
 * Generate XML sitemap with categories and static pages only (no products)
 * GET /sitemap-main.xml
 */
const generateMainSitemap = async (req, res) => {
  try {
    const cacheKey = 'sitemap:main:static';
    
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      res.setHeader('Content-Type', 'application/xml');
      return res.send(cached);
    }

    const db = await connectToDB();
    
    // Fetch all active categories
    const categoriesCollection = db.collection('categories');
    const categories = await categoriesCollection.find(
      {
        $or: [
          { active: { $ne: false } },
          { isActive: { $ne: false } }
        ]
      },
      { projection: { slug: 1, updatedAt: 1, _id: 0 } }
    ).toArray();

    // Build sitemap XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Static pages
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/products', priority: '0.9', changefreq: 'daily' },
      { path: '/about', priority: '0.8', changefreq: 'weekly' },
      { path: '/contact', priority: '0.8', changefreq: 'weekly' }
    ];

    staticPages.forEach(page => {
      xml += `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    // Category pages
    categories.forEach(category => {
      const lastmod = category.updatedAt 
        ? new Date(category.updatedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      xml += `  <url>
    <loc>${SITE_URL}/products?category=${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    xml += `</urlset>`;

    await cacheService.set(cacheKey, xml, { ttl: 3600 });

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    console.error('Main sitemap generation error:', error.message);
    res.status(500).send('Error generating main sitemap');
  }
};

/**
 * Generate sitemap index for large sites
 * GET /sitemap.xml
 */
const generateSitemapIndex = async (req, res) => {
  try {
    const db = await connectToDB();
    const productsCollection = db.collection('products');
    
    // Count total active products
    const totalProducts = await productsCollection.countDocuments({ 
      $or: [
        { active: { $ne: false } },
        { isActive: { $ne: false } }
      ]
    });

    const productsPerSitemap = 50000; // 50k products per sitemap
    const totalSitemaps = Math.max(1, Math.ceil(totalProducts / productsPerSitemap));

    // Build sitemap index
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Main sitemap (static pages + categories)
    xml += `  <sitemap>
    <loc>${SITE_URL}/sitemap-main.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
`;

    // Product sitemaps
    for (let i = 0; i < totalSitemaps; i++) {
      xml += `  <sitemap>
    <loc>${SITE_URL}/sitemap-products-${i + 1}.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
`;
    }

    xml += `</sitemapindex>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap index generation error:', error.message);
    res.status(500).send('Error generating sitemap index');
  }
};

/**
 * Generate paginated product sitemap
 * @param {number} page - Page number (1-indexed)
 */
const generateProductSitemap = async (req, res) => {
  try {
    let pageParam = req.params.page;
    if (pageParam && pageParam.endsWith('.xml')) {
      pageParam = pageParam.replace('.xml', '');
    }
    const page = parseInt(pageParam) || 1;
    const limit = 50000;
    const skip = (page - 1) * limit;
    
    const cacheKey = `sitemap:products:${page}`;
    
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      res.setHeader('Content-Type', 'application/xml');
      return res.send(cached);
    }

    const db = await connectToDB();
    const productsCollection = db.collection('products');
    
    const products = await productsCollection.find(
      {
        $or: [
          { active: { $ne: false } },
          { isActive: { $ne: false } }
        ]
      },
      { projection: { slug: 1, updatedAt: 1, _id: 0 } }
    )
      .skip(skip)
      .limit(limit)
      .toArray();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    products.forEach(product => {
      const lastmod = product.updatedAt 
        ? new Date(product.updatedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      xml += `  <url>
    <loc>${SITE_URL}/products/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });

    xml += `</urlset>`;

    await cacheService.set(cacheKey, xml, { ttl: 3600 });

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    console.error('Product sitemap generation error:', error.message);
    res.status(500).send('Error generating product sitemap');
  }
};

module.exports = {
  generateSitemap,
  generateMainSitemap,
  generateSitemapIndex,
  generateProductSitemap
};
