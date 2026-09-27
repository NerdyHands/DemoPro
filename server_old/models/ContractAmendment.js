const mongoose = require('mongoose');

// Schema for tracking line item changes in amendments
const lineItemChangeSchema = new mongoose.Schema({
  lineItemNumber: {
    type: String,
    required: true,
    trim: true
  },
  changeType: {
    type: String,
    enum: ['added', 'modified', 'removed'],
    required: true
  },
  // Original line item (for modified/removed items)
  original: {
    description: { type: String, trim: true },
    quantity: { type: Number, min: 0 },
    unitPrice: { type: Number },
    totalPrice: { type: Number }
  },
  // New/modified line item (for added/modified items)
  updated: {
    description: { type: String, trim: true },
    quantity: { type: Number, min: 0 },
    unitPrice: { type: Number },
    totalPrice: { type: Number }
  },
  // Cost impact calculation
  costImpact: {
    type: Number,
    default: 0
  }
}, { _id: false });

const contractAmendmentSchema = new mongoose.Schema({
  amendmentId: {
    type: String,
    unique: true,
    default: function() {
      return `amd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  },
  amendmentNumber: {
    type: String,
    required: true,
    unique: true
  },
  // Reference to original contract
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true,
    index: true
  },
  contractNumber: {
    type: String,
    required: true
  },
  // Customer information (denormalized for quick access)
  customerId: {
    type: String,
    required: true,
    index: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientAddress: {
    type: String,
    required: false,
    trim: true
  },
  propertyAddress: {
    type: String,
    required: false,
    trim: true,
    maxlength: 500
  },
  // Amendment details
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Draft'
  },
  // Line item changes
  lineItemChanges: [lineItemChangeSchema],
  
  // Financial summary
  originalContractAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  totalCostChange: {
    type: Number,
    required: true,
    default: 0
  },
  newContractAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  // Additional costs breakdown
  addedItemsTotal: {
    type: Number,
    default: 0
  },
  removedItemsTotal: {
    type: Number,
    default: 0
  },
  modifiedItemsImpact: {
    type: Number,
    default: 0
  },
  // Effective date
  effectiveDate: {
    type: Date,
    required: true
  },
  // Approval tracking
  approvalStatus: {
    approvedBy: String,
    approvedAt: Date,
    rejectedBy: String,
    rejectedAt: Date,
    rejectionReason: String
  },
  // BoldSign integration for amendment signatures
  boldSignDocumentId: String,
  boldSignMessageId: String,
  signatureStatus: {
    type: String,
    enum: ['Not Sent', 'Sent', 'In Progress', 'Completed', 'Declined', 'Expired'],
    default: 'Not Sent'
  },
  signatureSentAt: Date,
  signatureCompletedAt: Date,
  signedDocumentPath: String,
  signerUrls: [String],
  // Notes and attachments
  notes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  attachments: [{
    fileName: String,
    filePath: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  collection: 'contractAmendments'
});

// Indexes for performance
contractAmendmentSchema.index({ contractId: 1, createdAt: -1 });
contractAmendmentSchema.index({ status: 1 });
contractAmendmentSchema.index({ effectiveDate: 1 });

// Pre-save middleware to calculate financial impact
contractAmendmentSchema.pre('save', function(next) {
  if (this.lineItemChanges && this.lineItemChanges.length > 0) {
    let addedTotal = 0;
    let removedTotal = 0;
    let modifiedImpact = 0;

    this.lineItemChanges.forEach(change => {
      if (change.changeType === 'added') {
        const impact = change.updated.totalPrice || 0;
        change.costImpact = impact;
        addedTotal += impact;
      } else if (change.changeType === 'removed') {
        const impact = -(change.original.totalPrice || 0);
        change.costImpact = impact;
        removedTotal += impact;
      } else if (change.changeType === 'modified') {
        const originalTotal = change.original.totalPrice || 0;
        const updatedTotal = change.updated.totalPrice || 0;
        const impact = updatedTotal - originalTotal;
        change.costImpact = impact;
        modifiedImpact += impact;
      }
    });

    this.addedItemsTotal = addedTotal;
    this.removedItemsTotal = removedTotal;
    this.modifiedItemsImpact = modifiedImpact;
    this.totalCostChange = addedTotal + removedTotal + modifiedImpact;
    this.newContractAmount = this.originalContractAmount + this.totalCostChange;
  }
  next();
});

// Instance methods
contractAmendmentSchema.methods.approve = function(approvedBy) {
  this.status = 'Approved';
  this.approvalStatus = {
    approvedBy,
    approvedAt: new Date()
  };
  return this.save();
};

contractAmendmentSchema.methods.reject = function(rejectedBy, reason) {
  this.status = 'Rejected';
  this.approvalStatus = {
    rejectedBy,
    rejectedAt: new Date(),
    rejectionReason: reason
  };
  return this.save();
};

// Static methods
contractAmendmentSchema.statics.getAmendmentsByContract = function(contractId) {
  return this.find({ contractId })
    .sort({ createdAt: -1 })
    .populate('customer', 'firstName lastName email');
};

contractAmendmentSchema.statics.getContractTotalWithAmendments = async function(contractId) {
  const Contract = mongoose.model('Contract');
  const contract = await Contract.findById(contractId);
  
  if (!contract) {
    throw new Error('Contract not found');
  }

  const amendments = await this.find({
    contractId,
    status: 'Approved'
  });

  const totalAmendmentImpact = amendments.reduce((sum, amendment) => {
    return sum + amendment.totalCostChange;
  }, 0);

  return {
    originalAmount: contract.totalAmount,
    amendmentsTotal: totalAmendmentImpact,
    currentTotal: contract.totalAmount + totalAmendmentImpact,
    amendmentCount: amendments.length
  };
};

module.exports = mongoose.model('ContractAmendment', contractAmendmentSchema);

