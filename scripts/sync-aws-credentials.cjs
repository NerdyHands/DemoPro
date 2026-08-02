#!/usr/bin/env node
/**
 * Sync AWS credentials from server/.env.development into ~/.aws/credentials [default].
 * Usage: node scripts/sync-aws-credentials.cjs
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const envPath = path.join(repoRoot, 'server', '.env.development');
const credPath = path.join(os.homedir(), '.aws', 'credentials');

function parseEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) {
    throw new Error(`Env file not found: ${filePath}`);
  }
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

function parseCredentialProfiles(credentialsText) {
  const profiles = new Map();
  let current = null;
  let lines = [];

  for (const rawLine of credentialsText.split(/\r?\n/)) {
    const profileMatch = rawLine.match(/^\s*\[([^\]]+)\]\s*$/);
    if (profileMatch) {
      if (current) {
        profiles.set(current, lines.join('\n').trimEnd());
      }
      current = profileMatch[1];
      lines = [];
      continue;
    }
    if (current) {
      lines.push(rawLine);
    }
  }

  if (current) {
    profiles.set(current, lines.join('\n').trimEnd());
  }

  return profiles;
}

function serializeCredentialProfiles(profiles) {
  const chunks = [];
  for (const [name, body] of profiles) {
    chunks.push(`[${name}]`);
    if (body) {
      chunks.push(body);
    }
    chunks.push('');
  }
  return chunks.join('\n').trimEnd() + '\n';
}

const env = parseEnv(envPath);
const accessKeyId = env.AWS_ACCESS_KEY_ID;
const secretAccessKey = env.AWS_SECRET_ACCESS_KEY;

if (!accessKeyId || !secretAccessKey) {
  throw new Error('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required in server/.env.development');
}

const existing = fs.existsSync(credPath) ? fs.readFileSync(credPath, 'utf8') : '';
const profiles = parseCredentialProfiles(existing);
profiles.set('default', `aws_access_key_id = ${accessKeyId}\naws_secret_access_key = ${secretAccessKey}`);

fs.mkdirSync(path.dirname(credPath), { recursive: true });
fs.writeFileSync(credPath, serializeCredentialProfiles(profiles), { mode: 0o600 });
console.log('Updated [default] profile in ~/.aws/credentials from server/.env.development');
