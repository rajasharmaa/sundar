"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const mongodb_1 = require("mongodb");
const database_1 = require("../config/database");
class ProductRepository {
    async getCollection() {
        const db = await (0, database_1.connectToDB)();
        return db.collection('products');
    }
    async findAll(page, limit) {
        const collection = await this.getCollection();
        const skip = (page - 1) * limit;
        const items = await collection.find({ active: { $ne: false } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();
        return items.map(item => ({
            ...item,
            id: item._id ? item._id.toString() : item.id
        }));
    }
    async findById(id) {
        if (!mongodb_1.ObjectId.isValid(id))
            return null;
        const collection = await this.getCollection();
        const product = await collection.findOne({
            _id: new mongodb_1.ObjectId(id),
            active: { $ne: false }
        });
        if (!product)
            return null;
        return {
            ...product,
            id: product._id ? product._id.toString() : product.id
        };
    }
    async findBySlug(slug) {
        const collection = await this.getCollection();
        const product = await collection.findOne({
            slug,
            active: { $ne: false }
        });
        if (!product)
            return null;
        return {
            ...product,
            id: product._id ? product._id.toString() : product.id
        };
    }
    async findByCategory(category, page, limit) {
        const collection = await this.getCollection();
        const skip = (page - 1) * limit;
        const escapedCategory = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const items = await collection.find({
            category: { $regex: new RegExp(`^${escapedCategory}$`, 'i') },
            active: { $ne: false }
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();
        return items.map(item => ({
            ...item,
            id: item._id ? item._id.toString() : item.id
        }));
    }
    async findPopular(limit) {
        const collection = await this.getCollection();
        const items = await collection.find({ active: { $ne: false } })
            .sort({ createdAt: -1 }) // Sorted by creation date instead of views based on controller
            .limit(limit)
            .toArray();
        return items.map(item => ({
            ...item,
            id: item._id ? item._id.toString() : item.id
        }));
    }
    async search(searchQuery, categoryQuery, limit) {
        const collection = await this.getCollection();
        const query = { active: { $ne: false } };
        if (searchQuery) {
            const escapedSearch = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            try {
                // Safe check for indexes
                const indexes = await collection.indexes();
                const hasTextIndex = indexes.some(idx => idx.name === 'text_search_index' ||
                    (idx.key && Object.values(idx.key).includes('text')));
                if (hasTextIndex && searchQuery.trim().length >= 2) {
                    query.$text = { $search: searchQuery };
                }
                else {
                    query.$or = [
                        { name: { $regex: escapedSearch, $options: 'i' } },
                        { description: { $regex: escapedSearch, $options: 'i' } },
                        { tags: { $regex: escapedSearch, $options: 'i' } }
                    ];
                }
            }
            catch (err) {
                query.$or = [
                    { name: { $regex: escapedSearch, $options: 'i' } },
                    { description: { $regex: escapedSearch, $options: 'i' } },
                    { tags: { $regex: escapedSearch, $options: 'i' } }
                ];
            }
        }
        if (categoryQuery) {
            const escapedCategory = categoryQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.category = { $regex: new RegExp(`^${escapedCategory}$`, 'i') };
        }
        const items = await collection.find(query)
            .sort({ createdAt: -1, views: -1 })
            .limit(limit)
            .toArray();
        return items.map(item => ({
            ...item,
            id: item._id ? item._id.toString() : item.id
        }));
    }
    async getSuggestions(query, limit) {
        const collection = await this.getCollection();
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const items = await collection.aggregate([
            {
                $match: {
                    active: { $ne: false },
                    $or: [
                        { name: { $regex: escapedQuery, $options: 'i' } },
                        { category: { $regex: escapedQuery, $options: 'i' } },
                        { tags: { $regex: escapedQuery, $options: 'i' } }
                    ]
                }
            },
            { $limit: limit },
            { $project: { name: 1, category: 1, _id: 1, image: 1, images: 1, price: 1 } }
        ]).toArray();
        return items.map(item => ({
            ...item,
            id: item._id.toString()
        }));
    }
    async incrementViews(id) {
        if (!mongodb_1.ObjectId.isValid(id))
            return 0;
        const collection = await this.getCollection();
        const result = await collection.findOneAndUpdate({ _id: new mongodb_1.ObjectId(id) }, { $inc: { views: 1 } }, { returnDocument: 'after' });
        return result.value ? (result.value.views || 0) : 0;
    }
    async findRelated(category, excludeId, limit) {
        const collection = await this.getCollection();
        const query = {
            category: { $regex: new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
            active: { $ne: false }
        };
        if (mongodb_1.ObjectId.isValid(excludeId)) {
            query._id = { $ne: new mongodb_1.ObjectId(excludeId) };
        }
        const items = await collection.find(query)
            .sort({ createdAt: -1, views: -1 })
            .limit(limit)
            .toArray();
        return items.map(item => ({
            ...item,
            id: item._id ? item._id.toString() : item.id
        }));
    }
    async findPopularInCategory(category, excludeId, limit = 6) {
        const collection = await this.getCollection();
        const query = {
            category: { $regex: new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
            active: { $ne: false }
        };
        if (excludeId && mongodb_1.ObjectId.isValid(excludeId)) {
            query._id = { $ne: new mongodb_1.ObjectId(excludeId) };
        }
        const items = await collection.find(query)
            .sort({ views: -1, createdAt: -1 })
            .limit(limit)
            .toArray();
        return items.map(item => ({
            ...item,
            id: item._id ? item._id.toString() : item.id
        }));
    }
    async updateOne(id, updateQuery, options) {
        if (!mongodb_1.ObjectId.isValid(id))
            return false;
        const collection = await this.getCollection();
        const result = await collection.updateOne({ _id: new mongodb_1.ObjectId(id) }, updateQuery, options);
        return result.matchedCount > 0;
    }
}
exports.ProductRepository = ProductRepository;
