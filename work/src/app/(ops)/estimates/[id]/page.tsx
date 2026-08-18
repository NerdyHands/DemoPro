import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { EstimateForm } from '@/components/crm/EstimateForm';
import { PageHeader } from '@/components/crm/PageHeader';
import { listCustomers } from '@/lib/crm/customers';
import { getEstimate } from '@/lib/crm/estimates';

export const dynamic = 'force-dynamic';

export default async function EstimateDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const estimate = await getEstimate(id);
  if (!estimate) notFound();
  const customers = await listCustomers();

  return (
    <div>
      <PageHeader title={estimate.title} />
      <Card>
        <EstimateForm estimate={estimate} customers={customers} />
      </Card>
    </div>
  );
}
