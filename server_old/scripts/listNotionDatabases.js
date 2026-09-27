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

async function listDatabases() {
  const apiKey = process.env.NOTION_API_KEY;
  
  if (!apiKey) {
    console.error('❌ NOTION_API_KEY is not set in environment variables');
    process.exit(1);
  }

  console.log('🔍 Searching for databases accessible to your integration...\n');
  
  const notion = new Client({ auth: apiKey });

  try {
    // Search for all databases
    const response = await notion.search({
      filter: {
        property: 'object',
        value: 'database'
      }
    });

    console.log(`✅ Found ${response.results.length} database(s):\n`);

    if (response.results.length === 0) {
      console.log('⚠️  No databases found.');
      console.log('\n💡 Make sure:');
      console.log('   1. Your integration has access to the databases');
      console.log('   2. The databases are shared with your integration');
      console.log('   3. You\'ve created at least one database');
      return;
    }

    response.results.forEach((database, index) => {
      const title = database.title
        ? database.title.map(t => t.plain_text).join('')
        : 'Untitled Database';
      
      console.log(`${index + 1}. ${title}`);
      console.log(`   Database ID: ${database.id}`);
      console.log(`   URL: https://notion.so/${database.id.replace(/-/g, '')}`);
      console.log('');
    });

    console.log('📋 Copy the Database ID above and use it for NOTION_POSTS_DB_ID');
    
  } catch (error) {
    console.error('❌ Error searching for databases:', error.message);
    if (error.code === 'unauthorized') {
      console.error('\n💡 Make sure your NOTION_API_KEY is correct and has proper permissions');
    }
    process.exit(1);
  }
}

listDatabases();
