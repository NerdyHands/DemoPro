#!/usr/bin/env node

/**
 * SEO Audit and Fix Script for Mr Demo Pro
 * Automatically fixes common SEO issues during build process
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRoutePaths, generateInternalLinks } from './parse-routes.js';
import { generateSitemap } from './generate-sitemap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'https://mrdemopro.com';
const SRC_DIR = path.join(__dirname, '../src');
const PUBLIC_DIR = path.join(__dirname, '../public');
const DIST_DIR = path.join(__dirname, '../dist');

// Get valid routes from App.tsx automatically
const VALID_ROUTES = getRoutePaths();

// Get internal linking structure from route parser
const INTERNAL_LINKS = generateInternalLinks();

/**
 * Fix sitemap redirects and 4XX issues
 */
function fixSitemapIssues() {
  console.log('🔧 Fixing sitemap redirects and 4XX issues...');
  
  // Regenerate sitemap instead of trying to fix a broken one
  const sitemapContent = generateSitemap();
  
  const sitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  const distSitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  
  // Write regenerated sitemap
  fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
  if (fs.existsSync(DIST_DIR)) {
    fs.writeFileSync(distSitemapPath, sitemapContent, 'utf8');
  }
  
  console.log('✅ Sitemap regenerated successfully');
  return true;
}

/**
 * Add 404 error handling to App.tsx
 */
function add404ErrorHandling() {
  console.log('🔧 Adding 404 error handling...');
  
  const appPath = path.join(SRC_DIR, 'App.tsx');
  let appContent = fs.readFileSync(appPath, 'utf8');
  
  // Check if 404 route already exists
  if (appContent.includes('path="*"')) {
    console.log('✅ 404 route already exists');
    return true;
  }
  
  // Add 404 route before closing Routes tag
  const routesEndIndex = appContent.lastIndexOf('</Routes>');
  if (routesEndIndex === -1) {
    console.error('❌ Could not find Routes closing tag');
    return false;
  }
  
  const route404 = `            <Route path="*" element={
              <>
                <SEO 
                  title="Page Not Found - Mr Demo Pro"
                  description="The page you're looking for doesn't exist. Explore our demolition services or contact us for assistance."
                  keywords="page not found, 404, demolition services, Mr Demo Pro"
                />
                <div style={{ paddingTop: '100px', minHeight: '50vh', textAlign: 'center' }}>
                  <Container>
                    <h1 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>404 - Page Not Found</h1>
                    <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
                      The page you're looking for doesn't exist.
                    </p>
                    <div>
                      <Link to="/" className="btn btn-primary me-3">
                        Go Home
                      </Link>
                      <Link to="/services" className="btn btn-outline-primary">
                        View Services
                      </Link>
                    </div>
                  </Container>
                </div>
              </>
            } />
`;
  
  appContent = appContent.slice(0, routesEndIndex) + route404 + '\n          ' + appContent.slice(routesEndIndex);
  
  // Add Link import if not present
  if (!appContent.includes('import { Link }')) {
    const importIndex = appContent.indexOf('import { Routes, Route }');
    const importLine = "import { Routes, Route, Link } from 'react-router-dom';\n";
    appContent = appContent.slice(0, importIndex) + importLine + appContent.slice(importIndex + 30);
  }
  
  // Add Container import if not present
  if (!appContent.includes('import { Container }')) {
    const importIndex = appContent.indexOf("import './App.css';");
    const importLine = "import { Container } from 'react-bootstrap';\n";
    appContent = appContent.slice(0, importIndex) + importLine + appContent.slice(importIndex);
  }
  
  fs.writeFileSync(appPath, appContent, 'utf8');
  console.log('✅ 404 error handling added');
  return true;
}

/**
 * Fix Open Graph tags and meta descriptions
 */
function fixMetaTags() {
  console.log('🔧 Fixing Open Graph tags and meta descriptions...');
  
  const seoConfigPath = path.join(SRC_DIR, 'config', 'seoConfig.ts');
  let seoConfig = fs.readFileSync(seoConfigPath, 'utf8');
  
  // Fix meta descriptions that are too short
  const shortDescriptions = [
    { key: 'terms', minLength: 120 },
    { key: 'privacy', minLength: 120 }
  ];
  
  shortDescriptions.forEach(({ key, minLength }) => {
    const regex = new RegExp(`(${key}:\\s*{[^}]*description:\\s*"[^"]{1,${minLength - 1}}"[^}]*})`, 's');
    const match = seoConfig.match(regex);
    
    if (match) {
      const currentDesc = match[1].match(/description:\s*"([^"]+)"/);
      if (currentDesc && currentDesc[1].length < minLength) {
        const newDesc = `${currentDesc[1]} Professional demolition services in Hampton Roads, VA. Expert shed removal, deck removal, and fence removal. Free estimates. Call 757-848-4559.`;
        seoConfig = seoConfig.replace(
          /description:\s*"[^"]+"/,
          `description: "${newDesc}"`
        );
        console.log(`✅ Fixed short description for ${key}`);
      }
    }
  });
  
  // Add missing Open Graph properties
  const ogProperties = [
    'og:image:width',
    'og:image:height',
    'og:image:alt',
    'og:updated_time'
  ];
  
  // Update SEO component to include missing OG properties
  const seoComponentPath = path.join(SRC_DIR, 'components', 'SEO.tsx');
  let seoComponent = fs.readFileSync(seoComponentPath, 'utf8');
  
  // Add missing OG properties
  const ogImageSection = `      <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : \`https://mrdemopro.com\${ogImage}\`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:updated_time" content={new Date().toISOString()} />`;
  
  if (!seoComponent.includes('og:image:width')) {
    seoComponent = seoComponent.replace(
      /<meta property="og:image" content={[^}]+} \/>/,
      ogImageSection
    );
    console.log('✅ Added missing Open Graph properties');
  }
  
  fs.writeFileSync(seoConfigPath, seoConfig, 'utf8');
  fs.writeFileSync(seoComponentPath, seoComponent, 'utf8');
  
  console.log('✅ Meta tags fixed');
  return true;
}

/**
 * Add canonical tags to prevent duplicate content
 */
function addCanonicalTags() {
  console.log('🔧 Adding canonical tags...');
  
  const seoConfigPath = path.join(SRC_DIR, 'config', 'seoConfig.ts');
  let seoConfig = fs.readFileSync(seoConfigPath, 'utf8');
  
  // Ensure all pages have canonical URLs
  const pagesWithoutCanonical = ['terms', 'privacy'];
  
  pagesWithoutCanonical.forEach(page => {
    if (!seoConfig.includes(`${page}: {`)) return;
    
    const pageConfig = seoConfig.match(new RegExp(`${page}:\\s*{([^}]+)}`, 's'));
    if (pageConfig && !pageConfig[1].includes('canonicalUrl')) {
      const canonicalUrl = `https://mrdemopro.com/${page}`;
      const replacement = pageConfig[1].replace(
        /(title:\s*"[^"]+",\s*description:\s*"[^"]+",\s*keywords:\s*"[^"]+"),/,
        `$1,\n    canonicalUrl: "${canonicalUrl}",`
      );
      seoConfig = seoConfig.replace(pageConfig[1], replacement);
      console.log(`✅ Added canonical URL for ${page}`);
    }
  });
  
  fs.writeFileSync(seoConfigPath, seoConfig, 'utf8');
  console.log('✅ Canonical tags added');
  return true;
}

/**
 * Add internal linking to pages
 */
function addInternalLinking() {
  console.log('🔧 Adding internal linking...');
  
  // Update Footer to include more service links
  const footerPath = path.join(SRC_DIR, 'components', 'Footer.tsx');
  let footerContent = fs.readFileSync(footerPath, 'utf8');
  
  // Add service links section to footer
  const serviceLinksSection = `
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link 
                    to="/services" 
                    style={{ 
                      color: '#fff', 
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#ffd700'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#fff'}
                  >
                    Our Services
                  </Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link 
                    to="/contact" 
                    style={{ 
                      color: '#fff', 
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#ffd700'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#fff'}
                  >
                    Contact Us
                  </Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link 
                    to="/faqs" 
                    style={{ 
                      color: '#fff', 
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#ffd700'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#fff'}
                  >
                    FAQs
                  </Link>
                </li>`;
  
  // Insert service links before Terms and Conditions
  if (!footerContent.includes('Our Services')) {
    footerContent = footerContent.replace(
      /<li style={{ marginBottom: '0.5rem' }}>\s*<Link[^>]*to="\/terms"[^>]*>[\s\S]*?<\/Link>\s*<\/li>/,
      serviceLinksSection + '\n                <li style={{ marginBottom: \'0.5rem\' }}>\n                  <Link \n                    to="/terms" \n                    style={{ \n                      color: \'#fff\', \n                      textDecoration: \'none\',\n                      transition: \'color 0.3s ease\',\n                      fontSize: \'0.95rem\'\n                    }}\n                    onMouseEnter={(e) => (e.target as HTMLElement).style.color = \'#ffd700\'}\n                    onMouseLeave={(e) => (e.target as HTMLElement).style.color = \'#fff\'}\n                  >\n                    Terms and Conditions\n                  </Link>\n                </li>'
    );
    fs.writeFileSync(footerPath, footerContent, 'utf8');
    console.log('✅ Added internal links to footer');
  }
  
  console.log('✅ Internal linking improved');
  return true;
}

/**
 * Generate robots.txt with proper directives
 */
function generateRobotsTxt() {
  console.log('🔧 Generating robots.txt...');
  
  const robotsContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml

# Disallow admin or private areas
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Allow all search engines to crawl the site
Crawl-delay: 1

# Host directive
Host: ${BASE_URL}`;

  const robotsPath = path.join(PUBLIC_DIR, 'robots.txt');
  const distRobotsPath = path.join(DIST_DIR, 'robots.txt');
  
  fs.writeFileSync(robotsPath, robotsContent, 'utf8');
  if (fs.existsSync(DIST_DIR)) {
    fs.writeFileSync(distRobotsPath, robotsContent, 'utf8');
  }
  
  console.log('✅ robots.txt generated');
  return true;
}

/**
 * Main function to run all fixes
 */
function main() {
  console.log('🚀 Starting SEO audit and fix process...');
  
  const fixes = [
    { name: 'Sitemap Issues', fn: fixSitemapIssues },
    { name: '404 Error Handling', fn: add404ErrorHandling },
    { name: 'Meta Tags', fn: fixMetaTags },
    { name: 'Canonical Tags', fn: addCanonicalTags },
    { name: 'Internal Linking', fn: addInternalLinking },
    { name: 'Robots.txt', fn: generateRobotsTxt }
  ];
  
  let successCount = 0;
  
  fixes.forEach(({ name, fn }, index) => {
    try {
      console.log(`\n🔧 Running ${name}...`);
      if (fn()) {
        successCount++;
        console.log(`✅ ${name} completed successfully`);
      } else {
        console.log(`⚠️  ${name} completed with warnings`);
      }
    } catch (error) {
      console.error(`❌ Error in ${name}:`, error.message);
      console.error(error.stack);
    }
  });
  
  console.log(`\n🎉 SEO fixes completed! ${successCount}/${fixes.length} fixes applied successfully.`);
  
  if (successCount === fixes.length) {
    console.log('✅ All SEO issues should now be resolved!');
  } else {
    console.log('⚠️  Some fixes may need manual attention.');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('seo-audit-fix.js')) {
  main();
}

export { main as runSeoAuditFix };
export default main;
