# AWS Amplify Auto-Deployment Setup

This guide helps you set up automatic deployments to AWS Amplify from GitHub for the Vite + React landing app.

**Current app:** `d28gzr68fr7a30`  
**Default domain:** `https://main.d28gzr68fr7a30.amplifyapp.com`  
**Production canonicals:** `https://mrdemopro.com` (attach as custom domain when ready)

## Prerequisites

1. AWS Account with Amplify access
2. GitHub repository with your code pushed
3. Opinly API key + CDN namespace (see [BLOG_UPDATE_GUIDE.md](./BLOG_UPDATE_GUIDE.md))
4. Environment variables ready

## Step 1: Connect GitHub Repository

1. **Go to AWS Amplify Console**
   - Navigate to: https://console.aws.amazon.com/amplify/
   - Click **"New app"** → **"Host web app"**

2. **Select GitHub**
   - Choose **"GitHub"** as your repository source
   - Click **"Continue"**

3. **Authorize GitHub**
   - Click **"Authorize AWS Amplify"**
   - Sign in to GitHub if prompted
   - Grant AWS Amplify access to your repositories

4. **Select Repository**
   - Select your repository: `DemoPro` (or your repo name)
   - Select the branch: `main` (or `master`)
   - Click **"Next"**

## Step 2: Configure Build Settings

Amplify should auto-detect the configuration from `amplify.yml`, but verify these settings:

1. **App name**: `mr-demo-pro-landing` (or your preferred name)

2. **Build settings**:
   - **Root directory**: `/landing`
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **Build image**: `Amazon Linux 2023` (or Amazon Linux 2)

3. **Advanced settings** → **Build image settings**:
   - Node.js version: **`20.x`** (required — `@opinly/*` needs Node ≥ 20.19)

## Step 3: Configure Environment Variables

In Amplify Console, go to **App settings** → **Environment variables** and add:

### Required Variables

```env
# Opinly blog sync (build-time only — do NOT use VITE_ prefix for the API key)
OPINLY_API_KEY=sk-your-opinly-api-key
OPINLY_CDN_NAMESPACE=your-21-char-cdn-namespace
# Optional override:
# OPINLY_IMAGES_PREFIX=https://cdn.opinly.ai/your-21-char-cdn-namespace

# Site Configuration (public canonical origin)
VITE_SITE_URL=https://mrdemopro.com

# Google Places — property address autocomplete on quote forms
VITE_GOOGLE_PLACES_API_KEY=your-google-places-api-key
```

### Optional Variables

```env
# Prefer static /blog-data written during sync:opinly (default true)
VITE_USE_STATIC_BLOG_DATA=true

# Legacy API fallback only
VITE_API_BASE_URL=https://your-api-url.com/api

# Analytics (if using)
VITE_GA_ID=your-google-analytics-id
VITE_PLAUSIBLE_DOMAIN=your-domain.com
```

**Note**:
- `OPINLY_API_KEY` is used only by Node during `npm run sync:opinly` / `npm run build`
- Variables starting with `VITE_` are exposed to the frontend bundle
- Never commit sensitive values — use Amplify's environment variables UI

## Step 4: Rewrites and redirects (required for prerender)

See [AMPLIFY_SPA_ROUTING.md](./AMPLIFY_SPA_ROUTING.md) and [AMPLIFY_REDIRECT_QUICK_SETUP.md](./AMPLIFY_REDIRECT_QUICK_SETUP.md).

Use a **404-200** SPA fallback (`/<*>` → `/index.html`) so prerendered `dist/<path>/index.html` files are served when present. Do **not** use a catch-all `200` rewrite that always forces the root `index.html` (that breaks per-route canonicals).

Keep trailing-slash **301** rules ordered **before** the fallback.

## Step 5: Review and Deploy

1. **Review settings**
   - Double-check all configuration
   - Ensure `amplify.yml` is in the `landing/` directory

2. **Save and deploy**
   - Click **"Save and deploy"**
   - Amplify will:
     - Clone your repository
     - Install dependencies (`npm ci`)
     - Run the build process (includes Opinly sync)
     - Deploy to a unique URL

3. **First deployment**
   - First build may take 5-10 minutes
   - Watch the build logs for `Syncing blog posts from Opinly...`
   - If you still see Amplify's "Welcome" placeholder, the first deploy has not succeeded yet

## Step 6: Custom Domain

1. **Add custom domain**
   - Go to **App settings** → **Domain management**
   - Click **"Add domain"**
   - Enter your domain: `mrdemopro.com`
   - Follow DNS configuration instructions

2. **SSL Certificate**
   - Amplify automatically provisions SSL certificates
   - Usually takes a few minutes to provision

Canonical tags in the app already point at `https://mrdemopro.com`, so attaching the custom domain does not require a code change.

## Step 7: Branch-Based Deployments (Optional)

Amplify can automatically create preview deployments for pull requests:

1. **Enable branch deployments**
   - Go to **App settings** → **Branch management**
   - Enable **"Automatically deploy branches"**
   - Configure which branches to auto-deploy

2. **Preview deployments**
   - Each PR gets its own preview URL
   - Share preview links with team for testing

## Build Process Overview

Your `amplify.yml` runs this build process:

1. **preBuild phase**:
   - Run `npm ci --legacy-peer-deps`
   - Install Playwright Chromium

2. **build phase** (`npm run build`):
   - `sync:opinly` — fetch Opinly posts → `public/blog-data/`
   - `generate:seo` — sitemap, robots.txt
   - `seo:fix` — SEO fixes
   - `tsc -b` — TypeScript compilation
   - `vite build` — production bundle
   - `postbuild:prerender` — Playwright static HTML per route
   - `validate:prerender` — verify meta tags / body content
   - `seo:validate` / `audit:http`

3. **Artifacts**:
   - Output directory: `dist`
   - All files in `dist/` are deployed to CDN

## Troubleshooting

### Build Fails

**Common issues:**

1. **Node.js version mismatch**
   - Solution: Set build image Node to **20.x**

2. **Missing `OPINLY_API_KEY`**
   - Amplify sets `AWS_BRANCH`, so sync fails hard without the key
   - Add `OPINLY_API_KEY` (and CDN namespace) in Environment variables, then redeploy

3. **Missing dependencies**
   - Ensure `npm ci --legacy-peer-deps` completes (see `amplify.yml`)

4. **Build command errors**
   - Check Amplify build logs
   - Test locally: `cd landing && npm ci --legacy-peer-deps && npm run build`

5. **Memory/timeout issues**
   - Increase build timeout; Playwright prerender needs Chromium

### Environment Variables Not Working

- `OPINLY_*` vars do **not** need a `VITE_` prefix
- Frontend vars must start with `VITE_`
- Redeploy after adding new variables

### Welcome page still showing

- Confirm a successful build completed and artifacts include `dist/index.html`
- Confirm Amplify **Root directory** is `landing`

## Manual zip deploy (optional)

See root [`amplify-deploy.config.example.json`](../amplify-deploy.config.example.json) (`appId: d28gzr68fr7a30`) and `scripts/deploy-to-amplify.ps1`.

## Resources

- [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
- [Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Build Settings Reference](https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html)
- [BLOG_UPDATE_GUIDE.md](./BLOG_UPDATE_GUIDE.md)
