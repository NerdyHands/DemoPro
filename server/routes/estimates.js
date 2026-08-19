const express = require('express');
const { body, validationResult } = require('express-validator');
const Estimate = require('../models/Estimate');
const Customer = require('../models/Customer');
const Counter = require('../models/Counter');
const fs = require('fs');
const ContractPdfService = require('../services/contractPdfService');
const EstimatePdfService = require('../services/estimatePdfService');
const { buildDocxBuffer } = require('../services/documentOutputs/docxBuilder');
const { sendDocxBuffer, sanitizeFilename } = require('../services/documentOutputs/sendDocxResponse');
const { renderEstimateDocx } = require('../services/documentOutputs/renderers/estimateRenderer');
const { GoogleDocsPublisher } = require('../services/documentOutputs/googleDocsPublisher');
const { tryOpsService } = require('../middleware/opsServiceAuth');
const router = express.Router();

const googleDocsPublisher = new GoogleDocsPublisher();

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to check if user is authenticated
const authenticateUser = async (req, res, next) => {
  if (tryOpsService(req)) return next();
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = require('jsonwebtoken').verify(token, JWT_SECRET);
    const User = require('../models/User');
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Generate estimate number with improved numbering system using counter
const generateEstimateNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Generate a unique sequence number using counter
  const sequence = await Counter.generateNumber('estimates', '', '0000');
  
  // Format: EST-YYYYMMDD-XXXX (e.g., EST-20241201-0001)
  return `EST-${year}${month}${day}-${sequence}`;
};

// GET /api/estimates
router.get('/', authenticateUser, async (req, res) => {
  try {
    console.log('📖 Getting all estimates...');
    const estimates = await Estimate.find()
      .populate('customer', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    console.log(`📊 Found ${estimates.length} estimates`);
    
    res.json({
      success: true,
      message: 'Estimates retrieved successfully',
      estimates: estimates,
      count: estimates.length
    });
  } catch (error) {
    console.error('❌ Error getting estimates:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/estimates/mine - estimates for the authenticated user's customer profile
router.get('/mine', authenticateUser, async (req, res) => {
  try {
    const email = req.user.email;
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.json({ success: true, estimates: [], count: 0 });
    }

    const estimates = await Estimate.find({ customer: customer._id })
      .populate('customer', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, estimates, count: estimates.length });
  } catch (error) {
    console.error('❌ Error getting user estimates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/estimates
router.post('/', authenticateUser, [
  body('customer').isMongoId().withMessage('Valid customer ID is required'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be 1-200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be 2000 characters or less'),
  body('propertyAddress').optional().trim().isLength({ max: 500 }).withMessage('Property address must be 500 characters or less'),
  body('clientAddress').optional().trim().isLength({ max: 500 }).withMessage('Client address must be 500 characters or less'),
  body('lineItems').isArray().withMessage('Line items must be an array'),
  body('lineItems.*.description').trim().isLength({ min: 1, max: 2000 }).withMessage('Line item description is required and must be 1-2000 characters'),
  body('lineItems.*.quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('lineItems.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
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

    console.log('📝 Creating new estimate...');
    console.log('Request body:', req.body);

    // Check if customer exists
    const customer = await Customer.findById(req.body.customer);
    if (!customer) {
      return res.status(400).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Generate estimate number
    const estimateNumber = await generateEstimateNumber();

    // Check if estimate number already exists (shouldn't happen with counter, but safety check)
    const existingEstimate = await Estimate.findOne({ estimateNumber });
    if (existingEstimate) {
      return res.status(400).json({
        success: false,
        error: 'Estimate number already exists. Please try again.'
      });
    }

    // Create the estimate
    const estimateData = {
      ...req.body,
      estimateNumber
    };
    
    const estimate = new Estimate(estimateData);
    const savedEstimate = await estimate.save();
    
    // Populate customer info
    await savedEstimate.populate('customer', 'firstName lastName email');
    
    console.log('✅ Estimate created successfully:', savedEstimate.estimateId);
    
    res.status(201).json({
      success: true,
      message: 'Estimate created successfully',
      estimate: savedEstimate
    });
  } catch (error) {
    console.error('❌ Error creating estimate:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/estimates/:id
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📖 Getting estimate:', id);
    
    const estimate = await Estimate.findById(id)
      .populate('customer', 'firstName lastName email phone address');
    
    if (!estimate) {
      return res.status(404).json({
        success: false,
        error: 'Estimate not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Estimate retrieved successfully',
      estimate: estimate
    });
  } catch (error) {
    console.error('❌ Error getting estimate:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// PUT /api/estimates/:id
router.put('/:id', authenticateUser, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be 2000 characters or less'),
  body('propertyAddress').optional().trim().isLength({ max: 500 }).withMessage('Property address must be 500 characters or less'),
  body('clientAddress').optional().trim().isLength({ max: 500 }).withMessage('Client address must be 500 characters or less'),
  body('lineItems').optional().isArray().withMessage('Line items must be an array'),
  body('lineItems.*.description').optional().trim().isLength({ min: 1, max: 2000 }).withMessage('Line item description must be 1-2000 characters'),
  body('lineItems.*.quantity').optional().isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('lineItems.*.unitPrice').optional().isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('status').optional().isIn(['Draft', 'Sent', 'Approved', 'Rejected', 'Expired']).withMessage('Invalid status'),
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
    console.log('📝 Updating estimate:', id);
    console.log('Update data:', req.body);

    // Check if estimate exists
    const existingEstimate = await Estimate.findById(id);
    if (!existingEstimate) {
      return res.status(404).json({
        success: false,
        error: 'Estimate not found'
      });
    }

    const updateData = { ...req.body };

    const addressFieldsInUpdate = updateData.propertyAddress != null || updateData.clientAddress != null;
    if (addressFieldsInUpdate) {
      const initialProp = (existingEstimate.propertyAddress || '').trim();
      const initialClient = (existingEstimate.clientAddress || '').trim();
      const newProp = updateData.propertyAddress != null ? String(updateData.propertyAddress).trim() : initialProp;
      const newClient = updateData.clientAddress != null ? String(updateData.clientAddress).trim() : initialClient;
      const clientWasEdited = updateData.clientAddress != null && newClient !== initialClient;

      if (newProp && !clientWasEdited) {
        updateData.clientAddress = newProp;
      } else if (newClient && updateData.propertyAddress == null && !initialProp) {
        updateData.propertyAddress = newClient;
      }

      const initialCanonical = initialProp || initialClient;
      const newCanonical = (updateData.propertyAddress || newProp || updateData.clientAddress || newClient || '').trim();
      if (
        initialCanonical &&
        updateData.title &&
        String(updateData.title).trim() === initialCanonical &&
        newCanonical
      ) {
        updateData.title = newCanonical;
      }
    }

    // Update the estimate
    const updatedEstimate = await Estimate.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('customer', 'firstName lastName email');
    
    console.log('✅ Estimate updated successfully:', updatedEstimate.estimateId);
    
    res.json({
      success: true,
      message: 'Estimate updated successfully',
      estimate: updatedEstimate
    });
  } catch (error) {
    console.error('❌ Error updating estimate:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// DELETE /api/estimates/:id
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting estimate:', id);
    
    const estimate = await Estimate.findByIdAndDelete(id);
    
    if (!estimate) {
      return res.status(404).json({
        success: false,
        error: 'Estimate not found'
      });
    }
    
    console.log('✅ Estimate deleted successfully:', estimate.estimateId);
    
    res.json({
      success: true,
      message: 'Estimate deleted successfully',
      estimate: estimate
    });
  } catch (error) {
    console.error('❌ Error deleting estimate:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/estimates/:id/pdf - Generate and download estimate PDF
router.get('/:id/pdf', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📄 Generating Estimate PDF for:', id);

    const estimate = await Estimate.findById(id).populate('customer', 'firstName lastName email address');
    if (!estimate) {
      return res.status(404).json({ success: false, error: 'Estimate not found' });
    }

    // Use dedicated Estimate PDF service (decoupled from contract rendering)
    const pdfService = new EstimatePdfService();

    const pdfResult = await pdfService.generateEstimatePdf(estimate);

    res.download(pdfResult.filePath, pdfResult.fileName, (err) => {
      if (err) {
        console.error('❌ Error sending estimate PDF:', err);
        return res.status(500).json({ success: false, error: 'Failed to send PDF file' });
      }
      fs.unlink(pdfResult.filePath, () => {});
    });

  } catch (error) {
    console.error('❌ Error generating estimate PDF:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/estimates/:id/docx - Generate and download estimate DOCX
router.get('/:id/docx', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Generating Estimate DOCX for:', id);

    const estimate = await Estimate.findById(id).populate('customer', 'firstName lastName email address');
    if (!estimate) {
      return res.status(404).json({ success: false, error: 'Estimate not found' });
    }

    const model = renderEstimateDocx(estimate);
    const buffer = await buildDocxBuffer(model);
    const filenameBase = sanitizeFilename(`Estimate_${estimate.estimateNumber || estimate._id}`);
    sendDocxBuffer(res, buffer, filenameBase);
  } catch (error) {
    console.error('❌ Error generating estimate DOCX:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/estimates/:id/google-doc - Create Google Doc and return link
router.post('/:id/google-doc', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📄 Creating Google Doc for estimate:', id);

    if (!googleDocsPublisher.isAvailable()) {
      return res.status(400).json({ success: false, error: 'Google Docs is not configured on the server' });
    }

    const estimate = await Estimate.findById(id).populate('customer', 'firstName lastName email address');
    if (!estimate) {
      return res.status(404).json({ success: false, error: 'Estimate not found' });
    }

    const model = renderEstimateDocx(estimate);
    const buffer = await buildDocxBuffer(model);
    const title = `Estimate ${estimate.estimateNumber || estimate._id}`;

    const docInfo = await googleDocsPublisher.publishDocxAsGoogleDoc({ buffer, title });

    // Optional sharing: { shareWith: [{ email, role }] }
    const shareWith = Array.isArray(req.body?.shareWith) ? req.body.shareWith : [];
    if (docInfo.documentId && shareWith.length > 0) {
      for (const entry of shareWith) {
        if (!entry?.email) continue;
        await googleDocsPublisher.shareDocument(docInfo.documentId, entry.email, entry.role || 'reader');
      }
    }

    res.json({ success: true, documentId: docInfo.documentId, url: docInfo.url, title: docInfo.title });
  } catch (error) {
    console.error('❌ Error creating Google Doc for estimate:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
