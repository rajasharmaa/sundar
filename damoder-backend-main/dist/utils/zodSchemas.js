"use strict";
const { z } = require('zod');
// Authentication Schemas
const registerSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
        email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
        password: z.string({ required_error: 'Password is required' })
            .min(8, 'Password must be at least 8 characters')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase & numbers'),
        phone: z.string().optional()
    })
});
const loginSchema = z.object({
    body: z.object({
        email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
        password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required')
    })
});
// Inquiry Schema
const inquirySchema = z.object({
    body: z.object({
        subject: z.string({ required_error: 'Subject is required' }).min(3, 'Subject must be at least 3 characters').max(100, 'Subject is too long'),
        message: z.string({ required_error: 'Message is required' }).min(10, 'Message must be at least 10 characters'),
        productId: z.string().optional()
    })
});
// Update Profile Schema
const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters').optional(),
        phone: z.string().optional(),
        company: z.string().optional()
    })
});
module.exports = {
    registerSchema,
    loginSchema,
    inquirySchema,
    updateProfileSchema
};
