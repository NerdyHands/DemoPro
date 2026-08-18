import Link from 'next/link';
import { Suspense } from 'react';
import { EmptyState, PageHeader } from '@/components/crm/PageHeader';
import { SearchFilterBar } from '@/components/crm/SearchFilterBar';
import { StatusPill } from '@/components/crm/StatusPill';
import { listContracts } from '@/lib/crm/contracts';
import { CONTRACT_STATUSES } from '@/lib/crm/types';
import { money } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ContractsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const contracts = await listContracts({ query: params.q, status: params.status });

  return (
    <div>
      <PageHeader title="Contracts" count={contracts.length} actionHref="/contracts/new" actionLabel="New" />
      <Suspense>
        <SearchFilterBar statuses={CONTRACT_STATUSES} />
      </Suspense>
      {contracts.length === 0 ? (
        <EmptyState
          title="No contracts"
          description="Create a contract or convert an approved estimate."
          actionHref="/contracts/new"
          actionLabel="New contract"
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
                {contracts.map(contract => (
                  <tr key={contract.id} className="border-t border-border hover:bg-surface/80">
                    <td className="px-4 py-3">
                      <Link className="font-medium hover:text-primary" href={`/contracts/${contract.id}`}>
                        {contract.contractNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{contract.title}</td>
                    <td className="px-4 py-3">{contract.customerName}</td>
                    <td className="px-4 py-3">{money(contract.total)}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={contract.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 md:hidden">
            {contracts.map(contract => (
              <Link
                key={contract.id}
                href={`/contracts/${contract.id}`}
                className="rounded-xl border border-border bg-white p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{contract.contractNumber}</p>
                  <StatusPill status={contract.status} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {contract.title} · {money(contract.total)}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
