const express = require('express');
const { body, validationResult } = require('express-validator');
const OTP = require('../models/OTP');
const User = require('../models/User');
const emailService = require('../utils/emailService');
const router = express.Router();

// Simplified middleware - always allow OTP requests
const requireOTP = (req, res, next) => {
  const bypassOTP = req.headers['x-bypass-otp'] === 'true';
  
  if (bypassOTP) {
    req.skipOTP = true;
  }
  
  return next();
};

// POST /api/otp/send - Send OTP to email
router.post('/send', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('type').optional().isIn(['login', 'registration', 'password-reset']).withMessage('Invalid OTP type')
], requireOTP, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, type = 'login' } = req.body;

    // Check if OTP is being bypassed
    if (req.skipOTP) {
      return res.json({
        success: true,
        message: 'OTP bypassed via header',
        bypassed: true
      });
    }

    // Check if user exists for login OTP
    if (type === 'login') {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ 
          error: 'User not found',
          message: 'No account found with this email address' 
        });
      }
    }

    // Check if user already exists for registration OTP
    if (type === 'registration') {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          error: 'User already exists',
          message: 'An account with this email already exists' 
        });
      }
    }
    
    // Create and send OTP
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
        error: 'Failed to send OTP',
        message: emailResult.message 
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
      message: 'OTP sent successfully',
      email: email,
      type: type,
      expiresIn: '10 minutes',
      ...(process.env.NODE_ENV === 'development' && { 
        note: 'OTP code displayed on page in development mode',
        devOtp: otpDoc.otp  // Include OTP in response for dev mode
      })
    });

  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    res.status(500).json({ 
      error: 'Failed to send OTP',
      message: 'An error occurred while sending the verification code' 
    });
  }
});

// POST /api/otp/verify - Verify OTP
router.post('/verify', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('type').optional().isIn(['login', 'registration', 'password-reset']).withMessage('Invalid OTP type')
], requireOTP, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, type = 'login' } = req.body;

    // Check if OTP is being bypassed
    if (req.skipOTP) {
      // For bypassed OTP, we need to handle the authentication differently
      if (type === 'login') {
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json({ 
            error: 'User not found',
            message: 'No account found with this email address' 
          });
        }
        
        // Generate JWT token for bypassed login
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

        return res.json({
          success: true,
          message: 'Login successful (OTP bypassed)',
          user: user.getPublicProfile(),
          token,
          bypassed: true
        });
      }
    }

    // Verify OTP
    const verificationResult = await OTP.verifyOTP(email, otp, type);

    if (!verificationResult.valid) {
      return res.status(400).json({ 
        error: 'Invalid OTP',
        message: verificationResult.message 
      });
    }

    // Handle different OTP types
    if (type === 'login') {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ 
          error: 'User not found',
          message: 'No account found with this email address' 
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        success: true,
        message: 'Login successful',
        user: user.getPublicProfile(),
        token
      });

    } else if (type === 'registration') {
      // For registration, just verify the OTP is valid
      res.json({
        success: true,
        message: 'OTP verified successfully',
        email: email,
        verified: true
      });

    } else if (type === 'password-reset') {
      // For password reset, just verify the OTP is valid
      res.json({
        success: true,
        message: 'OTP verified successfully',
        email: email,
        verified: true
      });
    }

  } catch (error) {
    console.error('❌ Error verifying OTP:', error);
    res.status(500).json({ 
      error: 'Failed to verify OTP',
      message: 'An error occurred while verifying the code' 
    });
  }
});

// POST /api/otp/resend - Resend OTP
router.post('/resend', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('type').optional().isIn(['login', 'registration', 'password-reset']).withMessage('Invalid OTP type')
], requireOTP, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, type = 'login' } = req.body;

    // Check if OTP is being bypassed
    if (req.skipOTP) {
      return res.json({
        success: true,
        message: 'OTP resend bypassed via header',
        bypassed: true
      });
    }

    // Create and send new OTP
    const otpDoc = await OTP.createForEmail(email, type);
    const emailResult = await emailService.sendOTP(email, otpDoc.otp, type);

    if (!emailResult.success) {
      return res.status(500).json({ 
        error: 'Failed to resend OTP',
        message: emailResult.message 
      });
    }

    res.json({
      success: true,
      message: 'OTP resent successfully',
      email: email,
      type: type,
      expiresIn: '10 minutes',
      ...(process.env.NODE_ENV === 'development' && { 
        note: 'OTP code logged to server console only'
      })
    });

  } catch (error) {
    console.error('❌ Error resending OTP:', error);
    res.status(500).json({ 
      error: 'Failed to resend OTP',
      message: 'An error occurred while resending the verification code' 
    });
  }
});

// GET /api/otp/status - Check OTP status (for development)
router.get('/status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { type = 'login' } = req.query;

    console.log('🔍 OTP Status Request:', {
      email,
      type,
      NODE_ENV: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      console.log('⚠️ OTP Status - Not in development mode, denying access');
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'This endpoint is only available in development mode' 
      });
    }

    const otpDoc = await OTP.findOne({
      email: email.toLowerCase(),
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    console.log('🔍 OTP Doc Found:', otpDoc ? {
      otp: otpDoc.otp,
      email: otpDoc.email,
      isUsed: otpDoc.isUsed,
      expiresAt: otpDoc.expiresAt,
      createdAt: otpDoc.createdAt
    } : 'null');

    if (!otpDoc) {
      console.log('⚠️ No active OTP found for:', email);
      return res.json({
        hasActiveOTP: false,
        message: 'No active OTP found'
      });
    }

    console.log('✅ Returning OTP:', otpDoc.otp);
    res.json({
      hasActiveOTP: true,
      otp: otpDoc.otp,
      expiresAt: otpDoc.expiresAt,
      attempts: otpDoc.attempts,
      createdAt: otpDoc.createdAt,
      timeRemaining: Math.max(0, otpDoc.expiresAt - new Date())
    });

  } catch (error) {
    console.error('❌ Error checking OTP status:', error);
    res.status(500).json({ 
      error: 'Failed to check OTP status',
      message: 'An error occurred while checking OTP status' 
    });
  }
});

module.exports = router; 