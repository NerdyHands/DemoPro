import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/crm/PageHeader';
import { StatusPill } from '@/components/crm/StatusPill';
import { listContracts } from '@/lib/crm/contracts';
import { listCustomers } from '@/lib/crm/customers';
import { listEstimates } from '@/lib/crm/estimates';
import { getConfigStatus } from '@/lib/env';
import { money } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const status = getConfigStatus();
  if (!status.crmReady) {
    return (
      <Card>
        <h1 className="font-heading text-2xl font-semibold text-navy">CRM not configured</h1>
        <p className="mt-2 text-sm text-muted">
          Add AIRTABLE_TOKEN to work/.env.local, then run npm run setup:airtable.
        </p>
      </Card>
    );
  }

  let customers = [];
  let estimates = [];
  let contracts = [];
  try {
    [customers, estimates, contracts] = await Promise.all([
      listCustomers(),
      listEstimates(),
      listContracts()
    ]);
  } catch {
    return (
      <Card>
        <h1 className="font-heading text-2xl font-semibold text-navy">Airtable is unreachable</h1>
        <p className="mt-2 text-sm text-muted">
          Check AIRTABLE_TOKEN and that Customers, Estimates, and Contracts exist in base
          appBDw3qjn76qICKH.
        </p>
      </Card>
    );
  }

  const attention = [
    ...estimates
      .filter(item => item.status === 'Draft')
      .map(item => ({
        href: `/estimates/${item.id}`,
        label: `${item.estimateNumber} · ${item.title}`,
        kind: 'Estimate'
      })),
    ...contracts
      .filter(item => item.status === 'Draft' || item.status === 'Sent')
      .map(item => ({
        href: `/contracts/${item.id}`,
        label: `${item.contractNumber} · ${item.title}`,
        kind: 'Contract'
      }))
  ].slice(0, 8);
  const recent = [...customers]
    .sort((a, b) => b.createdTime.localeCompare(a.createdTime))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-navy">Operations</h1>
        <p className="text-sm text-muted">Customers, estimates, and contracts.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard href="/customers" label="Customers" value={customers.length} />
        <StatCard href="/estimates" label="Estimates" value={estimates.length} />
        <StatCard href="/contracts" label="Contracts" value={contracts.length} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-heading text-lg font-semibold text-navy">Needs attention</h2>
          {attention.length ? (
            <ul className="mt-3 divide-y divide-border">
              {attention.map(item => (
                <li key={item.href} className="py-2">
                  <Link href={item.href} className="text-sm font-medium hover:text-primary">
                    {item.kind}: {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Nothing waiting on a draft or unsigned contract.</p>
          )}
        </Card>
        <Card>
          <h2 className="font-heading text-lg font-semibold text-navy">Recent customers</h2>
          {recent.length ? (
            <ul className="mt-3 divide-y divide-border">
              {recent.map(customer => (
                <li key={customer.id} className="flex items-center justify-between py-2">
                  <Link href={`/customers/${customer.id}`} className="text-sm font-medium hover:text-primary">
                    {customer.name}
                  </Link>
                  <StatusPill status={customer.status} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No customers yet"
              description="Add a customer or run the Mongo migration."
              actionHref="/customers/new"
              actionLabel="New customer"
            />
          )}
        </Card>
      </div>
      <p className="text-xs text-muted">
        Pipeline total {money(contracts.reduce((sum, item) => sum + item.total, 0))}
      </p>
    </div>
  );
}

function StatCard({ href, label, value }: { href: string; label: string; value: number }) {
  return (
    <Link href={href}>
      <Card className="border-l-4 border-l-primary transition-shadow hover:shadow-md">
        <p className="text-sm text-muted">{label}</p>
        <p className="font-heading text-3xl font-semibold text-navy">{value}</p>
      </Card>
    </Link>
  );
}
