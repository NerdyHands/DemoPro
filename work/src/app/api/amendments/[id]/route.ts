import { NextRequest, NextResponse } from 'next/server';
import { AMENDMENT_STATUSES, getAmendment, updateAmendmentStatus } from '@/lib/ops/amendments';
import { parseStatusOnly } from '@/lib/crm/validate';
import { getRequestSession, handleCrmError, jsonError } from '@/lib/session';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { id } = await params;
    const amendment = await getAmendment(id);
    if (!amendment) return jsonError(404, 'Amendment not found');
    return NextResponse.json({ amendment });
  } catch (error) {
    return handleCrmError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { id } = await params;
    const parsed = parseStatusOnly(await request.json(), AMENDMENT_STATUSES);
    if (!parsed.status) return jsonError(400, parsed.error || 'Invalid status');
    const amendment = await updateAmendmentStatus(id, parsed.status);
    return NextResponse.json({ amendment });
  } catch (error) {
    return handleCrmError(error);
  }
}
