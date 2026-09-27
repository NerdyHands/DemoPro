import { NextRequest, NextResponse } from 'next/server';
import { createContract, listContracts } from '@/lib/crm/contracts';
import { parseContract } from '@/lib/crm/validate';
import { getRequestSession, handleCrmError, jsonError } from '@/lib/session';

export async function GET(request: NextRequest) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { searchParams } = request.nextUrl;
    const contracts = await listContracts({
      query: searchParams.get('q') || '',
      status: searchParams.get('status') || '',
      customerId: searchParams.get('customerId') || ''
    });
    return NextResponse.json({ contracts });
  } catch (error) {
    return handleCrmError(error);
  }
}

export async function POST(request: NextRequest) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const parsed = parseContract(await request.json());
    if (!parsed.data) {
      return jsonError(400, 'Validation failed', parsed.fields);
    }
    const contract = await createContract(parsed.data);
    return NextResponse.json({ contract }, { status: 201 });
  } catch (error) {
    return handleCrmError(error);
  }
}
