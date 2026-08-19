import { NextRequest, NextResponse } from 'next/server';
import { JOB_STATUSES, getJob, updateJobStatus } from '@/lib/ops/jobs';
import { parseStatusOnly } from '@/lib/crm/validate';
import { getRequestSession, handleCrmError, jsonError } from '@/lib/session';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { id } = await params;
    const job = await getJob(id);
    if (!job) return jsonError(404, 'Job not found');
    return NextResponse.json({ job });
  } catch (error) {
    return handleCrmError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { id } = await params;
    const parsed = parseStatusOnly(await request.json(), JOB_STATUSES);
    if (!parsed.status) return jsonError(400, parsed.error || 'Invalid status');
    const job = await updateJobStatus(id, parsed.status);
    return NextResponse.json({ job });
  } catch (error) {
    return handleCrmError(error);
  }
}
