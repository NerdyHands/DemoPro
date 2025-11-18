const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const LandingPage = require('../models/LandingPage');
const { body, validationResult } = require('express-validator');

// Middleware to check if email service is enabled
const checkEmailService = (req, res, next) => {
  if (!emailService.isEnabled) {
    return res.status(503).json({
      success: false,
      message: 'Email service is currently disabled',
      reason: 'Email service disabled'
    });
  }
  next();
};

// Test email service connection
router.get('/test', checkEmailService, async (req, res) => {
  try {
    const result = await emailService.testConnection();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error testing email service:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing email service',
      error: error.message
    });
  }
});

// Send welcome email to a specific user
router.post('/welcome', [
  body('email').isEmail().normalizeEmail(),
  body('firstName').optional().trim().isLength({ max: 50 }),
  body('lastName').optional().trim().isLength({ max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, firstName, lastName } = req.body;

    // Check if user exists in database
    let user = await LandingPage.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if welcome email was already sent
    if (user.welcomeEmailSent) {
      return res.status(400).json({
        success: false,
        message: 'Welcome email already sent to this user',
        sentDate: user.welcomeEmailSentDate
      });
    }

    // Send welcome email
    const emailResult = await emailService.sendWelcomeEmail({
      email,
      firstName,
      lastName
    });

    if (emailResult.success) {
      // Update user record to mark welcome email as sent
      user.welcomeEmailSent = true;
      user.welcomeEmailSentDate = new Date();
      user.emailSentCount = (user.emailSentCount || 0) + 1;
      user.lastEmailSent = new Date();
      await user.save();

      res.json({
        success: true,
        message: 'Welcome email sent successfully',
        data: {
          email,
          messageId: emailResult.messageId,
          sentDate: emailResult.timestamp
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send welcome email',
        reason: emailResult.reason
      });
    }

  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Send welcome emails to multiple users (bulk operation)
router.post('/welcome/bulk', async (req, res) => {
  try {
    const { userIds, emails } = req.body;

    if (!userIds && !emails) {
      return res.status(400).json({
        success: false,
        message: 'Either userIds or emails must be provided'
      });
    }

    let users = [];

    if (userIds && userIds.length > 0) {
      users = await LandingPage.find({
        _id: { $in: userIds },
        welcomeEmailSent: false
      });
    } else if (emails && emails.length > 0) {
      users = await LandingPage.find({
        email: { $in: emails },
        welcomeEmailSent: false
      });
    }

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No eligible users found for welcome emails'
      });
    }

    // Send bulk welcome emails
    const result = await emailService.sendBulkWelcomeEmails(users);

    if (result.successful > 0) {
      // Update user records for successful emails
      const successfulEmails = result.results
        .filter(r => r.success)
        .map(r => r.email);

      await LandingPage.updateMany(
        { email: { $in: successfulEmails } },
        {
          $set: {
            welcomeEmailSent: true,
            welcomeEmailSentDate: new Date()
          },
          $inc: { emailSentCount: 1 },
          $set: { lastEmailSent: new Date() }
        }
      );
    }

    res.json({
      success: true,
      message: 'Bulk welcome email operation completed',
      data: result
    });

  } catch (error) {
    console.error('Error sending bulk welcome emails:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get email statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await LandingPage.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          welcomeEmailsSent: {
            $sum: { $cond: ['$welcomeEmailSent', 1, 0] }
          },
          welcomeEmailsPending: {
            $sum: { $cond: ['$welcomeEmailSent', 0, 1] }
          },
          todayEmails: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    '$welcomeEmailSentDate',
                    new Date(new Date().setHours(0, 0, 0, 0))
                  ]
                },
                1,
                0
              ]
            }
          },
          thisWeekEmails: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    '$welcomeEmailSentDate',
                    new Date(new Date().setDate(new Date().getDate() - 7))
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const emailStats = stats[0] || {
      total: 0,
      welcomeEmailsSent: 0,
      welcomeEmailsPending: 0,
      todayEmails: 0,
      thisWeekEmails: 0
    };

    res.json({
      success: true,
      data: emailStats
    });

  } catch (error) {
    console.error('Error getting email stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Resend welcome email to a user (admin only)
router.post('/welcome/resend', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Find user
    const user = await LandingPage.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Send welcome email
    const emailResult = await emailService.sendWelcomeEmail({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });

    if (emailResult.success) {
      // Update user record
      user.welcomeEmailSent = true;
      user.welcomeEmailSentDate = new Date();
      user.emailSentCount = (user.emailSentCount || 0) + 1;
      user.lastEmailSent = new Date();
      await user.save();

      res.json({
        success: true,
        message: 'Welcome email resent successfully',
        data: {
          email,
          messageId: emailResult.messageId,
          sentDate: emailResult.timestamp
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to resend welcome email',
        reason: emailResult.reason
      });
    }

  } catch (error) {
    console.error('Error resending welcome email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
