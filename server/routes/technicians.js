const express = require('express');
const { body, validationResult } = require('express-validator');
const Technician = require('../models/Technician');
const User = require('../models/User');
const Job = require('../models/Job');
const router = express.Router();

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to check if user is authenticated
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = require('jsonwebtoken').verify(token, JWT_SECRET);
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

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET /api/technicians - Get all technicians
router.get('/', authenticateUser, async (req, res) => {
  try {
    console.log('📖 Getting all technicians...');
    
    const { 
      availability, 
      specialization, 
      isActive = 'true',
      page = 1, 
      limit = 50,
      sortBy = 'firstName',
      sortOrder = 'asc'
    } = req.query;
    
    // Build filter
    const filter = {};
    if (isActive !== 'all') {
      filter.isActive = isActive === 'true';
    }
    if (availability) {
      filter.availability = availability;
    }
    if (specialization) {
      filter.specializations = { $in: [specialization] };
    }
    
    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const technicians = await Technician.find(filter)
      .populate('userId', 'email lastLogin')
      .populate('currentJobs', 'jobId title status')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Technician.countDocuments(filter);
    
    res.json({
      success: true,
      message: 'Technicians retrieved successfully',
      technicians,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + technicians.length < total,
        hasPrev: parseInt(page) > 1,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('❌ Error getting technicians:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/technicians/available - Get available technicians for job assignment
router.get('/available', authenticateUser, async (req, res) => {
  try {
    console.log('📖 Getting available technicians...');
    
    const { skills, location, urgency } = req.query;
    const skillsArray = skills ? skills.split(',') : [];
    
    const filter = {
      isActive: true,
      availability: 'Available'
    };
    
    if (skillsArray.length > 0) {
      filter.specializations = { $in: skillsArray };
    }
    
    let technicians = await Technician.find(filter)
      .populate('userId', 'email')
      .populate('currentJobs', 'jobId title status priority')
      .sort({ 'rating.average': -1, currentJobCount: 1 });
    
    // Filter by capacity (less than 5 current jobs)
    technicians = technicians.filter(tech => tech.currentJobCount < 5);
    
    // If location provided, sort by distance (would need geolocation logic)
    if (location) {
      // TODO: Implement geolocation sorting
    }
    
    // If urgent, prioritize technicians with fewer current jobs
    if (urgency === 'high') {
      technicians.sort((a, b) => a.currentJobCount - b.currentJobCount);
    }
    
    res.json({
      success: true,
      message: 'Available technicians retrieved successfully',
      technicians: technicians.map(tech => ({
        ...tech.toObject(),
        canTakeJob: tech.canTakeJob(),
        currentJobCount: tech.currentJobCount,
        skillMatch: skillsArray.length > 0 ? 
          skillsArray.filter(skill => tech.specializations.includes(skill)).length / skillsArray.length 
          : 1
      }))
    });
  } catch (error) {
    console.error('❌ Error getting available technicians:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// POST /api/technicians - Create new technician
router.post('/', authenticateUser, requireAdmin, [
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('First name is required (1-50 characters)'),
  body('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required (1-50 characters)'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('specializations').isArray({ min: 1 }).withMessage('At least one specialization is required'),
  body('hourlyRate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    console.log('📝 Creating new technician...');
    
    // Check if user exists and is not already a technician
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const existingTechnician = await Technician.findOne({ userId: req.body.userId });
    if (existingTechnician) {
      return res.status(400).json({
        success: false,
        error: 'User is already registered as a technician'
      });
    }
    
    // Check for duplicate email
    const emailExists = await Technician.findOne({ email: req.body.email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered for another technician'
      });
    }
    
    const technician = new Technician(req.body);
    const savedTechnician = await technician.save();
    
    // Populate the user reference
    await savedTechnician.populate('userId', 'email role');
    
    console.log('✅ Technician created successfully:', savedTechnician.technicianId);
    
    res.status(201).json({
      success: true,
      message: 'Technician created successfully',
      technician: savedTechnician
    });
  } catch (error) {
    console.error('❌ Error creating technician:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/technicians/:id - Get specific technician
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📖 Getting technician:', id);
    
    const technician = await Technician.findById(id)
      .populate('userId', 'email lastLogin createdAt')
      .populate({
        path: 'currentJobs',
        populate: {
          path: 'customer',
          select: 'firstName lastName'
        }
      });
    
    if (!technician) {
      return res.status(404).json({
        success: false,
        error: 'Technician not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Technician retrieved successfully',
      technician: {
        ...technician.toObject(),
        canTakeJob: technician.canTakeJob(),
        currentJobCount: technician.currentJobCount
      }
    });
  } catch (error) {
    console.error('❌ Error getting technician:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// PUT /api/technicians/:id - Update technician
router.put('/:id', authenticateUser, requireAdmin, [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('email').optional().isEmail(),
  body('specializations').optional().isArray({ min: 1 }),
  body('availability').optional().isIn(['Available', 'Busy', 'On Leave', 'Unavailable']),
  body('hourlyRate').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    console.log('📝 Updating technician:', id);
    
    // Check if email is being changed and not duplicate
    if (req.body.email) {
      const emailExists = await Technician.findOne({ 
        email: req.body.email, 
        _id: { $ne: id } 
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: 'Email already registered for another technician'
        });
      }
    }
    
    const updatedTechnician = await Technician.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'email')
     .populate('currentJobs', 'jobId title status');
    
    if (!updatedTechnician) {
      return res.status(404).json({
        success: false,
        error: 'Technician not found'
      });
    }
    
    console.log('✅ Technician updated successfully:', updatedTechnician.technicianId);
    
    res.json({
      success: true,
      message: 'Technician updated successfully',
      technician: updatedTechnician
    });
  } catch (error) {
    console.error('❌ Error updating technician:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// PUT /api/technicians/:id/availability - Update technician availability
router.put('/:id/availability', authenticateUser, [
  body('availability').isIn(['Available', 'Busy', 'On Leave', 'Unavailable']).withMessage('Invalid availability status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { availability } = req.body;
    
    // Allow technicians to update their own availability
    const technician = await Technician.findById(id);
    if (!technician) {
      return res.status(404).json({
        success: false,
        error: 'Technician not found'
      });
    }
    
    if (req.user.role !== 'admin' && technician.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own availability'
      });
    }
    
    technician.availability = availability;
    await technician.save();
    
    console.log('✅ Technician availability updated:', technician.technicianId, availability);
    
    res.json({
      success: true,
      message: 'Availability updated successfully',
      technician: {
        technicianId: technician.technicianId,
        availability: technician.availability
      }
    });
  } catch (error) {
    console.error('❌ Error updating technician availability:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// POST /api/technicians/:id/rating - Add rating to technician
router.post('/:id/rating', authenticateUser, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comments').optional().trim().isLength({ max: 500 }).withMessage('Comments must be 500 characters or less')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { rating } = req.body;
    
    const technician = await Technician.findById(id);
    if (!technician) {
      return res.status(404).json({
        success: false,
        error: 'Technician not found'
      });
    }
    
    technician.updateRating(rating);
    await technician.save();
    
    console.log('✅ Rating added to technician:', technician.technicianId, rating);
    
    res.json({
      success: true,
      message: 'Rating added successfully',
      technician: {
        technicianId: technician.technicianId,
        rating: technician.rating
      }
    });
  } catch (error) {
    console.error('❌ Error adding rating:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/technicians/:id/jobs - Get jobs assigned to technician
router.get('/:id/jobs', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;
    
    const technician = await Technician.findById(id);
    if (!technician) {
      return res.status(404).json({
        success: false,
        error: 'Technician not found'
      });
    }
    
    // Allow technicians to view their own jobs or admins to view any
    if (req.user.role !== 'admin' && technician.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    const filter = { assignedTechnician: id };
    if (status) {
      filter.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const jobs = await Job.find(filter)
      .populate('customer', 'firstName lastName email phone')
      .populate('contractId', 'contractNumber title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Job.countDocuments(filter);
    
    res.json({
      success: true,
      message: 'Technician jobs retrieved successfully',
      jobs,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + jobs.length < total,
        hasPrev: parseInt(page) > 1,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('❌ Error getting technician jobs:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;


