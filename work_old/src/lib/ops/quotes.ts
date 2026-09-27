import { asId, opsFetch, personName } from '@/lib/ops';

export const QUOTE_STATUSES = ['draft', 'sent', 'approved', 'rejected', 'expired', 'cancelled'] as const;

export type QuoteRecord = {
  id: string;
  quoteNumber: string;
  title: string;
  status: string;
  total: number;
  customerName: string;
  validUntil: string;
};

function mapQuote(raw: Record<string, unknown>): QuoteRecord {
  const customer = raw.customer as { name?: string; email?: string } | undefined;
  return {
    id: asId(raw._id || raw.id),
    quoteNumber: String(raw.quoteNumber || ''),
    title: String(raw.title || raw.quoteNumber || 'Quote'),
    status: String(raw.status || 'draft'),
    total: Number(raw.total || 0),
    customerName: customer?.name || personName(raw.customer) || customer?.email || '',
    validUntil: String(raw.validUntil || '')
  };
}

export async function listQuotes(query?: string): Promise<QuoteRecord[]> {
  const search = query ? `&search=${encodeURIComponent(query)}` : '';
  const data = await opsFetch<{ quotes?: Record<string, unknown>[] }>(`/api/quotes?limit=200${search}`);
  return (data.quotes || []).map(mapQuote);
}

export async function getQuote(id: string): Promise<QuoteRecord | null> {
  const data = await opsFetch<Record<string, unknown>>(`/api/quotes/${id}`);
  const raw = (data.quote as Record<string, unknown> | undefined) || data;
  if (!raw || !(raw._id || raw.id)) return null;
  return mapQuote(raw);
}

export async function updateQuoteStatus(id: string, status: string): Promise<QuoteRecord> {
  const data = await opsFetch<{ quote?: Record<string, unknown> }>(`/api/quotes/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
  return data.quote ? mapQuote(data.quote) : (await getQuote(id)) as QuoteRecord;
}
