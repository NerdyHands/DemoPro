# AWS Amplify SPA Routing Configuration

This document explains how to configure AWS Amplify to properly serve a React SPA (Single Page Application), ensuring that routes like `/services/` return the correct content instead of 404 errors.

## Problem

When Googlebot (or any crawler) requests a URL like `https://mrdemopro.com/services/`, AWS Amplify returns a 404 error because:
- React Router routes are client-side only and need `index.html` to bootstrap
- Amplify needs to be told to serve `index.html` for all routes that don't match actual files

## Solution: Configure Redirects in Amplify Console

**Important:** AWS Amplify requires redirects to be configured in the Amplify Console. The `_redirects` file alone is not sufficient - you must configure redirects in the console.

## Step-by-Step Configuration

### 1. Access AWS Amplify Console

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your app (e.g., `mr-demo-pro-landing`)
3. Click on your app to open it

### 2. Navigate to Rewrites and Redirects

1. In the left sidebar, click **"Rewrites and redirects"** (under "App settings")
2. You'll see a list of existing redirect rules (if any)

### 3. Add SPA Rewrite Rule

1. Click **"Add rewrite/redirect"** or **"Create rule"**
2. Configure the rule as follows:

   **Source address:**
   ```
   </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|eot)$)([^.]+$)/>
   ```
   
   Or use the simpler pattern:
   ```
   </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|eot|map|json|xml|webp)$)([^.]+$)/>
   ```
   
   This pattern matches:
   - All paths that don't contain a dot (e.g., `/services/`)
   - Paths with extensions that aren't static assets
   
   **Target address:**
   ```
   /index.html
   ```
   
   **Type:**
   - Select **"Rewrite (200)"** (NOT "Redirect (301)" or "Redirect (302)")
   
   **Country code:** (leave empty)

3. Click **"Save"**

### Alternative: Simpler Pattern (Recommended)

If the regex above is too complex, use this simpler approach:

1. Click **"Add rewrite/redirect"**
2. Configure:
   
   **Source address:**
   ```
   </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|eot|map|json|xml|webp)$)([^.]+$)/>
   ```
   
   **Target address:**
   ```
   /index.html
   ```
   
   **Type:**
   - **"Rewrite (200)"**
   
3. Click **"Save"**

### 4. Verify Rule Order

**Important:** Redirect/rewrite rules are processed in order. Make sure:
- Specific redirects (like `/blog` → external URL) come **before** the SPA rewrite rule
- The SPA rewrite rule (`/*` → `/index.html`) should be **last** (or near the end)

If you have other redirects, you can reorder them by dragging or using the up/down arrows.

## How It Works

1. When a request comes in for `/services/`, Amplify checks redirect/rewrite rules in order
2. The regex pattern matches paths that don't look like static assets
3. Amplify serves `/index.html` with a 200 status code (rewrite, not redirect)
4. React Router loads and handles the routing client-side
5. The correct page content is displayed

## JSON Configuration (Alternative Method)

You can also configure redirects using JSON in the Amplify Console:

1. Go to **"Rewrites and redirects"**
2. Click **"Edit"** or look for a JSON editor option
3. Add this rule:

```json
[
  {
    "source": "</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|eot|map|json|xml|webp)$)([^.]+$)/>",
    "target": "/index.html",
    "status": "200",
    "condition": null
  }
]
```

## _redirects File (For Reference)

The `_redirects` file in `landing/public/_redirects` contains:
- SPA routing rule: `/*    /index.html   200` (for local development/testing)
- No blog redirects (blog is served directly from `/blog` route using S3 data)

**Note:** The `_redirects` file is kept for:
- Local development/testing
- Documentation purposes
- Potential future use if Amplify adds support

However, **the Amplify Console configuration is what actually controls routing in production.**

## How It Works

1. When a request comes in for `/services/`, Amplify checks if a file exists at that path
2. If no file exists, it matches the `/*` rule
3. Amplify serves `/index.html` with a 200 status code
4. React Router loads and handles the routing client-side
5. The correct page content is displayed

## File Location

The `_redirects` file is located at:
- **Source:** `landing/public/_redirects`
- **Built:** `landing/dist/_redirects` (automatically copied during build)

## Verification

After deployment, test your URLs:

```bash
# Test with curl (should return 200, not 404)
curl -I https://mrdemopro.com/services/

# Should return:
# HTTP/2 200
# ...
```

## Important Notes

1. **Console Configuration Required:** AWS Amplify requires redirects to be configured in the Amplify Console - the `_redirects` file alone is not sufficient
2. **Trailing Slashes:** The React Router now handles both `/services` and `/services/` routes, ensuring compatibility with how Googlebot and other crawlers request URLs
3. **react-snap:** The build process uses `react-snap` to pre-render static HTML files, which helps with SEO and initial load times
4. **Rule Order Matters:** More specific rules should come before the catch-all SPA rewrite rule
5. **Use Rewrite (200), Not Redirect:** Using a rewrite with 200 status ensures proper SEO and prevents redirect loops

## Troubleshooting

### Still Getting 404s?

1. **Check Console Configuration:** Verify the rewrite rule exists in Amplify Console → Rewrites and redirects
2. **Verify Rule Type:** Ensure it's set to **"Rewrite (200)"** not "Redirect (301/302)"
3. **Check Rule Order:** Make sure the SPA rewrite rule is not being overridden by other rules
4. **Test Pattern:** Try a simpler pattern first: `</^[^.]+$/>` to match all non-file paths
5. **Redeploy:** After adding/updating rules, wait for deployment to complete
6. **Clear Cache:** Test in incognito mode or clear browser cache
7. **Check Build Logs:** Verify the build completed successfully in Amplify Console

### Common Issues

**Issue: "Access Denied" errors**
- Solution: Check that `baseDirectory` in `amplify.yml` matches your actual build output directory (`dist`)

**Issue: Redirect loops**
- Solution: Ensure you're using "Rewrite (200)" not "Redirect (301/302)"

**Issue: Static assets not loading**
- Solution: The regex pattern should exclude static file extensions. Verify the pattern includes all your asset extensions

**Issue: Specific routes not working**
- Solution: Check rule order - more specific rules should come before the catch-all SPA rule

## Additional Redirect Rules

If you need to add other redirects (e.g., redirecting old URLs to new ones), add them in the Amplify Console **before** the SPA rewrite rule:

1. Go to **Rewrites and redirects** in Amplify Console
2. Add specific redirects first (e.g., `/old-page` → `/new-page`)
3. Add the SPA rewrite rule last

**Example rule order:**
1. `/old-page` → `/new-page` (Redirect 301) - **First** (if you have specific redirects)
2. `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|eot|map|json|xml|webp)$)([^.]+$)/>` → `/index.html` (Rewrite 200) - **Last**

**Important:** Rules are processed in order, and the first match wins. The SPA rewrite rule should be **last** so it only catches routes that don't match specific redirects or static files.

**Note:** The blog is served directly from `/blog` as part of the React app (data comes from S3). No redirect is needed for the blog.

## References

- [AWS Amplify Redirects Documentation](https://docs.aws.amazon.com/amplify/latest/userguide/redirects.html)
- [Netlify Redirects (same format)](https://docs.netlify.com/routing/redirects/)
