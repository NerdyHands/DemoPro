import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, readSessionFromCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await readSessionFromCookie(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ email: session.email, name: session.name });
}
