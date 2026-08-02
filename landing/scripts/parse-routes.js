#!/usr/bin/env node

/**
 * Route Parser for Mr Demo Pro
 * Extracts routes from App.tsx and provides them to SEO scripts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_TSX_PATH = path.join(__dirname, '../src/App.tsx');

/** SEO keys for city / service-area landing pages (local intent cluster). */
const LOCATION_SEO_KEYS = new Set([
  'demolitionContractorHamptonVa',
  'demolitionContractorNewportNewsVa',
  'demolitionContractorNorfolkVa',
  'demolitionContractorVirginiaBeachVa',
  'demolitionContractorChesapeakeVa',
  'demolitionContractorPortsmouthVa',
  'demolitionContractorSuffolkVa',
  'serviceAreas'
]);

/**
 * Priority mapping based on route type
 */
function getPriorityForRoute(routePath, seoKey) {
  // Homepage gets highest priority
  if (routePath === '/') return '1.0';
  
  // Services page gets high priority
  if (routePath === '/services') return '0.9';

  // Location/service-area hub pages
  if (seoKey && LOCATION_SEO_KEYS.has(seoKey)) return '0.7';
  
  // Service pages get high priority
  if ([
    'shedRemoval',
    'deckRemoval',
    'fenceRemoval',
    'interiorDemo',
    'kitchenDemolition',
    'bathroomDemolition',
    'serviceGarageDemolition',
    'concreteRemoval',
    'commercialInteriorDemolition',
    'cabinetRemoval',
    'cleanout',
    'hoardingCleanout',
    'junkRemoval',
    'buildingDemolition',
    'demolitionServices',
    'concreteDemolition',
    'residentialDemolition',
    'garageDemolition',
    'commercialDemolition',
    'tenantCleanOut'
  ].includes(seoKey)) {
    return '0.8';
  }
  
  // Contact and About pages get medium-high priority
  if (routePath === '/contact' || routePath === '/about') return '0.7';
  
  // FAQs get medium priority
  if (routePath === '/faqs') return '0.6';
  
  // Thank you page gets lower priority
  if (routePath === '/thank-you') return '0.5';
  
  // Legal pages get lowest priority
  if (['/terms', '/privacy'].includes(routePath)) return '0.3';
  
  // Default priority
  return '0.6';
}

/**
 * Change frequency mapping based on route type
 */
function getChangeFreqForRoute(routePath, seoKey) {
  // Homepage changes more frequently
  if (routePath === '/') return 'weekly';

  // Location/service-area hub pages
  if (seoKey && LOCATION_SEO_KEYS.has(seoKey)) return 'monthly';
  
  // Service pages change monthly
  if ([
    'services',
    'shedRemoval',
    'deckRemoval',
    'fenceRemoval',
    'interiorDemo',
    'kitchenDemolition',
    'bathroomDemolition',
    'serviceGarageDemolition',
    'concreteRemoval',
    'commercialInteriorDemolition',
    'cabinetRemoval',
    'cleanout',
    'hoardingCleanout',
    'junkRemoval',
    'buildingDemolition',
    'demolitionServices',
    'concreteDemolition',
    'residentialDemolition',
    'garageDemolition',
    'commercialDemolition',
    'tenantCleanOut',
    'about'
  ].includes(seoKey)) {
    return 'monthly';
  }
  
  // Contact and FAQs change monthly
  if (['/contact', '/faqs'].includes(routePath)) return 'monthly';
  
  // Legal and thank you pages change rarely
  if (['/thank-you', '/terms', '/privacy'].includes(routePath)) return 'yearly';
  
  // Default
  return 'monthly';
}

/**
 * Extract SEO config key from route element
 */
function extractSeoKey(routeElement) {
  // Look for seoConfig.xxx pattern
  const seoConfigMatch = routeElement.match(/seoConfig\.(\w+)/);
  if (seoConfigMatch) {
    return seoConfigMatch[1];
  }
  
  // If no seoConfig, check for inline SEO props (like thank-you)
  return null;
}

/**
 * Parse App.tsx to extract all routes
 */
export function parseRoutesFromApp() {
  if (!fs.existsSync(APP_TSX_PATH)) {
    throw new Error(`App.tsx not found at ${APP_TSX_PATH}`);
  }
  
  const appContent = fs.readFileSync(APP_TSX_PATH, 'utf8');
  const routes = [];
  
  // Match all Route components with their paths and elements
  // Pattern: <Route path="/path" element={...} />
  const routeRegex = /<Route\s+path=["']([^"']+)["']\s+element=\{([\s\S]*?)\}\s*\/>/g;
  
  let match;
  while ((match = routeRegex.exec(appContent)) !== null) {
    const routePath = match[1];
    const routeElement = match[2];
    
    // Skip catch-all route
    if (routePath === '*') {
      continue;
    }
    
    const seoKey = extractSeoKey(routeElement);
    
    routes.push({
      path: routePath,
      seoKey: seoKey,
      routeElement,
      priority: getPriorityForRoute(routePath, seoKey),
      changefreq: getChangeFreqForRoute(routePath, seoKey),
      lastmod: new Date().toISOString().split('T')[0]
    });
  }
  
  // Sort routes: home first, then by priority descending
  routes.sort((a, b) => {
    if (a.path === '/') return -1;
    if (b.path === '/') return 1;
    return parseFloat(b.priority) - parseFloat(a.priority);
  });
  
  return routes;
}

/**
 * Get just the route paths as an array
 */
export function getRoutePaths() {
  return parseRoutesFromApp().map(route => route.path);
}

/**
 * Get route with metadata (priority, changefreq, etc.)
 */
export function getRoutesWithMetadata() {
  return parseRoutesFromApp();
}

/** Paths excluded from prerender/sitemap because they are noindex or redirect-only. */
const NO_INDEX_PATHS = new Set([
  '/terms/',
  '/privacy/',
  '/thank-you/',
  '/diy-vs-pro-demolition/thank-you/'
]);

/**
 * Canonical trailing-slash routes suitable for prerender and sitemap.
 * Excludes redirect-only paths, dynamic patterns, and noindex pages.
 */
export function getCanonicalRoutes() {
  return parseRoutesFromApp().filter((route) => {
    const { path } = route;
    if (path.includes(':') || path === '*') return false;
    if (path !== '/' && !path.endsWith('/')) return false;
    if (route.routeElement?.includes('<Navigate')) return false;
    const normalized = path === '/' ? '/' : path;
    if (NO_INDEX_PATHS.has(normalized)) return false;
    return true;
  });
}

/**
 * Canonical route paths only (e.g. "/", "/services/").
 */
export function getCanonicalRoutePaths() {
  return getCanonicalRoutes().map((route) => route.path);
}

/**
 * Generate internal linking suggestions based on route relationships
 */
export function generateInternalLinks() {
  const routes = parseRoutesFromApp();
  const internalLinks = {};
  
  routes.forEach(route => {
    const links = [];
    
    // Home page links to all service pages and main pages
    if (route.path === '/') {
      routes.forEach(r => {
        if (r.path !== '/' && r.path !== '/thank-you') {
          links.push(r.path);
        }
      });
    }
    // Service pages link to other services and main pages
    else if (
      route.seoKey &&
      [
        'services',
        'shedRemoval',
        'deckRemoval',
        'fenceRemoval',
        'interiorDemo',
        'kitchenDemolition',
        'bathroomDemolition',
        'serviceGarageDemolition',
        'concreteRemoval',
        'commercialInteriorDemolition',
        'cabinetRemoval',
        'cleanout',
        'hoardingCleanout',
        'junkRemoval',
        'buildingDemolition',
        'demolitionServices',
        'serviceAreas',
        'demolitionContractorHamptonVa',
        'demolitionContractorNewportNewsVa',
        'demolitionContractorNorfolkVa',
        'demolitionContractorVirginiaBeachVa',
        'demolitionContractorChesapeakeVa',
        'demolitionContractorPortsmouthVa',
        'demolitionContractorSuffolkVa',
        'concreteDemolition',
        'residentialDemolition',
        'garageDemolition',
        'commercialDemolition',
        'tenantCleanOut'
      ].includes(route.seoKey)
    ) {
      links.push('/');
      links.push('/services');
      links.push('/contact');
      // Link to related services
      routes.forEach(r => {
        if (
          r.seoKey &&
          r.path !== route.path &&
          [
            'shedRemoval',
            'deckRemoval',
            'fenceRemoval',
            'interiorDemo',
            'kitchenDemolition',
            'bathroomDemolition',
            'serviceGarageDemolition',
            'concreteRemoval',
            'commercialInteriorDemolition',
            'cabinetRemoval',
            'cleanout',
            'hoardingCleanout',
            'junkRemoval',
            'buildingDemolition',
            'demolitionServices',
            'serviceAreas',
            'demolitionContractorHamptonVa',
            'demolitionContractorNewportNewsVa',
            'demolitionContractorNorfolkVa',
            'demolitionContractorVirginiaBeachVa',
            'demolitionContractorChesapeakeVa',
            'demolitionContractorPortsmouthVa',
            'demolitionContractorSuffolkVa',
            'concreteDemolition',
            'residentialDemolition',
            'garageDemolition',
            'commercialDemolition',
            'tenantCleanOut'
          ].includes(r.seoKey)
        ) {
          links.push(r.path);
        }
      });
    }
    // Contact page links to services and home
    else if (route.path === '/contact') {
      links.push('/');
      links.push('/services');
      routes.forEach(r => {
        if (r.seoKey && ['shedRemoval', 'deckRemoval', 'fenceRemoval'].includes(r.seoKey)) {
          links.push(r.path);
        }
      });
    }
    // FAQs link to main pages
    else if (route.path === '/faqs') {
      links.push('/');
      links.push('/services');
      links.push('/contact');
    }
    // Thank you links to services and home
    else if (route.path === '/thank-you') {
      links.push('/');
      links.push('/services');
    }
    // Legal pages link to each other and home
    else if (['/terms', '/privacy'].includes(route.path)) {
      links.push('/');
      if (route.path === '/terms') {
        links.push('/privacy');
      } else {
        links.push('/terms');
      }
    }
    
    internalLinks[route.path] = links;
  });
  
  return internalLinks;
}

// Run as standalone script
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` || (process.argv[1] && process.argv[1].endsWith('parse-routes.js'))) {
  try {
    const routes = parseRoutesFromApp();
    console.log('🚀 Extracted routes from App.tsx:');
    console.log('─'.repeat(50));
    routes.forEach(route => {
      console.log(`  ${route.path.padEnd(20)} | SEO: ${route.seoKey || 'N/A'.padEnd(15)} | Priority: ${route.priority} | ChangeFreq: ${route.changefreq}`);
    });
    console.log('─'.repeat(50));
    console.log(`✅ Found ${routes.length} routes`);
  } catch (error) {
    console.error('❌ Error parsing routes:', error.message);
    process.exit(1);
  }
}

export default parseRoutesFromApp;
