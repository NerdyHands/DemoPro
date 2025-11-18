const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { syncBlogDataDirect } = require('../services/blogSyncService');
const { convertContentForWeb } = require('../utils/contentFormatter');

// Blog Article Schema
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

const BlogArticle = mongoose.model('BlogArticle', blogArticleSchema);

// Get all articles with pagination and filtering
router.get('/articles', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 9;
    const category = req.query.category;
    const tag = req.query.tag;
    const search = req.query.search;
    const featured = req.query.featured;
    const company = req.query.company || 'ezPICRA'; // Default company filter

    // Build query
    const query = { company };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (tag && tag !== 'All') {
      query.tags = tag;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { metaDescription: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    // Only published articles
    query.status = 'Published';

    // Get total count
    const total = await BlogArticle.countDocuments(query);

    // Pagination
    const skip = (page - 1) * perPage;
    const totalPages = Math.ceil(total / perPage);

    // Get articles
    const articles = await BlogArticle
      .find(query)
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(perPage)
      .select('-__v') // Exclude version field
      .lean();

    res.json({
      articles,
      total,
      page,
      perPage,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    });

  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Get a single article by slug
router.get('/article/:slug', async (req, res) => {
  try {
    console.log('🔍 Fetching article by slug:', req.params.slug);
    
    const article = await BlogArticle.findOne({ 
      slug: req.params.slug,
      status: 'Published'
    }).select('-__v').lean();
    
    console.log('📊 Article found:', article ? 'Yes' : 'No');
    if (article) {
      console.log('📄 Article details:', {
        title: article.title,
        slug: article.slug,
        content: article.content ? `${article.content.substring(0, 100)}...` : 'No content',
        status: article.status,
        company: article.company
      });
    }
    
    if (!article) {
      console.log('❌ Article not found in database');
      return res.status(404).json({ error: 'Article not found' });
    }

    // Convert content for web display (RTF to HTML)
    if (article.content) {
      article.content = convertContentForWeb(article.content);
    }

    console.log('✅ Sending article response');
    res.json(article);

  } catch (error) {
    console.error('❌ Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const company = req.query.company || 'ezPICRA';
    const categories = await BlogArticle.distinct('category', {
      company,
      status: 'Published'
    });
    
    res.json({
      categories: categories.filter(Boolean)
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all tags
router.get('/tags', async (req, res) => {
  try {
    const company = req.query.company || 'ezPICRA';
    const tags = await BlogArticle.distinct('tags', {
      company,
      status: 'Published'
    });
    
    res.json({
      tags: tags.filter(Boolean)
    });

  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Get featured articles
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const company = req.query.company || 'ezPICRA';
    
    const articles = await BlogArticle
      .find({
        company,
        status: 'Published',
        featured: true
      })
      .sort({ publishDate: -1 })
      .limit(limit)
      .select('-__v')
      .lean();

    res.json({
      articles
    });

  } catch (error) {
    console.error('Error fetching featured articles:', error);
    res.status(500).json({ error: 'Failed to fetch featured articles' });
  }
});

// Create a new article (for admin use)
router.post('/articles', async (req, res) => {
  try {
    const article = new BlogArticle({
      ...req.body,
      company: req.body.company || 'ezPICRA'
    });
    await article.save();
    
    res.status(201).json(article);

  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// Update an article (for admin use)
router.put('/articles/:id', async (req, res) => {
  try {
    const article = await BlogArticle.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);

  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// Delete an article (for admin use)
router.delete('/articles/:id', async (req, res) => {
  try {
    const article = await BlogArticle.findByIdAndDelete(req.params.id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ message: 'Article deleted successfully' });

  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// Sync blog data from Google Sheets
router.post('/sync', async (req, res) => {
  try {
    console.log('🔄 Manual blog sync triggered via API');
    
    const syncResult = await syncBlogDataDirect();
    
    if (syncResult.success) {
      res.json({
        success: true,
        message: syncResult.message,
        articlesCount: syncResult.articlesCount,
        syncStats: syncResult.syncStats,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: syncResult.message,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ Blog sync API error:', error);
    res.status(500).json({
      success: false,
      message: `Sync failed: ${error.message || 'Unknown error'}`,
      timestamp: new Date().toISOString()
    });
  }
});

// Get sync status
router.get('/sync/status', async (req, res) => {
  try {
    const company = req.query.company || 'ezPICRA';
    
    // Get last sync info
    const lastSyncedArticle = await BlogArticle
      .findOne({ company })
      .sort({ syncedAt: -1 })
      .select('syncedAt')
      .lean();
    
    const totalArticles = await BlogArticle.countDocuments({
      company,
      status: 'Published'
    });
    
    res.json({
      success: true,
      lastSync: lastSyncedArticle?.syncedAt || null,
      totalArticles,
      company,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error getting sync status:', error);
    res.status(500).json({
      success: false,
      message: `Failed to get sync status: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

// Get article statistics
router.get('/stats', async (req, res) => {
  try {
    const company = req.query.company || 'ezPICRA';
    
    const stats = await BlogArticle.aggregate([
      { $match: { company, status: 'Published' } },
      {
        $group: {
          _id: null,
          totalArticles: { $sum: 1 },
          featuredArticles: {
            $sum: { $cond: [{ $eq: ['$featured', true] }, 1, 0] }
          },
          avgReadTime: { $avg: '$readTime' },
          categories: { $addToSet: '$category' },
          tags: { $addToSet: '$tags' },
          latestPublishDate: { $max: '$publishDate' },
          oldestPublishDate: { $min: '$publishDate' }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalArticles: 0,
      featuredArticles: 0,
      avgReadTime: 0,
      categories: [],
      tags: [],
      latestPublishDate: null,
      oldestPublishDate: null
    };
    
    // Flatten tags array
    result.tags = result.tags.flat().filter(Boolean);
    result.categories = result.categories.filter(Boolean);
    
    res.json({
      success: true,
      stats: {
        ...result,
        totalCategories: result.categories.length,
        totalTags: result.tags.length,
        avgReadTime: Math.round(result.avgReadTime || 0)
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error getting blog stats:', error);
    res.status(500).json({
      success: false,
      message: `Failed to get blog stats: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const company = req.query.company || 'ezPICRA';
    
    // Test database connection
    const testQuery = await BlogArticle.countDocuments({ company });
    
    res.json({
      status: 'healthy',
      database: 'connected',
      articlesCount: testQuery,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Blog health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
