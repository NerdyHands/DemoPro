import { NextRequest, NextResponse } from 'next/server';
import { QUOTE_STATUSES, getQuote, updateQuoteStatus } from '@/lib/ops/quotes';
import { parseStatusOnly } from '@/lib/crm/validate';
import { getRequestSession, handleCrmError, jsonError } from '@/lib/session';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { id } = await params;
    const quote = await getQuote(id);
    if (!quote) return jsonError(404, 'Quote not found');
    return NextResponse.json({ quote });
  } catch (error) {
    return handleCrmError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { id } = await params;
    const parsed = parseStatusOnly(await request.json(), QUOTE_STATUSES);
    if (!parsed.status) return jsonError(400, parsed.error || 'Invalid status');
    const quote = await updateQuoteStatus(id, parsed.status);
    return NextResponse.json({ quote });
  } catch (error) {
    return handleCrmError(error);
  }
}
