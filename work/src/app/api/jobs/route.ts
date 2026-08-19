import { NextRequest, NextResponse } from 'next/server';
import { listJobs } from '@/lib/ops/jobs';
import { getRequestSession, handleCrmError, jsonError } from '@/lib/session';

export async function GET(request: NextRequest) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const jobs = await listJobs();
    return NextResponse.json({ jobs });
  } catch (error) {
    return handleCrmError(error);
  }
}
