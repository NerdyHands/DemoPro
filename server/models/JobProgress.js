const mongoose = require('mongoose');

const jobProgressSchema = new mongoose.Schema({
  progressId: {
    type: String,
    unique: true,
    default: function() {
      return `PROG-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
    required: true
  },
  logType: {
    type: String,
    enum: ['Time Log', 'Status Update', 'Note', 'Issue', 'Completion', 'Image Upload'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Needs Review'],
    default: 'In Progress'
  },
  timeLog: {
    startTime: Date,
    endTime: Date,
    duration: Number, // in minutes
    breakTime: Number, // in minutes
    overTime: Number, // in minutes
    hourlyRate: Number
  },
  location: {
    description: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    address: String
  },
  workPerformed: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  materialsUsed: [{
    item: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      default: 'piece'
    },
    cost: {
      type: Number,
      min: 0
    }
  }],
  images: [{
    filename: {
      type: String,
      required: true
    },
    originalName: String,
    mimeType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    description: String,
    category: {
      type: String,
      enum: ['Before', 'During', 'After', 'Issue', 'Completed', 'Other'],
      default: 'During'
    },
    gcsUrl: String, // Google Cloud Storage URL
    metadata: {
      width: Number,
      height: Number,
      gpsLocation: {
        lat: Number,
        lng: Number
      }
    }
  }],
  quality: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    notes: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date
  },
  issues: [{
    description: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolution: String,
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  nextSteps: String,
  estimatedCompletion: Date,
  customerFeedback: {
    satisfied: Boolean,
    comments: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    submittedAt: Date
  },
  isPublic: {
    type: Boolean,
    default: false // Whether customer can see this progress
  },
  tags: [String],
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    gcsUrl: String
  }]
}, {
  timestamps: true,
  collection: 'job_progress'
});

// Indexes for performance
jobProgressSchema.index({ jobId: 1, createdAt: -1 });
jobProgressSchema.index({ technicianId: 1 });
jobProgressSchema.index({ logType: 1 });
jobProgressSchema.index({ status: 1 });
jobProgressSchema.index({ 'timeLog.startTime': 1 });
jobProgressSchema.index({ tags: 1 });

// Virtual for total work time
jobProgressSchema.virtual('totalWorkTime').get(function() {
  if (this.timeLog && this.timeLog.duration) {
    return this.timeLog.duration - (this.timeLog.breakTime || 0);
  }
  return 0;
});

// Virtual for labor cost
jobProgressSchema.virtual('laborCost').get(function() {
  const workMinutes = this.totalWorkTime;
  const hourlyRate = this.timeLog?.hourlyRate || 0;
  return (workMinutes / 60) * hourlyRate;
});

// Virtual for material cost
jobProgressSchema.virtual('materialCost').get(function() {
  return this.materialsUsed.reduce((total, material) => {
    return total + (material.cost || 0) * material.quantity;
  }, 0);
});

// Methods
jobProgressSchema.methods.calculateDuration = function() {
  if (this.timeLog && this.timeLog.startTime && this.timeLog.endTime) {
    const duration = (this.timeLog.endTime - this.timeLog.startTime) / (1000 * 60); // in minutes
    this.timeLog.duration = Math.round(duration);
    return this.timeLog.duration;
  }
  return 0;
};

jobProgressSchema.methods.addImage = function(imageData) {
  this.images.push({
    ...imageData,
    uploadedAt: new Date()
  });
};

jobProgressSchema.methods.resolveIssue = function(issueIndex, resolution, resolvedBy) {
  if (this.issues[issueIndex]) {
    this.issues[issueIndex].resolved = true;
    this.issues[issueIndex].resolution = resolution;
    this.issues[issueIndex].resolvedAt = new Date();
    this.issues[issueIndex].resolvedBy = resolvedBy;
  }
};

module.exports = mongoose.model('JobProgress', jobProgressSchema);


