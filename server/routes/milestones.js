const express = require('express');
const { body, validationResult } = require('express-validator');
const Milestone = require('../models/Milestone');
const Contract = require('../models/Contract');
const Job = require('../models/Job');
const Customer = require('../models/Customer');
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

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET /api/milestones - Get all milestones
router.get('/', authenticateUser, async (req, res) => {
  try {
    console.log('📖 Getting milestones...');
    
    const { 
      contractId,
      customerId,
      status,
      type,
      priority,
      overdue,
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build filter
    const filter = {};
    if (contractId) filter.contractId = contractId;
    if (customerId) filter.customerId = customerId;
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    
    // Add overdue filter
    if (overdue === 'true') {
      const now = new Date();
      filter.$or = [
        { 'payment.dueDate': { $lt: now }, status: { $ne: 'Completed' } },
        { 'timeline.plannedEndDate': { $lt: now }, status: { $ne: 'Completed' } }
      ];
    }
    
    // Non-admin users can only see their own milestones
    if (req.user.role !== 'admin') {
      // If user is a customer, get their customer ID
      const customer = await Customer.findOne({ userId: req.user._id });
      if (customer) {
        filter.customerId = customer._id;
      } else {
        // If not a customer, return empty results
        return res.json({
          success: true,
          message: 'Milestones retrieved successfully',
          milestones: [],
          pagination: { current: 1, total: 0, hasNext: false, hasPrev: false, totalRecords: 0 }
        });
      }
    }
    
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const milestones = await Milestone.find(filter)
      .populate('contractId', 'contractNumber title')
      .populate('customerId', 'firstName lastName email')
      .populate('jobId', 'jobId title status')
      .populate('progress.updatedBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Milestone.countDocuments(filter);
    
    res.json({
      success: true,
      message: 'Milestones retrieved successfully',
      milestones: milestones.map(milestone => ({
        ...milestone.toObject(),
        isOverdue: milestone.isOverdue,
        daysUntilDue: milestone.daysUntilDue,
        totalPaid: milestone.totalPaid,
        remainingBalance: milestone.remainingBalance,
        approvalStatus: milestone.getApprovalStatus()
      })),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + milestones.length < total,
        hasPrev: parseInt(page) > 1,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('❌ Error getting milestones:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/milestones/dashboard - Get milestone dashboard data
router.get('/dashboard', authenticateUser, requireAdmin, async (req, res) => {
  try {
    console.log('📊 Getting milestone dashboard data...');
    
    const now = new Date();
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // Get summary statistics
    const stats = await Milestone.aggregate([
      {
        $facet: {
          statusCounts: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          typeCounts: [
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ],
          priorityCounts: [
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ],
          paymentStats: [
            {
              $match: { type: 'Payment' }
            },
            {
              $group: {
                _id: '$payment.paymentStatus',
                count: { $sum: 1 },
                totalAmount: { $sum: '$payment.amount' }
              }
            }
          ],
          overduePayments: [
            {
              $match: {
                type: 'Payment',
                'payment.paymentStatus': { $in: ['Pending', 'Partial'] },
                'payment.dueDate': { $lt: now }
              }
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                totalAmount: { $sum: '$payment.amount' }
              }
            }
          ],
          upcomingDue: [
            {
              $match: {
                $or: [
                  {
                    type: 'Payment',
                    'payment.paymentStatus': { $in: ['Pending', 'Partial'] },
                    'payment.dueDate': { $gte: now, $lte: thirtyDaysFromNow }
                  },
                  {
                    type: { $ne: 'Payment' },
                    status: { $ne: 'Completed' },
                    'timeline.plannedEndDate': { $gte: now, $lte: thirtyDaysFromNow }
                  }
                ]
              }
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);
    
    // Get recent milestones
    const recentMilestones = await Milestone.find()
      .populate('contractId', 'contractNumber title')
      .populate('customerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get overdue milestones
    const overdueMilestones = await Milestone.find({
      $or: [
        {
          type: 'Payment',
          'payment.paymentStatus': { $in: ['Pending', 'Partial'] },
          'payment.dueDate': { $lt: now }
        },
        {
          type: { $ne: 'Payment' },
          status: { $ne: 'Completed' },
          'timeline.plannedEndDate': { $lt: now }
        }
      ]
    })
    .populate('contractId', 'contractNumber title')
    .populate('customerId', 'firstName lastName')
    .sort({ 'payment.dueDate': 1, 'timeline.plannedEndDate': 1 })
    .limit(10);
    
    res.json({
      success: true,
      message: 'Milestone dashboard data retrieved successfully',
      stats: stats[0],
      recentMilestones: recentMilestones.map(m => ({
        ...m.toObject(),
        isOverdue: m.isOverdue,
        daysUntilDue: m.daysUntilDue
      })),
      overdueMilestones: overdueMilestones.map(m => ({
        ...m.toObject(),
        isOverdue: m.isOverdue,
        daysUntilDue: m.daysUntilDue
      }))
    });
  } catch (error) {
    console.error('❌ Error getting milestone dashboard data:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// POST /api/milestones - Create new milestone
router.post('/', authenticateUser, requireAdmin, [
  body('contractId').isMongoId().withMessage('Valid contract ID is required'),
  body('customerId').isMongoId().withMessage('Valid customer ID is required'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required (1-200 characters)'),
  body('type').isIn(['Payment', 'Project Phase', 'Delivery', 'Approval', 'Inspection', 'Other']).withMessage('Invalid milestone type'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical'])
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

    console.log('📝 Creating new milestone...');
    
    // Verify contract exists
    const contract = await Contract.findById(req.body.contractId);
    if (!contract) {
      return res.status(400).json({
        success: false,
        error: 'Contract not found'
      });
    }
    
    // Verify customer exists
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) {
      return res.status(400).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    // Verify job exists if provided
    if (req.body.jobId) {
      const job = await Job.findById(req.body.jobId);
      if (!job) {
        return res.status(400).json({
          success: false,
          error: 'Job not found'
        });
      }
    }
    
    const milestone = new Milestone(req.body);
    const savedMilestone = await milestone.save();
    
    // Populate references
    await savedMilestone.populate([
      { path: 'contractId', select: 'contractNumber title' },
      { path: 'customerId', select: 'firstName lastName email' },
      { path: 'jobId', select: 'jobId title status' }
    ]);
    
    console.log('✅ Milestone created successfully:', savedMilestone.milestoneId);
    
    res.status(201).json({
      success: true,
      message: 'Milestone created successfully',
      milestone: {
        ...savedMilestone.toObject(),
        isOverdue: savedMilestone.isOverdue,
        daysUntilDue: savedMilestone.daysUntilDue,
        totalPaid: savedMilestone.totalPaid,
        remainingBalance: savedMilestone.remainingBalance
      }
    });
  } catch (error) {
    console.error('❌ Error creating milestone:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/milestones/:id - Get specific milestone
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📖 Getting milestone:', id);
    
    const milestone = await Milestone.findById(id)
      .populate('contractId', 'contractNumber title totalAmount')
      .populate('customerId', 'firstName lastName email phone')
      .populate('jobId', 'jobId title status progress')
      .populate('progress.updatedBy', 'firstName lastName')
      .populate('approvals.approverId', 'firstName lastName email')
      .populate('comments.author', 'firstName lastName');
    
    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: 'Milestone not found'
      });
    }
    
    // Check permissions for non-admin users
    if (req.user.role !== 'admin') {
      const customer = await Customer.findOne({ userId: req.user._id });
      if (!customer || milestone.customerId._id.toString() !== customer._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Milestone retrieved successfully',
      milestone: {
        ...milestone.toObject(),
        isOverdue: milestone.isOverdue,
        daysUntilDue: milestone.daysUntilDue,
        totalPaid: milestone.totalPaid,
        remainingBalance: milestone.remainingBalance,
        approvalStatus: milestone.getApprovalStatus()
      }
    });
  } catch (error) {
    console.error('❌ Error getting milestone:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// PUT /api/milestones/:id - Update milestone
router.put('/:id', authenticateUser, requireAdmin, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed', 'Overdue', 'Cancelled', 'On Hold']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical'])
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
    console.log('📝 Updating milestone:', id);
    
    const milestone = await Milestone.findById(id);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: 'Milestone not found'
      });
    }
    
    // Handle status changes
    if (req.body.status === 'Completed' && milestone.status !== 'Completed') {
      milestone.markAsCompleted(req.user._id);
    }
    
    // Update other fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'status' || req.body.status !== 'Completed') {
        milestone[key] = req.body[key];
      }
    });
    
    await milestone.save();
    
    // Populate references
    await milestone.populate([
      { path: 'contractId', select: 'contractNumber title' },
      { path: 'customerId', select: 'firstName lastName email' },
      { path: 'jobId', select: 'jobId title status' }
    ]);
    
    console.log('✅ Milestone updated successfully:', milestone.milestoneId);
    
    res.json({
      success: true,
      message: 'Milestone updated successfully',
      milestone: {
        ...milestone.toObject(),
        isOverdue: milestone.isOverdue,
        daysUntilDue: milestone.daysUntilDue,
        totalPaid: milestone.totalPaid,
        remainingBalance: milestone.remainingBalance
      }
    });
  } catch (error) {
    console.error('❌ Error updating milestone:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// POST /api/milestones/:id/payment - Add payment to milestone
router.post('/:id/payment', authenticateUser, requireAdmin, [
  body('amount').isFloat({ min: 0.01 }).withMessage('Payment amount must be positive'),
  body('method').isIn(['Cash', 'Check', 'Credit Card', 'Bank Transfer', 'Stripe', 'Other']).withMessage('Invalid payment method'),
  body('transactionId').optional().trim().isLength({ min: 1, max: 100 }),
  body('notes').optional().trim().isLength({ max: 500 })
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
    const { amount, method, transactionId, notes } = req.body;
    
    const milestone = await Milestone.findById(id);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: 'Milestone not found'
      });
    }
    
    if (milestone.type !== 'Payment') {
      return res.status(400).json({
        success: false,
        error: 'This milestone is not a payment milestone'
      });
    }
    
    milestone.addPayment(amount, method, transactionId, notes);
    await milestone.save();
    
    console.log('✅ Payment added to milestone:', milestone.milestoneId, amount);
    
    res.json({
      success: true,
      message: 'Payment added successfully',
      milestone: {
        milestoneId: milestone.milestoneId,
        payment: milestone.payment,
        totalPaid: milestone.totalPaid,
        remainingBalance: milestone.remainingBalance
      }
    });
  } catch (error) {
    console.error('❌ Error adding payment:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// POST /api/milestones/:id/comments - Add comment to milestone
router.post('/:id/comments', authenticateUser, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment is required (1-1000 characters)'),
  body('isInternal').optional().isBoolean()
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
    const { content, isInternal = false } = req.body;
    
    const milestone = await Milestone.findById(id);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: 'Milestone not found'
      });
    }
    
    // Check permissions for non-admin users
    if (req.user.role !== 'admin') {
      const customer = await Customer.findOne({ userId: req.user._id });
      if (!customer || milestone.customerId.toString() !== customer._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
      
      // Customers cannot add internal comments
      if (isInternal) {
        return res.status(403).json({
          success: false,
          error: 'You cannot add internal comments'
        });
      }
    }
    
    milestone.comments.push({
      author: req.user._id,
      content,
      isInternal: req.user.role === 'admin' ? isInternal : false
    });
    
    await milestone.save();
    await milestone.populate('comments.author', 'firstName lastName');
    
    const newComment = milestone.comments[milestone.comments.length - 1];
    
    console.log('✅ Comment added to milestone:', milestone.milestoneId);
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/milestones/contract/:contractId - Get milestones for a contract
router.get('/contract/:contractId', authenticateUser, async (req, res) => {
  try {
    const { contractId } = req.params;
    const { status, type } = req.query;
    
    console.log('📖 Getting milestones for contract:', contractId);
    
    // Verify contract exists
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }
    
    const filter = { contractId };
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    // Non-admin users can only see milestones for contracts they own
    if (req.user.role !== 'admin') {
      const customer = await Customer.findOne({ userId: req.user._id });
      if (!customer || contract.customerId.toString() !== customer._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }
    
    const milestones = await Milestone.find(filter)
      .populate('customerId', 'firstName lastName')
      .populate('jobId', 'jobId title status')
      .sort({ 'timeline.plannedEndDate': 1, 'payment.dueDate': 1, createdAt: 1 });
    
    res.json({
      success: true,
      message: 'Contract milestones retrieved successfully',
      milestones: milestones.map(milestone => ({
        ...milestone.toObject(),
        isOverdue: milestone.isOverdue,
        daysUntilDue: milestone.daysUntilDue,
        totalPaid: milestone.totalPaid,
        remainingBalance: milestone.remainingBalance,
        approvalStatus: milestone.getApprovalStatus()
      }))
    });
  } catch (error) {
    console.error('❌ Error getting contract milestones:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;


