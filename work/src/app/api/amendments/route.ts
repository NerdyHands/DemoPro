import { NextRequest, NextResponse } from 'next/server';
import { listAmendments, listAmendmentsForContract } from '@/lib/ops/amendments';
import { getRequestSession, handleCrmError, jsonError } from '@/lib/session';

export async function GET(request: NextRequest) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const contractMongoId = request.nextUrl.searchParams.get('contractMongoId');
    const amendments = contractMongoId
      ? await listAmendmentsForContract(contractMongoId)
      : await listAmendments();
    return NextResponse.json({ amendments });
  } catch (error) {
    return handleCrmError(error);
  }
}
