const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  notes: {
    type: [String],
    default: []
  }
}, { _id: false });

const estimateSchema = new mongoose.Schema({
  estimateId: {
    type: String,
    unique: true,
    default: function() {
      return `est_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  },
  estimateNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
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
  propertyAddress: {
    type: String,
    trim: true,
    maxlength: 500
  },
  clientAddress: {
    type: String,
    trim: true,
    maxlength: 500
  },
  lineItems: [lineItemSchema],
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
  taxRate: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.1 // 10%
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Approved', 'Rejected', 'Expired'],
    default: 'Draft'
  },
  validUntil: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
  },
  // AppSheet compatibility fields
  appSheetId: String,
  leadId: String,
  relatedContracts: String,
  source: {
    type: String,
    enum: ['mongodb', 'appsheet', 'manual'],
    default: 'mongodb'
  },
  notes: String
}, {
  timestamps: true,
  collection: 'estimates'
});

// Indexes for performance
estimateSchema.index({ status: 1 });
estimateSchema.index({ createdAt: -1 });
estimateSchema.index({ validUntil: 1 });

// Pre-save middleware to calculate totals
estimateSchema.pre('save', function(next) {
  if (this.lineItems && this.lineItems.length > 0) {
    // Calculate line item totals
    this.lineItems.forEach(item => {
      item.totalPrice = item.quantity * item.unitPrice;
    });
    
    // Calculate subtotal
    this.subtotal = this.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // No tax calculation - total equals subtotal
    this.tax = 0;
    this.totalAmount = this.subtotal;
  }
  next();
});

// Methods
estimateSchema.methods.toAppSheetFormat = function() {
  return {
    EstimateID: this.estimateId,
    EstimateNumber: this.estimateNumber,
    CustomerID: this.customer?.customerId || this.customer?._id?.toString() || '',
    LeadID: this.leadId || '',
    Title: this.title,
    Description: this.description || '',
    PropertyAddress: this.propertyAddress || '',
    ClientAddress: this.clientAddress || '',
    Status: this.status,
    TotalAmount: this.totalAmount,
    CreatedDate: this.createdAt?.toISOString(),
    UpdatedDate: this.updatedAt?.toISOString(),
    ValidUntil: this.validUntil?.toISOString(),
    RelatedContracts: this.relatedContracts || '',
    Notes: this.notes || ''
  };
};

estimateSchema.statics.fromAppSheetFormat = function(appSheetData) {
  return {
    estimateId: appSheetData.EstimateID,
    estimateNumber: appSheetData.EstimateNumber,
    customer: appSheetData.CustomerID, // This will need to be resolved to ObjectId
    leadId: appSheetData.LeadID,
    title: appSheetData.Title,
    description: appSheetData.Description,
    propertyAddress: appSheetData.PropertyAddress,
    clientAddress: appSheetData.ClientAddress,
    status: appSheetData.Status,
    totalAmount: appSheetData.TotalAmount,
    validUntil: appSheetData.ValidUntil ? new Date(appSheetData.ValidUntil) : undefined,
    appSheetId: appSheetData.EstimateID,
    relatedContracts: appSheetData.RelatedContracts,
    notes: appSheetData.Notes,
    source: 'appsheet'
  };
};

module.exports = mongoose.model('Estimate', estimateSchema);
