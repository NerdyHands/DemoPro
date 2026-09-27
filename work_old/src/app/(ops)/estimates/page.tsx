import { Suspense } from 'react';
import { EmptyState, PageHeader } from '@/components/crm/PageHeader';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { SearchFilterBar } from '@/components/crm/SearchFilterBar';
import { listEstimates } from '@/lib/crm/estimates';
import { money, shortDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'Draft' },
  { key: 'Sent' },
  { key: 'Approved' },
  { key: 'Rejected' },
  { key: 'Expired' }
];

export default async function EstimatesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const estimates = await listEstimates({ query: params.q });

  return (
    <div>
      <PageHeader title="Estimates" count={estimates.length} actionHref="/estimates/new" actionLabel="New" />
      <Suspense>
        <SearchFilterBar />
      </Suspense>
      {estimates.length === 0 ? (
        <EmptyState
          title="No estimates"
          description="Create an estimate from a customer record."
          actionHref="/estimates/new"
          actionLabel="New estimate"
        />
      ) : (
        <KanbanBoard
          items={estimates.map(estimate => ({
            id: estimate.id,
            status: estimate.status,
            title: estimate.estimateNumber || estimate.title,
            subtitle: estimate.customerName || estimate.title,
            value: money(estimate.total),
            meta: estimate.validUntil
              ? `Due ${shortDate(estimate.validUntil)}`
              : `Created ${shortDate(estimate.createdTime)}`,
            href: `/estimates/${estimate.id}`
          }))}
          columns={COLUMNS}
          separatorAfter="Rejected"
          statusUrlPrefix="/api/estimates/"
          emptyLabel="No estimates"
          actions={[
            { label: 'Send', whenStatus: 'Draft', toStatus: 'Sent' },
            { label: 'Create contract', whenStatus: 'Approved', href: '/contracts/new?estimateId={{id}}' }
          ]}
        />
      )}
    </div>
  );
}
