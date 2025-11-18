#!/usr/bin/env node

/**
 * Server Startup Script with Error Handling
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Mr Demo Pro Server...');

// Function to find available port
const findAvailablePort = async (startPort) => {
  const net = require('net');
  
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️  Port ${startPort} is in use, trying ${startPort + 1}`);
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
  });
};

// Start server
const startServer = async () => {
  try {
    // Kill any existing Node.js processes (optional)
    console.log('🔍 Checking for existing processes...');
    
    // Start the server
    const serverProcess = spawn('node', ['server.js'], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    serverProcess.on('error', (error) => {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    });
    
    serverProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error(`❌ Server exited with code ${code}`);
        process.exit(code);
      }
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server...');
      serverProcess.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down server...');
      serverProcess.kill('SIGTERM');
    });
    
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

startServer(); 