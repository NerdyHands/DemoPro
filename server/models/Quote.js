const mongoose = require('mongoose');

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

const quoteSchema = new mongoose.Schema({
  // Reference to the project
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  
  // Reference to the demo processing record
  picraProcessingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PICRAProcessing',
    required: true
  },
  
  // Customer information
  customer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  
  // Quote details
  quoteNumber: {
    type: String,
    required: true,
    trim: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  // Quote items
  quoteItems: [quoteItemSchema],
  
  // Financial details
  subtotal: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  tax: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  total: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  // Quote status
  status: {
    type: String,
    enum: ['draft', 'sent', 'approved', 'rejected', 'expired', 'cancelled'],
    default: 'draft'
  },
  
  // Approval tracking
  approval: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'expired'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: {
      type: Date
    },
    customerResponse: {
      type: String,
      trim: true
    },
    customerNotes: {
      type: String,
      trim: true
    }
  },
  
  // Communication tracking
  communications: [{
    type: {
      type: String,
      enum: ['email', 'phone', 'in_person', 'other'],
      required: true
    },
    subject: {
      type: String,
      trim: true
    },
    message: {
      type: String,
      trim: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent'
    }
  }],
  
  // Terms and conditions
  termsAndConditions: {
    type: String,
    trim: true
  },
  
  paymentTerms: {
    type: String,
    trim: true,
    default: 'Net 30'
  },
  
  validUntil: {
    type: Date,
    required: true
  },
  
  // Admin information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Version control
  version: {
    type: Number,
    default: 1
  },
  
  // Access control
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  metadata: {
    generatedFrom: {
      type: String,
      enum: ['picra_analysis', 'manual', 'template'],
      default: 'picra_analysis'
    },
    processingTime: Number,
    templateUsed: String,
    notes: String
  }
}, {
  timestamps: true
});

// Generate quote number
quoteSchema.pre('save', async function(next) {
  if (this.isNew && !this.quoteNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get count of quotes for today
    const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });
    
    const sequence = String(count + 1).padStart(3, '0');
    this.quoteNumber = `QT-${year}${month}${day}-${sequence}`;
  }
  
  // Calculate totals
  this.calculateTotals();
  
  next();
});

// Methods
quoteSchema.methods.calculateTotals = function() {
  this.subtotal = this.quoteItems.reduce((total, item) => total + (item.totalPrice || 0), 0);
  this.total = this.subtotal + this.tax;
};

quoteSchema.methods.addCommunication = function(communicationData) {
  this.communications.push(communicationData);
  return this.save();
};

quoteSchema.methods.updateApprovalStatus = function(status, customerResponse = null, customerNotes = null) {
  this.approval.status = status;
  this.approval.respondedAt = new Date();
  
  if (customerResponse) {
    this.approval.customerResponse = customerResponse;
  }
  
  if (customerNotes) {
    this.approval.customerNotes = customerNotes;
  }
  
  // Update main status based on approval
  if (status === 'approved') {
    this.status = 'approved';
  } else if (status === 'rejected') {
    this.status = 'rejected';
  }
  
  return this.save();
};

quoteSchema.methods.sendToCustomer = function(sentBy) {
  this.status = 'sent';
  this.approval.requestedAt = new Date();
  
  // Add communication record
  this.communications.push({
    type: 'email',
    subject: `Quote ${this.quoteNumber} - ${this.title}`,
    message: `Your quote ${this.quoteNumber} has been sent. Please review and respond.`,
    sentBy: sentBy,
    recipient: this.customer.email,
    status: 'sent'
  });
  
  return this.save();
};

quoteSchema.methods.isExpired = function() {
  return new Date() > this.validUntil;
};

// Static methods
quoteSchema.statics.findByProject = function(projectId) {
  return this.find({ projectId, isActive: true })
    .populate('projectId', 'name address')
    .populate('picraProcessingId', 'status openAIResults')
    .populate('createdBy', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

quoteSchema.statics.findByStatus = function(status) {
  return this.find({ status, isActive: true })
    .populate('projectId', 'name address')
    .populate('customer', 'name email')
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 });
};

quoteSchema.statics.findPendingApproval = function() {
  return this.find({ 
    'approval.status': 'pending',
    status: 'sent',
    isActive: true 
  })
    .populate('projectId', 'name address')
    .populate('customer', 'name email')
    .populate('createdBy', 'firstName lastName')
    .sort({ 'approval.requestedAt': 1 });
};

// Indexes for better query performance
quoteSchema.index({ projectId: 1 });
quoteSchema.index({ status: 1 });
quoteSchema.index({ 'approval.status': 1 });
quoteSchema.index({ quoteNumber: 1 }, { unique: true });
quoteSchema.index({ createdAt: -1 });
quoteSchema.index({ validUntil: 1 });

module.exports = mongoose.model('Quote', quoteSchema); 