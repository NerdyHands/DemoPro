# OTP Authentication Setup Guide

## Overview

This document describes the OTP (One-Time Password) authentication system implemented in the ezPICRA server. The system supports both login and registration flows using email-based OTP verification.

## Architecture

### Components

1. **OTP Service** (`services/otpService.js`)
   - Generates 6-digit OTP codes
   - Manages OTP storage and expiry
   - Handles rate limiting
   - Validates OTP attempts

2. **Email Service** (`utils/emailService.js`)
   - Sends OTP emails
   - Handles development vs production modes
   - Generates HTML email templates

3. **Auth Routes** (`routes/auth.js`)
   - `/api/auth/send-otp` - Send OTP for login/registration
   - `/api/auth/verify-otp` - Verify OTP for login
   - `/api/auth/register` - Complete registration after OTP verification

## API Endpoints

### 1. Send OTP

**Endpoint:** `POST /api/auth/send-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "type": "login" | "registration"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "note": "OTP code logged to server console only" // Development only
}
```

**Error Responses:**
- `400` - Invalid email format
- `404` - User not found (for login)
- `409` - User already exists (for registration)
- `429` - Rate limit exceeded

### 2. Verify OTP (Login)

**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "type": "login"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profilePicture": "url",
    "role": "client",
    "isGoogleUser": false
  }
}
```

### 3. Register User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "otp": "123456",
  "company": "Company Name", // Optional
  "userType": "client", // Optional, default: "client"
  "role": "client" // Optional, default: "client"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "company": "Company Name",
    "role": "client",
    "userType": "client"
  }
}
```

## Security Features

### Rate Limiting
- Maximum 3 OTP requests per minute per email
- Prevents abuse and spam

### OTP Expiry
- OTP codes expire after 10 minutes
- Automatic cleanup of expired OTPs

### Attempt Limiting
- Maximum 3 failed OTP attempts
- OTP is invalidated after max attempts

### Email Validation
- Validates email format before sending OTP
- Checks user existence for login vs registration

## Development vs Production

### Development Mode
- OTP codes are logged to server console
- No actual emails sent
- Faster testing and development

### Production Mode
- Real emails sent via configured email service
- OTP codes not logged for security
- Rate limiting enforced

## Client Integration

### Frontend API Service
The client uses the following endpoints:

```javascript
// Send OTP
await apiService.sendOTP(email, type);

// Verify OTP for login
await apiService.verifyOTP(email, otp, type);

// Register user
await apiService.register(userData);
```

### Authentication Flow

#### Login Flow:
1. User enters email
2. Client calls `/api/auth/send-otp` with `type: "login"`
3. Server validates user exists, sends OTP
4. User enters OTP
5. Client calls `/api/auth/verify-otp` with `type: "login"`
6. Server verifies OTP, returns JWT token
7. Client stores token and redirects to dashboard

#### Registration Flow:
1. User enters email and personal info
2. Client calls `/api/auth/send-otp` with `type: "registration"`
3. Server validates email not in use, sends OTP
4. User enters OTP
5. Client calls `/api/auth/register` with all user data + OTP
6. Server verifies OTP, creates user, returns JWT token
7. Client stores token and redirects to dashboard

## Error Handling

### Common Error Messages

| Error | HTTP Code | Message |
|-------|-----------|---------|
| Invalid email | 400 | Invalid email format |
| User not found | 404 | No account found with this email address. Please sign up for a new account. |
| User exists | 409 | An account with this email already exists. Please log in instead. |
| Rate limited | 429 | Too many OTP requests. Please wait before requesting another. |
| Invalid OTP | 400 | Invalid OTP |
| Expired OTP | 400 | OTP has expired |
| Too many attempts | 400 | Too many failed attempts. Please request a new OTP. |

## Testing

### Manual Testing

1. **Test Registration:**
```bash
# Send OTP for registration
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","type":"registration"}'

# Register user (use OTP from server logs)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"John","lastName":"Doe","otp":"123456"}'
```

2. **Test Login:**
```bash
# Send OTP for login
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","type":"login"}'

# Verify OTP for login
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456","type":"login"}'
```

### Automated Testing

The system includes comprehensive error handling and validation:
- Email format validation
- User existence checks
- Rate limiting
- OTP expiry handling
- Attempt limiting

## Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (for production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
```

### OTP Settings

```javascript
// In otpService.js
this.otpExpiry = 10 * 60 * 1000; // 10 minutes
maxAttempts: 3 // Max failed attempts
rateLimitWindow = 60 * 1000; // 1 minute
maxRequests = 3 // Max requests per minute
```

## Monitoring and Logging

### Server Logs

The system logs all OTP-related activities:

```
📧 OTP request for login: user@example.com
✅ OTP sent successfully for login: user@example.com
🔐 OTP verification for login: user@example.com
✅ Login successful: user@example.com
```

### Development Mode

In development, OTP codes are logged to console:
```
📧 [DEV] Email would be sent to: user@example.com
🔐 [DEV] OTP Code: 123456
📝 [DEV] Email Type: login
⏰ [DEV] Timestamp: 2024-01-01T12:00:00.000Z
```

## Security Best Practices

1. **OTP Storage**: In production, use Redis or database instead of in-memory Map
2. **Email Service**: Integrate with reliable email service (SendGrid, AWS SES)
3. **Rate Limiting**: Implement IP-based rate limiting for additional security
4. **HTTPS**: Always use HTTPS in production
5. **JWT Expiry**: Set appropriate JWT token expiry times
6. **Logging**: Avoid logging sensitive information in production

## Troubleshooting

### Common Issues

1. **OTP not received**
   - Check server logs for OTP code (development)
   - Verify email service configuration (production)
   - Check rate limiting

2. **Invalid OTP errors**
   - Ensure OTP is entered within 10 minutes
   - Check for typos in OTP entry
   - Verify OTP hasn't exceeded max attempts

3. **Rate limiting errors**
   - Wait 1 minute before requesting new OTP
   - Check if multiple requests were made

4. **User not found errors**
   - Verify email address is correct
   - Check if user exists in database
   - Use registration flow for new users

## Future Enhancements

1. **SMS OTP**: Add SMS-based OTP delivery
2. **Backup Codes**: Generate backup codes for account recovery
3. **Device Trusting**: Remember trusted devices
4. **Multi-factor Authentication**: Combine OTP with other factors
5. **Audit Logging**: Enhanced logging for security monitoring
