const mongoose = require('mongoose');

const landingPageSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please enter a valid phone number'
    ]
  },
  source: {
    type: String,
    enum: ['landing_page', 'social_media', 'referral', 'advertisement', 'other'],
    default: 'landing_page'
  },
  utmSource: {
    type: String,
    trim: true
  },
  utmMedium: {
    type: String,
    trim: true
  },
  utmCampaign: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  isSubscribed: {
    type: Boolean,
    default: true
  },
  lastEmailSent: {
    type: Date
  },
  emailSentCount: {
    type: Number,
    default: 0
  },
  welcomeEmailSent: {
    type: Boolean,
    default: false
  },
  welcomeEmailSentDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed', 'bounced', 'spam'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  userType: {
    type: String,
    enum: ['client', 'waitlist'],
    default: 'client'
  },
  isWaitlisted: {
    type: Boolean,
    default: false
  },
  waitlistReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Waitlist reason cannot exceed 200 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
// Email index is automatically created by unique: true constraint
landingPageSchema.index({ createdAt: -1 });
landingPageSchema.index({ status: 1 });

// Virtual for full name
landingPageSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || '';
});

// Pre-save middleware to ensure email is lowercase and isWaitlisted is set correctly
landingPageSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  
  // Ensure isWaitlisted is set based on userType
  if (this.userType === 'waitlist') {
    this.isWaitlisted = true;
  } else if (this.userType === 'client') {
    this.isWaitlisted = false;
  }
  
  next();
});

// Static method to create a new signup
landingPageSchema.statics.createSignup = async function(signupData) {
  try {
    const signup = new this(signupData);
    await signup.save();
    return signup;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('This email is already registered');
    }
    throw error;
  }
};

// Static method to get signup statistics
landingPageSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        unsubscribed: {
          $sum: { $cond: [{ $eq: ['$status', 'unsubscribed'] }, 1, 0] }
        },
        today: {
          $sum: {
            $cond: [
              {
                $gte: [
                  '$createdAt',
                  new Date(new Date().setHours(0, 0, 0, 0))
                ]
              },
              1,
              0
            ]
          }
        },
        thisWeek: {
          $sum: {
            $cond: [
              {
                $gte: [
                  '$createdAt',
                  new Date(new Date().setDate(new Date().getDate() - 7))
                ]
              },
              1,
              0
            ]
          }
        },
        thisMonth: {
          $sum: {
            $cond: [
              {
                $gte: [
                  '$createdAt',
                  new Date(new Date().getFullYear(), new Date().getMonth(), 1)
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

  return stats[0] || {
    total: 0,
    active: 0,
    unsubscribed: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  };
};

module.exports = mongoose.model('LandingPage', landingPageSchema); 