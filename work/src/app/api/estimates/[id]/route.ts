import { NextRequest, NextResponse } from 'next/server';
import { deleteEstimate, getEstimate, updateEstimate } from '@/lib/crm/estimates';
import { parseEstimate } from '@/lib/crm/validate';
import { getRequestSession, handleCrmError, jsonError } from '@/lib/session';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { id } = await params;
    const estimate = await getEstimate(id);
    if (!estimate) return jsonError(404, 'Estimate not found');
    return NextResponse.json({ estimate });
  } catch (error) {
    return handleCrmError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { id } = await params;
    const parsed = parseEstimate(await request.json());
    if (!parsed.data) {
      return jsonError(400, 'Validation failed', parsed.fields);
    }
    const estimate = await updateEstimate(id, parsed.data);
    return NextResponse.json({ estimate });
  } catch (error) {
    return handleCrmError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { id } = await params;
    await deleteEstimate(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleCrmError(error);
  }
}
