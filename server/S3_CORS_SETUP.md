# S3 CORS Configuration for Blog Data

## Problem
When fetching blog JSON files from S3, you may encounter CORS errors:
```
Access to fetch at 'https://bucket.s3.region.amazonaws.com/blog-data/posts.json' 
from origin 'http://localhost:5173' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution: Configure CORS on S3 Bucket

### Steps:

1. **Go to AWS S3 Console**
   - Navigate to your bucket: `mr-demo-blog-bucket`

2. **Open CORS Configuration**
   - Click on the bucket name
   - Go to **Permissions** tab
   - Scroll down to **Cross-origin resource sharing (CORS)**
   - Click **Edit**

3. **Add CORS Configuration**
   Paste the following JSON configuration:

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
      "Content-Length",
      "Last-Modified"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

### For Production (Recommended)
Replace `"*"` in `AllowedOrigins` with your specific domains:

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
      "https://mrdemopro.com",
      "https://www.mrdemopro.com",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://localhost:3001"
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

### Also Ensure Bucket Policy Allows Public Read

Your bucket policy should include both `blog-images/*` and `blog-data/*`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadBlogImages",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mr-demo-blog-bucket/blog-images/*"
    },
    {
      "Sid": "PublicReadBlogData",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mr-demo-blog-bucket/blog-data/*"
    }
  ]
}
```

## Verify Configuration

After saving the CORS configuration, test by accessing a JSON file directly:
```
https://mr-demo-blog-bucket.s3.us-east-1.amazonaws.com/blog-data/posts.json
```

You should be able to access it from your browser and see the JSON data.

## Troubleshooting

- **403 Forbidden**: Check bucket policy allows public read for `blog-data/*`
- **CORS error**: Ensure CORS configuration is saved correctly in S3 bucket settings
- **Changes not taking effect**: S3 CORS changes are usually immediate, but may take a few seconds
