import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { DocumentActions } from '@/components/crm/DocumentActions';
import { EstimateForm } from '@/components/crm/EstimateForm';
import { PageHeader } from '@/components/crm/PageHeader';
import { listCustomers } from '@/lib/crm/customers';
import { getEstimate } from '@/lib/crm/estimates';
import { getOpsConfig } from '@/lib/ops';

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
  const opsReady = getOpsConfig().ready;
  const canExport = opsReady && Boolean(estimate.mongoId);

  return (
    <div>
      <PageHeader title={estimate.title} />
      <DocumentActions
        enabled={canExport}
        missingReason={
          opsReady
            ? 'This estimate has no MongoId, so PDF/DOCX export is unavailable until it is linked.'
            : 'Set OPS_API_URL and OPS_SERVICE_TOKEN to export PDF/DOCX from Express.'
        }
        downloads={[
          { label: 'Download PDF', href: `/api/ops-files/estimates/${id}/pdf` },
          { label: 'Download DOCX', href: `/api/ops-files/estimates/${id}/docx` }
        ]}
        posts={[{ label: 'Create Google Doc', href: `/api/ops-files/estimates/${id}/google-doc`, openUrl: true }]}
      />
      <Card>
        <EstimateForm estimate={estimate} customers={customers} />
      </Card>
    </div>
  );
}
