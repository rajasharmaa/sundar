"use strict";
// 🔐 AUTH VALIDATION SCHEMAS
// Zod schemas for authentication validation
const { z } = require('zod');
const { validatePassword, validateEmail, validateIndianPhone } = require('../../../utils/validation');
const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters');
const nameSchema = z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .trim();
const emailSchema = z.string()
    .email('Invalid email address')
    .trim()
    .toLowerCase()
    .refine((email) => validateEmail(email), {
    message: 'Invalid email format'
});
const phoneSchema = z.string()
    .optional()
    .nullable()
    .transform(val => val ? val.trim() : null)
    .refine((phone) => {
    if (!phone)
        return true;
    return validateIndianPhone(phone);
}, {
    message: 'Invalid Indian phone number format'
});
const registerSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    phone: phoneSchema
});
const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional()
});
const forgotPasswordSchema = z.object({
    email: emailSchema
});
const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: passwordSchema
});
const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema
});
module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema
};
