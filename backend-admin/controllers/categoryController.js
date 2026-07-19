const Category = require('../models/Category');
const Product = require('../models/Product');
const fs = require('fs');

const deleteTempFile = (file) => {
  if (file && file.path && fs.existsSync(file.path)) {
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      console.error('Failed to delete temp file:', err.message);
    }
  }
};

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Public (or Admin only - based on your preference)
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ active: true })
      .sort({ order: 1, name: 1 })
      .populate('parentCategory', 'name slug');
    
    // Calculate product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ 
          category: category.slug,
          active: true 
        });
        
        return {
          ...category.toObject(),
          productCount
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: categoriesWithCount,
      count: categoriesWithCount.length
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// @desc    Get all categories (including inactive - for admin)
// @route   GET /api/admin/categories/all
// @access  Private/Admin
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ order: 1, name: 1 })
      .populate('parentCategory', 'name slug');
    
    res.status(200).json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// @desc    Create new category
// @route   POST /api/admin/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, slug, icon, description, parentCategory, order } = req.body;
    
    // Validate required fields
    if (!name || !slug) {
      deleteTempFile(req.file);
      return res.status(400).json({
        success: false,
        message: 'Name and slug are required'
      });
    }
    
    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      deleteTempFile(req.file);
      return res.status(400).json({
        success: false,
        message: 'Category with this slug already exists'
      });
    }
    
    // Handle category image upload
    let categoryImage = '';
    let categoryImagePublicId = '';
    
    if (req.file) {
      const cloudinary = require('cloudinary').v2;
      
      try {
        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'categories',
          resource_type: 'image',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto:good' }
          ]
        });
        
        categoryImage = result.secure_url;
        categoryImagePublicId = result.public_id;
        deleteTempFile(req.file);
      } catch (uploadError) {
        deleteTempFile(req.file);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image: ' + uploadError.message
        });
      }
    }
    
    const category = await Category.create({
      name,
      slug: slug.toLowerCase(),
      icon: icon || 'Package',
      description,
      parentCategory,
      order: order || 0,
      categoryImage,
      categoryImagePublicId
    });
    
    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });
  } catch (error) {
    deleteTempFile(req.file);
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, icon, description, parentCategory, order, active } = req.body;
    
    const category = await Category.findById(id);
    
    if (!category) {
      deleteTempFile(req.file);
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check slug uniqueness if changed
    if (slug && slug !== category.slug) {
      const existingCategory = await Category.findOne({ 
        slug: slug.toLowerCase(),
        _id: { $ne: id }
      });
      
      if (existingCategory) {
        deleteTempFile(req.file);
        return res.status(400).json({
          success: false,
          message: 'Another category with this slug already exists'
        });
      }
    }
    
    // Handle image upload/update
    let updateData = {
      ...(name && { name }),
      ...(slug && { slug: slug.toLowerCase() }),
      ...(icon && { icon }),
      ...(description !== undefined && { description }),
      ...(parentCategory !== undefined && { parentCategory }),
      ...(order !== undefined && { order }),
      ...(active !== undefined && { active })
    };
    
    // Upload new image if provided
    if (req.file) {
      const cloudinary = require('cloudinary').v2;
      
      try {
        // Delete old image if exists
        if (category.categoryImagePublicId) {
          await cloudinary.uploader.destroy(category.categoryImagePublicId);
        }
        
        // Upload new image
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'categories',
          resource_type: 'image',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto:good' }
          ]
        });
        
        updateData.categoryImage = result.secure_url;
        updateData.categoryImagePublicId = result.public_id;
        deleteTempFile(req.file);
      } catch (uploadError) {
        deleteTempFile(req.file);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image: ' + uploadError.message
        });
      }
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully'
    });
  } catch (error) {
    deleteTempFile(req.file);
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if category has products
    const productCount = await Product.countDocuments({ 
      category: category.slug 
    });
    
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${productCount} associated product(s).`,
        productCount
      });
    }
    
    await Category.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

// @desc    Get category by ID
// @route   GET /api/admin/categories/:id
// @access  Private/Admin
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id)
      .populate('parentCategory', 'name slug');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
};

module.exports = {
  getCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById
};
