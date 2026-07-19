"use strict";
// 📊 ANALYTICS CONTROLLER
// Admin dashboard analytics endpoints
const analyticsService = require('../services/analytics.service');
const logger = require('../utils/logger');
const { createError, sendErrorResponse } = require('../middleware/error.handler');
/**
 * Get comprehensive dashboard analytics
 * GET /api/admin/analytics/dashboard
 */
const getDashboardAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, limit } = req.query;
        const analytics = await analyticsService.getDashboardAnalytics({
            startDate,
            endDate,
            limit: parseInt(limit) || 10
        });
        return res.status(200).json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        logger.error('Get dashboard analytics error:', error.message);
        return sendErrorResponse(res, createError.internalServerError('Failed to fetch analytics'), req.requestId);
    }
};
/**
 * Get product statistics
 * GET /api/admin/analytics/products
 */
const getProductAnalytics = async (req, res) => {
    try {
        const db = require('../config/database').connectToDB();
        const stats = await analyticsService.getProductStats(await db);
        return res.status(200).json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        logger.error('Get product analytics error:', error.message);
        return sendErrorResponse(res, createError.internalServerError('Failed to fetch product analytics'), req.requestId);
    }
};
/**
 * Get most viewed products
 * GET /api/admin/analytics/views
 */
const getViewAnalytics = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const db = require('../config/database').connectToDB();
        const views = await analyticsService.getViewStats(await db, {
            limit: parseInt(limit)
        });
        return res.status(200).json({
            success: true,
            data: views
        });
    }
    catch (error) {
        logger.error('Get view analytics error:', error.message);
        return sendErrorResponse(res, createError.internalServerError('Failed to fetch view analytics'), req.requestId);
    }
};
/**
 * Get inquiry analytics
 * GET /api/admin/analytics/inquiries
 */
const getInquiryAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const db = require('../config/database').connectToDB();
        const inquiries = await analyticsService.getInquiryStats(await db, {
            startDate,
            endDate
        });
        return res.status(200).json({
            success: true,
            data: inquiries
        });
    }
    catch (error) {
        logger.error('Get inquiry analytics error:', error.message);
        return sendErrorResponse(res, createError.internalServerError('Failed to fetch inquiry analytics'), req.requestId);
    }
};
/**
 * Get conversion rate
 * GET /api/admin/analytics/conversion
 */
const getConversionRate = async (req, res) => {
    try {
        const { productId } = req.query;
        const conversion = await analyticsService.getConversionRate(productId);
        return res.status(200).json({
            success: true,
            data: conversion
        });
    }
    catch (error) {
        logger.error('Get conversion rate error:', error.message);
        return sendErrorResponse(res, createError.internalServerError('Failed to fetch conversion rate'), req.requestId);
    }
};
/**
 * Track product view (public endpoint)
 * POST /api/v1/products/:id/track-view
 * This is already implemented in products.controller.js
 * We're just exposing it here for admin use
 */
const trackProductView = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id?.toString() || null;
        const result = await analyticsService.trackProductView(id, userId);
        if (!result.success) {
            return sendErrorResponse(res, createError.badRequest(result.error), req.requestId);
        }
        return res.status(200).json({
            success: true,
            message: 'View tracked successfully'
        });
    }
    catch (error) {
        logger.error('Track view error:', error.message);
        return sendErrorResponse(res, createError.internalServerError('Failed to track view'), req.requestId);
    }
};
/**
 * Get search analytics
 * GET /api/admin/analytics/search
 */
const getSearchAnalytics = async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const search = await analyticsService.getSearchAnalytics({
            limit: parseInt(limit)
        });
        return res.status(200).json({
            success: true,
            data: search
        });
    }
    catch (error) {
        logger.error('Get search analytics error:', error.message);
        return sendErrorResponse(res, createError.internalServerError('Failed to fetch search analytics'), req.requestId);
    }
};
module.exports = {
    getDashboardAnalytics,
    getProductAnalytics,
    getViewAnalytics,
    getInquiryAnalytics,
    getConversionRate,
    trackProductView,
    getSearchAnalytics
};
