import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, readSessionFromCookie, type SessionUser } from '@/lib/auth';
import { AirtableError } from '@/lib/airtable';
import { CrmNotConfiguredError } from '@/lib/env';
import { OpsNotConfiguredError, OpsRequestError } from '@/lib/ops';

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return readSessionFromCookie(store.get(SESSION_COOKIE_NAME)?.value);
}

export async function getRequestSession(
  request: NextRequest
): Promise<SessionUser | null> {
  return readSessionFromCookie(request.cookies.get(SESSION_COOKIE_NAME)?.value);
}

export function jsonError(status: number, error: string, fields?: Record<string, string>) {
  return NextResponse.json(fields ? { error, fields } : { error }, { status });
}

export function handleCrmError(error: unknown): NextResponse {
  if (error instanceof CrmNotConfiguredError) {
    return jsonError(503, error.message);
  }
  if (error instanceof OpsNotConfiguredError) {
    return jsonError(503, error.message);
  }
  if (error instanceof OpsRequestError) {
    return jsonError(error.status >= 400 && error.status < 600 ? error.status : 502, error.message);
  }
  if (error instanceof AirtableError) {
    if (error.status === 404) {
      return jsonError(404, 'Record not found');
    }
    console.error('Airtable error', error.status, error.body);
    return jsonError(502, 'Airtable request failed');
  }
  console.error(error);
  return jsonError(500, 'Unexpected error');
}
