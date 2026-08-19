import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { OpsUnavailable, PageHeader } from '@/components/crm/PageHeader';
import { StatusPill } from '@/components/crm/StatusPill';
import { getOpsConfig } from '@/lib/ops';
import { getQuote } from '@/lib/ops/quotes';
import { money, shortDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!getOpsConfig().ready) return <OpsUnavailable title="Quote" />;
  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) notFound();

  return (
    <div>
      <PageHeader title={quote.title} />
      <Card className="grid gap-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium">{quote.quoteNumber}</p>
          <StatusPill status={quote.status} />
        </div>
        <p>Customer: {quote.customerName || '—'}</p>
        <p>Total: {money(quote.total)}</p>
        <p>Valid until: {quote.validUntil ? shortDate(quote.validUntil) : '—'}</p>
      </Card>
    </div>
  );
}
