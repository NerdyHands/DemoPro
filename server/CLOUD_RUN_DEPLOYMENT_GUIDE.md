# Google Cloud Run Deployment Guide

This guide explains how to deploy the PICRA server to Google Cloud Run.

## Prerequisites

1. **Google Cloud Project**: Ensure you have a Google Cloud project with billing enabled
2. **Google Cloud CLI**: Install and configure `gcloud` CLI
3. **Docker**: Install Docker for local builds (optional)
4. **Node.js**: Version 18 or higher

## Initial Setup

### 1. Authenticate with Google Cloud

```bash
# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project cosmic-answer-439316-f1

# Verify authentication
gcloud auth list
```

### 2. Enable Required APIs

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# Enable Container Registry API
gcloud services enable containerregistry.googleapis.com

# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com
```

### 3. Set Up Environment Variables

Create a `.env.production` file in the server directory with your production environment variables:

```env
NODE_ENV=production
PORT=8080
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
OPENAI_API_KEY=your_openai_api_key
# Add other required environment variables
```

### 4. Set Up Secrets (Optional - Automated)

Run the setup script to automatically create and configure secrets:

```bash
cd server
npm run setup:cloud-run
```

This script will:
- Create secrets in Google Secret Manager
- Set up IAM permissions
- Enable required APIs
- Configure the environment

## Deployment Options

### Option 1: Local Build and Deploy

```bash
# Build and push Docker image
npm run docker:build
npm run docker:push

# Deploy to Cloud Run
npm run deploy:cloud-run
```

### Option 2: Cloud Build (Recommended for CI/CD)

```bash
# Deploy using Cloud Build
npm run deploy:ci
```

### Option 3: Manual Deployment

```bash
# Build and push image
gcloud builds submit --config cloudbuild.yaml .

# Deploy to Cloud Run
gcloud run deploy picra-server \
  --image gcr.io/cosmic-answer-439316-f1/picra-server:latest \
  --platform managed \
  --region us-east4 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 1 \
  --min-instances 0 \
  --concurrency 80 \
  --timeout 300
```

## Configuration Details

### Cloud Run Service Configuration

- **Memory**: 512Mi (optimized for cost)
- **CPU**: 1 vCPU
- **Max Instances**: 1 (single instance for cost control)
- **Min Instances**: 0 (cost optimization)
- **Concurrency**: 80 requests per instance
- **Timeout**: 300 seconds
- **Port**: 8080

### Environment Variables

The following environment variables are automatically set:
- `NODE_ENV=production`
- `PORT=8080`

### Secrets

The following secrets are managed through Google Secret Manager:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `OPENAI_API_KEY`: OpenAI API key

## Monitoring and Logging

### View Logs

```bash
# View recent logs
npm run logs:cloud-run

# Tail logs in real-time
npm run logs:tail
```

### Health Checks

```bash
# Test health endpoint
curl https://your-service-url/health

# Run health check script
npm run health
```

### Service Status

```bash
# Check deployment status
npm run status:cloud-run

# View service details
gcloud run services describe picra-server --region=us-east4
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   ```bash
   # Re-authenticate
   gcloud auth login
   gcloud auth application-default login
   ```

2. **Permission Errors**
   ```bash
   # Grant necessary permissions
   gcloud projects add-iam-policy-binding cosmic-answer-439316-f1 \
     --member="serviceAccount:cosmic-answer-439316-f1@appspot.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

3. **Build Failures**
   ```bash
   # Check build logs
   gcloud builds log [BUILD_ID]
   
   # Clean and rebuild
   docker system prune -a
   npm run docker:build
   ```

4. **Service Not Starting**
   ```bash
   # Check service logs
   gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=picra-server' --limit=20
   
   # Verify environment variables
   gcloud run services describe picra-server --region=us-east4 --format="value(spec.template.spec.containers[0].env)"
   ```

### Performance Optimization

1. **Memory Issues**: Increase memory allocation if needed
2. **Cold Start**: Set `min-instances` to 1 for faster response times
3. **Concurrency**: Adjust based on your application's needs
4. **Timeout**: Increase timeout for long-running operations

## Cost Optimization

- **Min Instances**: Set to 0 to scale to zero when not in use
- **Max Instances**: Limit to prevent runaway costs
- **Memory**: Use the minimum required memory
- **CPU**: Use the minimum required CPU

## Security Best Practices

1. **Secrets**: Use Google Secret Manager for sensitive data
2. **IAM**: Follow principle of least privilege
3. **Network**: Use VPC connector if needed for private resources
4. **HTTPS**: Cloud Run automatically provides HTTPS
5. **Authentication**: Consider using Cloud Run authentication for internal services

## Rollback

To rollback to a previous version:

```bash
# List revisions
gcloud run revisions list --service=picra-server --region=us-east4

# Rollback to specific revision
gcloud run services update-traffic picra-server \
  --to-revisions=REVISION_NAME=100 \
  --region=us-east4
```

## Cleanup

To delete the Cloud Run service:

```bash
gcloud run services delete picra-server --region=us-east4
```

To delete the Docker image:

```bash
gcloud container images delete gcr.io/cosmic-answer-439316-f1/picra-server:latest
```
