import apiService from './services/api';

// Debug script to test authentication token storage
console.log('🔍 Debugging Authentication Token...');

// Check if token exists in localStorage
const token = localStorage.getItem('authToken');
const userProfile = localStorage.getItem('userProfile');

console.log('📋 Current localStorage state:');
console.log('- authToken:', token ? '✅ Present' : '❌ Missing');
console.log('- userProfile:', userProfile ? '✅ Present' : '❌ Missing');

if (token) {
  console.log('🔐 Token value:', token.substring(0, 20) + '...');
  
  // Test token format (should be a JWT)
  if (token.split('.').length === 3) {
    console.log('✅ Token appears to be valid JWT format');
  } else {
    console.log('❌ Token does not appear to be valid JWT format');
  }
}

if (userProfile) {
  try {
    const user = JSON.parse(userProfile);
    console.log('👤 User profile:', user);
  } catch (e) {
    console.log('❌ Failed to parse user profile:', e);
  }
}

// Test API service auth headers
console.log('🔧 API Service auth headers:', apiService.getAuthHeaders()); 
