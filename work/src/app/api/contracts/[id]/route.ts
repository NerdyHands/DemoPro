import { NextRequest, NextResponse } from 'next/server';
import { deleteContract, getContract, updateContract } from '@/lib/crm/contracts';
import { parseContract } from '@/lib/crm/validate';
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
    const parsed = parseContract(await request.json());
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
