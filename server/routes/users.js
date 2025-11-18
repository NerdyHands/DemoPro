const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

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

// POST /api/users/register - Register a new user
router.post('/register', [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('role').optional().isIn(['admin', 'manager', 'inspector', 'client']).withMessage('Invalid role'),
  body('isWaitlisted').optional().isBoolean().withMessage('isWaitlisted must be a boolean'),
  body('waitlistReason').optional().trim().isLength({ max: 200 }).withMessage('Waitlist reason cannot exceed 200 characters'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { otp, ...userData } = req.body;
    const isDevelopment = process.env.NODE_ENV === 'development';
    const bypassOTP = req.headers['x-bypass-otp'] === 'true';
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Verify OTP (required for OTP-based registration)
    const OTP = require('../models/OTP');
    const verificationResult = await OTP.verifyOTP(userData.email, otp, 'registration');
    
    if (!verificationResult.valid) {
      return res.status(400).json({ 
        error: 'Invalid OTP',
        message: verificationResult.message 
      });
    }
    
    const user = new User(userData);
    await user.save();
    
    const token = generateToken(user._id);
    
    // Send welcome email
    const emailService = require('../utils/emailService');
    emailService.sendWelcomeEmail(userData.email, userData.firstName);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: user.getPublicProfile(),
      token,
      ...(isDevelopment && !bypassOTP && { note: 'OTP verification completed' })
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// POST /api/users/login - Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('otp').notEmpty().withMessage('OTP is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, otp } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify OTP
    const OTP = require('../models/OTP');
    const verificationResult = await OTP.verifyOTP(email, otp, 'login');
    
    if (!verificationResult.valid) {
      return res.status(401).json({ 
        error: 'Invalid OTP',
        message: verificationResult.message 
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    const token = generateToken(user._id);
    
    res.json({
      message: 'Login successful',
      user: user.getPublicProfile(),
      token
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// GET /api/users/profile - Get current user profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    res.json({
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/users/profile - Update current user profile
router.put('/profile', [
  authenticateUser,
  body('firstName').optional().trim().isLength({ min: 1 }).withMessage('First name cannot be empty'),
  body('lastName').optional().trim().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('preferences').optional().isObject().withMessage('Preferences must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Update allowed fields only
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'company', 'preferences'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    Object.assign(req.user, updates);
    await req.user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PUT /api/users/password - Change password (Disabled for OTP-only auth)
router.put('/password', [
  authenticateUser
], async (req, res) => {
  res.status(400).json({ 
    error: 'Password change not available',
    message: 'This application uses OTP-based authentication only' 
  });
});

// GET /api/users/stats - Get user statistics by type (admin only)
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 [USERS] GET /api/users/stats - User:', req.user.email, 'Role:', req.user.role);
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      console.log('❌ [USERS] Access denied - User is not admin');
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get user counts by type using aggregation for better performance
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const aggregationResult = await User.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          admin: {
            $sum: {
              $cond: [
                { $eq: ['$role', 'admin'] },
                1,
                0
              ]
            }
          },
          waitlisted: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$isWaitlisted', true] }
                ]},
                1,
                0
              ]
            }
          },
          client: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$role', 'client'] },
                  { $ne: ['$isWaitlisted', true] }
                ]},
                1,
                0
              ]
            }
          },
          recentAdmins: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$role', 'admin'] },
                  { $gte: ['$createdAt', thirtyDaysAgo] }
                ]},
                1,
                0
              ]
            }
          },
          recentWaitlisted: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$isWaitlisted', true] },
                  { $gte: ['$createdAt', thirtyDaysAgo] }
                ]},
                1,
                0
              ]
            }
          },
          recentClients: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$role', 'client'] },
                  { $ne: ['$isWaitlisted', true] },
                  { $gte: ['$createdAt', thirtyDaysAgo] }
                ]},
                1,
                0
              ]
            }
          },
          activeAdmins: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$role', 'admin'] },
                  { $gte: ['$lastLogin', sevenDaysAgo] }
                ]},
                1,
                0
              ]
            }
          },
          activeWaitlisted: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$isWaitlisted', true] },
                  { $gte: ['$lastLogin', sevenDaysAgo] }
                ]},
                1,
                0
              ]
            }
          },
          activeClients: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$role', 'client'] },
                  { $ne: ['$isWaitlisted', true] },
                  { $gte: ['$lastLogin', sevenDaysAgo] }
                ]},
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    const result = aggregationResult[0] || {
      total: 0,
      admin: 0,
      waitlisted: 0,
      client: 0,
      recentAdmins: 0,
      recentWaitlisted: 0,
      recentClients: 0,
      activeAdmins: 0,
      activeWaitlisted: 0,
      activeClients: 0
    };
    
    const stats = {
      admin: {
        total: result.admin,
        recent: result.recentAdmins,
        active: result.activeAdmins,
        percentage: result.total > 0 ? Math.round((result.admin / result.total) * 100) : 0
      },
      waitlist: {
        total: result.waitlisted,
        recent: result.recentWaitlisted,
        active: result.activeWaitlisted,
        percentage: result.total > 0 ? Math.round((result.waitlisted / result.total) * 100) : 0
      },
      client: {
        total: result.client,
        recent: result.recentClients,
        active: result.activeClients,
        percentage: result.total > 0 ? Math.round((result.client / result.total) * 100) : 0
      },
      total: result.total
    };
    
    console.log('✅ [USERS] User stats calculated:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// GET /api/users - Get all users (admin only)
router.get('/', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 [USERS] GET /api/users - User:', req.user.email, 'Role:', req.user.role);
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      console.log('❌ [USERS] Access denied - User is not admin');
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { role, isActive, isWaitlisted, search, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (isWaitlisted !== undefined) {
      filter.isWaitlisted = isWaitlisted === 'true';
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    const users = await User.find(filter)
      .select('-resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(filter);
    
    console.log('✅ [USERS] Found', users.length, 'users out of', total, 'total');
    
    const response = {
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
    
    console.log('📤 [USERS] Sending response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/by-type/:type - Get users by type (admin only)
router.get('/by-type/:type', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 [USERS] GET /api/users/by-type/:type - User:', req.user.email, 'Type:', req.params.type);
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      console.log('❌ [USERS] Access denied - User is not admin');
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { type } = req.params;
    const { page = 1, limit = 10, search } = req.query;
    
    // Build filter based on type
    let filter = { isActive: true };
    
    switch (type) {
      case 'admin':
        filter.role = 'admin';
        break;
      case 'waitlist':
        filter.isWaitlisted = true;
        break;
      case 'client':
        filter.role = 'client';
        filter.isWaitlisted = false;
        break;
      default:
        return res.status(400).json({ error: 'Invalid user type. Must be admin, waitlist, or client' });
    }
    
    // Add search filter if provided
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    const users = await User.find(filter)
      .select('-resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(filter);
    
    console.log('✅ [USERS] Found', users.length, 'users of type', type, 'out of', total, 'total');
    
    const response = {
      users,
      type,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching users by type:', error);
    res.status(500).json({ error: 'Failed to fetch users by type' });
  }
});

// GET /api/users/:id - Get specific user (admin only)
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    // Check if user is admin or requesting their own profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const user = await User.findById(req.params.id)
      .select('-resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', [
  authenticateUser,
  body('firstName').optional().trim().isLength({ min: 1 }).withMessage('First name cannot be empty'),
  body('lastName').optional().trim().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
  body('role').optional().isIn(['admin', 'manager', 'inspector', 'client']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update allowed fields
    const allowedUpdates = ['firstName', 'lastName', 'role', 'isActive', 'company'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    Object.assign(user, updates);
    await user.save();
    
    res.json({
      message: 'User updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    
    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// POST /api/users/logout - Logout user
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

module.exports = router; 