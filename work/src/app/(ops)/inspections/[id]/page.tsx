import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { DocumentActions } from '@/components/crm/DocumentActions';
import { OpsUnavailable, PageHeader } from '@/components/crm/PageHeader';
import { StatusPill } from '@/components/crm/StatusPill';
import { getOpsConfig } from '@/lib/ops';
import { getInspection } from '@/lib/ops/inspections';

export const dynamic = 'force-dynamic';

export default async function InspectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!getOpsConfig().ready) return <OpsUnavailable title="Inspection" />;
  const { id } = await params;
  const inspection = await getInspection(id);
  if (!inspection) notFound();

  return (
    <div>
      <PageHeader title={inspection.title} />
      <DocumentActions
        enabled
        downloads={[
          { label: 'Download PDF', href: `/api/ops-files/inspections/${id}/pdf` },
          { label: 'Download DOCX', href: `/api/ops-files/inspections/${id}/docx` }
        ]}
        posts={[{ label: 'Create Google Doc', href: `/api/ops-files/inspections/${id}/google-doc`, openUrl: true }]}
      />
      <Card className="grid gap-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium">{inspection.reportNumber}</p>
          <StatusPill status={inspection.status} />
        </div>
        <p>Type: {inspection.reportType || '—'}</p>
        <p>Customer: {inspection.customerName || '—'}</p>
        <p>Address: {inspection.propertyAddress || '—'}</p>
      </Card>
      {inspection.tasks.length ? (
        <div className="mt-6">
          <h2 className="mb-3 font-heading text-lg font-semibold text-navy">Tasks</h2>
          <div className="grid gap-2">
            {inspection.tasks.map(task => (
              <Card key={task.taskNumber || task.title} className="flex items-center justify-between gap-2 p-4">
                <p className="text-sm">
                  {task.taskNumber ? `${task.taskNumber}. ` : ''}
                  {task.title}
                </p>
                <StatusPill status={task.status} />
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
