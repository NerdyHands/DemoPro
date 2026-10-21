import { Card } from '@/components/ui/card';
import { ContractForm } from '@/components/crm/ContractForm';
import { PageHeader } from '@/components/crm/PageHeader';
import { DEFAULT_CONTRACT_TERMS } from '@/lib/crm/contract-defaults';
import { listCustomers } from '@/lib/crm/customers';
import { getEstimate, listEstimates } from '@/lib/crm/estimates';
import { defaultDeposit, prefillPaymentSchedule } from '@/lib/crm/payment-schedule';
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
  const linkedCustomer = fromEstimate
    ? customers.find(customer => customer.id === fromEstimate.customerId)
    : params.customerId
      ? customers.find(customer => customer.id === params.customerId)
      : undefined;

  let draft: Contract | undefined;
  if (fromEstimate) {
    const deposit = defaultDeposit(fromEstimate.total);
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
      deposit,
      startDate: '',
      endDate: '',
      terms: DEFAULT_CONTRACT_TERMS,
      notes: fromEstimate.notes,
      clientName: linkedCustomer?.name || fromEstimate.customerName,
      clientAddress: linkedCustomer?.address || '',
      drawScheduleType: 'regular',
      paymentSchedule: prefillPaymentSchedule('regular', fromEstimate.total, deposit),
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
      customerName: linkedCustomer?.name || '',
      estimateId: '',
      status: 'Draft',
      lineItems: [],
      total: 0,
      deposit: 0,
      startDate: '',
      endDate: '',
      terms: DEFAULT_CONTRACT_TERMS,
      notes: '',
      clientName: linkedCustomer?.name || '',
      clientAddress: linkedCustomer?.address || '',
      drawScheduleType: 'regular',
      paymentSchedule: prefillPaymentSchedule('regular', 0, 0),
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
