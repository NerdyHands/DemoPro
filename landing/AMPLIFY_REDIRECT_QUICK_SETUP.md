# AWS Amplify SPA Routing - Quick Setup Guide

## The Problem

A catch-all **Rewrite (200)** to `/index.html` makes every extensionless path serve the **homepage** HTML. That breaks prerendered per-route files (`dist/services/.../index.html`) and causes identical `canonical` / `og:url` on every URL.

## The Solution

1. Keep trailing-slash **301** rules first.
2. Use a **404-200** fallback so Amplify serves an existing artifact when present, and only rewrites unknown paths to `/index.html`.

## Quick Steps

### 1. Go to Amplify Console

1. Visit: https://console.aws.amazon.com/amplify/
2. Select app `d28gzr68fr7a30` (or your landing app)
3. Open **Hosting** → **Rewrites and redirects**

### 2. Preferred SPA fallback (404-200)

Click **Add rewrite/redirect** (or edit JSON) and configure:

**Source address:**
```
/<*>
```

**Target address:**
```
/index.html
```

**Type:**
- Select **404 (Rewrite)** / **404-200** (serve `/index.html` only when the requested path is missing)

Click **Save**. Place this rule **after** trailing-slash 301s and any specific redirects.

### 3. Remove the old catch-all 200 rewrite

If you still have a rule like:

```
</^[^.]+$|.../>  →  /index.html  (200 Rewrite)
```

**Delete or disable it.** That rule always rewrites to the root homepage HTML and undoes Playwright prerender SEO.

### 4. Verify

```bash
curl -s https://main.d28gzr68fr7a30.amplifyapp.com/services/shed-removal/ | findstr /i canonical
# or after custom domain:
curl -s https://mrdemopro.com/services/shed-removal/ | findstr /i canonical
```

Canonical should be the **route** URL (`.../services/shed-removal/`), not `https://mrdemopro.com/`.

## Trailing slash 301s (keep first)

Example (adjust to match your console rules):

```json
[
  {
    "source": "/<*>/",
    "status": "404-200",
    "target": "/index.html",
    "condition": null
  }
]
```

Use Amplify's UI for trailing-slash redirects as needed; order matters: **specific 301s → 404-200 fallback last**.

## Important Notes

- ✅ Prefer **404-200** so prerendered `*/index.html` files win
- ✅ Place the fallback **last**
- ❌ Do not use a blanket **200** rewrite to `/index.html` for all extensionless paths
- ❌ The `_redirects` file alone is not honored by Amplify Hosting

## Full Documentation

See `AMPLIFY_SPA_ROUTING.md` for details.
