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
  
  const filesToCopy = ['sitemap.xml', 'robots.txt', 'site.webmanifest'];
  let allSuccess = true;
  
  filesToCopy.forEach(fileName => {
    const success = copyFile(fileName);
    if (!success) {
      allSuccess = false;
    }
  });

  // Standalone 404 shell for Amplify/CloudFront custom error documents.
  // Prevents missing routes from advertising homepage title/canonical/og:url.
  try {
    const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>404 - Page Not Found | Mr Demo Pro</title>
    <meta name="description" content="The page you're looking for doesn't exist. Explore our demolition services or contact us for assistance." />
    <meta name="robots" content="noindex,follow" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="404 - Page Not Found | Mr Demo Pro" />
    <meta property="og:description" content="The page you're looking for doesn't exist. Explore our demolition services or contact us for assistance." />
    <meta property="og:site_name" content="Mr Demo Pro" />
  </head>
  <body>
    <main style="font-family: system-ui, sans-serif; text-align: center; padding: 4rem 1rem;">
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <p>
        <a href="/">Go Home</a> ·
        <a href="/blog/">View Blog</a> ·
        <a href="/services/">View Services</a>
      </p>
    </main>
  </body>
</html>
`;
    fs.writeFileSync(path.join(DIST_DIR, '404.html'), notFoundHtml, 'utf8');
    console.log('✅ Wrote dist/404.html (noindex; no homepage canonical/og:url)');
  } catch (error) {
    console.warn(`⚠️  Could not write dist/404.html: ${error.message}`);
    allSuccess = false;
  }
  
  console.log('─'.repeat(50));
  
  if (allSuccess) {
    console.log('🎉 Post-build SEO files copy completed successfully!');
  } else {
    console.log('⚠️  Some SEO files may be missing in dist/');
    // Don't exit with error - this is a warning, not a critical failure
  }
}

// Always run when invoked via `node scripts/postbuild-seo.js` (Windows-safe).
main();

export { copyFile };
export default main;
