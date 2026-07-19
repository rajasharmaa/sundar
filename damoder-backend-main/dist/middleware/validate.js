"use strict";
const { validationResult } = require('express-validator');
/**
 * Generic validation middleware to handle express-validator results
 * @param {Array} validationRules - Array of express-validator validation rules
 * @returns {Function} Express middleware function
 */
const validate = (validationRules) => {
    return async (req, res, next) => {
        // Run validation rules
        await Promise.all(validationRules.map(rule => rule.run(req)));
        // Get validation errors
        const errors = validationResult(req);
        // If validation fails, return error response
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(error => ({
                    field: error.path,
                    message: error.msg
                }))
            });
        }
        // If validation passes, proceed to next middleware
        next();
    };
};
module.exports = { validate };
