# Google OAuth Setup Guide

## Prerequisites

1. **Google Cloud Console Account**: You need a Google Cloud Console account
2. **Domain Verification**: Your domain should be verified in Google Cloud Console

## Step 1: Create Google OAuth 2.0 Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `http://localhost:3001` (for development)
     - `https://yourdomain.com` (for production)
   - Add authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - `http://localhost:3001` (for development)
     - `https://yourdomain.com` (for production)
5. Copy the Client ID

## Step 2: Environment Configuration

Create a `.env` file in the `client` directory with:

```env
REACT_APP_GOOGLE_CLIENT_ID=your-actual-client-id-here
REACT_APP_API_URL=http://localhost:5000
```

## Step 3: Server-Side Setup

The server needs to handle Google authentication. Add these routes to your server:

### Backend Routes Needed:

1. **POST /api/auth/google** - Handle Google authentication
2. **User model updates** - Add Google ID field
3. **JWT token generation** - For authenticated users

### Example Server Route:

```javascript
// POST /api/auth/google
app.post('/api/auth/google', async (req, res) => {
  try {
    const { email, firstName, lastName, googleId, profilePicture } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user
      user = new User({
        email,
        firstName,
        lastName,
        googleId,
        profilePicture,
        isGoogleUser: true
      });
      await user.save();
    } else {
      // Update existing user with Google info
      user.googleId = googleId;
      user.profilePicture = profilePicture;
      user.isGoogleUser = true;
      await user.save();
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
});
```

## Step 4: User Model Updates

Update your User model to include Google-specific fields:

```javascript
const userSchema = new mongoose.Schema({
  // ... existing fields
  googleId: String,
  profilePicture: String,
  isGoogleUser: { type: Boolean, default: false }
});
```

## Step 5: Testing

1. Start your development server
2. Navigate to the auth page
3. Click "Continue with Google"
4. Complete the Google OAuth flow
5. Verify you're redirected to the dashboard

## Troubleshooting

### Common Issues:

1. **"Invalid Client ID"**: Make sure your client ID is correct and the domain is authorized
2. **"Redirect URI mismatch"**: Ensure your redirect URIs match exactly
3. **CORS errors**: Make sure your server allows requests from your client domain
4. **JWT errors**: Ensure your JWT_SECRET is properly configured

### Development vs Production:

- **Development**: Use `http://localhost:3000` and `http://localhost:3001`
- **Production**: Use your actual domain (e.g., `https://app.ezpicra.com`)

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **Token Storage**: Store JWT tokens securely
3. **User Validation**: Validate Google tokens on the server side
4. **Rate Limiting**: Implement rate limiting for auth endpoints
