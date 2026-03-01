const express = require('express');
const { getPublishedPosts, getPostBySlug, getRelatedPosts } = require('../repos/postsRepo');

const router = express.Router();
const CACHE_SECONDS = 300;

const setCache = (res, seconds = CACHE_SECONDS) => {
  res.set('Cache-Control', `public, max-age=${seconds}, stale-while-revalidate=${seconds * 2}`);
};

const getSiteUrl = (req) => process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;

const buildStructuredData = (post, siteUrl) => {
  const url = `${siteUrl}/blog/${post.slug}`;
  
  // Handle authors - if array, use first author or join multiple
  let authorValue = 'Editorial Team';
  if (post.authors && Array.isArray(post.authors) && post.authors.length > 0) {
    if (post.authors.length === 1) {
      authorValue = post.authors[0];
    } else {
      // Multiple authors - use array format for structured data
      authorValue = post.authors.map(name => ({
        '@type': 'Person',
        name: name
      }));
    }
  } else if (post.author) {
    authorValue = post.author;
  }
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    description: post.metaDescription || post.excerpt,
    url,
    mainEntityOfPage: url,
    image: post.coverUrl || undefined,
    publisher: {
      '@type': 'Organization',
      name: post.publisher || 'Blog'
    }
  };
  
  // Add author in correct format
  if (Array.isArray(authorValue)) {
    structuredData.author = authorValue;
  } else {
    structuredData.author = authorValue;
  }
  
  return structuredData;
};

router.get('/', async (req, res) => {
  try {
    const tag = req.query.tag;
    console.log(`📖 [BLOG API] GET /api/blog${tag ? `?tag=${tag}` : ''}`);
    
    const posts = await getPublishedPosts({
      tag: tag
    });
    
    console.log(`✅ [BLOG API] Found ${posts.length} posts${tag ? ` with tag "${tag}"` : ''}`);
    
    setCache(res);
    res.json({
      posts: posts.map((post) => ({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverUrl: post.coverUrl,
        publishedAt: post.publishedAt,
        tags: post.tags || [],
        authors: post.authors || [],
        featured: Boolean(post.featured),
        readingTime: post.readingTime || 1
      }))
    });
  } catch (error) {
    console.error('❌ [BLOG API] Failed to fetch blog posts:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack.split('\n').slice(0, 3).join('\n   '));
    }
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

router.get('/:slug/related', async (req, res) => {
  try {
    const slug = req.params.slug;
    console.log(`📖 [BLOG API] GET /api/blog/${slug}/related`);
    
    const posts = await getRelatedPosts(slug, 4);
    console.log(`✅ [BLOG API] Found ${posts.length} related posts for "${slug}"`);
    
    setCache(res);
    res.json({
      posts: posts.map((post) => ({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverUrl: post.coverUrl,
        publishedAt: post.publishedAt,
        tags: post.tags || [],
        authors: post.authors || [],
        featured: Boolean(post.featured),
        readingTime: post.readingTime || 1
      }))
    });
  } catch (error) {
    console.error(`❌ [BLOG API] Failed to fetch related posts for ${req.params.slug}:`, error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack.split('\n').slice(0, 3).join('\n   '));
    }
    res.status(500).json({ error: 'Failed to fetch related posts' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    console.log(`📖 [BLOG API] GET /api/blog/${slug}`);
    
    const post = await getPostBySlug(slug);
    if (!post) {
      console.log(`⚠️  [BLOG API] Post not found: ${slug}`);
      return res.status(404).json({ error: 'Post not found' });
    }

    console.log(`✅ [BLOG API] Found post: "${post.title}" (${post.contentHtml?.length || 0} chars)`);

    const siteUrl = getSiteUrl(req);
    setCache(res);

    res.json({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverUrl: post.coverUrl,
      imageUrl: post.imageUrl || '', // Original Notion image URL
      publishedAt: post.publishedAt,
      tags: post.tags || [],
      authors: post.authors || [],
      featured: Boolean(post.featured),
      metaTitle: post.metaTitle || post.title,
      metaDescription: post.metaDescription || post.excerpt,
      canonicalUrl: post.canonicalUrl || '',
      contentHtml: post.contentHtml || '',
      contentJson: post.contentJson || {},
      updatedAt: post.updatedAt,
      syncedAt: post.syncedAt,
      lastNotionEditedTime: post.lastNotionEditedTime,
      readingTime: post.readingTime || 1,
      structuredData: buildStructuredData(post, siteUrl)
    });
  } catch (error) {
    console.error(`❌ [BLOG API] Failed to fetch blog post ${req.params.slug}:`, error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack.split('\n').slice(0, 3).join('\n   '));
    }
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

module.exports = router;
