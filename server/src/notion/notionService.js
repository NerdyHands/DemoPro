const { createNotionClient } = require('./notionClient');
const { renderBlocks, toPlainText } = require('./blockRenderer');
const { ensureIndexes, findByNotionPageId, upsertPostFromNotion, getPublishedPosts, getPostBySlug, getRelatedPosts, getAllPostsByNotionPageIds, deletePostByNotionPageId } = require('../repos/postsRepo');
const BlogImageService = require('../../services/blogImageService');
const S3Service = require('../../services/s3Service');

const NOTION_PAGE_SIZE = 100;
const BACKOFF_BASE_MS = 500;
const BACKOFF_MAX_ATTEMPTS = 5;
const WORDS_PER_MINUTE = 200;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function withBackoff(fn, label = 'notion-call', attempt = 1) {
  try {
    return await fn();
  } catch (error) {
    const status = error?.status || error?.statusCode;
    const shouldRetry = status === 429 || (status && status >= 500);
    if (shouldRetry && attempt < BACKOFF_MAX_ATTEMPTS) {
      const delay = Math.min(BACKOFF_BASE_MS * 2 ** (attempt - 1), 8000);
      console.warn(`⚠️  ${label} failed (attempt ${attempt}) - retrying in ${delay}ms`, error.message);
      await sleep(delay);
      return withBackoff(fn, label, attempt + 1);
    }
    throw error;
  }
}

async function fetchPublishedPages(notion, databaseId) {
  console.log(`📊 [NOTION] Fetching published pages from database: ${databaseId.substring(0, 8)}...`);
  const results = [];
  let cursor;
  let pageCount = 0;

  do {
    pageCount++;
    console.log(`📄 [NOTION] Fetching page ${pageCount} (cursor: ${cursor ? cursor.substring(0, 8) + '...' : 'none'})`);
    const response = await withBackoff(
      () =>
        notion.databases.query({
          database_id: databaseId,
          page_size: NOTION_PAGE_SIZE,
          start_cursor: cursor,
          filter: {
            property: 'Publish',
            checkbox: { equals: true }
          }
        }),
      'notion-database-query'
    );

    results.push(...response.results);
    console.log(`✅ [NOTION] Fetched ${response.results.length} pages (total: ${results.length})`);
    cursor = response.has_more ? response.next_cursor : null;
  } while (cursor);

  console.log(`📊 [NOTION] Total published pages fetched: ${results.length}`);
  return results;
}

async function fetchBlocksWithChildren(notion, blockId) {
  const blocks = [];
  let cursor;
  let blockPageCount = 0;

  do {
    blockPageCount++;
    const response = await withBackoff(
      () =>
        notion.blocks.children.list({
          block_id: blockId,
          start_cursor: cursor,
          page_size: NOTION_PAGE_SIZE
        }),
      'notion-blocks-list'
    );

    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : null;
  } while (cursor);

  // Recursively fetch children for nested blocks (toggles, lists)
  const blocksWithChildren = blocks.filter(b => b.has_children);
  if (blocksWithChildren.length > 0) {
    console.log(`  ↳ [NOTION] Fetching children for ${blocksWithChildren.length} nested blocks`);
  }
  for (const block of blocks) {
    if (block.has_children) {
      block.children = await fetchBlocksWithChildren(notion, block.id);
    }
  }

  return blocks;
}

function getText(property) {
  const rich = property?.rich_text || property?.title;
  if (!rich || !Array.isArray(rich)) return '';
  return rich.map((t) => t.plain_text || '').join('').trim();
}

function getCheckbox(property) {
  return Boolean(property?.checkbox);
}

function getDateValue(property) {
  const value = property?.date?.start;
  return value ? new Date(value) : null;
}

async function fetchTagNames(notion, tagIds, tagsDatabaseId) {
  if (!tagsDatabaseId || !tagIds || tagIds.length === 0) {
    return [];
  }

  const tagNames = [];
  try {
    // Fetch each tag page to get its title/name
    for (const tagId of tagIds) {
      try {
        const tagPage = await withBackoff(
          () => notion.pages.retrieve({ page_id: tagId }),
          `fetch-tag-${tagId.substring(0, 8)}`
        );
        
        // Try different property names for tag name
        const name = getText(tagPage.properties?.Name) ||
                    getText(tagPage.properties?.Title) ||
                    getText(tagPage.properties?.Tag) ||
                    getText(tagPage.properties?.['Tag Name']);
        
        if (name) {
          tagNames.push(name);
        }
      } catch (error) {
        console.warn(`⚠️  [NOTION] Failed to fetch tag ${tagId.substring(0, 8)}: ${error.message}`);
        // Continue with other tags
      }
    }
  } catch (error) {
    console.warn(`⚠️  [NOTION] Error fetching tag names: ${error.message}`);
  }
  
  return tagNames;
}

async function fetchAuthorNames(notion, authorIds, authorsDatabaseId) {
  if (!authorsDatabaseId || !authorIds || authorIds.length === 0) {
    return [];
  }

  const authorNames = [];
  try {
    // Fetch each author page to get its name
    for (const authorId of authorIds) {
      try {
        const authorPage = await withBackoff(
          () => notion.pages.retrieve({ page_id: authorId }),
          `fetch-author-${authorId.substring(0, 8)}`
        );
        
        // Try different property names for author name
        const name = getText(authorPage.properties?.Name) ||
                    getText(authorPage.properties?.Title) ||
                    getText(authorPage.properties?.Author) ||
                    getText(authorPage.properties?.['Author Name']) ||
                    getText(authorPage.properties?.['Full Name']);
        
        if (name) {
          authorNames.push(name);
        }
      } catch (error) {
        console.warn(`⚠️  [NOTION] Failed to fetch author ${authorId.substring(0, 8)}: ${error.message}`);
        // Continue with other authors
      }
    }
  } catch (error) {
    console.warn(`⚠️  [NOTION] Error fetching author names: ${error.message}`);
  }
  
  return authorNames;
}

function getMultiSelect(property) {
  if (Array.isArray(property?.multi_select)) {
    return property.multi_select.map((item) => item.name).filter(Boolean);
  }
  if (Array.isArray(property?.relation)) {
    return property.relation.map((item) => item.id).filter(Boolean);
  }
  return [];
}

function slugify(value, fallback) {
  const base = (value || fallback || '').toString().toLowerCase();
  const slug = base
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  if (slug) return slug;
  return `post-${Date.now()}`;
}

function pickCoverUrl(page) {
  const coverProp = page.properties?.Cover;
  if (coverProp?.files?.length) {
    const file = coverProp.files[0];
    if (file.file?.url) return file.file.url;
    if (file.external?.url) return file.external.url;
  }

  if (page.cover?.external?.url) return page.cover.external.url;
  if (page.cover?.file?.url) return page.cover.file.url;

  return '';
}

function buildExcerpt(excerptProp, blocks) {
  const provided = getText(excerptProp);
  if (provided) return provided;

  const plain = toPlainText(blocks);
  if (!plain) return '';

  const maxLength = 200;
  return plain.length > maxLength ? `${plain.slice(0, maxLength).trim()}...` : plain;
}

function calculateReadingTime(blocks) {
  const text = toPlainText(blocks);
  if (!text) return 1;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

async function mapPageToPost(notion, page, blocks, contentHtml, tagsDatabaseId, authorsDatabaseId, imageService = null) {
  const properties = page.properties || {};
  const title = getText(properties['Post Title']);
  const slug = slugify(getText(properties['Slug']), title);
  const publishedAt = getDateValue(properties['Date']) || new Date(page.created_time);
  
  // Handle tags - if relation, fetch names from Tags database
  let tags = [];
  const tagsProperty = properties['Tags'];
  if (Array.isArray(tagsProperty?.multi_select)) {
    tags = tagsProperty.multi_select.map((item) => item.name).filter(Boolean);
  } else if (Array.isArray(tagsProperty?.relation)) {
    const tagIds = tagsProperty.relation.map((item) => item.id).filter(Boolean);
    tags = await fetchTagNames(notion, tagIds, tagsDatabaseId);
  }
  
  // Handle authors - if relation, fetch names from Authors database
  let authors = [];
  const authorsProperty = properties['Authors'] || properties['Author'];
  if (Array.isArray(authorsProperty?.multi_select)) {
    authors = authorsProperty.multi_select.map((item) => item.name).filter(Boolean);
  } else if (Array.isArray(authorsProperty?.relation)) {
    const authorIds = authorsProperty.relation.map((item) => item.id).filter(Boolean);
    authors = await fetchAuthorNames(notion, authorIds, authorsDatabaseId);
  } else if (Array.isArray(authorsProperty?.people)) {
    // Handle people type if authors are stored as people
    authors = authorsProperty.people
      .map((person) => person.name || person.id)
      .filter(Boolean);
  }
  
  const metaTitle = getText(properties['Meta Title']) || title;
  const excerpt = buildExcerpt(properties['Description'], blocks);
  let coverUrl = pickCoverUrl(page);
  const imageUrl = coverUrl; // Store original Notion URL before processing
  const metaDescription = getText(properties['Meta Description']) || excerpt;
  const canonicalUrl = getText(properties['Canonical URL']);
  const featured = getCheckbox(properties['Featured']);

  // Process images through S3 if image service is available
  let processedContentHtml = contentHtml;
  if (imageService) {
    // Process cover image (coverUrl will be updated to S3 URL if S3 is enabled)
    if (coverUrl) {
      coverUrl = await imageService.processCoverImage(coverUrl, slug);
    }
    // Process content images
    processedContentHtml = await imageService.processContentImages(contentHtml, slug);
  }

  return {
    notionPageId: page.id,
    slug,
    title: title || slug,
    excerpt,
    coverUrl,
    imageUrl, // Original Notion image URL (before S3 processing)
    published: true,
    publishedAt,
    metaTitle,
    metaDescription,
    canonicalUrl,
    featured,
    tags,
    authors,
    contentJson: blocks,
    contentHtml: processedContentHtml,
    readingTime: calculateReadingTime(blocks),
    lastNotionEditedTime: new Date(page.last_edited_time),
    syncedAt: new Date()
  };
}

async function syncNotionPosts({ notionApiKey, databaseId, tagsDatabaseId, authorsDatabaseId }) {
  if (!databaseId) {
    console.error('❌ [NOTION] NOTION_POSTS_DB_ID is missing');
    throw new Error('NOTION_POSTS_DB_ID is required for sync');
  }

  console.log('🚀 [NOTION] Starting sync process...');
  console.log(`📋 [NOTION] Database ID: ${databaseId.substring(0, 8)}...`);
  
  const notion = createNotionClient(notionApiKey);
  const metrics = { scanned: 0, updated: 0, skipped: 0, failed: 0, deleted: 0 };
  
  if (authorsDatabaseId) {
    console.log(`📋 [NOTION] Authors Database ID: ${authorsDatabaseId.substring(0, 8)}...`);
  }
  
  // Initialize image service (will fail gracefully if S3 not configured)
  let imageService = null;
  try {
    imageService = new BlogImageService();
    if (imageService.enabled) {
      console.log('✅ [NOTION] S3 image service enabled - images will be uploaded to S3');
    }
  } catch (error) {
    console.log('ℹ️  [NOTION] S3 image service disabled - using Notion URLs');
  }

  console.log('📊 [NOTION] Ensuring database indexes...');
  await ensureIndexes();
  console.log('✅ [NOTION] Indexes ensured');
  
  const pages = await fetchPublishedPages(notion, databaseId);

  if (pages.length === 0) {
    console.log('⚠️  [NOTION] No published pages found in database');
    return { ...metrics, syncedAt: new Date().toISOString(), totalPublished: 0 };
  }

  console.log(`🔄 [NOTION] Processing ${pages.length} pages...`);

  for (const page of pages) {
    metrics.scanned += 1;
    const title = page.properties?.['Post Title']?.title?.[0]?.plain_text || page.id.substring(0, 8);
    try {
      const existing = await findByNotionPageId(page.id);
      const notionEditedAt = new Date(page.last_edited_time);
      
      // Check if content changed
      const contentChanged = !existing?.lastNotionEditedTime || new Date(existing.lastNotionEditedTime) < notionEditedAt;
      
      // Check if URLs need refreshing (Notion image URLs expire after ~1 hour, refresh every 50 min)
      const URL_REFRESH_INTERVAL_MS = 50 * 60 * 1000; // 50 minutes
      const needsUrlRefresh = existing?.syncedAt && (Date.now() - new Date(existing.syncedAt).getTime()) > URL_REFRESH_INTERVAL_MS;
      
      if (!contentChanged && !needsUrlRefresh) {
        metrics.skipped += 1;
        console.log(`⏭️  [NOTION] Skipping "${title}" - no changes (${metrics.scanned}/${pages.length})`);
        continue;
      }
      
      if (needsUrlRefresh && !contentChanged) {
        console.log(`🔄 [NOTION] Refreshing URLs for "${title}" - URLs expiring soon (${metrics.scanned}/${pages.length})`);
      }

      console.log(`📝 [NOTION] Processing "${title}" (${metrics.scanned}/${pages.length})`);
      const blocks = await fetchBlocksWithChildren(notion, page.id);
      console.log(`  ✓ Fetched ${blocks.length} blocks`);
      
      const contentHtml = renderBlocks(blocks);
      const postPayload = await mapPageToPost(notion, page, blocks, contentHtml, tagsDatabaseId, authorsDatabaseId, imageService);
      console.log(`  ✓ Generated HTML (${contentHtml.length} chars), reading time: ${postPayload.readingTime} min, tags: ${postPayload.tags.length}, authors: ${postPayload.authors?.length || 0}`);

      await upsertPostFromNotion(postPayload);
      metrics.updated += 1;
      console.log(`  ✅ Updated "${postPayload.slug}" (${metrics.updated} updated, ${metrics.skipped} skipped)`);
    } catch (error) {
      metrics.failed += 1;
      console.error(`❌ [NOTION] Failed to sync page "${title}" (${page.id}):`, error.message);
      if (error.stack) {
        console.error(`   Stack: ${error.stack.split('\n')[1]?.trim()}`);
      }
    }
  }

  console.log('📊 [NOTION] Sync complete:', metrics);
  
  // Generate static JSON files only if posts were updated or deleted
  // Skip if nothing changed to avoid unnecessary S3 uploads
  if (metrics.updated > 0 || metrics.deleted > 0) {
    console.log(`📝 [STATIC] Changes detected (${metrics.updated} updated, ${metrics.deleted} deleted) - regenerating static files...`);
    try {
      await generateStaticBlogData();
    } catch (error) {
      console.warn('⚠️  [NOTION] Failed to generate static blog data:', error.message);
      // Don't fail the sync if static generation fails
    }
  } else {
    console.log('⏭️  [STATIC] No changes detected - skipping static file generation');
  }
  
  return { ...metrics, syncedAt: new Date().toISOString(), totalPublished: pages.length };
}

/**
 * Generate static JSON files for the landing page to read blog data directly
 * This eliminates the need for API calls from the landing page to the server
 */
async function generateStaticBlogData() {
  try {
    console.log('📝 [STATIC] Generating static blog data files for S3...');
    
    // Initialize S3 service (will fail gracefully if S3 not configured)
    let s3Service = null;
    try {
      s3Service = new S3Service();
      console.log('✅ [STATIC] S3 service initialized');
    } catch (error) {
      console.warn('⚠️  [STATIC] S3 service not available, skipping S3 upload:', error.message);
      console.warn('⚠️  [STATIC] Blog data will not be available via S3 - configure AWS credentials');
      return;
    }
    
    // Get all published posts
    const allPosts = await getPublishedPosts({});
    console.log(`📊 [STATIC] Found ${allPosts.length} published posts`);
    
    if (allPosts.length === 0) {
      console.log('⚠️  [STATIC] No published posts found, skipping static file generation');
      return;
    }
    
    // Generate posts index (summary list)
    const postsIndex = allPosts.map(post => ({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverUrl: post.coverUrl || '',
      publishedAt: post.publishedAt?.toISOString() || new Date().toISOString(),
      tags: post.tags || [],
      authors: post.authors || [],
      featured: Boolean(post.featured),
      readingTime: post.readingTime || 1
    }));
    
    // Upload posts index to S3
    const indexKey = 'blog-data/posts.json';
    const indexUrl = await s3Service.uploadJSON({ posts: postsIndex }, indexKey);
    console.log(`✅ [STATIC] Uploaded posts index to S3: ${indexUrl}`);
    
    // Generate individual post files
    const siteUrl = process.env.SITE_URL || 'https://mrdemopro.com';
    let postsGenerated = 0;
    
    for (const postSummary of allPosts) {
      try {
        const post = await getPostBySlug(postSummary.slug);
        if (!post) {
          console.warn(`⚠️  [STATIC] Post not found: ${postSummary.slug}`);
          continue;
        }
        
        // Build structured data for SEO (same as API)
        const postUrl = `${siteUrl}/blog/${post.slug}`;
        const structuredData = {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          datePublished: post.publishedAt?.toISOString() || new Date().toISOString(),
          dateModified: post.updatedAt?.toISOString() || post.publishedAt?.toISOString() || new Date().toISOString(),
          description: post.metaDescription || post.excerpt,
          url: postUrl,
          mainEntityOfPage: postUrl,
          image: post.coverUrl || undefined,
          author: post.author || (post.authors && post.authors.length > 0 ? post.authors[0] : 'Editorial Team'),
          publisher: {
            '@type': 'Organization',
            name: post.publisher || 'Blog'
          }
        };
        
        // Handle authors in structured data if multiple authors exist
        if (post.authors && Array.isArray(post.authors) && post.authors.length > 1) {
          structuredData.author = post.authors.map(name => ({
            '@type': 'Person',
            name: name
          }));
        }
        
        const postData = {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          coverUrl: post.coverUrl || '',
          imageUrl: post.imageUrl || '', // Original Notion image URL
          publishedAt: post.publishedAt?.toISOString() || new Date().toISOString(),
          tags: post.tags || [],
          authors: post.authors || [],
          featured: Boolean(post.featured),
          metaTitle: post.metaTitle || post.title,
          metaDescription: post.metaDescription || post.excerpt,
          canonicalUrl: post.canonicalUrl || '',
          contentHtml: post.contentHtml || '',
          contentJson: post.contentJson || {},
          updatedAt: post.updatedAt?.toISOString() || post.publishedAt?.toISOString() || new Date().toISOString(),
          syncedAt: post.syncedAt?.toISOString(),
          lastNotionEditedTime: post.lastNotionEditedTime?.toISOString(),
          readingTime: post.readingTime || 1,
          structuredData
        };
        
        // Generate related posts data
        const related = await getRelatedPosts(post.slug, 4);
        const relatedData = related.map(r => ({
          title: r.title,
          slug: r.slug,
          excerpt: r.excerpt,
          coverUrl: r.coverUrl || '',
          publishedAt: r.publishedAt?.toISOString() || new Date().toISOString(),
          tags: r.tags || [],
          featured: Boolean(r.featured),
          readingTime: r.readingTime || 1
        }));
        
        // Upload individual post file to S3
        const postKey = `blog-data/${post.slug}.json`;
        const s3PostUrl = await s3Service.uploadJSON({
          ...postData,
          related: { posts: relatedData }
        }, postKey);
        
        postsGenerated++;
        if (postsGenerated % 5 === 0) {
          console.log(`  📤 [STATIC] Uploaded ${postsGenerated}/${allPosts.length} posts to S3...`);
        }
      } catch (error) {
        console.error(`❌ [STATIC] Failed to generate file for post "${postSummary.slug}":`, error.message);
      }
    }
    
    // Generate and upload tags index
    const allTags = new Set();
    allPosts.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => allTags.add(tag));
      }
    });
    
    const tagsIndex = Array.from(allTags).sort();
    const tagsKey = 'blog-data/tags.json';
    const tagsUrl = await s3Service.uploadJSON({ tags: tagsIndex }, tagsKey);
    console.log(`✅ [STATIC] Uploaded tags index to S3: ${tagsUrl} (${tagsIndex.length} tags)`);
    
    console.log(`✅ [STATIC] Uploaded ${postsGenerated} post files and index to S3`);
    console.log(`📂 [STATIC] S3 base URL: ${s3Service.publicUrlPrefix}/blog-data/`);
  } catch (error) {
    console.error('❌ [STATIC] Failed to generate static blog data:', error);
    throw error;
  }
}

module.exports = {
  syncNotionPosts,
  fetchBlocksWithChildren,
  fetchPublishedPages
};
