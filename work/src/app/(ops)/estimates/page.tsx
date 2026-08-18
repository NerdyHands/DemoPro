import Link from 'next/link';
import { Suspense } from 'react';
import { EmptyState, PageHeader } from '@/components/crm/PageHeader';
import { SearchFilterBar } from '@/components/crm/SearchFilterBar';
import { StatusPill } from '@/components/crm/StatusPill';
import { listEstimates } from '@/lib/crm/estimates';
import { ESTIMATE_STATUSES } from '@/lib/crm/types';
import { money } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function EstimatesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const estimates = await listEstimates({ query: params.q, status: params.status });

  return (
    <div>
      <PageHeader title="Estimates" count={estimates.length} actionHref="/estimates/new" actionLabel="New" />
      <Suspense>
        <SearchFilterBar statuses={ESTIMATE_STATUSES} />
      </Suspense>
      {estimates.length === 0 ? (
        <EmptyState
          title="No estimates"
          description="Create an estimate from a customer record."
          actionHref="/estimates/new"
          actionLabel="New estimate"
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Number</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {estimates.map(estimate => (
                  <tr key={estimate.id} className="border-t border-border hover:bg-surface/80">
                    <td className="px-4 py-3">
                      <Link className="font-medium hover:text-primary" href={`/estimates/${estimate.id}`}>
                        {estimate.estimateNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{estimate.title}</td>
                    <td className="px-4 py-3">{estimate.customerName}</td>
                    <td className="px-4 py-3">{money(estimate.total)}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={estimate.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 md:hidden">
            {estimates.map(estimate => (
              <Link
                key={estimate.id}
                href={`/estimates/${estimate.id}`}
                className="rounded-xl border border-border bg-white p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{estimate.estimateNumber}</p>
                  <StatusPill status={estimate.status} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {estimate.title} · {money(estimate.total)}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
