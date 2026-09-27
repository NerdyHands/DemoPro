const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const JobProgress = require('../models/JobProgress');
const Job = require('../models/Job');
const Technician = require('../models/Technician');
const { uploadToGCS, deleteFromGCS } = require('../services/googleCloudStorage');
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
    const User = require('../models/User');
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

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files per request
  },
  fileFilter: (req, file, cb) => {
    // Allow images and common document types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents are allowed.'));
    }
  }
});

// GET /api/job-progress/job/:jobId - Get all progress logs for a job
router.get('/job/:jobId', authenticateUser, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { 
      logType, 
      technicianId, 
      isPublic,
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    console.log('📖 Getting progress logs for job:', jobId);
    
    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    // Build filter
    const filter = { jobId };
    if (logType) filter.logType = logType;
    if (technicianId) filter.technicianId = technicianId;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
    
    // Non-admin users can only see public progress or their own logs
    if (req.user.role !== 'admin') {
      const technician = await Technician.findOne({ userId: req.user._id });
      if (technician) {
        filter.$or = [
          { isPublic: true },
          { technicianId: technician._id }
        ];
      } else {
        filter.isPublic = true;
      }
    }
    
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const progressLogs = await JobProgress.find(filter)
      .populate('technicianId', 'firstName lastName technicianId specializations')
      .populate('quality.reviewedBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await JobProgress.countDocuments(filter);
    
    res.json({
      success: true,
      message: 'Progress logs retrieved successfully',
      progressLogs: progressLogs.map(log => ({
        ...log.toObject(),
        totalWorkTime: log.totalWorkTime,
        laborCost: log.laborCost,
        materialCost: log.materialCost
      })),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + progressLogs.length < total,
        hasPrev: parseInt(page) > 1,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('❌ Error getting progress logs:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// POST /api/job-progress - Create new progress log
router.post('/', authenticateUser, [
  body('jobId').isMongoId().withMessage('Valid job ID is required'),
  body('logType').isIn(['Time Log', 'Status Update', 'Note', 'Issue', 'Completion', 'Image Upload']).withMessage('Invalid log type'),
  body('description').trim().isLength({ min: 1, max: 2000 }).withMessage('Description is required (1-2000 characters)'),
  body('status').optional().isIn(['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Needs Review']),
  body('workPerformed').optional().trim().isLength({ max: 1000 }),
  body('isPublic').optional().isBoolean()
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

    console.log('📝 Creating new progress log...');
    
    // Verify job exists
    const job = await Job.findById(req.body.jobId);
    if (!job) {
      return res.status(400).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    // Get technician info
    const technician = await Technician.findOne({ userId: req.user._id });
    if (!technician) {
      return res.status(400).json({
        success: false,
        error: 'User is not registered as a technician'
      });
    }
    
    // Verify technician is assigned to this job (unless admin)
    if (req.user.role !== 'admin' && 
        job.assignedTechnician?.toString() !== technician._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You are not assigned to this job'
      });
    }
    
    const progressData = {
      ...req.body,
      technicianId: technician._id
    };
    
    // Handle time log calculations
    if (req.body.timeLog && req.body.timeLog.startTime && req.body.timeLog.endTime) {
      const startTime = new Date(req.body.timeLog.startTime);
      const endTime = new Date(req.body.timeLog.endTime);
      const duration = (endTime - startTime) / (1000 * 60); // in minutes
      progressData.timeLog.duration = Math.round(duration);
      progressData.timeLog.hourlyRate = progressData.timeLog.hourlyRate || technician.hourlyRate;
    }
    
    const progressLog = new JobProgress(progressData);
    const savedLog = await progressLog.save();
    
    // Update job progress if this is a status update
    if (req.body.logType === 'Status Update' && req.body.status) {
      job.status = req.body.status;
      job.progress.lastUpdated = new Date();
      
      if (req.body.status === 'Completed') {
        job.progress.percentage = 100;
        job.timeline.completedDate = new Date();
      }
      
      await job.save();
    }
    
    // Populate the saved log
    await savedLog.populate('technicianId', 'firstName lastName technicianId');
    
    console.log('✅ Progress log created successfully:', savedLog.progressId);
    
    res.status(201).json({
      success: true,
      message: 'Progress log created successfully',
      progressLog: {
        ...savedLog.toObject(),
        totalWorkTime: savedLog.totalWorkTime,
        laborCost: savedLog.laborCost,
        materialCost: savedLog.materialCost
      }
    });
  } catch (error) {
    console.error('❌ Error creating progress log:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// POST /api/job-progress/:id/images - Upload images to progress log
router.post('/:id/images', authenticateUser, upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { descriptions = [], categories = [] } = req.body;
    
    console.log('📷 Uploading images to progress log:', id);
    
    const progressLog = await JobProgress.findById(id);
    if (!progressLog) {
      return res.status(404).json({
        success: false,
        error: 'Progress log not found'
      });
    }
    
    // Verify technician permissions
    const technician = await Technician.findOne({ userId: req.user._id });
    if (req.user.role !== 'admin' && 
        progressLog.technicianId.toString() !== technician?._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }
    
    const uploadedImages = [];
    const uploadPromises = req.files.map(async (file, index) => {
      try {
        const filename = `job-progress/${progressLog.jobId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.originalname}`;
        const gcsUrl = await uploadToGCS(file.buffer, filename, file.mimetype);
        
        const imageData = {
          filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          gcsUrl,
          description: descriptions[index] || '',
          category: categories[index] || 'During'
        };
        
        progressLog.addImage(imageData);
        uploadedImages.push(imageData);
        
        return imageData;
      } catch (uploadError) {
        console.error('Error uploading file:', file.originalname, uploadError);
        throw uploadError;
      }
    });
    
    await Promise.all(uploadPromises);
    await progressLog.save();
    
    console.log('✅ Images uploaded successfully:', uploadedImages.length);
    
    res.json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages,
      progressLog: progressLog.progressId
    });
  } catch (error) {
    console.error('❌ Error uploading images:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// PUT /api/job-progress/:id - Update progress log
router.put('/:id', authenticateUser, [
  body('description').optional().trim().isLength({ min: 1, max: 2000 }),
  body('status').optional().isIn(['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Needs Review']),
  body('workPerformed').optional().trim().isLength({ max: 1000 }),
  body('isPublic').optional().isBoolean()
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
    console.log('📝 Updating progress log:', id);
    
    const progressLog = await JobProgress.findById(id);
    if (!progressLog) {
      return res.status(404).json({
        success: false,
        error: 'Progress log not found'
      });
    }
    
    // Verify permissions
    const technician = await Technician.findOne({ userId: req.user._id });
    if (req.user.role !== 'admin' && 
        progressLog.technicianId.toString() !== technician?._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    // Update the progress log
    Object.assign(progressLog, req.body);
    
    // Recalculate duration if time log was updated
    if (req.body.timeLog) {
      progressLog.calculateDuration();
    }
    
    await progressLog.save();
    await progressLog.populate('technicianId', 'firstName lastName technicianId');
    
    console.log('✅ Progress log updated successfully:', progressLog.progressId);
    
    res.json({
      success: true,
      message: 'Progress log updated successfully',
      progressLog: {
        ...progressLog.toObject(),
        totalWorkTime: progressLog.totalWorkTime,
        laborCost: progressLog.laborCost,
        materialCost: progressLog.materialCost
      }
    });
  } catch (error) {
    console.error('❌ Error updating progress log:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// POST /api/job-progress/:id/issues/:issueIndex/resolve - Resolve an issue
router.post('/:id/issues/:issueIndex/resolve', authenticateUser, [
  body('resolution').trim().isLength({ min: 1, max: 1000 }).withMessage('Resolution is required (1-1000 characters)')
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

    const { id, issueIndex } = req.params;
    const { resolution } = req.body;
    
    const progressLog = await JobProgress.findById(id);
    if (!progressLog) {
      return res.status(404).json({
        success: false,
        error: 'Progress log not found'
      });
    }
    
    const index = parseInt(issueIndex);
    if (index < 0 || index >= progressLog.issues.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid issue index'
      });
    }
    
    progressLog.resolveIssue(index, resolution, req.user._id);
    await progressLog.save();
    
    console.log('✅ Issue resolved:', progressLog.progressId, index);
    
    res.json({
      success: true,
      message: 'Issue resolved successfully',
      issue: progressLog.issues[index]
    });
  } catch (error) {
    console.error('❌ Error resolving issue:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/job-progress/technician/:technicianId - Get progress logs by technician
router.get('/technician/:technicianId', authenticateUser, async (req, res) => {
  try {
    const { technicianId } = req.params;
    const { 
      startDate, 
      endDate, 
      logType,
      page = 1, 
      limit = 20 
    } = req.query;
    
    // Verify technician exists
    const technician = await Technician.findById(technicianId);
    if (!technician) {
      return res.status(404).json({
        success: false,
        error: 'Technician not found'
      });
    }
    
    // Allow technicians to view their own logs or admins to view any
    if (req.user.role !== 'admin' && 
        technician.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    const filter = { technicianId };
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    if (logType) filter.logType = logType;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const progressLogs = await JobProgress.find(filter)
      .populate('jobId', 'jobId title customer')
      .populate('technicianId', 'firstName lastName technicianId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await JobProgress.countDocuments(filter);
    
    // Calculate summary statistics
    const stats = await JobProgress.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalWorkTime: { $sum: '$timeLog.duration' },
          totalLogs: { $sum: 1 },
          avgRating: { $avg: '$quality.rating' },
          totalLaborCost: { 
            $sum: { 
              $multiply: [
                { $divide: ['$timeLog.duration', 60] },
                '$timeLog.hourlyRate'
              ]
            }
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      message: 'Technician progress logs retrieved successfully',
      progressLogs: progressLogs.map(log => ({
        ...log.toObject(),
        totalWorkTime: log.totalWorkTime,
        laborCost: log.laborCost,
        materialCost: log.materialCost
      })),
      stats: stats[0] || {
        totalWorkTime: 0,
        totalLogs: 0,
        avgRating: 0,
        totalLaborCost: 0
      },
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + progressLogs.length < total,
        hasPrev: parseInt(page) > 1,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('❌ Error getting technician progress logs:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;


