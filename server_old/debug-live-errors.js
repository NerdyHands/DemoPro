#!/usr/bin/env node

/**
 * Live Server Error Debugging Script
 * Identifies specific errors on the production server
 */

const https = require('https');
const http = require('http');

const SERVER_URL = 'https://mr-demo-pro-server-187337178119.us-east4.run.app';

console.log('🔍 Debugging Live Server Errors...\n');

// Test server with detailed error logging
async function debugServerErrors() {
  console.log('1. Testing Server Health with Detailed Logging...');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'mr-demo-pro-server-187337178119.us-east4.run.app',
      port: 443,
      path: '/health',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    const req = https.request(options, (res) => {
      console.log(`📊 Response Status: ${res.statusCode}`);
      console.log(`📋 Response Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📄 Response Body:`, data);
        
        if (res.statusCode >= 400) {
          console.log(`❌ Error detected: ${res.statusCode}`);
          try {
            const errorData = JSON.parse(data);
            console.log(`🔍 Error Details:`, errorData);
          } catch (e) {
            console.log(`🔍 Raw Error Response:`, data);
          }
        }
        
        resolve({ statusCode: res.statusCode, data, headers: res.headers });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Request failed:`, error.message);
      reject(error);
    });
    
    req.end();
  });
}

// Test API endpoint with CORS
async function debugAPIErrors() {
  console.log('\n2. Testing API Endpoint with CORS...');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'mr-demo-pro-server-187337178119.us-east4.run.app',
      port: 443,
      path: '/api',
      method: 'GET',
      headers: {
        'Origin': 'https://app.mrdemopro.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    const req = https.request(options, (res) => {
      console.log(`📊 API Response Status: ${res.statusCode}`);
      console.log(`📋 CORS Headers:`);
      console.log(`   Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'Not set'}`);
      console.log(`   Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials'] || 'Not set'}`);
      console.log(`   Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'Not set'}`);
      console.log(`   Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'Not set'}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📄 API Response Body:`, data);
        
        if (res.statusCode >= 400) {
          console.log(`❌ API Error detected: ${res.statusCode}`);
          try {
            const errorData = JSON.parse(data);
            console.log(`🔍 API Error Details:`, errorData);
          } catch (e) {
            console.log(`🔍 Raw API Error Response:`, data);
          }
        }
        
        resolve({ statusCode: res.statusCode, data, headers: res.headers });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ API request failed:`, error.message);
      reject(error);
    });
    
    req.end();
  });
}

// Test OTP endpoint
async function debugOTPErrors() {
  console.log('\n3. Testing OTP Endpoint...');
  
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'test@example.com',
      type: 'login'
    });
    
    const options = {
      hostname: 'mr-demo-pro-server-187337178119.us-east4.run.app',
      port: 443,
      path: '/api/otp/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Origin': 'https://app.mrdemopro.com'
      }
    };
    
    const req = https.request(options, (res) => {
      console.log(`📊 OTP Response Status: ${res.statusCode}`);
      console.log(`📋 OTP Response Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📄 OTP Response Body:`, data);
        
        if (res.statusCode >= 400) {
          console.log(`❌ OTP Error detected: ${res.statusCode}`);
          try {
            const errorData = JSON.parse(data);
            console.log(`🔍 OTP Error Details:`, errorData);
          } catch (e) {
            console.log(`🔍 Raw OTP Error Response:`, data);
          }
        }
        
        resolve({ statusCode: res.statusCode, data, headers: res.headers });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ OTP request failed:`, error.message);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// Test MongoDB connection
async function debugMongoDBConnection() {
  console.log('\n4. Testing MongoDB Connection...');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'mr-demo-pro-server-187337178119.us-east4.run.app',
      port: 443,
      path: '/ping',
      method: 'GET'
    };
    
    const req = https.request(options, (res) => {
      console.log(`📊 Ping Response Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📄 Ping Response:`, data);
        resolve({ statusCode: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Ping failed:`, error.message);
      reject(error);
    });
    
    req.end();
  });
}

// Main debugging function
async function runDebugTests() {
  try {
    await debugServerErrors();
    await debugAPIErrors();
    await debugOTPErrors();
    await debugMongoDBConnection();
    
    console.log('\n🎯 Debug Summary:');
    console.log('   - Check server logs for detailed error information');
    console.log('   - Verify MongoDB connection string');
    console.log('   - Check environment variables');
    console.log('   - Verify CORS configuration');
    
  } catch (error) {
    console.error('\n❌ Debug test failed:', error.message);
  }
}

// Run debug tests
runDebugTests(); 