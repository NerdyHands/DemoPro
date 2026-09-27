import { EmptyState, OpsUnavailable, PageHeader } from '@/components/crm/PageHeader';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { getOpsConfig, tryOpsLoad } from '@/lib/ops';
import { INSPECTION_STATUSES, listInspections } from '@/lib/ops/inspections';

export const dynamic = 'force-dynamic';

export default async function InspectionsPage() {
  if (!getOpsConfig().ready) return <OpsUnavailable title="Inspections" />;
  const { data: inspections, error } = await tryOpsLoad(listInspections, []);

  return (
    <div>
      <PageHeader title="Inspections" count={inspections.length} />
      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      {inspections.length === 0 ? (
        <EmptyState
          title="No inspections"
          description="Client reports and pre-work inspections still live in the Express/Mongo API."
        />
      ) : (
        <KanbanBoard
          items={inspections.map(inspection => ({
            id: inspection.id,
            status: inspection.status,
            title: inspection.reportNumber || inspection.title,
            subtitle: inspection.customerName || inspection.reportType,
            meta: inspection.propertyAddress,
            href: `/inspections/${inspection.id}`
          }))}
          columns={INSPECTION_STATUSES.map(status => ({ key: status }))}
          separatorAfter="Approved"
          statusUrlPrefix="/api/inspections/"
          emptyLabel="No inspections"
        />
      )}
    </div>
  );
}
