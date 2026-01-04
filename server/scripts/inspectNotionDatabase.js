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

const { Client } = require('@notionhq/client');

async function inspectDatabase() {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_POSTS_DB_ID;
  
  if (!apiKey) {
    console.error('❌ NOTION_API_KEY is not set in environment variables');
    process.exit(1);
  }

  if (!databaseId) {
    console.error('❌ NOTION_POSTS_DB_ID is not set in environment variables');
    process.exit(1);
  }

  console.log('🔍 Inspecting database properties...\n');
  console.log(`Database ID: ${databaseId}\n`);
  
  const notion = new Client({ auth: apiKey });

  try {
    // Retrieve the database
    const database = await notion.databases.retrieve({ database_id: databaseId });

    console.log(`📋 Database Title: ${database.title.map(t => t.plain_text).join('')}\n`);
    console.log('📊 Properties:\n');

    const properties = database.properties;
    Object.keys(properties).forEach((propName) => {
      const prop = properties[propName];
      console.log(`  - ${propName}`);
      console.log(`    Type: ${prop.type}`);
      if (prop.type === 'select' || prop.type === 'multi_select') {
        console.log(`    Options: ${JSON.stringify(prop.options || prop[prop.type]?.options || [])}`);
      }
      console.log('');
    });

    console.log('\n💡 The code expects these properties:');
    console.log('   - Title (title)');
    console.log('   - Slug (text / rich_text)');
    console.log('   - Published (checkbox)');
    console.log('   - Publish Date (date)');
    console.log('   - Excerpt (rich_text)');
    console.log('   - Tags (multi_select OR relation)');
    console.log('   - Cover (files)');
    console.log('   - Meta Title (text)');
    console.log('   - Meta Description (text)');
    console.log('   - Canonical URL (text, optional)');
    console.log('   - Featured (checkbox, optional)');

  } catch (error) {
    console.error('❌ Error inspecting database:', error.message);
    if (error.code === 'object_not_found') {
      console.error('\n💡 Make sure the database is shared with your integration');
    }
    process.exit(1);
  }
}

inspectDatabase();
