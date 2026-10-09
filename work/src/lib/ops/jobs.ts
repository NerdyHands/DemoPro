import { asId, opsFetch, personName } from '@/lib/ops';

export const JOB_STATUSES = [
  'Pending',
  'Assigned',
  'In Progress',
  'On Hold',
  'Completed',
  'Cancelled',
  'Needs Review'
] as const;

export type JobRecord = {
  id: string;
  jobId: string;
  title: string;
  status: string;
  priority: string;
  workType: string;
  customerName: string;
  contractTitle: string;
  notes: string;
};

function mapJob(raw: Record<string, unknown>): JobRecord {
  return {
    id: asId(raw._id || raw.id),
    jobId: String(raw.jobId || ''),
    title: String(raw.title || raw.jobId || 'Job'),
    status: String(raw.status || 'Pending'),
    priority: String(raw.priority || ''),
    workType: String(raw.workType || ''),
    customerName: personName(raw.customer),
    contractTitle: (() => {
      const contract = raw.contractId as { title?: string; contractNumber?: string } | undefined;
      return contract?.contractNumber || contract?.title || '';
    })(),
    notes: String(raw.notes || '')
  };
}

export async function listJobs(): Promise<JobRecord[]> {
  const data = await opsFetch<{ jobs?: Record<string, unknown>[] }>('/api/jobs?limit=200');
  return (data.jobs || []).map(mapJob);
}

export async function getJob(id: string): Promise<JobRecord | null> {
  const data = await opsFetch<{ job?: Record<string, unknown> }>(`/api/jobs/${id}`);
  return data.job ? mapJob(data.job) : null;
}

export async function updateJobStatus(id: string, status: string): Promise<JobRecord> {
  await opsFetch(`/api/jobs/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  const job = await getJob(id);
  if (!job) throw new Error('Job not found after status update');
  return job;
}
