#!/usr/bin/env node

/**
 * Cross-platform environment file copy script
 * Usage: node scripts/copy-env.js <source> <destination>
 */

const fs = require('fs');
const path = require('path');

const source = process.argv[2];
const destination = process.argv[3];

if (!source || !destination) {
  console.error('Usage: node scripts/copy-env.js <source> <destination>');
  process.exit(1);
}

const sourcePath = path.resolve(__dirname, '..', source);
const destPath = path.resolve(__dirname, '..', destination);

try {
  if (!fs.existsSync(sourcePath)) {
    console.error(`Error: Source file ${sourcePath} does not exist`);
    process.exit(1);
  }

  fs.copyFileSync(sourcePath, destPath);
  console.log(`✓ Copied ${source} to ${destination}`);
} catch (error) {
  console.error(`Error copying file: ${error.message}`);
  process.exit(1);
}
