#!/usr/bin/env node

/**
 * SEO Files Generator for Mr Demo Pro
 * This script generates both sitemap.xml and robots.txt files for production deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSitemap } from './generate-sitemap.js';
import { generateRobots } from './generate-robots.js';
import { getRoutesWithMetadata } from './parse-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'https://mrdemopro.com';
const PUBLIC_DIR = path.join(__dirname, '../public');
const DIST_DIR = path.join(__dirname, '../dist');

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

/**
 * Write file with error handling
 */
function writeFile(content, filePath) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ File written: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error writing ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

/**
 * Generate and validate sitemap
 */
function generateSitemapFile() {
  console.log('🗺️  Generating sitemap.xml...');
  
  const sitemapContent = generateSitemap();
  const publicSitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  const distSitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  
  const publicSuccess = writeFile(sitemapContent, publicSitemapPath);
  const distSuccess = writeFile(sitemapContent, distSitemapPath);
  
  if (publicSuccess && distSuccess) {
    const routeCount = getRoutesWithMetadata().length;
    console.log(`📊 Generated sitemap with ${routeCount} URLs`);
    return true;
  }
  return false;
}

/**
 * Generate and validate robots.txt
 */
function generateRobotsFile() {
  console.log('🤖 Generating robots.txt...');
  
  const robotsContent = generateRobots();
  const publicRobotsPath = path.join(PUBLIC_DIR, 'robots.txt');
  const distRobotsPath = path.join(DIST_DIR, 'robots.txt');
  
  const publicSuccess = writeFile(robotsContent, publicRobotsPath);
  const distSuccess = writeFile(robotsContent, distRobotsPath);
  
  if (publicSuccess && distSuccess) {
    console.log('✅ Robots.txt generated successfully');
    return true;
  }
  return false;
}

/**
 * Validate generated files
 */
function validateFiles() {
  console.log('🔍 Validating generated files...');
  
  const filesToCheck = [
    { path: path.join(PUBLIC_DIR, 'sitemap.xml'), name: 'public/sitemap.xml' },
    { path: path.join(PUBLIC_DIR, 'robots.txt'), name: 'public/robots.txt' },
    { path: path.join(DIST_DIR, 'sitemap.xml'), name: 'dist/sitemap.xml' },
    { path: path.join(DIST_DIR, 'robots.txt'), name: 'dist/robots.txt' }
  ];
  
  let allValid = true;
  
  filesToCheck.forEach(file => {
    if (fs.existsSync(file.path)) {
      const stats = fs.statSync(file.path);
      if (stats.size > 0) {
        console.log(`✅ ${file.name} - Valid (${stats.size} bytes)`);
      } else {
        console.log(`❌ ${file.name} - Empty file`);
        allValid = false;
      }
    } else {
      console.log(`❌ ${file.name} - File not found`);
      allValid = false;
    }
  });
  
  return allValid;
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Starting SEO files generation for Mr Demo Pro...');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('─'.repeat(50));
  
  // Ensure directories exist
  ensureDir(PUBLIC_DIR);
  ensureDir(DIST_DIR);
  
  // Generate files
  const sitemapSuccess = generateSitemapFile();
  const robotsSuccess = generateRobotsFile();
  
  console.log('─'.repeat(50));
  
  if (sitemapSuccess && robotsSuccess) {
    // Validate files
    const validationSuccess = validateFiles();
    
    if (validationSuccess) {
      console.log('🎉 SEO files generation completed successfully!');
      console.log('📋 Generated files:');
      console.log('   • sitemap.xml (public & dist)');
      console.log('   • robots.txt (public & dist)');
      console.log('🔗 Sitemap URL: https://mrdemopro.com/sitemap.xml');
      console.log('🔗 Robots URL: https://mrdemopro.com/robots.txt');
    } else {
      console.log('⚠️  SEO files generated but validation failed');
      process.exit(1);
    }
  } else {
    console.log('❌ SEO files generation failed');
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateSitemapFile, generateRobotsFile, validateFiles };
export default main;
