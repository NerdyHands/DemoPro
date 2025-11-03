// Lightweight HTTP status audit for built site
// - Starts vite preview on a fixed port
// - Requests each route with redirect: manual to capture status codes
// - Marks 301/302 as intentional based on a simple allowlist

import { readFileSync, writeFileSync } from 'node:fs'
import { exec } from 'node:child_process'
import http from 'node:http'
import https from 'node:https'

const PORT = 5051
const BASE_URL = `http://localhost:${PORT}`
const REPORT_PATH = 'dist/http-status-report.json'
const REPORT_TXT_PATH = 'dist/http-status-report.txt'

function readIncludeRoutes() {
  const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
  const includes = pkg.reactSnap && Array.isArray(pkg.reactSnap.include) ? pkg.reactSnap.include : ['/']
  return includes
}

// Configure intentional redirects here (source path -> true)
// Example: { '/old-services': true }
const INTENTIONAL_REDIRECTS = new Set([
  // Add known/expected redirects here if any
])

function requestOnce(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http
    const req = client.request(url, { method: 'GET' }, (res) => {
      // Do not follow redirects; capture status and location
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => {
        resolve({
          status: res.statusCode || 0,
          location: res.headers.location || null,
        })
      })
    })
    req.on('error', () => resolve({ status: 0, location: null }))
    req.end()
  })
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

async function run() {
  const routes = readIncludeRoutes()

  // Start vite preview
  const preview = exec(`npx vite preview --port ${PORT}`)

  const up = await waitForServer(BASE_URL)
  if (!up) {
    try { preview.kill() } catch {}
    console.error('HTTP Status Audit: failed to start preview server')
    process.exit(1)
  }

  const results = []
  for (const path of routes) {
    const url = `${BASE_URL}${path}`
    const { status, location } = await requestOnce(url)
    const isRedirect = status === 301 || status === 302 || status === 308 || status === 307
    const intentional = isRedirect && INTENTIONAL_REDIRECTS.has(path)
    results.push({ path, status, isRedirect, intentional, location: location || undefined })
  }

  // Stop server
  try { preview.kill() } catch {}

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    results,
    passed: results.every((r) => (r.status >= 200 && r.status < 400) || (r.isRedirect && r.intentional)),
  }

  writeFileSync(REPORT_PATH, JSON.stringify(summary, null, 2))
  // Log concise table
  const rows = results.map(r => `${r.path}\t${r.status}\t${r.isRedirect ? (r.intentional ? 'redirect(intentional)' : 'redirect(unexpected)') : ''}${r.location ? ` -> ${r.location}` : ''}`)
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


