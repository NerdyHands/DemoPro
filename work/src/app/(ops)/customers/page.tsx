import { Suspense } from 'react';
import { EmptyState, PageHeader } from '@/components/crm/PageHeader';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { SearchFilterBar } from '@/components/crm/SearchFilterBar';
import { CONTACT_COLUMNS, contactBucket, contactMeta } from '@/lib/crm/contact';
import { listContracts } from '@/lib/crm/contracts';
import { listCustomers } from '@/lib/crm/customers';
import { listEstimates } from '@/lib/crm/estimates';
import { money } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function CustomersPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const [customers, estimates, contracts] = await Promise.all([
    listCustomers({ query: params.q }),
    listEstimates(),
    listContracts()
  ]);

  const lastActivity = new Map<string, { at: string; total: number }>();
  for (const estimate of estimates) {
    if (!estimate.customerId || !estimate.createdTime) continue;
    const current = lastActivity.get(estimate.customerId);
    if (!current || estimate.createdTime > current.at) {
      lastActivity.set(estimate.customerId, { at: estimate.createdTime, total: estimate.total });
    }
  }
  for (const contract of contracts) {
    if (!contract.customerId || !contract.createdTime) continue;
    const current = lastActivity.get(contract.customerId);
    if (!current || contract.createdTime > current.at) {
      lastActivity.set(contract.customerId, { at: contract.createdTime, total: contract.total });
    }
  }

  return (
    <div>
      <PageHeader title="Customers" count={customers.length} actionHref="/customers/new" actionLabel="New" />
      <Suspense>
        <SearchFilterBar />
      </Suspense>
      {customers.length === 0 ? (
        <EmptyState
          title="No customers"
          description="Create a customer or import Mongo with npm run migrate:airtable."
          actionHref="/customers/new"
          actionLabel="New customer"
        />
      ) : (
        <KanbanBoard
          items={customers.map(customer => {
            const activity = lastActivity.get(customer.id);
            return {
              id: customer.id,
              status: contactBucket(activity?.at),
              badge: customer.status,
              title: customer.name,
              subtitle: customer.email || customer.phone,
              value: activity ? money(activity.total) : undefined,
              meta: contactMeta(activity?.at),
              href: `/customers/${customer.id}`
            };
          })}
          columns={[...CONTACT_COLUMNS]}
          separatorAfter="older"
          statusUrlPrefix="/api/customers/"
          emptyLabel="No customers"
          disabled
          actions={[{ label: 'Create estimate', href: '/estimates/new?customerId={{id}}' }]}
        />
      )}
    </div>
  );
}
