import { Suspense } from 'react';
import { EmptyState, OpsUnavailable, PageHeader } from '@/components/crm/PageHeader';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { SearchFilterBar } from '@/components/crm/SearchFilterBar';
import { getOpsConfig, tryOpsLoad } from '@/lib/ops';
import { listQuotes } from '@/lib/ops/quotes';
import { money, shortDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'draft', label: 'Draft' },
  { key: 'sent', label: 'Sent' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'expired', label: 'Expired' },
  { key: 'cancelled', label: 'Cancelled' }
];

export default async function QuotesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  if (!getOpsConfig().ready) return <OpsUnavailable title="Quotes" />;
  const params = await searchParams;
  const { data: quotes, error } = await tryOpsLoad(() => listQuotes(params.q), []);

  return (
    <div>
      <PageHeader title="Quotes" count={quotes.length} />
      <Suspense>
        <SearchFilterBar placeholder="Search quotes" />
      </Suspense>
      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      {quotes.length === 0 ? (
        <EmptyState title="No quotes" description="PICRA quotes still live in the Express/Mongo API." />
      ) : (
        <KanbanBoard
          items={quotes.map(quote => ({
            id: quote.id,
            status: quote.status,
            title: quote.quoteNumber || quote.title,
            subtitle: quote.customerName || quote.title,
            value: money(quote.total),
            meta: quote.validUntil ? `Due ${shortDate(quote.validUntil)}` : '',
            href: `/quotes/${quote.id}`
          }))}
          columns={COLUMNS}
          separatorAfter="rejected"
          statusUrlPrefix="/api/quotes/"
          emptyLabel="No quotes"
        />
      )}
    </div>
  );
}
