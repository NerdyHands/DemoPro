# AWS Amplify Auto-Deployment Setup

This guide will help you set up automatic deployments to AWS Amplify from GitHub.

## Prerequisites

1. AWS Account with Amplify access
2. GitHub repository with your code pushed
3. AWS S3 bucket configured (already done)
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
   - **Build image**: `Amazon Linux 2` (default)

3. **Advanced settings** → **Build image settings**:
   - Version: `Amazon Linux 2`
   - Node.js version: `18.x` or `20.x` (recommended)

## Step 3: Configure Environment Variables

In Amplify Console, go to **App settings** → **Environment variables** and add:

### Required Variables

```env
# Blog Data Configuration
VITE_S3_BLOG_DATA_BASE=https://mr-demo-blog-bucket.s3.us-east-1.amazonaws.com/blog-data
VITE_USE_STATIC_BLOG_DATA=true

# API Configuration (if using API calls as fallback)
VITE_API_BASE_URL=https://your-api-url.com/api

# Site Configuration
VITE_SITE_URL=https://mrdemopro.com
```

### Optional Variables

```env
# Analytics (if using)
VITE_GA_ID=your-google-analytics-id
VITE_PLAUSIBLE_DOMAIN=your-domain.com
```

**Note**: 
- For each environment (main, develop, etc.), you can set different values
- Variables starting with `VITE_` are exposed to the frontend build
- Never commit sensitive values - use Amplify's environment variables UI

## Step 4: Review and Deploy

1. **Review settings**
   - Double-check all configuration
   - Ensure `amplify.yml` is in the `landing/` directory

2. **Save and deploy**
   - Click **"Save and deploy"**
   - Amplify will:
     - Clone your repository
     - Install dependencies (`npm ci`)
     - Run the build process
     - Deploy to a unique URL

3. **First deployment**
   - First build may take 5-10 minutes
   - Watch the build logs in real-time
   - If build fails, check logs and fix issues

## Step 5: Custom Domain (Optional)

1. **Add custom domain**
   - Go to **App settings** → **Domain management**
   - Click **"Add domain"**
   - Enter your domain: `mrdemopro.com`
   - Follow DNS configuration instructions

2. **SSL Certificate**
   - Amplify automatically provisions SSL certificates
   - Usually takes a few minutes to provision

## Step 6: Branch-Based Deployments (Optional)

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
   - Navigate to `landing/` directory
   - Run `npm ci` (clean install)

2. **build phase**:
   - `npm run build` - This runs the full build pipeline:
     - `generate:seo` - Generate sitemap, robots.txt
     - `seo:fix` - Fix SEO issues  
     - `tsc -b` - TypeScript compilation
     - `vite build` - Vite build
     - `postbuild:snap` - React snap pre-rendering
     - `seo:validate` - Validate SEO
     - `audit:http` - HTTP status checks

3. **Artifacts**:
   - Output directory: `dist`
   - All files in `dist/` are deployed to CDN

## Troubleshooting

### Build Fails

**Common issues:**

1. **Node.js version mismatch**
   - Solution: Update build image to Node 18.x or 20.x in build settings

2. **Missing dependencies**
   - Solution: Ensure `package.json` has all required dependencies
   - Check that `npm ci` completes successfully

3. **Build command errors**
   - Solution: Check build logs in Amplify Console
   - Test build locally: `cd landing && npm ci && npm run build`
   - If root directory is `/landing`, Amplify will automatically cd into it

4. **Memory/timeout issues**
   - Solution: Increase build timeout in build settings
   - Optimize build process if needed

### Environment Variables Not Working

- Ensure variables start with `VITE_` to be exposed to frontend
- Restart build after adding new variables
- Check browser console for undefined values

### S3 CORS Errors

- Verify S3 bucket CORS configuration (see `server/S3_CORS_SETUP.md`)
- Check that `VITE_S3_BLOG_DATA_BASE` is correct
- Ensure bucket policy allows public read

## Automatic Deployments

Once set up, deployments happen automatically:

- **Main branch**: Deploys to production URL
- **Other branches**: Creates preview deployments (if enabled)
- **Pull requests**: Creates unique preview URL for testing

## Monitoring

- **Build logs**: View in Amplify Console → Build history
- **Access logs**: Monitor requests and errors
- **Performance**: View Core Web Vitals and performance metrics

## Updating Build Configuration

To update build settings:

1. Edit `amplify.yml` in your repository
2. Commit and push changes
3. Amplify automatically detects changes and redeploys

## Cost

AWS Amplify hosting:
- **Free tier**: 5 GB storage, 15 GB served per month
- **After free tier**: Pay per GB served
- Very affordable for most static sites

## Next Steps

1. ✅ Set up Amplify app and connect GitHub
2. ✅ Configure environment variables
3. ✅ Deploy first build
4. ✅ Test the deployed site
5. ✅ Set up custom domain (optional)
6. ✅ Configure branch deployments (optional)

## Resources

- [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
- [Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Build Settings Reference](https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html)
