#!/usr/bin/env node
/**
 * One-shot restore: pull published Opinly posts into landing/public/blog-data.
 * Uses work/ node_modules for @opinly/* (not added to landing Amplify build).
 */
import fs from 'fs';
import path from 'path';
import {createRequire} from 'module';
import {fileURLToPath, pathToFileURL} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LANDING_ROOT = path.join(__dirname, '..');
const REPO_ROOT = path.join(LANDING_ROOT, '..');
const WORK_ROOT = path.join(REPO_ROOT, 'work');
const OUT_DIR = path.join(LANDING_ROOT, 'public', 'blog-data');
const SITE_URL = 'https://mrdemopro.com';
const SITE_NAME = 'Mr Demo Pro';

const TARGET_SLUGS = new Set([
  'concrete-driveway-cost',
  'mr-demolition',
  'concrete-demo-and-removal',
  'shed-demo',
  'cost-to-demo-a-house',
  'junk-furniture-removal',
  'bulk-trash-pickup',
  'haul-away-junk-removal',
  'residential-junk-removal'
]);

function loadEnvFile(envPath) {
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
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.join(LANDING_ROOT, '.env'));
loadEnvFile(path.join(WORK_ROOT, '.env.local'));

const requireFromWork = createRequire(path.join(WORK_ROOT, 'package.json'));
const {createOpinlyClient} = requireFromWork('@opinly/backend');
const shared = requireFromWork('@opinly/shared');
const {
  buildBlogPostingJsonLd,
  calculateReadingTime,
  imageUrl,
  renderToHtml
} = shared;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
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
  const fileKey = post.titleFile?.fileKey || post.image?.fileKey || null;
  if (!fileKey) return '';
  try {
    return imageUrl(fileKey, config) || '';
  } catch {
    return '';
  }
}

async function fetchAllPosts(opinly) {
  const posts = [];
  let page = 1;
  for (;;) {
    const batch = await opinly.posts({page, limit: 50, status: 'published'});
    const list = batch?.data || batch?.posts || batch || [];
    if (!Array.isArray(list) || list.length === 0) break;
    posts.push(...list);
    if (list.length < 50) break;
    page += 1;
    if (page > 20) break;
  }
  return posts;
}

async function main() {
  const apiKey = (process.env.OPINLY_API_KEY || '').trim();
  if (!apiKey) {
    console.error('OPINLY_API_KEY missing (landing/.env)');
    process.exit(1);
  }

  const imagesPrefix = resolveImagesPrefix();
  const config = {imagesPrefix};
  const opinly = createOpinlyClient({apiKey});

  console.log('Fetching published posts from Opinly…');
  const listed = await fetchAllPosts(opinly);
  console.log(`Listed ${listed.length} published post(s)`);

  const bySlug = new Map();
  for (const item of listed) {
    const slug = (item.slug || '').trim();
    if (!slug) continue;
    bySlug.set(slug, item);
  }

  ensureDir(OUT_DIR);
  const summaries = [];
  const tagsSet = new Set();
  const restored = [];
  const missing = [];

  for (const slug of TARGET_SLUGS) {
    if (!bySlug.has(slug)) {
      missing.push(slug);
      continue;
    }
    const full = (await opinly.post(slug)) || bySlug.get(slug);
    const title = full.title || slug;
    const excerpt = full.description || full.metaDescription || '';
    const coverUrl = coverFromPost(full, config);
    const publishedAt =
      full.firstPublishedAt || full.lastPublishedAt || full.modifiedAt || '';
    const updatedAt =
      full.lastPublishedAt || full.modifiedAt || publishedAt || '';
    const tagNames = (full.tags || [])
      .map(t => t?.name || t?.slug)
      .filter(Boolean);
    tagNames.forEach(t => tagsSet.add(t));
    const authors = full.author?.name ? [full.author.name] : [];
    let contentHtml = '';
    try {
      contentHtml = full.content
        ? renderToHtml(full.content, {config}) || ''
        : '';
    } catch (err) {
      console.warn(`  warn renderToHtml(${slug}): ${err.message}`);
    }
    const readingTime =
      typeof calculateReadingTime === 'function' && full.content
        ? calculateReadingTime(full.content)
        : undefined;

    const canonicalUrl = `${SITE_URL}/blog/${encodeURIComponent(slug)}/`;
    let structuredData;
    try {
      structuredData = buildBlogPostingJsonLd
        ? buildBlogPostingJsonLd(full, {
            ...config,
            siteUrl: SITE_URL,
            siteName: SITE_NAME,
            canonicalUrl,
            coverUrl
          })
        : undefined;
    } catch {
      structuredData = undefined;
    }
    if (!structuredData) {
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description: full.metaDescription || excerpt,
        url: canonicalUrl,
        mainEntityOfPage: {'@type': 'WebPage', '@id': canonicalUrl},
        datePublished: publishedAt,
        dateModified: updatedAt,
        ...(coverUrl ? {image: [coverUrl]} : {}),
        ...(authors[0]
          ? {author: {'@type': 'Person', name: authors[0]}}
          : {}),
        ...(contentHtml ? {articleBody: contentHtml} : {})
      };
    }

    if (coverUrl && structuredData && !structuredData.image) {
      structuredData.image = [coverUrl];
    }
    if (structuredData && !structuredData.url) structuredData.url = canonicalUrl;

    const detail = {
      title,
      slug,
      excerpt,
      coverUrl,
      publishedAt,
      tags: tagNames,
      authors,
      featured: Boolean(full.featured),
      readingTime,
      updatedAt,
      metaTitle: full.metaTitle || title,
      metaDescription: full.metaDescription || excerpt,
      canonicalUrl,
      contentHtml,
      contentJson: full.content || null,
      syncedAt: new Date().toISOString(),
      structuredData,
      related: {posts: []}
    };

    writeJson(path.join(OUT_DIR, `${slug}.json`), detail);
    summaries.push({
      title,
      slug,
      excerpt,
      coverUrl,
      publishedAt,
      tags: tagNames,
      authors,
      featured: Boolean(full.featured),
      readingTime,
      updatedAt
    });
    restored.push(slug);
    console.log(`  restored ${slug}`);
  }

  // Keep any other already-synced posts that aren't in TARGET (none expected)
  const existingPostsFile = path.join(OUT_DIR, 'posts.json');
  if (fs.existsSync(existingPostsFile)) {
    try {
      const prev = JSON.parse(fs.readFileSync(existingPostsFile, 'utf8'));
      for (const p of prev.posts || []) {
        if (!summaries.some(s => s.slug === p.slug) && p.slug) {
          summaries.push(p);
        }
      }
    } catch {
      // ignore
    }
  }

  summaries.sort((a, b) =>
    String(b.publishedAt || '').localeCompare(String(a.publishedAt || ''))
  );
  writeJson(path.join(OUT_DIR, 'posts.json'), {posts: summaries});
  writeJson(path.join(OUT_DIR, 'tags.json'), {
    tags: Array.from(tagsSet).sort()
  });

  console.log(`\nRestored ${restored.length}: ${restored.join(', ') || '(none)'}`);
  if (missing.length) {
    console.warn(`Missing from Opinly (${missing.length}): ${missing.join(', ')}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
