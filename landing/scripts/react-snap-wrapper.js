#!/usr/bin/env node

/**
 * Wrapper script for react-snap that handles Puppeteer errors gracefully
 * This script attempts to run react-snap but will continue if it fails
 */

import { spawn } from 'child_process';

const TIMEOUT = 120000; // 2 minutes timeout

console.log('🚀 Starting react-snap...');
console.log('Note: If this fails, the build will continue without prerendering.');

const reactSnap = spawn('npx', ['react-snap'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: 'false',
    PUPPETEER_TIMEOUT: TIMEOUT.toString()
  }
});

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
    console.error(`⚠️  react-snap exited with code ${code}`);
    console.log('⚠️  Continuing build without prerendering...');
    console.log('💡 Tip: If you need prerendering, try running:');
    console.log('   npm install puppeteer --save-dev');
    console.log('   Or set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false');
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

