#!/usr/bin/env node

/**
 * Write static HTML for legacy paths that Amplify currently 404s.
 * Netlify-style public/_redirects is not applied by Amplify Hosting, and
 * client-only <Navigate> routes have no dist/<path>/index.html file.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '../dist');
const SITE_ORIGIN = 'https://mrdemopro.com';

const LEGACY_REDIRECTS = [
  ['/garage-demolition/', '/services/garage-demolition/'],
  ['/deck-removal/', '/services/deck-removal/'],
  ['/shed-removal/', '/services/shed-removal/'],
  ['/fence-removal/', '/services/fence-removal/'],
  ['/interior-demo/', '/services/interior-demo/'],
  ['/junk-removal/', '/services/junk-removal/'],
  ['/cleanout/', '/services/cleanout/'],
  ['/services/cleanout-services/', '/services/cleanout/'],
  ['/services/cabinet-removal/', '/services/kitchen-demolition/'],
  ['/cabinet-removal/', '/services/kitchen-demolition/'],
  ['/blog/tag/', '/blog/'],
  ['/demolition-contractor-hampton-va/', '/service-area/hampton-va/'],
  ['/demolition-contractor-newport-news-va/', '/service-area/newport-news-va/'],
  ['/demolition-contractor-norfolk-va/', '/service-area/norfolk-va/'],
  ['/demolition-contractor-virginia-beach-va/', '/service-area/virginia-beach-va/'],
  ['/demolition-contractor-chesapeake-va/', '/service-area/chesapeake-va/'],
  ['/demolition-contractor-portsmouth-va/', '/service-area/portsmouth-va/'],
  ['/demolition-contractor-suffolk-va/', '/service-area/suffolk-va/']
];

function redirectHtml(toPath) {
  const dest = `${SITE_ORIGIN}${toPath}`;
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Redirecting…</title>
    <link rel="canonical" href="${dest}" />
    <meta http-equiv="refresh" content="0;url=${toPath}" />
    <script>location.replace(${JSON.stringify(toPath)});</script>
  </head>
  <body>
    <p>This page has moved to <a href="${toPath}">${dest}</a>.</p>
  </body>
</html>
`;
}

function routePathToFile(routePath) {
  const segments = routePath.replace(/^\//, '').replace(/\/$/, '');
  return path.join(DIST_DIR, segments, 'index.html');
}

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('Legacy redirects: dist/ not found. Run vite build first.');
    process.exit(1);
  }

  for (const [fromPath, toPath] of LEGACY_REDIRECTS) {
    const outFile = routePathToFile(fromPath);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, redirectHtml(toPath), 'utf8');
    console.log(`  ${fromPath} -> ${toPath}`);
  }

  console.log(`Legacy redirects: wrote ${LEGACY_REDIRECTS.length} HTML file(s).`);
}

main();
