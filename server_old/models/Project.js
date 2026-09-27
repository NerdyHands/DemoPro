const mongoose = require('mongoose');

const repairSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date
  },
  completionDate: {
    type: Date
  },
  contractor: {
    type: String,
    trim: true
  }
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  reportType: {
    type: String,
    enum: ['inspection', 'repair', 'estimate'],
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  demoReport: {
    url: {
      type: String,
      trim: true
    },
    filename: {
      type: String,
      trim: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    version: {
      type: Number,
      default: 1
    }
  },
  homeInspectionReport: {
    url: {
      type: String,
      trim: true
    },
    filename: {
      type: String,
      trim: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    version: {
      type: Number,
      default: 1
    }
  },
  repairs: [repairSchema],
  additionalNotes: {
    type: String,
    trim: true
  },
  totalCost: {
    type: Number,
    default: 0,
    min: 0
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Calculate total cost from repairs
projectSchema.methods.calculateTotalCost = function() {
  this.totalCost = this.repairs.reduce((total, repair) => total + repair.cost, 0);
  return this.totalCost;
};

// Get status summary
projectSchema.methods.getStatusSummary = function() {
  const summary = {
    completed: 0,
    'in-progress': 0,
    pending: 0
  };
  
  this.repairs.forEach(repair => {
    summary[repair.status]++;
  });
  
  return summary;
};

// Pre-save middleware to calculate total cost
projectSchema.pre('save', function(next) {
  this.calculateTotalCost();
  next();
});

// Index for better query performance
projectSchema.index({ owner: 1, status: 1 });
projectSchema.index({ deadline: 1 });
projectSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model('Project', projectSchema); 