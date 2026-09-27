/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');

// Load environment variables - try .env.development first if NODE_ENV is development
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production'
  : '.env.development';
const envPath = path.resolve(__dirname, '..', envFile);

// If the environment-specific file doesn't exist, fall back to .env
if (!fs.existsSync(envPath)) {
  require('dotenv').config();
} else {
  require('dotenv').config({ path: envPath });
}

const mongoose = require('mongoose');
const { validateEnv } = require('../src/config/validateEnv');
const { syncNotionPosts } = require('../src/notion/notionService');

async function main() {
  console.log('🚀 [SYNC] Starting Notion blog sync script...');
  const startTime = Date.now();
  
  const env = validateEnv({ requireNotion: true, requireMongo: true, exitOnError: true });
  console.log('✅ [SYNC] Environment variables validated');

  console.log('🔌 [SYNC] Connecting to MongoDB...');
  console.log(`   URI: ${env.mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
  
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 30000
  });
  console.log('✅ [SYNC] MongoDB connected');

  console.log('🗂️  [SYNC] Starting Notion sync...');
  console.log(`   Database ID: ${env.notionDatabaseId.substring(0, 8)}...`);
  
  const metrics = await syncNotionPosts({
    notionApiKey: env.notionApiKey,
    databaseId: env.notionDatabaseId,
    tagsDatabaseId: process.env.NOTION_TAGS_DB_ID,
    authorsDatabaseId: process.env.NOTION_AUTHORS_DB_ID
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('📊 [SYNC] Sync complete:', {
    ...metrics,
    duration: `${duration}s`
  });
  
  await mongoose.disconnect();
  console.log('🔌 [SYNC] MongoDB disconnected');
  console.log(`✅ [SYNC] Total time: ${duration}s`);
}

main()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error('❌ Sync failed', error);
    try {
      await mongoose.disconnect();
    } catch (err) {
      console.error('⚠️  Failed to close MongoDB connection cleanly', err);
    }
    process.exit(1);
  });
