#!/usr/bin/env node

/**
 * Client Startup Script
 * Ensures client always starts on port 3001
 */

const { spawn } = require('child_process');
const path = require('path');

// Set environment variables
process.env.PORT = '3001';

console.log('🎨 Starting client on port 3001...');

// Start the React development server
const clientProcess = spawn('react-scripts', ['start'], {
  stdio: 'inherit',
  cwd: __dirname,
  shell: true,
  env: {
    ...process.env,
    PORT: '3001'
  }
});

clientProcess.on('error', (error) => {
  console.error('❌ Failed to start client:', error.message);
  process.exit(1);
});

clientProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Client exited with code ${code}`);
    process.exit(code);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down client...');
  clientProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down client...');
  clientProcess.kill('SIGTERM');
  process.exit(0);
});
