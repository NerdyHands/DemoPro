const REQUIRED_NOTION_VARS = ['NOTION_API_KEY', 'NOTION_POSTS_DB_ID'];
const REQUIRED_MONGO_VARS = ['MONGODB_URI'];

const formatVar = (name) => `\`${name}\``;

function validateEnv(options = {}) {
  const { requireNotion = false, requireMongo = false, exitOnError = false } = options;
  const missing = [];

  if (requireMongo) {
    for (const variable of REQUIRED_MONGO_VARS) {
      if (!process.env[variable]) {
        missing.push(variable);
      }
    }
  }

  if (requireNotion) {
    for (const variable of REQUIRED_NOTION_VARS) {
      if (!process.env[variable]) {
        missing.push(variable);
      }
    }
  }

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.map(formatVar).join(', ')}`;
    if (exitOnError) {
      throw new Error(message);
    }
    console.warn(`⚠️  ${message}`);
  }

  return {
    notionApiKey: process.env.NOTION_API_KEY,
    notionDatabaseId: process.env.NOTION_POSTS_DB_ID,
    notionTagsDatabaseId: process.env.NOTION_TAGS_DB_ID,
    notionAuthorsDatabaseId: process.env.NOTION_AUTHORS_DB_ID,
    mongoUri: process.env.MONGODB_URI
  };
}

module.exports = {
  validateEnv
};
