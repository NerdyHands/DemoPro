# API Configuration for ezPICRA Client

## Overview

The ezPICRA client is configured to use different data sources based on the environment:

- **Development Mode**: Uses real API calls to the server
- **Production Mode**: Uses fake data service for demonstration purposes

## Environment Configuration

### Development Environment (`.env.development`)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0
```

### Production Environment (`.env.production`)
```
REACT_APP_API_URL=https://picra-server-187337178119.us-east4.run.app
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

## API Service Layer

The client uses a centralized API service (`src/services/api.js`) that:

1. **Automatically detects environment** using `NODE_ENV`
2. **Routes requests appropriately**:
   - Development: Real API calls to server
   - Production: Fake data service

### Key Features

- **Environment-aware**: Automatically switches between real and fake data
- **Error handling**: Comprehensive error handling for all API calls
- **Authentication**: JWT token management
- **File uploads**: Support for multipart form data
- **Consistent interface**: Same API methods regardless of environment

## Available API Methods

### Authentication
- `sendOTP(email)` - Send OTP to email
- `verifyOTP(email, otp)` - Verify OTP and get token

### Users
- `createUser(userData)` - Create new user
- `getUserProfile()` - Get current user profile
- `updateUserProfile(userData)` - Update user profile

### Projects
- `getProjects()` - Get all projects
- `getProject(id)` - Get specific project
- `createProject(projectData)` - Create new project
- `updateProject(id, projectData)` - Update project
- `deleteProject(id)` - Delete project

### Reports
- `getReports()` - Get all reports
- `getReport(id)` - Get specific report
- `createReport(reportData)` - Create new report
- `updateReport(id, reportData)` - Update report
- `deleteReport(id)` - Delete report
- `uploadFile(file, type)` - Upload file (PICRA or inspection)

### Health Check
- `healthCheck()` - Check server status

## Fake Data Service

In production mode, the client uses `src/services/fakeData.js` which provides:

- **Realistic data**: Sample projects, reports, and user data
- **Simulated delays**: Realistic API response times
- **Error simulation**: Occasional errors for testing
- **Persistent state**: Data persists during session

### Fake Data Features

- **Projects**: 4 sample projects with different statuses
- **Reports**: Sample reports linked to projects
- **User**: Sample user profile
- **OTP**: Accepts any 6-digit code for testing
- **File uploads**: Simulates file upload with progress

## CORS Configuration

The server is configured with comprehensive CORS settings:

```javascript
// Server CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : process.env.NODE_ENV === 'production' 
    ? ['https://picra-server-187337178119.us-east4.run.app', 'https://your-production-client-domain.com']
    : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
```

## Usage Examples

### Using the API Service

```javascript
import apiService from '../services/api';

// Get projects (works in both dev and production)
const projects = await apiService.getProjects();

// Upload file (works in both dev and production)
const result = await apiService.uploadFile(file, 'picra');

// Send OTP (works in both dev and production)
await apiService.sendOTP('user@example.com');
```

### Environment Detection

```javascript
import config from '../config/config';

if (config.isDevelopment) {
  console.log('Running in development mode');
} else if (config.isProduction) {
  console.log('Running in production mode with fake data');
}
```

## Switching to Real API in Production

To use real API calls in production:

1. Update `src/config/config.js`:
```javascript
useRealAPI: true,  // Always use real API
useFakeData: false // Never use fake data
```

2. Ensure the production server is running and accessible
3. Update CORS settings to allow your production domain
4. Set proper environment variables

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check server CORS configuration and allowed origins
2. **API Timeout**: Increase timeout in config or check server response
3. **Authentication**: Ensure JWT tokens are properly stored and sent
4. **File Upload**: Check file size limits and supported formats

### Debug Mode

Enable debug logging in development:

```javascript
// In config.js
enableDebugLogging: process.env.NODE_ENV === 'development'
```

This will log all API requests and responses to the console. 