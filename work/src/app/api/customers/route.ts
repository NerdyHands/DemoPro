import { NextRequest, NextResponse } from 'next/server';
import {
  createCustomer,
  listCustomers
} from '@/lib/crm/customers';
import { parseCustomer } from '@/lib/crm/validate';
import { getRequestSession, handleCrmError, jsonError } from '@/lib/session';

export async function GET(request: NextRequest) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { searchParams } = request.nextUrl;
    const customers = await listCustomers({
      query: searchParams.get('q') || '',
      status: searchParams.get('status') || ''
    });
    return NextResponse.json({ customers });
  } catch (error) {
    return handleCrmError(error);
  }
}

export async function POST(request: NextRequest) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const parsed = parseCustomer(await request.json());
    if (!parsed.data) {
      return jsonError(400, 'Validation failed', parsed.fields);
    }
    const customer = await createCustomer(parsed.data);
    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    return handleCrmError(error);
  }
}
