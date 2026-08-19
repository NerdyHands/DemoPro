import { NextResponse } from 'next/server';
import { getContract } from '@/lib/crm/contracts';
import { getEstimate } from '@/lib/crm/estimates';
import { opsFetch, opsFetchResponse, OpsRequestError } from '@/lib/ops';
import { jsonError } from '@/lib/session';

export const CRM_KINDS = ['estimates', 'contracts'] as const;
export const MONGO_KINDS = ['amendments', 'inspections'] as const;

type Kind = (typeof CRM_KINDS)[number] | (typeof MONGO_KINDS)[number];

const EXPRESS_PREFIX: Record<Kind, string> = {
  estimates: '/api/estimates',
  contracts: '/api/contracts',
  amendments: '/api/amendments',
  inspections: '/api/client-reports'
};

const FILE_ACTIONS = new Set([
  'pdf',
  'docx',
  'final-invoice',
  'final-invoice/docx',
  'signed-document'
]);

const JSON_GET_ACTIONS = new Set(['signature-status']);

const JSON_POST_ACTIONS = new Set([
  'google-doc',
  'final-invoice/google-doc',
  'send-for-signature',
  'create-boldsign-draft',
  'resend-signature',
  'cancel-signature',
  'approve',
  'reject'
]);

function isKind(value: string): value is Kind {
  return value in EXPRESS_PREFIX;
}

export function parseDocumentAction(kind: string, action: string[]): { kind: Kind; action: string } | null {
  if (!isKind(kind)) return null;
  const joined = action.join('/');
  if (!FILE_ACTIONS.has(joined) && !JSON_GET_ACTIONS.has(joined) && !JSON_POST_ACTIONS.has(joined)) {
    return null;
  }
  return { kind, action: joined };
}

export async function resolveOpsRecordId(kind: Kind, id: string): Promise<string | null> {
  if (kind === 'estimates') {
    const estimate = await getEstimate(id);
    return estimate?.mongoId || null;
  }
  if (kind === 'contracts') {
    const contract = await getContract(id);
    return contract?.mongoId || null;
  }
  return id;
}

function filenameFromDisposition(header: string | null, fallback: string): string {
  if (!header) return fallback;
  const match = header.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i);
  if (!match?.[1]) return fallback;
  return decodeURIComponent(match[1].replace(/"/g, ''));
}

export async function proxyOpsFile(expressPath: string, fallbackName: string): Promise<NextResponse> {
  const response = await opsFetchResponse(expressPath);
  if (!response.ok) {
    const text = await response.text();
    let message = 'Document request failed';
    try {
      const json = JSON.parse(text) as { error?: string; message?: string };
      message = json.error || json.message || message;
    } catch {
      if (text) message = text.slice(0, 200);
    }
    throw new OpsRequestError(response.status, message);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type') || 'application/octet-stream';
  const filename = filenameFromDisposition(response.headers.get('content-disposition'), fallbackName);
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}

export async function handleDocumentRequest(options: {
  kind: string;
  id: string;
  action: string[];
  method: string;
  body?: unknown;
}): Promise<NextResponse> {
  const parsed = parseDocumentAction(options.kind, options.action);
  if (!parsed) return jsonError(404, 'Unknown document action');

  const opsId = await resolveOpsRecordId(parsed.kind, options.id);
  if (!opsId) {
    return jsonError(409, 'This record is not linked to Mongo yet, so Express documents cannot be generated.');
  }

  const expressPath = `${EXPRESS_PREFIX[parsed.kind]}/${opsId}/${parsed.action}`;
  const fallback = `${parsed.kind}-${opsId}.${parsed.action.includes('docx') ? 'docx' : 'pdf'}`;

  if (FILE_ACTIONS.has(parsed.action)) {
    if (options.method !== 'GET') return jsonError(405, 'Method not allowed');
    return proxyOpsFile(expressPath, fallback);
  }

  if (JSON_GET_ACTIONS.has(parsed.action)) {
    if (options.method !== 'GET') return jsonError(405, 'Method not allowed');
    const data = await opsFetch(expressPath);
    return NextResponse.json(data);
  }

  if (options.method !== 'POST') return jsonError(405, 'Method not allowed');
  const data = await opsFetch(expressPath, {
    method: 'POST',
    body: JSON.stringify(options.body && typeof options.body === 'object' ? options.body : {})
  });
  return NextResponse.json(data);
}
