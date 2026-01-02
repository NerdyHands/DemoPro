#!/usr/bin/env node

/**
 * Sitemap Generator for Mr Demo Pro
 * This script preserves manual sitemap structure and only updates dates.
 * Falls back to auto-generation if no manual sitemap exists.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRoutesWithMetadata } from './parse-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'https://mrdemopro.com';
const OUTPUT_FILE = path.join(__dirname, '../public/sitemap.xml');
const DIST_OUTPUT_FILE = path.join(__dirname, '../dist/sitemap.xml');

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Update dates in existing sitemap while preserving structure
 */
function updateSitemapDates(sitemapContent) {
  const today = getTodayDate();
  // Replace all lastmod dates with today's date
  // Matches: <lastmod>YYYY-MM-DD</lastmod>
  const updatedContent = sitemapContent.replace(
    /<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g,
    `<lastmod>${today}</lastmod>`
  );
  return updatedContent;
}

/**
 * Generate XML sitemap content (auto-generation fallback)
 */
function generateSitemapAuto() {
  // Get routes from App.tsx automatically (fresh each time)
  const routes = getRoutesWithMetadata();
  
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  routes.forEach(route => {
    const normalizedPath = route.path === '/' ? '/' : (route.path.endsWith('/') ? route.path : `${route.path}/`);
    sitemap += '  <url>\n';
    sitemap += `    <loc>${BASE_URL}${normalizedPath}</loc>\n`;
    sitemap += `    <lastmod>${route.lastmod}</lastmod>\n`;
    sitemap += `    <changefreq>${route.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${route.priority}</priority>\n`;
    sitemap += '  </url>\n';
  });
  
  sitemap += '</urlset>\n';
  
  return sitemap;
}

/**
 * Generate or update sitemap
 * Preserves manual sitemap structure and only updates dates
 */
function generateSitemap() {
  // Check if manual sitemap exists
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const existingContent = fs.readFileSync(OUTPUT_FILE, 'utf8');
      // Verify it's a valid sitemap
      if (existingContent.includes('<?xml') && existingContent.includes('<urlset')) {
        console.log('📝 Found manual sitemap, updating dates only...');
        const updatedContent = updateSitemapDates(existingContent);
        return updatedContent;
      }
    } catch (error) {
      console.warn(`⚠️  Error reading manual sitemap: ${error.message}`);
      console.log('🔄 Falling back to auto-generation...');
    }
  }
  
  // Fall back to auto-generation if no manual sitemap exists
  console.log('🔄 No manual sitemap found, generating from routes...');
  return generateSitemapAuto();
}

/**
 * Write sitemap to file
 */
function writeSitemap(content, filePath) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Sitemap written to: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error writing sitemap to ${filePath}:`, error.message);
  }
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Processing sitemap for Mr Demo Pro...');
  
  const sitemapContent = generateSitemap();
  
  // Write to public directory (for development)
  writeSitemap(sitemapContent, OUTPUT_FILE);
  
  // Write to dist directory (for production)
  writeSitemap(sitemapContent, DIST_OUTPUT_FILE);
  
  // Count URLs in the sitemap
  const urlCount = (sitemapContent.match(/<url>/g) || []).length;
  
  console.log('✅ Sitemap processing completed!');
  console.log(`📊 Processed ${urlCount} URLs`);
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateSitemap };
export default main;
