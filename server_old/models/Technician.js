const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema({
  technicianId: {
    type: String,
    unique: true,
    default: function() {
      return `TECH-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  specializations: [{
    type: String,
    enum: ['HVAC', 'Electrical', 'Plumbing', 'General Maintenance', 'Carpentry', 'Roofing', 'Painting', 'Flooring', 'Other'],
    required: true
  }],
  skills: [{
    skill: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate'
    }
  }],
  certifications: [{
    name: {
      type: String,
      required: true
    },
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date,
    certificateNumber: String
  }],
  hourlyRate: {
    type: Number,
    min: 0,
    default: 0
  },
  availability: {
    type: String,
    enum: ['Available', 'Busy', 'On Leave', 'Unavailable'],
    default: 'Available'
  },
  currentJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  notes: String,
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  collection: 'technicians'
});

// Indexes for performance
technicianSchema.index({ specializations: 1 });
technicianSchema.index({ availability: 1 });
technicianSchema.index({ isActive: 1 });
technicianSchema.index({ 'address.coordinates': '2dsphere' });

// Virtual for full name
technicianSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for current job count
technicianSchema.virtual('currentJobCount').get(function() {
  return this.currentJobs ? this.currentJobs.length : 0;
});

// Methods
technicianSchema.methods.canTakeJob = function() {
  return this.isActive && this.availability === 'Available' && this.currentJobCount < 5;
};

technicianSchema.methods.getSpecializationString = function() {
  return this.specializations.join(', ');
};

technicianSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating.average * this.rating.reviewCount) + newRating;
  this.rating.reviewCount += 1;
  this.rating.average = totalRating / this.rating.reviewCount;
};

module.exports = mongoose.model('Technician', technicianSchema);


