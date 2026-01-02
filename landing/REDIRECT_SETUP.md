# 301 Redirect Setup: /blog → blog.mrdemopro.com

This document explains how the 301 redirect from `/blog` to `blog.mrdemopro.com` is configured.

## Redirect Methods

Multiple redirect methods have been set up to ensure compatibility across different hosting platforms:

### 1. Netlify (_redirects file)
**File:** `landing/public/_redirects`

If you're hosting on Netlify, this file will automatically handle the redirect:
```
/blog/*  https://blog.mrdemopro.com/:splat  301
/blog    https://blog.mrdemopro.com/        301
```

### 2. Vercel (vercel.json)
**File:** `landing/vercel.json`

If you're hosting on Vercel, this configuration file handles the redirect:
```json
{
  "redirects": [
    {
      "source": "/blog",
      "destination": "https://blog.mrdemopro.com/",
      "permanent": true
    },
    {
      "source": "/blog/:path*",
      "destination": "https://blog.mrdemopro.com/:path*",
      "permanent": true
    }
  ]
}
```

### 3. Apache (.htaccess)
**File:** `landing/public/.htaccess`

If you're using Apache web server, this file handles the redirect:
```apache
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/blog(/.*)?$
RewriteRule ^blog(/.*)?$ https://blog.mrdemopro.com%1 [R=301,L]
</IfModule>
```

### 4. React Router (Client-side fallback)
**File:** `landing/src/App.tsx`

A client-side redirect component has been added as a fallback. This is not a true 301 redirect but will work if server-side redirects fail.

## How It Works

1. **Server-side redirects** (methods 1-3) are checked first and return proper 301 HTTP status codes
2. **Client-side redirect** (method 4) is a fallback that runs if the user reaches the React app

## Testing the Redirect

After deployment, test the redirect:

```bash
# Test with curl (should show 301 status)
curl -I https://mrdemopro.com/blog

# Should return:
# HTTP/1.1 301 Moved Permanently
# Location: https://blog.mrdemopro.com/
```

## Build Process

The redirect files are automatically copied to the `dist` directory during build:
- `_redirects` (for Netlify)
- `.htaccess` (for Apache)
- `vercel.json` (for Vercel - stays in root)

## Notes

- **301 redirects** are permanent and tell search engines to update their indexes
- The redirect preserves any path after `/blog` (e.g., `/blog/post-1` → `blog.mrdemopro.com/post-1`)
- Only one redirect method will be active depending on your hosting platform
- Make sure your hosting platform supports the redirect method you're using

