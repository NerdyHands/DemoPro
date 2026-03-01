# CloudFront Error Page Configuration for SPA

> **Note:** If you're using **AWS Amplify**, see `AMPLIFY_SPA_ROUTING.md` instead. This document is for direct S3/CloudFront hosting.

This document explains how to configure AWS CloudFront to properly serve a React SPA (Single Page Application) hosted on S3, ensuring that routes like `/services/` return the correct content instead of 404 errors.

## Problem

When Googlebot (or any crawler) requests a URL like `https://mrdemopro.com/services/`, S3 returns a 404 error because:
- S3 doesn't support `.htaccess` files
- S3 doesn't automatically serve `index.html` for directory requests
- React Router routes are client-side only and need `index.html` to bootstrap

## Solution: CloudFront Custom Error Responses

Configure CloudFront to intercept 404 errors and return `index.html` with a 200 status code.

## Step-by-Step Configuration

### 1. Access CloudFront Console

1. Go to [AWS CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. Select your distribution (the one pointing to your S3 bucket)

### 2. Configure Custom Error Responses

1. Click on the **Error Pages** tab
2. Click **Create Custom Error Response**

### 3. Configure 404 Error Response

**Error Code:** `404: Not Found`

**Customize Error Response:** `Yes`

**Response Page Path:** `/index.html`

**HTTP Response Code:** `200: OK`

**Error Caching Minimum TTL:** `10` (seconds)

**Click:** `Create Custom Error Response`

### 4. Configure 403 Error Response (Optional but Recommended)

Some S3 configurations may return 403 for missing files. Configure this as well:

**Error Code:** `403: Forbidden`

**Customize Error Response:** `Yes`

**Response Page Path:** `/index.html`

**HTTP Response Code:** `200: OK`

**Error Caching Minimum TTL:** `10` (seconds)

**Click:** `Create Custom Error Response`

### 5. Invalidate CloudFront Cache

After making these changes:

1. Go to the **Invalidations** tab
2. Click **Create Invalidation**
3. Enter: `/*`
4. Click **Create Invalidation**

This ensures the new error page configuration is applied immediately.

## Alternative: Lambda@Edge Function (Advanced)

For more control, you can use a Lambda@Edge function to handle routing. This is more complex but offers more flexibility.

### Lambda@Edge Function Example

```javascript
'use strict';

exports.handler = (event, context, callback) => {
    const request = event.Records[0].cf.request;
    const uri = request.uri;
    
    // Check if the URI is a file (has extension)
    if (uri.includes('.')) {
        // Let the request pass through
        callback(null, request);
        return;
    }
    
    // For directory requests, serve index.html
    if (uri.endsWith('/')) {
        request.uri = uri + 'index.html';
    } else {
        // For non-directory requests without extension, try index.html
        request.uri = uri + '/index.html';
    }
    
    callback(null, request);
};
```

**Note:** Lambda@Edge functions must be deployed in `us-east-1` region and can add latency and cost.

## Verification

After configuration, test your URLs:

```bash
# Test with curl (should return 200, not 404)
curl -I https://mrdemopro.com/services/

# Should return:
# HTTP/2 200
# ...
```

## Important Notes

1. **Cache Invalidation:** After deploying new builds, invalidate CloudFront cache to ensure fresh content
2. **TTL Settings:** Keep error caching TTL low (10 seconds) to avoid serving stale error pages
3. **S3 Bucket Configuration:** Ensure your S3 bucket is configured for static website hosting (optional, but helpful for testing)
4. **react-snap:** The build process uses `react-snap` to pre-render static HTML files, which helps with SEO and initial load times
5. **Trailing Slashes:** The React Router now handles both `/services` and `/services/` routes, ensuring compatibility with how Googlebot and other crawlers request URLs
6. **react-snap File Structure:** `react-snap` generates flat HTML files (e.g., `services.html`) rather than directory structures (e.g., `services/index.html`). This is fine because CloudFront error pages will serve `index.html` for 404s, and React Router handles the routing client-side

## Troubleshooting

### Still Getting 404s?

1. **Check CloudFront Distribution Status:** Ensure it's deployed (not "In Progress")
2. **Verify Error Page Configuration:** Double-check that 404 → `/index.html` → 200 is configured
3. **Clear Browser Cache:** Test in incognito mode or clear cache
4. **Check S3 Bucket:** Ensure `index.html` exists in the root of your S3 bucket
5. **Verify react-snap Output:** Check that `dist/services/index.html` exists after build

### react-snap Not Generating Directory Structure?

If `react-snap` is not generating proper directory structures (e.g., `services/index.html`), you may need to:

1. Check `package.json` - ensure routes are in the `reactSnap.include` array
2. Verify `react-snap` completes successfully during build
3. Manually create directory structures if needed (though CloudFront error pages should handle this)

## Cost Considerations

- **CloudFront Error Pages:** Free (no additional cost)
- **Cache Invalidation:** First 1,000 paths/month are free, then $0.005 per path
- **Lambda@Edge:** Pay per request (only if using the advanced method)

## References

- [CloudFront Custom Error Responses](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/custom-error-pages.html)
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [Lambda@Edge Functions](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html)
