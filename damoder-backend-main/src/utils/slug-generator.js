// 🔗 SLUG GENERATION UTILITY
// Auto-generate SEO-friendly, unique slugs for products and categories

const { connectToDB } = require('../config/database');

/**
 * Generate SEO-friendly slug from text
 * @param {string} text - Input text (e.g., product name)
 * @returns {string} URL-friendly slug
 */
const generateSlug = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Ensure slug uniqueness by appending incremental numbers
 * @param {string} slug - Base slug
 * @param {string} collection - Collection name ('products' or 'categories')
 * @param {string} excludeId - ID to exclude (for updates)
 * @returns {Promise<string>} Unique slug
 */
const makeSlugUnique = async (slug, collection, excludeId = null) => {
  const db = await connectToDB();
  const collectionInstance = db.collection(collection);
  
  let uniqueSlug = slug;
  let counter = 1;
  
  while (true) {
    const query = excludeId ? 
      { slug: uniqueSlug, _id: { $ne: excludeId } } :
      { slug: uniqueSlug };
    
    const existing = await collectionInstance.findOne(query);
    if (!existing) break;
    
    uniqueSlug = `${slug}-${counter}`;
    counter++;
    
    // Safety limit to prevent infinite loops
    if (counter > 1000) {
      throw new Error(`Unable to generate unique slug after 1000 attempts for: ${slug}`);
    }
  }
  
  return uniqueSlug;
};

/**
 * Generate unique slug for a product
 * @param {string} productName - Product name
 * @param {string} productId - Product ID (for updates)
 * @returns {Promise<string>} Unique product slug
 */
const generateProductSlug = async (productName, productId = null) => {
  const baseSlug = generateSlug(productName);
  
  if (!baseSlug) {
    throw new Error('Invalid product name for slug generation');
  }
  
  return await makeSlugUnique(baseSlug, 'products', productId);
};

/**
 * Generate unique slug for a category
 * @param {string} categoryName - Category name
 * @param {string} categoryId - Category ID (for updates)
 * @returns {Promise<string>} Unique category slug
 */
const generateCategorySlug = async (categoryName, categoryId = null) => {
  const baseSlug = generateSlug(categoryName);
  
  if (!baseSlug) {
    throw new Error('Invalid category name for slug generation');
  }
  
  return await makeSlugUnique(baseSlug, 'categories', categoryId);
};

/**
 * Validate slug format
 * @param {string} slug - Slug to validate
 * @returns {boolean} True if valid
 */
const isValidSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return false;
  
  // Slug should only contain lowercase letters, numbers, and hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Clean and normalize slug
 * @param {string} slug - Input slug
 * @returns {string} Normalized slug
 */
const normalizeSlug = (slug) => {
  if (!slug) return '';
  
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

module.exports = {
  generateSlug,
  makeSlugUnique,
  generateProductSlug,
  generateCategorySlug,
  isValidSlug,
  normalizeSlug
};
