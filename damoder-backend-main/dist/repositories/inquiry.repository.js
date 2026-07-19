"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InquiryRepository = void 0;
const mongodb_1 = require("mongodb");
const database_1 = require("../config/database");
class InquiryRepository {
    async getCollection() {
        const db = await (0, database_1.connectToDB)();
        return db.collection('inquiries');
    }
    async create(inquiry, options) {
        const collection = await this.getCollection();
        const result = await collection.insertOne(inquiry, options);
        return result.insertedId.toString();
    }
    async findByUserIdOrEmail(userId, email) {
        const collection = await this.getCollection();
        const orQueries = [{ email }];
        if (userId && mongodb_1.ObjectId.isValid(userId)) {
            orQueries.push({ userId: new mongodb_1.ObjectId(userId) });
        }
        const items = await collection.find({ $or: orQueries })
            .sort({ createdAt: -1 })
            .toArray();
        return items.map(item => ({
            ...item,
            id: item._id ? item._id.toString() : item.id
        }));
    }
    async findAll() {
        const collection = await this.getCollection();
        const items = await collection.find({})
            .sort({ createdAt: -1 })
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
        const item = await collection.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!item)
            return null;
        return {
            ...item,
            id: item._id ? item._id.toString() : item.id
        };
    }
    async updateOne(id, updateQuery, options) {
        if (!mongodb_1.ObjectId.isValid(id))
            return false;
        const collection = await this.getCollection();
        const result = await collection.updateOne({ _id: new mongodb_1.ObjectId(id) }, updateQuery, options);
        return result.matchedCount > 0;
    }
    async deleteOne(id) {
        if (!mongodb_1.ObjectId.isValid(id))
            return false;
        const collection = await this.getCollection();
        const result = await collection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        return result.deletedCount > 0;
    }
}
exports.InquiryRepository = InquiryRepository;
