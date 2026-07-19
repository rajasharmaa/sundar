"use strict";
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const printAllProducts = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        const finalUri = uri.includes('.net/?')
            ? uri.replace('.net/?', '.net/damodarTraders?')
            : uri.includes('.net/')
                ? uri
                : `${uri}/damodarTraders`;
        await mongoose.connect(finalUri);
        const db = mongoose.connection.db;
        const productsCollection = db.collection('products');
        const products = await productsCollection.find({}).toArray();
        console.log(`Found ${products.length} products:`);
        products.forEach((p, idx) => {
            console.log(`${idx + 1}. ID: ${p._id.toString()} | Name: "${p.name}" | Category: "${p.category}"`);
        });
        process.exit(0);
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};
printAllProducts();
