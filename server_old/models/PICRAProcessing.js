const mongoose = require('mongoose');

const repairItemSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  estimatedCost: {
    type: Number,
    required: true,
    min: 0
  },
  materials: {
    type: String,
    trim: true
  },
  laborHours: {
    type: Number,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

const quoteItemSchema = new mongoose.Schema({
  itemNumber: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: String,
    required: true,
    trim: true
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  specifications: {
    type: String,
    trim: true
  },
  materials: {
    type: String,
    trim: true
  },
  labor: {
    type: String,
    trim: true
  },
  warranty: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

const picraProcessingSchema = new mongoose.Schema({
  // Reference to the original report (optional for direct demo/inspection uploads)
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: false
  },
  
  // Reference to the project
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  
  // User who uploaded the document
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Document processing status
  status: {
    type: String,
    enum: ['pending', 'validation_failed', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  // Processing steps tracking
  processingSteps: {
    validation: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      error: String
    },
    documentUpload: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      error: String
    },
    documentAI: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      error: String
    },
    openAI: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      error: String
    },
    quoteGeneration: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      error: String
    }
  },
  
  // Validation results
  validationResults: {
    isValid: { type: Boolean, default: false },
    confidence: { type: Number, default: 0 },
    reason: String,
    details: {
      titleMatch: { type: Boolean, default: false },
      formFieldsFound: { type: Number, default: 0 },
      legalTermsFound: { type: Number, default: 0 },
      repairContentFound: { type: Boolean, default: false },
      inspectionTermsFound: { type: Number, default: 0 },
      totalFormFields: { type: Number, default: 0 },
      totalLegalTerms: { type: Number, default: 0 },
      totalInspectionTerms: { type: Number, default: 0 }
    },
    processingTime: Number,
    extractedTextLength: Number,
    sampleText: String
  },
  
  // Document AI extraction results
  documentAIResults: {
    extractedText: String,
    customSchemeOfRepairs: String,
    propertyAddress: String,
    structuredData: mongoose.Schema.Types.Mixed,
    entities: [{
      type: String,
      mentionText: String,
      confidence: Number
    }],
    processingTime: Number,
    confidence: Number
  },
  
  // OpenAI analysis results
  openAIResults: {
    summary: String,
    totalEstimatedCost: Number,
    repairItems: [repairItemSchema],
    recommendations: [String],
    timeline: String,
    riskAssessment: String,
    processingTime: Number,
    modelUsed: String,
    rawResponse: String
  },
  
  // Quote generation results
  quoteResults: {
    quoteItems: [quoteItemSchema],
    subtotal: Number,
    tax: Number,
    total: Number,
    paymentTerms: String,
    validUntil: String,
    termsAndConditions: String,
    processingTime: Number,
    modelUsed: String,
    rawResponse: String
  },
  
  // File information
  fileInfo: {
    originalName: String,
    fileName: String,
    fileSize: Number,
    mimeType: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    gcsFileName: String,
    gcsUrl: String
  },
  
  // Processing metadata
  metadata: {
    processingStartTime: Date,
    processingEndTime: Date,
    totalProcessingTime: Number,
    retryCount: {
      type: Number,
      default: 0
    },
    lastError: String,
    processingNotes: String
  },
  
  // Access control
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Version control
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Indexes for better query performance
picraProcessingSchema.index({ reportId: 1 });
picraProcessingSchema.index({ projectId: 1 });
picraProcessingSchema.index({ uploadedBy: 1 });
picraProcessingSchema.index({ status: 1 });
picraProcessingSchema.index({ createdAt: -1 });

// Methods
picraProcessingSchema.methods.updateProcessingStep = function(step, completed, error = null) {
  if (this.processingSteps[step]) {
    this.processingSteps[step].completed = completed;
    this.processingSteps[step].completedAt = completed ? new Date() : null;
    this.processingSteps[step].error = error;
  }
};

picraProcessingSchema.methods.calculateTotalProcessingTime = function() {
  if (this.metadata.processingStartTime && this.metadata.processingEndTime) {
    this.metadata.totalProcessingTime = 
      this.metadata.processingEndTime.getTime() - this.metadata.processingStartTime.getTime();
  }
};

picraProcessingSchema.methods.getProcessingProgress = function() {
  const steps = Object.keys(this.processingSteps);
  const completedSteps = steps.filter(step => this.processingSteps[step].completed);
  return {
    total: steps.length,
    completed: completedSteps.length,
    percentage: Math.round((completedSteps.length / steps.length) * 100),
    currentStep: steps.find(step => !this.processingSteps[step].completed) || 'completed'
  };
};

picraProcessingSchema.methods.getTotalEstimatedCost = function() {
  if (this.openAIResults && this.openAIResults.totalEstimatedCost) {
    return this.openAIResults.totalEstimatedCost;
  }
  
  if (this.openAIResults && this.openAIResults.repairItems) {
    return this.openAIResults.repairItems.reduce((total, item) => total + (item.estimatedCost || 0), 0);
  }
  
  return 0;
};

picraProcessingSchema.methods.getQuoteTotal = function() {
  if (this.quoteResults && this.quoteResults.total) {
    return this.quoteResults.total;
  }
  
  if (this.quoteResults && this.quoteResults.quoteItems) {
    return this.quoteResults.quoteItems.reduce((total, item) => total + (item.totalPrice || 0), 0);
  }
  
  return 0;
};

// Pre-save middleware
picraProcessingSchema.pre('save', function(next) {
  // Update status based on processing steps
  const progress = this.getProcessingProgress();
  
  if (progress.percentage === 100) {
    this.status = 'completed';
    this.metadata.processingEndTime = new Date();
  } else if (progress.percentage > 0) {
    this.status = 'processing';
  }
  
  // Calculate total processing time
  this.calculateTotalProcessingTime();
  
  next();
});

// Static methods
picraProcessingSchema.statics.findByReportId = function(reportId) {
  return this.findOne({ reportId, isActive: true })
    .populate('reportId', 'title fileName')
    .populate('projectId', 'name address')
    .populate('uploadedBy', 'firstName lastName email');
};

picraProcessingSchema.statics.findByProjectId = function(projectId) {
  return this.find({ projectId, isActive: true })
    .populate('reportId', 'title fileName')
    .populate('projectId', 'name address')
    .populate('uploadedBy', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

picraProcessingSchema.statics.findByUser = function(userId) {
  return this.find({ uploadedBy: userId, isActive: true })
    .populate('reportId', 'title fileName')
    .populate('projectId', 'name address')
    .populate('uploadedBy', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

picraProcessingSchema.statics.findPendingProcessing = function() {
  return this.find({ 
    status: { $in: ['pending', 'processing'] },
    isActive: true 
  }).sort({ createdAt: 1 });
};

module.exports = mongoose.model('PICRAProcessing', picraProcessingSchema); 