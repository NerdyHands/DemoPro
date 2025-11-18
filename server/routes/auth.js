const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const GoogleOAuthService = require('../services/googleOAuthService');
const otpService = require('../services/otpService');
const emailService = require('../utils/emailService');
const router = express.Router();

// Initialize Google OAuth service
const googleOAuthService = new GoogleOAuthService();

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Middleware to check if user is authenticated
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// POST /api/auth/send-otp - Send OTP for login/registration
router.post('/send-otp', [
  body('email').isEmail().normalizeEmail(),
  body('type').isIn(['login', 'registration'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, type } = req.body;

    console.log(`📧 OTP request for ${type}:`, email);

    // Check if user exists for login vs registration
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (type === 'login' && !user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address. Please sign up for a new account.'
      });
    }

    if (type === 'registration' && user) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in instead.'
      });
    }

    // Create and send OTP using database
    const isDev = process.env.NODE_ENV === 'development';
    console.log(`📝 ${isDev ? '[DEV]' : '[PROD]'} Creating OTP for:`, email, 'type:', type);
    const otpDoc = await OTP.createForEmail(email, type);
    console.log(`✅ ${isDev ? '[DEV]' : '[PROD]'} OTP Created:`, {
      otp: isDev ? otpDoc.otp : '***HIDDEN***',
      email: otpDoc.email,
      type: otpDoc.type,
      expiresAt: otpDoc.expiresAt,
      createdAt: otpDoc.createdAt
    });
    
    const emailResult = await emailService.sendOTP(email, otpDoc.otp, type);

    if (!emailResult.success) {
      return res.status(500).json({ 
        success: false,
        message: 'Failed to send OTP email'
      });
    }
    
    if (isDev) {
      console.log('✅ [DEV] OTP created and logged to console for:', email);
      console.log('🔑 [DEV] Client will receive OTP in API response');
    } else {
      console.log('✅ [PROD] OTP email sent successfully to:', email);
    }
    
    res.json({
      success: true,
      message: isDev ? 'OTP created - check page for code' : 'OTP email sent successfully',
      email: email,
      type: type,
      expiresIn: '10 minutes',
      ...(isDev && { 
        note: 'OTP code displayed on page in development mode',
        devOtp: otpDoc.otp  // Include OTP in response for dev mode
      })
    });

  } catch (error) {
    console.error('❌ OTP sending error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
});

// POST /api/auth/verify-otp - Verify OTP for login
router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  body('type').isIn(['login', 'registration'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, otp, type } = req.body;

    console.log(`🔐 OTP verification for ${type}:`, email);

    // Verify OTP using database
    const verificationResult = await OTP.verifyOTP(email, otp, type);
    
    if (!verificationResult.valid) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message
      });
    }

    // OTP is valid - proceed with login or registration
    if (type === 'login') {
      // Find user and generate token
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User not found or account inactive'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = generateToken(user._id);

      console.log('✅ Login successful:', user.email);

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          role: user.role,
          isGoogleUser: user.isGoogleUser
        }
      });

    } else if (type === 'registration') {
      // This should be handled by the registration endpoint
      // For now, return success but require additional registration data
      res.json({
        success: true,
        message: 'OTP verified successfully. Please complete registration.',
        requiresRegistration: true
      });
    }

  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    });
  }
});

// POST /api/auth/register - Complete registration after OTP verification
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  body('company').optional().trim(),
  body('userType').optional().isIn(['client', 'admin']),
  body('role').optional().isIn(['client', 'admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { 
      email, 
      firstName, 
      lastName, 
      otp, 
      company, 
      userType = 'client',
      role = 'client'
    } = req.body;

    console.log('📝 Registration attempt:', email);

    // Verify OTP first using database
    const verificationResult = await OTP.verifyOTP(email, otp, 'registration');
    
    if (!verificationResult.valid) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      firstName,
      lastName,
      company,
      userType,
      role,
      isActive: true,
      lastLogin: new Date()
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(email, firstName);
    } catch (emailError) {
      console.warn('⚠️ Failed to send welcome email:', emailError.message);
    }

    // Send admin notification email
    try {
      await emailService.sendNewUserNotification({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        userType: user.userType,
        role: user.role,
        isGoogleUser: false
      });
    } catch (emailError) {
      console.warn('⚠️ Failed to send admin notification:', emailError.message);
    }

    console.log('✅ Registration successful:', user.email);

    res.json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        role: user.role,
        userType: user.userType
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

// POST /api/auth/google - Google OAuth authentication
router.post('/google', [
  body('email').isEmail().normalizeEmail(),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('googleId').trim().isLength({ min: 1 }),
  body('profilePicture').optional().isURL(),
  body('isGoogleUser').optional().isBoolean(),
  body('accessToken').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { 
      email, 
      firstName, 
      lastName, 
      googleId, 
      profilePicture, 
      isGoogleUser = true,
      accessToken
    } = req.body;

    console.log('🔐 Google OAuth authentication attempt:', { email, googleId });

    // Optional: Verify Google access token if provided
    if (accessToken) {
      const tokenVerification = await googleOAuthService.verifyAccessToken(accessToken);
      if (!tokenVerification.success) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Google access token'
        });
      }
    }

    // Validate user data
    const validation = googleOAuthService.validateUserData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data',
        errors: validation.errors
      });
    }

    // Check if user exists by email or googleId
    let user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { googleId: googleId }
      ]
    });

    if (user) {
      // User exists - update with Google information
      console.log('👤 Existing user found, updating Google info:', user.email);
      
      user.googleId = googleId;
      user.profilePicture = profilePicture;
      user.isGoogleUser = true;
      user.lastLogin = new Date();
      
      // Update name if provided and different
      if (firstName && user.firstName !== firstName) {
        user.firstName = firstName;
      }
      if (lastName && user.lastName !== lastName) {
        user.lastName = lastName;
      }

      await user.save();
    } else {
      // Create new user
      console.log('🆕 Creating new user with Google OAuth:', email);
      
      user = new User({
        email: email.toLowerCase(),
        firstName,
        lastName,
        googleId,
        profilePicture,
        isGoogleUser: true,
        role: 'client', // Default role for Google OAuth users
        isActive: true,
        lastLogin: new Date()
      });

      await user.save();

      // Send admin notification for new user
      try {
        await emailService.sendNewUserNotification({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          company: user.company,
          userType: user.userType,
          role: user.role,
          googleId: user.googleId,
          isGoogleUser: true
        });
      } catch (emailError) {
        console.warn('⚠️ Failed to send admin notification:', emailError.message);
      }
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send welcome email for new users
    if (!user.lastLogin || user.lastLogin < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      try {
        await emailService.sendWelcomeEmail(user.email, user.firstName);
      } catch (emailError) {
        console.warn('⚠️ Failed to send welcome email:', emailError.message);
      }
    }

    console.log('✅ Google OAuth authentication successful:', user.email);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        role: user.role,
        isGoogleUser: user.isGoogleUser
      }
    });

  } catch (error) {
    console.error('❌ Google OAuth authentication error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed. Please try again.'
    });
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', authenticateUser, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
});

// POST /api/auth/logout - Logout user (client-side token removal)
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    // Update last login (optional - for tracking)
    req.user.lastLogin = new Date();
    await req.user.save();

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// POST /api/auth/refresh - Refresh JWT token
router.post('/refresh', authenticateUser, async (req, res) => {
  try {
    const newToken = generateToken(req.user._id);
    
    res.json({
      success: true,
      token: newToken,
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
});

// GET /api/auth/test - Test Google OAuth configuration
router.get('/test', async (req, res) => {
  try {
    const config = {
      googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured',
      jwtSecret: process.env.JWT_SECRET ? 'Configured' : 'Not configured',
      environment: process.env.NODE_ENV || 'development'
    };

    res.json({
      success: true,
      message: 'Google OAuth configuration test',
      config
    });
  } catch (error) {
    console.error('Error testing Google OAuth config:', error);
    res.status(500).json({
      success: false,
      message: 'Configuration test failed'
    });
  }
});

// GET /api/auth/debug-otp - Debug endpoint to get current OTP (development only)
router.get('/debug-otp', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Debug endpoint not available in production'
      });
    }

    const { email, type } = req.query;
    
    if (!email || !type) {
      return res.status(400).json({
        success: false,
        message: 'Email and type parameters required'
      });
    }

    // Get OTP from database
    const otpDoc = await OTP.findOne({
      email: email.toLowerCase(),
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.json({
        success: false,
        message: 'No OTP found for this email and type',
        email,
        type
      });
    }

    const isExpired = new Date() > otpDoc.expiresAt;
    const timeLeft = Math.max(0, otpDoc.expiresAt - new Date());

    res.json({
      success: true,
      message: 'OTP debug info',
      email,
      type,
      otp: otpDoc.otp,
      isExpired,
      timeLeftMs: timeLeft,
      timeLeftMinutes: Math.floor(timeLeft / 60000),
      attempts: otpDoc.attempts,
      maxAttempts: 3
    });
  } catch (error) {
    console.error('Error in debug OTP endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Debug endpoint error'
    });
  }
});

module.exports = router;
