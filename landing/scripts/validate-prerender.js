#!/usr/bin/env node

/**
 * Validates prerendered HTML files in dist/ contain route-specific SEO and body content.
 * Fails the build if any expected page is missing, empty, or still serving homepage metadata.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCanonicalRoutePaths } from './parse-routes.js';
import { fetchBlogPostsFromS3 } from './generate-sitemap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');
const SITE_ORIGIN = 'https://mrdemopro.com';
const HOME_CANONICAL = `${SITE_ORIGIN}/`;

function routePathToFile(routePath) {
  if (routePath === '/') {
    return path.join(DIST_DIR, 'index.html');
  }
  const segments = routePath.replace(/^\//, '').replace(/\/$/, '');
  return path.join(DIST_DIR, segments, 'index.html');
}

function expectedCanonical(routePath) {
  return routePath === '/' ? HOME_CANONICAL : `${SITE_ORIGIN}${routePath}`;
}

function extractTitle(html) {
  const helmetMatch = html.match(/<title[^>]*data-rh="true"[^>]*>([^<]*)<\/title>/i)
    || html.match(/<title>([^<]*)<\/title>/i);
  return helmetMatch?.[1]?.trim() ?? '';
}

function extractDescription(html) {
  const helmetMatches = [
    ...html.matchAll(
      /<meta[^>]+name=["']description["'][^>]+content="([^"]*)"[^>]*data-rh="true"/gi
    ),
    ...html.matchAll(
      /<meta[^>]+content="([^"]*)"[^>]+name=["']description["'][^>]*data-rh="true"/gi
    ),
  ];
  const helmetDesc = helmetMatches.map((match) => match[1]?.trim() ?? '').find((value) => value.length > 0);
  if (helmetDesc) return helmetDesc;

  const fallbackMatches = [
    ...html.matchAll(/<meta[^>]+name=["']description["'][^>]+content="([^"]*)"/gi),
    ...html.matchAll(/<meta[^>]+content="([^"]*)"[^>]+name=["']description["']/gi),
  ];
  return fallbackMatches.map((match) => match[1]?.trim() ?? '').find((value) => value.length > 0) ?? '';
}

function extractCanonical(html) {
  const helmetMatch = html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["'][^>]*data-rh="true"/i
  ) || html.match(
    /<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["'][^>]*data-rh="true"/i
  );
  if (helmetMatch?.[1]) return helmetMatch[1].trim();

  const fallback = html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i
  ) || html.match(
    /<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i
  );
  return fallback?.[1]?.trim() ?? '';
}

function validateHtmlFile(filePath, routePath, homeHtml) {
  const issues = [];

  if (!fs.existsSync(filePath)) {
    return [`File not found: ${path.relative(DIST_DIR, filePath)}`];
  }

  const html = fs.readFileSync(filePath, 'utf8');

  if (routePath !== '/' && homeHtml && html === homeHtml) {
    issues.push('HTML is byte-identical to homepage (SPA fallback leak)');
  }

  const title = extractTitle(html);
  if (!title) {
    issues.push('title missing');
  }

  const desc = extractDescription(html);
  if (desc.length < 50) {
    issues.push(`meta description missing or too short (${desc.length} chars)`);
  }

  const canonical = extractCanonical(html);
  const expected = expectedCanonical(routePath);
  if (!canonical) {
    issues.push('canonical link missing');
  } else if (canonical !== expected) {
    issues.push(`canonical is "${canonical}" (expected "${expected}")`);
  }

  if (routePath !== '/' && canonical === HOME_CANONICAL) {
    issues.push('canonical still points to homepage');
  }

  const rootMatch = html.match(/<div\s+id=["']root["'][^>]*>([\s\S]*?)<\/div>/i);
  const rootContent = rootMatch?.[1]?.replace(/\s/g, '') ?? '';
  if (rootContent.length < 100) {
    issues.push('#root is empty or too short');
  }

  return issues;
}

async function getAllPrerenderPaths() {
  const staticPaths = getCanonicalRoutePaths();
  const posts = await fetchBlogPostsFromS3();
  const blogPaths = posts
    .filter((p) => p?.slug)
    .map((p) => `/blog/${encodeURIComponent(p.slug)}/`);
  return [...staticPaths, ...blogPaths];
}

async function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('Validate prerender: dist/ not found.');
    process.exit(1);
  }

  const paths = await getAllPrerenderPaths();
  const failures = [];
  const homeFile = routePathToFile('/');
  const homeHtml = fs.existsSync(homeFile) ? fs.readFileSync(homeFile, 'utf8') : null;

  console.log(`Validate prerender: checking ${paths.length} HTML file(s)`);

  for (const routePath of paths) {
    const filePath = routePathToFile(routePath);
    const issues = validateHtmlFile(filePath, routePath, homeHtml);
    if (issues.length > 0) {
      failures.push({ routePath, issues });
      console.error(`  FAIL ${routePath}:`);
      issues.forEach((i) => console.error(`    - ${i}`));
    } else {
      console.log(`  OK ${routePath}`);
    }
  }

  if (failures.length > 0) {
    console.error(`\nPrerender validation failed for ${failures.length} page(s).`);
    process.exit(1);
  }

  console.log('Prerender validation passed.');
}

main().catch((err) => {
  console.error('Validate prerender error:', err);
  process.exit(1);
});
