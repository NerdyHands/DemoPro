const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: false, // Optional for OTP-based registration
    default: undefined
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'inspector', 'client'],
    default: 'client'
  },
  company: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isWaitlisted: {
    type: Boolean,
    default: false
  },
  waitlistReason: {
    type: String,
    trim: true
  },
  lastLogin: {
    type: Date
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    }
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  // Google OAuth fields
  googleId: {
    type: String,
    index: true,
    sparse: true // Allows multiple null values
  },
  profilePicture: {
    type: String,
    trim: true
  },
  isGoogleUser: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ isWaitlisted: 1, isActive: 1 });
userSchema.index({ role: 1, isActive: 1, isWaitlisted: 1 });
userSchema.index({ role: 1, isActive: 1, createdAt: 1 });
userSchema.index({ role: 1, isActive: 1, lastLogin: 1 });
userSchema.index({ isWaitlisted: 1, isActive: 1, createdAt: 1 });
userSchema.index({ isWaitlisted: 1, isActive: 1, lastLogin: 1 });
userSchema.index({ isGoogleUser: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false; // No password set (OTP-based user)
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  return userObject;
};

// Indexes - using explicit indexes instead of unique constraints
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema); 