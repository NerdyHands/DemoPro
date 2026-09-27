// API Service Layer for ezPICRA Client
import config from '../config/config.jsx';
import FakeDataService from './fakeData';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    // In development, use the full API URL to ensure correct routing
    // In production, use the full base URL
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    // Use fake data service only when explicitly enabled
    if (config.useFakeData) {
      this.fakeService = new FakeDataService();
      console.log('🔧 Using fake data service');
    }
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return token ? { ...this.defaultHeaders, 'Authorization': `Bearer ${token}` } : this.defaultHeaders;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get auth headers, but don't set Content-Type for FormData
    const authHeaders = this.getAuthHeaders();
    if (options.body instanceof FormData) {
      delete authHeaders['Content-Type']; // Let browser set the correct Content-Type for FormData
    }
    
    const config = {
      headers: authHeaders,
      ...options,
    };

    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      // Handle non-2xx responses
      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          console.error('❌ Authentication failed - redirecting to login');
          // Clear auth data
          localStorage.removeItem('authToken');
          localStorage.removeItem('userProfile');
          // Only redirect if we're not already on an auth page
          if (!window.location.pathname.includes('/auth') && 
              !window.location.pathname.includes('/login') &&
              !window.location.pathname.includes('/signup')) {
            window.location.href = '/auth';
          }
          throw new Error('Authentication required');
        }

        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error Response:', {
          url: url,
          status: response.status,
          statusText: response.statusText,
          errorData: errorData
        });
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();
        console.log(`✅ API Response: ${options.method || 'GET'} ${endpoint}`, jsonData);
        return jsonData;
      }
      
      return await response.text();
    } catch (error) {
      // Only log if it's not an auth error (already logged above)
      if (error.message !== 'Authentication required') {
        console.error('❌ API Request failed:', {
          url: url,
          method: options.method || 'GET',
          error: error.message
        });
      }
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    if (config.useFakeData) {
      return this.fakeService.healthCheck();
    }
    return this.request('/health');
  }

  // Authentication endpoints
  async sendOTP(email, type = 'login') {
    if (config.useFakeData) {
      return this.fakeService.sendOTP(email, type);
    }
    return this.request('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, type }),
    });
  }

  async verifyOTP(email, otp, type = 'login') {
    if (config.useFakeData) {
      return this.fakeService.verifyOTP(email, otp, type);
    }
    return this.request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, type }),
    });
  }

  async getOTPStatus(email, type = 'login') {
    // Only available in development mode
    console.log('🔍 getOTPStatus - Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      hostname: window.location.hostname,
      checkResult: process.env.NODE_ENV !== 'development' && window.location.hostname !== 'localhost'
    });
    if (process.env.NODE_ENV !== 'development' && window.location.hostname !== 'localhost') {
      console.log('⚠️ getOTPStatus - Not in dev mode, returning early');
      return { hasActiveOTP: false, message: 'Only available in development mode' };
    }
    console.log('🔑 getOTPStatus - Making request to:', `/api/otp/status/${encodeURIComponent(email)}?type=${type}`);
    return this.request(`/api/otp/status/${encodeURIComponent(email)}?type=${type}`);
  }

  // User endpoints
  async createUser(userData) {
    if (config.useFakeData) {
      return this.fakeService.createUser(userData);
    }
    return this.request('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async register(userData) {
    if (config.useFakeData) {
      return this.fakeService.createUser(userData);
    }
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async googleAuth(userData) {
    if (config.useFakeData) {
      return this.fakeService.googleAuth(userData);
    }
    return this.request('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUserStats() {
    if (config.useFakeData) {
      return this.fakeService.getUserStats();
    }
    return this.request('/api/users/stats');
  }

  async getUsersByType(type, params = {}) {
    if (config.useFakeData) {
      return this.fakeService.getUsersByType(type, params);
    }
    const queryParams = new URLSearchParams(params).toString();
    return this.request(`/api/users/by-type/${type}?${queryParams}`);
  }

  async getUserProfile() {
    if (config.useFakeData) {
      return this.fakeService.getUserProfile();
    }
    return this.request('/api/users/profile');
  }

  async updateUserProfile(userData) {
    if (config.useFakeData) {
      return this.fakeService.updateUserProfile(userData);
    }
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getUsers() {
    if (config.useFakeData) {
      return this.fakeService.getUsers();
    }
    return this.request('/api/users');
  }

  async deleteUser(userId) {
    if (config.useFakeData) {
      return this.fakeService.deleteUser(userId);
    }
    return this.request(`/api/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Project endpoints
  async getProjects() {
    if (config.useFakeData) {
      return this.fakeService.getProjects();
    }
    return this.request('/api/projects');
  }

  async getProject(id) {
    if (config.useFakeData) {
      return this.fakeService.getProject(id);
    }
    return this.request(`/api/projects/${id}`);
  }

  async createProject(projectData) {
    if (config.useFakeData) {
      return this.fakeService.createProject(projectData);
    }
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id, projectData) {
    if (config.useFakeData) {
      return this.fakeService.updateProject(id, projectData);
    }
    return this.request(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id) {
    if (config.useFakeData) {
      return this.fakeService.deleteProject(id);
    }
    return this.request(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Report endpoints
  async getReports() {
    if (config.useFakeData) {
      return this.fakeService.getReports();
    }
    return this.request('/api/reports');
  }

  async getReport(id) {
    if (config.useFakeData) {
      return this.fakeService.getReport(id);
    }
    return this.request(`/api/reports/${id}`);
  }

  async createReport(reportData) {
    if (config.useFakeData) {
      return this.fakeService.createReport(reportData);
    }
    return this.request('/api/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async updateReport(id, reportData) {
    if (config.useFakeData) {
      return this.fakeService.updateReport(id, reportData);
    }
    return this.request(`/api/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reportData),
    });
  }

  async deleteReport(id) {
    if (config.useFakeData) {
      return this.fakeService.deleteReport(id);
    }
    return this.request(`/api/reports/${id}`, {
      method: 'DELETE',
    });
  }

  // File upload endpoint
  async uploadFile(file, type = 'report') {
    if (config.useFakeData) {
      return this.fakeService.uploadFile(file, type);
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request('/api/reports/upload', {
      method: 'POST',
      // Don't override headers - let request() merge with auth headers
      body: formData,
    });
  }

  // File upload with metadata endpoint
  async uploadFileWithMetadata(formData) {
    if (config.useFakeData) {
      return this.fakeService.uploadFileWithMetadata(formData);
    }

    return this.request('/api/reports/upload', {
      method: 'POST',
      // Don't override headers - let request() merge with auth headers
      body: formData,
    });
  }

  // PICRA Processing endpoints
  async uploadPICRAForProcessing(formData) {
    if (config.useFakeData) {
      return this.fakeService.uploadPICRAForProcessing(formData);
    }

    return this.request('/api/picra-processing/upload', {
      method: 'POST',
      // Don't override headers - let request() merge with auth headers
      body: formData,
    });
  }

  async getPICRAProcessingStatus(processingId) {
    if (config.useFakeData) {
      return this.fakeService.getPICRAProcessingStatus(processingId);
    }
    return this.request(`/api/picra-processing/status/${processingId}`);
  }

  async getPICRAProcessingResults(processingId) {
    if (config.useFakeData) {
      return this.fakeService.getPICRAProcessingResults(processingId);
    }
    return this.request(`/api/picra-processing/results/${processingId}`);
  }

  async getUserPICRAProcessingRecords(page = 1, limit = 10) {
    if (config.useFakeData) {
      return this.fakeService.getUserPICRAProcessingRecords(page, limit);
    }
    return this.request(`/api/picra-processing/user?page=${page}&limit=${limit}`);
  }

  async getProjectPICRAProcessingRecords(projectId, page = 1, limit = 10) {
    if (config.useFakeData) {
      return this.fakeService.getProjectPICRAProcessingRecords(projectId, page, limit);
    }
    return this.request(`/api/picra-processing/project/${projectId}?page=${page}&limit=${limit}`);
  }

  async retryPICRAProcessing(processingId) {
    if (config.useFakeData) {
      return this.fakeService.retryPICRAProcessing(processingId);
    }
    return this.request(`/api/picra-processing/retry/${processingId}`, {
      method: 'POST',
    });
  }

  async deletePICRAProcessingRecord(processingId) {
    if (config.useFakeData) {
      return this.fakeService.deletePICRAProcessingRecord(processingId);
    }
    return this.request(`/api/picra-processing/${processingId}`, {
      method: 'DELETE',
    });
  }

  async getPICRAProcessingStats() {
    if (config.useFakeData) {
      return this.fakeService.getPICRAProcessingStats();
    }
    return this.request('/api/picra-processing/stats');
  }

  // Quote Management
  async getQuotes(params = {}) {
    if (config.useFakeData) {
      return this.fakeService.getQuotes(params);
    }
    return this.request(`/api/quotes?${new URLSearchParams(params).toString()}`);
  }

  async getQuote(quoteId) {
    if (config.useFakeData) {
      return this.fakeService.getQuote(quoteId);
    }
    return this.request(`/api/quotes/${quoteId}`);
  }

  async createQuote(quoteData) {
    if (config.useFakeData) {
      return this.fakeService.createQuote(quoteData);
    }
    return this.request('/api/quotes', {
      method: 'POST',
      body: JSON.stringify(quoteData)
    });
  }

  async updateQuote(quoteId, quoteData) {
    if (config.useFakeData) {
      return this.fakeService.updateQuote(quoteId, quoteData);
    }
    return this.request(`/api/quotes/${quoteId}`, {
      method: 'PUT',
      body: JSON.stringify(quoteData)
    });
  }

  async sendQuote(quoteId) {
    if (config.useFakeData) {
      return this.fakeService.sendQuote(quoteId);
    }
    return this.request(`/api/quotes/${quoteId}/send`, {
      method: 'POST'
    });
  }

  async updateQuoteApproval(quoteId, status, customerResponse = null, customerNotes = null) {
    if (config.useFakeData) {
      return this.fakeService.updateQuoteApproval(quoteId, status, customerResponse, customerNotes);
    }
    return this.request(`/api/quotes/${quoteId}/approval`, {
      method: 'POST',
      body: JSON.stringify({
        status,
        customerResponse,
        customerNotes
      })
    });
  }

  async getPendingApprovalQuotes() {
    if (config.useFakeData) {
      return this.fakeService.getPendingApprovalQuotes();
    }
    return this.request('/api/quotes/pending-approval');
  }

  async addQuoteCommunication(quoteId, communicationData) {
    if (config.useFakeData) {
      return this.fakeService.addQuoteCommunication(quoteId, communicationData);
    }
    return this.request(`/api/quotes/${quoteId}/communication`, {
      method: 'POST',
      body: JSON.stringify(communicationData)
    });
  }

  async deleteQuote(quoteId) {
    if (config.useFakeData) {
      return this.fakeService.deleteQuote(quoteId);
    }
    return this.request(`/api/quotes/${quoteId}`, {
      method: 'DELETE'
    });
  }

  async getQuoteStats() {
    if (config.useFakeData) {
      return this.fakeService.getQuoteStats();
    }
    return this.request('/api/quotes/stats/overview');
  }

  // ChatGPT Integration
  async extractRepairItemsWithChatGPT(prompt, extractedText) {
    if (config.useFakeData) {
      // Simulate ChatGPT response for testing
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            success: true,
            response: JSON.stringify([
              {
                category: "HVAC System",
                issue: "Crawlspace Ductwork (10.7.4)",
                action: "Have licensed HVAC contractor secure and support sagging return and branch ductwork",
                location: "crawlspace",
                priority: "Medium",
                estimated_cost: null
              },
              {
                category: "Plumbing",
                issue: "Leaks (11.8.2 & 11.9.2)",
                action: "Have licensed plumber repair active leak on faucet valve/water lines",
                location: "second-floor hall bathroom",
                priority: "High",
                estimated_cost: null
              }
            ])
          });
        }, 2000);
      });
    }
    
    return this.request('/api/chatgpt/extract-repair-items', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        extractedText
      })
    });
  }

  // MLS Property Listings
  async getPendingProperties() {
    if (config.useFakeData) {
      // Simulate property data for testing
      return new Promise(resolve => {
        setTimeout(() => {
          resolve([
            {
              property_id: '1',
              address: {
                line: '123 Main Street',
                city: 'Hampton',
                state_code: 'VA'
              },
              price: 250000,
              beds: 3,
              baths: 2,
              building_size: { size: 1500 },
              photo: 'https://via.placeholder.com/400x300',
              rdc_web_url: 'https://example.com'
            }
          ]);
        }, 1000);
      });
    }
    return this.request('/api/mls/pending');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export the class for testing purposes
export { ApiService }; 
