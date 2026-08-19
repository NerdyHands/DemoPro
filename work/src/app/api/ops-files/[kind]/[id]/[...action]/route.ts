import { NextRequest } from 'next/server';
import { handleDocumentRequest } from '@/lib/ops/documents';
import { getRequestSession, handleCrmError, jsonError } from '@/lib/session';

type Params = { params: Promise<{ kind: string; id: string; action: string[] }> };

async function handle(request: NextRequest, paramsPromise: Params['params']) {
  if (!(await getRequestSession(request))) return jsonError(401, 'Unauthorized');
  try {
    const { kind, id, action } = await paramsPromise;
    const body = request.method === 'POST' ? await request.json().catch(() => ({})) : undefined;
    return await handleDocumentRequest({ kind, id, action, method: request.method, body });
  } catch (error) {
    return handleCrmError(error);
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  return handle(request, params);
}

export async function POST(request: NextRequest, { params }: Params) {
  return handle(request, params);
}
