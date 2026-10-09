import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CustomerForm } from '@/components/crm/CustomerForm';
import { PageHeader } from '@/components/crm/PageHeader';
import { StatusPill } from '@/components/crm/StatusPill';
import { listContracts } from '@/lib/crm/contracts';
import { getCustomer } from '@/lib/crm/customers';
import { listEstimates } from '@/lib/crm/estimates';
import { money } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function CustomerDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();
  const [estimates, contracts] = await Promise.all([
    listEstimates({ customerId: id }),
    listContracts({ customerId: id })
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <PageHeader title={customer.name} />
        <Card>
          <CustomerForm customer={customer} />
        </Card>
      </div>
      <div className="space-y-4">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading font-semibold text-navy">Estimates</h2>
            <Button size="sm" asChild>
              <Link href={`/estimates/new?customerId=${customer.id}`}>New estimate</Link>
            </Button>
          </div>
          {estimates.length ? (
            <ul className="divide-y divide-border text-sm">
              {estimates.map(estimate => (
                <li key={estimate.id} className="flex items-center justify-between gap-2 py-2">
                  <Link className="hover:text-primary" href={`/estimates/${estimate.id}`}>
                    {estimate.estimateNumber} · {estimate.title}
                  </Link>
                  <StatusPill status={estimate.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No estimates yet.</p>
          )}
        </Card>
        <Card>
          <h2 className="mb-3 font-heading font-semibold text-navy">Contracts</h2>
          {contracts.length ? (
            <ul className="divide-y divide-border text-sm">
              {contracts.map(contract => (
                <li key={contract.id} className="flex items-center justify-between gap-2 py-2">
                  <Link className="hover:text-primary" href={`/contracts/${contract.id}`}>
                    {contract.contractNumber} · {money(contract.total)}
                  </Link>
                  <StatusPill status={contract.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No contracts yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
