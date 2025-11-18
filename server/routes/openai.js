const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { body, validationResult } = require('express-validator');

let openai = null;

// Initialize OpenAI client only when needed
const getOpenAI = () => {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

// Middleware to check OpenAI API key
const checkOpenAIKey = (req, res, next) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }
  next();
};

// Chat completion endpoint
router.post('/chat', [
  checkOpenAIKey,
  body('messages').isArray().withMessage('Messages must be an array'),
  body('messages.*.role').isIn(['system', 'user', 'assistant']).withMessage('Invalid message role'),
  body('messages.*.content').isString().withMessage('Message content must be a string'),
  body('model').optional().isString().withMessage('Model must be a string'),
  body('temperature').optional().isFloat({ min: 0, max: 2 }).withMessage('Temperature must be between 0 and 2'),
  body('max_tokens').optional().isInt({ min: 1, max: 4000 }).withMessage('Max tokens must be between 1 and 4000')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { messages, model = 'gpt-3.5-turbo', temperature = 0.7, max_tokens = 1000 } = req.body;

    const completion = await getOpenAI().chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
    });

    res.json({
      response: completion.choices[0].message.content,
      usage: completion.usage,
      model: completion.model
    });
  } catch (error) {
    console.error('OpenAI chat error:', error);
    res.status(500).json({ error: 'Failed to generate chat response' });
  }
});

// Document analysis endpoint
router.post('/analyze-document', [
  checkOpenAIKey,
  body('content').isString().withMessage('Document content is required'),
  body('analysisType').isIn(['summary', 'extract', 'qa', 'sentiment']).withMessage('Invalid analysis type'),
  body('prompt').optional().isString().withMessage('Custom prompt must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, analysisType, prompt } = req.body;

    let systemPrompt = '';
    let userPrompt = '';

    switch (analysisType) {
      case 'summary':
        systemPrompt = 'You are a professional document analyst. Provide a concise summary of the given document.';
        userPrompt = `Please provide a comprehensive summary of the following document:\n\n${content}`;
        break;
      
      case 'extract':
        systemPrompt = 'You are a data extraction specialist. Extract key information from the document in a structured format.';
        userPrompt = `Extract key information from this document and format it as JSON with relevant fields:\n\n${content}`;
        break;
      
      case 'qa':
        systemPrompt = 'You are a helpful assistant that answers questions based on the provided document content.';
        userPrompt = `Based on the following document, answer the user's question:\n\nDocument: ${content}\n\nQuestion: ${prompt || 'What are the main points of this document?'}`;
        break;
      
      case 'sentiment':
        systemPrompt = 'You are a sentiment analysis expert. Analyze the tone and sentiment of the document.';
        userPrompt = `Analyze the sentiment and tone of this document:\n\n${content}`;
        break;
    }

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    res.json({
      analysis: completion.choices[0].message.content,
      type: analysisType,
      usage: completion.usage
    });
  } catch (error) {
    console.error('Document analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze document' });
  }
});

// Content generation endpoint
router.post('/generate-content', [
  checkOpenAIKey,
  body('type').isIn(['email', 'report', 'description', 'title', 'meta']).withMessage('Invalid content type'),
  body('topic').isString().withMessage('Topic is required'),
  body('tone').optional().isIn(['professional', 'casual', 'formal', 'friendly']).withMessage('Invalid tone'),
  body('length').optional().isIn(['short', 'medium', 'long']).withMessage('Invalid length'),
  body('additionalContext').optional().isString().withMessage('Additional context must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, topic, tone = 'professional', length = 'medium', additionalContext } = req.body;

    let systemPrompt = '';
    let userPrompt = '';

    const lengthTokens = {
      short: 100,
      medium: 300,
      long: 600
    };

    switch (type) {
      case 'email':
        systemPrompt = 'You are a professional email writer. Write clear, concise emails.';
        userPrompt = `Write a ${tone} email about: ${topic}${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}`;
        break;
      
      case 'report':
        systemPrompt = 'You are a professional report writer. Create structured, informative reports.';
        userPrompt = `Write a ${tone} report about: ${topic}${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}`;
        break;
      
      case 'description':
        systemPrompt = 'You are a content writer. Create engaging descriptions.';
        userPrompt = `Write a ${tone} description about: ${topic}${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}`;
        break;
      
      case 'title':
        systemPrompt = 'You are a title specialist. Create compelling, SEO-friendly titles.';
        userPrompt = `Generate a ${tone} title for: ${topic}${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}`;
        break;
      
      case 'meta':
        systemPrompt = 'You are an SEO specialist. Create meta descriptions for web pages.';
        userPrompt = `Write a meta description for: ${topic}${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}`;
        break;
    }

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: lengthTokens[length],
    });

    res.json({
      content: completion.choices[0].message.content,
      type,
      topic,
      tone,
      length,
      usage: completion.usage
    });
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Image analysis endpoint (using GPT-4 Vision)
router.post('/analyze-image', [
  checkOpenAIKey,
  body('imageUrl').isURL().withMessage('Valid image URL is required'),
  body('prompt').optional().isString().withMessage('Analysis prompt must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { imageUrl, prompt = 'Describe what you see in this image in detail.' } = req.body;

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    res.json({
      analysis: completion.choices[0].message.content,
      usage: completion.usage
    });
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// Text embedding endpoint
router.post('/embeddings', [
  checkOpenAIKey,
  body('text').isString().withMessage('Text is required'),
  body('model').optional().isString().withMessage('Model must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, model = 'text-embedding-ada-002' } = req.body;

    const response = await getOpenAI().embeddings.create({
      model,
      input: text,
    });

    res.json({
      embedding: response.data[0].embedding,
      model: response.model,
      usage: response.usage
    });
  } catch (error) {
    console.error('Embedding error:', error);
    res.status(500).json({ error: 'Failed to generate embedding' });
  }
});

// Batch text embeddings
router.post('/embeddings/batch', [
  checkOpenAIKey,
  body('texts').isArray().withMessage('Texts must be an array'),
  body('texts.*').isString().withMessage('Each text must be a string'),
  body('model').optional().isString().withMessage('Model must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { texts, model = 'text-embedding-ada-002' } = req.body;

    if (texts.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 texts allowed per request' });
    }

    const response = await getOpenAI().embeddings.create({
      model,
      input: texts,
    });

    res.json({
      embeddings: response.data.map(item => ({
        embedding: item.embedding,
        index: item.index
      })),
      model: response.model,
      usage: response.usage
    });
  } catch (error) {
    console.error('Batch embedding error:', error);
    res.status(500).json({ error: 'Failed to generate embeddings' });
  }
});

// Code analysis and generation
router.post('/code', [
  checkOpenAIKey,
  body('action').isIn(['analyze', 'generate', 'debug', 'optimize']).withMessage('Invalid action'),
  body('code').optional().isString().withMessage('Code must be a string'),
  body('language').optional().isString().withMessage('Language must be a string'),
  body('requirements').optional().isString().withMessage('Requirements must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, code, language = 'javascript', requirements } = req.body;

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'analyze':
        systemPrompt = 'You are a code analyst. Analyze the provided code for issues, improvements, and best practices.';
        userPrompt = `Analyze this ${language} code:\n\n${code}`;
        break;
      
      case 'generate':
        systemPrompt = 'You are a code generator. Generate clean, well-documented code based on requirements.';
        userPrompt = `Generate ${language} code for: ${requirements}`;
        break;
      
      case 'debug':
        systemPrompt = 'You are a debugging expert. Identify and fix issues in the provided code.';
        userPrompt = `Debug this ${language} code:\n\n${code}`;
        break;
      
      case 'optimize':
        systemPrompt = 'You are a code optimizer. Improve the performance and readability of the provided code.';
        userPrompt = `Optimize this ${language} code:\n\n${code}`;
        break;
    }

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    res.json({
      result: completion.choices[0].message.content,
      action,
      language,
      usage: completion.usage
    });
  } catch (error) {
    console.error('Code analysis error:', error);
    res.status(500).json({ error: 'Failed to process code' });
  }
});

// Get available models
router.get('/models', checkOpenAIKey, async (req, res) => {
  try {
    const models = await getOpenAI().models.list();
    
    // Filter to commonly used models
    const commonModels = models.data.filter(model => 
      model.id.includes('gpt-') || 
      model.id.includes('text-embedding-') ||
      model.id.includes('dall-e-')
    );

    res.json(commonModels);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

module.exports = router; 