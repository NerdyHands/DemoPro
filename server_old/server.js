const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
if (process.env.NODE_ENV !== 'production') {
  const devEnvPath = path.join(__dirname, '.env.development');
  if (fs.existsSync(devEnvPath)) {
    require('dotenv').config({ path: devEnvPath, override: true });
  }
}

const { validateEnv } = require('./src/config/validateEnv');
const {
  configureMongoDns,
  trustOsCertificateStore,
  getMongoConnectOptions,
  logMongoConnectError,
} = require('./src/config/mongoConnection');
const cron = require('node-cron');
const { syncNotionPosts } = require('./src/notion/notionService');
const projectRoutes = require('./routes/projects');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const otpRoutes = require('./routes/otp');
const stripeRoutes = require('./routes/stripe');
const openaiRoutes = require('./routes/openai');
const landingRoutes = require('./routes/landing');
const demoProcessingRoutes = require('./routes/demoProcessing');
const quoteRoutes = require('./routes/quotes');
const customerRoutes = require('./routes/customers');
const estimateRoutes = require('./routes/estimates');
const contractRoutes = require('./routes/contracts');
const amendmentRoutes = require('./routes/amendments');
const clientReportRoutes = require('./routes/clientReports');
const jobRoutes = require('./routes/jobs');
const technicianRoutes = require('./routes/technicians');
const jobProgressRoutes = require('./routes/jobProgress');
const milestoneRoutes = require('./routes/milestones');
const chatGptRoutes = require('./routes/chatgpt');
const blogRoutes = require('./src/routes/blogRoutes');
const blogAnalyticsRoutes = require('./src/routes/blogAnalyticsRoutes');
const seoRoutes = require('./src/routes/seoRoutes');
const emailRoutes = require('./routes/emailRoutes');
const mlsRoutes = require('./routes/mls');

// Initialize Storage Manager
const StorageManager = require('./services/storageManager');
const storageManager = new StorageManager();

const app = express();
const PORT = process.env.PORT || 5000;

validateEnv({ requireMongo: true });

// Trust proxy for accurate IP detection behind load balancers/proxies
const resolveTrustProxySetting = () => {
  const value = process.env.TRUST_PROXY;

  if (value === undefined) {
    return process.env.NODE_ENV === 'production' ? 1 : false;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === 'true') return true;
  if (normalized === 'false') return false;

  const numericValue = Number(value);
  if (!Number.isNaN(numericValue)) {
    return numericValue;
  }

  if (value.includes(',')) {
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }

  return value;
};

const trustProxySetting = resolveTrustProxySetting();
app.set('trust proxy', trustProxySetting);

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting - more permissive in development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: trustProxySetting,
  handler: (req, res) => {
    // Ensure CORS headers are set even on rate limit errors
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.'
    });
  }
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : process.env.NODE_ENV === 'production' 
    ? ['https://mrdemopro.com', 'https://www.mrdemopro.com']
    : [
        'http://localhost:3000', 
        'http://localhost:3001', 
        'http://localhost:5173', // Vite default port
        'http://localhost:5174', // Vite alternative port
        'http://127.0.0.1:3000', 
        'http://127.0.0.1:3001',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174'
      ];

console.log('🔧 CORS Configuration:');
console.log('📋 Allowed origins:', allowedOrigins);
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('🌍 Current working directory:', process.cwd());

const corsOptions = {
  origin: function (origin, callback) {
    console.log('🌐 CORS check for origin:', origin);
    
    // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    if (!origin) {
      console.log('✅ Allowing request with no origin');
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ Allowing origin:', origin);
      return callback(null, true);
    }
    
    // In development, be more permissive
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️ Development mode - allowing origin:', origin);
      return callback(null, true);
    }
    
    // Reject in production
    console.log('❌ CORS blocked origin:', origin);
    console.log('📋 Allowed origins:', allowedOrigins);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware for multipart requests
app.use((req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    console.log('📦 Multipart request detected');
    console.log('📋 Content-Type:', req.headers['content-type']);
    console.log('📏 Content-Length:', req.headers['content-length']);
  }
  next();
});

// Enhanced logging middleware with bot filtering
const logger = (req, res, next) => {
  const start = Date.now();
  const userAgent = req.headers['user-agent'] || '';
  
  // Common bot/scanner user agents to filter
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scanner/i, /norton/i, /symantec/i,
    /security/i, /avast/i, /avg/i, /kaspersky/i, /mcafee/i, /nmap/i,
    /masscan/i, /zmap/i, /shodan/i, /censys/i, /curl/i, /wget/i,
    /python-requests/i, /go-http-client/i, /java/i, /okhttp/i,
    /Trident/i, /MSIE/i, /Internet Explorer/i
  ];
  
  // Common bot/scanner paths to filter
  const botPaths = [
    '/loginMsg.js', '/cgi/', '/admin', '/wp-admin', '/wp-login',
    '/.env', '/config.php', '/phpmyadmin', '/.git', '/shell',
    '/.well-known/', '/favicon.ico'
  ];
  
  const isBotRequest = botPatterns.some(pattern => pattern.test(userAgent)) ||
                       botPaths.some(path => req.path.toLowerCase().includes(path.toLowerCase())) ||
                       (req.path === '/' && !req.headers.authorization && !req.query);
  
  // Skip detailed logging for bot requests and root path without auth
  if (!isBotRequest) {
    // Log request
    console.log(`\n📥 [${new Date().toISOString()}] ${req.method} ${req.path}`);
    if (Object.keys(req.query).length > 0) {
      console.log(`🔍 Query:`, req.query);
    }
    console.log(`📋 Headers:`, {
      'Content-Type': req.headers['content-type'],
      'Authorization': req.headers.authorization ? 'Bearer ***' : 'None',
      'User-Agent': userAgent.substring(0, 50) + '...'
    });
    
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(`📦 Body:`, JSON.stringify(req.body, null, 2));
    }
  }
  
  // Log response (simplified for bot requests)
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    if (isBotRequest && res.statusCode === 404) {
      // Silently ignore 404s from bots
      return;
    }
    
    const statusColor = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
    
    if (isBotRequest) {
      // Minimal logging for bot requests
      console.log(`${statusColor} [${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms) [Bot/Scanner]`);
    } else {
      console.log(`${statusColor} [${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
      
      if (res.statusCode >= 400) {
        console.log(`❌ Error Response:`, res.locals.error || 'No error details');
      }
    }
  });
  
  next();
};

// Apply logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(logger);
} else {
  app.use(morgan('combined'));
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://wayne:1234%40wayne%235410337%40@35.243.189.22:27017/mr-demo-pro?authSource=admin';

configureMongoDns();
trustOsCertificateStore();
const mongoOptions = getMongoConnectOptions();

const MONGO_CONNECT_ATTEMPTS = process.env.NODE_ENV === 'production' ? 3 : 20;

const connectMongo = async (attempt = 1) => {
  try {
    await mongoose.disconnect().catch(() => {});
    await mongoose.connect(MONGODB_URI, mongoOptions);
    console.log('✅ Connected to MongoDB successfully');
    console.log(`📊 Connected to: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
    onMongoConnected();
  } catch (error) {
    logMongoConnectError(error, attempt, MONGO_CONNECT_ATTEMPTS);
    if (attempt < MONGO_CONNECT_ATTEMPTS) {
      const delayMs = Math.min(3000 * attempt, 15000);
      console.error(`⏳ Retrying MongoDB connection in ${delayMs / 1000}s...`);
      setTimeout(() => connectMongo(attempt + 1), delayMs);
      return;
    }
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    console.error('❌ MongoDB still unreachable; API is up and will retry in 30s (dev only).');
    setTimeout(() => connectMongo(1), 30000);
  }
};

let mongoReady = false;
const onMongoConnected = () => {
  if (mongoReady) return;
  mongoReady = true;

  
  // Legacy Notion blog sync cron (off by default — landing uses Opinly at build time).
  // Enable only with ENABLE_NOTION_SYNC_CRON=true
  if (process.env.ENABLE_NOTION_SYNC_CRON === 'true') {
    console.log('📅 [CRON] Setting up Notion blog sync cron job (every 15 minutes)...');
    
    let isRunning = false; // Prevent overlapping syncs
    
    cron.schedule('*/15 * * * *', async () => {
      // Skip if previous sync is still running
      if (isRunning) {
        console.log('⏭️  [CRON] Previous Notion sync still running, skipping this run...');
        return;
      }
      
      isRunning = true;
      const startTime = Date.now();
      
      try {
        console.log('🔄 [CRON] Starting scheduled Notion blog sync...');
        console.log(`   Time: ${new Date().toISOString()}`);
        
        const env = validateEnv({ requireNotion: false, requireMongo: false, exitOnError: false });
        
        if (!env.notionApiKey || !env.notionDatabaseId) {
          console.log('⚠️  [CRON] Notion credentials not configured, skipping sync');
          return;
        }
        
                const metrics = await syncNotionPosts({
                  notionApiKey: env.notionApiKey,
                  databaseId: env.notionDatabaseId,
                  tagsDatabaseId: env.notionTagsDatabaseId,
                  authorsDatabaseId: env.notionAuthorsDatabaseId
                });
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log('✅ [CRON] Scheduled Notion sync completed:', {
          ...metrics,
          duration: `${duration}s`,
          nextRun: 'in 15 minutes'
        });
      } catch (error) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error(`❌ [CRON] Scheduled Notion sync failed after ${duration}s:`, error.message);
        if (error.stack) {
          console.error('   Stack:', error.stack.split('\n').slice(0, 3).join('\n   '));
        }
      } finally {
        isRunning = false;
      }
    }, {
      scheduled: true,
      timezone: 'America/New_York' // Adjust timezone as needed
    });
    
    console.log('✅ [CRON] Notion blog sync cron job scheduled (runs every 15 minutes)');
    console.log('   To disable: unset ENABLE_NOTION_SYNC_CRON or set it to anything other than true');
  } else {
    console.log('ℹ️  [CRON] Notion sync cron job disabled (legacy; landing uses Opinly). Set ENABLE_NOTION_SYNC_CRON=true to enable.');
  }
};

connectMongo();

// Simple ping endpoint for basic connectivity
app.get('/ping', (req, res) => {
  res.status(200).json({
    pong: true,
    timestamp: new Date().toISOString(),
    message: 'Server is responding'
  });
});

// Enhanced health check endpoint for Cloud Run monitoring
app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const dbState = mongoose.connection.readyState;
  
  // Convert database state to readable string
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }[dbState] || 'unknown';
  
  const healthData = {
    status: 'OK',
    message: 'Mr Demo Pro Server is running',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptime),
      formatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
    },
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: {
      status: dbStatus,
      connected: dbState === 1
    },
    storage: storageManager.getStatus(),
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
    },
    endpoints: {
      health: '/health',
      projects: '/api/projects',
      users: '/api/users',
      reports: '/api/reports',
      otp: '/api/otp'
    }
  };
  
  // Set appropriate status code based on health
  const isHealthy = dbState === 1 && storageManager.getStatus().status === 'OK';
  res.status(isHealthy ? 200 : 503).json(healthData);
});

// API health check endpoint for Cloud Run monitoring
app.get('/api/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const dbState = mongoose.connection.readyState;
  
  // Convert database state to readable string
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }[dbState] || 'unknown';
  
  const healthData = {
    status: 'OK',
    message: 'Mr Demo Pro Server API is running',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptime),
      formatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
    },
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: {
      status: dbStatus,
      connected: dbState === 1
    },
    storage: storageManager.getStatus(),
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
    },
    endpoints: {
      health: '/api/health',
      projects: '/api/projects',
      users: '/api/users',
      reports: '/api/reports',
      otp: '/api/otp'
    }
  };
  
  // Set appropriate status code based on health
  const isHealthy = dbState === 1 && storageManager.getStatus().status === 'OK';
  res.status(isHealthy ? 200 : 503).json(healthData);
});

// Serve static files from uploads directory (for local storage)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/openai', openaiRoutes);
app.use('/api/landing', landingRoutes);
app.use('/api/demo-processing', demoProcessingRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/estimates', estimateRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/amendments', amendmentRoutes);
app.use('/api/client-reports', clientReportRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/job-progress', jobProgressRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/chatgpt', chatGptRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/blog/events', blogAnalyticsRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/mls', mlsRoutes);
app.use('/', seoRoutes);

// Serve landing app static files (supports both local and Docker paths)
// Note: Vite builds to 'dist', not 'build'
const possibleStaticDirs = [
  path.join(__dirname, '../landing/dist'),
  path.join(__dirname, '../landing/build'), // Legacy support
  path.join(process.cwd(), 'landing/dist'),
  path.join(process.cwd(), 'landing/build'), // Legacy support
  path.join(process.cwd(), 'landing-build')
];

let staticDirServed = false;
for (const dir of possibleStaticDirs) {
  try {
    // Use fs without importing since require is at top; use lazy import to avoid top clutter
    const fs = require('fs');
    if (!staticDirServed && fs.existsSync(dir)) {
      app.use(express.static(dir));
      staticDirServed = true;
      console.log(`📦 Serving static files from: ${dir}`);
    }
  } catch (e) {
    // noop
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Mr Demo Pro API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      ping: '/ping',
      health: '/health',
      apiHealth: '/api/health',
      projects: '/api/projects',
      users: '/api/users',
      reports: '/api/reports',
      otp: '/api/otp',
      stripe: '/api/stripe',
      openai: '/api/openai',
      landing: '/api/landing',
      demoProcessing: '/api/demo-processing',
      customers: '/api/customers',
      estimates: '/api/estimates',
      contracts: '/api/contracts',
      jobs: '/api/jobs',
      blog: '/api/blog',
      mls: '/api/mls'
    }
  });
});

// SPA fallback for non-API routes: serve index.html so client router handles routes
app.get('*', (req, res, next) => {
  try {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return next();
    }

    // Determine index.html from whichever static dir we mounted
    const fs = require('fs');
    const candidateIndexFiles = possibleStaticDirs.map(d => path.join(d, 'index.html'));
    const indexPath = candidateIndexFiles.find(f => fs.existsSync(f));
    if (indexPath) {
      return res.sendFile(indexPath);
    }
  } catch (err) {
    // fallthrough to next handlers
  }
  return next();
});

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// 404 handler for undefined routes (non-API)
app.use((req, res) => {
  // Don't set error details for bot/scanner requests
  const userAgent = req.headers['user-agent'] || '';
  const isBotRequest = /bot|crawler|spider|scanner|norton|symantec|security|avast|avg|kaspersky|mcafee|nmap|masscan|zmap|shodan|censys|curl|wget|python-requests|go-http-client|java|okhttp|Trident|MSIE|Internet Explorer/i.test(userAgent) ||
                       ['/loginMsg.js', '/cgi/', '/admin', '/wp-admin', '/.env'].some(path => req.path.toLowerCase().includes(path.toLowerCase()));
  
  // For bot requests, just send a simple 404 without JSON (faster response)
  if (isBotRequest) {
    return res.status(404).end();
  }
  
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler - ensure CORS headers are set
app.use((error, req, res, next) => {
  console.error('❌ Global error handler caught:', error);
  console.error('📋 Request details:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  
  // Ensure CORS headers are set on error responses
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production')) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else if (!origin || process.env.NODE_ENV !== 'production') {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  // Store error in response locals for logging
  res.locals.error = error.message;
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.message,
      details: error.errors
    });
  }
  
  if (error.name === 'MongoError' && error.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate Error',
      message: 'A record with this information already exists'
    });
  }
  
  if (error.name === 'MulterError') {
    return res.status(400).json({
      error: 'File Upload Error',
      message: error.message,
      code: error.code
    });
  }
  
  // Handle any other errors
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// Start server with port conflict handling
const startServer = async (port) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`🚀 Mr Demo Pro Server running on port ${port}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${port}/health`);
      
      // Initialize storage manager
      storageManager.initialize()
        .then(() => {
          const status = storageManager.getStatus();
          console.log(`✅ Storage initialized: ${status.type}`);
          resolve(server);
        })
        .catch((error) => {
          console.error('❌ Storage initialization failed:', error);
          resolve(server);
        });
    });
    
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`⚠️  Port ${port} is in use, trying port ${port + 1}`);
        server.close();
        startServer(port + 1)
          .then(resolve)
          .catch(reject);
      } else {
        console.error('❌ Server startup failed:', error);
        reject(error);
      }
    });
  });
};

// Start the server
startServer(PORT)
  .then(() => {
    console.log('✅ Server started successfully');
    
    // Initialize email worker if email service is enabled
    if (process.env.SENDGRID_ENABLED === 'true') {
      const emailWorker = require('./services/emailWorker');
      emailWorker.start();
      console.log('📧 Email worker started');
    } else {
      console.log('📧 Email service is disabled - email worker not started');
    }
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

module.exports = app; 