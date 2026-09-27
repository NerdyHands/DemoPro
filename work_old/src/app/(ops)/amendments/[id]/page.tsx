import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { DocumentActions } from '@/components/crm/DocumentActions';
import { OpsUnavailable, PageHeader } from '@/components/crm/PageHeader';
import { StatusPill } from '@/components/crm/StatusPill';
import { getOpsConfig } from '@/lib/ops';
import { getAmendment } from '@/lib/ops/amendments';
import { money } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AmendmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!getOpsConfig().ready) return <OpsUnavailable title="Amendment" />;
  const { id } = await params;
  const amendment = await getAmendment(id);
  if (!amendment) notFound();

  return (
    <div>
      <PageHeader title={amendment.title} />
      <DocumentActions
        enabled
        downloads={[
          { label: 'Download PDF', href: `/api/ops-files/amendments/${id}/pdf` },
          { label: 'Download DOCX', href: `/api/ops-files/amendments/${id}/docx` }
        ]}
        posts={[
          { label: 'Create Google Doc', href: `/api/ops-files/amendments/${id}/google-doc`, openUrl: true },
          { label: 'Approve', href: `/api/ops-files/amendments/${id}/approve` },
          { label: 'Reject', href: `/api/ops-files/amendments/${id}/reject`, prompt: 'Rejection reason', promptField: 'rejectionReason' }
        ]}
      />
      <Card className="grid gap-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium">{amendment.amendmentNumber}</p>
          <StatusPill status={amendment.status} />
        </div>
        <p>Contract: {amendment.contractTitle || '—'}</p>
        <p>Customer: {amendment.customerName || '—'}</p>
        <p>Original: {money(amendment.originalAmount)}</p>
        <p>Amended: {money(amendment.newAmount)}</p>
        {amendment.reason ? <p>{amendment.reason}</p> : null}
      </Card>
    </div>
  );
}
