import { asId, opsFetch, personName } from '@/lib/ops';

export const AMENDMENT_STATUSES = [
  'Draft',
  'Pending Approval',
  'Approved',
  'Rejected',
  'Cancelled'
] as const;

export type AmendmentRecord = {
  id: string;
  amendmentNumber: string;
  title: string;
  status: string;
  reason: string;
  contractId: string;
  contractTitle: string;
  customerName: string;
  originalAmount: number;
  newAmount: number;
};

function mapAmendment(raw: Record<string, unknown>): AmendmentRecord {
  const contract = raw.contractId as { _id?: string; title?: string; contractNumber?: string } | undefined;
  return {
    id: asId(raw._id || raw.id),
    amendmentNumber: String(raw.amendmentNumber || ''),
    title: String(raw.title || raw.amendmentNumber || 'Amendment'),
    status: String(raw.status || 'Draft'),
    reason: String(raw.reason || ''),
    contractId: asId(raw.contractId),
    contractTitle: contract?.contractNumber || contract?.title || '',
    customerName: personName(raw.customer),
    originalAmount: Number(raw.originalContractAmount || 0),
    newAmount: Number(raw.newContractAmount || raw.amendedAmount || 0)
  };
}

export async function listAmendments(): Promise<AmendmentRecord[]> {
  const data = await opsFetch<{ data?: Record<string, unknown>[] }>('/api/amendments');
  return (data.data || []).map(mapAmendment);
}

export async function listAmendmentsForContract(mongoContractId: string): Promise<AmendmentRecord[]> {
  const data = await opsFetch<{ data?: Record<string, unknown>[] }>(
    `/api/amendments/contract/${mongoContractId}`
  );
  return (data.data || []).map(mapAmendment);
}

export async function getAmendment(id: string): Promise<AmendmentRecord | null> {
  const data = await opsFetch<{ data?: Record<string, unknown> }>(`/api/amendments/${id}`);
  return data.data ? mapAmendment(data.data) : null;
}

export async function updateAmendmentStatus(id: string, status: string): Promise<AmendmentRecord> {
  const data = await opsFetch<{ data?: Record<string, unknown> }>(`/api/amendments/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
  return data.data ? mapAmendment(data.data) : (await getAmendment(id)) as AmendmentRecord;
}
