const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Simple Deployment to Google Cloud Run...');

try {
  const projectId = 'cosmic-answer-439316-f1';
  const region = 'us-east4';
  const serviceName = 'mr-demo-pro-server';

  // Step 1: Build and push Docker image
  console.log('📦 Building Docker image...');
  execSync('npm run docker:build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  
  console.log('📤 Pushing Docker image...');
  execSync('npm run docker:push', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

  // Step 2: Deploy to Cloud Run
  console.log('🌐 Deploying to Cloud Run...');
  const imageUrl = `gcr.io/${projectId}/${serviceName}:latest`;
  
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
    --timeout 300`;
  
  execSync(deployCommand, { stdio: 'inherit' });

  // Step 3: Set service URL
  console.log('🔍 Setting service URL...');
  const serviceUrl = 'https://mr-demo-pro-server-187337178119.us-east4.run.app';
  
  console.log('✅ Successfully deployed to Google Cloud Run!');
  console.log(`🌍 Service URL: ${serviceUrl}`);
  console.log(`📊 Service Dashboard: https://console.cloud.google.com/run/detail/${region}/${serviceName}?project=${projectId}`);

  // Step 4: Test the deployment
  console.log('🧪 Testing deployment...');
  try {
    const healthCheck = execSync(`curl -f ${serviceUrl}/health`, { encoding: 'utf8', timeout: 30000 });
    console.log('✅ Health check passed!');
  } catch (error) {
    console.log('⚠️  Health check failed, but deployment completed. Service may need a moment to start.');
  }

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  console.error('🔍 Check the error details above and try again');
  process.exit(1);
} 