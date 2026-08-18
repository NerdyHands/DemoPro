import { listRecords, updateRecord } from './airtable';
import { extractEmail, fieldBool, fieldString } from './fields';
import { AdminsNotConfiguredError, assertAdminsConfigured, getEnv } from './env';

export const SESSION_COOKIE_NAME = 'admin_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
export const MAGIC_TTL_SECONDS = 60 * 20;

export type SessionUser = {
  email: string;
  name: string;
};

export type AdminRecord = SessionUser & {
  id: string;
};

type SignedPayload = SessionUser & {
  exp: number;
  nonce?: string;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_TTL_SECONDS
};

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array {
  const padded =
    value.replace(/-/g, '+').replace(/_/g, '/') +
    '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function hmacSign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return toBase64Url(new Uint8Array(signature));
}

export function randomNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

export async function signPayload(
  payload: SignedPayload,
  secret: string
): Promise<string> {
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await hmacSign(secret, body);
  return `${body}.${signature}`;
}

export async function verifyPayload(
  token: string | undefined,
  secret: string
): Promise<SignedPayload | null> {
  if (!token || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, signature] = parts;
  if (!body || !signature) return null;

  const expected = await hmacSign(secret, body);
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const parsed = JSON.parse(decoder.decode(fromBase64Url(body))) as SignedPayload;
    if (!parsed.email || typeof parsed.exp !== 'number') return null;
    if (parsed.exp * 1000 <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function readSessionFromCookie(
  token: string | undefined
): Promise<SessionUser | null> {
  const secret = getEnv().ADMIN_SESSION_SECRET;
  const payload = await verifyPayload(token, secret);
  if (!payload) return null;
  return {
    email: payload.email,
    name: payload.name || payload.email
  };
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const secret = getEnv().ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is not configured');
  }
  return signPayload(
    {
      email: user.email,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
    },
    secret
  );
}

export async function createMagicToken(user: SessionUser, nonce: string): Promise<string> {
  const secret = getEnv().ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is not configured');
  }
  return signPayload(
    {
      email: user.email,
      name: user.name,
      nonce,
      exp: Math.floor(Date.now() / 1000) + MAGIC_TTL_SECONDS
    },
    secret
  );
}

export async function findActiveAdmin(email: string): Promise<AdminRecord | null> {
  const env = assertAdminsConfigured();
  const normalized = email.trim().toLowerCase();
  const records = await listRecords({
    token: env.AIRTABLE_TOKEN,
    baseId: env.AIRTABLE_ADMINS_BASE_ID,
    tableId: env.AIRTABLE_ADMINS_TABLE_ID,
    viewId: env.AIRTABLE_ADMINS_VIEW_ID || undefined
  });

  for (const record of records) {
    const recordEmail = extractEmail(record.fields);
    if (recordEmail !== normalized) continue;
    if (!fieldBool(record.fields, 'Active', 'active')) continue;
    const name = fieldString(record.fields, 'Name', 'name') || recordEmail;
    return { id: record.id, email: recordEmail, name };
  }

  return null;
}

export async function storeMagicNonce(
  adminId: string,
  nonce: string,
  expiresAt: Date
): Promise<void> {
  const env = assertAdminsConfigured();
  try {
    await updateRecord({
      token: env.AIRTABLE_TOKEN,
      baseId: env.AIRTABLE_ADMINS_BASE_ID,
      tableId: env.AIRTABLE_ADMINS_TABLE_ID,
      recordId: adminId,
      fields: {
        'Magic Nonce': nonce,
        'Magic Expires': expiresAt.toISOString()
      }
    });
  } catch {
    // Optional Airtable fields — magic link still verifies via signed token.
  }
}

export { AdminsNotConfiguredError };
