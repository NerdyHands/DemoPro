import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/crm/PageHeader';
import { CustomerForm } from '@/components/crm/CustomerForm';

export default function NewCustomerPage() {
  return (
    <div>
      <PageHeader title="New customer" />
      <Card>
        <CustomerForm />
      </Card>
    </div>
  );
}
