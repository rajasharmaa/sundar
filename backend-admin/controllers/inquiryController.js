const Inquiry = require('../models/Inquiry');
const Product = require('../models/Product');
const { collectClientData } = require('../utils/clientDataCollector');
const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

const getCloudinaryInfoFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) return null;
  
  let resourceType = 'image';
  if (uploadIndex > 0) {
    const typeCandidate = parts[uploadIndex - 1];
    if (['image', 'raw', 'video'].includes(typeCandidate)) {
      resourceType = typeCandidate;
    }
  }
  
  let startIndex = uploadIndex + 1;
  if (parts[startIndex].startsWith('v') && !isNaN(parts[startIndex].substring(1))) {
    startIndex++;
  }
  
  const remainingPath = parts.slice(startIndex).join('/');
  const lastDotIndex = remainingPath.lastIndexOf('.');
  
  let publicId = remainingPath;
  if (resourceType !== 'raw' && lastDotIndex !== -1) {
    publicId = remainingPath.substring(0, lastDotIndex);
  }
  
  return { publicId, resourceType };
};

const deleteFromCloudinary = async (url) => {
  if (!isCloudinaryConfigured || !url) return;
  try {
    const info = getCloudinaryInfoFromUrl(url);
    if (!info) return;
    
    await cloudinary.uploader.destroy(info.publicId, {
      resource_type: info.resourceType
    });
    console.log('Cloudinary asset deleted successfully:', info.publicId);
  } catch (err) {
    console.error('Failed to delete Cloudinary asset:', err);
  }
};


// Get all inquiries with advanced filters
const getAllInquiries = async (req, res) => {
  try {
    const { 
      status, 
      read, 
      city, 
      company, 
      product,
      startDate,
      endDate,
      leadQuality,
      page = 1,
      limit = 20
    } = req.query;
    
    let filter = {};

    // Status filter - only apply if not 'all'
    if (status && status.toLowerCase() !== 'all') {
      filter.status = status;
    }

    // Read status filter - handle explicit boolean
    if (read !== undefined && read !== '' && read !== 'all') {
      filter.read = read === 'true' || read === true;
    }
    
    // Location filter
    if (city && city.trim()) {
      filter.city = new RegExp(city.trim(), 'i');
    }
    
    // Company filter
    if (company && company.trim()) {
      filter.companyName = new RegExp(company.trim(), 'i');
    }
    
    // Product filter
    if (product && product !== 'all') {
      filter.productId = product;
    }
    
    // Lead quality filter
    if (leadQuality && leadQuality.toLowerCase() !== 'all') {
      filter.leadQuality = leadQuality;
    }
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Validate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20)); // Limit between 1-100
    
    const skip = (pageNum - 1) * limitNum;
    
    const inquiries = await Inquiry.find(filter)
      .populate('productId', 'name category image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Inquiry.countDocuments(filter);
    
    res.json({
      success: true,
      data: inquiries,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to fetch inquiries' 
    });
  }
};

// Update inquiry status
const updateInquiryStatus = async (req, res) => {
  try {
    const { status, read } = req.body;
    const updateData = {};

    if (status) {
      updateData.status = status;
    }

    if (read !== undefined) {
      updateData.read = Boolean(read);
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json({ message: 'Inquiry updated successfully' });
  } catch (error) {
    console.error('Update inquiry error:', error);
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
};

// Delete inquiry
const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    // Delete attachment from Cloudinary if exists
    if (inquiry.attachmentUrl) {
      await deleteFromCloudinary(inquiry.attachmentUrl);
    }

    await inquiry.deleteOne();

    res.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
};

// Create inquiry (for public users) - ENHANCED with auto-data collection
const createInquiry = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      subject, 
      message,
      companyName,
      businessName,
      businessType,
      customerType,
      productId,
      productName,
      productCode,
      selectedSize,
      sizePrice,
      pageSource 
    } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false,
        error: 'Name, email, subject, and message are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
    }

    // Collect client data automatically (IP, device, location, etc.)
    const clientData = await collectClientData(req);

    // Verify product exists if productId provided
    let verifiedProductName = productName;
    let verifiedProductCode = productCode;
    let verifiedSizePrice = sizePrice;
    
    if (productId) {
      const product = await Product.findById(productId);
      if (product) {
        verifiedProductName = product.name;
        verifiedProductCode = product.productCode || '';
        
        // Verify the selected size and price
        if (selectedSize && product.sizeOptions) {
          const matchingSize = product.sizeOptions.find(s => s.size === selectedSize);
          if (matchingSize) {
            verifiedSizePrice = matchingSize.price;
          }
        }
      }
    }

    let normalizedCustomerType = 'retail';
    const bt = (customerType || businessType || '').toLowerCase().trim();
    if (bt.includes('retail')) {
      normalizedCustomerType = 'retail';
    } else if (bt.includes('wholesale') || bt.includes('wholesaler')) {
      normalizedCustomerType = 'wholesaler';
    } else if (bt.includes('manufacturer') || bt.includes('industrial')) {
      normalizedCustomerType = 'manufacturer';
    } else if (bt.includes('contractor') || bt.includes('construction') || bt.includes('real estate')) {
      normalizedCustomerType = 'contractor';
    } else if (['retail', 'wholesaler', 'manufacturer', 'contractor', 'trader', 'other'].includes(bt)) {
      normalizedCustomerType = bt;
    } else {
      normalizedCustomerType = 'other';
    }

    const inquiry = new Inquiry({
      name,
      email,
      phone: phone || '',
      subject,
      message,
      productId: productId || null,
      productName: verifiedProductName || '',
      productCode: verifiedProductCode || '',
      selectedSize: selectedSize || '',
      sizePrice: verifiedSizePrice || 0,
      companyName: companyName || businessName || '',
      customerType: normalizedCustomerType,
      pageSource: pageSource || req.headers.referer || 'Unknown',
      ...clientData
    });

    const savedInquiry = await inquiry.save();
    
    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      inquiry: savedInquiry
    });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to submit inquiry' 
    });
  }
};

// Send inquiry reply
const sendInquiryReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message, status } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Reply message is required' 
      });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      id,
      {
        replyMessage: message.trim(),
        replySubject: subject ? subject.trim() : `Re: Inquiry`,
        repliedAt: new Date(),
        status: status || 'completed',
        read: true
      },
      { new: true }
    );

    if (!inquiry) {
      return res.status(404).json({ 
        success: false, 
        error: 'Inquiry not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Reply saved successfully', 
      data: inquiry 
    });
  } catch (error) {
    console.error('Send reply error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to save reply' 
    });
  }
};

// Export inquiries to CSV
const exportInquiries = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let filter = {};

    if (status && status.toLowerCase() !== 'all') {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const inquiries = await Inquiry.find(filter)
      .sort({ createdAt: -1 });

    const csvRows = [
      ['ID', 'Name', 'Email', 'Phone', 'Company', 'GSTIN', 'Status', 'Total Value', 'Products', 'Lead Quality', 'Date'].join(',')
    ];

    inquiries.forEach(inquiry => {
      let productSummary = '';
      if (inquiry.products && inquiry.products.length > 0) {
        productSummary = inquiry.products.map(p => `${p.productName} (${p.quantity}x)`).join('; ');
      } else if (inquiry.productName) {
        productSummary = `${inquiry.productName} (${inquiry.selectedSize || 'Standard'})`;
      } else {
        productSummary = 'N/A';
      }

      const totalVal = inquiry.totalEstimatedValue || inquiry.sizePrice || 0;

      csvRows.push([
        inquiry._id.toString(),
        `"${(inquiry.name || '').replace(/"/g, '""')}"`,
        inquiry.email || '',
        inquiry.phone || '',
        `"${(inquiry.companyName || '').replace(/"/g, '""')}"`,
        inquiry.gstNumber || '',
        inquiry.status,
        totalVal,
        `"${productSummary.replace(/"/g, '""')}"`,
        inquiry.leadQuality || 'warm',
        new Date(inquiry.createdAt).toLocaleDateString()
      ].join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=inquiries_${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csvContent);
  } catch (error) {
    console.error('Export inquiries error:', error);
    res.status(500).json({ error: 'Failed to export inquiries' });
  }
};

module.exports = {
  getAllInquiries,
  updateInquiryStatus,
  deleteInquiry,
  createInquiry,
  sendInquiryReply,
  exportInquiries
};