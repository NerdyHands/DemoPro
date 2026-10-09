import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { ContractForm } from '@/components/crm/ContractForm';
import { DocumentActions } from '@/components/crm/DocumentActions';
import { EmptyState, PageHeader } from '@/components/crm/PageHeader';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { getContract } from '@/lib/crm/contracts';
import { listCustomers } from '@/lib/crm/customers';
import { listEstimates } from '@/lib/crm/estimates';
import { getOpsConfig } from '@/lib/ops';
import { AMENDMENT_STATUSES, listAmendmentsForContract } from '@/lib/ops/amendments';
import { money } from '@/lib/utils';

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
  const opsReady = getOpsConfig().ready;
  let amendments: Awaited<ReturnType<typeof listAmendmentsForContract>> = [];
  let amendmentError = '';
  if (opsReady && contract.mongoId) {
    try {
      amendments = await listAmendmentsForContract(contract.mongoId);
    } catch (error) {
      amendmentError = error instanceof Error ? error.message : 'Could not load amendments';
    }
  }

  return (
    <div>
      <PageHeader title={contract.title} />
      <DocumentActions
        enabled={opsReady && Boolean(contract.mongoId)}
        missingReason={
          opsReady
            ? 'This contract has no MongoId, so PDF, invoice, and BoldSign actions are unavailable until it is linked.'
            : 'Set OPS_API_URL and OPS_SERVICE_TOKEN to export documents and send for signature.'
        }
        downloads={[
          { label: 'Contract PDF', href: `/api/ops-files/contracts/${id}/pdf` },
          { label: 'Contract DOCX', href: `/api/ops-files/contracts/${id}/docx` },
          { label: 'Final invoice PDF', href: `/api/ops-files/contracts/${id}/final-invoice` },
          { label: 'Final invoice DOCX', href: `/api/ops-files/contracts/${id}/final-invoice/docx` },
          { label: 'Signed PDF', href: `/api/ops-files/contracts/${id}/signed-document` }
        ]}
        posts={[
          { label: 'Google Doc', href: `/api/ops-files/contracts/${id}/google-doc`, openUrl: true },
          {
            label: 'Invoice Google Doc',
            href: `/api/ops-files/contracts/${id}/final-invoice/google-doc`,
            openUrl: true
          },
          { label: 'BoldSign draft', href: `/api/ops-files/contracts/${id}/create-boldsign-draft`, openUrl: true },
          { label: 'Send for signature', href: `/api/ops-files/contracts/${id}/send-for-signature` }
        ]}
      />
      <Card>
        <ContractForm contract={contract} customers={customers} estimates={estimates} />
      </Card>
      <div className="mt-8">
        <h2 className="mb-3 font-heading text-lg font-semibold text-navy">Amendments</h2>
        {!opsReady ? (
          <EmptyState
            title="Express ops API is not connected"
            description="Set OPS_API_URL and OPS_SERVICE_TOKEN to load Mongo amendments for this contract."
          />
        ) : !contract.mongoId ? (
          <EmptyState
            title="No Mongo contract linked"
            description="This Airtable contract has no MongoId, so Express amendments cannot be matched yet."
          />
        ) : amendmentError ? (
          <EmptyState title="Could not load amendments" description={amendmentError} />
        ) : amendments.length === 0 ? (
          <EmptyState title="No amendments" description="No Express amendments found for this contract." />
        ) : (
          <KanbanBoard
            items={amendments.map(amendment => ({
              id: amendment.id,
              status: amendment.status,
              title: amendment.amendmentNumber || amendment.title,
              subtitle: amendment.title,
              value: money(amendment.newAmount || amendment.originalAmount),
              href: `/amendments/${amendment.id}`
            }))}
            columns={AMENDMENT_STATUSES.map(status => ({ key: status }))}
            separatorAfter="Approved"
            statusUrlPrefix="/api/amendments/"
            emptyLabel="No amendments"
          />
        )}
      </div>
    </div>
  );
}
