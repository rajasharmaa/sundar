const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const { getRedisClient } = require('../utils/redisClient');
const fs = require('fs');

const DEFAULT_SETTINGS = {
  logo: '/logo.png',
  founderImage: '/Screenshot 2026-01-01 191041.png',
  virtualTour: {
    previewImage: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwepjyX6xJHm-216BZ1vzDXikePTc4uDDEnZhL4oTgHcpAGvPKmcceZzpyXMPoytyKoTC6sCMqpqMmDljZ9WR6RNAVOexJZiBRFUprFFh4pnKrC6OQUDbqsWgJmeZDXtjxHVur_6O=s1360-w1360-h1020-rw',
    iframeUrl: 'https://www.google.com/maps/embed?pb=!4v1712345678901!6m8!1m7!1sCAoSLEFGMVFpcE5fYzJXNkVHdF9Qb2tqTjBYYmhRZUxWQkZGNGRiS1RrVGNMZ3p3!2m2!1d22.717964!2d75.857387!3f339.9!4f0!5f0.7820865974627469',
    googleMapsUrl: 'https://www.google.com/local/place/fid/0x3962fd11bc280595:0xffd5a99f38fa3a02/photosphere?iu=https://lh3.googleusercontent.com/gps-cs-s/APNQkAH3zS9KNKBpaUEnvLKTl0CspSSuOyJyOuzW-KERYNPHjT06rOFSE0U7FxktNcYGm3fy3ldzkNlSVaWxQ4X1_bHj-Von_NIxN9gBOIKyJkswYiW_smhjel-RLS-ux1rlaidrXCdG%3Dw160-h106-k-no-pi0-ya339.9-ro-0-fo100&ik=CAoSF0NJSE0wb2dLRUlDQWdJRFNuZTd2clFF'
  },
  shopPhotos: [
    {
      image: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweqgLB9yVgiMyQhTQR76qltycH7dCvQbyaLD68eqONCZxOhkKi3QY0eVh5-CmdWucsgVECLETk-NK1DT738kZB-qrADr6QNf6zF7VnzF0O35xBZqL_RFBUjNhU5-hYzXDk3V1A5D=s1360-w1360-h1020-rw',
      caption: 'Main Showroom',
      description: 'Experience our extensive range of premium industrial fittings.'
    },
    {
      image: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweofwt3aI2ZzdlAuOiwzd00uT4cWGzHn5zwXQSUoZKS3OX_la-MjcY8U0sA6zaRBGxDvnHYCloIHkmsFQ4I8XeucpIJp5DPytZw9mBZ5qvoW2SnW8jqHQoTjpOE1Nd_z23mQR0nN=s1360-w1360-h1020-rw',
      caption: 'Product Showcase',
      description: 'Precision-engineered products for every industrial need.'
    },
    {
      image: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwepjyX6xJHm-216BZ1vzDXikePTc4uDDEnZhL4oTgHcpAGvPKmcceZzpyXMPoytyKoTC6sCMqpqMmDljZ9WR6RNAVOexJZiBRFUprFFh4pnKrC6OQUDbqsWgJmeZDXtjxHVur_6O=s1360-w1360-h1020-rw',
      caption: 'Smart Warehouse',
      description: 'Strategic storage ensuring lightning-fast delivery pan-India.'
    },
    {
      image: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweqzzQ_prGTZtQplO5rJTK1Vd8RkGpbv8ao3uw1WwxZXFsWh2MH3Bx_OHcCneuO-dA0d1iK5UwteeHMt-Or3ALlmhmkpD2AaqY4fnKApr8-XHcpI7Crtck_JoPFri36IsZdxdaY=s1360-w1360-h1020-rw',
      caption: 'Quality Lab',
      description: 'Rigorous testing to maintain our legacy of trust since 2011.'
    }
  ],
  banners: []
};

const deleteTempFile = (file) => {
  if (file && file.path && fs.existsSync(file.path)) {
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      console.error('Failed to delete temp file:', err.message);
    }
  }
};

const getSettings = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not initialized' });
    }
    
    const settingsCollection = db.collection('settings');
    const data = await settingsCollection.findOne({ key: 'site_settings' });
    
    if (!data) {
      return res.json({
        success: true,
        data: DEFAULT_SETTINGS
      });
    }

    res.json({
      success: true,
      data: {
        logo: data.logo || DEFAULT_SETTINGS.logo,
        founderImage: data.founderImage || DEFAULT_SETTINGS.founderImage,
        virtualTour: {
          previewImage: data.virtualTour?.previewImage || DEFAULT_SETTINGS.virtualTour.previewImage,
          iframeUrl: data.virtualTour?.iframeUrl || DEFAULT_SETTINGS.virtualTour.iframeUrl,
          googleMapsUrl: data.virtualTour?.googleMapsUrl || DEFAULT_SETTINGS.virtualTour.googleMapsUrl
        },
        shopPhotos: Array.isArray(data.shopPhotos) && data.shopPhotos.length > 0 
          ? data.shopPhotos 
          : DEFAULT_SETTINGS.shopPhotos,
        banners: Array.isArray(data.banners) ? data.banners : DEFAULT_SETTINGS.banners
      }
    });
  } catch (error) {
    console.error('Get site settings error:', error);
    res.json({
      success: true,
      data: DEFAULT_SETTINGS
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { logo, founderImage, virtualTour, shopPhotos, banners } = req.body;
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not initialized' });
    }
    
    const settingsCollection = db.collection('settings');

    const updateData = {
      key: 'site_settings',
      logo: logo || DEFAULT_SETTINGS.logo,
      founderImage: founderImage || DEFAULT_SETTINGS.founderImage,
      virtualTour: {
        previewImage: virtualTour?.previewImage || DEFAULT_SETTINGS.virtualTour.previewImage,
        iframeUrl: virtualTour?.iframeUrl || DEFAULT_SETTINGS.virtualTour.iframeUrl,
        googleMapsUrl: virtualTour?.googleMapsUrl || DEFAULT_SETTINGS.virtualTour.googleMapsUrl
      },
      shopPhotos: Array.isArray(shopPhotos) && shopPhotos.length > 0
        ? shopPhotos
        : DEFAULT_SETTINGS.shopPhotos,
      banners: Array.isArray(banners) ? banners : DEFAULT_SETTINGS.banners,
      updatedAt: new Date()
    };

    await settingsCollection.updateOne(
      { key: 'site_settings' },
      { $set: updateData },
      { upsert: true }
    );

    // Invalidate settings Redis cache
    const redis = getRedisClient();
    if (redis) {
      await redis.del('cache:settings:active');
      console.log('🗑️  Settings Redis cache invalidated');
    }

    res.json({
      success: true,
      message: 'Site settings updated successfully',
      data: updateData
    });
  } catch (error) {
    console.error('Update site settings error:', error);
    res.status(500).json({ error: 'Failed to save site configurations' });
  }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'settings',
      use_filename: true,
      unique_filename: false
    });

    // Delete local file
    deleteTempFile(req.file);

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    deleteTempFile(req.file);
    console.error('Upload setting image error:', error);
    res.status(500).json({ error: 'Failed to upload image to storage' });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  uploadImage
};
