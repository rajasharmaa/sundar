const logger = require('../../../utils/logger');
const { ObjectId } = require('mongodb');
const { connectToDB } = require('../../../config/database');
const { createError, sendErrorResponse } = require('../../../utils/secure-error-handler');

// GET /api/v1/rfq
const getRfqCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const db = await connectToDB();

        // 1. Get user's RFQ cart
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(userId) },
            { projection: { rfqCart: 1 } }
        );

        if (!user || !user.rfqCart || user.rfqCart.length === 0) {
            return res.json({ success: true, items: [] });
        }

        // 2. Fetch product details for the items in the cart
        const productIds = user.rfqCart
            .filter(item => item.productId)
            .map(item => new ObjectId(item.productId));

        const products = await db.collection('products')
            .find({ _id: { $in: productIds } })
            .project({ name: 1, images: 1, slug: 1, productCode: 1, sizeOptions: 1 })
            .toArray();

        const productMap = new Map(products.map(p => [p._id.toString(), p]));

        // 3. Assemble the response format matching frontend RfqItem[]
        const rfqItems = user.rfqCart.map(item => {
            const product = productMap.get(item.productId.toString());
            if (!product) return null;

            // Ensure images array is flat and URLs are direct strings
            const formattedProduct = {
                ...product,
                id: product._id.toString(),
                image: product.images && product.images.length > 0
                    ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
                    : '/placeholder-product.jpg'
            };

            return {
                product: formattedProduct,
                quantity: item.quantity,
                selectedSize: item.selectedSize || '',
                priceType: item.priceType || '100'
            };
        }).filter(Boolean); // Remove nulls if a product was deleted from DB

        res.json({
            success: true,
            items: rfqItems
        });

    } catch (err) {
        logger.error('Get RFQ cart error:', {
            requestId: req.requestId,
            userId: req.user?.id,
            error: err.message,
            stack: err.stack
        });
        const error = createError.internal('Unable to fetch RFQ cart');
        return sendErrorResponse(res, error, req.requestId);
    }
};

// POST /api/v1/rfq/sync
const syncRfqCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items } = req.body;

        if (!Array.isArray(items)) {
            const error = createError.badRequest('Invalid items format. Expected array.');
            return sendErrorResponse(res, error, req.requestId);
        }

        // Format items for DB
        const rfqCart = items.map(item => ({
            productId: new ObjectId(item.product.id || item.product._id),
            quantity: Math.max(1, parseInt(item.quantity) || 1),
            selectedSize: item.selectedSize || '',
            priceType: item.priceType || '100'
        }));

        const db = await connectToDB();
        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { rfqCart } }
        );

        res.json({
            success: true,
            message: 'RFQ cart synchronized successfully'
        });

    } catch (err) {
        logger.error('Sync RFQ cart error:', {
            requestId: req.requestId,
            userId: req.user?.id,
            error: err.message,
            stack: err.stack
        });
        
        // Handle validation errors for invalid ObjectIds
        if (err.message.includes('ObjectId')) {
             const error = createError.badRequest('Invalid product ID in cart');
             return sendErrorResponse(res, error, req.requestId);
        }

        const error = createError.internal('Unable to sync RFQ cart');
        return sendErrorResponse(res, error, req.requestId);
    }
};

module.exports = {
    getRfqCart,
    syncRfqCart
};
