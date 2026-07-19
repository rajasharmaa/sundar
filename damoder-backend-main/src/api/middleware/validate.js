const { z } = require('zod');
const logger = require('../../utils/logger');
const { createError, sendErrorResponse } = require('../../utils/secure-error-handler');

const validate = (schema) => async (req, res, next) => {
    try {
        // Parse the schema with direct request data
        const parsed = await schema.parseAsync(req.body);

        // Replace req.body with parsed data (sanitized and typed)
        req.body = parsed;

        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Log validation error
            logger.warn('Validation error', {
                requestId: req.requestId,
                url: req.originalUrl,
                method: req.method,
                errors: error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                    code: e.code
                })),
                ip: req.ip
            });
            
            // Use standard error response
            const validationError = createError.validation(
                'Validation failed',
                error.errors.reduce((acc, e) => {
                    const field = e.path.join('.');
                    acc[field] = e.message;
                    return acc;
                }, {})
            );
            
            return sendErrorResponse(res, validationError, req.requestId);
        }
        next(error);
    }
};

module.exports = { validate };
