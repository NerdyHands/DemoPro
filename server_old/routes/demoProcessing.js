const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const PICRAProcessingService = require('../services/picraProcessingService');
const FileValidationService = require('../services/fileValidation');
const User = require('../models/User');
const router = express.Router();

// Initialize services
const picraProcessingService = new PICRAProcessingService();
const fileValidation = new FileValidationService();

// Middleware to check if user is authenticated
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, JWT_SECRET);
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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  console.log('🔍 File upload attempt:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.warn('⚠️  Invalid file type rejected:', file.mimetype);
    cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: fileValidation.maxFileSize
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('❌ Multer error:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large',
        message: `File size must be less than ${fileValidation.formatFileSize(fileValidation.maxFileSize)}`
      });
    }
    return res.status(400).json({ 
      error: 'File upload error',
      message: error.message 
    });
  } else if (error) {
    console.error('❌ File upload error:', error);
    return res.status(400).json({ 
      error: 'File upload failed',
      message: error.message 
    });
  }
  next();
};

// POST /api/picra-processing/upload - Upload and process PICRA document
router.post('/upload', [
  authenticateUser,
  upload.single('file'),
  handleMulterError
], async (req, res) => {
  // Manual validation after multer has processed the form data
  const validationErrors = [];
  
  // Validate projectId
  if (!req.body.projectId) {
    validationErrors.push({
      type: 'field',
      value: undefined,
      msg: 'Valid project ID is required',
      path: 'projectId',
      location: 'body'
    });
  } else if (!require('mongoose').Types.ObjectId.isValid(req.body.projectId)) {
    validationErrors.push({
      type: 'field',
      value: req.body.projectId,
      msg: 'Valid project ID is required',
      path: 'projectId',
      location: 'body'
    });
  }
  
  // Validate title
  if (!req.body.title || req.body.title.trim().length === 0) {
    validationErrors.push({
      type: 'field',
      value: req.body.title,
      msg: 'Document title is required',
      path: 'title',
      location: 'body'
    });
  }
  
  if (validationErrors.length > 0) {
    console.error('❌ Validation errors:', validationErrors);
    return res.status(400).json({ 
      error: 'Validation failed',
      errors: validationErrors 
    });
  }
  try {
    console.log('🚀 Starting PICRA upload processing...');
    console.log('📋 Request body:', req.body);
    console.log('📋 Request body keys:', Object.keys(req.body));
    console.log('📋 projectId value:', req.body.projectId);
    console.log('📋 title value:', req.body.title);
    console.log('📋 description value:', req.body.description);
    console.log('📁 File info:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : 'No file');
    
    if (!req.file) {
      console.error('❌ No file provided in request');
      return res.status(400).json({ 
        error: 'File is required',
        message: 'Please select a file to upload'
      });
    }

    // Validate file using the validation service
    console.log('🔍 Validating file...');
    const validation = await fileValidation.validateFile(req.file);
    console.log('✅ File validation result:', {
      isValid: validation.isValid,
      errors: validation.errors,
      fileInfo: validation.fileInfo
    });
    
    if (!validation.isValid) {
      console.error('❌ File validation failed:', validation.errors);
      return res.status(400).json({ 
        error: 'File validation failed',
        message: fileValidation.createErrorMessage(validation.errors),
        details: validation.errors
      });
    }

    console.log('🚀 Starting PICRA processing for file:', req.file.originalname);
    
    // Parse additional metadata if provided
    let additionalMetadata = {};
    if (req.body.metadata) {
      try {
        additionalMetadata = JSON.parse(req.body.metadata);
        console.log('📋 Additional metadata:', additionalMetadata);
      } catch (error) {
        console.warn('⚠️ Failed to parse metadata:', error);
      }
    }
    
    // Start the PICRA processing workflow with enhanced metadata
    const result = await picraProcessingService.processPICRADocument(
      req.file,
      req.user._id,
      req.body.projectId,
      req.body.reportId, // Optional, can be null
      {
        fileType: req.body.fileType || 'unknown',
        title: req.body.title,
        description: req.body.description,
        ...additionalMetadata
      }
    );
    
    // Handle validation failure
    if (!result.success && result.validationResult) {
      console.log('❌ Validation failed - sending error response:');
      console.log('  - isValid:', result.validationResult.isValid);
      console.log('  - confidence:', result.validationResult.confidence);
      console.log('  - reason:', result.validationResult.reason);
      console.log('  - details:', JSON.stringify(result.validationResult.details, null, 2));
      
      return res.status(400).json({
        error: 'Document validation failed',
        message: result.error,
        processingId: result.processingId,
        validationResult: {
          isValid: result.validationResult.isValid,
          confidence: result.validationResult.confidence,
          reason: result.validationResult.reason,
          details: result.validationResult.details
        }
      });
    }
    
    console.log('✅ Success - sending response:');
    console.log('  - processingId:', result.processingId);
    console.log('  - status:', result.processingRecord.status);
    console.log('  - validationResult:', result.validationResult ? {
      isValid: result.validationResult.isValid,
      confidence: result.validationResult.confidence,
      reason: result.validationResult.reason
    } : null);
    
    res.status(201).json({
      message: 'PICRA document processing started successfully',
      processingId: result.processingId,
      status: result.processingRecord.status,
      estimatedTime: '2-5 minutes',
      validationResult: result.validationResult ? {
        isValid: result.validationResult.isValid,
        confidence: result.validationResult.confidence,
        reason: result.validationResult.reason
      } : null
    });
    
  } catch (error) {
    console.error('❌ Error starting PICRA processing:', error);
    console.error('📋 Error stack:', error.stack);
    console.error('📋 Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    res.status(500).json({ 
      error: 'Failed to start PICRA processing',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/picra-processing/status/:id - Get processing status
router.get('/status/:id', authenticateUser, async (req, res) => {
  try {
    const status = await picraProcessingService.getProcessingStatus(req.params.id);
    
    // Check if user has access to this processing record
    if (status.processing.uploadedBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(status);
  } catch (error) {
    console.error('❌ Error getting processing status:', error);
    res.status(500).json({ 
      error: 'Failed to get processing status',
      details: error.message 
    });
  }
});

// GET /api/picra-processing/results/:id - Get processing results
router.get('/results/:id', authenticateUser, async (req, res) => {
  try {
    const results = await picraProcessingService.getProcessingResults(req.params.id);
    
    // Check if user has access to this processing record
    if (results.processing.uploadedBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(results);
  } catch (error) {
    console.error('❌ Error getting processing results:', error);
    res.status(500).json({ 
      error: 'Failed to get processing results',
      details: error.message 
    });
  }
});

// GET /api/picra-processing/user - Get user's processing records
router.get('/user', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const records = await picraProcessingService.getUserProcessingRecords(
      req.user._id,
      parseInt(page),
      parseInt(limit)
    );
    
    res.json(records);
  } catch (error) {
    console.error('❌ Error getting user processing records:', error);
    res.status(500).json({ 
      error: 'Failed to get processing records',
      details: error.message 
    });
  }
});

// GET /api/picra-processing/project/:projectId - Get project's processing records
router.get('/project/:projectId', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const records = await picraProcessingService.getProjectProcessingRecords(
      req.params.projectId,
      parseInt(page),
      parseInt(limit)
    );
    
    res.json(records);
  } catch (error) {
    console.error('❌ Error getting project processing records:', error);
    res.status(500).json({ 
      error: 'Failed to get project processing records',
      details: error.message 
    });
  }
});

// POST /api/picra-processing/retry/:id - Retry failed processing
router.post('/retry/:id', authenticateUser, async (req, res) => {
  try {
    const processing = await picraProcessingService.retryProcessing(req.params.id);
    
    // Check if user has access to this processing record
    if (processing.uploadedBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({
      message: 'Processing retry initiated successfully',
      processingId: processing._id,
      status: processing.status
    });
  } catch (error) {
    console.error('❌ Error retrying processing:', error);
    res.status(500).json({ 
      error: 'Failed to retry processing',
      details: error.message 
    });
  }
});

// DELETE /api/picra-processing/:id - Delete processing record
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const result = await picraProcessingService.deleteProcessingRecord(
      req.params.id,
      req.user._id
    );
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error deleting processing record:', error);
    res.status(500).json({ 
      error: 'Failed to delete processing record',
      details: error.message 
    });
  }
});

// GET /api/picra-processing/stats - Get processing statistics
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const PICRAProcessing = require('../models/PICRAProcessing');
    
    const stats = await PICRAProcessing.aggregate([
      { $match: { uploadedBy: req.user._id, isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCost: { $sum: '$openAIResults.totalEstimatedCost' },
          totalQuote: { $sum: '$quoteResults.total' }
        }
      }
    ]);
    
    const totalRecords = await PICRAProcessing.countDocuments({ 
      uploadedBy: req.user._id, 
      isActive: true 
    });
    
    const completedRecords = await PICRAProcessing.countDocuments({ 
      uploadedBy: req.user._id, 
      isActive: true,
      status: 'completed'
    });
    
    const totalEstimatedCost = await PICRAProcessing.aggregate([
      { $match: { uploadedBy: req.user._id, isActive: true, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$openAIResults.totalEstimatedCost' } } }
    ]);
    
    const totalQuoteValue = await PICRAProcessing.aggregate([
      { $match: { uploadedBy: req.user._id, isActive: true, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$quoteResults.total' } } }
    ]);
    
    res.json({
      totalRecords,
      completedRecords,
      successRate: totalRecords > 0 ? Math.round((completedRecords / totalRecords) * 100) : 0,
      totalEstimatedCost: totalEstimatedCost[0]?.total || 0,
      totalQuoteValue: totalQuoteValue[0]?.total || 0,
      statusBreakdown: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('❌ Error getting processing stats:', error);
    res.status(500).json({ 
      error: 'Failed to get processing statistics',
      details: error.message 
    });
  }
});

module.exports = router; 