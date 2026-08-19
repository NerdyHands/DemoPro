import { EmptyState, PageHeader } from '@/components/crm/PageHeader';

export default function LeadsPage() {
  return (
    <div>
      <PageHeader title="Leads" />
      <EmptyState title="Leads" description="This page is not connected yet." />
    </div>
  );
}
