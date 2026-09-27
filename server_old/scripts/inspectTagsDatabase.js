/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production'
  : '.env.development';
const envPath = path.resolve(__dirname, '..', envFile);

if (!fs.existsSync(envPath)) {
  require('dotenv').config();
} else {
  require('dotenv').config({ path: envPath });
}

const { Client } = require('@notionhq/client');

async function inspectTagsDatabase() {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = '2ddcb8f64f82812db3c3d5be3272ec9f'; // Tags database ID from URL
  
  if (!apiKey) {
    console.error('❌ NOTION_API_KEY is not set in environment variables');
    process.exit(1);
  }

  console.log('🔍 Inspecting Tags database...\n');
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

    // Query all tags
    console.log('\n📝 Fetching all tags from database...\n');
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100
    });

    console.log(`✅ Found ${response.results.length} tag(s):\n`);
    response.results.forEach((page, index) => {
      const title = page.properties?.Name?.title?.[0]?.plain_text || 
                    page.properties?.Title?.title?.[0]?.plain_text ||
                    page.properties?.Tag?.title?.[0]?.plain_text ||
                    'Untitled';
      console.log(`${index + 1}. ${title} (ID: ${page.id})`);
    });

  } catch (error) {
    console.error('❌ Error inspecting database:', error.message);
    if (error.code === 'object_not_found') {
      console.error('\n💡 Make sure the database is shared with your integration');
    }
    process.exit(1);
  }
}

inspectTagsDatabase();
