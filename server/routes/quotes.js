const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Quote = require('../models/Quote');
const Project = require('../models/Project');
const PICRAProcessing = require('../models/PICRAProcessing');
const User = require('../models/User');
const router = express.Router();

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to check if user is authenticated and is admin
const authenticateAdmin = async (req, res, next) => {
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
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
  
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /api/quotes - Get all quotes (admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { quoteNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    const quotes = await Quote.find(filter)
      .populate('projectId', 'name address')
      .populate('picraProcessingId', 'status openAIResults')
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Quote.countDocuments(filter);
    
    res.json({
      quotes,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// GET /api/quotes/pending-approval - Get quotes pending approval
router.get('/pending-approval', authenticateAdmin, async (req, res) => {
  try {
    const quotes = await Quote.findPendingApproval();
    res.json({ quotes });
  } catch (error) {
    console.error('Error fetching pending approval quotes:', error);
    res.status(500).json({ error: 'Failed to fetch pending approval quotes' });
  }
});

// GET /api/quotes/:id - Get a specific quote
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate('projectId', 'name address')
      .populate('picraProcessingId', 'status openAIResults')
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');
    
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    res.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// POST /api/quotes - Create a new quote
router.post('/', [
  authenticateAdmin,
  body('projectId').isMongoId().withMessage('Valid project ID is required'),
  body('picraProcessingId').isMongoId().withMessage('Valid PICRA processing ID is required'),
  body('customer.name').trim().isLength({ min: 1 }).withMessage('Customer name is required'),
  body('customer.email').isEmail().withMessage('Valid customer email is required'),
  body('title').trim().isLength({ min: 1 }).withMessage('Quote title is required'),
  body('validUntil').isISO8601().withMessage('Valid expiration date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Verify project exists
    const project = await Project.findById(req.body.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Verify PICRA processing exists
    const picraProcessing = await PICRAProcessing.findById(req.body.picraProcessingId);
    if (!picraProcessing) {
      return res.status(404).json({ error: 'PICRA processing record not found' });
    }
    
    // Create quote data
    const quoteData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    // Generate quote items from PICRA analysis if available
    if (picraProcessing.openAIResults && picraProcessing.openAIResults.repairItems) {
      quoteData.quoteItems = picraProcessing.openAIResults.repairItems.map((item, index) => ({
        itemNumber: `Q-${String(index + 1).padStart(3, '0')}`,
        description: item.description,
        quantity: '1 EA',
        unitPrice: item.estimatedCost,
        totalPrice: item.estimatedCost,
        specifications: item.materials || '',
        materials: item.materials || '',
        labor: `${item.laborHours || 8} hours`,
        warranty: '1 year',
        notes: item.notes || ''
      }));
    }
    
    const quote = new Quote(quoteData);
    await quote.save();
    
    const populatedQuote = await Quote.findById(quote._id)
      .populate('projectId', 'name address')
      .populate('picraProcessingId', 'status openAIResults')
      .populate('createdBy', 'firstName lastName email');
    
    res.status(201).json({
      message: 'Quote created successfully',
      quote: populatedQuote
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({ error: 'Failed to create quote' });
  }
});

// PUT /api/quotes/:id - Update a quote
router.put('/:id', [
  authenticateAdmin,
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Quote title cannot be empty'),
  body('validUntil').optional().isISO8601().withMessage('Valid expiration date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    // Update quote
    Object.assign(quote, req.body);
    await quote.save();
    
    const updatedQuote = await Quote.findById(quote._id)
      .populate('projectId', 'name address')
      .populate('picraProcessingId', 'status openAIResults')
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');
    
    res.json({
      message: 'Quote updated successfully',
      quote: updatedQuote
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({ error: 'Failed to update quote' });
  }
});

// POST /api/quotes/:id/send - Send quote to customer
router.post('/:id/send', authenticateAdmin, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    if (quote.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft quotes can be sent' });
    }
    
    // Send quote to customer
    await quote.sendToCustomer(req.user._id);
    
    // TODO: Send actual email to customer
    // This would integrate with your email service
    
    const updatedQuote = await Quote.findById(quote._id)
      .populate('projectId', 'name address')
      .populate('picraProcessingId', 'status openAIResults')
      .populate('createdBy', 'firstName lastName email');
    
    res.json({
      message: 'Quote sent to customer successfully',
      quote: updatedQuote
    });
  } catch (error) {
    console.error('Error sending quote:', error);
    res.status(500).json({ error: 'Failed to send quote' });
  }
});

// POST /api/quotes/:id/approval - Update approval status
router.post('/:id/approval', [
  authenticateAdmin,
  body('status').isIn(['approved', 'rejected', 'expired']).withMessage('Valid approval status is required'),
  body('customerResponse').optional().trim(),
  body('customerNotes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    // Update approval status
    await quote.updateApprovalStatus(
      req.body.status,
      req.body.customerResponse,
      req.body.customerNotes
    );
    
    const updatedQuote = await Quote.findById(quote._id)
      .populate('projectId', 'name address')
      .populate('picraProcessingId', 'status openAIResults')
      .populate('createdBy', 'firstName lastName email');
    
    res.json({
      message: 'Quote approval status updated successfully',
      quote: updatedQuote
    });
  } catch (error) {
    console.error('Error updating quote approval:', error);
    res.status(500).json({ error: 'Failed to update quote approval' });
  }
});

// POST /api/quotes/:id/communication - Add communication record
router.post('/:id/communication', [
  authenticateAdmin,
  body('type').isIn(['email', 'phone', 'in_person', 'other']).withMessage('Valid communication type is required'),
  body('subject').optional().trim(),
  body('message').optional().trim(),
  body('recipient').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    const communicationData = {
      ...req.body,
      sentBy: req.user._id
    };
    
    await quote.addCommunication(communicationData);
    
    const updatedQuote = await Quote.findById(quote._id)
      .populate('projectId', 'name address')
      .populate('picraProcessingId', 'status openAIResults')
      .populate('createdBy', 'firstName lastName email');
    
    res.json({
      message: 'Communication record added successfully',
      quote: updatedQuote
    });
  } catch (error) {
    console.error('Error adding communication record:', error);
    res.status(500).json({ error: 'Failed to add communication record' });
  }
});

// DELETE /api/quotes/:id - Delete a quote (soft delete)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    quote.isActive = false;
    await quote.save();
    
    res.json({ message: 'Quote deleted successfully' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

// GET /api/quotes/stats - Get quote statistics
router.get('/stats/overview', authenticateAdmin, async (req, res) => {
  try {
    const stats = await Quote.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalValue: { $sum: '$total' },
          byStatus: {
            $push: '$status'
          },
          byApprovalStatus: {
            $push: '$approval.status'
          }
        }
      }
    ]);
    
    if (stats.length === 0) {
      return res.json({
        total: 0,
        totalValue: 0,
        byStatus: {},
        byApprovalStatus: {}
      });
    }
    
    const stat = stats[0];
    const statusCount = stat.byStatus.reduce((acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const approvalStatusCount = stat.byApprovalStatus.reduce((acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      total: stat.total,
      totalValue: stat.totalValue,
      byStatus: statusCount,
      byApprovalStatus: approvalStatusCount
    });
  } catch (error) {
    console.error('Error getting quote stats:', error);
    res.status(500).json({ error: 'Failed to get quote statistics' });
  }
});

module.exports = router; 