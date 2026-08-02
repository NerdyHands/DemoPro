// Lightweight HTTP status audit for built site
// - Reads URLs from dist/sitemap.xml (only checks URLs that are in the sitemap)
// - Starts vite preview on a fixed port and requests each sitemap URL
// - Marks 301/302 as intentional based on a simple allowlist

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { exec, execSync } from 'node:child_process'
import http from 'node:http'
import https from 'node:https'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = 5051
const BASE_URL = `http://localhost:${PORT}`
const SITEMAP_PATH = join(__dirname, '../dist/sitemap.xml')
const REPORT_PATH = 'dist/http-status-report.json'
const REPORT_TXT_PATH = 'dist/http-status-report.txt'
const SITE_ORIGIN = 'https://mrdemopro.com'

function expectedCanonical(pathname) {
  return pathname === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${pathname}`
}

/**
 * Extract URL paths from dist/sitemap.xml. Returns paths like "/", "/blog/", "/blog/slug/".
 */
function readPathsFromSitemap() {
  if (!existsSync(SITEMAP_PATH)) {
    console.error('HTTP Status Audit: dist/sitemap.xml not found. Run the build first (npm run build).')
    process.exit(1)
  }
  const xml = readFileSync(SITEMAP_PATH, 'utf8')
  const locRegex = /<loc>(.*?)<\/loc>/g
  const paths = []
  let match
  while ((match = locRegex.exec(xml)) !== null) {
    const fullUrl = match[1].trim()
    try {
      const u = new URL(fullUrl)
      const path = u.pathname || '/'
      paths.push(path.endsWith('/') || path === '/' ? path : `${path}/`)
    } catch {
      // skip malformed URL
    }
  }
  if (paths.length === 0) {
    console.error('HTTP Status Audit: no <loc> URLs found in dist/sitemap.xml')
    process.exit(1)
  }
  return paths
}

// Configure intentional redirects here (source path -> true)
// Example: { '/old-services': true }
const INTENTIONAL_REDIRECTS = new Set([
  // Add known/expected redirects here if any
])

function requestOnce(url, { collectBody = false } = {}) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http
    const req = client.request(url, { method: 'GET' }, (res) => {
      // Do not follow redirects; capture status and location
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => {
        const body = collectBody ? Buffer.concat(chunks).toString('utf8') : ''
        resolve({
          status: res.statusCode || 0,
          location: res.headers.location || null,
          body,
        })
      })
    })
    req.on('error', () => resolve({ status: 0, location: null, body: '' }))
    req.end()
  })
}

function validateHtmlContent(html, path) {
  const issues = []
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content="([^"]*)"[^>]*data-rh="true"/i)
    || html.match(/<meta[^>]+content="([^"]*)"[^>]+name=["']description["'][^>]*data-rh="true"/i)
    || html.match(/<meta[^>]+name=["']description["'][^>]+content="([^"]*)"/i)
    || html.match(/<meta[^>]+content="([^"]*)"[^>]+name=["']description["']/i)
  const desc = descMatch?.[1]?.trim() ?? ''
  if (desc.length < 50) {
    issues.push('missing or short meta description')
  }

  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["'][^>]*data-rh="true"/i)
    || html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["'][^>]*data-rh="true"/i)
    || html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i)
    || html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i)
  const canonical = canonicalMatch?.[1]?.trim() ?? ''
  const expected = expectedCanonical(path)
  if (!canonical) {
    issues.push('missing canonical')
  } else if (canonical !== expected) {
    issues.push(`canonical "${canonical}" != expected "${expected}"`)
  } else if (path !== '/' && canonical === `${SITE_ORIGIN}/`) {
    issues.push('canonical still points to homepage')
  }

  const rootMatch = html.match(/<div\s+id=["']root["'][^>]*>([\s\S]*?)<\/div>/i)
  const rootContent = rootMatch?.[1]?.replace(/\s/g, '') ?? ''
  if (rootContent.length < 100) {
    issues.push('empty #root')
  }
  return issues
}

async function waitForServer(url, timeoutMs = 10000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const { status } = await requestOnce(url)
    if (status >= 200 && status < 500) return true
    await new Promise((r) => setTimeout(r, 300))
  }
  return false
}

function stopPreviewServer(preview) {
  if (!preview?.pid) return
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${preview.pid} /T /F`, { stdio: 'ignore' })
    } else {
      preview.kill('SIGTERM')
    }
  } catch {
    try { preview.kill() } catch {}
  }
  preview.stdout?.destroy()
  preview.stderr?.destroy()
}

async function run() {
  // Require dist and sitemap (sitemap is the source of URLs to check)
  if (!existsSync('dist')) {
    console.error('HTTP Status Audit: dist folder does not exist. Please run the build first (npm run build)')
    process.exit(1)
  }

  const routes = readPathsFromSitemap()
  console.log(`HTTP Status Audit: checking ${routes.length} URL(s) from dist/sitemap.xml\n`)

  // Start vite preview
  const preview = exec(`npx vite preview --port ${PORT}`)

  const up = await waitForServer(BASE_URL)
  if (!up) {
    stopPreviewServer(preview)
    console.error('HTTP Status Audit: failed to start preview server (timeout after 10 seconds)')
    console.error('This usually means the build failed or port 5051 is already in use')
    process.exit(1)
  }

  const results = []
  for (const path of routes) {
    const url = `${BASE_URL}${path}`
    const { status, location, body } = await requestOnce(url, { collectBody: true })
    const isRedirect = status === 301 || status === 302 || status === 308 || status === 307
    const intentional = isRedirect && INTENTIONAL_REDIRECTS.has(path)
    const htmlIssues = status >= 200 && status < 300 ? validateHtmlContent(body, path) : []
    results.push({ path, status, isRedirect, intentional, location: location || undefined, htmlIssues })
  }

  // Stop server
  stopPreviewServer(preview)

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    results,
    passed: results.every((r) => {
      const statusOk = (r.status >= 200 && r.status < 400) || (r.isRedirect && r.intentional)
      const htmlOk = r.status < 200 || r.status >= 300 || !r.htmlIssues?.length
      return statusOk && htmlOk
    }),
  }

  writeFileSync(REPORT_PATH, JSON.stringify(summary, null, 2))
  // Log concise table
  const rows = results.map(r => {
    const redirectNote = r.isRedirect ? (r.intentional ? 'redirect(intentional)' : 'redirect(unexpected)') : ''
    const htmlNote = r.htmlIssues?.length ? `html: ${r.htmlIssues.join(', ')}` : ''
    const notes = [redirectNote, htmlNote].filter(Boolean).join('; ')
    return `${r.path}\t${r.status}\t${notes}${r.location ? ` -> ${r.location}` : ''}`
  })
  console.log('HTTP Status Audit:')
  console.log('PATH\tSTATUS\tNOTES')
  rows.forEach(r => console.log(r))
  console.log(`Report saved to ${REPORT_PATH}`)
  // Write human-readable text report
  const txtHeader = `HTTP Status Audit\nGenerated: ${summary.generatedAt}\nBase: ${summary.baseUrl}\nPassed: ${summary.passed}\n\nPATH\tSTATUS\tNOTES\n`
  writeFileSync(REPORT_TXT_PATH, txtHeader + rows.join('\n'))
  console.log(`Text report saved to ${REPORT_TXT_PATH}`)
  // Also print full JSON report to console
  console.log('HTTP Status Audit - Full Report JSON:')
  console.log(JSON.stringify(summary, null, 2))

  if (!summary.passed) process.exitCode = 1
}

run().catch((err) => {
  console.error('HTTP Status Audit failed:', err)
  process.exitCode = 1
})


