const Post = require('../models/Post');

async function ensureIndexes() {
  try {
    await Post.init();
    console.log('✅ [DB] Post model indexes ensured');
  } catch (error) {
    console.error('❌ [DB] Failed to ensure indexes:', error.message);
    throw error;
  }
}

async function findByNotionPageId(notionPageId) {
  return Post.findOne({ notionPageId }).lean();
}

async function upsertPostFromNotion(postData) {
  const payload = { ...postData, syncedAt: new Date() };
  
  try {
    const result = await Post.findOneAndUpdate(
      { notionPageId: payload.notionPageId },
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    
    return result;
  } catch (error) {
    console.error(`❌ [DB] Failed to upsert post "${payload.slug}":`, error.message);
    throw error;
  }
}

async function getPublishedPosts(options = {}) {
  const query = { published: true };
  if (options.tag) {
    query.tags = options.tag;
  }

  try {
    const posts = await Post.find(query)
      .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
      .select('title slug excerpt coverUrl publishedAt tags featured readingTime')
      .lean();
    return posts;
  } catch (error) {
    console.error('[DB] Failed to fetch published posts:', error.message);
    throw error;
  }
}

async function getPostBySlug(slug) {
  try {
    return await Post.findOne({ slug, published: true }).lean();
  } catch (error) {
    console.error(`[DB] Failed to fetch post by slug "${slug}":`, error.message);
    throw error;
  }
}

async function getRelatedPosts(slug, limit = 3) {
  const current = await Post.findOne({ slug, published: true }).select('tags slug').lean();
  if (!current) return [];
  if (!current.tags || current.tags.length === 0) return [];

  return Post.find({
    published: true,
    slug: { $ne: slug },
    tags: { $in: current.tags }
  })
    .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
    .limit(limit)
    .select('title slug excerpt coverUrl publishedAt tags featured readingTime')
    .lean();
}

async function getAllPublishedPostsForSitemap() {
  return Post.find({ published: true })
    .select('slug updatedAt publishedAt')
    .sort({ publishedAt: -1 })
    .lean();
}

async function getAllPostsByNotionPageIds() {
  return Post.find({})
    .select('notionPageId slug title published')
    .lean();
}

async function deletePostByNotionPageId(notionPageId) {
  try {
    const result = await Post.deleteOne({ notionPageId });
    return result.deletedCount > 0;
  } catch (error) {
    console.error(`❌ [DB] Failed to delete post with notionPageId "${notionPageId}":`, error.message);
    throw error;
  }
}

module.exports = {
  ensureIndexes,
  findByNotionPageId,
  upsertPostFromNotion,
  getPublishedPosts,
  getPostBySlug,
  getRelatedPosts,
  getAllPublishedPostsForSitemap,
  getAllPostsByNotionPageIds,
  deletePostByNotionPageId
};
