const mongoose = require('mongoose');

// Task status schema
const taskItemSchema = new mongoose.Schema({
  taskNumber: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['Repair', 'Installation', 'Inspection', 'Maintenance', 'Other'],
    default: 'Repair'
  },
  status: {
    type: String,
    enum: ['Complete', 'Needs Attention', 'In Progress', 'Not Started'],
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  completedDate: Date,
  assignedTo: String,
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  }
}, { _id: false });

// Line item schema for inspection reports (from contracts/amendments)
const lineItemWithInspectionSchema = new mongoose.Schema({
  lineItemNumber: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  quantity: {
    type: Number,
    default: 1
  },
  unitPrice: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  // Inspection-specific fields
  inspectionStatus: {
    type: String,
    enum: ['Complete', 'Needs Attention', 'In Progress', 'Not Started', 'N/A'],
    default: 'Not Started'
  },
  inspectionNotes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  // Support multiple images per line item
  images: [{
    filename: String,
    originalName: String,
    gcsUrl: String,
    caption: String,
    uploadedAt: Date,
    size: Number,
    mimeType: String,
    order: {
      type: Number,
      default: 0
    }
  }],
  // Backward compatibility - kept for existing reports
  image: {
    filename: String,
    originalName: String,
    gcsUrl: String,
    caption: String,
    uploadedAt: Date,
    size: Number,
    mimeType: String
  },
  completedDate: Date,
  // Amendment tracking
  sourceType: {
    type: String,
    enum: ['original', 'amendment'],
    default: 'original'
  },
  amendmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContractAmendment'
  }
}, { _id: false });

// Image schema for report photos
const reportImageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: String,
  gcsUrl: String,
  caption: {
    type: String,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    enum: ['Before', 'During', 'After', 'Issue', 'Completed', 'Documentation', 'Other'],
    default: 'Documentation'
  },
  taskNumber: String, // Link image to specific task
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  size: Number,
  mimeType: String
}, { _id: false });

const clientReportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    unique: true,
    default: function() {
      return `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
  },
  reportNumber: {
    type: String,
    required: true,
    unique: true
  },
  // Reference to job or contract
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract'
  },
  // Customer information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: String,
  customerPhone: String,
  // Report details
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
  reportDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  propertyAddress: {
    type: String,
    trim: true,
    maxlength: 500
  },
  // Report sections
  executiveSummary: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  workPerformed: {
    type: String,
    trim: true,
    maxlength: 3000
  },
  materialsUsed: [{
    item: String,
    quantity: Number,
    unit: String,
    description: String
  }],
  // Task items with status
  tasks: [taskItemSchema],
  // Line items from contract/amendments with inspection data
  lineItems: [lineItemWithInspectionSchema],
  // Summary counts
  tasksSummary: {
    total: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    },
    needsAttention: {
      type: Number,
      default: 0
    },
    inProgress: {
      type: Number,
      default: 0
    },
    notStarted: {
      type: Number,
      default: 0
    }
  },
  // Images for report
  images: [reportImageSchema],
  // Time tracking
  workDuration: {
    startDate: Date,
    endDate: Date,
    totalHours: Number
  },
  // Additional sections
  recommendations: [{
    description: String,
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    estimatedCost: Number
  }],
  futureWork: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  safetyNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  warrantyInfo: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  // Report status
  status: {
    type: String,
    enum: ['Draft', 'In Review', 'Approved', 'Sent to Client', 'Archived'],
    default: 'Draft'
  },
  // Client interaction
  sentToClient: {
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date,
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emailSent: Boolean
  },
  clientViewed: {
    viewed: {
      type: Boolean,
      default: false
    },
    viewedAt: Date,
    viewCount: {
      type: Number,
      default: 0
    }
  },
  clientSignature: {
    signed: {
      type: Boolean,
      default: false
    },
    signedAt: Date,
    signatureData: String, // Base64 signature
    clientName: String,
    clientComments: String
  },
  // PDF generation
  pdfGenerated: {
    generated: {
      type: Boolean,
      default: false
    },
    generatedAt: Date,
    pdfUrl: String,
    pdfFilename: String
  },
  // Creator information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  technicianName: String,
  companyInfo: {
    name: String,
    phone: String,
    email: String,
    website: String,
    license: String
  },
  // Notes and attachments
  internalNotes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  attachments: [{
    filename: String,
    originalName: String,
    gcsUrl: String,
    mimeType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String]
}, {
  timestamps: true,
  collection: 'client_reports'
});

// Indexes for performance
clientReportSchema.index({ jobId: 1 });
clientReportSchema.index({ contractId: 1 });
clientReportSchema.index({ customerId: 1, createdAt: -1 });
clientReportSchema.index({ status: 1 });
clientReportSchema.index({ reportDate: -1 });
clientReportSchema.index({ 'sentToClient.sent': 1 });

// Pre-save middleware to calculate task summary
clientReportSchema.pre('save', function(next) {
  if (this.tasks && this.tasks.length > 0) {
    this.tasksSummary.total = this.tasks.length;
    this.tasksSummary.completed = this.tasks.filter(t => t.status === 'Complete').length;
    this.tasksSummary.needsAttention = this.tasks.filter(t => t.status === 'Needs Attention').length;
    this.tasksSummary.inProgress = this.tasks.filter(t => t.status === 'In Progress').length;
    this.tasksSummary.notStarted = this.tasks.filter(t => t.status === 'Not Started').length;
  }
  next();
});

// Instance methods
clientReportSchema.methods.addTask = function(taskData) {
  this.tasks.push(taskData);
  return this.save();
};

clientReportSchema.methods.updateTaskStatus = function(taskNumber, newStatus) {
  const task = this.tasks.find(t => t.taskNumber === taskNumber);
  if (task) {
    task.status = newStatus;
    if (newStatus === 'Complete') {
      task.completedDate = new Date();
    }
  }
  return this.save();
};

clientReportSchema.methods.addImage = function(imageData) {
  this.images.push(imageData);
  return this.save();
};

clientReportSchema.methods.sendToClient = function(userId) {
  this.sentToClient.sent = true;
  this.sentToClient.sentAt = new Date();
  this.sentToClient.sentBy = userId;
  this.status = 'Sent to Client';
  return this.save();
};

clientReportSchema.methods.markAsViewed = function() {
  this.clientViewed.viewed = true;
  if (!this.clientViewed.viewedAt) {
    this.clientViewed.viewedAt = new Date();
  }
  this.clientViewed.viewCount += 1;
  return this.save();
};

clientReportSchema.methods.getCompletionPercentage = function() {
  if (this.tasksSummary.total === 0) return 0;
  return Math.round((this.tasksSummary.completed / this.tasksSummary.total) * 100);
};

// Static methods
clientReportSchema.statics.getReportsByJob = function(jobId) {
  return this.find({ jobId })
    .populate('customer', 'firstName lastName email phone')
    .sort({ createdAt: -1 });
};

clientReportSchema.statics.getReportsByContract = function(contractId) {
  return this.find({ contractId })
    .populate('customer', 'firstName lastName email phone')
    .sort({ createdAt: -1 });
};

clientReportSchema.statics.getReportsByCustomer = function(customerId) {
  return this.find({ customerId })
    .sort({ createdAt: -1 });
};

clientReportSchema.statics.createFromJobProgress = async function(jobId, progressLogs) {
  const Job = mongoose.model('Job');
  const job = await Job.findById(jobId).populate('customer').populate('contractId');
  
  if (!job) {
    throw new Error('Job not found');
  }

  // Aggregate tasks from job milestones
  const tasks = job.progress?.milestones?.map((milestone, index) => ({
    taskNumber: `${index + 1}`,
    description: milestone.name,
    status: milestone.completed ? 'Complete' : 'Needs Attention',
    completedDate: milestone.completedAt,
    category: 'Repair'
  })) || [];

  // Aggregate images from progress logs
  const images = [];
  if (progressLogs && progressLogs.length > 0) {
    progressLogs.forEach(log => {
      if (log.images && log.images.length > 0) {
        log.images.forEach(img => {
          images.push({
            filename: img.filename,
            originalName: img.originalName,
            gcsUrl: img.gcsUrl,
            caption: img.description || '',
            category: img.category || 'Documentation',
            uploadedAt: img.uploadedAt,
            size: img.size,
            mimeType: img.mimeType
          });
        });
      }
    });
  }

  return {
    jobId: job._id,
    contractId: job.contractId?._id,
    customerId: job.customerId,
    customer: job.customer._id,
    customerName: job.customer ? `${job.customer.firstName} ${job.customer.lastName}` : 'Customer',
    customerEmail: job.customer?.email,
    customerPhone: job.customer?.phone,
    title: job.title,
    description: job.description,
    propertyAddress: job.location?.address,
    tasks,
    images,
    workDuration: {
      startDate: job.timeline?.startDate || job.startDate,
      endDate: job.timeline?.endDate || job.endDate,
      totalHours: job.timeline?.actualDuration
    }
  };
};

module.exports = mongoose.model('ClientReport', clientReportSchema);

