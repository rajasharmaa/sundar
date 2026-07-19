"use strict";
const { ZodError } = require('zod');
/**
 * Middleware to validate Express requests using Zod schemas
 * @param {import('zod').AnyZodObject} schema
 */
const zodValidate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    }
    catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        return res.status(500).json({ success: false, message: 'Internal Server Error during validation' });
    }
};
module.exports = { zodValidate };
