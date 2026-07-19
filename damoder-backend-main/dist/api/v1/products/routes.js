"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Note: Require-style imports are used to maintain compatibility with JS middlewares
const { requireAdminAuth } = require('../../middleware/auth');
const productsController = __importStar(require("./controller"));
const router = (0, express_1.Router)();
// Public routes
router.get('/popular', productsController.getPopularProducts);
router.get('/search/suggestions', productsController.getSearchSuggestions);
router.get('/search', productsController.searchProducts);
router.get('/category/:category/popular', productsController.getPopularInCategory);
router.get('/:id/related', productsController.getRelatedProducts);
router.get('/category/:category', productsController.getProductsByCategory);
router.get('/slug/:slug', productsController.getProductBySlug); // SEO-friendly slug lookup
router.get('/:id', productsController.getProductById);
router.post('/:id/view', productsController.trackProductView); // Track product views
router.get('/', productsController.getProducts);
// Admin routes (require authentication)
router.post('/bulk-price-update', requireAdminAuth, productsController.bulkPriceUpdate);
exports.default = router;
