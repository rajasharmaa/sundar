// ☁️ CLOUDINARY FILE UPLOAD SERVICE
// Handles uploading file buffers to Cloudinary securely with buffer streams

const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

// Check if credentials are set
const isConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  logger.info('✅ Cloudinary client initialized successfully.');
} else {
  logger.warn('⚠️ Cloudinary keys not found in environment. File uploads will run in mock/simulation mode.');
}

/**
 * Uploads a file buffer directly to Cloudinary via a stream
 * @param {Buffer} fileBuffer - The buffer of the uploaded file
 * @param {string} originalName - Original filename for identification
 * @param {string} mimeType - The MIME type of the file
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadBuffer = (fileBuffer, originalName, mimeType) => {
  return new Promise((resolve, reject) => {
    if (!isConfigured) {
      // Simulation/fallback mode for development when Cloudinary is not configured
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueName = `mock_${Date.now()}_${sanitizedName}`;
      const mockUrl = `https://res.cloudinary.com/demo/image/upload/v1570979139/sample.jpg?filename=${encodeURIComponent(uniqueName)}`;
      
      logger.info('Simulated Cloudinary upload success (simulation mode):', {
        mockUrl,
        filename: originalName
      });
      
      return resolve({
        url: mockUrl,
        publicId: `mock_id_${Date.now()}`
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'sundar_inquiries',
        resource_type: 'auto', // Auto-detect PDF, Images, XLS, DOC
        public_id: `${originalName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary stream upload error:', {
            message: error.message,
            stack: error.stack
          });
          return reject(error);
        }
        
        logger.info('Cloudinary upload success:', {
          secureUrl: result.secure_url,
          publicId: result.public_id
        });
        
        resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

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

/**
 * Deletes an asset from Cloudinary using its secure URL
 * @param {string} url - The full secure URL of the asset
 * @returns {Promise<any>}
 */
const deleteAsset = async (url) => {
  if (!isConfigured || !url) return;
  try {
    const info = getCloudinaryInfoFromUrl(url);
    if (!info) return;
    
    const result = await cloudinary.uploader.destroy(info.publicId, {
      resource_type: info.resourceType
    });
    logger.info('Cloudinary asset deleted successfully:', info.publicId);
    return result;
  } catch (err) {
    logger.error('Failed to delete Cloudinary asset:', err);
    throw err;
  }
};

module.exports = {
  uploadBuffer,
  deleteAsset,
  isConfigured
};
