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
    default: 0
    // No min: allow negative for discount line items
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0
    // No min: allow negative for discount line items
  },
  notes: {
    type: [String],
    default: []
  }
}, { _id: false });

const paymentScheduleItemSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  dueDate: {
    type: Date
  },
  type: {
    type: String,
    enum: ['Payment', 'Project Phase', 'Delivery', 'Approval', 'Inspection', 'Other'],
    default: 'Payment'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Overdue', 'Cancelled', 'On Hold'],
    default: 'Pending'
  }
}, { _id: false });

const contractSchema = new mongoose.Schema({
  contractId: {
    type: String,
    unique: true,
    default: function() {
      return `con_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  },
  contractNumber: {
    type: String,
    required: true,
    unique: true
  },
  estimateId: {
    type: String,
    required: false,
    index: true
  },
  customerId: {
    type: String,
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
    enum: ['Draft', 'Sent', 'Signed', 'Active', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0
    // No min: can be negative when discount line items reduce total
  },
  // Line items from estimate
  lineItems: [lineItemSchema],
  // Payment schedule milestones
  paymentSchedule: [paymentScheduleItemSchema],
  subtotal: {
    type: Number,
    required: true,
    default: 0
    // No min: can be negative when discount line items reduce total
  },
  // Contract specific fields
  clientName: {
    type: String,
    required: false,
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

  depositAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  // Draw schedule type: 'regular' (upfront deposit + final payment) or 'demolition' (multi-milestone)
  drawScheduleType: {
    type: String,
    enum: ['regular', 'demolition'],
    default: 'regular'
  },
  // Contract terms and conditions
  terms: {
    type: String,
    trim: true
  },
  // AppSheet compatibility fields
  appSheetId: String,
  leadId: String,
  relatedEstimate: String,
  source: {
    type: String,
    enum: ['mongodb', 'appsheet', 'manual'],
    default: 'mongodb'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // BoldSign integration fields
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
  signerUrls: [String]
}, {
  timestamps: true,
  collection: 'contracts'
});

// Indexes for performance
contractSchema.index({ status: 1 });
contractSchema.index({ createdAt: -1 });
contractSchema.index({ startDate: 1 });

// Pre-save middleware to calculate totals and deposit
contractSchema.pre('save', function(next) {
  // Calculate line item totals and subtotal
  if (this.lineItems && this.lineItems.length > 0) {
    this.lineItems.forEach(item => {
      item.totalPrice = item.quantity * item.unitPrice;
    });
    
    this.subtotal = this.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
    this.totalAmount = this.subtotal; // No tax calculation
  }
  
  // Calculate deposit if not provided (only if undefined/null, not if explicitly set to 0)
  if ((this.depositAmount === undefined || this.depositAmount === null) && this.totalAmount) {
    this.depositAmount = this.totalAmount * 0.3; // 30% deposit
  }
  next();
});

// Methods
contractSchema.methods.toAppSheetFormat = function() {
  return {
    ContractID: this.contractId,
    ContractNumber: this.contractNumber,
    EstimateID: this.estimateId,
    CustomerID: this.customerId,
    LeadID: this.leadId || '',
    Title: this.title,
    Description: this.description || '',
    Status: this.status,
    StartDate: this.startDate?.toISOString(),
    EndDate: this.endDate?.toISOString(),
    TotalAmount: this.totalAmount,
    ClientName: this.clientName,
    ClientAddress: this.clientAddress,
    DepositAmount: this.depositAmount,
    CreatedDate: this.createdAt?.toISOString(),
    UpdatedDate: this.updatedAt?.toISOString(),
    RelatedEstimate: this.relatedEstimate || '',
    Notes: this.notes || ''
  };
};

contractSchema.statics.fromAppSheetFormat = function(appSheetData) {
  return {
    contractId: appSheetData.ContractID,
    contractNumber: appSheetData.ContractNumber,
    estimateId: appSheetData.EstimateID,
    customerId: appSheetData.CustomerID,
    leadId: appSheetData.LeadID,
    title: appSheetData.Title,
    description: appSheetData.Description,
    status: appSheetData.Status,
    startDate: appSheetData.StartDate ? new Date(appSheetData.StartDate) : undefined,
    endDate: appSheetData.EndDate ? new Date(appSheetData.EndDate) : undefined,
    totalAmount: appSheetData.TotalAmount,
    clientName: appSheetData.ClientName,
    clientAddress: appSheetData.ClientAddress,
    depositAmount: appSheetData.DepositAmount,
    appSheetId: appSheetData.ContractID,
    relatedEstimate: appSheetData.RelatedEstimate,
    notes: appSheetData.Notes,
    source: 'appsheet'
  };
};

module.exports = mongoose.model('Contract', contractSchema);
