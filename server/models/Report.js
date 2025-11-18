const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  reportType: {
    type: String,
    enum: ['picra', 'inspection', 'estimate'],
    required: true
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
  fileUrl: {
    type: String,
    required: true,
    trim: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewDate: {
    type: Date
  },
  reviewNotes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    inspectionDate: {
      type: Date
    },
    inspector: {
      type: String,
      trim: true
    },
    propertyAddress: {
      type: String,
      trim: true
    },
    findings: [{
      category: {
        type: String,
        trim: true
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      },
      description: {
        type: String,
        trim: true
      },
      estimatedCost: {
        type: Number,
        min: 0
      },
      recommendations: {
        type: String,
        trim: true
      }
    }],
    totalEstimatedCost: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate total estimated cost from findings
reportSchema.methods.calculateTotalCost = function() {
  this.metadata.totalEstimatedCost = this.metadata.findings.reduce((total, finding) => {
    return total + (finding.estimatedCost || 0);
  }, 0);
  return this.metadata.totalEstimatedCost;
};

// Get findings by severity
reportSchema.methods.getFindingsBySeverity = function() {
  const findings = {
    critical: [],
    high: [],
    medium: [],
    low: []
  };
  
  this.metadata.findings.forEach(finding => {
    findings[finding.severity].push(finding);
  });
  
  return findings;
};

// Pre-save middleware to calculate total cost
reportSchema.pre('save', function(next) {
  if (this.metadata && this.metadata.findings) {
    this.calculateTotalCost();
  }
  next();
});

// Index for better query performance
reportSchema.index({ projectId: 1, reportType: 1 });
reportSchema.index({ uploadedBy: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema); 