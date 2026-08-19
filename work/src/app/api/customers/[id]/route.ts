import { NextRequest, NextResponse } from 'next/server';
import { deleteCustomer, getCustomer, updateCustomer, updateCustomerStatus } from '@/lib/crm/customers';
import { CUSTOMER_STATUSES } from '@/lib/crm/types';
import { isStatusOnlyBody, parseCustomer, parseStatusOnly } from '@/lib/crm/validate';
import { getRequestSession, handleCrmError, jsonError } from '@/lib/session';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { id } = await params;
    const customer = await getCustomer(id);
    if (!customer) return jsonError(404, 'Customer not found');
    return NextResponse.json({ customer });
  } catch (error) {
    return handleCrmError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { id } = await params;
    const body = await request.json();
    if (isStatusOnlyBody(body)) {
      const parsedStatus = parseStatusOnly(body, CUSTOMER_STATUSES);
      if (!parsedStatus.status) return jsonError(400, parsedStatus.error || 'Invalid status');
      const customer = await updateCustomerStatus(id, parsedStatus.status);
      return NextResponse.json({ customer });
    }
    const parsed = parseCustomer(body);
    if (!parsed.data) {
      return jsonError(400, 'Validation failed', parsed.fields);
    }
    const customer = await updateCustomer(id, parsed.data);
    return NextResponse.json({ customer });
  } catch (error) {
    return handleCrmError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { id } = await params;
    await deleteCustomer(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleCrmError(error);
  }
}
