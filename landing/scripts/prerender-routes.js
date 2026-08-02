#!/usr/bin/env node

/**
 * Playwright prerender: visit each canonical route and write static HTML to dist/.
 * Replaces react-snap. Fails the build if any route cannot be prerendered.
 */

import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { getCanonicalRoutePaths } from './parse-routes.js';
import { fetchBlogPosts } from './generate-sitemap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5052;
const BASE_URL = `http://localhost:${PORT}`;
const DIST_DIR = path.join(__dirname, '../dist');
const RENDER_TIMEOUT_MS = 20000;
const SITE_ORIGIN = 'https://mrdemopro.com';

function expectedCanonical(routePath) {
  return routePath === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${routePath}`;
}

function routePathToFile(routePath) {
  if (routePath === '/') {
    return path.join(DIST_DIR, 'index.html');
  }
  const segments = routePath.replace(/^\//, '').replace(/\/$/, '');
  return path.join(DIST_DIR, segments, 'index.html');
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status >= 200 && res.status < 500) return true;
    } catch {
      // server not ready
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

function startPreviewServer() {
  return spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
    cwd: path.join(__dirname, '..'),
    shell: true,
    stdio: 'pipe',
  });
}

function stopPreviewServer(preview) {
  if (!preview?.pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${preview.pid} /T /F`, { stdio: 'ignore' });
    } else {
      preview.kill('SIGTERM');
    }
  } catch {
    preview.kill();
  }
  preview.stdout?.destroy();
  preview.stderr?.destroy();
}

async function getAllPrerenderPaths() {
  const staticPaths = getCanonicalRoutePaths();
  const posts = await fetchBlogPosts();
  const blogPaths = posts
    .filter((p) => p?.slug)
    .map((p) => `/blog/${encodeURIComponent(p.slug)}/`);
  return [...staticPaths, ...blogPaths];
}

async function prerenderRoute(page, routePath) {
  const url = `${BASE_URL}${routePath === '/' ? '/' : routePath}`;
  // Prefer load over networkidle — analytics/pixels can keep the network busy forever.
  try {
    await page.goto(url, { waitUntil: 'load', timeout: RENDER_TIMEOUT_MS });
  } catch {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: RENDER_TIMEOUT_MS });
  }
  await page.waitForSelector('#root > *', { timeout: RENDER_TIMEOUT_MS });
  // Give Helmet a beat to flush route-specific meta after hydration.
  await new Promise((resolve) => setTimeout(resolve, 250));

  const seo = await page.evaluate((expectedCanon) => {
    const descriptions = Array.from(document.querySelectorAll('meta[name="description"]'))
      .map((meta) => meta.getAttribute('content')?.trim() ?? '');
    const description = descriptions.find((value) => value.length >= 50) ?? descriptions.at(-1) ?? '';
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href')?.trim() ?? '';
    const title = document.title?.trim() ?? '';
    const rootLength = document.getElementById('root')?.innerHTML?.length ?? 0;
    return { description, canonical, title, rootLength };
  }, expectedCanonical(routePath));

  if (seo.description.length < 50) {
    throw new Error(`Missing or too-short meta description (${seo.description.length} chars)`);
  }

  if (seo.canonical !== expectedCanonical(routePath)) {
    throw new Error(`Canonical is "${seo.canonical || '(missing)'}" (expected "${expectedCanonical(routePath)}")`);
  }

  if (seo.rootLength < 200) {
    throw new Error(`#root content too short (${seo.rootLength} chars)`);
  }

  const html = await page.content();
  const outFile = routePathToFile(routePath);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, html, 'utf8');
  return outFile;
}

async function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('Prerender: dist/ not found. Run vite build first.');
    process.exit(1);
  }

  const paths = await getAllPrerenderPaths();
  console.log(`Prerender: ${paths.length} route(s) to render`);

  const preview = startPreviewServer();
  const serverUp = await waitForServer(BASE_URL);
  if (!serverUp) {
    preview.kill();
    console.error('Prerender: failed to start vite preview server');
    process.exit(1);
  }

  let browser;
  const failures = [];

  async function launchBrowser() {
    try {
      return await chromium.launch({ headless: true });
    } catch (err) {
      console.warn('Bundled Chromium unavailable, trying system Chrome:', err?.message || err);
      return chromium.launch({ headless: true, channel: 'chrome' });
    }
  }

  try {
    browser = await launchBrowser();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    });
    const page = await context.newPage();

    for (const routePath of paths) {
      try {
        const outFile = await prerenderRoute(page, routePath);
        console.log(`  OK ${routePath} -> ${path.relative(DIST_DIR, outFile)}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  FAIL ${routePath}: ${msg}`);
        failures.push({ routePath, error: msg });
      }
    }
  } finally {
    if (browser) await browser.close();
    stopPreviewServer(preview);
  }

  if (failures.length > 0) {
    console.error(`\nPrerender failed for ${failures.length} route(s). Build aborted.`);
    failures.forEach(({ routePath, error }) => console.error(`  - ${routePath}: ${error}`));
    process.exit(1);
  }

  console.log(`Prerender completed successfully (${paths.length} pages)`);
}

main().catch((err) => {
  console.error('Prerender error:', err);
  process.exit(1);
});
