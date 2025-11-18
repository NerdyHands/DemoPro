const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  milestoneId: {
    type: String,
    unique: true,
    default: function() {
      return `MS-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
  },
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
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
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['Payment', 'Project Phase', 'Delivery', 'Approval', 'Inspection', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Overdue', 'Cancelled', 'On Hold'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  // Payment related fields
  payment: {
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    dueDate: Date,
    paidDate: Date,
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Check', 'Credit Card', 'Bank Transfer', 'Stripe', 'Other']
    },
    transactionId: String,
    invoiceNumber: String,
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid', 'Overdue', 'Failed', 'Refunded'],
      default: 'Pending'
    },
    partialPayments: [{
      amount: Number,
      date: Date,
      method: String,
      transactionId: String,
      notes: String
    }],
    lateFees: {
      amount: Number,
      appliedDate: Date
    }
  },
  // Timeline fields
  timeline: {
    plannedStartDate: Date,
    plannedEndDate: Date,
    actualStartDate: Date,
    actualEndDate: Date,
    estimatedDuration: Number, // in days
    actualDuration: Number // in days
  },
  // Dependencies
  dependencies: [{
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone'
    },
    type: {
      type: String,
      enum: ['Finish to Start', 'Start to Start', 'Finish to Finish', 'Start to Finish'],
      default: 'Finish to Start'
    },
    lagTime: Number // in days
  }],
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
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  // Deliverables and requirements
  deliverables: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    fileUrl: String
  }],
  // Approval workflow
  approvals: [{
    approverType: {
      type: String,
      enum: ['Customer', 'Admin', 'Technician', 'Inspector', 'Other'],
      required: true
    },
    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Requested Changes'],
      default: 'Pending'
    },
    comments: String,
    date: Date,
    required: {
      type: Boolean,
      default: true
    }
  }],
  // Notifications and reminders
  notifications: [{
    type: {
      type: String,
      enum: ['Email', 'SMS', 'Push', 'In-App'],
      default: 'Email'
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    sentAt: Date,
    scheduled: Boolean,
    scheduledFor: Date
  }],
  // Quality assurance
  qualityCheck: {
    required: {
      type: Boolean,
      default: false
    },
    completed: {
      type: Boolean,
      default: false
    },
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    checkDate: Date,
    passed: Boolean,
    notes: String,
    issues: [String]
  },
  // Financial tracking
  costs: {
    budgeted: Number,
    actual: Number,
    variance: Number,
    laborCost: Number,
    materialCost: Number,
    overheadCost: Number
  },
  // Documentation
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['Contract', 'Invoice', 'Receipt', 'Permit', 'Certificate', 'Photo', 'Report', 'Other']
    },
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Notes and comments
  notes: String,
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],
  // System fields
  autoAdvance: {
    type: Boolean,
    default: false // Whether to automatically advance to next milestone
  },
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    interval: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly']
    },
    endDate: Date
  }
}, {
  timestamps: true,
  collection: 'milestones'
});

// Indexes for performance
milestoneSchema.index({ contractId: 1 });
milestoneSchema.index({ jobId: 1 });
milestoneSchema.index({ customerId: 1 });
milestoneSchema.index({ status: 1 });
milestoneSchema.index({ type: 1 });
milestoneSchema.index({ 'payment.dueDate': 1 });
milestoneSchema.index({ 'payment.paymentStatus': 1 });
milestoneSchema.index({ 'timeline.plannedEndDate': 1 });
milestoneSchema.index({ priority: 1 });

// Virtual fields
milestoneSchema.virtual('isOverdue').get(function() {
  if (this.status === 'Completed') return false;
  const dueDate = this.payment?.dueDate || this.timeline?.plannedEndDate;
  return dueDate && new Date() > new Date(dueDate);
});

milestoneSchema.virtual('daysUntilDue').get(function() {
  const dueDate = this.payment?.dueDate || this.timeline?.plannedEndDate;
  if (!dueDate) return null;
  const today = new Date();
  const due = new Date(dueDate);
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
});

milestoneSchema.virtual('totalPaid').get(function() {
  if (!this.payment) return 0;
  const mainPayment = this.payment.paymentStatus === 'Paid' ? this.payment.amount : 0;
  const partialPayments = this.payment.partialPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  return mainPayment + partialPayments;
});

milestoneSchema.virtual('remainingBalance').get(function() {
  if (!this.payment?.amount) return 0;
  return this.payment.amount - this.totalPaid;
});

// Methods
milestoneSchema.methods.markAsCompleted = function(completedBy) {
  this.status = 'Completed';
  this.timeline.actualEndDate = new Date();
  this.progress.percentage = 100;
  this.progress.lastUpdated = new Date();
  this.progress.updatedBy = completedBy;
  
  if (this.timeline.actualStartDate) {
    const duration = (this.timeline.actualEndDate - this.timeline.actualStartDate) / (1000 * 60 * 60 * 24);
    this.timeline.actualDuration = Math.ceil(duration);
  }
};

milestoneSchema.methods.addPayment = function(amount, method, transactionId, notes) {
  if (!this.payment.partialPayments) {
    this.payment.partialPayments = [];
  }
  
  this.payment.partialPayments.push({
    amount,
    date: new Date(),
    method,
    transactionId,
    notes
  });
  
  // Update payment status
  const totalPaid = this.totalPaid;
  if (totalPaid >= this.payment.amount) {
    this.payment.paymentStatus = 'Paid';
    this.payment.paidDate = new Date();
  } else if (totalPaid > 0) {
    this.payment.paymentStatus = 'Partial';
  }
};

milestoneSchema.methods.canStart = function() {
  // Check if all dependencies are completed
  return this.dependencies.every(dep => {
    // This would need to be populated to check actual dependency status
    return true; // Simplified for now
  });
};

milestoneSchema.methods.getApprovalStatus = function() {
  const required = this.approvals.filter(approval => approval.required);
  const approved = required.filter(approval => approval.status === 'Approved');
  return {
    total: required.length,
    approved: approved.length,
    pending: required.length - approved.length,
    allApproved: required.length > 0 && approved.length === required.length
  };
};

module.exports = mongoose.model('Milestone', milestoneSchema);


