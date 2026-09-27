import { NextRequest, NextResponse } from 'next/server';
import { INSPECTION_STATUSES, getInspection, updateInspectionStatus } from '@/lib/ops/inspections';
import { parseStatusOnly } from '@/lib/crm/validate';
import { getRequestSession, handleCrmError, jsonError } from '@/lib/session';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { id } = await params;
    const inspection = await getInspection(id);
    if (!inspection) return jsonError(404, 'Inspection not found');
    return NextResponse.json({ inspection });
  } catch (error) {
    return handleCrmError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { id } = await params;
    const parsed = parseStatusOnly(await request.json(), INSPECTION_STATUSES);
    if (!parsed.status) return jsonError(400, parsed.error || 'Invalid status');
    const inspection = await updateInspectionStatus(id, parsed.status);
    return NextResponse.json({ inspection });
  } catch (error) {
    return handleCrmError(error);
  }
}
