// 🔄 DATABASE MIGRATION SCRIPT
// Migrate existing products to new schema with slugs and enhanced fields

require('dotenv').config();
const mongoose = require('mongoose');

// Connect to database
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/damodar-traders', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// Slug generation utility
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Ensure slug uniqueness
const makeSlugUnique = async (slug, Product, productId = null) => {
  let uniqueSlug = slug;
  let counter = 1;
  
  while (true) {
    const query = productId ? 
      { slug: uniqueSlug, _id: { $ne: productId } } :
      { slug: uniqueSlug };
    
    const existing = await Product.findOne(query);
    if (!existing) break;
    
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  
  return uniqueSlug;
};

// Migration function
const migrateProducts = async () => {
  try {
    console.log('🚀 Starting product migration...\n');
    
    // Import models
    const productSchema = require('./models/Product');
    const Product = mongoose.model('Product', productSchema);
    
    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to migrate\n`);
    
    let updated = 0;
    let errors = 0;
    
    for (const product of products) {
      try {
        let needsUpdate = false;
        
        // Generate slug if missing
        if (!product.slug) {
          const baseSlug = generateSlug(product.name);
          const uniqueSlug = await makeSlugUnique(baseSlug, Product, product._id);
          product.slug = uniqueSlug;
          needsUpdate = true;
          console.log(`✓ Generated slug for "${product.name}": ${uniqueSlug}`);
        }
        
        // Convert specifications array to Map if needed
        if (Array.isArray(product.specifications) && product.specifications.length > 0) {
          const specMap = new Map();
          product.specifications.forEach(spec => {
            if (spec.key && spec.value) {
              specMap.set(spec.key, spec.value);
            }
          });
          product.specifications = specMap;
          needsUpdate = true;
          console.log(`✓ Converted specifications to Map for "${product.name}"`);
        }
        
        // Add tags from category if no tags exist
        if (!product.tags || product.tags.length === 0) {
          product.tags = [product.category.toLowerCase().replace(/\s+/g, '-')];
          needsUpdate = true;
        }
        
        // Save if changes were made
        if (needsUpdate) {
          await product.save();
          updated++;
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error migrating product "${product.name}":`, error.message);
      }
    }
    
    console.log('\n✅ Migration completed!');
    console.log(`   - Updated: ${updated} products`);
    console.log(`   - Errors: ${errors} products`);
    console.log(`   - Total: ${products.length} products\n`);
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  }
};

// Migrate categories
const migrateCategories = async () => {
  try {
    console.log('🚀 Starting category migration...\n');
    
    const categorySchema = require('./models/Category');
    const Category = mongoose.model('Category', categorySchema);
    
    const categories = await Category.find({}).sort({ level: 1, order: 1 });
    console.log(`📁 Found ${categories.length} categories to migrate\n`);
    
    let updated = 0;
    
    for (const category of categories) {
      try {
        let needsUpdate = false;
        
        // Generate slug if missing
        if (!category.slug) {
          const slug = generateSlug(category.name);
          category.slug = slug;
          needsUpdate = true;
          console.log(`✓ Generated slug for category "${category.name}": ${slug}`);
        }
        
        // Set level based on parent
        if (category.parentCategory && category.level === 0) {
          const parent = await Category.findById(category.parentCategory);
          if (parent) {
            category.level = parent.level + 1;
            category.ancestors = [...parent.ancestors, parent._id];
            needsUpdate = true;
            console.log(`✓ Updated level for category "${category.name}": Level ${category.level}`);
          }
        }
        
        // Save if changes were made
        if (needsUpdate) {
          await category.save();
          updated++;
        }
      } catch (error) {
        console.error(`❌ Error migrating category "${category.name}":`, error.message);
      }
    }
    
    console.log('\n✅ Category migration completed!');
    console.log(`   - Updated: ${updated} categories\n`);
    
  } catch (error) {
    console.error('❌ Category migration error:', error.message);
    throw error;
  }
};

// Build category hierarchy
const buildCategoryHierarchy = async () => {
  try {
    console.log('🔗 Building category hierarchy...\n');
    
    const Category = mongoose.model('Category', require('./models/Category'));
    
    // Get all root categories (no parent)
    const rootCategories = await Category.find({ parentCategory: null });
    
    for (const root of rootCategories) {
      await updateCategoryChildren(root._id, Category);
    }
    
    console.log('✅ Category hierarchy built successfully!\n');
  } catch (error) {
    console.error('❌ Hierarchy building error:', error.message);
  }
};

// Recursively update children references
const updateCategoryChildren = async (categoryId, Category) => {
  const children = await Category.find({ parentCategory: categoryId });
  
  for (const child of children) {
    // Update ancestors
    const parent = await Category.findById(categoryId);
    if (parent) {
      child.ancestors = [...parent.ancestors, parent._id];
      child.level = parent.level + 1;
      await child.save();
      
      console.log(`  ✓ Updated "${child.name}" - Level ${child.level}`);
      
      // Add to parent's children array
      if (!parent.children.includes(child._id)) {
        parent.children.push(child._id);
        await parent.save();
      }
      
      // Recursively process grandchildren
      await updateCategoryChildren(child._id, Category);
    }
  }
};

// Main execution
const runMigration = async () => {
  await connectDatabase();
  
  console.log('\n' + '='.repeat(60));
  console.log('🔧 DAMODAR TRADERS - DATABASE MIGRATION');
  console.log('='.repeat(60) + '\n');
  
  try {
    // Step 1: Migrate products
    await migrateProducts();
    
    // Step 2: Migrate categories
    await migrateCategories();
    
    // Step 3: Build hierarchy
    await buildCategoryHierarchy();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60) + '\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
};

// Run migration
runMigration();
