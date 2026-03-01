# AWS Amplify SPA Routing - Quick Setup Guide

## The Problem
Routes like `/services/` return 404 errors because AWS Amplify doesn't know to serve `index.html` for client-side routes.

## The Solution
Configure a rewrite rule in the AWS Amplify Console.

## Quick Steps

### 1. Go to Amplify Console
1. Visit: https://console.aws.amazon.com/amplify/
2. Select your app
3. Click **"Rewrites and redirects"** (in left sidebar under "App settings")

### 2. Add Rewrite Rule
Click **"Add rewrite/redirect"** and configure:

**Source address:**
```
</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|eot|map|json|xml|webp)$)([^.]+$)/>
```

**Target address:**
```
/index.html
```

**Type:**
- Select **"Rewrite (200)"** ⚠️ (NOT Redirect!)

Click **"Save"**

### 3. Verify
After deployment completes, test:
```bash
curl -I https://mrdemopro.com/services/
```

Should return `HTTP/2 200` (not 404).

## Alternative: Simpler Pattern

If the regex above doesn't work, try this simpler pattern:

**Source address:**
```
</^[^.]+$/>
```

This matches any path without a dot (file extension), which covers most SPA routes.

## Important Notes

- ✅ Use **"Rewrite (200)"** not "Redirect (301/302)"
- ✅ Place this rule **last** in the list (after any specific redirects)
- ✅ Wait for deployment to complete after saving
- ❌ The `_redirects` file alone won't work - you must configure in console

## Troubleshooting

**Still getting 404?**
1. Verify rule is set to "Rewrite (200)"
2. Check rule is at the bottom of the list
3. Wait for deployment to finish
4. Clear browser cache and test again

**Static assets not loading?**
- The regex should exclude file extensions - verify it includes all your asset types

## Full Documentation

See `AMPLIFY_SPA_ROUTING.md` for detailed explanation and advanced configuration.
