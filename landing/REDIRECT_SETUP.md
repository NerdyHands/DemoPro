# Blog Configuration

## Current Setup

The blog is **served directly** from the React app at `/blog`, not redirected to an external domain.

### Blog Routes

- `/blog` - Blog listing page
- `/blog/:slug` - Individual blog post pages
- `/blog/tag/:tag` - Blog posts filtered by tag

### Data Source

Blog data is served from **AWS S3**:
- Blog posts and metadata are stored in S3
- The React app fetches data from S3 and renders it
- No external redirects are needed

### Configuration

The blog is configured as a standard React Router route in `src/App.tsx`:
- No redirects configured
- Blog pages are part of the main SPA
- Data fetching handled by `src/pages/Blog.tsx`, `BlogPost.tsx`, and `BlogTag.tsx`

## SPA Routing

Since the blog is part of the React app, it benefits from the SPA routing configuration:
- See `AMPLIFY_SPA_ROUTING.md` for SPA routing setup
- The `/blog` routes are handled by the same rewrite rules as other routes

## Historical Note

Previously, the blog was redirected to `blog.mrdemopro.com`. This is no longer the case - the blog is now integrated into the main site and served from S3.
