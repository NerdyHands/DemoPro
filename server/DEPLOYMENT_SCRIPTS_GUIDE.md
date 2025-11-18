# Deployment Scripts Guide

This guide explains how to use the deployment scripts for Google Cloud Run deployment.

## Environment Files

The server now uses separate environment files for different deployment scenarios:

- `.env.development` - For local development
- `.env.production` - For production deployment

## Available Scripts

### Development
```bash
npm run dev          # Start development server with .env.development
```

### Production
```bash
npm start            # Start production server with .env.production
```

### Docker Operations
```bash
npm run docker       # Build Docker image with production environment
npm run docker:build # Build Docker image only
npm run docker:push  # Push Docker image to Google Container Registry
```

### Deployment
```bash
npm run deploy              # Deploy to Google Cloud Run (main command)
npm run deploy:cloud-run    # Deploy to Google Cloud Run
npm run deploy:cloud-build  # Deploy using Cloud Build
npm run deploy:ci          # CI/CD deployment command
```

### Google Cloud Build
```bash
npm run gcloud:build # Submit build to Google Cloud Build
npm run gcloud:auth  # Authenticate with service account
```

### Status Checking
```bash
npm run status              # Check Cloud Run deployment status
npm run status:cloud-run    # Check Cloud Run status only
npm run status:detailed     # Detailed Cloud Run status
```

### Monitoring and Logs
```bash
npm run logs:cloud-run      # View Cloud Run logs
npm run logs:tail          # Tail logs in real-time
npm run health             # Health check
```

### Setup
```bash
npm run setup:cloud-run     # Initial Cloud Run environment setup
```

## Quick Deployment

To deploy to Google Cloud Run (recommended):

1. Make sure you're authenticated with Google Cloud:
   ```bash
   gcloud auth login
   gcloud config set project cosmic-answer-439316-f1
   ```

2. Deploy (choose one):
   ```bash
   npm run deploy              # Simple deployment
   npm run deploy:cloud-run    # Explicit Cloud Run deployment
   npm run deploy:ci          # CI/CD deployment
   ```

## Environment Configuration

The deployment scripts automatically use the correct environment file:
- Development uses `.env.development`
- Production uses `.env.production`
- Docker builds use `.env.production`

## Troubleshooting

If you encounter issues:

1. Check your Google Cloud authentication:
   ```bash
   gcloud auth list
   ```

2. Verify your project is set correctly:
   ```bash
   gcloud config get-value project
   ```

3. Check deployment status:
   ```bash
   npm run status
   ```

4. View logs:
   ```bash
   npm run logs:cloud-run
   ```

5. Run health check:
   ```bash
   npm run health
   ``` 