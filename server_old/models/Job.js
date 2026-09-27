const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    unique: true,
    default: function() {
      return `JOB-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
  },
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Needs Review'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  // Technician assignment
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,
  // Timeline
  timeline: {
    estimatedDuration: Number, // in hours
    actualDuration: Number, // in hours
    scheduledDate: Date,
    startDate: Date,
    endDate: Date,
    completedDate: Date
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  location: {
    address: {
      type: String,
      trim: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    accessInstructions: String,
    contactPerson: {
      name: String,
      phone: String,
      email: String
    }
  },
  // Work details
  workType: {
    type: String,
    enum: ['Installation', 'Repair', 'Maintenance', 'Inspection', 'Emergency', 'Consultation', 'Other'],
    default: 'Repair'
  },
  skillsRequired: [{
    type: String,
    enum: ['HVAC', 'Electrical', 'Plumbing', 'General Maintenance', 'Carpentry', 'Roofing', 'Painting', 'Flooring', 'Other']
  }],
  materialsNeeded: [{
    item: String,
    quantity: Number,
    unit: String,
    estimated: Boolean,
    cost: Number
  }],
  toolsRequired: [String],
  safetyRequirements: [String],
  // Progress tracking
  progress: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    milestones: [{
      name: String,
      completed: Boolean,
      completedAt: Date
    }]
  },
  // Communication
  notes: String,
  internalNotes: String,
  customerNotes: String,
  // Quality and completion
  qualityCheck: {
    required: Boolean,
    completed: Boolean,
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    checkDate: Date,
    passed: Boolean,
    issues: [String]
  },
  customerApproval: {
    required: Boolean,
    approved: Boolean,
    approvedAt: Date,
    signature: String,
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String
    }
  },
  // Financial
  estimatedCost: {
    labor: Number,
    materials: Number,
    total: Number
  },
  actualCost: {
    labor: Number,
    materials: Number,
    total: Number
  },
  // AppSheet compatibility fields
  appSheetId: String,
  source: {
    type: String,
    enum: ['mongodb', 'appsheet', 'manual'],
    default: 'mongodb'
  },
  // Recurring job fields
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['Weekly', 'Monthly', 'Quarterly', 'Yearly']
    },
    nextScheduled: Date,
    parentJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    }
  }
}, {
  timestamps: true,
  collection: 'jobs'
});

// Indexes for performance
jobSchema.index({ status: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ startDate: 1 });
jobSchema.index({ assignedTechnician: 1 });
jobSchema.index({ priority: 1 });
jobSchema.index({ workType: 1 });
jobSchema.index({ skillsRequired: 1 });
jobSchema.index({ 'location.coordinates': '2dsphere' });
jobSchema.index({ 'timeline.scheduledDate': 1 });

// Methods
jobSchema.methods.toAppSheetFormat = function() {
  return {
    JobID: this.jobId,
    ContractID: this.contractId,
    CustomerID: this.customerId,
    Title: this.title,
    Description: this.description || '',
    Status: this.status,
    StartDate: this.startDate?.toISOString(),
    EndDate: this.endDate?.toISOString(),
    Location: this.location || '',
    CreatedDate: this.createdAt?.toISOString(),
    UpdatedDate: this.updatedAt?.toISOString(),
    Notes: this.notes || ''
  };
};

jobSchema.statics.fromAppSheetFormat = function(appSheetData) {
  return {
    jobId: appSheetData.JobID,
    contractId: appSheetData.ContractID,
    customerId: appSheetData.CustomerID,
    title: appSheetData.Title,
    description: appSheetData.Description,
    status: appSheetData.Status,
    startDate: appSheetData.StartDate ? new Date(appSheetData.StartDate) : undefined,
    endDate: appSheetData.EndDate ? new Date(appSheetData.EndDate) : undefined,
    location: { address: appSheetData.Location },
    notes: appSheetData.Notes,
    appSheetId: appSheetData.JobID,
    source: 'appsheet'
  };
};

// Virtual fields
jobSchema.virtual('isOverdue').get(function() {
  if (this.status === 'Completed') return false;
  const dueDate = this.endDate || this.timeline?.scheduledDate;
  return dueDate && new Date() > new Date(dueDate);
});

jobSchema.virtual('daysUntilDue').get(function() {
  const dueDate = this.endDate || this.timeline?.scheduledDate;
  if (!dueDate) return null;
  const today = new Date();
  const due = new Date(dueDate);
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
});

jobSchema.virtual('totalEstimatedCost').get(function() {
  return (this.estimatedCost?.labor || 0) + (this.estimatedCost?.materials || 0);
});

jobSchema.virtual('totalActualCost').get(function() {
  return (this.actualCost?.labor || 0) + (this.actualCost?.materials || 0);
});

// Instance methods
jobSchema.methods.assignTechnician = function(technicianId, assignedBy) {
  this.assignedTechnician = technicianId;
  this.assignedBy = assignedBy;
  this.assignedAt = new Date();
  this.status = 'Assigned';
};

jobSchema.methods.startWork = function() {
  this.status = 'In Progress';
  this.timeline.startDate = new Date();
  this.progress.lastUpdated = new Date();
};

jobSchema.methods.completeJob = function() {
  this.status = 'Completed';
  this.timeline.completedDate = new Date();
  this.progress.percentage = 100;
  this.progress.lastUpdated = new Date();
  
  if (this.timeline.startDate) {
    const duration = (this.timeline.completedDate - this.timeline.startDate) / (1000 * 60 * 60);
    this.timeline.actualDuration = Math.round(duration * 100) / 100; // Round to 2 decimal places
  }
};

jobSchema.methods.updateProgress = function(percentage, milestone) {
  this.progress.percentage = Math.min(Math.max(percentage, 0), 100);
  this.progress.lastUpdated = new Date();
  
  if (milestone) {
    this.progress.milestones.push({
      name: milestone,
      completed: true,
      completedAt: new Date()
    });
  }
};

jobSchema.methods.requiresSkill = function(skill) {
  return this.skillsRequired.includes(skill);
};

jobSchema.methods.canBeAssignedTo = function(technician) {
  // Check if technician has required skills
  const hasRequiredSkills = this.skillsRequired.every(skill => 
    technician.specializations.includes(skill) || 
    technician.skills.some(s => s.skill === skill)
  );
  
  return hasRequiredSkills && technician.canTakeJob();
};

module.exports = mongoose.model('Job', jobSchema);
