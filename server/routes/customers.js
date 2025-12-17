const express = require('express');
const { body, validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const Contract = require('../models/Contract');
const Estimate = require('../models/Estimate');
const router = express.Router();

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to check if user is authenticated
const authenticateUser = async (req, res, next) => {
  try {
    console.log('🔍 [AUTH] Checking authentication for:', req.method, req.path);
    console.log('🔍 [AUTH] Authorization header:', req.header('Authorization'));
    
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      console.log('❌ [AUTH] No Authorization header');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      console.log('❌ [AUTH] No token in Authorization header');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    console.log('🔍 [AUTH] Token found, length:', token.length);
    
    const decoded = require('jsonwebtoken').verify(token, JWT_SECRET);
    console.log('🔍 [AUTH] Token decoded successfully, userId:', decoded.userId);
    
    const User = require('../models/User');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.log('❌ [AUTH] User not found for userId:', decoded.userId);
      return res.status(401).json({ error: 'User not found' });
    }
    
    if (!user.isActive) {
      console.log('❌ [AUTH] User is inactive:', decoded.userId);
      return res.status(401).json({ error: 'User account is inactive' });
    }
    
    console.log('✅ [AUTH] Authentication successful for user:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ [AUTH] Authentication error:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /api/customers
router.get('/', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 [CUSTOMERS ROUTE] GET /api/customers hit');
    console.log('📖 Getting all customers...');
    const customers = await Customer.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      message: 'Customers retrieved successfully',
      customers: customers,
      count: customers.length
    });
  } catch (error) {
    console.error('❌ Error getting customers:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// POST /api/customers
router.post('/', authenticateUser, [
  body('firstName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('First name must be 1-100 characters'),
  body('lastName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Last name must be 1-100 characters'),
  body('businessName').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Business name must be 1-200 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim().isLength({ max: 20 }).withMessage('Phone must be 20 characters or less'),
  body('address').trim().isLength({ min: 1, max: 500 }).withMessage('Address is required and must be 1-500 characters'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be 1000 characters or less')
], async (req, res) => {
  try {
    console.log('🔍 [CUSTOMERS ROUTE] POST /api/customers hit');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Custom validation: must have either businessName OR (firstName AND lastName)
    const hasBusinessName = req.body.businessName && req.body.businessName.trim().length > 0;
    const hasPersonName = req.body.firstName && req.body.firstName.trim().length > 0 && 
                         req.body.lastName && req.body.lastName.trim().length > 0;
    
    if (!hasBusinessName && !hasPersonName) {
      return res.status(400).json({
        success: false,
        error: 'Either business name or both first name and last name are required'
      });
    }
    
    if (hasBusinessName && hasPersonName) {
      return res.status(400).json({
        success: false,
        error: 'Please provide either business name OR person name, not both'
      });
    }

    console.log('📝 Creating new customer...');
    console.log('Request body:', req.body);

    // Check if customer with email already exists
    const existingCustomer = await Customer.findOne({ email: req.body.email });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        error: 'Customer with this email already exists'
      });
    }

    // Create the customer
    const customerData = {
      ...req.body,
      address: { full: req.body.address || '' }
    };
    
    const customer = new Customer(customerData);
    const savedCustomer = await customer.save();
    
    console.log('✅ Customer created successfully:', savedCustomer.customerId);
    
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer: savedCustomer
    });
  } catch (error) {
    console.error('❌ Error creating customer:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/customers/:id
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📖 Getting customer:', id);
    
    const customer = await Customer.findById(id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Customer retrieved successfully',
      customer: customer
    });
  } catch (error) {
    console.error('❌ Error getting customer:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// PUT /api/customers/:id
router.put('/:id', authenticateUser, [
  body('firstName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('First name must be 1-100 characters'),
  body('lastName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Last name must be 1-100 characters'),
  body('businessName').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Business name must be 1-200 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim().isLength({ max: 20 }).withMessage('Phone must be 20 characters or less'),
  body('address').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Address must be 1-500 characters when provided'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be 1000 characters or less')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    console.log('📝 Updating customer:', id);
    console.log('Update data:', req.body);

    // Check if customer exists
    const existingCustomer = await Customer.findById(id);
    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Custom validation: must have either businessName OR (firstName AND lastName)
    // Only validate if name fields are being updated
    if (req.body.businessName !== undefined || req.body.firstName !== undefined || req.body.lastName !== undefined) {
      // Determine what the final state will be
      const finalBusinessName = req.body.businessName !== undefined ? req.body.businessName : existingCustomer.businessName;
      const finalFirstName = req.body.firstName !== undefined ? req.body.firstName : existingCustomer.firstName;
      const finalLastName = req.body.lastName !== undefined ? req.body.lastName : existingCustomer.lastName;

      const hasBusinessName = finalBusinessName && finalBusinessName.trim().length > 0;
      const hasPersonName = finalFirstName && finalFirstName.trim().length > 0 && 
                           finalLastName && finalLastName.trim().length > 0;
      
      if (!hasBusinessName && !hasPersonName) {
        return res.status(400).json({
          success: false,
          error: 'Either business name or both first name and last name are required'
        });
      }
      
      if (hasBusinessName && hasPersonName) {
        return res.status(400).json({
          success: false,
          error: 'Please provide either business name OR person name, not both'
        });
      }
    }

    // Check if email is being changed and if it conflicts with another customer
    if (req.body.email && req.body.email !== existingCustomer.email) {
      const emailConflict = await Customer.findOne({ 
        email: req.body.email,
        _id: { $ne: id }
      });
      if (emailConflict) {
        return res.status(400).json({
          success: false,
          error: 'Email is already in use by another customer'
        });
      }
    }

    // Calculate old and new customer names for syncing
    // Handle both business name and person name cases
    let oldCustomerName = '';
    if (existingCustomer.businessName && existingCustomer.businessName.trim()) {
      oldCustomerName = existingCustomer.businessName.trim();
    } else if (existingCustomer.firstName || existingCustomer.lastName) {
      oldCustomerName = `${existingCustomer.firstName || ''} ${existingCustomer.lastName || ''}`.trim();
    }
    
    // Determine what the new name will be after update
    const finalBusinessName = req.body.businessName !== undefined ? req.body.businessName : existingCustomer.businessName;
    const finalFirstName = req.body.firstName !== undefined ? req.body.firstName : existingCustomer.firstName;
    const finalLastName = req.body.lastName !== undefined ? req.body.lastName : existingCustomer.lastName;
    
    let newCustomerName = '';
    if (finalBusinessName && finalBusinessName.trim()) {
      newCustomerName = finalBusinessName.trim();
    } else if (finalFirstName || finalLastName) {
      newCustomerName = `${finalFirstName || ''} ${finalLastName || ''}`.trim();
    }
    
    // Check if name is actually changing
    const nameChanged = oldCustomerName !== newCustomerName && 
      (req.body.businessName !== undefined || req.body.firstName !== undefined || req.body.lastName !== undefined);

    // Update the customer
    const updateData = { ...req.body };
    if (req.body.address) {
      updateData.address = { full: req.body.address };
    }
    
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    console.log('✅ Customer updated successfully:', updatedCustomer.customerId);
    
    // Sync customer name to related contracts and estimates if name changed
    if (nameChanged && newCustomerName) {
      try {
        console.log(`🔄 Syncing customer name from "${oldCustomerName}" to "${newCustomerName}"`);
        console.log(`   Customer ID: ${id}, Customer ID string: ${updatedCustomer.customerId}`);
        
        // Update all contracts with this customer
        // Check multiple possible ways the customer might be referenced:
        // 1. customerId field matches the customer's customerId string
        // 2. customer ObjectId reference matches
        // 3. customerId field might be stored as ObjectId string (legacy data)
        const contractQuery = {
          $or: [
            { customerId: updatedCustomer.customerId },
            { customer: id },
            { customerId: id.toString() }
          ]
        };
        
        // First, find contracts to see what we're working with
        const contractsToUpdate = await Contract.find(contractQuery);
        console.log(`   Found ${contractsToUpdate.length} contract(s) to update`);
        
        if (contractsToUpdate.length > 0) {
          contractsToUpdate.forEach(contract => {
            console.log(`   - Contract ${contract.contractNumber}: current clientName="${contract.clientName}", customerId="${contract.customerId}"`);
          });
        }
        
        const contractsUpdated = await Contract.updateMany(
          contractQuery,
          { $set: { clientName: newCustomerName } }
        );
        
        if (contractsUpdated.modifiedCount > 0) {
          console.log(`✅ Updated ${contractsUpdated.modifiedCount} contract(s) with new customer name "${newCustomerName}"`);
        } else if (contractsToUpdate.length > 0) {
          console.log(`⚠️ Found ${contractsToUpdate.length} contract(s) but none were modified (may already have correct name)`);
        }
        
        // Update estimates - check if title contains old customer name and update it
        const estimates = await Estimate.find({ customer: id });
        console.log(`   Found ${estimates.length} estimate(s) to check`);
        let estimatesUpdated = 0;
        for (const estimate of estimates) {
          if (estimate.title && estimate.title.includes(oldCustomerName)) {
            const updatedTitle = estimate.title.replace(oldCustomerName, newCustomerName);
            await Estimate.findByIdAndUpdate(estimate._id, { title: updatedTitle });
            estimatesUpdated++;
            console.log(`   - Updated estimate ${estimate.estimateNumber}: "${estimate.title}" -> "${updatedTitle}"`);
          }
        }
        if (estimatesUpdated > 0) {
          console.log(`✅ Updated ${estimatesUpdated} estimate(s) with new customer name`);
        }
      } catch (syncError) {
        console.error('⚠️ Error syncing customer name to contracts/estimates:', syncError);
        // Don't fail the request if sync fails, just log it
      }
    }
    
    res.json({
      success: true,
      message: 'Customer updated successfully',
      customer: updatedCustomer
    });
  } catch (error) {
    console.error('❌ Error updating customer:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// DELETE /api/customers/:id
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting customer:', id);
    
    const customer = await Customer.findByIdAndDelete(id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    console.log('✅ Customer deleted successfully:', customer.customerId);
    
    res.json({
      success: true,
      message: 'Customer deleted successfully',
      customer: customer
    });
  } catch (error) {
    console.error('❌ Error deleting customer:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;
