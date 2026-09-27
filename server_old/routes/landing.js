const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const LandingPage = require('../models/LandingPage');
const path = require('path');
const fs = require('fs');
const DemolitionPrepChecklistPdfService = require('../services/demolitionPrepChecklistPdfService');

// Serve landing page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../landing-build/index.html'));
});

// Email signup endpoint
router.post('/signup', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('firstName').optional().isString().trim().isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  body('lastName').optional().isString().trim().isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
  body('phone').optional().isString().trim().matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please enter a valid phone number'),
  body('waitlistReason').optional().isString().trim().isLength({ max: 200 }).withMessage('Waitlist reason cannot exceed 200 characters'),
  body('source').optional().isIn(['landing_page', 'social_media', 'referral', 'advertisement', 'other']).withMessage('Invalid source'),
  body('utmSource').optional().isString().trim(),
  body('utmMedium').optional().isString().trim(),
  body('utmCampaign').optional().isString().trim()
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
      phone,
      waitlistReason,
      source = 'landing_page',
      utmSource,
      utmMedium,
      utmCampaign
    } = req.body;

    // Get client information
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];

    // Create signup data - hardcoded to waitlist
    const signupData = {
      email: email.toLowerCase(),
      firstName,
      lastName,
      phone,
      userType: 'waitlist', // Hardcoded to waitlist
      isWaitlisted: true, // Always true for waitlist
      waitlistReason: waitlistReason || 'Landing page signup', // Default reason if none provided
      source,
      utmSource,
      utmMedium,
      utmCampaign,
      ipAddress,
      userAgent
    };

    // Create the signup
    const signup = await LandingPage.createSignup(signupData);

    // Send welcome email (you can implement this later)
    // await sendWelcomeEmail(signup.email, signup.firstName);

    // Track conversion in analytics
    if (process.env.GTM_ID) {
      // You can implement GTM event tracking here
      console.log('GTM Event: Waitlist Signup', {
        email: signup.email,
        source: signup.source,
        utm_source: signup.utmSource,
        utm_medium: signup.utmMedium,
        utm_campaign: signup.utmCampaign
      });
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for joining our waitlist! We\'ll notify you when we launch.',
      data: {
        id: signup._id,
        email: signup.email,
        fullName: signup.fullName
      }
    });

  } catch (error) {
    console.error('Waitlist signup error:', error);
    
    if (error.message === 'This email is already registered') {
      return res.status(409).json({
        success: false,
        message: 'This email is already on our waitlist. Thank you for your interest!'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to join waitlist. Please try again.'
    });
  }
});

// Unsubscribe endpoint
router.post('/unsubscribe', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('token').optional().isString().withMessage('Token must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, token } = req.body;

    const signup = await LandingPage.findOne({ email: email.toLowerCase() });
    
    if (!signup) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our records.'
      });
    }

    // Update status to unsubscribed
    signup.status = 'unsubscribed';
    signup.isSubscribed = false;
    await signup.save();

    res.json({
      success: true,
      message: 'You have been successfully unsubscribed.'
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe. Please try again.'
    });
  }
});

// Resubscribe endpoint
router.post('/resubscribe', [
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email } = req.body;

    const signup = await LandingPage.findOne({ email: email.toLowerCase() });
    
    if (!signup) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our records.'
      });
    }

    // Update status to active
    signup.status = 'active';
    signup.isSubscribed = true;
    await signup.save();

    res.json({
      success: true,
      message: 'You have been successfully resubscribed!'
    });

  } catch (error) {
    console.error('Resubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resubscribe. Please try again.'
    });
  }
});

// Get signup statistics (admin only)
router.get('/stats', async (req, res) => {
  try {
    // In a real app, you'd add authentication here
    const stats = await LandingPage.getStats();
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics.'
    });
  }
});

// Get all signups (admin only, with pagination)
router.get('/signups', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const source = req.query.source;

    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;

    const skip = (page - 1) * limit;

    const signups = await LandingPage.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await LandingPage.countDocuments(filter);

    res.json({
      success: true,
      data: {
        signups,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get signups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch signups.'
    });
  }
});

// Update signup (admin only)
router.put('/signups/:id', [
  body('firstName').optional().isString().trim().isLength({ max: 50 }),
  body('lastName').optional().isString().trim().isLength({ max: 50 }),
  body('phone').optional().isString().trim().matches(/^[\+]?[1-9][\d]{0,15}$/),
  body('status').optional().isIn(['active', 'unsubscribed', 'bounced', 'spam']),
  body('notes').optional().isString().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const signup = await LandingPage.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!signup) {
      return res.status(404).json({
        success: false,
        message: 'Signup not found.'
      });
    }

    res.json({
      success: true,
      data: signup
    });

  } catch (error) {
    console.error('Update signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update signup.'
    });
  }
});

// Delete signup (admin only)
router.delete('/signups/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const signup = await LandingPage.findByIdAndDelete(id);

    if (!signup) {
      return res.status(404).json({
        success: false,
        message: 'Signup not found.'
      });
    }

    res.json({
      success: true,
      message: 'Signup deleted successfully.'
    });

  } catch (error) {
    console.error('Delete signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete signup.'
    });
  }
});

// Export signups to CSV (admin only)
router.get('/export', async (req, res) => {
  try {
    const signups = await LandingPage.find({})
      .sort({ createdAt: -1 })
      .select('-__v');

    const csvHeaders = [
      'Email',
      'First Name',
      'Last Name',
      'Phone',
      'Source',
      'UTM Source',
      'UTM Medium',
      'UTM Campaign',
      'Status',
      'Subscribed',
      'Created At',
      'Updated At'
    ];

    const csvData = signups.map(signup => [
      signup.email,
      signup.firstName || '',
      signup.lastName || '',
      signup.phone || '',
      signup.source,
      signup.utmSource || '',
      signup.utmMedium || '',
      signup.utmCampaign || '',
      signup.status,
      signup.isSubscribed,
      signup.createdAt.toISOString(),
      signup.updatedAt.toISOString()
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="signups-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export signups.'
    });
  }
});

// GET /api/landing/demolition-prep-checklist - Generate and download demolition prep checklist PDF
router.get('/demolition-prep-checklist', async (req, res) => {
  try {
    console.log('📄 Generating Demolition Prep Checklist PDF');

    const pdfService = new DemolitionPrepChecklistPdfService();
    const pdfResult = await pdfService.generateDemolitionPrepChecklistPdf();

    res.download(pdfResult.filePath, pdfResult.fileName, (err) => {
      if (err) {
        console.error('❌ Error sending demolition prep checklist PDF:', err);
        return res.status(500).json({ success: false, error: 'Failed to send PDF file' });
      }
      // Clean up file after download
      fs.unlink(pdfResult.filePath, () => {});
    });

  } catch (error) {
    console.error('❌ Error generating demolition prep checklist PDF:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check for landing page
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Landing page API is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      signup: 'POST /signup',
      unsubscribe: 'POST /unsubscribe',
      resubscribe: 'POST /resubscribe',
      stats: 'GET /stats',
      signups: 'GET /signups',
      demolitionPrepChecklist: 'GET /demolition-prep-checklist'
    }
  });
});

module.exports = router; 