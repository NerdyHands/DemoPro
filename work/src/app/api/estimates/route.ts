import { NextRequest, NextResponse } from 'next/server';
import { createEstimate, listEstimates } from '@/lib/crm/estimates';
import { parseEstimate } from '@/lib/crm/validate';
import { getRequestSession, handleCrmError, jsonError } from '@/lib/session';

export async function GET(request: NextRequest) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { searchParams } = request.nextUrl;
    const estimates = await listEstimates({
      query: searchParams.get('q') || '',
      status: searchParams.get('status') || '',
      customerId: searchParams.get('customerId') || ''
    });
    return NextResponse.json({ estimates });
  } catch (error) {
    return handleCrmError(error);
  }
}

export async function POST(request: NextRequest) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const parsed = parseEstimate(await request.json());
    if (!parsed.data) {
      return jsonError(400, 'Validation failed', parsed.fields);
    }
    const estimate = await createEstimate(parsed.data);
    return NextResponse.json({ estimate }, { status: 201 });
  } catch (error) {
    return handleCrmError(error);
  }
}
