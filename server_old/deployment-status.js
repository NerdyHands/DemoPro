const { execSync } = require('child_process');

const args = process.argv.slice(2);
const checkCloudRun = args.includes('--cloud-run') || args.length === 0;
const detailed = args.includes('--detailed');
const projectId = 'cosmic-answer-439316-f1';
const region = 'us-east4';
const serviceName = 'mr-demo-pro-server';

console.log('📊 Checking deployment status...\n');

if (checkCloudRun) {
  console.log('🌐 Cloud Run Status:');
  try {
    // Check if service exists
    const serviceExists = execSync(`gcloud run services list --project ${projectId} --filter="metadata.name=${serviceName}" --format="value(metadata.name)"`, { encoding: 'utf8' }).trim();
    
    if (serviceExists) {
      // Get service details
      const serviceDetails = execSync(`gcloud run services describe ${serviceName} --region=${region} --project=${projectId} --format="value(status.url,status.conditions[0].status,status.conditions[0].message)"`, { encoding: 'utf8' }).trim();
      const [url, status, message] = serviceDetails.split('\n');
      
      console.log(`✅ Service: ${serviceName}`);
      console.log(`🌍 URL: ${url}`);
      console.log(`📊 Status: ${status}`);
      if (message) console.log(`💬 Message: ${message}`);
      
      // Get revision details
      console.log('\n📋 Recent Revisions:');
      const revisions = execSync(`gcloud run revisions list --service=${serviceName} --region=${region} --project=${projectId} --format="table(metadata.name,status.conditions[0].status,metadata.creationTimestamp)" --limit=5`, { encoding: 'utf8' });
      console.log(revisions);
      
      // Get resource usage
      console.log('\n💾 Resource Configuration:');
      const resources = execSync(`gcloud run services describe ${serviceName} --region=${region} --project=${projectId} --format="value(spec.template.spec.containers[0].resources.limits.memory,spec.template.spec.containers[0].resources.limits.cpu,spec.template.spec.containers[0].resources.requests.memory,spec.template.spec.containers[0].resources.requests.cpu)"`, { encoding: 'utf8' }).trim();
      const [limitsMemory, limitsCpu, requestsMemory, requestsCpu] = resources.split('\n');
      console.log(`Memory Limits: ${limitsMemory}`);
      console.log(`CPU Limits: ${limitsCpu}`);
      console.log(`Memory Requests: ${requestsMemory}`);
      console.log(`CPU Requests: ${requestsCpu}`);
      
      // Get scaling configuration
      console.log('\n⚖️ Scaling Configuration:');
      const scaling = execSync(`gcloud run services describe ${serviceName} --region=${region} --project=${projectId} --format="value(spec.template.metadata.annotations['autoscaling.knative.dev/minScale'],spec.template.metadata.annotations['autoscaling.knative.dev/maxScale'],spec.template.metadata.annotations['autoscaling.knative.dev/target'])"`, { encoding: 'utf8' }).trim();
      const [minScale, maxScale, target] = scaling.split('\n');
      console.log(`Min Instances: ${minScale || '0'}`);
      console.log(`Max Instances: ${maxScale || '10'}`);
      console.log(`Target Concurrency: ${target || '80'}`);
      
      if (detailed) {
        // Get environment variables
        console.log('\n🔧 Environment Variables:');
        try {
          const envVars = execSync(`gcloud run services describe ${serviceName} --region=${region} --project=${projectId} --format="value(spec.template.spec.containers[0].env[].name)"`, { encoding: 'utf8' }).trim();
          if (envVars) {
            console.log('Environment variables:', envVars.split('\n').join(', '));
          } else {
            console.log('No environment variables set');
          }
        } catch (error) {
          console.log('No environment variables found');
        }
        
        // Get secrets
        console.log('\n🔐 Secrets:');
        try {
          const secrets = execSync(`gcloud run services describe ${serviceName} --region=${region} --project=${projectId} --format="value(spec.template.spec.containers[0].env[].valueFrom.secretKeyRef.name)"`, { encoding: 'utf8' }).trim();
          if (secrets) {
            console.log('Secrets:', secrets.split('\n').join(', '));
          } else {
            console.log('No secrets configured');
          }
        } catch (error) {
          console.log('No secrets found');
        }
      }
      
      // Test health endpoint
      console.log('\n🏥 Health Check:');
      try {
        const healthCheck = execSync(`curl -s -o /dev/null -w "%{http_code}" ${url}/health`, { encoding: 'utf8', timeout: 10000 });
        if (healthCheck === '200') {
          console.log('✅ Health endpoint responding (200)');
        } else {
          console.log(`⚠️ Health endpoint returned: ${healthCheck}`);
        }
      } catch (error) {
        console.log('❌ Health check failed:', error.message);
      }
      
    } else {
      console.log(`❌ Service ${serviceName} not found`);
    }
    
  } catch (error) {
    console.log('❌ Error checking Cloud Run status:', error.message);
  }
  console.log('');
}

console.log('✅ Status check complete!');
console.log('\n💡 Tips:');
console.log('- Use --detailed flag for more information');
console.log('- Run "npm run logs:cloud-run" to view logs');
console.log('- Run "npm run health" for detailed health check'); 