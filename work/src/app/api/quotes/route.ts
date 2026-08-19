import { NextRequest, NextResponse } from 'next/server';
import { listQuotes } from '@/lib/ops/quotes';
import { getRequestSession, handleCrmError, jsonError } from '@/lib/session';

export async function GET(request: NextRequest) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const quotes = await listQuotes(request.nextUrl.searchParams.get('q') || undefined);
    return NextResponse.json({ quotes });
  } catch (error) {
    return handleCrmError(error);
  }
}
