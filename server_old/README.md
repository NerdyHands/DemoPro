# Mr Demo Pro Server

A Node.js/Express server for the Mr Demo Pro project management system.

## Features

- **Project Management**: Create, update, and manage property inspection projects
- **Report Upload**: Handle inspection and demo report uploads
- **User Authentication**: JWT-based authentication with role-based access control
- **File Management**: Secure file upload and download for reports
- **MongoDB Integration**: Robust data persistence with MongoDB
- **Google Cloud Run Ready**: Optimized for deployment on Google Cloud Run

## Tech Stack

- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **File Upload**: Multer
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Deployment**: Docker, Google Cloud Run

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB instance
- Google Cloud SDK (for deployment)

### Local Development

1. **Clone and install dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Test the API**:
   ```bash
   curl http://localhost:5000/health
   ```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=8080
NODE_ENV=development  # or production

# MongoDB Configuration
MONGODB_URI=mongodb://wayne:1234%40wayne%235410337%40@10.0.0.5:27017/mr-demo-pro?authSource=admin

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google Cloud Run Configuration
GOOGLE_CLOUD_PROJECT=your-project-id
REGION=us-east4

# CORS Configuration
ALLOWED_ORIGINS=https://mr-demo-pro-server-187337178119.us-east4.run.app,http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# OTP Configuration
# Development: Random 6-digit codes (logged to console)
# Production: Fixed code 338338
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `POST /api/users/logout` - Logout user
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile

### Projects
- `GET /api/projects` - Get all projects for user
- `GET /api/projects/:id` - Get specific project
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/repairs` - Add repair to project
- `PUT /api/projects/:id/repairs/:repairId` - Update repair
- `DELETE /api/projects/:id/repairs/:repairId` - Delete repair
- `GET /api/projects/stats/overview` - Get project statistics

### Reports
- `GET /api/reports` - Get all reports for user
- `GET /api/reports/:id` - Get specific report
- `POST /api/reports` - Upload new report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `POST /api/reports/:id/review` - Review report (admin/inspector)
- `GET /api/reports/download/:id` - Download report file
- `GET /api/reports/stats/overview` - Get report statistics

### Health Check
- `GET /health` - Server health check

## Database Models

### User
- Authentication and profile information
- Role-based access control (admin, manager, inspector, client)
- Password hashing with bcryptjs

### Project
- Property inspection project details
- Report type (inspection, repair, estimate)
- Repair tracking with status and costs
- File attachments for reports

### Report
- File upload management
- Report metadata and findings
- Review workflow for admins/inspectors
- Version control for report updates

## Deployment

### Google Cloud Run Deployment

1. **Set up Google Cloud secrets**:
   ```bash
   # Create secrets for sensitive data
   echo -n "mongodb://wayne:1234%40wayne%235410337%40@10.0.0.5:27017/picra?authSource=admin" | \
   gcloud secrets create mongodb-uri --data-file=-
   
   echo -n "your-super-secret-jwt-key" | \
   gcloud secrets create jwt-secret --data-file=-
   ```

2. **Deploy using the script**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Manual deployment**:
   ```bash
   # Build and push image
   docker build -t gcr.io/187337178119/mr-demo-pro-server .
   docker push gcr.io/187337178119/mr-demo-pro-server
   
   # Deploy to Cloud Run
   gcloud run deploy mr-demo-pro-server \
     --image gcr.io/187337178119/mr-demo-pro-server \
     --region us-east4 \
     --platform managed \
     --allow-unauthenticated \
     --port 8080 \
     --memory 512Mi \
     --cpu 1 \
     --max-instances 10
   ```

### Docker

```bash
# Build image
docker build -t mr-demo-pro-server .

# Run container
docker run -p 8080:8080 \
  -e MONGODB_URI="your-mongodb-uri" \
  -e JWT_SECRET="your-jwt-secret" \
  mr-demo-pro-server
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: Express-validator for request validation
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Controlled cross-origin requests
- **Helmet**: Security headers
- **File Upload Validation**: Type and size restrictions
- **Role-based Access Control**: Different permissions for different user roles

## Monitoring and Logging

- **Health Checks**: Built-in health check endpoint
- **Error Handling**: Comprehensive error handling and logging
- **Request Logging**: Morgan for HTTP request logging
- **Google Cloud Logging**: Integrated with Cloud Run logging

## Development

### Running Tests
```bash
npm test
```

### Code Structure
```
server/
├── models/          # MongoDB schemas
├── routes/          # API route handlers
├── uploads/         # File upload directory
├── server.js        # Main application file
├── package.json     # Dependencies and scripts
├── Dockerfile       # Docker configuration
├── cloudbuild.yaml  # Google Cloud Build config
└── deploy.sh        # Deployment script
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB URI format
   - Verify network connectivity
   - Ensure authentication credentials are correct

2. **File Upload Issues**
   - Check file size limits
   - Verify file type restrictions
   - Ensure uploads directory exists

3. **Authentication Errors**
   - Verify JWT secret is set
   - Check token expiration
   - Ensure user is active

### Logs

View logs in Google Cloud Console or locally:
```bash
# Local logs
npm run dev

# Cloud Run logs
gcloud logs read --service=mr-demo-pro-server --limit=50
```

## Notion Blog Sync

- Environment: `NOTION_API_KEY`, `NOTION_POSTS_DB_ID`, `MONGODB_URI`
- Schema: `posts` collection with slug, published/publishedAt, SEO fields, featured flag, tags, contentHtml/contentJson, lastNotionEditedTime, syncedAt (see `src/models/Post.js`)
- Worker: `node scripts/syncNotionPosts.js` (uses official Notion SDK, paginated fetch, block HTML renderer, idempotent upsert by `notionPageId`)
- Metrics: scanned/updated/skipped/failed logged on each run; skips unchanged pages by comparing `last_edited_time`
- Rendering: supports paragraph, heading 1/2/3, lists, to-do, quote, code (HTML-escaped), divider, callout, image, bookmark, toggle
- API (DB only, no Notion calls):
  - `GET /api/blog` (published list, sorted featured desc then publishedAt desc, optional `?tag=`, includes `readingTime`)
  - `GET /api/blog/:slug` (contentHtml/Json, SEO fields, `readingTime`, JSON-LD object in `structuredData`, 404 if missing)
  - `GET /api/blog/:slug/related` (by tag overlap, excludes self)
  - `POST /api/blog/events` (analytics hook; event types: page_view, scroll_depth, outbound_click)
- SEO surfaces: `/sitemap.xml` and `/robots.txt` generated from published posts; set `SITE_URL` for canonical host
- Caching: blog APIs set `Cache-Control: public, max-age=300, stale-while-revalidate=600`

## 15-Minute Sync Strategy

- Cron: `*/15 * * * * node /app/scripts/syncNotionPosts.js`
- PM2: `pm2 start scripts/syncNotionPosts.js --name notion-sync --cron "*/15 * * * *"`
- GitHub Actions (self-hosted or with secrets configured):
  ```yaml
  on:
    schedule:
      - cron: "*/15 * * * *"
  jobs:
    sync:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with: { node-version: 18 }
        - run: npm ci
          working-directory: server
        - run: node scripts/syncNotionPosts.js
          working-directory: server
          env:
            NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
            NOTION_POSTS_DB_ID: ${{ secrets.NOTION_POSTS_DB_ID }}
            MONGODB_URI: ${{ secrets.MONGODB_URI }}
  ```
- Safe to rerun; upserts by `notionPageId` and only updates when Notion `last_edited_time` is newer.

## Frontend SEO & Performance Checklist

- SEO: SSR/SSG for `/blog/{slug}`, unique `<title>`/`<meta description>`, Open Graph/Twitter tags, canonical URLs, clean URLs, sitemap at `/sitemap.xml`, `robots.txt`, JSON-LD `BlogPosting`
- Performance: pre-render blog pages, lazy-load images, prefer webp/avif, code-split blog routes, cache HTTP/CDN, target Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms)
- UX/Content: strong typography, styled headings/lists/callouts/code (with syntax highlighting), table of contents from headings, reading time (available via API), related posts by tag (API provided), featured posts, tag archive pages, graceful empty states
- Accessibility: semantic `article/nav/aside`, contrast-safe palette, keyboard navigation, alt text for images with fallbacks, minimal/appropriate ARIA
- Analytics & Growth: track page views, scroll depth, outbound clicks (use `/api/blog/events`); hooks for GA/Plausible/PostHog; easy CTA injections (newsletter/lead magnet); social share buttons (X, LinkedIn, Facebook)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 