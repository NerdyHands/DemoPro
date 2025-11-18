/**
 * Blog Sync Service for ezPICRA Server
 * Synchronizes blog data from Google Sheets to MongoDB
 */

const mongoose = require('mongoose');
const { fetchBlogArticles } = require('./googleSheetsService');
const { fetchGoogleDocContent, extractGoogleDocId } = require('./googleDocsService');

// Configuration
const COMPANY_FILTER = process.env.COMPANY_NAME || 'ezPICRA';
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'ezpicra';

// Blog Article Schema for mongoose
const blogArticleSchema = new mongoose.Schema({
  id: String,
  title: String,
  slug: String,
  author: String,
  publishDate: Date,
  category: String,
  tags: [String],
  metaDescription: String,
  excerpt: String,
  content: String,
  images: [String],
  status: String,
  company: String,
  featured: Boolean,
  readTime: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  syncedAt: { type: Date, default: Date.now }
}, { 
  collection: 'blog_articles',
  timestamps: true 
});

/**
 * Sync blog articles from Google Sheets to MongoDB
 */
async function syncBlogDataDirect() {
  try {
    console.log('🚀 Starting blog sync for ezPICRA...');
    
    // Check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('🔄 Connecting to MongoDB via mongoose...');
      await mongoose.connect(MONGODB_URI + '/' + DB_NAME);
      console.log('✅ Connected to MongoDB via mongoose');
    } else {
      console.log('✅ Already connected to MongoDB via mongoose');
    }
    
    // Use mongoose model instead of raw collection
    const BlogArticle = mongoose.model('BlogArticle', blogArticleSchema);
    
    // Fetch articles from Google Sheets
    console.log('📊 Fetching articles from Google Sheets...');
    const articlesData = await fetchBlogArticles();
    
    if (!articlesData || articlesData.length === 0) {
      const existingArticlesCount = await BlogArticle.countDocuments({ company: COMPANY_FILTER });
      console.log(`⚠️ No articles found in Google Sheets - keeping ${existingArticlesCount} existing articles`);
      
      return { 
        success: true, 
        message: `No articles found in Google Sheets - keeping ${existingArticlesCount} existing articles`, 
        articlesCount: existingArticlesCount 
      };
    }
    
    // Process articles with content fetching
    console.log('🔄 Processing articles and fetching content...');
    const articles = await Promise.all(articlesData.map(async (row) => {
      const article = {
        id: row.id || generateId(row.title),
        title: row.title || 'Untitled Article',
        slug: row.slug || generateSlug(row.title),
        author: row.author || 'ezPICRA Team',
        publishDate: parseDate(row.publishDate) || new Date().toISOString(),
        category: row.category || 'General',
        tags: parseTagsArray(row.tags),
        metaDescription: row.metaDescription || '',
        excerpt: row.excerpt || '',
        content: await getArticleContent(row, 'html'),
        images: parseImagesArray(row.images || row.coverImageURL),
        status: row.status || 'Draft',
        company: row.company || COMPANY_FILTER,
        featured: parseBoolean(row.featured),
        readTime: 1, // Will be calculated after content
        createdAt: new Date(),
        updatedAt: new Date(),
        syncedAt: new Date(),
      };
      
      // Calculate read time and excerpt
      article.readTime = calculateReadTime(article.content);
      article.excerpt = article.excerpt || generateExcerpt(article.content);
      
      console.log(`📄 Processed: "${article.title}" - Content: ${article.content ? article.content.length : 0} chars`);
      
      return article;
    }));
    
    // Filter only published articles for the company
    const publishedArticles = articles.filter(article => 
      article.status === 'Published' && article.company === COMPANY_FILTER
    );
    
    console.log(`📝 Found ${publishedArticles.length} published articles for ${COMPANY_FILTER}`);
    
    if (publishedArticles.length === 0) {
      console.log('⚠️ No published articles found for the company');
      return { success: true, message: 'No published articles found', articlesCount: 0 };
    }
    
    // Smart sync with existing articles
    const syncResult = await smartSyncArticles(BlogArticle, publishedArticles);
    console.log(`📊 Sync Summary: ${syncResult.created} created, ${syncResult.updated} updated, ${syncResult.deleted} deleted, ${syncResult.unchanged} unchanged`);
    
    // Create indexes for performance
    await createBlogIndexes(BlogArticle);
    
    console.log('🎉 Blog sync completed successfully!');
    
    return { 
      success: true, 
      message: `Sync completed: ${syncResult.created} created, ${syncResult.updated} updated, ${syncResult.deleted} deleted, ${syncResult.unchanged} unchanged`, 
      articlesCount: publishedArticles.length,
      syncStats: syncResult,
      source: 'Google Sheets',
      company: COMPANY_FILTER
    };
    
  } catch (error) {
    console.error('❌ Blog sync failed:', error);
    return { 
      success: false, 
      message: `Sync failed: ${error.message}`,
      articlesCount: 0,
      error: error.stack
    };
  }
}

/**
 * Smart sync - only update what has changed
 */
async function smartSyncArticles(BlogArticle, newArticles) {
  console.log('🔄 Starting smart sync...');
  
  const result = {
    created: 0,
    updated: 0,
    deleted: 0,
    unchanged: 0
  };
  
  // Get existing articles for the company
  const existingArticles = await BlogArticle.find({ company: COMPANY_FILTER }).lean();
  console.log(`📄 Found ${existingArticles.length} existing articles in database`);
  
  // Create lookup maps
  const existingMap = new Map();
  existingArticles.forEach(article => {
    existingMap.set(article.slug, article);
  });
  
  const newMap = new Map();
  newArticles.forEach(article => {
    newMap.set(article.slug, article);
  });
  
  // Process new/updated articles
  for (const newArticle of newArticles) {
    const existingArticle = existingMap.get(newArticle.slug);
    
    if (!existingArticle) {
      // Create new article
      await BlogArticle.create({
        ...newArticle,
        createdAt: new Date(),
        updatedAt: new Date(),
        syncedAt: new Date()
      });
      console.log(`➕ Created: ${newArticle.title}`);
      result.created++;
    } else {
      // Check if article needs updating
      const needsUpdate = hasArticleChanged(existingArticle, newArticle);
      
      if (needsUpdate) {
        await BlogArticle.findOneAndUpdate(
          { slug: newArticle.slug },
          {
            ...newArticle,
            createdAt: existingArticle.createdAt, // Preserve creation date
            updatedAt: new Date(),
            syncedAt: new Date()
          },
          { new: true, upsert: false }
        );
        console.log(`🔄 Updated: ${newArticle.title}`);
        result.updated++;
      } else {
        // Update only sync timestamp
        await BlogArticle.updateOne(
          { slug: newArticle.slug },
          { $set: { syncedAt: new Date() } }
        );
        console.log(`⏭️ Unchanged: ${newArticle.title}`);
        result.unchanged++;
      }
    }
  }
  
  // Remove articles that no longer exist
  for (const existingArticle of existingArticles) {
    if (!newMap.has(existingArticle.slug)) {
      await BlogArticle.deleteOne({ slug: existingArticle.slug });
      console.log(`🗑️ Deleted: ${existingArticle.title}`);
      result.deleted++;
    }
  }
  
  return result;
}

/**
 * Check if an article has changed
 */
function hasArticleChanged(existingArticle, newArticle) {
  const fieldsToCompare = [
    'title', 'content', 'metaDescription', 'excerpt', 
    'author', 'category', 'tags', 'images', 'featured', 'status'
  ];
  
  for (const field of fieldsToCompare) {
    const existingValue = existingArticle[field];
    const newValue = newArticle[field];
    
    // Handle array comparison
    if (Array.isArray(existingValue) && Array.isArray(newValue)) {
      if (existingValue.length !== newValue.length) {
        console.log(`📝 Array field changed: ${field}`);
        return true;
      }
      if (!existingValue.every((val, index) => val === newValue[index])) {
        console.log(`📝 Array field changed: ${field}`);
        return true;
      }
    }
    // Handle regular field comparison
    else if (existingValue !== newValue) {
      console.log(`📝 Field changed: ${field}`);
      return true;
    }
  }
  
  return false;
}

/**
 * Get article content from Google Docs or fallback
 */
async function getArticleContent(row, format = 'html') {
  try {
    // Check for Google Doc URL
    const googleDocUrl = row.googleDocUrl || row.content || '';
    
    if (googleDocUrl && googleDocUrl.includes('docs.google.com')) {
      console.log(`📄 Fetching content from Google Doc: ${googleDocUrl.substring(0, 50)}...`);
      const content = await fetchGoogleDocContent(googleDocUrl, format);
      console.log(`✅ Fetched ${content.length} characters from Google Doc`);
      return content;
    }
    
    // Fallback to existing content
    return googleDocUrl || '';
    
  } catch (error) {
    console.error(`❌ Failed to fetch Google Doc content: ${error.message}`);
    return row.content || row.googleDocUrl || '';
  }
}

/**
 * Create database indexes for performance
 */
async function createBlogIndexes(BlogArticle) {
  try {
    // Mongoose automatically creates indexes based on schema
    // We can also manually ensure indexes exist
    await BlogArticle.collection.createIndex({ slug: 1 }, { unique: true });
    await BlogArticle.collection.createIndex({ company: 1 });
    await BlogArticle.collection.createIndex({ category: 1 });
    await BlogArticle.collection.createIndex({ tags: 1 });
    await BlogArticle.collection.createIndex({ featured: 1 });
    await BlogArticle.collection.createIndex({ status: 1 });
    await BlogArticle.collection.createIndex({ publishDate: -1 });
    await BlogArticle.collection.createIndex({ syncedAt: -1 });
    console.log('📈 Created database indexes');
  } catch (error) {
    console.warn('⚠️ Warning: Could not create some indexes:', error.message);
  }
}

// Helper functions
function parseDate(dateString) {
  if (!dateString) return new Date().toISOString();
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function parseTagsArray(tags) {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    return tags.split(',').map(tag => tag.trim()).filter(Boolean);
  }
  return [];
}

function parseImagesArray(images) {
  if (Array.isArray(images)) return images;
  if (typeof images === 'string') {
    return images.split(',').map(img => img.trim()).filter(Boolean);
  }
  return [];
}

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value.toLowerCase() === 'yes' || value === '1';
  }
  return false;
}

function generateExcerpt(content, maxLength = 160) {
  if (!content) return '';
  
  const text = content.replace(/<[^>]*>/g, '');
  return text.length > maxLength 
    ? text.substring(0, maxLength) + '...'
    : text;
}

function calculateReadTime(content) {
  if (!content) return 1;
  
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

function generateSlug(title) {
  if (!title) return 'untitled';
  
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function generateId(title) {
  if (!title) return 'untitled-' + Date.now();
  
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
}

module.exports = {
  syncBlogDataDirect,
  syncBlogData: syncBlogDataDirect, // Alias for compatibility
  smartSyncArticles,
  hasArticleChanged,
  getArticleContent
};
