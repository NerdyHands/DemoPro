// Configuration file for ezPICRA Client
const config = {
  // API Configuration
  api: {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  },

  // Environment
  environment: process.env.REACT_APP_ENVIRONMENT || 'development',
  version: process.env.REACT_APP_VERSION || '1.0.0',

  // Feature flags
  features: {
    enableServiceWorker: process.env.NODE_ENV === 'production',
    enableAnalytics: process.env.NODE_ENV === 'production',
    enableDebugLogging: process.env.NODE_ENV === 'development',
  },

  // Data configuration
  useFakeData: process.env.REACT_APP_USE_FAKE_DATA === 'true',

  // App settings
  app: {
    name: 'Mr Demo Pro',
    description: 'Project Inspection and Compliance Reporting Application',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedFileTypes: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
  },

  // Local storage keys
  storage: {
    authToken: 'authToken',
    userProfile: 'userProfile',
    theme: 'theme',
    language: 'language',
  },

  // Routes
  routes: {
    login: '/login',
    signup: '/signup',
    dashboard: '/dashboard',
    projectDetails: '/project-details',
    upload: '/upload',
  },

  // API endpoints
  endpoints: {
    health: '/health',
    auth: {
      sendOTP: '/api/otp/send',
      verifyOTP: '/api/otp/verify',
    },
    users: {
      base: '/api/users',
      profile: '/api/users/profile',
    },
    projects: {
      base: '/api/projects',
    },
    reports: {
      base: '/api/reports',
      upload: '/api/reports/upload',
    },
  },
};

// Helper functions
export const isDevelopment = () => config.environment === 'development';
export const isProduction = () => config.environment === 'production';
export const getApiUrl = () => config.api.baseURL;
export const getAppName = () => config.app.name;

export default config; 
