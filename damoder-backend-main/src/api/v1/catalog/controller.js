const { connectToDB } = require('../../../config/database');
const logger = require('../../../utils/logger');
const { createError, sendErrorResponse } = require('../../../utils/secure-error-handler');

const getActiveCatalog = async (req, res) => {
  try {
    const db = await connectToDB();
    const catalogsCollection = db.collection('catalogs');
    
    const catalog = await catalogsCollection.findOne({ isActive: true }, { sort: { createdAt: -1 } });
    
    if (catalog) {
      return res.json({
        success: true,
        data: {
          name: catalog.name,
          url: catalog.url,
          updatedAt: catalog.updatedAt || catalog.createdAt
        }
      });
    }

    // Default fallback PDF if nothing uploaded
    return res.json({
      success: true,
      data: {
        name: 'Standard Catalog',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        updatedAt: new Date()
      }
    });
  } catch (err) {
    logger.error('Get active catalog public API error:', {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });
    const error = createError.internal('Catalog retrieval service temporarily unavailable');
    return sendErrorResponse(res, error, req.requestId);
  }
};

module.exports = {
  getActiveCatalog
};
