import { Suspense } from 'react';
import { EmptyState, PageHeader } from '@/components/crm/PageHeader';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { SearchFilterBar } from '@/components/crm/SearchFilterBar';
import { listContracts } from '@/lib/crm/contracts';
import { money, shortDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'Draft' },
  { key: 'Sent' },
  { key: 'Signed' },
  { key: 'Active' },
  { key: 'Completed' },
  { key: 'Cancelled' }
];

export default async function ContractsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const contracts = await listContracts({ query: params.q });

  return (
    <div>
      <PageHeader title="Contracts" count={contracts.length} actionHref="/contracts/new" actionLabel="New" />
      <Suspense>
        <SearchFilterBar />
      </Suspense>
      {contracts.length === 0 ? (
        <EmptyState
          title="No contracts"
          description="Create a contract or convert an approved estimate."
          actionHref="/contracts/new"
          actionLabel="New contract"
        />
      ) : (
        <KanbanBoard
          items={contracts.map(contract => ({
            id: contract.id,
            status: contract.status,
            title: contract.contractNumber || contract.title,
            subtitle: contract.customerName || contract.title,
            value: money(contract.total),
            meta: contract.endDate
              ? `Due ${shortDate(contract.endDate)}`
              : contract.startDate
                ? `Start ${shortDate(contract.startDate)}`
                : `Created ${shortDate(contract.createdTime)}`,
            href: `/contracts/${contract.id}`
          }))}
          columns={COLUMNS}
          separatorAfter="Active"
          statusUrlPrefix="/api/contracts/"
          emptyLabel="No contracts"
          actions={[
            { label: 'Send', whenStatus: 'Draft', toStatus: 'Sent' },
            { label: 'Activate', whenStatus: 'Signed', toStatus: 'Active' }
          ]}
        />
      )}
    </div>
  );
}
