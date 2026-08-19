import { NextRequest, NextResponse } from 'next/server';
import { deleteContract, getContract, updateContract, updateContractStatus } from '@/lib/crm/contracts';
import { CONTRACT_STATUSES } from '@/lib/crm/types';
import { isStatusOnlyBody, parseContract, parseStatusOnly } from '@/lib/crm/validate';
import { getRequestSession, handleCrmError, jsonError } from '@/lib/session';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { id } = await params;
    const contract = await getContract(id);
    if (!contract) return jsonError(404, 'Contract not found');
    return NextResponse.json({ contract });
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
      const parsedStatus = parseStatusOnly(body, CONTRACT_STATUSES);
      if (!parsedStatus.status) return jsonError(400, parsedStatus.error || 'Invalid status');
      const contract = await updateContractStatus(id, parsedStatus.status);
      return NextResponse.json({ contract });
    }
    const parsed = parseContract(body);
    if (!parsed.data) {
      return jsonError(400, 'Validation failed', parsed.fields);
    }
    const contract = await updateContract(id, parsed.data);
    return NextResponse.json({ contract });
  } catch (error) {
    return handleCrmError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { id } = await params;
    await deleteContract(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleCrmError(error);
  }
}
