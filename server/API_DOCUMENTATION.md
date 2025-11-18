# Mr Demo Pro Server API Documentation

## OTP (One-Time Password) Endpoints

The OTP system provides secure authentication with email verification. In development mode, OTP is enforced, while in production it can be bypassed.

### Environment Behavior

- **Development Mode**: OTP is required unless bypassed with `X-Bypass-OTP: true` header
- **Production Mode**: OTP is optional and can be bypassed

### Authentication Headers

For bypassing OTP in development:
```
X-Bypass-OTP: true
```

### Endpoints

#### 1. Send OTP

**POST** `/api/otp/send`

Send a 6-digit OTP to the specified email address.

**Request Body:**
```json
{
  "email": "user@example.com",
  "type": "login" // "login", "registration", or "password-reset"
}
```

**Response (Development):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "email": "user@example.com",
  "type": "login",
  "expiresIn": "10 minutes",
  "note": "OTP code logged to server console only"
}
```

**Response (Production):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "email": "user@example.com",
  "type": "login",
  "expiresIn": "10 minutes"
}
```

#### 2. Verify OTP

**POST** `/api/otp/verify`

Verify the OTP and complete authentication.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "type": "login"
}
```

**Response (Login Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "role": "client"
  },
  "token": "jwt_token_here"
}
```

#### 3. Resend OTP

**POST** `/api/otp/resend`

Resend OTP to the same email address.

**Request Body:**
```json
{
  "email": "user@example.com",
  "type": "login"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP resent successfully",
  "email": "user@example.com",
  "type": "login",
  "expiresIn": "10 minutes"
}
```

#### 4. Check OTP Status (Development Only)

**GET** `/api/otp/status/:email?type=login`

Check the status of an active OTP for an email.

**Response:**
```json
{
  "hasActiveOTP": true,
  "otp": "123456",
  "expiresAt": "2024-01-01T12:00:00.000Z",
  "attempts": 0,
  "createdAt": "2024-01-01T11:50:00.000Z",
  "timeRemaining": 600000
}
```

### User Registration with OTP

**POST** `/api/users/register`

Register a new user with OTP verification (in development).

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "company": "ACME Corp",
  "otp": "123456"
}
```

**Headers (to bypass OTP):**
```
X-Bypass-OTP: true
```

### Error Responses

#### Invalid OTP
```json
{
  "error": "Invalid OTP",
  "message": "Invalid or expired OTP"
}
```

#### User Not Found
```json
{
  "error": "User not found",
  "message": "No account found with this email address"
}
```

#### OTP Required
```json
{
  "error": "OTP is required for registration"
}
```

### Usage Examples

#### 1. Login Flow

```javascript
// Step 1: Send OTP
const sendOTP = await fetch('/api/otp/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    type: 'login'
  })
});

// Step 2: Verify OTP (check server logs for code in development)
const verifyOTP = await fetch('/api/otp/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    otp: '123456', // Get from server console logs in development
    type: 'login'
  })
});
```

#### 2. Registration Flow

```javascript
// Step 1: Send OTP for registration
const sendOTP = await fetch('/api/otp/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'newuser@example.com',
    type: 'registration'
  })
});

// Step 2: Register with OTP
const register = await fetch('/api/users/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'newuser@example.com',
    password: 'password123',
    otp: '123456' // Get from server console logs in development
  })
});
```

#### 3. Bypass OTP (Development)

```javascript
// Bypass OTP for testing
const login = await fetch('/api/otp/verify', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'X-Bypass-OTP': 'true'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    otp: '000000', // Any 6 digits
    type: 'login'
  })
});

// Production testing (fixed code)
const loginProd = await fetch('/api/otp/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    otp: '338338', // Fixed code for production
    type: 'login'
  })
});
```

### Security Features

1. **OTP Expiration**: OTPs expire after 10 minutes
2. **Attempt Limiting**: Maximum 5 failed attempts per OTP
3. **Single Use**: Each OTP can only be used once
4. **Email Validation**: OTPs are tied to specific email addresses
5. **Type Validation**: Different OTP types for different operations

### Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| OTP Enforcement | Required (unless bypassed) | Optional |
| OTP Code | Random 6-digit (logged to console) | Fixed: 338338 |
| OTP Returned in Response | No (security) | No |
| Status Endpoint | Available | Disabled |
| Bypass Header | Supported | Supported |

### Testing

In development mode, you can:

1. **View OTP in server console logs** when sending emails
2. **Use the status endpoint** to check active OTPs
3. **Bypass OTP** using the `X-Bypass-OTP` header
4. **Use fixed code 338338** in production for testing

**Development Console Output:**
```
📧 [DEV] Email would be sent to: user@example.com
🔐 [DEV] OTP Code: 123456
📝 [DEV] Email Type: login
⏰ [DEV] Timestamp: 2024-01-01T12:00:00.000Z
---
```

### Email Integration

The system includes a placeholder email service that:
- Logs emails in development mode
- Can be integrated with real email services in production
- Supports HTML email templates
- Handles different email types (login, registration, password reset)

To integrate with a real email service, update the `emailService.js` file with your preferred provider (SendGrid, AWS SES, etc.). 