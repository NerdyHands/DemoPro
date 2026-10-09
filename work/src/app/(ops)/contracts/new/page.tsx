import { Card } from '@/components/ui/card';
import { ContractForm } from '@/components/crm/ContractForm';
import { PageHeader } from '@/components/crm/PageHeader';
import { listCustomers } from '@/lib/crm/customers';
import { getEstimate, listEstimates } from '@/lib/crm/estimates';
import type { Contract } from '@/lib/crm/types';

export const dynamic = 'force-dynamic';

export default async function NewContractPage({
  searchParams
}: {
  searchParams: Promise<{ estimateId?: string; customerId?: string }>;
}) {
  const params = await searchParams;
  const [customers, estimates] = await Promise.all([listCustomers(), listEstimates()]);
  const fromEstimate = params.estimateId ? await getEstimate(params.estimateId) : null;

  let draft: Contract | undefined;
  if (fromEstimate) {
    draft = {
      id: '',
      mongoId: '',
      contractNumber: '',
      title: fromEstimate.title,
      description: fromEstimate.description,
      propertyAddress: fromEstimate.propertyAddress,
      customerId: fromEstimate.customerId,
      customerName: fromEstimate.customerName,
      estimateId: fromEstimate.id,
      status: 'Draft',
      lineItems: fromEstimate.lineItems,
      total: fromEstimate.total,
      deposit: 0,
      startDate: '',
      endDate: '',
      terms: '',
      notes: fromEstimate.notes,
      createdTime: ''
    };
  } else if (params.customerId) {
    draft = {
      id: '',
      mongoId: '',
      contractNumber: '',
      title: '',
      description: '',
      propertyAddress: '',
      customerId: params.customerId,
      customerName: '',
      estimateId: '',
      status: 'Draft',
      lineItems: [],
      total: 0,
      deposit: 0,
      startDate: '',
      endDate: '',
      terms: '',
      notes: '',
      createdTime: ''
    };
  }

  return (
    <div>
      <PageHeader title="New contract" />
      <Card>
        <ContractForm customers={customers} estimates={estimates} contract={draft} />
      </Card>
    </div>
  );
}
