import { Suspense } from 'react';
import { EmptyState, PageHeader } from '@/components/crm/PageHeader';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { SearchFilterBar } from '@/components/crm/SearchFilterBar';
import { listCustomers } from '@/lib/crm/customers';

export const dynamic = 'force-dynamic';

export default async function LeadsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const leads = await listCustomers({ query: params.q, status: 'Lead' });

  return (
    <div>
      <PageHeader title="Leads" count={leads.length} actionHref="/customers/new" actionLabel="New" />
      <Suspense>
        <SearchFilterBar placeholder="Search leads" />
      </Suspense>
      {leads.length === 0 ? (
        <EmptyState
          title="No leads"
          description="New customers start as leads. Create one or move a customer back to Lead."
          actionHref="/customers/new"
          actionLabel="New customer"
        />
      ) : (
        <KanbanBoard
          items={leads.map(customer => ({
            id: customer.id,
            status: customer.status,
            title: customer.name,
            subtitle: customer.email || customer.phone,
            href: `/customers/${customer.id}`
          }))}
          columns={[{ key: 'Lead' }]}
          statusUrlPrefix="/api/customers/"
          emptyLabel="No leads"
          disabled
        />
      )}
    </div>
  );
}
