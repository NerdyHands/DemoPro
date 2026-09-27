const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
const User = require('../models/User');
const router = express.Router();

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to check if user is authenticated using JWT
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ [AUTH] No token provided');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    console.log('🔐 [AUTH] Token received, verifying...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ [AUTH] Token decoded, userId:', decoded.userId);
    
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      console.log('❌ [AUTH] User not found or inactive:', decoded.userId);
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    console.log('✅ [AUTH] User authenticated:', user.email, 'ID:', user._id, 'Role:', user.role);
    req.user = user;
    next();
  } catch (error) {
    console.log('❌ [AUTH] Token verification failed:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /api/projects - Get all projects for a user
router.get('/', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 [PROJECTS] GET /api/projects - User:', req.user.email, 'Role:', req.user.role);
    
    const { status, priority, search, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    // Admin users can see all projects, regular users only see their own
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
    
    if (status) {
      filter.status = status;
    }
    
    if (priority) {
      filter.priority = priority;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    const projects = await Project.find(filter)
      .populate('owner', 'firstName lastName email')
      .populate('assignedUsers', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Project.countDocuments(filter);
    
    console.log('✅ [PROJECTS] Found', projects.length, 'projects out of', total, 'total for user');
    
    const response = {
      projects,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
    
    console.log('📤 [PROJECTS] Sending response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id - Get a specific project
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 [PROJECTS] GET /api/projects/:id - Project ID:', req.params.id);
    console.log('👤 [PROJECTS] Current user:', req.user.email, 'ID:', req.user._id, 'Role:', req.user.role);
    
    const project = await Project.findById(req.params.id)
      .populate('owner', 'firstName lastName email')
      .populate('assignedUsers', 'firstName lastName email');
    
    if (!project) {
      console.log('❌ [PROJECTS] Project not found');
      return res.status(404).json({ error: 'Project not found' });
    }
    
    console.log('✅ [PROJECTS] Project found:', project.name);
    console.log('👑 [PROJECTS] Project owner:', project.owner.email, 'ID:', project.owner._id);
    console.log('👥 [PROJECTS] Assigned users:', project.assignedUsers.map(u => u.email));
    
    // Check if user has access to this project
    // Allow access if user is admin, project owner, or assigned to the project
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAssigned = project.assignedUsers.some(user => user._id.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';
    
    console.log('🔐 [PROJECTS] Authorization check:');
    console.log('  - isOwner:', isOwner);
    console.log('  - isAssigned:', isAssigned);
    console.log('  - isAdmin:', isAdmin);
    console.log('  - projectOwner ID:', project.owner.toString());
    console.log('  - currentUser ID:', req.user._id.toString());
    
    if (!isOwner && !isAssigned && !isAdmin) {
      console.log('❌ [PROJECTS] Access denied - User does not have permission');
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You do not have permission to access this project',
        debug: {
          projectOwner: project.owner.toString(),
          currentUser: req.user._id.toString(),
          userRole: req.user.role
        }
      });
    }
    
    console.log('✅ [PROJECTS] Access granted - sending project data');
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST /api/projects - Create a new project
router.post('/', [
  authenticateUser,
  body('name').trim().isLength({ min: 1 }).withMessage('Project name is required'),
  body('address').trim().isLength({ min: 1 }).withMessage('Address is required'),
  body('reportType').isIn(['inspection', 'repair', 'estimate']).withMessage('Invalid report type'),
  body('deadline').isISO8601().withMessage('Valid deadline is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const projectData = {
      ...req.body,
      owner: req.user._id
    };
    
    const project = new Project(projectData);
    await project.save();
    
    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'firstName lastName email');
    
    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id - Update a project
router.put('/:id', [
  authenticateUser,
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Project name cannot be empty'),
  body('reportType').optional().isIn(['inspection', 'repair', 'estimate']).withMessage('Invalid report type'),
  body('deadline').optional().isISO8601().withMessage('Valid deadline is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user has access to update this project
    // Admin users can update any project, regular users can only update their own
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    Object.assign(project, req.body);
    await project.save();
    
    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'firstName lastName email')
      .populate('assignedUsers', 'firstName lastName email');
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user has access to delete this project
    // Admin users can delete any project, regular users can only delete their own
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await Project.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// POST /api/projects/:id/repairs - Add a repair to a project
router.post('/:id/repairs', [
  authenticateUser,
  body('name').trim().isLength({ min: 1 }).withMessage('Repair name is required'),
  body('cost').isFloat({ min: 0 }).withMessage('Valid cost is required'),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user has access to update this project
    // Admin users can update any project, regular users can only update their own
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    project.repairs.push(req.body);
    await project.save();
    
    res.json(project);
  } catch (error) {
    console.error('Error adding repair:', error);
    res.status(500).json({ error: 'Failed to add repair' });
  }
});

// PUT /api/projects/:id/repairs/:repairId - Update a repair
router.put('/:id/repairs/:repairId', [
  authenticateUser,
  body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('Valid cost is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user has access to update this project
    // Admin users can update any project, regular users can only update their own
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const repair = project.repairs.id(req.params.repairId);
    if (!repair) {
      return res.status(404).json({ error: 'Repair not found' });
    }
    
    Object.assign(repair, req.body);
    await project.save();
    
    res.json(project);
  } catch (error) {
    console.error('Error updating repair:', error);
    res.status(500).json({ error: 'Failed to update repair' });
  }
});

// DELETE /api/projects/:id/repairs/:repairId - Delete a repair
router.delete('/:id/repairs/:repairId', authenticateUser, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user has access to update this project
    // Admin users can update any project, regular users can only update their own
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    project.repairs.pull(req.params.repairId);
    await project.save();
    
    res.json(project);
  } catch (error) {
    console.error('Error deleting repair:', error);
    res.status(500).json({ error: 'Failed to delete repair' });
  }
});

// GET /api/projects/stats - Get project statistics
router.get('/stats/overview', authenticateUser, async (req, res) => {
  try {
    // Admin users can see all project stats, regular users only see their own
    const matchCondition = req.user.role === 'admin' ? {} : { owner: req.user._id };
    const stats = await Project.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalCost: { $sum: '$totalCost' },
          byStatus: {
            $push: '$status'
          },
          byPriority: {
            $push: '$priority'
          }
        }
      }
    ]);
    
    if (stats.length === 0) {
      return res.json({
        total: 0,
        totalCost: 0,
        byStatus: {},
        byPriority: {}
      });
    }
    
    const stat = stats[0];
    const statusCount = stat.byStatus.reduce((acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const priorityCount = stat.byPriority.reduce((acc, priority) => {
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      total: stat.total,
      totalCost: stat.totalCost,
      byStatus: statusCount,
      byPriority: priorityCount
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router; 