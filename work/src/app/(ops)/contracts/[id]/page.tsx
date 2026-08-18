import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { ContractForm } from '@/components/crm/ContractForm';
import { PageHeader } from '@/components/crm/PageHeader';
import { getContract } from '@/lib/crm/contracts';
import { listCustomers } from '@/lib/crm/customers';
import { listEstimates } from '@/lib/crm/estimates';

export const dynamic = 'force-dynamic';

export default async function ContractDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contract = await getContract(id);
  if (!contract) notFound();
  const [customers, estimates] = await Promise.all([listCustomers(), listEstimates()]);

  return (
    <div>
      <PageHeader title={contract.title} />
      <Card>
        <ContractForm contract={contract} customers={customers} estimates={estimates} />
      </Card>
    </div>
  );
}
