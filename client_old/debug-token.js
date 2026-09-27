// Debug script to check JWT token
console.log('🔍 Debugging JWT Token...');

// Check if token exists in localStorage
const token = localStorage.getItem('authToken');
const userProfile = localStorage.getItem('userProfile');

console.log('📋 Current localStorage state:');
console.log('- authToken:', token ? '✅ Present' : '❌ Missing');
console.log('- userProfile:', userProfile ? '✅ Present' : '❌ Missing');

if (token) {
  console.log('🔐 Token value:', token.substring(0, 50) + '...');
  
  // Decode JWT token (without verification)
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    console.log('📦 Token payload:', payload);
    console.log('👤 User ID from token:', payload.userId);
    console.log('⏰ Token expires:', new Date(payload.exp * 1000).toLocaleString());
    
  } catch (error) {
    console.log('❌ Failed to decode token:', error);
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
import('./src/services/api.js').then(module => {
  const apiService = module.default;
  console.log('🔧 API Service auth headers:', apiService.getAuthHeaders());
}); 