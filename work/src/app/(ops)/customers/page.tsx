import { Suspense } from 'react';
import { EmptyState, PageHeader } from '@/components/crm/PageHeader';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { SearchFilterBar } from '@/components/crm/SearchFilterBar';
import { listCustomers } from '@/lib/crm/customers';
import { CUSTOMER_STATUSES } from '@/lib/crm/types';

export const dynamic = 'force-dynamic';

export default async function CustomersPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const customers = await listCustomers({ query: params.q });

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
          items={customers.map(customer => ({
            id: customer.id,
            status: customer.status,
            title: customer.name,
            subtitle: customer.email || customer.phone,
            href: `/customers/${customer.id}`
          }))}
          columns={CUSTOMER_STATUSES.map(status => ({ key: status }))}
          statusUrlPrefix="/api/customers/"
          emptyLabel="No customers"
        />
      )}
    </div>
  );
}
