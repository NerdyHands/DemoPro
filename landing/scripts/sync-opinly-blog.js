#!/usr/bin/env node

/**
 * Build-time Opinly → public/blog-data sync.
 * Keeps OPINLY_API_KEY server/build-only (never VITE_*).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createOpinlyClient } from '@opinly/backend';
import {
  buildBlogPostingJsonLd,
  calculateReadingTime,
  imageUrl,
  renderToHtml,
} from '@opinly/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'blog-data');
const SITE_URL = process.env.VITE_SITE_URL || 'https://mrdemopro.com';
const SITE_NAME = 'Mr Demo Pro';

function loadEnvFile() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function requireOpinlySync() {
  return Boolean(
    process.env.AWS_BRANCH ||
      process.env.AWS_APP_ID ||
      process.env.REQUIRE_OPINLY_SYNC === 'true'
  );
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function resolveImagesPrefix() {
  const raw = (process.env.OPINLY_IMAGES_PREFIX || '').trim().replace(/\/$/, '');
  if (raw) return raw;
  const ns = (process.env.OPINLY_CDN_NAMESPACE || '').trim();
  if (ns) return `https://cdn.opinly.ai/${ns}`;
  return 'https://cdn.opinly.ai';
}

function coverFromPost(post, config) {
  const fileKey =
    post.titleFile?.fileKey ||
    post.image?.fileKey ||
    null;
  if (!fileKey) return '';
  try {
    return imageUrl(fileKey, config) || '';
  } catch {
    return `${config.imagesPrefix}/${fileKey}`;
  }
}

function tagNamesFromPost(post) {
  const names = new Set();
  if (post.category?.name) names.add(post.category.name);
  if (post.category?.slug) names.add(post.category.slug);
  for (const tag of post.tags || []) {
    if (tag?.name) names.add(tag.name);
    else if (tag?.slug) names.add(tag.slug);
  }
  return Array.from(names);
}

function toSummary(post, config) {
  const reading =
    typeof calculateReadingTime === 'function' && post.content
      ? calculateReadingTime(post.content)
      : undefined;

  return {
    title: post.title || '',
    slug: post.slug || '',
    excerpt: post.description || post.metaDescription || '',
    coverUrl: coverFromPost(post, config),
    publishedAt: post.firstPublishedAt || post.lastPublishedAt || undefined,
    tags: tagNamesFromPost(post),
    authors: post.author?.name ? [post.author.name] : [],
    featured: false,
    readingTime: typeof reading === 'number' ? reading : undefined,
    updatedAt: post.modifiedAt || post.lastPublishedAt || undefined,
  };
}

function toDetail(post, config, relatedSummaries) {
  const summary = toSummary(post, config);
  let contentHtml = '';
  if (post.content) {
    contentHtml = renderToHtml(post.content, { config }) || '';
  }

  const canonicalUrl = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}/`;
  let structuredData;
  try {
    structuredData = buildBlogPostingJsonLd(post, {
      ...config,
      siteUrl: SITE_URL,
      siteName: SITE_NAME,
      blogPrefix: '/blog',
    });
  } catch {
    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: summary.title,
      description: summary.excerpt,
      url: canonicalUrl,
      mainEntityOfPage: canonicalUrl,
      image: summary.coverUrl || undefined,
      datePublished: summary.publishedAt,
      dateModified: summary.updatedAt || summary.publishedAt,
    };
  }

  return {
    ...summary,
    metaTitle: post.metaTitle || summary.title,
    metaDescription: post.metaDescription || summary.excerpt,
    canonicalUrl,
    contentHtml,
    contentJson: post.content || null,
    updatedAt: summary.updatedAt,
    syncedAt: new Date().toISOString(),
    structuredData,
    related: { posts: relatedSummaries },
  };
}

async function fetchAllPosts(opinly) {
  const all = [];
  let cursor;
  do {
    const page = await opinly.posts({
      limit: 50,
      cursor,
      sort: 'newest',
    });
    const batch = Array.isArray(page?.data) ? page.data : [];
    all.push(...batch);
    cursor = page?.has_more ? page.next_cursor || undefined : undefined;
  } while (cursor);
  return all;
}

function relatedFor(slug, summaries) {
  const current = summaries.find((p) => p.slug === slug);
  if (!current) return [];
  const currentTags = new Set(current.tags || []);
  return summaries
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      post: p,
      score: (p.tags || []).filter((t) => currentTags.has(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (b.post.publishedAt || '').localeCompare(a.post.publishedAt || ''))
    .slice(0, 3)
    .map((x) => x.post);
}

function clearGeneratedSlugFiles(keepSlugs) {
  if (!fs.existsSync(OUT_DIR)) return;
  for (const name of fs.readdirSync(OUT_DIR)) {
    if (!name.endsWith('.json')) continue;
    if (name === 'posts.json' || name === 'tags.json') continue;
    const slug = name.replace(/\.json$/, '');
    if (!keepSlugs.has(slug)) {
      fs.unlinkSync(path.join(OUT_DIR, name));
    }
  }
}

async function main() {
  loadEnvFile();

  const apiKey = (process.env.OPINLY_API_KEY || '').trim();
  if (!apiKey) {
    if (requireOpinlySync()) {
      console.error('❌ OPINLY_API_KEY is required for Amplify/CI Opinly sync.');
      process.exit(1);
    }
    console.warn('⚠️  OPINLY_API_KEY not set; keeping existing public/blog-data.');
    process.exit(0);
  }

  const imagesPrefix = resolveImagesPrefix();
  const config = {
    imagesPrefix,
    siteUrl: SITE_URL,
    blogPrefix: '/blog',
    siteName: SITE_NAME,
    tagPrefix: 'tag',
  };

  console.log('🚀 Syncing blog posts from Opinly...');
  console.log(`   imagesPrefix: ${imagesPrefix}`);

  const opinly = createOpinlyClient({ apiKey });
  const listPosts = await fetchAllPosts(opinly);
  console.log(`   Listed ${listPosts.length} published post(s)`);

  const fullPosts = [];
  for (const item of listPosts) {
    if (!item?.slug) continue;
    const full = await opinly.post(item.slug);
    if (!full) {
      console.warn(`⚠️  Skipping missing full post: ${item.slug}`);
      continue;
    }
    fullPosts.push(full);
  }

  ensureDir(OUT_DIR);

  const summaries = fullPosts.map((p) => toSummary(p, config));
  writeJson(path.join(OUT_DIR, 'posts.json'), { posts: summaries });

  const keepSlugs = new Set(summaries.map((p) => p.slug));
  clearGeneratedSlugFiles(keepSlugs);

  for (const post of fullPosts) {
    const related = relatedFor(post.slug, summaries);
    const detail = toDetail(post, config, related);
    writeJson(path.join(OUT_DIR, `${post.slug}.json`), detail);
  }

  let tags = [];
  try {
    const tagSummaries = await opinly.tags();
    tags = (tagSummaries || []).map((t) => ({
      name: t.name,
      slug: t.slug,
      description: t.description || '',
      postCount: t.postCount ?? 0,
    }));
  } catch (err) {
    console.warn('⚠️  Could not fetch Opinly tags:', err?.message || err);
    const fromPosts = new Map();
    for (const p of summaries) {
      for (const name of p.tags || []) {
        fromPosts.set(name, (fromPosts.get(name) || 0) + 1);
      }
    }
    tags = Array.from(fromPosts.entries()).map(([name, postCount]) => ({
      name,
      slug: name,
      description: '',
      postCount,
    }));
  }

  try {
    const categories = await opinly.categories();
    for (const cat of categories || []) {
      if (!cat?.name) continue;
      if (!tags.some((t) => t.name === cat.name || t.slug === cat.slug)) {
        tags.push({
          name: cat.name,
          slug: cat.slug,
          description: cat.description || '',
          postCount: Array.isArray(cat.posts) ? cat.posts.length : 0,
        });
      }
    }
  } catch {
    // optional
  }

  writeJson(path.join(OUT_DIR, 'tags.json'), { tags });

  console.log(`✅ Wrote ${summaries.length} post(s) + ${tags.length} tag(s) to public/blog-data/`);
}

const entry = fileURLToPath(import.meta.url);
const runDirect = process.argv[1] && path.resolve(process.cwd(), process.argv[1]) === entry;
if (runDirect) {
  main().catch((err) => {
    console.error('❌ Opinly blog sync failed:', err?.message || err);
    if (err?.cause) {
      console.error('   cause:', err.cause?.message || err.cause);
    }
    if (String(err?.cause?.code || err?.code || '').includes('UNABLE_TO_VERIFY') ||
        String(err?.message || '').includes('certificate')) {
      console.error('   Tip: local TLS interception can block sdk.opinly.ai. Amplify/CI builds usually succeed.');
      console.error('   For a one-off local sync you may set NODE_TLS_REJECT_UNAUTHORIZED=0 (dev only).');
    }
    process.exit(1);
  });
}

export { main as syncOpinlyBlog };
export default main;
