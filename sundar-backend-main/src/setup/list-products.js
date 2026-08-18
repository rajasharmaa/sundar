const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const listProducts = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const finalUri = uri.includes('.net/?') 
      ? uri.replace('.net/?', '.net/sundarCorporation?') 
      : uri.includes('.net/') 
        ? uri 
        : `${uri}/sundarCorporation`;
    console.log('Connecting to MongoDB Atlas at:', finalUri.replace(/\/\/.*@/, '//<credentials>@'));
    await mongoose.connect(finalUri);
    console.log('Connected!');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections available:', collections.map(c => c.name));

    const productsCollection = db.collection('products');
    const count = await productsCollection.countDocuments();
    console.log(`Total products in database: ${count}`);

    if (count > 0) {
      const sampleProducts = await productsCollection.find({}).limit(10).toArray();
      sampleProducts.forEach((p, idx) => {
        console.log(`[${idx + 1}] Name: "${p.name}" | Category: "${p.category}" | Description: "${p.description || 'None'}"`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error listing products:', error);
    process.exit(1);
  }
};

listProducts();
