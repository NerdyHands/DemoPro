const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const Report = require('../models/Report');
const Project = require('../models/Project');
const User = require('../models/User');
const StorageManager = require('../services/storageManager');
const GoogleDocumentAPIService = require('../services/googleDocumentAPI');
const FileValidationService = require('../services/fileValidation');
const router = express.Router();

// Initialize services
const storageManager = new StorageManager();
const docService = new GoogleDocumentAPIService();
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
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Use the file validation service
  if (fileValidation.validateMimeType(file.mimetype) && 
      fileValidation.validateExtension(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${fileValidation.allowedExtensions.join(', ')} files are allowed.`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: fileValidation.maxFileSize
  }
});

// GET /api/reports - Get all reports for a user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { projectId, reportType, status, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = { uploadedBy: req.user._id };
    
    if (projectId) {
      filter.projectId = projectId;
    }
    
    if (reportType) {
      filter.reportType = reportType;
    }
    
    if (status) {
      filter.status = status;
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    const reports = await Report.find(filter)
      .populate('projectId', 'name address')
      .populate('uploadedBy', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Report.countDocuments(filter);
    
    res.json({
      reports,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// GET /api/reports/:id - Get a specific report
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('projectId', 'name address')
      .populate('uploadedBy', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName email');
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Check if user has access to this report
    if (report.uploadedBy._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// POST /api/reports - Upload a new report
router.post('/', [
  authenticateUser,
  upload.single('file'),
  body('projectId').isMongoId().withMessage('Valid project ID is required'),
  body('reportType').isIn(['picra', 'inspection', 'estimate']).withMessage('Invalid report type'),
  body('title').trim().isLength({ min: 1 }).withMessage('Report title is required'),
  body('description').optional().trim(),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    // Validate file using the validation service
    const validation = await fileValidation.validateFile(req.file);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'File validation failed',
        details: fileValidation.createErrorMessage(validation.errors)
      });
    }
    
    // Check if project exists and user has access
    const project = await Project.findById(req.body.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Admin users can access any project, regular users need to be owner or assigned
    if (project.owner.toString() !== req.user._id.toString() && 
        !project.assignedUsers.some(user => user.toString() === req.user._id.toString()) &&
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied to this project' });
    }

    // Upload to storage (GCS or local)
    let uploadResult;
    try {
      uploadResult = await storageManager.uploadFile(req.file, req.body.reportType);
      console.log('✅ File uploaded to storage:', uploadResult.fileName);
    } catch (uploadError) {
      console.error('❌ Storage upload failed:', uploadError);
      throw uploadError;
    }

    // Create Google Document in development mode
    let googleDocInfo = null;
    if (process.env.NODE_ENV === 'development' && docService.isAvailable()) {
      try {
        const docTitle = `${req.body.title} - ${req.body.reportType.toUpperCase()}`;
        googleDocInfo = await docService.createDocumentFromFile(req.file, docTitle);
        console.log('✅ Google Document created:', googleDocInfo.title);
      } catch (docError) {
        console.error('❌ Google Document creation failed:', docError);
      }
    }
    
    // Create report data
    const reportData = {
      projectId: req.body.projectId,
      reportType: req.body.reportType,
      title: req.body.title,
      description: req.body.description,
      fileUrl: uploadResult.fileUrl,
      fileName: uploadResult.fileName,
      fileSize: uploadResult.fileSize,
      mimeType: uploadResult.mimeType,
      uploadedBy: req.user._id,
      tags: req.body.tags || [],
      metadata: {
        ...req.body.metadata,
        gcsFileName: uploadResult.gcsFileName,
        googleDocId: googleDocInfo?.documentId || googleDocInfo?.fileId,
        googleDocUrl: googleDocInfo?.url,
        fileType: fileValidation.getFileTypeInfo(req.file.originalname)
      }
    };
    
    const report = new Report(reportData);
    await report.save();
    
    // Update project with report reference
    if (req.body.reportType === 'picra') {
      project.picraReport = {
        url: reportData.fileUrl,
        filename: reportData.fileName,
        uploadDate: new Date(),
        version: 1,
        googleDocId: googleDocInfo?.documentId || googleDocInfo?.fileId,
        googleDocUrl: googleDocInfo?.url
      };
    } else if (req.body.reportType === 'inspection') {
      project.homeInspectionReport = {
        url: reportData.fileUrl,
        filename: reportData.fileName,
        uploadDate: new Date(),
        version: 1,
        googleDocId: googleDocInfo?.documentId || googleDocInfo?.fileId,
        googleDocUrl: googleDocInfo?.url
      };
    }
    await project.save();
    
    const populatedReport = await Report.findById(report._id)
      .populate('projectId', 'name address')
      .populate('uploadedBy', 'firstName lastName email');
    
    res.status(201).json({
      message: 'Report uploaded successfully',
      report: populatedReport,
      googleDoc: googleDocInfo ? {
        id: googleDocInfo.documentId || googleDocInfo.fileId,
        url: googleDocInfo.url,
        title: googleDocInfo.title
      } : null
    });
  } catch (error) {
    console.error('Error uploading report:', error);
    res.status(500).json({ error: 'Failed to upload report' });
  }
});

// PUT /api/reports/:id - Update a report
router.put('/:id', [
  authenticateUser,
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Check if user has access to update this report
    if (report.uploadedBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'tags', 'metadata'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    Object.assign(report, updates);
    await report.save();
    
    const updatedReport = await Report.findById(report._id)
      .populate('projectId', 'name address')
      .populate('uploadedBy', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName email');
    
    res.json({
      message: 'Report updated successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// POST /api/reports/:id/review - Review a report (admin/inspector only)
router.post('/:id/review', [
  authenticateUser,
  body('status').isIn(['approved', 'rejected']).withMessage('Valid status is required'),
  body('reviewNotes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Check if user has permission to review
    if (!['admin', 'inspector'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    report.status = req.body.status;
    report.reviewedBy = req.user._id;
    report.reviewDate = new Date();
    report.reviewNotes = req.body.reviewNotes;
    
    await report.save();
    
    const updatedReport = await Report.findById(report._id)
      .populate('projectId', 'name address')
      .populate('uploadedBy', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName email');
    
    res.json({
      message: 'Report reviewed successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Error reviewing report:', error);
    res.status(500).json({ error: 'Failed to review report' });
  }
});

// DELETE /api/reports/:id - Delete a report
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Check if user has access to delete this report
    if (report.uploadedBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Delete file from filesystem
    if (report.fileUrl) {
      const filePath = path.join(__dirname, '..', report.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await Report.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// GET /api/reports/download/:id - Download a report file
router.get('/download/:id', authenticateUser, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Check if user has access to this report
    if (report.uploadedBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const filePath = path.join(__dirname, '..', report.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.download(filePath, report.fileName);
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ error: 'Failed to download report' });
  }
});

// GET /api/reports/stats - Get report statistics
router.get('/stats/overview', authenticateUser, async (req, res) => {
  try {
    const stats = await Report.aggregate([
      { $match: { uploadedBy: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byType: {
            $push: '$reportType'
          },
          byStatus: {
            $push: '$status'
          }
        }
      }
    ]);
    
    if (stats.length === 0) {
      return res.json({
        total: 0,
        byType: {},
        byStatus: {}
      });
    }
    
    const stat = stats[0];
    const typeCount = stat.byType.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    const statusCount = stat.byStatus.reduce((acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      total: stat.total,
      byType: typeCount,
      byStatus: statusCount
    });
  } catch (error) {
    console.error('Error fetching report stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Google Document API Routes (Development Only)
if (process.env.NODE_ENV === 'development') {
  // GET /api/reports/:id/google-doc - Get Google Document info
  router.get('/:id/google-doc', authenticateUser, async (req, res) => {
    try {
      const report = await Report.findById(req.params.id);
      
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }
      
      if (report.uploadedBy.toString() !== req.user._id.toString() && 
          req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const googleDocId = report.metadata?.googleDocId;
      if (!googleDocId) {
        return res.status(404).json({ error: 'No Google Document associated with this report' });
      }
      
      const docInfo = await docService.getDocumentContent(googleDocId);
      res.json(docInfo);
    } catch (error) {
      console.error('Error fetching Google Document:', error);
      res.status(500).json({ error: 'Failed to fetch Google Document' });
    }
  });

  // POST /api/reports/:id/google-doc/share - Share Google Document
  router.post('/:id/google-doc/share', [
    authenticateUser,
    body('email').isEmail().withMessage('Valid email is required'),
    body('role').optional().isIn(['reader', 'writer', 'commenter']).withMessage('Invalid role')
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const report = await Report.findById(req.params.id);
      
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }
      
      if (report.uploadedBy.toString() !== req.user._id.toString() && 
          req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const googleDocId = report.metadata?.googleDocId;
      if (!googleDocId) {
        return res.status(404).json({ error: 'No Google Document associated with this report' });
      }
      
      await docService.shareDocument(googleDocId, req.body.email, req.body.role || 'reader');
      
      res.json({ 
        message: 'Document shared successfully',
        email: req.body.email,
        role: req.body.role || 'reader'
      });
    } catch (error) {
      console.error('Error sharing Google Document:', error);
      res.status(500).json({ error: 'Failed to share Google Document' });
    }
  });

  // GET /api/reports/google-docs/search - Search Google Documents
  router.get('/google-docs/search', authenticateUser, async (req, res) => {
    try {
      const { query, maxResults = 10 } = req.query;
      
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const documents = await docService.searchDocuments(query, parseInt(maxResults));
      res.json({ documents });
    } catch (error) {
      console.error('Error searching Google Documents:', error);
      res.status(500).json({ error: 'Failed to search Google Documents' });
    }
  });
}

// GET /api/reports/validation-rules - Get file validation rules
router.get('/validation-rules', (req, res) => {
  res.json(fileValidation.getValidationRules());
});

module.exports = router; 