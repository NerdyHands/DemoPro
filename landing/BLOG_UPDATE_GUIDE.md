# Blog Update Guide

This guide explains how to publish and update blog posts on [mrdemopro.com/blog](https://mrdemopro.com/blog) using **Opinly** (replacing the former Notion → S3 pipeline).

## How It Works

```
Opinly (CMS)  →  sync:opinly (build)  →  public/blog-data/*.json  →  landing SPA (/blog)
```

1. **Write content in Opinly** — posts live in the Opinly dashboard.
2. **Deploy / rebuild the landing app** — `npm run sync:opinly` (part of `npm run build`) pulls published posts via `@opinly/backend`, renders HTML with `@opinly/shared`, and writes `public/blog-data/`.
3. **Site reads static JSON** — the SPA fetches `/blog-data/posts.json` and `/blog-data/{slug}.json` at runtime. No Notion sync or S3 bucket is required.

| Route | Purpose |
|-------|---------|
| `/blog/` | Post listing |
| `/blog/:slug/` | Individual post |
| `/blog/tag/:tag/` | Posts filtered by Opinly tag/category name |

Canonical URLs remain on **`https://mrdemopro.com`** even when Amplify hosts the app at `*.amplifyapp.com`.

---

## Updating a Post (Typical Workflow)

### 1. Edit in Opinly

1. Sign in at [opinly.ai](https://opinly.ai).
2. Create or edit a post in the Content dashboard.
3. Publish the post (only published posts are returned by the SDK).

### 2. Rebuild / redeploy

Content is baked in at **build time**. After publishing in Opinly:

```bash
cd landing
npm run sync:opinly   # optional: refresh blog-data locally
npm run build         # includes sync:opinly automatically
```

On AWS Amplify, push to the connected branch (or trigger a redeploy). Amplify must have `OPINLY_API_KEY` set so the sync can run during `npm run build`.

### 3. Verify on the site

- Open `https://mrdemopro.com/blog/` (or the Amplify preview URL).
- Open the post at `https://mrdemopro.com/blog/{slug}/`.
- Confirm `public/blog-data/posts.json` (or the deployed `/blog-data/posts.json`) lists the post.

The sitemap picks up new posts during the same build (`generate:sitemap` reads local `posts.json` after sync).

---

## Credentials & Environment Variables

Store secrets in `landing/.env` (gitignored) for local builds, and in **Amplify Console → Environment variables** for production. Never commit real keys. Use [`landing/.env.example`](.env.example) as the template.

### Opinly (required for sync)

| Variable | Description | How to obtain |
|----------|-------------|---------------|
| `OPINLY_API_KEY` | Server/build API key (`sk-…`) | Opinly → Settings → Developers → Create API key |
| `OPINLY_CDN_NAMESPACE` | CDN namespace for images | Same Developers page |
| `OPINLY_IMAGES_PREFIX` | Optional full prefix override | e.g. `https://cdn.opinly.ai/<namespace>` |

**Important:** Do **not** prefix the API key with `VITE_`. It must stay build-only so it is never shipped to the browser.

### Landing / Amplify

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SITE_URL` | Public site origin for SEO | `https://mrdemopro.com` |
| `VITE_USE_STATIC_BLOG_DATA` | Prefer `/blog-data` (default `true`) | `true` |
| `VITE_API_BASE_URL` | Optional legacy API fallback | `https://your-api-url.com/api` |
| `REQUIRE_OPINLY_SYNC` | Force sync failure without key (local/CI) | `true` |

Amplify Hosting sets `AWS_BRANCH` / `AWS_APP_ID`, which makes `sync:opinly` **fail the build** if `OPINLY_API_KEY` is missing. Locally, a missing key keeps existing `public/blog-data` files.

---

## Legacy Notion / S3 pipeline (deprecated)

The previous flow (`server/scripts/syncNotionPosts.js` → MongoDB + S3) is **deprecated** for the landing site. The Express `/api/blog` routes remain as an optional fallback only. Notion sync cron is **off by default** (`ENABLE_NOTION_SYNC_CRON` must be explicitly set to `true` to enable).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Amplify Welcome page | No successful deploy yet | Fix build logs; confirm root dir `landing`, artifact `dist` |
| Empty `/blog/` | Sync skipped or failed | Set `OPINLY_API_KEY` in Amplify; check build logs for `Syncing blog posts from Opinly` |
| Images broken | Wrong CDN prefix | Set `OPINLY_CDN_NAMESPACE` or `OPINLY_IMAGES_PREFIX` |
| Local sync skipped | No `.env` | Copy `.env.example` → `.env` and fill keys |
| Build fails: Node engine | `@opinly/*` needs Node ≥ 20.19 | Use Node 20+ in Amplify / CI |

### Manual sync

```bash
cd landing
npm run sync:opinly
```
