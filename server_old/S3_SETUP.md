# S3 Setup for Blog Images

## Overview

Blog images come from the **Notion Posts Database** (`NOTION_POSTS_DB_ID`). Images are stored in two places:

1. **Cover Images**: From the `Cover` property or `page.cover` in Notion
2. **Content Images**: From image blocks within the post content

## AWS S3 Requirements

To set up S3 for hosting blog images, you need:

### 1. AWS Account
- Create an AWS account if you don't have one
- Access the AWS Console: https://console.aws.amazon.com

### 2. S3 Bucket
- Create an S3 bucket (e.g., `mrdemopro-blog-images`)
- Choose a region (e.g., `us-east-1`)
- Enable public access for the bucket (or configure CloudFront/CDN later)

### 3. IAM User & Credentials
Create an IAM user with S3 permissions:

1. Go to IAM → Users → Create User
2. Enable "Programmatic access"
3. Attach policy: `AmazonS3FullAccess` (or create custom policy with minimal permissions)
4. Save the **Access Key ID** and **Secret Access Key**

### 4. Bucket Configuration

#### Enable Public Access (Option 1 - Simple)
1. Go to your S3 bucket → Permissions
2. Uncheck "Block all public access"
3. Add bucket policy for both blog images and blog data:
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

#### Configure CORS (Required for Blog Data)
1. Go to your S3 bucket → Permissions → Cross-origin resource sharing (CORS)
2. Add the following CORS configuration:
```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "HEAD"
    ],
    "AllowedOrigins": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Type",
      "Content-Length"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

**Note:** For production, replace `"AllowedOrigins": ["*"]` with your specific domain(s):
```json
"AllowedOrigins": [
  "https://mrdemopro.com",
  "https://www.mrdemopro.com"
]
```

#### Or Use CloudFront CDN (Option 2 - Recommended for Production)
- Create CloudFront distribution pointing to your S3 bucket
- Use CloudFront URL as `AWS_S3_PUBLIC_URL`
- Better performance and caching

### 5. Environment Variables

Add to your `.env.development` and `.env.production`:

```env
# AWS S3 Configuration for Blog Images
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET_NAME=mrdemopro-blog-images
AWS_S3_PUBLIC_URL=https://your-bucket.s3.us-east-1.amazonaws.com
# Or if using CloudFront:
# AWS_S3_PUBLIC_URL=https://d1234abcd.cloudfront.net
```

## How It Works

1. **During Sync**:
   - Downloads images from Notion URLs
   - Uploads to S3 at `blog-images/{post-slug}/{filename}`
   - Replaces Notion URLs with S3 URLs in HTML
   - Stores S3 URLs in MongoDB

2. **Image Organization**:
   - Cover images: `blog-images/{slug}/cover.jpg`
   - Content images: `blog-images/{slug}/image-0.jpg`, `image-1.jpg`, etc.

3. **Caching**:
   - Images are cached by hash to avoid re-uploading duplicates
   - Cache stored at: `blog-images/{slug}/.cache/{hash}`

## Testing

After setup, run the sync:
```bash
cd server
node scripts/syncNotionPosts.js
```

You should see logs like:
```
📥 [BLOG IMAGES] Downloading image 1 for "my-post"...
📤 [BLOG IMAGES] Uploading to S3: blog-images/my-post/image-0.jpg...
✅ [BLOG IMAGES] Image uploaded: https://...
```

## Cost Considerations

- S3 storage: ~$0.023 per GB/month
- Data transfer out: First 1GB free, then ~$0.09 per GB
- Requests: First 20,000 PUT requests free/month

For a blog with 100 posts and ~5 images each (500 images at ~200KB each = 100MB):
- Storage: ~$0.002/month
- Transfer: Minimal (CDN cached)
- Very low cost for most blogs
