# Blog Transfer Kit (Notion → Blog)

This folder contains everything needed to re-use the Notion-powered blog system across apps. Copy the pieces into your target projects (`server`, `landing`, etc.) and wire them up using the steps below.

## Contents
- `server/` – Notion sync, Mongo models, blog API routes, analytics events, S3 image/static exports.
- `landing/` – Blog API client, list/post pages, basic styling, SEO helper.

## Server setup
1) Copy the files under `blog-transfer/server/` into your server codebase, keeping the same paths.
2) Install deps (already present in this repo, but required in other apps):
   - `@notionhq/client`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `axios`
   - `mongoose`, `express`, `node-cron` (or your scheduler), `dotenv`
3) Environment variables (minimum):
   - `NOTION_API_KEY`
   - `NOTION_POSTS_DB_ID` (Notion database for posts)
   - Optional: `NOTION_TAGS_DB_ID`, `NOTION_AUTHORS_DB_ID` (if using relations for tags/authors)
   - `MONGODB_URI`
   - `SITE_URL` (e.g., `https://mrdemopro.com` used for structured data)
   - `AWS_S3_BUCKET_NAME`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` (for images + static JSON)
   - Optional: `AWS_S3_PUBLIC_URL` / `AWS_S3_BUCKET_URL` if you need a custom CDN/base URL
   - `ENABLE_NOTION_SYNC_CRON=true` (default) to keep posts synced
4) Wire routes in your Express app:
   ```js
   const blogRoutes = require('./src/routes/blogRoutes');
   const blogAnalyticsRoutes = require('./src/routes/blogAnalyticsRoutes');
   app.use('/api/blog', blogRoutes);
   app.use('/api/blog/events', blogAnalyticsRoutes);
   ```
5) Schedule Notion sync (example with `node-cron`):
   ```js
   const cron = require('node-cron');
   const { syncNotionPosts } = require('./src/notion/notionService');
   const { validateEnv } = require('./src/config/validateEnv');

   cron.schedule('*/15 * * * *', async () => {
     const env = validateEnv({ requireNotion: false, requireMongo: false });
     if (!env.notionApiKey || !env.notionDatabaseId) return;
     await syncNotionPosts({
       notionApiKey: env.notionApiKey,
       databaseId: env.notionDatabaseId,
       tagsDatabaseId: env.notionTagsDatabaseId,
       authorsDatabaseId: env.notionAuthorsDatabaseId
     });
   });
   ```
6) Static JSON export: `generateStaticBlogData()` (called after sync when changes detected) writes:
   - `blog-data/posts.json` (index)
   - `blog-data/{slug}.json` (post w/ related)
   - `blog-data/tags.json`
   Ensure your S3 bucket policy/CORS allow public read (see existing `server/S3_SETUP.md` & `S3_CORS_SETUP.md`).

## Landing/client setup
1) Copy files under `blog-transfer/landing/` into your front-end (paths can stay the same).
2) Ensure dependencies: `react-router-dom`, `react-helmet-async`.
3) Add routes to your router:
   - `/blog` → `Blog`
   - `/blog/tag/:tag` → `BlogTag`
   - `/blog/:slug` → `BlogPost`
4) Env for Vite:
   - `VITE_USE_STATIC_BLOG_DATA=true` (default) to read from S3 JSON
   - `VITE_S3_BLOG_DATA_BASE=https://<your-bucket>/blog-data`
   - `VITE_API_BASE_URL=<server-api-base>` (used as fallback if static fails)
5) Optional local fallback: place generated JSON in `public/blog-data/` for dev/offline.
6) Hook navigation: add a “Blog” link in your header to `/blog`.

## How the pipeline works
1) Cron (or manual call) runs `syncNotionPosts()`:
   - Pulls published pages from Notion, renders blocks to HTML, slugs/tags/authors, reading time.
   - Uploads images to S3 (if configured) via `BlogImageService`; otherwise keeps Notion URLs.
   - Upserts Mongo `posts` collection and deletes orphaned posts.
2) If changes occurred, `generateStaticBlogData()` uploads JSON to `blog-data/` in S3.
3) Front-end reads static JSON from S3; falls back to `/api/blog` if unavailable.
4) Analytics events (`/api/blog/events`) record page views, scroll depth, etc.

## Quick start checklist
- Notion DB ready with properties: Publish (checkbox), Post Title, Slug, Date, Cover, Description, Meta Title/Description, Featured, Tags (multi-select or relation), Authors (multi-select/relation/people).
- AWS bucket created with `blog-images/*` and `blog-data/*` allowed.
- Env vars set (see above).
- Server running with blog routes + cron.
- Landing app built with the blog routes enabled.

