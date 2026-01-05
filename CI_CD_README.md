# CI/CD Setup Complete ✅

This document provides an overview of the CI/CD setup for the landing page and client application.

## What Was Set Up

### 1. GitHub Actions Workflows

Four GitHub Actions workflows have been created:

#### CI Workflows (Continuous Integration)
- **`.github/workflows/landing-ci.yml`** - Builds and tests the landing page on PRs and pushes
- **`.github/workflows/client-ci.yml`** - Builds and tests the client app on PRs and pushes

#### CD Workflows (Continuous Deployment)
- **`.github/workflows/landing-cd.yml`** - Deploys the landing page on pushes to main
- **`.github/workflows/client-cd.yml`** - Deploys the client app on pushes to main

### 2. Cross-Platform Build Scripts

- **`client/scripts/copy-env.js`** - Cross-platform script to handle environment file copying
- Updated `client/package.json` to use the cross-platform script instead of Windows-specific `copy` commands
- Added `build:ci` script that works without environment file copying (uses GitHub Secrets directly)

### 3. Documentation

- **`.github/CI_CD_SETUP.md`** - Comprehensive guide for setting up and using CI/CD
- **`client/.env.example`** - Template for client environment variables
- **`landing/.env.example`** - Template for landing page environment variables (create manually if needed)

## Quick Start

### Step 1: Configure GitHub Secrets

Go to your GitHub repository → **Settings → Secrets and variables → Actions → New repository secret**

#### Landing Page Secrets (Required)
- `VITE_S3_BLOG_DATA_BASE` - S3 blog data base URL
- `VITE_SITE_URL` - Production site URL
- `VITE_USE_STATIC_BLOG_DATA` (Optional) - Default: `true`

#### Client Application Secrets (Required)
- `REACT_APP_API_URL` - API URL
- `REACT_APP_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `REACT_APP_GOOGLE_PLACES_API_KEY` - Google Places API key

#### Optional: Vercel Deployment Secrets
- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID for landing page
- `VERCEL_CLIENT_PROJECT_ID` - Vercel project ID for client app

### Step 2: Create `.env.example` Files (if needed)

#### Landing Page (landing/.env.example)

Create `landing/.env.example` with the following content:

```env
# Landing Page Environment Variables
# Copy this file to .env.local for local development
# For production, set these in your deployment platform (Vercel, Netlify, AWS Amplify, etc.)

# Site Configuration
VITE_SITE_URL=https://mrdemopro.com

# Blog Data Configuration
VITE_S3_BLOG_DATA_BASE=https://mr-demo-blog-bucket.s3.us-east-1.amazonaws.com/blog-data
VITE_USE_STATIC_BLOG_DATA=true

# API Configuration (Optional - if using API calls as fallback)
VITE_API_BASE_URL=https://your-api-url.com/api

# Analytics (Optional)
VITE_GA_ID=your-google-analytics-id
VITE_PLAUSIBLE_DOMAIN=your-domain.com
```

#### Client Application

The `client/.env.example` file has been created. See it for the template.

### Step 3: Test the Workflows

1. Create a test branch and make a small change to trigger CI
2. Create a pull request - CI workflows will run automatically
3. Merge to main - CD workflows will run automatically

## How It Works

### CI Workflows

- **Triggered by**: Pull requests and pushes to `main`/`develop` branches
- **Runs on**: Node.js 18.x and 20.x (matrix strategy)
- **Actions**:
  1. Checks out code
  2. Sets up Node.js
  3. Installs dependencies (`npm ci`)
  4. Runs linter
  5. Type checks (landing only)
  6. Builds the application
  7. Uploads build artifacts

### CD Workflows

- **Triggered by**: Pushes to `main` branch or manual workflow dispatch
- **Runs on**: Node.js 20.x
- **Actions**:
  1. Checks out code
  2. Sets up Node.js
  3. Installs dependencies
  4. Builds for production (with all optimizations)
  5. Optionally deploys to Vercel (if secrets are configured)
  6. Uploads build artifacts

## Workflow Features

- ✅ Path-based triggering (only runs when relevant files change)
- ✅ Matrix testing (multiple Node.js versions for CI)
- ✅ Caching (npm dependencies)
- ✅ Build artifacts (downloadable builds)
- ✅ Optional Vercel deployment
- ✅ Environment-specific configurations
- ✅ Manual workflow dispatch support

## Monitoring

- View workflow runs: **Actions** tab in GitHub
- Download build artifacts: Click on any workflow run → Artifacts
- View logs: Click on any workflow step to see detailed logs

## Next Steps

1. **Configure secrets** in GitHub repository settings
2. **Test workflows** by creating a pull request
3. **Optional**: Set up Vercel deployment by adding Vercel secrets
4. **Optional**: Configure deployment to other platforms (S3, Netlify, etc.)

## Documentation

For detailed information, see:
- **`.github/CI_CD_SETUP.md`** - Complete setup and troubleshooting guide

## Support

If you encounter issues:
1. Check workflow logs in the Actions tab
2. Verify all required secrets are set
3. Test builds locally: `npm run build`
4. Review `.github/CI_CD_SETUP.md` for troubleshooting tips
