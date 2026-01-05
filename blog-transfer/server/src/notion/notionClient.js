const { Client } = require('@notionhq/client');

function createNotionClient(apiKey) {
  const auth = apiKey || process.env.NOTION_API_KEY;
  if (!auth) {
    console.error('❌ [NOTION] NOTION_API_KEY is missing');
    throw new Error('NOTION_API_KEY is required to initialize the Notion client');
  }
  console.log('✅ [NOTION] Notion client initialized (API key present)');
  return new Client({ auth });
}

module.exports = {
  createNotionClient
};
