# Google OAuth Backend Setup Guide

## Overview

This guide covers the backend implementation for Google OAuth authentication in the ezPICRA application.

## Files Created/Modified

### 1. User Model (`server/models/User.js`)
- **Added Google OAuth fields:**
  - `googleId`: Unique Google user ID
  - `profilePicture`: User's Google profile picture URL
  - `isGoogleUser`: Boolean flag for Google OAuth users
- **Added indexes** for better query performance

### 2. Auth Routes (`server/routes/auth.js`)
- **POST `/api/auth/google`**: Handle Google OAuth authentication
- **GET `/api/auth/me`**: Get current user profile
- **POST `/api/auth/logout`**: Logout user
- **POST `/api/auth/refresh`**: Refresh JWT token
- **GET `/api/auth/test`**: Test Google OAuth configuration

### 3. Google OAuth Service (`server/services/googleOAuthService.js`)
- **Token verification**: Verify Google ID tokens and access tokens
- **User info retrieval**: Get user profile from Google
- **Data validation**: Validate user data from client
- **Error handling**: Comprehensive error handling for Google API calls

### 4. Server Configuration (`server/server.js`)
- **Added auth routes**: Registered `/api/auth` routes
- **CORS configuration**: Updated for Google OAuth domains

## Environment Variables

Add these to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-oauth-client-id-here

# JWT Configuration (if not already set)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## API Endpoints

### POST `/api/auth/google`
**Purpose**: Handle Google OAuth authentication

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "googleId": "123456789",
  "profilePicture": "https://example.com/photo.jpg",
  "isGoogleUser": true,
  "accessToken": "google-access-token" // Optional for verification
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profilePicture": "https://example.com/photo.jpg",
    "role": "client",
    "isGoogleUser": true
  }
}
```

### GET `/api/auth/me`
**Purpose**: Get current user profile

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    // User profile data
  }
}
```

### POST `/api/auth/logout`
**Purpose**: Logout user (updates last login timestamp)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST `/api/auth/refresh`
**Purpose**: Refresh JWT token

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "token": "new-jwt-token",
  "user": {
    // User profile data
  }
}
```

### GET `/api/auth/test`
**Purpose**: Test Google OAuth configuration

**Response:**
```json
{
  "success": true,
  "message": "Google OAuth configuration test",
  "config": {
    "googleClientId": "Configured",
    "jwtSecret": "Configured",
    "environment": "development"
  }
}
```

## Authentication Flow

1. **Client sends Google OAuth data** to `/api/auth/google`
2. **Server validates** the data and optionally verifies Google access token
3. **Server checks** if user exists by email or Google ID
4. **If user exists**: Updates Google information and last login
5. **If user doesn't exist**: Creates new user with Google data
6. **Server generates** JWT token and returns user data
7. **Client stores** JWT token for subsequent API calls

## Security Features

### Token Verification
- **Google access token verification** (optional)
- **JWT token validation** for protected routes
- **User status validation** (active/inactive)

### Data Validation
- **Email format validation**
- **Required field validation**
- **URL validation** for profile pictures
- **Input sanitization**

### Error Handling
- **Comprehensive error messages**
- **Duplicate key handling**
- **Google API error handling**
- **Graceful fallbacks**

## Database Schema Changes

### User Collection
```javascript
{
  // ... existing fields
  googleId: String,           // Unique Google user ID
  profilePicture: String,     // Google profile picture URL
  isGoogleUser: Boolean,      // Flag for Google OAuth users
  // ... existing fields
}
```

### Indexes Added
```javascript
userSchema.index({ googleId: 1 });
userSchema.index({ isGoogleUser: 1 });
```

## Testing

### 1. Test Configuration
```bash
curl http://localhost:5000/api/auth/test
```

### 2. Test Google OAuth (with mock data)
```bash
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "googleId": "123456789",
    "profilePicture": "https://example.com/photo.jpg",
    "isGoogleUser": true
  }'
```

## Dependencies

### New Dependencies
- `google-auth-library`: Google OAuth token verification

### Installation
```bash
npm install google-auth-library
```

## Troubleshooting

### Common Issues

1. **"Google Client ID not configured"**
   - Ensure `GOOGLE_CLIENT_ID` is set in environment variables
   - Verify the client ID matches your Google Cloud Console

2. **"Invalid Google access token"**
   - Check if the access token is valid and not expired
   - Verify the token is from the correct Google OAuth client

3. **"User with this email already exists"**
   - The system prevents duplicate emails
   - Existing users can link their Google account

4. **"JWT token invalid"**
   - Ensure `JWT_SECRET` is properly configured
   - Check token expiration

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=google-oauth:*
```

## Production Considerations

1. **Environment Variables**
   - Use strong JWT secrets
   - Configure production Google OAuth client ID
   - Set proper CORS origins

2. **Security**
   - Enable HTTPS in production
   - Implement rate limiting
   - Add request logging

3. **Monitoring**
   - Monitor authentication failures
   - Track Google OAuth usage
   - Log security events

## Integration with Frontend

The backend is designed to work with the React frontend using:
- **JWT tokens** for session management
- **Bearer token authentication** for API calls
- **Consistent response format** for error handling

## Next Steps

1. **Configure Google Cloud Console** with your OAuth client ID
2. **Test the authentication flow** with the frontend
3. **Monitor logs** for any issues
4. **Implement additional security measures** as needed
