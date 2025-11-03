#!/usr/bin/env node

/**
 * Robots.txt Generator for Mr Demo Pro
 * This script generates an updated robots.txt file for SEO optimization
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'https://mrdemopro.com';
const OUTPUT_FILE = path.join(__dirname, '../public/robots.txt');
const DIST_OUTPUT_FILE = path.join(__dirname, '../dist/robots.txt');

/**
 * Generate robots.txt content
 */
function generateRobots() {
  let robots = 'User-agent: *\n';
  robots += 'Allow: /\n\n';
  
  // Sitemap reference
  robots += '# Sitemap\n';
  robots += `Sitemap: ${BASE_URL}/sitemap.xml\n\n`;
  
  // Disallow admin or private areas (if any)
  robots += '# Disallow admin or private areas (if any)\n';
  robots += '# Disallow: /admin/\n';
  robots += '# Disallow: /private/\n\n';
  
  // Allow all search engines to crawl the site
  robots += '# Allow all search engines to crawl the site\n';
  robots += 'Crawl-delay: 1\n\n';
  
  // Additional SEO directives
  robots += '# Additional SEO directives\n';
  robots += 'Disallow: /api/\n';
  robots += 'Disallow: /_next/\n';
  robots += 'Disallow: /static/\n\n';
  
  // Host directive (helps with duplicate content issues)
  robots += `# Host directive\n`;
  robots += `Host: ${BASE_URL}\n`;
  
  return robots;
}

/**
 * Write robots.txt to file
 */
function writeRobots(content, filePath) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Robots.txt written to: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error writing robots.txt to ${filePath}:`, error.message);
  }
}

/**
 * Main function
 */
function main() {
  console.log('🤖 Generating robots.txt for Mr Demo Pro...');
  
  const robotsContent = generateRobots();
  
  // Write to public directory (for development)
  writeRobots(robotsContent, OUTPUT_FILE);
  
  // Write to dist directory (for production)
  writeRobots(robotsContent, DIST_OUTPUT_FILE);
  
  console.log('✅ Robots.txt generation completed!');
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateRobots };
export default main;
