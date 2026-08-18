const { connectToDB } = require('../../../config/database');
const cacheService = require('../../../utils/cache-service');
const cloudinaryService = require('../../../services/cloudinary.service');
const logger = require('../../../utils/logger');
const { createError, sendErrorResponse } = require('../../../utils/secure-error-handler');

const DEFAULT_SETTINGS = {
  logo: '/logo.png',
  founderImage: '/Screenshot 2026-01-01 191041.png',
  virtualTour: {
    previewImage: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwepjyX6xJHm-216BZ1vzDXikePTc4uDDEnZhL4oTgHcpAGvPKmcceZzpyXMPoytyKoTC6sCMqpqMmDljZ9WR6RNAVOexJZiBRFUprFFh4pnKrC6OQUDbqsWgJmeZDXtjxHVur_6O=s1360-w1360-h1020-rw',
    iframeUrl: 'https://www.google.com/maps/embed?pb=!4v1712345678901!6m8!1m7!1sCAoSLEFGMVFpcE5fYzJXNkVHdF9Qb2tqTjBYYmhRZUxWQkZGNGRiS1RrVGNMZ3p3!2m2!1d22.717964!2d75.857387!3f339.9!4f0!5f0.7820865974627469',
    googleMapsUrl: 'https://www.google.com/local/place/fid/0x3962fd11bc280595:0xffd5a99f38fa3a02/photosphere?iu=https://lh3.googleusercontent.com/gps-cs-s/AHVAweoZur5ZBBbARHHWbG6NGqEi6ckT1qmhRSAAnnQmkUg3-IH4bq_BrRWsmdVqoaGF9Jxmrap7tGeYEm_DuAaOY8dIM_nkP9eqqHBxS5fjP5DWQSKNkjJj9j7nlQf00MlHAn_n1jtX%3Dw160-h106-k-no-pi0-ya339.9-ro-0-fo100&ik=CAoSF0NJSE0wb2dLRUlDQWdJRFNuZTd2clFF'
  },
  shopPhotos: [
    {
      image: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweqgLB9yVgiMyQhTQR76qltycH7dCvQbyaLD68eqONCZxOhkKi3QY0eVh5-CmdWucsgVECLETk-NK1DT738kZB-qrADr6QNf6zF7VnzF0O35xBZqL_RFBUjNhU5-hYzXDk3V1A5D=s1360-w1360-h1020-rw',
      caption: 'Main Showroom',
      description: 'Experience our extensive range of premium industrial bags.'
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
  banners: [],
  manufacturingImage: '/manufacturing.jpg',
  aboutUsBanner: '',
  contactUsBanner: '',
  productsBanner: ''
};

const getSettings = async (req, res) => {
  const requestId = req.requestId;
  try {
    const fetchFromDB = async () => {
      const db = await connectToDB();
      const settingsCollection = db.collection('settings');
      const data = await settingsCollection.findOne({ key: 'site_settings' });
      if (!data) {
        return DEFAULT_SETTINGS;
      }
      return {
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
        banners: Array.isArray(data.banners) ? data.banners : DEFAULT_SETTINGS.banners,
        manufacturingImage: data.manufacturingImage || DEFAULT_SETTINGS.manufacturingImage,
        aboutUsBanner: data.aboutUsBanner || DEFAULT_SETTINGS.aboutUsBanner,
        contactUsBanner: data.contactUsBanner || DEFAULT_SETTINGS.contactUsBanner,
        productsBanner: data.productsBanner || DEFAULT_SETTINGS.productsBanner
      };
    };

    let settings;
    if (process.env.NODE_ENV === 'development') {
      settings = await fetchFromDB();
    } else {
      const cacheKey = 'settings:active';
      settings = await cacheService.getCached(cacheKey, fetchFromDB, { ttl: 300 });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (err) {
    logger.error('Get site settings error:', {
      requestId,
      error: err.message,
      stack: err.stack
    });
    // In case of error, degrade gracefully and return hardcoded defaults
    res.json({
      success: true,
      data: DEFAULT_SETTINGS
    });
  }
};

const updateSettings = async (req, res) => {
  const requestId = req.requestId;
  try {
    const { 
      logo, founderImage, virtualTour, shopPhotos, banners,
      manufacturingImage, aboutUsBanner, contactUsBanner, productsBanner
    } = req.body;
    const db = await connectToDB();
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
      manufacturingImage: manufacturingImage || DEFAULT_SETTINGS.manufacturingImage,
      aboutUsBanner: aboutUsBanner || DEFAULT_SETTINGS.aboutUsBanner,
      contactUsBanner: contactUsBanner || DEFAULT_SETTINGS.contactUsBanner,
      productsBanner: productsBanner || DEFAULT_SETTINGS.productsBanner,
      updatedAt: new Date()
    };

    await settingsCollection.updateOne(
      { key: 'site_settings' },
      { $set: updateData },
      { upsert: true }
    );

    // Invalidate settings cache
    await cacheService.delete('settings:active');

    res.json({
      success: true,
      message: 'Site settings updated successfully',
      data: updateData
    });
  } catch (err) {
    logger.error('Update site settings error:', {
      requestId,
      error: err.message,
      stack: err.stack
    });
    const error = createError.internal('Failed to save site configurations');
    return sendErrorResponse(res, error, requestId);
  }
};

const uploadImage = async (req, res) => {
  const requestId = req.requestId;
  try {
    if (!req.file) {
      const error = createError.validation('No file uploaded or file rejected by security middleware');
      return sendErrorResponse(res, error, requestId);
    }

    const uploadResult = await cloudinaryService.uploadBuffer(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.json({
      success: true,
      url: uploadResult.url,
      publicId: uploadResult.publicId
    });
  } catch (err) {
    logger.error('Upload setting image error:', {
      requestId,
      error: err.message,
      stack: err.stack
    });
    const error = createError.internal('Failed to upload image to storage');
    return sendErrorResponse(res, error, requestId);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  uploadImage
};
