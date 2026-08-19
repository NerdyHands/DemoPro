import { asId, opsFetch, personName } from '@/lib/ops';

export const INSPECTION_STATUSES = [
  'Draft',
  'In Review',
  'Approved',
  'Sent to Client',
  'Archived'
] as const;

export type InspectionTask = {
  taskNumber: string;
  title: string;
  status: string;
};

export type InspectionRecord = {
  id: string;
  reportNumber: string;
  title: string;
  status: string;
  reportType: string;
  customerName: string;
  propertyAddress: string;
  tasks: InspectionTask[];
};

function mapInspection(raw: Record<string, unknown>): InspectionRecord {
  const tasks = Array.isArray(raw.tasks) ? raw.tasks : [];
  return {
    id: asId(raw._id || raw.id),
    reportNumber: String(raw.reportNumber || ''),
    title: String(raw.title || raw.reportNumber || 'Inspection'),
    status: String(raw.status || 'Draft'),
    reportType: String(raw.reportType || ''),
    customerName: personName(raw.customer) || String(raw.customerName || ''),
    propertyAddress: String(raw.propertyAddress || ''),
    tasks: tasks.map(task => {
      const item = task as Record<string, unknown>;
      return {
        taskNumber: String(item.taskNumber || ''),
        title: String(item.title || item.description || 'Task'),
        status: String(item.status || 'Not Started')
      };
    })
  };
}

export async function listInspections(): Promise<InspectionRecord[]> {
  const data = await opsFetch<{ data?: Record<string, unknown>[] }>('/api/client-reports');
  return (data.data || []).map(mapInspection);
}

export async function getInspection(id: string): Promise<InspectionRecord | null> {
  const data = await opsFetch<{ data?: Record<string, unknown> }>(`/api/client-reports/${id}`);
  return data.data ? mapInspection(data.data) : null;
}

export async function updateInspectionStatus(id: string, status: string): Promise<InspectionRecord> {
  const data = await opsFetch<{ data?: Record<string, unknown> }>(`/api/client-reports/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
  return data.data ? mapInspection(data.data) : (await getInspection(id)) as InspectionRecord;
}
