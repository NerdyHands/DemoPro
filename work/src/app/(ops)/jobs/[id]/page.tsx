import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { OpsUnavailable, PageHeader } from '@/components/crm/PageHeader';
import { StatusPill } from '@/components/crm/StatusPill';
import { getOpsConfig } from '@/lib/ops';
import { getJob } from '@/lib/ops/jobs';

export const dynamic = 'force-dynamic';

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!getOpsConfig().ready) return <OpsUnavailable title="Job" />;
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  return (
    <div>
      <PageHeader title={job.title} />
      <Card className="grid gap-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium">{job.jobId}</p>
          <StatusPill status={job.status} />
        </div>
        <p>Customer: {job.customerName || '—'}</p>
        <p>Contract: {job.contractTitle || '—'}</p>
        <p>Priority: {job.priority || '—'}</p>
        <p>Work type: {job.workType || '—'}</p>
        {job.notes ? <p>{job.notes}</p> : null}
      </Card>
    </div>
  );
}
