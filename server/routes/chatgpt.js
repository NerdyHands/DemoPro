const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const ChatGptService = require('../services/chatGptService');
const User = require('../models/User');
const router = express.Router();

// Initialize ChatGPT service
const chatGptService = new ChatGptService();

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

// POST /api/chatgpt/extract-repair-items - Extract repair items using ChatGPT
router.post('/extract-repair-items', [
  authenticateUser,
  body('prompt').isString().notEmpty().withMessage('Prompt is required'),
  body('extractedText').isString().notEmpty().withMessage('Extracted text is required')
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

    const { prompt, extractedText } = req.body;

    console.log('🤖 Processing ChatGPT request for user:', req.user.email);
    console.log('📝 Text length:', extractedText.length, 'characters');

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key not configured. Please contact administrator.'
      });
    }

    // Process with ChatGPT
    const result = await chatGptService.extractRepairItems(prompt, extractedText);

    if (result.success) {
      console.log('✅ ChatGPT processing successful');
      
      // Log usage for monitoring
      console.log('📊 ChatGPT API usage:', {
        userId: req.user._id,
        userEmail: req.user.email,
        textLength: extractedText.length,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        response: result.response,
        structuredData: result.structuredData
      });
    } else {
      console.error('❌ ChatGPT processing failed:', result.error);
      res.status(500).json({
        success: false,
        error: result.error,
        rawResponse: result.rawResponse || null
      });
    }

  } catch (error) {
    console.error('🚨 ChatGPT route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during ChatGPT processing'
    });
  }
});

// POST /api/chatgpt/extract-repair-items-structured - Use structured prompt
router.post('/extract-repair-items-structured', [
  authenticateUser,
  body('extractedText').isString().notEmpty().withMessage('Extracted text is required')
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

    const { extractedText } = req.body;

    console.log('🤖 Processing structured ChatGPT request for user:', req.user.email);
    console.log('📝 Text length:', extractedText.length, 'characters');

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key not configured. Please contact administrator.'
      });
    }

    // Process with ChatGPT using structured prompt
    const result = await chatGptService.extractRepairItemsStructured(extractedText);

    if (result.success) {
      console.log('✅ Structured ChatGPT processing successful');
      
      // Validate and clean the repair items
      const validation = chatGptService.validateRepairItems(result.structuredData);
      
      if (validation.valid) {
        // Log usage for monitoring
        console.log('📊 ChatGPT API usage (structured):', {
          userId: req.user._id,
          userEmail: req.user.email,
          textLength: extractedText.length,
          itemsExtracted: validation.items.length,
          timestamp: new Date().toISOString()
        });

        res.json({
          success: true,
          response: JSON.stringify(validation.items),
          structuredData: validation.items,
          itemCount: validation.items.length
        });
      } else {
        console.warn('⚠️ Repair items validation failed:', validation.error);
        res.json({
          success: true,
          response: result.response,
          structuredData: result.structuredData,
          validationWarning: validation.error
        });
      }
    } else {
      console.error('❌ Structured ChatGPT processing failed:', result.error);
      res.status(500).json({
        success: false,
        error: result.error,
        rawResponse: result.rawResponse || null
      });
    }

  } catch (error) {
    console.error('🚨 Structured ChatGPT route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during ChatGPT processing'
    });
  }
});

// GET /api/chatgpt/health - Check ChatGPT service health
router.get('/health', authenticateUser, async (req, res) => {
  try {
    const health = {
      service: 'ChatGPT',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      apiKeyConfigured: !!process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    };

    res.json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      service: 'ChatGPT',
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
