#!/usr/bin/env node

/**
 * SEO Validation Script for Mr Demo Pro
 * Validates SEO fixes and generates detailed report
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'https://mrdemopro.com';
const DIST_DIR = path.join(__dirname, '../dist');
const PUBLIC_DIR = path.join(__dirname, '../public');

/**
 * Validate sitemap structure
 */
function validateSitemap() {
  console.log('🔍 Validating sitemap...');
  
  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    return { valid: false, issues: ['Sitemap not found in dist directory'] };
  }
  
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  const issues = [];
  
  // Check for valid XML structure
  if (!sitemapContent.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
    issues.push('Missing XML declaration');
  }
  
  if (!sitemapContent.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
    issues.push('Missing urlset namespace');
  }
  
  // Check for valid URLs
  const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);
  if (urlMatches) {
    urlMatches.forEach(match => {
      const url = match.replace(/<\/?loc>/g, '');
      if (!url.startsWith(BASE_URL)) {
        issues.push(`Invalid URL in sitemap: ${url}`);
      }
    });
  }
  
  return { valid: issues.length === 0, issues };
}

/**
 * Validate robots.txt
 */
function validateRobotsTxt() {
  console.log('🔍 Validating robots.txt...');
  
  const robotsPath = path.join(DIST_DIR, 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    return { valid: false, issues: ['robots.txt not found in dist directory'] };
  }
  
  const robotsContent = fs.readFileSync(robotsPath, 'utf8');
  const issues = [];
  
  // Check for required directives
  if (!robotsContent.includes('User-agent: *')) {
    issues.push('Missing User-agent directive');
  }
  
  if (!robotsContent.includes('Allow: /')) {
    issues.push('Missing Allow directive');
  }
  
  if (!robotsContent.includes('Sitemap:')) {
    issues.push('Missing Sitemap directive');
  }
  
  return { valid: issues.length === 0, issues };
}

/**
 * Validate meta tags in HTML files
 */
function validateMetaTags() {
  console.log('🔍 Validating meta tags...');
  
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return { valid: false, issues: ['index.html not found in dist directory'] };
  }
  
  const htmlContent = fs.readFileSync(indexPath, 'utf8');
  const issues = [];
  
  // Check for basic meta tags that should be in the HTML
  const basicTags = [
    { name: 'title', pattern: /<title>.*?<\/title>/i },
    { name: 'viewport', pattern: /<meta name="viewport" content=".*?"/i }
  ];
  
  basicTags.forEach(({ name, pattern }) => {
    if (!pattern.test(htmlContent)) {
      issues.push(`Missing ${name} meta tag`);
    }
  });
  
  // Check if the app is properly set up for SEO
  if (!htmlContent.includes('id="root"')) {
    issues.push('React root element not found - app may not render properly');
  }
  
  // Check if the app has proper module loading
  if (!htmlContent.includes('type="module"')) {
    issues.push('Module loading not detected - app may not load properly');
  }
  
  return { valid: issues.length === 0, issues };
}

/**
 * Validate internal linking
 */
function validateInternalLinking() {
  console.log('🔍 Validating internal linking...');
  
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return { valid: false, issues: ['index.html not found in dist directory'] };
  }
  
  const htmlContent = fs.readFileSync(indexPath, 'utf8');
  const issues = [];
  
  // Check for internal links
  const linkMatches = htmlContent.match(/href="[^"]*"/g);
  if (linkMatches) {
    const internalLinks = linkMatches.filter(link => 
      link.includes('href="/') && !link.includes('http')
    );
    
    if (internalLinks.length < 3) {
      issues.push(`Insufficient internal links: ${internalLinks.length} found (minimum 3)`);
    }
  } else {
    issues.push('No internal links found');
  }
  
  return { valid: issues.length === 0, issues };
}

/**
 * Generate comprehensive SEO report
 */
function generateSeoReport() {
  console.log('📊 Generating SEO validation report...');
  
  const validations = [
    { name: 'Sitemap', fn: validateSitemap },
    { name: 'Robots.txt', fn: validateRobotsTxt },
    { name: 'Meta Tags', fn: validateMetaTags },
    { name: 'Internal Linking', fn: validateInternalLinking }
  ];
  
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    validations: {}
  };
  
  let totalIssues = 0;
  
  validations.forEach(({ name, fn }) => {
    const result = fn();
    report.validations[name] = result;
    totalIssues += result.issues.length;
    
    if (result.valid) {
      console.log(`✅ ${name}: Valid`);
    } else {
      console.log(`❌ ${name}: ${result.issues.length} issues`);
      result.issues.forEach(issue => console.log(`   - ${issue}`));
    }
  });
  
  // Generate report file
  const reportPath = path.join(DIST_DIR, 'seo-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📈 SEO Validation Summary:`);
  console.log(`   Total Issues: ${totalIssues}`);
  console.log(`   Report saved to: ${reportPath}`);
  
  if (totalIssues === 0) {
    console.log('🎉 All SEO validations passed!');
  } else {
    console.log('⚠️  Some SEO issues need attention.');
  }
  
  return report;
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Starting SEO validation...');
  
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Dist directory not found. Please run build first.');
    process.exit(1);
  }
  
  const report = generateSeoReport();
  
  // Exit with error code if there are issues
  const totalIssues = Object.values(report.validations)
    .reduce((sum, validation) => sum + validation.issues.length, 0);
  
  if (totalIssues > 0) {
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('seo-validation.js')) {
  main();
}

export { generateSeoReport, validateSitemap, validateRobotsTxt, validateMetaTags, validateInternalLinking };
export default main;
