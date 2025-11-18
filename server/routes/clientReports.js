const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const ClientReport = require('../models/ClientReport');
const Job = require('../models/Job');
const JobProgress = require('../models/JobProgress');
const Contract = require('../models/Contract');
const Customer = require('../models/Customer');
const ClientReportPdfService = require('../services/clientReportPdfService');
const StorageManager = require('../services/storageManager');
const fs = require('fs');

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to check if user is authenticated
const authenticateUser = async (req, res, next) => {
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

// Multer configuration for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }
  }
});

// Initialize storage manager
const storageManager = new StorageManager();

// Helper function to generate report number
async function generateReportNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  const existingReports = await ClientReport.find({
    reportNumber: new RegExp(`^RPT-${year}${month}`)
  }).sort({ createdAt: -1 });

  const sequence = existingReports.length + 1;
  return `RPT-${year}${month}-${String(sequence).padStart(4, '0')}`;
}

// GET /api/client-reports - Get all reports
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { jobId, contractId, customerId, status } = req.query;
    const filter = {};

    if (jobId) filter.jobId = jobId;
    if (contractId) filter.contractId = contractId;
    if (customerId) filter.customerId = customerId;
    if (status) filter.status = status;

    const reports = await ClientReport.find(filter)
      .populate('customer', 'firstName lastName email phone')
      .populate('jobId', 'title jobId')
      .populate('contractId', 'contractNumber title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/client-reports/:id - Get single report
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const report = await ClientReport.findById(id)
      .populate('customer', 'firstName lastName email phone address')
      .populate('jobId', 'title jobId status')
      .populate('contractId', 'contractNumber title');

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    // Debug logging for images
    console.log('\n🔍 === DEBUG: GET Report Images ===');
    console.log('Report ID:', id);
    console.log('Report Number:', report.reportNumber);
    console.log('Line Items Count:', report.lineItems?.length || 0);
    
    if (report.lineItems && report.lineItems.length > 0) {
      report.lineItems.forEach((item, idx) => {
        console.log(`\n📋 Line Item ${idx + 1} (${item.lineItemNumber}):`);
        console.log('  - Description:', item.description?.substring(0, 50) + '...');
        console.log('  - Has images array:', !!item.images);
        console.log('  - Images array length:', item.images?.length || 0);
        console.log('  - Has legacy image:', !!item.image);
        console.log('  - Legacy image URL:', item.image?.gcsUrl || 'none');
        
        if (item.images && item.images.length > 0) {
          item.images.forEach((img, imgIdx) => {
            console.log(`    Image ${imgIdx + 1}:`, {
              filename: img.filename,
              gcsUrl: img.gcsUrl ? 'YES' : 'NO',
              order: img.order
            });
          });
        }
      });
    }
    console.log('🔍 === END DEBUG ===\n');

    // Mark as viewed if client is viewing
    if (req.user.role === 'customer' || req.user.role === 'client') {
      await report.markAsViewed();
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/client-reports - Create new report
router.post('/', authenticateUser, [
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('tasks').optional().isArray().withMessage('Tasks must be an array')
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

    console.log('📝 Creating new client report...');

    // Generate report number
    const reportNumber = await generateReportNumber();

    // Get customer info
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) {
      return res.status(400).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Create report
    const reportData = {
      ...req.body,
      reportNumber,
      customer: customer._id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      createdBy: req.user._id,
      technicianName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim()
    };

    const report = new ClientReport(reportData);
    const savedReport = await report.save();

    await savedReport.populate('customer', 'firstName lastName email phone');
    await savedReport.populate('jobId', 'title jobId');
    await savedReport.populate('contractId', 'contractNumber title');

    console.log('✅ Report created successfully:', savedReport.reportNumber);

    res.status(201).json({
      success: true,
      data: savedReport,
      message: 'Report created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/client-reports/from-job/:jobId - Create report from job
router.post('/from-job/:jobId', authenticateUser, async (req, res) => {
  try {
    const { jobId } = req.params;

    console.log('📝 Creating report from job:', jobId);

    // Get job and progress logs
    const job = await Job.findById(jobId).populate('customer').populate('contractId');
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    const progressLogs = await JobProgress.find({ jobId }).sort({ createdAt: 1 });

    // Generate report data from job
    const reportData = await ClientReport.createFromJobProgress(jobId, progressLogs);
    reportData.reportNumber = await generateReportNumber();
    reportData.createdBy = req.user._id;
    reportData.technicianName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();

    // Merge with any additional data from request body
    Object.assign(reportData, req.body);

    const report = new ClientReport(reportData);
    const savedReport = await report.save();

    await savedReport.populate('customer', 'firstName lastName email phone');
    await savedReport.populate('jobId', 'title jobId');

    console.log('✅ Report created from job:', savedReport.reportNumber);

    res.status(201).json({
      success: true,
      data: savedReport,
      message: 'Report created from job successfully'
    });

  } catch (error) {
    console.error('❌ Error creating report from job:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/client-reports/:id - Update report
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('📝 Updating report:', id);

    const report = await ClientReport.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    // Only allow updates to drafts or in-review reports
    if (report.status === 'Sent to Client' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify report that has been sent to client'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && key !== '_id' && key !== 'reportNumber') {
        report[key] = req.body[key];
      }
    });

    const updatedReport = await report.save();
    await updatedReport.populate('customer', 'firstName lastName email phone');
    await updatedReport.populate('jobId', 'title jobId');
    await updatedReport.populate('contractId', 'contractNumber title');

    console.log('✅ Report updated successfully');

    res.json({
      success: true,
      data: updatedReport,
      message: 'Report updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/client-reports/:id - Delete report
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Deleting report:', id);

    const report = await ClientReport.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    // Only allow deletion of drafts
    if (report.status !== 'Draft' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        error: 'Can only delete draft reports'
      });
    }

    await ClientReport.findByIdAndDelete(id);

    console.log('✅ Report deleted successfully');

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/client-reports/:id/finalize - Finalize/approve a report
router.post('/:id/finalize', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('✅ Finalizing report:', id);

    const report = await ClientReport.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    // Only allow finalizing drafts or in-review reports
    if (report.status !== 'Draft' && report.status !== 'In Review') {
      return res.status(400).json({
        success: false,
        error: 'Only draft or in-review reports can be finalized'
      });
    }

    // Update status to Approved
    report.status = 'Approved';
    report.approvedDate = new Date();
    report.approvedBy = req.user._id;
    await report.save();

    console.log('✅ Report finalized successfully');

    res.json({
      success: true,
      message: 'Report finalized successfully',
      data: report
    });

  } catch (error) {
    console.error('❌ Error finalizing report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/client-reports/:id/images - Upload images to report
router.post('/:id/images', authenticateUser, upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { captions = [], categories = [], taskNumbers = [], lineItemNumber } = req.body;

    console.log('📷 Uploading images to report:', id);
    console.log('📋 Line Item Number:', lineItemNumber);
    console.log('📁 Files received:', req.files?.length || 0);

    const report = await ClientReport.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const uploadedImages = [];

    // If lineItemNumber is provided, save to line item; otherwise save to report level
    const targetLineItem = lineItemNumber ? 
      report.lineItems.find(item => item.lineItemNumber === lineItemNumber) : null;

    if (lineItemNumber && !targetLineItem) {
      console.error(`❌ Line item ${lineItemNumber} not found in report`);
      return res.status(400).json({
        success: false,
        error: `Line item ${lineItemNumber} not found`
      });
    }

    console.log(`✅ Target: ${targetLineItem ? `Line Item ${lineItemNumber}` : 'Report Level'}`);

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      try {
        const filename = `client-reports/${report.reportNumber}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.originalname}`;
        
        console.log(`⬆️ Uploading ${file.originalname} to storage...`);
        
        // Upload to storage
        const uploadResult = await storageManager.uploadBuffer(file.buffer, filename, file.mimetype);
        
        console.log(`✅ Upload successful: ${uploadResult.fileUrl}`);
        
        const imageData = {
          filename: uploadResult.gcsFileName || filename,
          originalName: file.originalname,
          gcsUrl: uploadResult.fileUrl,
          caption: Array.isArray(captions) ? captions[i] : captions,
          category: Array.isArray(categories) ? (categories[i] || 'Documentation') : (categories || 'Documentation'),
          taskNumber: Array.isArray(taskNumbers) ? taskNumbers[i] : taskNumbers,
          size: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date(),
          order: i
        };

        // Save to line item or report level
        if (targetLineItem) {
          if (!targetLineItem.images) {
            targetLineItem.images = [];
          }
          targetLineItem.images.push(imageData);
          console.log(`✅ Added image to line item ${lineItemNumber}, total: ${targetLineItem.images.length}`);
        } else {
          await report.addImage(imageData);
          console.log(`✅ Added image to report level`);
        }
        
        uploadedImages.push(imageData);
      } catch (uploadError) {
        console.error('❌ Error uploading file:', file.originalname, uploadError);
      }
    }

    // Save the report with updated line items
    await report.save();

    console.log(`✅ Uploaded ${uploadedImages.length} images`);

    res.json({
      success: true,
      data: {
        report,
        uploadedImages
      },
      message: `${uploadedImages.length} images uploaded successfully`
    });

  } catch (error) {
    console.error('❌ Error uploading images:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/client-reports/:id/pdf - Generate and download report PDF
router.get('/:id/pdf', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('📄 Generating PDF for report:', id);

    const report = await ClientReport.findById(id)
      .populate('customer', 'firstName lastName email phone address')
      .populate('jobId', 'title jobId');

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    // Generate PDF
    const pdfService = new ClientReportPdfService();
    const pdfResult = await pdfService.generateClientReportPdf(report);

    // Update report with PDF info
    report.pdfGenerated = {
      generated: true,
      generatedAt: new Date(),
      pdfFilename: pdfResult.fileName
    };
    await report.save();

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

// POST /api/client-reports/:id/send - Send report to client
router.post('/:id/send', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('📧 Sending report to client:', id);

    const report = await ClientReport.findById(id)
      .populate('customer', 'firstName lastName email');

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    await report.sendToClient(req.user._id);

    // TODO: Send email notification to client

    console.log('✅ Report marked as sent to client');

    res.json({
      success: true,
      data: report,
      message: 'Report sent to client successfully'
    });

  } catch (error) {
    console.error('❌ Error sending report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/client-reports/:id/tasks/:taskNumber - Update task status
router.put('/:id/tasks/:taskNumber', authenticateUser, [
  body('status').isIn(['Complete', 'Needs Attention', 'In Progress', 'Not Started']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const { id, taskNumber } = req.params;
    const { status } = req.body;

    console.log(`📝 Updating task ${taskNumber} status to ${status}`);

    const report = await ClientReport.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    await report.updateTaskStatus(taskNumber, status);

    res.json({
      success: true,
      data: report,
      message: 'Task status updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating task status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/client-reports/contract-line-items/:contractId - Get final line items for a contract
router.get('/contract-line-items/:contractId', authenticateUser, async (req, res) => {
  try {
    const { contractId } = req.params;
    
    console.log('📋 Fetching final line items for contract:', contractId);

    // Get contract
    const contract = await Contract.findById(contractId).populate('customer');
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    // Get all approved amendments for this contract
    const ContractAmendment = require('../models/ContractAmendment');
    const amendments = await ContractAmendment.find({
      contractId: contractId,
      status: 'Approved'
    }).sort({ effectiveDate: 1 });

    console.log(`✅ Found ${amendments.length} approved amendments`);

    // Start with original contract line items
    const finalLineItems = [];
    let lineItemCounter = 1;

    // Add original contract line items
    if (contract.lineItems && contract.lineItems.length > 0) {
      contract.lineItems.forEach((item) => {
        finalLineItems.push({
          lineItemNumber: String(lineItemCounter++),
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          sourceType: 'original',
          inspectionStatus: 'Not Started',
          inspectionNotes: '',
          image: null
        });
      });
    }

    // Apply amendments in chronological order
    amendments.forEach((amendment) => {
      if (amendment.lineItemChanges && amendment.lineItemChanges.length > 0) {
        amendment.lineItemChanges.forEach((change) => {
          if (change.changeType === 'added' && change.updated) {
            // Add new line item
            finalLineItems.push({
              lineItemNumber: String(lineItemCounter++),
              description: change.updated.description,
              quantity: change.updated.quantity,
              unitPrice: change.updated.unitPrice,
              totalPrice: change.updated.totalPrice,
              sourceType: 'amendment',
              amendmentId: amendment._id,
              amendmentNumber: amendment.amendmentNumber,
              inspectionStatus: 'Not Started',
              inspectionNotes: '',
              image: null
            });
          } else if (change.changeType === 'modified' && change.updated) {
            // Find and update existing line item
            const existingIndex = finalLineItems.findIndex(
              item => item.description === change.original.description
            );
            if (existingIndex >= 0) {
              finalLineItems[existingIndex] = {
                ...finalLineItems[existingIndex],
                description: change.updated.description,
                quantity: change.updated.quantity,
                unitPrice: change.updated.unitPrice,
                totalPrice: change.updated.totalPrice,
                sourceType: 'amendment',
                amendmentId: amendment._id,
                amendmentNumber: amendment.amendmentNumber
              };
            }
          } else if (change.changeType === 'removed') {
            // Remove line item
            const removeIndex = finalLineItems.findIndex(
              item => item.description === change.original.description
            );
            if (removeIndex >= 0) {
              finalLineItems.splice(removeIndex, 1);
              // Renumber remaining items
              finalLineItems.forEach((item, idx) => {
                item.lineItemNumber = String(idx + 1);
              });
              lineItemCounter = finalLineItems.length + 1;
            }
          }
        });
      }
    });

    console.log(`✅ Final line items count: ${finalLineItems.length}`);

    res.json({
      success: true,
      data: {
        contractId: contract._id,
        contractNumber: contract.contractNumber,
        customerName: contract.clientName,
        propertyAddress: contract.propertyAddress,
        lineItems: finalLineItems,
        originalAmount: contract.totalAmount,
        amendmentsApplied: amendments.length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching contract line items:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

