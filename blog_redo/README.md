# Blog System - Complete Transfer Guide

This folder contains all the files and instructions needed to transfer the Notion-powered blog system to another website.

## 📁 Folder Structure

```
blog_redo/
├── frontend/              # React/TypeScript frontend files
│   └── src/
│       ├── api/
│       │   └── blog.ts           # Blog API client (fetches from S3/API)
│       ├── pages/
│       │   ├── Blog.tsx          # Blog listing page
│       │   ├── BlogPost.tsx      # Individual blog post page
│       │   ├── BlogTag.tsx       # Tag filtering wrapper
│       │   └── Blog.css          # Blog styles
│       └── components/
│           └── SEO.tsx           # SEO component (required)
│
├── backend/               # Node.js/Express backend files
│   └── src/
│       ├── routes/
│       │   ├── blogRoutes.js           # Blog API endpoints
│       │   └── blogAnalyticsRoutes.js  # Analytics tracking
│       ├── notion/
│       │   ├── notionClient.js         # Notion API client
│       │   ├── notionService.js        # Main sync service
│       │   └── blockRenderer.js        # Notion blocks → HTML
│       ├── repos/
│       │   ├── postsRepo.js            # MongoDB post queries
│       │   └── blogEventsRepo.js       # Analytics event storage
│       ├── models/
│       │   ├── Post.js                 # Post MongoDB schema
│       │   └── BlogEvent.js            # BlogEvent MongoDB schema
│       └── config/
│           └── validateEnv.js         # Environment validation
│   ├── services/
│   │   ├── blogImageService.js         # Image processing (S3 upload)
│   │   └── s3Service.js                # AWS S3 service
│   └── scripts/
│       └── syncNotionPosts.js          # Manual sync script
│
└── README.md             # This file
```

## 🚀 Quick Start

### 1. Frontend Setup

#### Copy Files
Copy all files from `blog_redo/frontend/` to your React app:

```bash
# Copy API client
cp -r blog_redo/frontend/src/api/blog.ts your-app/src/api/

# Copy pages
cp -r blog_redo/frontend/src/pages/Blog*.{tsx,css} your-app/src/pages/

# Copy SEO component (if you don't have it)
cp blog_redo/frontend/src/components/SEO.tsx your-app/src/components/
```

#### Add Routes
In your `App.tsx` or router file, add these routes:

```tsx
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import BlogTag from './pages/BlogTag';

// Add these routes:
<Route path="/blog" element={<Blog />} />
<Route path="/blog/tag/:tag" element={<BlogTag />} />
<Route path="/blog/:slug" element={<BlogPost />} />
```

#### Install Dependencies
```bash
npm install react-helmet-async  # For SEO component
```

#### Environment Variables (Frontend)
Add to your `.env` or `.env.production`:

```env
# Blog Configuration
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_USE_STATIC_BLOG_DATA=true
VITE_S3_BLOG_DATA_BASE=https://your-bucket.s3.region.amazonaws.com/blog-data
```

### 2. Backend Setup

#### Copy Files
Copy all files from `blog_redo/backend/` to your Express server:

```bash
# Copy routes
cp -r blog_redo/backend/src/routes/*.js your-server/src/routes/

# Copy Notion service
cp -r blog_redo/backend/src/notion/*.js your-server/src/notion/

# Copy repositories
cp -r blog_redo/backend/src/repos/*.js your-server/src/repos/

# Copy models
cp -r blog_redo/backend/src/models/*.js your-server/src/models/

# Copy config
cp -r blog_redo/backend/src/config/*.js your-server/src/config/

# Copy services
cp -r blog_redo/backend/services/*.js your-server/services/

# Copy scripts
cp -r blog_redo/backend/scripts/*.js your-server/scripts/
```

#### Register Routes
In your main `server.js` or `app.js`:

```javascript
const blogRoutes = require('./src/routes/blogRoutes');
const blogAnalyticsRoutes = require('./src/routes/blogAnalyticsRoutes');

// Register routes
app.use('/api/blog', blogRoutes);
app.use('/api/blog/events', blogAnalyticsRoutes);
```

#### Install Dependencies
```bash
npm install @notionhq/client @aws-sdk/client-s3 @aws-sdk/s3-request-presigner axios mongoose dotenv node-cron
```

#### Environment Variables (Backend)
Add to your `.env` or `.env.production`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Notion API
NOTION_API_KEY=secret_xxxxxxxxxxxxx
NOTION_POSTS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_TAGS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Optional
NOTION_AUTHORS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Optional

# AWS S3 (Optional - images use Notion URLs if not set)
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-blog-bucket
AWS_S3_PUBLIC_URL=https://your-bucket.s3.us-east-1.amazonaws.com

# Site Configuration
SITE_URL=https://yourdomain.com

# Cron Job (Optional - auto-sync every 15 minutes)
ENABLE_NOTION_SYNC_CRON=true
```

### 3. Notion Database Setup

#### Required Properties in Notion Posts Database

Your Notion database must have these properties:

| Property Name | Type | Required | Description |
|--------------|------|----------|-------------|
| `Post Title` | Title | ✅ Yes | The blog post title |
| `Slug` | Text | ✅ Yes | URL-friendly slug (auto-generated from title if empty) |
| `Publish` | Checkbox | ✅ Yes | Must be checked for post to appear |
| `Date` | Date | ❌ No | Publication date (defaults to created date) |
| `Description` | Text | ❌ No | Excerpt (auto-generated from content if empty) |
| `Tags` | Multi-select or Relation | ❌ No | Post tags |
| `Authors` | Multi-select, Relation, or People | ❌ No | Post authors |
| `Featured` | Checkbox | ❌ No | Feature this post |
| `Meta Title` | Text | ❌ No | SEO title (defaults to Post Title) |
| `Meta Description` | Text | ❌ No | SEO description (defaults to Description) |
| `Canonical URL` | Text | ❌ No | Canonical URL for SEO |
| `Cover` | Files | ❌ No | Cover image |

#### Optional: Tags Database
If using Relations for tags, create a Tags database with:
- `Name` or `Title` property (Text/Title)

#### Optional: Authors Database
If using Relations for authors, create an Authors database with:
- `Name` or `Title` property (Text/Title)

### 4. MongoDB Setup

The system uses two MongoDB collections:

#### Posts Collection
Stores blog posts synced from Notion. The schema is defined in `backend/src/models/Post.js`.

#### Blog Events Collection
Stores analytics events (page views, scroll depth, etc.). The schema is defined in `backend/src/models/BlogEvent.js`.

### 5. AWS S3 Setup (Optional but Recommended)

#### Why S3?
- Notion image URLs expire after ~1 hour
- S3 provides permanent, fast image hosting
- Better performance and caching

#### Setup Steps

1. **Create S3 Bucket**
   - Go to AWS S3 Console
   - Create bucket (e.g., `your-blog-bucket`)
   - Choose region (e.g., `us-east-1`)

2. **Configure Bucket Policy**
   - Go to Permissions → Bucket Policy
   - Add this policy (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadBlogImages",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/blog-images/*"
    },
    {
      "Sid": "PublicReadBlogData",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/blog-data/*"
    }
  ]
}
```

3. **Configure CORS**
   - Go to Permissions → CORS
   - Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": [
      "https://yourdomain.com",
      "https://www.yourdomain.com",
      "http://localhost:5173",
      "http://localhost:3000"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Type",
      "Content-Length",
      "Last-Modified"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

4. **Create IAM User**
   - Go to IAM → Users → Create User
   - Enable "Programmatic access"
   - Attach policy: `AmazonS3FullAccess` (or create custom policy)
   - Save Access Key ID and Secret Access Key

5. **Add to Environment Variables**
   ```env
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_S3_REGION=us-east-1
   AWS_S3_BUCKET_NAME=your-blog-bucket
   AWS_S3_PUBLIC_URL=https://your-blog-bucket.s3.us-east-1.amazonaws.com
   ```

### 6. Run Initial Sync

```bash
cd your-server
node scripts/syncNotionPosts.js
```

This will:
- Connect to Notion
- Fetch all published posts
- Process images (upload to S3 if configured)
- Store posts in MongoDB
- Generate static JSON files in S3

### 7. Set Up Auto-Sync (Optional)

The system can auto-sync every 15 minutes. Add this to your server startup:

```javascript
// In server.js, after MongoDB connection
if (process.env.ENABLE_NOTION_SYNC_CRON !== 'false') {
  const cron = require('node-cron');
  const { syncNotionPosts } = require('./src/notion/notionService');
  
  cron.schedule('*/15 * * * *', async () => {
    // Sync logic (see server.js for full implementation)
  });
}
```

## 📋 Complete Environment Variables Checklist

### Frontend (.env)
- [ ] `VITE_API_BASE_URL`
- [ ] `VITE_USE_STATIC_BLOG_DATA` (default: `true`)
- [ ] `VITE_S3_BLOG_DATA_BASE`

### Backend (.env)
- [ ] `MONGODB_URI`
- [ ] `NOTION_API_KEY`
- [ ] `NOTION_POSTS_DB_ID`
- [ ] `NOTION_TAGS_DB_ID` (optional)
- [ ] `NOTION_AUTHORS_DB_ID` (optional)
- [ ] `SITE_URL`
- [ ] `AWS_ACCESS_KEY_ID` (optional)
- [ ] `AWS_SECRET_ACCESS_KEY` (optional)
- [ ] `AWS_S3_REGION` (optional)
- [ ] `AWS_S3_BUCKET_NAME` (optional)
- [ ] `AWS_S3_PUBLIC_URL` (optional)
- [ ] `ENABLE_NOTION_SYNC_CRON` (optional, default: `true`)

## 🔧 How It Works

### Data Flow

1. **Notion → Server**: 
   - Server syncs posts from Notion database
   - Processes images (uploads to S3)
   - Stores in MongoDB

2. **Server → S3**:
   - Generates static JSON files (`posts.json`, `{slug}.json`)
   - Uploads to S3 for fast frontend access

3. **Frontend → S3/API**:
   - Frontend tries S3 first (fast, static)
   - Falls back to API if S3 unavailable

### Features

- ✅ **Static Generation**: Blog data served from S3 (no API calls needed)
- ✅ **Image Processing**: Automatic S3 upload for permanent image hosting
- ✅ **SEO Optimized**: Structured data, meta tags, canonical URLs
- ✅ **Analytics**: Page views, scroll depth tracking
- ✅ **Related Posts**: Automatic related post suggestions
- ✅ **Tag Filtering**: Filter posts by tags
- ✅ **Featured Posts**: Highlight important posts
- ✅ **Reading Time**: Auto-calculated reading time

## 🐛 Troubleshooting

### CORS Errors
- Check S3 CORS configuration
- Verify bucket policy allows public read
- Test S3 URL directly in browser

### Images Not Loading
- Check AWS credentials
- Verify S3 bucket policy
- Check image URLs in MongoDB

### Posts Not Syncing
- Verify Notion API key
- Check database ID is correct
- Ensure "Publish" checkbox is checked
- Check server logs for errors

### Static Files Not Generated
- Verify S3 credentials
- Check S3 bucket exists
- Verify bucket policy allows uploads

## 📝 Notes

- **Notion Image URLs**: Expire after ~1 hour. S3 upload is recommended.
- **Sync Frequency**: Default is every 15 minutes. Adjust in cron schedule.
- **Static Files**: Regenerated only when posts change (updated/deleted).
- **Fallback**: Frontend falls back to API if S3 is unavailable.

## 🔗 Additional Resources

- [Notion API Documentation](https://developers.notion.com/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [MongoDB Documentation](https://docs.mongodb.com/)

---

**Ready to transfer?** Follow the steps above in order, and your blog system will be up and running!
