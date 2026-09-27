const express = require('express');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const Contract = require('../models/Contract');
const Estimate = require('../models/Estimate');
const Customer = require('../models/Customer');
const { generateContractNumber: buildContractNumber } = require('../utils/documentNumbers');
const ContractPdfService = require('../services/contractPdfService');
const BoldSignService = require('../services/boldSignService');
const { buildDocxBuffer } = require('../services/documentOutputs/docxBuilder');
const { sendDocxBuffer, sanitizeFilename } = require('../services/documentOutputs/sendDocxResponse');
const { renderContractDocx } = require('../services/documentOutputs/renderers/contractRenderer');
const { renderFinalInvoiceDocx } = require('../services/documentOutputs/renderers/finalInvoiceRenderer');
const { GoogleDocsPublisher } = require('../services/documentOutputs/googleDocsPublisher');
const { tryOpsService } = require('../middleware/opsServiceAuth');
const router = express.Router();

const googleDocsPublisher = new GoogleDocsPublisher();

function buildGoogleDocShareList(req) {
  const shareWith = Array.isArray(req.body?.shareWith) ? [...req.body.shareWith] : [];
  if (req.user?.email && !shareWith.some((e) => e?.email === req.user.email)) {
    shareWith.push({ email: req.user.email, role: 'writer' });
  }
  return shareWith;
}

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

// GET /api/contracts
router.get('/', authenticateUser, async (req, res) => {
  try {
    console.log('📖 Getting all contracts...');
    const contracts = await Contract.find()
      .populate('customer', 'firstName lastName email businessName')
      .sort({ createdAt: -1 });
    
    // Only fill clientName from customer when contract has no name set (preserve user edits)
    const syncPromises = contracts.map(async (contract) => {
      if (contract.customer) {
        const customer = contract.customer;
        const currentCustomerName = customer.businessName || 
          `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
        const hasContractName = contract.clientName != null && String(contract.clientName).trim() !== '';
        if (currentCustomerName && !hasContractName) {
          contract.clientName = currentCustomerName;
          return contract.save();
        }
      }
      return Promise.resolve();
    });
    
    await Promise.all(syncPromises);
    
    res.json({
      success: true,
      message: 'Contracts retrieved successfully',
      contracts: contracts,
      count: contracts.length
    });
  } catch (error) {
    console.error('❌ Error getting contracts:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/contracts/mine - contracts for the authenticated user's customer profile
router.get('/mine', authenticateUser, async (req, res) => {
  try {
    const email = req.user.email;
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.json({ success: true, contracts: [], count: 0 });
    }

    const contracts = await Contract.find({ customer: customer._id })
      .populate('customer', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, contracts, count: contracts.length });
  } catch (error) {
    console.error('❌ Error getting user contracts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/contracts
router.post('/', authenticateUser, [
  body('estimateId').optional(),
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be 1-200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be 2000 characters or less'),
  body('propertyAddress').optional().trim().isLength({ max: 500 }).withMessage('Property address must be 500 characters or less'),
  body('startDate').isISO8601().withMessage('Start date is required and must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('totalAmount').optional().isFloat().withMessage('Total amount must be a valid number'),
  body('depositAmount').optional().isFloat({ min: 0 }).withMessage('Deposit amount must be a positive number'),
  body('lineItems').optional().isArray().withMessage('Line items must be an array'),
  body('terms').optional().isString(),
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

    console.log('📝 Creating new contract...');
    console.log('Request body:', req.body);

    // If estimateId provided, check if estimate exists
    let estimate = null;
    if (req.body.estimateId) {
      estimate = await Estimate.findById(req.body.estimateId);
      if (!estimate) {
        return res.status(400).json({
          success: false,
          error: 'Estimate not found'
        });
      }
    }

    // Check if customer exists
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) {
      return res.status(400).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Generate contract number from estimate number or address + customer name
    const contractNumber = await buildContractNumber(Contract, {
      propertyAddress: req.body.propertyAddress || estimate?.propertyAddress,
      clientAddress: req.body.clientAddress || estimate?.clientAddress,
      customer,
      title: req.body.title || estimate?.title,
      estimateNumber: estimate?.estimateNumber,
    });

    // Create the contract, using line items from estimate when available
    const contractData = {
      ...req.body,
      contractNumber,
      customer: req.body.customerId,
      startDate: new Date(req.body.startDate),
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      lineItems: estimate?.lineItems?.length ? estimate.lineItems : (req.body.lineItems || []),
      clientName: `${customer.firstName} ${customer.lastName}`,
      clientAddress: customer.address?.full || customer.address || 'Address not provided',
      depositAmount: req.body.depositAmount !== undefined ? parseFloat(req.body.depositAmount) : undefined,
      drawScheduleType: req.body.drawScheduleType || 'regular'
    };
    
    if (estimate) {
      console.log('📋 Estimate line items being transferred:', estimate.lineItems);
    }
    console.log('📋 Contract data line items:', contractData.lineItems);
    
    const contract = new Contract(contractData);
    const savedContract = await contract.save();
    
    // Populate customer info
    await savedContract.populate('customer', 'firstName lastName email');
    
    console.log('✅ Contract created successfully:', savedContract.contractId);
    console.log('📋 Saved contract line items:', savedContract.lineItems);
    console.log('📋 Saved contract line items length:', savedContract.lineItems ? savedContract.lineItems.length : 'undefined');
    
    res.status(201).json({
      success: true,
      message: 'Contract created successfully',
      contract: savedContract
    });
  } catch (error) {
    console.error('❌ Error creating contract:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/contracts/:id
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📖 Getting contract:', id);
    
    const contract = await Contract.findById(id)
      .populate('customer', 'firstName lastName email phone address businessName');
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }
    
    // Only sync clientName from customer when contract has no client name set (preserve user edits)
    if (contract.customer) {
      const customer = contract.customer;
      const currentCustomerName = customer.businessName || 
        `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
      const hasContractName = contract.clientName != null && String(contract.clientName).trim() !== '';
      if (currentCustomerName && !hasContractName) {
        contract.clientName = currentCustomerName;
        await contract.save();
      }
    }
    
    console.log('📋 Contract line items:', contract.lineItems);
    console.log('📋 Contract line items length:', contract.lineItems ? contract.lineItems.length : 'undefined');
    
    res.json({
      success: true,
      message: 'Contract retrieved successfully',
      contract: contract
    });
  } catch (error) {
    console.error('❌ Error getting contract:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// PUT /api/contracts/:id
router.put('/:id', authenticateUser, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be 2000 characters or less'),
  body('propertyAddress').optional().trim().isLength({ max: 500 }).withMessage('Property address must be 500 characters or less'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('status').optional().isIn(['Draft', 'Sent', 'Signed', 'Active', 'Completed', 'Cancelled']).withMessage('Invalid status'),
  body('totalAmount').optional().isFloat().withMessage('Total amount must be a valid number'),
  body('clientName').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Client name must be 1-200 characters'),
  body('clientAddress').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Client address must be 1-500 characters'),
  body('depositAmount').optional().isFloat({ min: 0 }).withMessage('Deposit amount must be a positive number'),
  body('terms').optional().isString(),
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
    console.log('📝 Updating contract:', id);
    console.log('Update data:', req.body);

    // Check if contract exists
    const existingContract = await Contract.findById(id);
    if (!existingContract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    // Prepare update data
    const updateData = { ...req.body };
    if (req.body.startDate) {
      updateData.startDate = new Date(req.body.startDate);
    }
    if (req.body.endDate) {
      updateData.endDate = new Date(req.body.endDate);
    }
    // Ensure depositAmount is properly parsed as a number
    if (req.body.depositAmount !== undefined) {
      updateData.depositAmount = parseFloat(req.body.depositAmount);
    }

    // Update the contract
    const updatedContract = await Contract.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('customer', 'firstName lastName email');
    
    console.log('✅ Contract updated successfully:', updatedContract.contractId);
    
    res.json({
      success: true,
      message: 'Contract updated successfully',
      contract: updatedContract
    });
  } catch (error) {
    console.error('❌ Error updating contract:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// DELETE /api/contracts/:id
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting contract:', id);
    
    const contract = await Contract.findByIdAndDelete(id);
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }
    
    console.log('✅ Contract deleted successfully:', contract.contractId);
    
    res.json({
      success: true,
      message: 'Contract deleted successfully',
      contract: contract
    });
  } catch (error) {
    console.error('❌ Error deleting contract:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/contracts/:id/pdf
router.get('/:id/pdf', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📄 Generating PDF for contract:', id);
    
    const contract = await Contract.findById(id)
      .populate('customer', 'firstName lastName email phone address');
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    // Get the related estimate for line items
    let estimate = null;
    if (contract.estimateId) {
      estimate = await Estimate.findById(contract.estimateId);
      if (estimate) {
        console.log('📋 Found estimate with', estimate.lineItems?.length || 0, 'line items');
      } else {
        console.log('⚠️ Estimate not found for estimateId:', contract.estimateId);
      }
    } else {
      console.log('⚠️ Contract has no estimateId');
    }
    
    // Get milestones for payment tracking
    const Milestone = require('../models/Milestone');
    const milestones = await Milestone.find({ contractId: contract._id, type: 'Payment' });
    
    // Generate PDF
    const pdfService = new ContractPdfService();
    const pdfResult = await pdfService.generateContractPdf(contract, contract.customer, estimate, milestones);
    
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

// GET /api/contracts/:id/docx
router.get('/:id/docx', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Generating DOCX for contract:', id);

    const contract = await Contract.findById(id)
      .populate('customer', 'firstName lastName email phone address');

    if (!contract) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    // Get the related estimate for line items (optional)
    let estimate = null;
    if (contract.estimateId) {
      estimate = await Estimate.findById(contract.estimateId);
    }

    // Get milestones for payment tracking (optional)
    const Milestone = require('../models/Milestone');
    const milestones = await Milestone.find({ contractId: contract._id, type: 'Payment' });

    const model = renderContractDocx(contract, contract.customer, estimate, milestones);
    const buffer = await buildDocxBuffer(model);
    const filenameBase = sanitizeFilename(`Contract_${contract.contractNumber || contract._id}`);
    sendDocxBuffer(res, buffer, filenameBase);
  } catch (error) {
    console.error('❌ Error generating contract DOCX:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/contracts/:id/google-doc - Create Google Doc and return link
router.post('/:id/google-doc', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📄 Creating Google Doc for contract:', id);

    if (!googleDocsPublisher.isAvailable()) {
      return res.status(400).json({ success: false, error: 'Google Docs is not configured on the server' });
    }

    const contract = await Contract.findById(id)
      .populate('customer', 'firstName lastName email phone address');

    if (!contract) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    let estimate = null;
    if (contract.estimateId) {
      estimate = await Estimate.findById(contract.estimateId);
    }

    const Milestone = require('../models/Milestone');
    const milestones = await Milestone.find({ contractId: contract._id, type: 'Payment' });

    const model = renderContractDocx(contract, contract.customer, estimate, milestones);
    const buffer = await buildDocxBuffer(model);
    const title = `Contract ${contract.contractNumber || contract._id}`;

    const docInfo = await googleDocsPublisher.publishDocxAsGoogleDoc({ buffer, title });

    const shareWith = buildGoogleDocShareList(req);
    if (docInfo.documentId && shareWith.length > 0) {
      for (const entry of shareWith) {
        if (!entry?.email) continue;
        await googleDocsPublisher.shareDocument(docInfo.documentId, entry.email, entry.role || 'reader');
      }
    }

    res.json({ success: true, documentId: docInfo.documentId, url: docInfo.url, title: docInfo.title });
  } catch (error) {
    console.error('❌ Error creating Google Doc for contract:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/contracts/:id/final-invoice
router.get('/:id/final-invoice', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📄 Generating Final Invoice PDF for contract:', id);
    
    const ContractAmendment = require('../models/ContractAmendment');
    
    const contract = await Contract.findById(id)
      .populate('customer', 'firstName lastName email phone address');
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    // Get all approved amendments for this contract
    const amendments = await ContractAmendment.find({
      contractId: id,
      status: 'Approved'
    }).sort({ createdAt: 1 });
    
    // Generate Final Invoice PDF
    const FinalInvoicePdfService = require('../services/finalInvoicePdfService');
    const pdfService = new FinalInvoicePdfService();
    const pdfResult = await pdfService.generateFinalInvoicePdf(contract, contract.customer, amendments);
    
    console.log('✅ Final Invoice PDF generated successfully:', pdfResult.fileName);
    
    // Send the PDF file
    res.download(pdfResult.filePath, pdfResult.fileName, (err) => {
      if (err) {
        console.error('❌ Error sending Final Invoice PDF:', err);
        res.status(500).json({
          success: false,
          error: 'Failed to send Final Invoice PDF file'
        });
      }
      
      // Clean up the temporary file
      fs.unlink(pdfResult.filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('❌ Error deleting temporary Final Invoice PDF:', unlinkErr);
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Error generating Final Invoice PDF:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/contracts/:id/final-invoice/docx
router.get('/:id/final-invoice/docx', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Generating Final Invoice DOCX for contract:', id);

    const ContractAmendment = require('../models/ContractAmendment');

    const contract = await Contract.findById(id)
      .populate('customer', 'firstName lastName email phone address');

    if (!contract) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    const amendments = await ContractAmendment.find({
      contractId: id,
      status: 'Approved'
    }).sort({ createdAt: 1 });

    const model = renderFinalInvoiceDocx(contract, contract.customer, amendments);
    const buffer = await buildDocxBuffer(model);
    const filenameBase = sanitizeFilename(`Final_Invoice_${contract.contractNumber || contract._id}`);
    sendDocxBuffer(res, buffer, filenameBase);
  } catch (error) {
    console.error('❌ Error generating Final Invoice DOCX:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/contracts/:id/final-invoice/google-doc
router.post('/:id/final-invoice/google-doc', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📄 Creating Google Doc for final invoice:', id);

    if (!googleDocsPublisher.isAvailable()) {
      return res.status(400).json({ success: false, error: 'Google Docs is not configured on the server' });
    }

    const ContractAmendment = require('../models/ContractAmendment');

    const contract = await Contract.findById(id)
      .populate('customer', 'firstName lastName email phone address');

    if (!contract) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    const amendments = await ContractAmendment.find({
      contractId: id,
      status: 'Approved'
    }).sort({ createdAt: 1 });

    const model = renderFinalInvoiceDocx(contract, contract.customer, amendments);
    const buffer = await buildDocxBuffer(model);
    const title = `Final Invoice ${contract.contractNumber || contract._id}`;

    const docInfo = await googleDocsPublisher.publishDocxAsGoogleDoc({ buffer, title });

    const shareWith = buildGoogleDocShareList(req);
    if (docInfo.documentId && shareWith.length > 0) {
      for (const entry of shareWith) {
        if (!entry?.email) continue;
        await googleDocsPublisher.shareDocument(docInfo.documentId, entry.email, entry.role || 'reader');
      }
    }

    res.json({ success: true, documentId: docInfo.documentId, url: docInfo.url, title: docInfo.title });
  } catch (error) {
    console.error('❌ Error creating Google Doc for final invoice:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/contracts/:id/send-for-signature
router.post('/:id/send-for-signature', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Sending contract for signature:', id);

    const contract = await Contract.findById(id)
      .populate('customer', 'firstName lastName email phone address');

    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    // Check if BoldSign is available
    const boldSignService = new BoldSignService();
    if (!boldSignService.isServiceAvailable()) {
      return res.status(400).json({
        success: false,
        error: 'BoldSign API not configured'
      });
    }

    // Contractor information (you can make this configurable)
    const contractorInfo = {
      name: req.body.contractorName || 'Contractor',
      email: req.body.contractorEmail || 'contractor@example.com'
    };

    // Create signature request
    const signatureResult = await boldSignService.createSignatureRequest(
      contract,
      contract.customer,
      contractorInfo
    );

    // Update contract with BoldSign information
    const updatedContract = await Contract.findByIdAndUpdate(
      id,
      {
        boldSignDocumentId: signatureResult.documentId,
        boldSignMessageId: signatureResult.messageId,
        signatureStatus: 'Sent',
        signatureSentAt: new Date(),
        signerUrls: signatureResult.signerUrls
      },
      { new: true }
    ).populate('customer', 'firstName lastName email');

    console.log('✅ Signature request sent successfully:', signatureResult.documentId);

    res.json({
      success: true,
      message: 'Contract sent for signature successfully',
      contract: updatedContract,
      signatureInfo: signatureResult
    });

  } catch (error) {
    console.error('❌ Error sending contract for signature:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/contracts/:id/create-boldsign-draft
router.post('/:id/create-boldsign-draft', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Creating BoldSign draft for contract:', id);

    const contract = await Contract.findById(id)
      .populate('customer', 'firstName lastName email phone address');

    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    // Check if BoldSign is available
    const boldSignService = new BoldSignService();
    if (!boldSignService.isServiceAvailable()) {
      return res.status(400).json({
        success: false,
        error: 'BoldSign API not configured'
      });
    }

    // Contractor information (you can make this configurable)
    const contractorInfo = {
      name: req.body.contractorName || 'Contractor',
      email: req.body.contractorEmail || 'contractor@example.com'
    };

    // Create draft
    const draftResult = await boldSignService.createDraft(
      contract,
      contract.customer,
      contractorInfo
    );

    console.log('✅ BoldSign draft created successfully:', draftResult.documentId);

    res.json({
      success: true,
      message: 'Draft created successfully',
      embedUrl: draftResult.embedUrl,
      documentId: draftResult.documentId
    });

  } catch (error) {
    console.error('❌ Error creating BoldSign draft:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/contracts/:id/signature-status
router.get('/:id/signature-status', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📊 Getting signature status for contract:', id);

    const contract = await Contract.findById(id);
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    if (!contract.boldSignDocumentId) {
      return res.status(400).json({
        success: false,
        error: 'No signature request found for this contract'
      });
    }

    // Get status from BoldSign
    const boldSignService = new BoldSignService();
    const status = await boldSignService.getSignatureStatus(contract.boldSignDocumentId);

    // Update contract status if it has changed
    if (status.status !== contract.signatureStatus) {
      await Contract.findByIdAndUpdate(id, {
        signatureStatus: status.status,
        signatureCompletedAt: status.isCompleted ? new Date() : undefined
      });
    }

    res.json({
      success: true,
      signatureStatus: status,
      contractStatus: contract.signatureStatus
    });

  } catch (error) {
    console.error('❌ Error getting signature status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/contracts/:id/signed-document
router.get('/:id/signed-document', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📄 Downloading signed document for contract:', id);

    const contract = await Contract.findById(id);
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    if (!contract.boldSignDocumentId) {
      return res.status(400).json({
        success: false,
        error: 'No signature request found for this contract'
      });
    }

    // Get signed document from BoldSign
    const boldSignService = new BoldSignService();
    const documentResult = await boldSignService.getSignedDocument(contract.boldSignDocumentId);

    // Update contract with signed document path
    await Contract.findByIdAndUpdate(id, {
      signedDocumentPath: documentResult.filePath
    });

    // Send the signed document
    res.download(documentResult.filePath, documentResult.fileName, (err) => {
      if (err) {
        console.error('❌ Error sending signed document:', err);
        res.status(500).json({
          success: false,
          error: 'Failed to send signed document'
        });
      }
    });

  } catch (error) {
    console.error('❌ Error downloading signed document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/contracts/:id/resend-signature
router.post('/:id/resend-signature', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { signerEmail } = req.body;
    console.log('📧 Resending signature request for contract:', id);

    const contract = await Contract.findById(id);
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    if (!contract.boldSignDocumentId) {
      return res.status(400).json({
        success: false,
        error: 'No signature request found for this contract'
      });
    }

    // Resend signature request
    const boldSignService = new BoldSignService();
    const result = await boldSignService.resendSignatureRequest(
      contract.boldSignDocumentId,
      signerEmail
    );

    console.log('✅ Signature request resent successfully');

    res.json({
      success: true,
      message: 'Signature request resent successfully',
      result
    });

  } catch (error) {
    console.error('❌ Error resending signature request:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/contracts/:id/cancel-signature
router.post('/:id/cancel-signature', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('❌ Cancelling signature request for contract:', id);

    const contract = await Contract.findById(id);
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    if (!contract.boldSignDocumentId) {
      return res.status(400).json({
        success: false,
        error: 'No signature request found for this contract'
      });
    }

    // Cancel signature request
    const boldSignService = new BoldSignService();
    const result = await boldSignService.cancelSignatureRequest(contract.boldSignDocumentId);

    // Update contract status
    await Contract.findByIdAndUpdate(id, {
      signatureStatus: 'Cancelled'
    });

    console.log('✅ Signature request cancelled successfully');

    res.json({
      success: true,
      message: 'Signature request cancelled successfully',
      result
    });

  } catch (error) {
    console.error('❌ Error cancelling signature request:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
