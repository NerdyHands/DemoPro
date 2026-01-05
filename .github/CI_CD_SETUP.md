# CI/CD Setup Guide

This guide explains the GitHub Actions CI/CD workflows for the landing page and client application.

## Overview

The repository includes separate CI/CD workflows for:
- **Landing Page** (`landing/`): Vite + React + TypeScript
- **Client Application** (`client/`): Create React App

## Workflows

### CI Workflows

#### `landing-ci.yml`
- **Triggers**: Pull requests and pushes to `main`/`develop` branches that modify `landing/`
- **Jobs**:
  - Runs on Node.js 18.x and 20.x
  - Installs dependencies
  - Runs linter
  - Type checks TypeScript code
  - Builds the application (without SEO steps for faster CI)
  - Uploads build artifacts

#### `client-ci.yml`
- **Triggers**: Pull requests and pushes to `main`/`develop` branches that modify `client/`
- **Jobs**:
  - Runs on Node.js 18.x and 20.x
  - Installs dependencies
  - Runs linter
  - Builds the application
  - Uploads build artifacts

### CD Workflows

#### `landing-cd.yml`
- **Triggers**: 
  - Pushes to `main` branch that modify `landing/`
  - Manual workflow dispatch
- **Jobs**:
  - Builds with full SEO pipeline
  - Optionally deploys to Vercel (if configured)
  - Uploads build artifacts

#### `client-cd.yml`
- **Triggers**:
  - Pushes to `main` branch that modify `client/`
  - Manual workflow dispatch
- **Jobs**:
  - Builds for production
  - Optionally deploys to Vercel (if configured)
  - Uploads build artifacts

## GitHub Secrets Configuration

To use these workflows, you need to configure the following secrets in your GitHub repository:

### Landing Page Secrets

Go to **Settings → Secrets and variables → Actions → New repository secret**

1. **VITE_S3_BLOG_DATA_BASE** (Required)
   - Your S3 blog data base URL
   - Example: `https://mr-demo-blog-bucket.s3.us-east-1.amazonaws.com/blog-data`

2. **VITE_SITE_URL** (Required)
   - Your production site URL
   - Example: `https://mrdemopro.com`

3. **VITE_USE_STATIC_BLOG_DATA** (Optional)
   - Default: `true`

4. **VITE_API_BASE_URL** (Optional)
   - API base URL if using API calls

5. **VITE_GA_ID** (Optional)
   - Google Analytics ID

6. **Vercel Deployment** (Optional)
   - `VERCEL_TOKEN`: Your Vercel token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID for landing page

### Client Application Secrets

1. **REACT_APP_API_URL** (Required)
   - Your API URL
   - Production: `https://picra-server-187337178119.us-east4.run.app`

2. **REACT_APP_GOOGLE_CLIENT_ID** (Required)
   - Google OAuth client ID

3. **REACT_APP_GOOGLE_PLACES_API_KEY** (Required)
   - Google Places API key

4. **REACT_APP_ANALYTICS_ENABLED** (Optional)
   - Default: `true` for production

5. **REACT_APP_GTM_ID** (Optional)
   - Google Tag Manager ID

6. **Vercel Deployment** (Optional)
   - `VERCEL_TOKEN`: Your Vercel token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_CLIENT_PROJECT_ID`: Your Vercel project ID for client app

## Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Add each secret with its corresponding name and value
5. Click **Add secret**

## Local Development

### Landing Page

1. Copy `.env.example` to `.env.local`:
   ```bash
   cd landing
   cp .env.example .env.local
   ```

2. Update `.env.local` with your local values

3. Run development server:
   ```bash
   npm run dev
   ```

### Client Application

1. Copy `.env.example` to `.env.development`:
   ```bash
   cd client
   cp .env.example .env.development
   ```

2. Update `.env.development` with your local values

3. Run development server:
   ```bash
   npm start
   ```

## Cross-Platform Environment Files

The client application now uses a cross-platform script (`client/scripts/copy-env.js`) instead of Windows-specific `copy` commands. This ensures builds work on all platforms (Windows, macOS, Linux).

For CI/CD, environment variables are set directly in the GitHub Actions workflows, so the copy script is only needed for local development.

## Deployment Options

### Option 1: Vercel (Recommended for Static Sites)

The workflows include optional Vercel deployment. To enable:

1. Install Vercel CLI: `npm i -g vercel`
2. Link your project: `vercel link`
3. Get your tokens from [Vercel Dashboard → Settings → Tokens](https://vercel.com/account/tokens)
4. Add the secrets to GitHub (see above)

### Option 2: Manual Deployment

The workflows upload build artifacts that can be downloaded and deployed manually:

1. Go to **Actions → [Workflow Run] → Artifacts**
2. Download the build artifact
3. Extract and deploy to your hosting platform

### Option 3: Other Platforms

You can modify the workflows to deploy to:
- AWS S3 + CloudFront
- Netlify
- GitHub Pages
- Firebase Hosting
- Any static hosting service

## Monitoring

- **Workflow Runs**: Go to **Actions** tab in GitHub to see all workflow runs
- **Build Logs**: Click on any workflow run to see detailed logs
- **Artifacts**: Download build artifacts from completed workflow runs

## Troubleshooting

### Build Failures

1. Check workflow logs in the **Actions** tab
2. Verify all required secrets are set
3. Test builds locally: `npm run build`
4. Check for dependency issues: `npm ci`

### Environment Variables Not Working

1. Verify secret names match exactly (case-sensitive)
2. Ensure secrets are set in the correct repository
3. For landing page, ensure variables start with `VITE_`
4. For client, ensure variables start with `REACT_APP_`

### Vercel Deployment Not Working

1. Verify all three Vercel secrets are set
2. Check Vercel project IDs are correct
3. Ensure Vercel token has proper permissions
4. Check Vercel dashboard for deployment status

## Best Practices

1. **Never commit `.env` files** - Use `.env.example` as a template
2. **Use GitHub Secrets** - Store sensitive values as secrets, not in code
3. **Test locally first** - Run builds locally before pushing
4. **Review workflow changes** - Test workflow changes in a branch first
5. **Monitor deployments** - Check deployment URLs after successful builds
