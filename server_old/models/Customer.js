const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    unique: true,
    default: function() {
      return `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  },
  firstName: {
    type: String,
    required: function() {
      return !this.businessName;
    },
    trim: true,
    maxlength: 100
  },
  lastName: {
    type: String,
    required: function() {
      return !this.businessName;
    },
    trim: true,
    maxlength: 100
  },
  businessName: {
    type: String,
    required: function() {
      return !this.firstName && !this.lastName;
    },
    trim: true,
    maxlength: 200
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  address: {
    full: { 
      type: String, 
      required: true,
      trim: true 
    } // Store address as submitted
  },
  // AppSheet compatibility fields
  appSheetId: String,
  relatedLeads: String,
  notes: String,
  source: {
    type: String,
    enum: ['mongodb', 'appsheet', 'manual'],
    default: 'mongodb'
  }
}, {
  timestamps: true,
  collection: 'customers'
});

// Index for performance
customerSchema.index({ createdAt: -1 });

// Methods
customerSchema.methods.toAppSheetFormat = function() {
  console.log('🔍 toAppSheetFormat - Customer address:', this.address);
  console.log('🔍 toAppSheetFormat - Address type:', typeof this.address);
  
  let addressString = '';
  
  if (this.address) {
    if (typeof this.address === 'string') {
      // If address is a string, use it as-is
      addressString = this.address;
      console.log('🔍 toAppSheetFormat - Using string address:', addressString);
    } else if (typeof this.address === 'object') {
      // If address is an object, use the full field
      addressString = this.address.full || '';
      console.log('🔍 toAppSheetFormat - Using object address full field:', addressString);
    }
  }
  
  const result = {
    CustomerID: this.customerId,
    FirstName: this.firstName || '',
    LastName: this.lastName || '',
    BusinessName: this.businessName || '',
    Email: this.email,
    Phone: this.phone,
    Address: addressString,
    City: '', // No longer parsing individual fields
    State: '', // No longer parsing individual fields
    ZipCode: '', // No longer parsing individual fields
    CreatedDate: this.createdAt?.toISOString(),
    UpdatedDate: this.updatedAt?.toISOString(),
    RelatedLeads: this.relatedLeads || '',
    Notes: this.notes || ''
  };
  
  console.log('🔍 toAppSheetFormat - Final result:', result);
  console.log('🔍 toAppSheetFormat - Address field value:', result.Address);
  console.log('🔍 toAppSheetFormat - City field value:', result.City);
  console.log('🔍 toAppSheetFormat - State field value:', result.State);
  console.log('🔍 toAppSheetFormat - ZipCode field value:', result.ZipCode);
  return result;
};

customerSchema.statics.fromAppSheetFormat = function(appSheetData) {
  return {
    customerId: appSheetData.CustomerID,
    firstName: appSheetData.FirstName || '',
    lastName: appSheetData.LastName || '',
    businessName: appSheetData.BusinessName || '',
    email: appSheetData.Email,
    phone: appSheetData.Phone,
    address: {
      full: appSheetData.Address
    },
    appSheetId: appSheetData.CustomerID,
    relatedLeads: appSheetData.RelatedLeads,
    notes: appSheetData.Notes,
    source: 'appsheet'
  };
};

module.exports = mongoose.model('Customer', customerSchema);
