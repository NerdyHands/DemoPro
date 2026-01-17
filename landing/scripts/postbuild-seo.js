#!/usr/bin/env node

/**
 * Post-Build SEO Files Copy Script for Mr Demo Pro
 * Ensures sitemap.xml and robots.txt are in dist/ after vite build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PUBLIC_DIR = path.join(__dirname, '../public');
const DIST_DIR = path.join(__dirname, '../dist');

/**
 * Copy file from public to dist
 */
function copyFile(fileName) {
  const sourcePath = path.join(PUBLIC_DIR, fileName);
  const destPath = path.join(DIST_DIR, fileName);
  
  if (!fs.existsSync(sourcePath)) {
    console.warn(`⚠️  ${fileName} not found in public/ directory`);
    return false;
  }
  
  try {
    // Ensure dist directory exists
    if (!fs.existsSync(DIST_DIR)) {
      fs.mkdirSync(DIST_DIR, { recursive: true });
      console.log(`📁 Created dist directory`);
    }
    
    // Copy file
    fs.copyFileSync(sourcePath, destPath);
    const stats = fs.statSync(destPath);
    console.log(`✅ Copied ${fileName} to dist/ (${stats.size} bytes)`);
    return true;
  } catch (error) {
    console.error(`❌ Error copying ${fileName}:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Post-build: Ensuring SEO files are in dist/...');
  console.log('─'.repeat(50));
  
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Dist directory not found. Vite build may have failed.');
    process.exit(1);
  }
  
  const filesToCopy = ['sitemap.xml', 'robots.txt'];
  let allSuccess = true;
  
  filesToCopy.forEach(fileName => {
    const success = copyFile(fileName);
    if (!success) {
      allSuccess = false;
    }
  });
  
  console.log('─'.repeat(50));
  
  if (allSuccess) {
    console.log('🎉 Post-build SEO files copy completed successfully!');
  } else {
    console.log('⚠️  Some SEO files may be missing in dist/');
    // Don't exit with error - this is a warning, not a critical failure
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { copyFile };
export default main;
