const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const ContractAmendment = require('../models/ContractAmendment');
const Contract = require('../models/Contract');
const Customer = require('../models/Customer');
const AmendmentPdfService = require('../services/amendmentPdfService');
const fs = require('fs');
const { buildDocxBuffer } = require('../services/documentOutputs/docxBuilder');
const { sendDocxBuffer, sanitizeFilename } = require('../services/documentOutputs/sendDocxResponse');
const { renderAmendmentDocx } = require('../services/documentOutputs/renderers/amendmentRenderer');
const { GoogleDocsPublisher } = require('../services/documentOutputs/googleDocsPublisher');
const { tryOpsService } = require('../middleware/opsServiceAuth');

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
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Helper function to generate amendment number
async function generateAmendmentNumber(contractNumber) {
  const existingAmendments = await ContractAmendment.find({
    contractNumber: contractNumber
  }).sort({ createdAt: -1 });

  const amendmentCount = existingAmendments.length;
  const amendmentSeq = String(amendmentCount + 1).padStart(3, '0');
  
  return `${contractNumber}-AMD-${amendmentSeq}`;
}

// GET /api/amendments - Get all amendments (admin only)
router.get('/', authenticateUser, async (req, res) => {
  try {
    const amendments = await ContractAmendment.find()
      .populate('customer', 'firstName lastName email')
      .populate('contractId', 'contractNumber title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: amendments
    });
  } catch (error) {
    console.error('Error fetching amendments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/amendments/contract/:contractId - Get amendments for a specific contract
router.get('/contract/:contractId', authenticateUser, async (req, res) => {
  try {
    const { contractId } = req.params;

    const amendments = await ContractAmendment.find({ contractId })
      .populate('customer', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: amendments
    });
  } catch (error) {
    console.error('Error fetching contract amendments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/amendments/contract/:contractId/summary - Get contract total with amendments
router.get('/contract/:contractId/summary', authenticateUser, async (req, res) => {
  try {
    const { contractId } = req.params;

    const summary = await ContractAmendment.getContractTotalWithAmendments(contractId);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching contract summary:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/amendments/:id - Get single amendment by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const amendment = await ContractAmendment.findById(id)
      .populate('customer', 'firstName lastName email phone address')
      .populate('contractId', 'contractNumber title totalAmount');

    if (!amendment) {
      return res.status(404).json({
        success: false,
        error: 'Amendment not found'
      });
    }

    res.json({
      success: true,
      data: amendment
    });
  } catch (error) {
    console.error('Error fetching amendment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/amendments - Create new amendment
router.post('/', authenticateUser, [
  body('contractId').notEmpty().withMessage('Contract ID is required'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be 1-200 characters'),
  body('description').trim().isLength({ min: 1, max: 2000 }).withMessage('Description is required and must be 1-2000 characters'),
  body('reason').trim().isLength({ min: 1, max: 1000 }).withMessage('Reason is required and must be 1-1000 characters'),
  body('effectiveDate').isISO8601().withMessage('Effective date is required and must be a valid date'),
  body('lineItemChanges').isArray({ min: 1 }).withMessage('At least one line item change is required')
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

    console.log('📝 Creating new amendment...');
    console.log('Request body:', req.body);

    // Check if contract exists
    const contract = await Contract.findById(req.body.contractId)
      .populate('customer', 'firstName lastName email phone address');
      
    if (!contract) {
      return res.status(400).json({
        success: false,
        error: 'Contract not found'
      });
    }

    // Generate amendment number
    const amendmentNumber = await generateAmendmentNumber(contract.contractNumber);

    // Create the amendment
    const amendmentData = {
      ...req.body,
      amendmentNumber,
      contractNumber: contract.contractNumber,
      customerId: contract.customerId,
      customer: contract.customer._id,
      clientName: contract.clientName || `${contract.customer.firstName} ${contract.customer.lastName}`,
      clientAddress: contract.clientAddress || contract.customer.address?.full || contract.customer.address || '',
      propertyAddress: contract.propertyAddress || '',
      originalContractAmount: contract.totalAmount,
      effectiveDate: new Date(req.body.effectiveDate)
    };

    const amendment = new ContractAmendment(amendmentData);
    const savedAmendment = await amendment.save();

    // Populate customer info
    await savedAmendment.populate('customer', 'firstName lastName email phone address');
    await savedAmendment.populate('contractId', 'contractNumber title totalAmount');

    console.log('✅ Amendment created successfully:', savedAmendment.amendmentNumber);

    res.status(201).json({
      success: true,
      data: savedAmendment,
      message: 'Amendment created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating amendment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/amendments/:id - Update amendment
router.put('/:id', authenticateUser, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be 2000 characters or less'),
  body('reason').optional().trim().isLength({ max: 1000 }).withMessage('Reason must be 1000 characters or less'),
  body('effectiveDate').optional().isISO8601().withMessage('Effective date must be a valid date'),
  body('lineItemChanges').optional().isArray().withMessage('Line item changes must be an array'),
  body('status').optional().isIn(['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Cancelled']).withMessage('Invalid status')
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
    console.log('📝 Updating amendment:', id);

    const amendment = await ContractAmendment.findById(id);
    if (!amendment) {
      return res.status(404).json({
        success: false,
        error: 'Amendment not found'
      });
    }

    // Only allow updates if amendment is in Draft status
    if (amendment.status !== 'Draft' && req.body.status !== amendment.status) {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify amendment that is not in Draft status'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        amendment[key] = req.body[key];
      }
    });

    const updatedAmendment = await amendment.save();
    await updatedAmendment.populate('customer', 'firstName lastName email phone address');
    await updatedAmendment.populate('contractId', 'contractNumber title totalAmount');

    console.log('✅ Amendment updated successfully');

    res.json({
      success: true,
      data: updatedAmendment,
      message: 'Amendment updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating amendment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/amendments/:id - Delete amendment
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting amendment:', id);

    const amendment = await ContractAmendment.findById(id);
    if (!amendment) {
      return res.status(404).json({
        success: false,
        error: 'Amendment not found'
      });
    }

    // Only allow deletion if amendment is in Draft status
    if (amendment.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete amendment that is not in Draft status'
      });
    }

    await ContractAmendment.findByIdAndDelete(id);

    console.log('✅ Amendment deleted successfully');

    res.json({
      success: true,
      message: 'Amendment deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting amendment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/amendments/:id/approve - Approve amendment
router.post('/:id/approve', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    console.log('✅ Approving amendment:', id);

    const amendment = await ContractAmendment.findById(id)
      .populate('customer', 'firstName lastName email')
      .populate('contractId', 'contractNumber title');

    if (!amendment) {
      return res.status(404).json({
        success: false,
        error: 'Amendment not found'
      });
    }

    if (amendment.status === 'Approved') {
      return res.status(400).json({
        success: false,
        error: 'Amendment is already approved'
      });
    }

    await amendment.approve(approvedBy || req.user.email);

    console.log('✅ Amendment approved successfully');

    res.json({
      success: true,
      data: amendment,
      message: 'Amendment approved successfully'
    });

  } catch (error) {
    console.error('❌ Error approving amendment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/amendments/:id/reject - Reject amendment
router.post('/:id/reject', authenticateUser, [
  body('rejectionReason').trim().isLength({ min: 1 }).withMessage('Rejection reason is required')
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
    const { rejectionReason, rejectedBy } = req.body;

    console.log('❌ Rejecting amendment:', id);

    const amendment = await ContractAmendment.findById(id)
      .populate('customer', 'firstName lastName email')
      .populate('contractId', 'contractNumber title');

    if (!amendment) {
      return res.status(404).json({
        success: false,
        error: 'Amendment not found'
      });
    }

    if (amendment.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        error: 'Amendment is already rejected'
      });
    }

    await amendment.reject(rejectedBy || req.user.email, rejectionReason);

    console.log('✅ Amendment rejected successfully');

    res.json({
      success: true,
      data: amendment,
      message: 'Amendment rejected successfully'
    });

  } catch (error) {
    console.error('❌ Error rejecting amendment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/amendments/:id/pdf - Generate and download amendment PDF
router.get('/:id/pdf', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📄 Generating PDF for amendment:', id);

    const amendment = await ContractAmendment.findById(id)
      .populate('customer', 'firstName lastName email phone address')
      .populate('contractId');

    if (!amendment) {
      return res.status(404).json({
        success: false,
        error: 'Amendment not found'
      });
    }

    const contract = amendment.contractId;
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    // Generate PDF
    const pdfService = new AmendmentPdfService();
    const pdfResult = await pdfService.generateAmendmentPdf(amendment, contract, amendment.customer);

    console.log('✅ PDF generated successfully:', pdfResult.fileName);

    // Send the PDF file
    res.download(pdfResult.filePath, pdfResult.fileName, (err) => {
      if (err) {
        console.error('❌ Error sending PDF:', err);
        res.status(500).json({
          success: false,
          error: 'Failed to send PDF file'
        });
      }

      // Clean up the temporary file
      fs.unlink(pdfResult.filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('❌ Error deleting temporary PDF:', unlinkErr);
        }
      });
    });

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/amendments/:id/docx - Generate and download amendment DOCX
router.get('/:id/docx', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Generating DOCX for amendment:', id);

    const amendment = await ContractAmendment.findById(id)
      .populate('customer', 'firstName lastName email phone address')
      .populate('contractId');

    if (!amendment) {
      return res.status(404).json({ success: false, error: 'Amendment not found' });
    }

    const contract = amendment.contractId;
    if (!contract) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    const model = renderAmendmentDocx(amendment, contract, amendment.customer);
    const buffer = await buildDocxBuffer(model);
    const filenameBase = sanitizeFilename(`Amendment_${amendment.amendmentNumber || amendment._id}`);
    sendDocxBuffer(res, buffer, filenameBase);
  } catch (error) {
    console.error('❌ Error generating amendment DOCX:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/amendments/:id/google-doc - Create Google Doc and return link
router.post('/:id/google-doc', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📄 Creating Google Doc for amendment:', id);

    if (!googleDocsPublisher.isAvailable()) {
      return res.status(400).json({ success: false, error: 'Google Docs is not configured on the server' });
    }

    const amendment = await ContractAmendment.findById(id)
      .populate('customer', 'firstName lastName email phone address')
      .populate('contractId');

    if (!amendment) {
      return res.status(404).json({ success: false, error: 'Amendment not found' });
    }

    const contract = amendment.contractId;
    if (!contract) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    const model = renderAmendmentDocx(amendment, contract, amendment.customer);
    const buffer = await buildDocxBuffer(model);
    const title = `Amendment ${amendment.amendmentNumber || amendment._id}`;

    const docInfo = await googleDocsPublisher.publishDocxAsGoogleDoc({ buffer, title });

    const shareWith = Array.isArray(req.body?.shareWith) ? req.body.shareWith : [];
    if (docInfo.documentId && shareWith.length > 0) {
      for (const entry of shareWith) {
        if (!entry?.email) continue;
        await googleDocsPublisher.shareDocument(docInfo.documentId, entry.email, entry.role || 'reader');
      }
    }

    res.json({ success: true, documentId: docInfo.documentId, url: docInfo.url, title: docInfo.title });
  } catch (error) {
    console.error('❌ Error creating Google Doc for amendment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

