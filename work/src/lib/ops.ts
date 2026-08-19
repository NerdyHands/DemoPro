import { getEnv } from '@/lib/env';

export class OpsNotConfiguredError extends Error {
  constructor() {
    super('Express ops API is not configured. Set OPS_API_URL and OPS_SERVICE_TOKEN.');
    this.name = 'OpsNotConfiguredError';
  }
}

export class OpsRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'OpsRequestError';
    this.status = status;
  }
}

export function getOpsConfig() {
  const env = getEnv();
  return {
    url: env.OPS_API_URL.replace(/\/$/, ''),
    token: env.OPS_SERVICE_TOKEN,
    ready: Boolean(env.OPS_API_URL && env.OPS_SERVICE_TOKEN)
  };
}

export function assertOpsConfigured() {
  const config = getOpsConfig();
  if (!config.ready) throw new OpsNotConfiguredError();
  return config;
}

export async function opsFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await opsFetchResponse(path, init);
  const text = await response.text();
  let json: Record<string, unknown> = {};
  if (text) {
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      json = { error: text };
    }
  }
  if (!response.ok) {
    const message =
      (typeof json.error === 'string' && json.error) ||
      (typeof json.message === 'string' && json.message) ||
      'Ops request failed';
    throw new OpsRequestError(response.status, message);
  }
  return json as T;
}

export async function opsFetchResponse(path: string, init?: RequestInit): Promise<Response> {
  const { url, token } = assertOpsConfigured();
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('X-Ops-Service-Token', token);
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(`${url}${path}`, {
    ...init,
    cache: 'no-store',
    headers
  });
}

export function asId(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value && '_id' in value) return String((value as { _id: unknown })._id);
  return String(value);
}

export function personName(value: unknown): string {
  if (!value || typeof value !== 'object') return '';
  const record = value as { firstName?: string; lastName?: string; name?: string; email?: string };
  if (record.name) return record.name;
  return [record.firstName, record.lastName].filter(Boolean).join(' ').trim() || record.email || '';
}

export async function tryOpsLoad<T>(loader: () => Promise<T>, fallback: T): Promise<{ data: T; error: string }> {
  try {
    return { data: await loader(), error: '' };
  } catch (error) {
    return { data: fallback, error: error instanceof Error ? error.message : 'Request failed' };
  }
}
