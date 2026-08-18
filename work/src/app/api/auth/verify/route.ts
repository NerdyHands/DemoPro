import { NextRequest, NextResponse } from 'next/server';
import {
  AdminsNotConfiguredError,
  createSessionToken,
  findActiveAdmin,
  sessionCookieOptions,
  SESSION_COOKIE_NAME,
  verifyPayload
} from '@/lib/auth';
import { getEnv } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? '';
  if (!token) {
    return NextResponse.json(
      { error: 'Validation failed', fields: { token: 'Token is required' } },
      { status: 400 }
    );
  }

  const env = getEnv();
  if (!env.ADMIN_SESSION_SECRET) {
    return NextResponse.json(
      { error: 'ADMIN_SESSION_SECRET is not configured' },
      { status: 503 }
    );
  }

  const payload = await verifyPayload(token, env.ADMIN_SESSION_SECRET);
  if (!payload) {
    return NextResponse.json(
      { error: 'Magic link is invalid or expired' },
      { status: 401 }
    );
  }

  try {
    const admin = await findActiveAdmin(payload.email);
    if (!admin) {
      return NextResponse.json(
        { error: 'Email is not on the admin allowlist' },
        { status: 403 }
      );
    }

    const sessionToken = await createSessionToken({
      email: admin.email,
      name: admin.name
    });

    const response = NextResponse.json({
      ok: true,
      email: admin.email,
      name: admin.name
    });
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, sessionCookieOptions);
    return response;
  } catch (error) {
    if (error instanceof AdminsNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error('verify failed', error);
    return NextResponse.json(
      { error: 'Unable to verify magic link' },
      { status: 500 }
    );
  }
}
