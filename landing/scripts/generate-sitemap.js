#!/usr/bin/env node

/**
 * Sitemap Generator for Mr Demo Pro
 * Builds sitemap as: base URLs (from public/sitemap.xml or routes) + blog post URLs from S3 (posts.json).
 * Preserves manual sitemap structure, updates dates, then appends blog pages from S3.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRoutesWithMetadata } from './parse-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'https://mrdemopro.com';
const S3_BLOG_DATA_BASE = process.env.VITE_S3_BLOG_DATA_BASE || 'https://mr-demo-blog-bucket.s3.us-east-1.amazonaws.com/blog-data';
const OUTPUT_FILE = path.join(__dirname, '../public/sitemap.xml');
const DIST_OUTPUT_FILE = path.join(__dirname, '../dist/sitemap.xml');

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Update dates in existing sitemap while preserving structure
 */
function updateSitemapDates(sitemapContent) {
  const today = getTodayDate();
  // Replace all lastmod dates with today's date
  // Matches: <lastmod>YYYY-MM-DD</lastmod>
  const updatedContent = sitemapContent.replace(
    /<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g,
    `<lastmod>${today}</lastmod>`
  );
  return updatedContent;
}

/**
 * Fetch list of published posts from S3 (posts.json). Returns [] on failure.
 */
async function fetchBlogPostsFromS3() {
  const url = `${S3_BLOG_DATA_BASE}/posts.json`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.posts) ? data.posts : [];
  } catch (err) {
    console.warn(`⚠️  Could not fetch blog posts from S3 (${url}):`, err?.message || err);
    return [];
  }
}

/**
 * Format date for sitemap lastmod (YYYY-MM-DD)
 */
function toLastmod(dateStr) {
  if (!dateStr) return getTodayDate();
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return getTodayDate();
  return d.toISOString().slice(0, 10);
}

/**
 * Build sitemap <url> entries for blog posts (to inject before </urlset>)
 */
function buildBlogUrlEntries(posts) {
  const today = getTodayDate();
  return posts
    .filter((p) => p?.slug)
    .map(
      (p) =>
        `  <url>
    <loc>${BASE_URL}/blog/${encodeURIComponent(p.slug)}/</loc>
    <lastmod>${toLastmod(p.updatedAt || p.publishedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('\n');
}

/**
 * Remove any existing blog post <url> blocks from sitemap content so we don't duplicate
 * when injecting from S3. Keeps the /blog/ index entry; removes only /blog/slug/ entries.
 */
function stripExistingBlogPostUrls(sitemapContent) {
  // Remove <url>...</url> blocks whose <loc> is a blog post (e.g. .../blog/slug/) not the blog index (.../blog/)
  const blogPostUrlBlock = /  <url>\s*\n\s*<loc>https:\/\/mrdemopro\.com\/blog\/[^/]+\/<\/loc>[\s\S]*?  <\/url>\s*\n/g;
  return sitemapContent.replace(blogPostUrlBlock, '');
}

/**
 * Inject blog post URLs into base sitemap content (before </urlset>).
 * If no posts, returns content unchanged.
 */
function injectBlogUrlsIntoSitemap(baseContent, blogUrlEntries) {
  if (!blogUrlEntries || !blogUrlEntries.trim()) return baseContent;
  const closingTag = '</urlset>';
  if (!baseContent.includes(closingTag)) return baseContent;
  return baseContent.replace(closingTag, `${blogUrlEntries}\n${closingTag}`);
}

/**
 * Generate XML sitemap content (auto-generation fallback)
 */
function generateSitemapAuto() {
  // Get routes from App.tsx automatically (fresh each time)
  const routes = getRoutesWithMetadata();
  
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  routes.forEach(route => {
    const normalizedPath = route.path === '/' ? '/' : (route.path.endsWith('/') ? route.path : `${route.path}/`);
    sitemap += '  <url>\n';
    sitemap += `    <loc>${BASE_URL}${normalizedPath}</loc>\n`;
    sitemap += `    <lastmod>${route.lastmod}</lastmod>\n`;
    sitemap += `    <changefreq>${route.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${route.priority}</priority>\n`;
    sitemap += '  </url>\n';
  });
  
  sitemap += '</urlset>\n';
  
  return sitemap;
}

/**
 * Validate sitemap includes all routes
 */
function validateSitemapCompleteness(sitemapContent) {
  try {
    const routes = getRoutesWithMetadata();
    const sitemapUrls = (sitemapContent.match(/<loc>(.*?)<\/loc>/g) || [])
      .map(match => match.replace(/<\/?loc>/g, ''))
      .map(url => url.replace(BASE_URL, ''))
      .map(path => path === '/' ? '/' : (path.endsWith('/') ? path : `${path}/`));
    
    const routePaths = routes.map(r => {
      const normalizedPath = r.path === '/' ? '/' : (r.path.endsWith('/') ? r.path : `${r.path}/`);
      return normalizedPath;
    });
    
    const missingRoutes = routePaths.filter(routePath => {
      // Skip dynamic routes and catch-all
      if (routePath.includes(':') || routePath === '*') return false;
      return !sitemapUrls.includes(routePath);
    });
    
    if (missingRoutes.length > 0) {
      console.warn(`⚠️  Warning: Sitemap may be missing ${missingRoutes.length} route(s):`);
      missingRoutes.forEach(route => console.warn(`   - ${route}`));
    } else {
      console.log(`✅ Sitemap validation: All ${routes.length} routes found in sitemap`);
    }
    
    return missingRoutes.length === 0;
  } catch (error) {
    console.warn(`⚠️  Could not validate sitemap completeness: ${error.message}`);
    return true; // Don't fail if validation can't run
  }
}

/**
 * Generate or update sitemap: base URLs (manual or from routes) + blog post URLs from S3
 */
async function generateSitemap() {
  let baseContent;

  // 1. Base sitemap: use manual file if present, else generate from routes
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const existingContent = fs.readFileSync(OUTPUT_FILE, 'utf8');
      if (existingContent.includes('<?xml') && existingContent.includes('<urlset')) {
        console.log('📝 Found manual sitemap, updating dates...');
        baseContent = updateSitemapDates(existingContent);
        validateSitemapCompleteness(baseContent);
      } else {
        throw new Error('Invalid sitemap structure');
      }
    } catch (error) {
      console.warn(`⚠️  Error reading manual sitemap: ${error.message}`);
      console.log('🔄 Falling back to auto-generation from routes...');
      baseContent = generateSitemapAuto();
      validateSitemapCompleteness(baseContent);
    }
  } else {
    console.log('🔄 No manual sitemap found, generating from routes...');
    baseContent = generateSitemapAuto();
    validateSitemapCompleteness(baseContent);
  }

  // 2. Strip any existing blog post URLs from base (avoids duplicates when re-running)
  baseContent = stripExistingBlogPostUrls(baseContent);

  // 3. Fetch blog posts from S3 and append their URLs (single source of truth)
  console.log('📡 Fetching blog posts from S3...');
  const posts = await fetchBlogPostsFromS3();
  const blogEntries = buildBlogUrlEntries(posts);
  if (posts.length > 0) {
    console.log(`   Added ${posts.length} blog post URL(s) from S3`);
    baseContent = injectBlogUrlsIntoSitemap(baseContent, blogEntries);
  } else {
    console.log('   No blog posts from S3 (or fetch failed); sitemap has base URLs only.');
  }

  return baseContent;
}

/**
 * Write sitemap to file
 */
function writeSitemap(content, filePath) {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Sitemap written to: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error writing sitemap to ${filePath}:`, error.message);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Processing sitemap for Mr Demo Pro...');
  console.log('   Base URLs from public/sitemap.xml, then blog pages from S3 (posts.json).');

  const sitemapContent = await generateSitemap();

  // Write to public directory (for development)
  writeSitemap(sitemapContent, OUTPUT_FILE);

  // Write to dist directory (for production)
  writeSitemap(sitemapContent, DIST_OUTPUT_FILE);

  const urlCount = (sitemapContent.match(/<url>/g) || []).length;
  console.log('✅ Sitemap processing completed!');
  console.log(`📊 Total URLs: ${urlCount}`);
}

// Run when executed directly (node scripts/generate-sitemap.js)
const entry = fileURLToPath(import.meta.url);
const runDirect = process.argv[1] && path.resolve(process.cwd(), process.argv[1]) === entry;
if (runDirect) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { generateSitemap };
export default main;
