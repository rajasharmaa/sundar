/**
 * Migration: Add TTL Indexes to Token Collections
 * 
 * Run once: node damoder-backend-main/migrations/add-ttl-indexes.js
 * 
 * 🔧 M2-4 FIX: token_blacklist and refresh_tokens were growing indefinitely.
 * TTL indexes let MongoDB auto-delete documents when their expiresAt passes.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { connectToDB } = require('../src/config/database');

async function addTtlIndexes() {
  console.log('🔄 Starting TTL index migration...');
  
  const db = await connectToDB();

  // ─── token_blacklist ──────────────────────────────────────────────
  try {
    await db.collection('token_blacklist').createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0, name: 'ttl_expires_at', background: true }
    );
    console.log('✅ token_blacklist: TTL index created on expiresAt');
  } catch (err) {
    if (err.code === 85 || err.code === 86) {
      console.log('ℹ️  token_blacklist: TTL index already exists, skipping');
    } else {
      console.error('❌ token_blacklist TTL index failed:', err.message);
    }
  }

  // ─── refresh_tokens ───────────────────────────────────────────────
  try {
    await db.collection('refresh_tokens').createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0, name: 'ttl_expires_at', background: true }
    );
    console.log('✅ refresh_tokens: TTL index created on expiresAt');
  } catch (err) {
    if (err.code === 85 || err.code === 86) {
      console.log('ℹ️  refresh_tokens: TTL index already exists, skipping');
    } else {
      console.error('❌ refresh_tokens TTL index failed:', err.message);
    }
  }

  console.log('\n✅ Migration complete. MongoDB will now auto-delete expired tokens.');
  process.exit(0);
}

addTtlIndexes().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
