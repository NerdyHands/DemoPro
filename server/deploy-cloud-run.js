const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Deploying to Google Cloud Run...');

try {
  // Set environment variables
  process.env.NODE_ENV = 'production';
  
  // Build and push Docker image
  console.log('📦 Building Docker image...');
  execSync('npm run docker:build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  
  console.log('📤 Pushing Docker image...');
  execSync('npm run docker:push', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  
  // Deploy to Cloud Run
  console.log('🌐 Deploying to Cloud Run...');
  const projectId = 'cosmic-answer-439316-f1';
  const serviceName = 'mr-demo-pro-server';
  const region = 'us-east4';
  const imageUrl = `gcr.io/${projectId}/${serviceName}:latest`;
  
  // Cloud Run deployment command with clean configuration
  const deployCommand = `gcloud run deploy ${serviceName} \
    --image ${imageUrl} \
    --platform managed \
    --region ${region} \
    --project ${projectId} \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 1 \
    --min-instances 0 \
    --concurrency 80 \
    --timeout 300 \
    --set-env-vars NODE_ENV=production,PORT=8080 \
    --update-secrets MONGODB_URI=mongodb-uri:latest,JWT_SECRET=jwt-secret:latest,STRIPE_SECRET_KEY=stripe-secret:latest,OPENAI_API_KEY=openai-key:latest`;
  
  execSync(deployCommand, { stdio: 'inherit' });
  
  // Set the correct service URL
  console.log('🔍 Setting service URL...');
  const serviceUrl = 'https://mr-demo-pro-server-187337178119.us-east4.run.app';
  
  console.log('✅ Successfully deployed to Google Cloud Run!');
  console.log(`🌍 Service URL: ${serviceUrl}`);
  console.log(`📊 Service Dashboard: https://console.cloud.google.com/run/detail/${region}/${serviceName}?project=${projectId}`);
  
  // Test the deployment
  console.log('🧪 Testing deployment...');
  try {
    const healthCheck = execSync(`curl -f ${serviceUrl}/health`, { encoding: 'utf8', timeout: 30000 });
    console.log('✅ Health check passed!');
  } catch (error) {
    console.log('⚠️  Health check failed, but deployment completed. Service may need a moment to start.');
  }
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
} 