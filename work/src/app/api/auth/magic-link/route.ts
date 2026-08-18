import { NextResponse } from 'next/server';
import {
  AdminsNotConfiguredError,
  createMagicToken,
  findActiveAdmin,
  randomNonce,
  storeMagicNonce
} from '@/lib/auth';
import { getEnv } from '@/lib/env';
import { magicLinkEmailHtml, sendEmail } from '@/lib/resend';

export const dynamic = 'force-dynamic';

type MagicLinkBody = {
  email?: unknown;
};

export async function POST(request: Request) {
  let body: MagicLinkBody;
  try {
    body = (await request.json()) as MagicLinkBody;
  } catch {
    return NextResponse.json(
      { error: 'Validation failed', fields: { email: 'Email is required' } },
      { status: 400 }
    );
  }

  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: 'Validation failed', fields: { email: 'Enter a valid email' } },
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
  if (!env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'Resend is not configured' },
      { status: 503 }
    );
  }

  try {
    const admin = await findActiveAdmin(email);
    if (!admin) {
      return NextResponse.json(
        { error: 'Email is not on the admin allowlist' },
        { status: 403 }
      );
    }

    const nonce = randomNonce();
    const token = await createMagicToken(admin, nonce);
    await storeMagicNonce(
      admin.id,
      nonce,
      new Date(Date.now() + 20 * 60 * 1000)
    );

    const verifyUrl = `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/verify?token=${encodeURIComponent(token)}`;
    await sendEmail({
      to: admin.email,
      subject: 'Sign in to Mr Demo Pro Admin',
      html: magicLinkEmailHtml(verifyUrl),
      text: `Sign in: ${verifyUrl}`
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminsNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error('magic-link failed', error);
    return NextResponse.json(
      { error: 'Unable to send magic link' },
      { status: 500 }
    );
  }
}
