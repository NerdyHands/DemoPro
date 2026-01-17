#!/usr/bin/env node

/**
 * Wrapper script for react-snap that handles Puppeteer errors gracefully
 * This script attempts to run react-snap but will continue if it fails
 */

import { spawn } from 'child_process';

const TIMEOUT = 120000; // 2 minutes timeout

console.log('🚀 Starting react-snap...');
console.log('Note: If this fails, the build will continue without prerendering.');
console.log('ℹ️  Note: Chrome/Puppeteer errors on Windows are common and non-fatal.');
console.log('   The build will continue successfully even if prerendering fails.');
console.log('ℹ️  Note: "Failed to load resource" errors are expected during prerendering');
console.log('   (external resources like GTM cannot load during static generation)');
console.log('   These errors do not affect the build or production site.\n');

const reactSnap = spawn('npx', ['react-snap'], {
  stdio: ['inherit', 'inherit', 'pipe'], // Capture stderr separately to filter Chrome errors
  shell: true,
  env: {
    ...process.env,
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: 'false',
    PUPPETEER_TIMEOUT: TIMEOUT.toString(),
    // Additional environment variables to help with Chrome on Windows
    PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
  }
});

// Filter out known Chrome/Puppeteer errors that don't affect functionality
if (reactSnap.stderr) {
  reactSnap.stderr.on('data', (data) => {
    const output = data.toString();
    // Filter out Chrome fatal errors that are non-critical
    if (output.includes('FATAL:feature_list.cc') || 
        output.includes('Failed to launch chrome') ||
        output.includes('Check failed: !g_initialized_from_accessor')) {
      // Suppress these errors as they're often non-fatal on Windows
      // The wrapper will handle the exit code appropriately
      return;
    }
    // Pass through other errors
    process.stderr.write(data);
  });
}

let timeoutId;
let hasExited = false;

const cleanup = () => {
  if (hasExited) return;
  hasExited = true;
  if (timeoutId) clearTimeout(timeoutId);
};

timeoutId = setTimeout(() => {
  if (!hasExited) {
    console.error('\n⏱️  react-snap timed out after 2 minutes');
    console.log('⚠️  Continuing build without prerendering...');
    reactSnap.kill('SIGTERM');
    cleanup();
    process.exit(0); // Exit successfully to allow build to continue
  }
}, TIMEOUT);

reactSnap.on('close', (code) => {
  cleanup();
  if (code === 0) {
    console.log('✅ react-snap completed successfully');
    process.exit(0);
  } else {
    // Check if it's a Chrome launch error (common on Windows)
    console.log(`⚠️  react-snap exited with code ${code}`);
    console.log('⚠️  This is often due to Chrome/Puppeteer issues on Windows.');
    console.log('⚠️  Continuing build without prerendering (this is OK).');
    console.log('💡 The production site will work fine - prerendering is optional.');
    console.log('💡 If you need prerendering, ensure Chrome/Chromium is installed.');
    process.exit(0); // Exit successfully to allow build to continue
  }
});

reactSnap.on('error', (error) => {
  cleanup();
  console.error('❌ Error running react-snap:', error.message);
  console.log('⚠️  Continuing build without prerendering...');
  console.log('💡 Tip: Install Chrome/Chromium or try:');
  console.log('   npm install puppeteer --save-dev');
  process.exit(0); // Exit successfully to allow build to continue
});

// Handle process termination
process.on('SIGINT', () => {
  cleanup();
  reactSnap.kill('SIGINT');
  process.exit(1);
});

process.on('SIGTERM', () => {
  cleanup();
  reactSnap.kill('SIGTERM');
  process.exit(1);
});

