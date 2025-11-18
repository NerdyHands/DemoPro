const express = require('express');
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const Contract = require('../models/Contract');
const Customer = require('../models/Customer');
const Technician = require('../models/Technician');
const JobProgress = require('../models/JobProgress');
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

// GET /api/jobs
router.get('/', authenticateUser, async (req, res) => {
  try {
    console.log('📖 Getting all jobs...');
    
    const { 
      status, 
      priority, 
      assignedTechnician,
      workType,
      overdue,
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTechnician) filter.assignedTechnician = assignedTechnician;
    if (workType) filter.workType = workType;
    
    // Add overdue filter
    if (overdue === 'true') {
      const now = new Date();
      filter.$or = [
        { endDate: { $lt: now }, status: { $nin: ['Completed', 'Cancelled'] } },
        { 'timeline.scheduledDate': { $lt: now }, status: { $nin: ['Completed', 'Cancelled'] } }
      ];
    }
    
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const jobs = await Job.find(filter)
      .populate('customer', 'firstName lastName email phone')
      .populate('assignedTechnician', 'firstName lastName technicianId specializations availability')
      .populate('contractId', 'contractNumber title')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Job.countDocuments(filter);
    
    res.json({
      success: true,
      message: 'Jobs retrieved successfully',
      jobs: jobs.map(job => ({
        ...job.toObject(),
        isOverdue: job.isOverdue,
        daysUntilDue: job.daysUntilDue,
        totalEstimatedCost: job.totalEstimatedCost,
        totalActualCost: job.totalActualCost
      })),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + jobs.length < total,
        hasPrev: parseInt(page) > 1,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('❌ Error getting jobs:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// POST /api/jobs
router.post('/', authenticateUser, [
  body('contractId').notEmpty().withMessage('Contract ID is required'),
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be 1-200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be 2000 characters or less'),
  body('startDate').isISO8601().withMessage('Start date is required and must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('location').optional().trim().isLength({ max: 500 }).withMessage('Location must be 500 characters or less'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be 1000 characters or less')
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

    console.log('📝 Creating new job...');
    console.log('Request body:', req.body);

    // Check if contract exists
    const contract = await Contract.findById(req.body.contractId);
    if (!contract) {
      return res.status(400).json({
        success: false,
        error: 'Contract not found'
      });
    }

    // Check if customer exists
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) {
      return res.status(400).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Create the job
    const jobData = {
      ...req.body,
      customer: req.body.customerId,
      startDate: new Date(req.body.startDate),
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined
    };
    
    const job = new Job(jobData);
    const savedJob = await job.save();
    
    // Populate customer info
    await savedJob.populate('customer', 'firstName lastName email');
    
    console.log('✅ Job created successfully:', savedJob.jobId);
    
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job: savedJob
    });
  } catch (error) {
    console.error('❌ Error creating job:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/jobs/:id
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📖 Getting job:', id);
    
    const job = await Job.findById(id)
      .populate('customer', 'firstName lastName email phone address');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Job retrieved successfully',
      job: job
    });
  } catch (error) {
    console.error('❌ Error getting job:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// PUT /api/jobs/:id
router.put('/:id', authenticateUser, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be 2000 characters or less'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('status').optional().isIn(['Scheduled', 'In Progress', 'Completed', 'Cancelled']).withMessage('Invalid status'),
  body('location').optional().trim().isLength({ max: 500 }).withMessage('Location must be 500 characters or less'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be 1000 characters or less')
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
    console.log('📝 Updating job:', id);
    console.log('Update data:', req.body);

    // Check if job exists
    const existingJob = await Job.findById(id);
    if (!existingJob) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Prepare update data
    const updateData = { ...req.body };
    if (req.body.startDate) {
      updateData.startDate = new Date(req.body.startDate);
    }
    if (req.body.endDate) {
      updateData.endDate = new Date(req.body.endDate);
    }

    // Update the job
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('customer', 'firstName lastName email');
    
    console.log('✅ Job updated successfully:', updatedJob.jobId);
    
    res.json({
      success: true,
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('❌ Error updating job:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// DELETE /api/jobs/:id
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting job:', id);
    
    const job = await Job.findByIdAndDelete(id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    console.log('✅ Job deleted successfully:', job.jobId);
    
    res.json({
      success: true,
      message: 'Job deleted successfully',
      job: job
    });
  } catch (error) {
    console.error('❌ Error deleting job:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// POST /api/jobs/:id/assign - Assign technician to job
router.post('/:id/assign', authenticateUser, [
  body('technicianId').isMongoId().withMessage('Valid technician ID is required')
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
    const { technicianId } = req.body;
    
    console.log('👨‍🔧 Assigning technician to job:', id, technicianId);
    
    // Check if job exists
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    // Check if technician exists and is available
    const technician = await Technician.findById(technicianId);
    if (!technician) {
      return res.status(400).json({
        success: false,
        error: 'Technician not found'
      });
    }
    
    if (!technician.canTakeJob()) {
      return res.status(400).json({
        success: false,
        error: 'Technician is not available or has reached maximum job capacity'
      });
    }
    
    // Check if technician has required skills
    if (job.skillsRequired.length > 0 && !job.canBeAssignedTo(technician)) {
      return res.status(400).json({
        success: false,
        error: 'Technician does not have the required skills for this job'
      });
    }
    
    // Remove job from previous technician if assigned
    if (job.assignedTechnician) {
      const previousTech = await Technician.findById(job.assignedTechnician);
      if (previousTech) {
        previousTech.currentJobs = previousTech.currentJobs.filter(
          jobId => jobId.toString() !== id
        );
        await previousTech.save();
      }
    }
    
    // Assign technician to job
    job.assignTechnician(technicianId, req.user._id);
    await job.save();
    
    // Add job to technician's current jobs
    if (!technician.currentJobs.includes(id)) {
      technician.currentJobs.push(id);
      await technician.save();
    }
    
    // Populate the response
    await job.populate([
      { path: 'assignedTechnician', select: 'firstName lastName technicianId' },
      { path: 'assignedBy', select: 'firstName lastName' }
    ]);
    
    console.log('✅ Technician assigned successfully');
    
    res.json({
      success: true,
      message: 'Technician assigned successfully',
      job: {
        jobId: job.jobId,
        status: job.status,
        assignedTechnician: job.assignedTechnician,
        assignedBy: job.assignedBy,
        assignedAt: job.assignedAt
      }
    });
  } catch (error) {
    console.error('❌ Error assigning technician:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// PUT /api/jobs/:id/status - Update job status
router.put('/:id/status', authenticateUser, [
  body('status').isIn(['Pending', 'Assigned', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Needs Review']).withMessage('Invalid status'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be 1000 characters or less')
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
    const { status, notes } = req.body;
    
    console.log('📝 Updating job status:', id, status);
    
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    // Check permissions - only assigned technician or admin can update status
    const technician = await Technician.findOne({ userId: req.user._id });
    if (req.user.role !== 'admin' && 
        (!technician || job.assignedTechnician?.toString() !== technician._id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Only the assigned technician or admin can update job status'
      });
    }
    
    const oldStatus = job.status;
    job.status = status;
    
    // Handle status-specific logic
    switch (status) {
      case 'In Progress':
        if (oldStatus !== 'In Progress') {
          job.startWork();
        }
        break;
      case 'Completed':
        if (oldStatus !== 'Completed') {
          job.completeJob();
        }
        break;
    }
    
    if (notes) {
      job.internalNotes = notes;
    }
    
    await job.save();
    
    // Create a progress log for the status update
    if (technician) {
      const progressLog = new JobProgress({
        jobId: id,
        technicianId: technician._id,
        logType: 'Status Update',
        description: `Job status updated from "${oldStatus}" to "${status}"`,
        status: status,
        workPerformed: notes || ''
      });
      await progressLog.save();
    }
    
    console.log('✅ Job status updated successfully');
    
    res.json({
      success: true,
      message: 'Job status updated successfully',
      job: {
        jobId: job.jobId,
        status: job.status,
        progress: job.progress,
        timeline: job.timeline
      }
    });
  } catch (error) {
    console.error('❌ Error updating job status:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// PUT /api/jobs/:id/progress - Update job progress
router.put('/:id/progress', authenticateUser, [
  body('percentage').isInt({ min: 0, max: 100 }).withMessage('Progress percentage must be between 0 and 100'),
  body('milestone').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Milestone name must be 1-200 characters'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be 1000 characters or less')
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
    const { percentage, milestone, notes } = req.body;
    
    console.log('📊 Updating job progress:', id, percentage + '%');
    
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    // Check permissions
    const technician = await Technician.findOne({ userId: req.user._id });
    if (req.user.role !== 'admin' && 
        (!technician || job.assignedTechnician?.toString() !== technician._id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Only the assigned technician or admin can update job progress'
      });
    }
    
    job.updateProgress(percentage, milestone);
    await job.save();
    
    // Create a progress log
    if (technician) {
      const progressLog = new JobProgress({
        jobId: id,
        technicianId: technician._id,
        logType: 'Status Update',
        description: `Job progress updated to ${percentage}%${milestone ? ` - Milestone: ${milestone}` : ''}`,
        workPerformed: notes || ''
      });
      await progressLog.save();
    }
    
    console.log('✅ Job progress updated successfully');
    
    res.json({
      success: true,
      message: 'Job progress updated successfully',
      job: {
        jobId: job.jobId,
        progress: job.progress,
        timeline: job.timeline
      }
    });
  } catch (error) {
    console.error('❌ Error updating job progress:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/jobs/queue - Get job queue for dashboard
router.get('/queue', authenticateUser, async (req, res) => {
  try {
    console.log('📋 Getting job queue...');
    
    // Get job counts by status
    const statusCounts = await Job.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get priority counts
    const priorityCounts = await Job.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get unassigned jobs
    const unassignedJobs = await Job.find({ 
      assignedTechnician: { $exists: false },
      status: { $nin: ['Completed', 'Cancelled'] }
    })
    .populate('customer', 'firstName lastName')
    .sort({ priority: 1, createdAt: 1 })
    .limit(10);
    
    // Get overdue jobs
    const now = new Date();
    const overdueJobs = await Job.find({
      $or: [
        { endDate: { $lt: now }, status: { $nin: ['Completed', 'Cancelled'] } },
        { 'timeline.scheduledDate': { $lt: now }, status: { $nin: ['Completed', 'Cancelled'] } }
      ]
    })
    .populate('customer', 'firstName lastName')
    .populate('assignedTechnician', 'firstName lastName')
    .sort({ endDate: 1 })
    .limit(10);
    
    // Get recent completions
    const recentCompletions = await Job.find({ 
      status: 'Completed',
      'timeline.completedDate': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
    .populate('customer', 'firstName lastName')
    .populate('assignedTechnician', 'firstName lastName')
    .sort({ 'timeline.completedDate': -1 })
    .limit(10);
    
    res.json({
      success: true,
      message: 'Job queue data retrieved successfully',
      queue: {
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        priorityCounts: priorityCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        unassignedJobs: unassignedJobs.map(job => ({
          ...job.toObject(),
          isOverdue: job.isOverdue,
          daysUntilDue: job.daysUntilDue
        })),
        overdueJobs: overdueJobs.map(job => ({
          ...job.toObject(),
          isOverdue: job.isOverdue,
          daysUntilDue: job.daysUntilDue
        })),
        recentCompletions: recentCompletions.map(job => ({
          ...job.toObject(),
          totalActualCost: job.totalActualCost
        }))
      }
    });
  } catch (error) {
    console.error('❌ Error getting job queue:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;
