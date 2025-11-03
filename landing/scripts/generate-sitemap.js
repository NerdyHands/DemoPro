#!/usr/bin/env node

/**
 * Sitemap Generator for Mr Demo Pro
 * This script generates an updated sitemap.xml file based on the current routes from App.tsx
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
 * Generate XML sitemap content
 */
function generateSitemap() {
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
  console.log('🚀 Generating sitemap for Mr Demo Pro...');
  
  const routes = getRoutesWithMetadata();
  const sitemapContent = generateSitemap();
  
  // Write to public directory (for development)
  writeSitemap(sitemapContent, OUTPUT_FILE);
  
  // Write to dist directory (for production)
  writeSitemap(sitemapContent, DIST_OUTPUT_FILE);
  
  console.log('✅ Sitemap generation completed!');
  console.log(`📊 Generated ${routes.length} URLs`);
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateSitemap };
export default main;
