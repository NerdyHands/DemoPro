import { Card } from '@/components/ui/card';
import { EstimateForm } from '@/components/crm/EstimateForm';
import { PageHeader } from '@/components/crm/PageHeader';
import { listCustomers } from '@/lib/crm/customers';

export const dynamic = 'force-dynamic';

export default async function NewEstimatePage({
  searchParams
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const params = await searchParams;
  const customers = await listCustomers();
  const prefill = customers.find(customer => customer.id === params.customerId);

  return (
    <div>
      <PageHeader title="New estimate" />
      <Card>
        <EstimateForm
          customers={customers}
          defaultCustomerId={prefill?.id}
          defaultAddress={prefill?.address}
        />
      </Card>
    </div>
  );
}
