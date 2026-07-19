const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // 🔧 User Schema Field Migration
    try {
      console.log('🔧 Running admin database user schema field migration checks...');
      const db = conn.connection.db;
      if (db) {
        const usersCollection = db.collection('users');
        
        // 1. Migrate active -> isActive
        const activeRes = await usersCollection.updateMany(
          { active: { $exists: true }, isActive: { $exists: false } },
          [{ $set: { isActive: "$active" } }]
        );
        if (activeRes.modifiedCount > 0) {
          console.log(`Migrated active -> isActive for ${activeRes.modifiedCount} users`);
        }
        
        // 2. Migrate failedLoginAttempts -> loginAttempts
        const failRes = await usersCollection.updateMany(
          { failedLoginAttempts: { $exists: true }, loginAttempts: { $exists: false } },
          [{ $set: { loginAttempts: "$failedLoginAttempts" } }]
        );
        if (failRes.modifiedCount > 0) {
          console.log(`Migrated failedLoginAttempts -> loginAttempts for ${failRes.modifiedCount} users`);
        }
        
        // 3. Migrate lastLogin -> lastLoginAt
        const loginRes = await usersCollection.updateMany(
          { lastLogin: { $exists: true }, lastLoginAt: { $exists: false } },
          [{ $set: { lastLoginAt: "$lastLogin" } }]
        );
        if (loginRes.modifiedCount > 0) {
          console.log(`Migrated lastLogin -> lastLoginAt for ${loginRes.modifiedCount} users`);
        }
        console.log('✅ Admin database user migration checks completed');
      }
    } catch (migError) {
      console.error('⚠️ User schema migration failed (non-blocking):', migError.message);
    }

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;