import { EmptyState, OpsUnavailable, PageHeader } from '@/components/crm/PageHeader';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { getOpsConfig, tryOpsLoad } from '@/lib/ops';
import { JOB_STATUSES, listJobs } from '@/lib/ops/jobs';

export const dynamic = 'force-dynamic';

const COLUMNS = JOB_STATUSES.map(status => ({ key: status }));

export default async function JobsPage() {
  if (!getOpsConfig().ready) return <OpsUnavailable title="Jobs" />;
  const { data: jobs, error } = await tryOpsLoad(listJobs, []);

  return (
    <div>
      <PageHeader title="Jobs" count={jobs.length} />
      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      {jobs.length === 0 ? (
        <EmptyState title="No jobs" description="Jobs still live in the Express/Mongo API." />
      ) : (
        <KanbanBoard
          items={jobs.map(job => ({
            id: job.id,
            status: job.status,
            title: job.jobId || job.title,
            subtitle: job.customerName || job.title,
            meta: [job.priority, job.workType].filter(Boolean).join(' · '),
            href: `/jobs/${job.id}`
          }))}
          columns={COLUMNS}
          separatorAfter="On Hold"
          statusUrlPrefix="/api/jobs/"
          emptyLabel="No jobs"
        />
      )}
    </div>
  );
}
