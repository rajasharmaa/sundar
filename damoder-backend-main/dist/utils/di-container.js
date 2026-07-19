"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
const product_repository_1 = require("../repositories/product.repository");
const inquiry_repository_1 = require("../repositories/inquiry.repository");
const product_service_1 = require("../services/product.service");
const inquiry_service_1 = require("../services/inquiry.service");
class DIContainer {
    instances = new Map();
    constructor() {
        this.registerInstances();
    }
    registerInstances() {
        // Instantiate Repositories
        const productRepository = new product_repository_1.ProductRepository();
        const inquiryRepository = new inquiry_repository_1.InquiryRepository();
        this.instances.set('ProductRepository', productRepository);
        this.instances.set('InquiryRepository', inquiryRepository);
        // Instantiate Services
        const productService = new product_service_1.ProductService(productRepository);
        const inquiryService = new inquiry_service_1.InquiryService(inquiryRepository, productRepository);
        this.instances.set('ProductService', productService);
        this.instances.set('InquiryService', inquiryService);
    }
    get(name) {
        const instance = this.instances.get(name);
        if (!instance) {
            throw new Error(`Dependency '${name}' not found in DI container`);
        }
        return instance;
    }
}
exports.container = new DIContainer();
