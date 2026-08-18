import Link from 'next/link';
import { Suspense } from 'react';
import { EmptyState, PageHeader } from '@/components/crm/PageHeader';
import { SearchFilterBar } from '@/components/crm/SearchFilterBar';
import { StatusPill } from '@/components/crm/StatusPill';
import { listCustomers } from '@/lib/crm/customers';
import { CUSTOMER_STATUSES } from '@/lib/crm/types';

export const dynamic = 'force-dynamic';

export default async function CustomersPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const customers = await listCustomers({ query: params.q, status: params.status });

  return (
    <div>
      <PageHeader title="Customers" count={customers.length} actionHref="/customers/new" actionLabel="New" />
      <Suspense>
        <SearchFilterBar statuses={CUSTOMER_STATUSES} />
      </Suspense>
      {customers.length === 0 ? (
        <EmptyState
          title="No customers"
          description="Create a customer or import Mongo with npm run migrate:airtable."
          actionHref="/customers/new"
          actionLabel="New customer"
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id} className="border-t border-border hover:bg-surface/80">
                    <td className="px-4 py-3">
                      <Link className="font-medium hover:text-primary" href={`/customers/${customer.id}`}>
                        {customer.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{customer.email}</td>
                    <td className="px-4 py-3">{customer.phone}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={customer.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 md:hidden">
            {customers.map(customer => (
              <Link
                key={customer.id}
                href={`/customers/${customer.id}`}
                className="rounded-xl border border-border bg-white p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{customer.name}</p>
                  <StatusPill status={customer.status} />
                </div>
                <p className="mt-1 text-sm text-muted">{customer.email}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
