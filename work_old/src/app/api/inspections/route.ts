import { NextRequest, NextResponse } from 'next/server';
import { listInspections } from '@/lib/ops/inspections';
import { getRequestSession, handleCrmError, jsonError } from '@/lib/session';

export async function GET(request: NextRequest) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const inspections = await listInspections();
    return NextResponse.json({ inspections });
  } catch (error) {
    return handleCrmError(error);
  }
}
