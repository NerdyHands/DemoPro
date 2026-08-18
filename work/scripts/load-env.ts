import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function applyEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

export function loadScriptEnv() {
  const workRoot = resolve(process.cwd());
  applyEnvFile(resolve(workRoot, '.env.local'));
  applyEnvFile(resolve(workRoot, '.env'));
  applyEnvFile(resolve(workRoot, '../server/.env.development'));
  applyEnvFile(resolve(workRoot, '../server/.env'));
}
