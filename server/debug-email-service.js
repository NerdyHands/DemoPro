require('dotenv').config();
const sgMail = require('@sendgrid/mail');

async function debugEmailService() {
  console.log('🔍 Debugging Email Service...\n');
  
  // Force enable for testing
  process.env.SENDGRID_ENABLED = 'true';
  
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  
  console.log('📋 Configuration:');
  console.log(`   API Key: ${apiKey ? `${apiKey.substring(0, 20)}...` : 'Not set'}`);
  console.log(`   From Email: ${fromEmail}`);
  console.log(`   Environment: ${process.env.NODE_ENV}\n`);
  
  if (!apiKey) {
    console.log('❌ No API key found');
    return;
  }
  
  // Set API key
  sgMail.setApiKey(apiKey);
  
  // Test 1: Basic connection test
  console.log('1️⃣ Testing basic SendGrid connection...');
  try {
    const msg = {
      to: 'davis.t.wayne@gmail.com', // Use your real email
      from: fromEmail,
      subject: 'Debug Test - ezPICRA',
      text: 'This is a debug test email.',
      html: '<p>This is a debug test email.</p>'
    };
    
    console.log('📧 Sending test email...');
    const response = await sgMail.send(msg);
    
    console.log('✅ Basic test successful!');
    console.log('📧 Response status:', response[0].statusCode);
    console.log('📧 Message ID:', response[0].headers['x-message-id']);
    
  } catch (error) {
    console.log('❌ Basic test failed');
    console.log('📋 Error:', error.message);
    if (error.response) {
      console.log('📋 Status:', error.response.statusCode);
      console.log('📋 Body:', error.response.body);
    }
    return;
  }
  
  // Test 2: Test with email service logic
  console.log('\n2️⃣ Testing email service logic...');
  try {
    // Simulate what the email service does
    const emailService = require('./services/emailService');
    
    // Force enable
    emailService.isEnabled = true;
    
    console.log('📧 Testing connection method...');
    const connectionResult = await emailService.testConnection();
    
    if (connectionResult.success) {
      console.log('✅ Email service test successful!');
      console.log('📧 Message:', connectionResult.message);
      console.log('📧 Message ID:', connectionResult.messageId);
    } else {
      console.log('❌ Email service test failed');
      console.log('📋 Reason:', connectionResult.reason);
    }
    
  } catch (error) {
    console.log('❌ Email service test error');
    console.log('📋 Error:', error.message);
    console.log('📋 Stack:', error.stack);
  }
  
  // Test 3: Test welcome email
  console.log('\n3️⃣ Testing welcome email...');
  try {
    const emailService = require('./services/emailService');
    emailService.isEnabled = true;
    
    const testUser = {
      email: 'davis.t.wayne@gmail.com',
      firstName: 'Wayne',
      lastName: 'Davis'
    };
    
    console.log('📧 Sending welcome email...');
    const emailResult = await emailService.sendWelcomeEmail(testUser);
    
    if (emailResult.success) {
      console.log('✅ Welcome email successful!');
      console.log('📧 Message ID:', emailResult.messageId);
      console.log('📧 Timestamp:', emailResult.timestamp);
    } else {
      console.log('❌ Welcome email failed');
      console.log('📋 Reason:', emailResult.reason);
    }
    
  } catch (error) {
    console.log('❌ Welcome email test error');
    console.log('📋 Error:', error.message);
    console.log('📋 Stack:', error.stack);
  }
  
  console.log('\n🏁 Debug completed');
}

debugEmailService()
  .then(() => {
    console.log('\n✨ All debug tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Debug failed:', error);
    process.exit(1);
  });
