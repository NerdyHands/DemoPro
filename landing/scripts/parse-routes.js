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

/** SEO keys for city landing pages (not the service-area hub). */
const CITY_SEO_KEYS = new Set([
  'demolitionContractorHamptonVa',
  'demolitionContractorNewportNewsVa',
  'demolitionContractorNorfolkVa',
  'demolitionContractorVirginiaBeachVa',
  'demolitionContractorChesapeakeVa',
  'demolitionContractorPortsmouthVa',
  'demolitionContractorSuffolkVa'
]);

/** Nested service leaf SEO keys under /services/ */
const SERVICE_LEAF_SEO_KEYS = new Set([
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
  'houseDemolition',
  'constructionDebrisRemoval'
]);

/** Flat category / overview service pages at root */
const CATEGORY_SERVICE_SEO_KEYS = new Set([
  'buildingDemolition',
  'demolitionServices',
  'concreteDemolition',
  'residentialDemolition',
  'garageDemolition',
  'commercialDemolition',
  'tenantCleanOut',
  'propertyManagers',
  'contractors'
]);

/** Normalize path for priority/changefreq matching (strip trailing slash except home). */
function normalizeRoutePath(routePath) {
  if (!routePath || routePath === '/') return '/';
  return routePath.endsWith('/') ? routePath.slice(0, -1) : routePath;
}

/**
 * Priority mapping based on site hierarchy:
 * home 1.0 → hubs 0.9 → service leaves / core 0.8 → cities / company 0.7 → FAQs 0.7 → legal 0.3
 */
function isNestedCityPath(path) {
  // /service-area/{city}-va (hub itself is /service-area)
  return path.startsWith('/service-area/') && path !== '/service-area';
}

function getPriorityForRoute(routePath, seoKey) {
  const path = normalizeRoutePath(routePath);

  if (path === '/') return '1.0';

  // Section hubs
  if (
    path === '/services' ||
    path === '/service-area' ||
    path === '/blog' ||
    seoKey === 'services' ||
    seoKey === 'serviceAreas'
  ) {
    return '0.9';
  }

  // Core commercial pages
  if (
    path === '/prices' ||
    path === '/demolition-cost-virginia' ||
    seoKey === 'demolitionCostVirginia'
  ) {
    return '0.8';
  }

  // Nested service leaves (/services/...)
  if (path.startsWith('/services/') || (seoKey && SERVICE_LEAF_SEO_KEYS.has(seoKey))) {
    return '0.8';
  }

  // Flat category service pages
  if (seoKey && CATEGORY_SERVICE_SEO_KEYS.has(seoKey)) return '0.8';

  // Nested city leaves under /service-area/{city}-va
  if (isNestedCityPath(path) || (seoKey && CITY_SEO_KEYS.has(seoKey))) {
    return '0.7';
  }

  // Company
  if (path === '/contact' || path === '/about') return '0.7';

  // FAQs
  if (path === '/faqs') return '0.7';

  // Thank you
  if (path === '/thank-you' || path === '/diy-vs-pro-demolition/thank-you') {
    return '0.5';
  }

  // Legal
  if (path === '/terms' || path === '/privacy') return '0.3';

  // DIY quiz landing
  if (path === '/diy-vs-pro-demolition') return '0.6';

  return '0.6';
}

/**
 * Change frequency mapping based on site hierarchy
 */
function getChangeFreqForRoute(routePath, seoKey) {
  const path = normalizeRoutePath(routePath);

  if (path === '/') return 'weekly';

  if (path === '/blog') return 'weekly';

  if (
    path === '/services' ||
    path === '/service-area' ||
    seoKey === 'services' ||
    seoKey === 'serviceAreas'
  ) {
    return 'monthly';
  }

  if (isNestedCityPath(path) || (seoKey && CITY_SEO_KEYS.has(seoKey))) {
    return 'monthly';
  }

  if (
    path.startsWith('/services/') ||
    (seoKey && SERVICE_LEAF_SEO_KEYS.has(seoKey)) ||
    (seoKey && CATEGORY_SERVICE_SEO_KEYS.has(seoKey))
  ) {
    return 'monthly';
  }

  if (
    path === '/contact' ||
    path === '/about' ||
    path === '/faqs' ||
    path === '/prices' ||
    path === '/demolition-cost-virginia'
  ) {
    return 'monthly';
  }

  if (
    path === '/thank-you' ||
    path === '/diy-vs-pro-demolition/thank-you' ||
    path === '/terms' ||
    path === '/privacy'
  ) {
    return 'yearly';
  }

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

/** Paths excluded from sitemap (noindex). Thank-you routes are still prerendered. */
const NO_INDEX_PATHS = new Set([
  '/thank-you/',
  '/diy-vs-pro-demolition/thank-you/'
]);

/** Noindex routes that must still be prerendered so hosting returns 200, not 404. */
const PRERENDER_ONLY_PATHS = [
  '/thank-you/',
  '/diy-vs-pro-demolition/thank-you/'
];

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
 * Canonical indexable routes plus noindex pages that still need a static HTML file.
 */
export function getPrerenderRoutePaths() {
  return [...getCanonicalRoutePaths(), ...PRERENDER_ONLY_PATHS];
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
        'houseDemolition',
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
