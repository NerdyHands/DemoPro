'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/input';
import { Field } from '@/components/crm/PageHeader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog';
import type { Customer, CustomerStatus } from '@/lib/crm/types';
import { CUSTOMER_STATUSES } from '@/lib/crm/types';

export function CustomerForm({ customer }: { customer?: Customer }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    firstName: customer?.firstName ?? '',
    lastName: customer?.lastName ?? '',
    businessName: customer?.businessName ?? '',
    email: customer?.email ?? '',
    phone: customer?.phone ?? '',
    address: customer?.address ?? '',
    notes: customer?.notes ?? '',
    status: (customer?.status ?? 'Lead') as CustomerStatus
  });

  async function save() {
    setSaving(true);
    setError('');
    setFields({});
    try {
      const response = await fetch(customer ? `/api/customers/${customer.id}` : '/api/customers', {
        method: customer ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = (await response.json()) as {
        customer?: Customer;
        error?: string;
        fields?: Record<string, string>;
      };
      if (!response.ok) {
        setError(data.error || 'Unable to save');
        setFields(data.fields || {});
        return;
      }
      router.push(`/customers/${data.customer?.id}`);
      router.refresh();
    } catch {
      setError('Unable to save');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!customer) return;
    setSaving(true);
    try {
      await fetch(`/api/customers/${customer.id}`, { method: 'DELETE' });
      router.push('/customers');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={event => {
        event.preventDefault();
        void save();
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="First name" htmlFor="firstName" error={fields.firstName}>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={event => setForm({ ...form, firstName: event.target.value })}
          />
        </Field>
        <Field label="Last name" htmlFor="lastName">
          <Input
            id="lastName"
            value={form.lastName}
            onChange={event => setForm({ ...form, lastName: event.target.value })}
          />
        </Field>
      </div>
      <Field label="Business name" htmlFor="businessName">
        <Input
          id="businessName"
          value={form.businessName}
          onChange={event => setForm({ ...form, businessName: event.target.value })}
        />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Email" htmlFor="email" error={fields.email}>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={event => setForm({ ...form, email: event.target.value })}
          />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input
            id="phone"
            value={form.phone}
            onChange={event => setForm({ ...form, phone: event.target.value })}
          />
        </Field>
      </div>
      <Field label="Address" htmlFor="address">
        <Input
          id="address"
          value={form.address}
          onChange={event => setForm({ ...form, address: event.target.value })}
        />
      </Field>
      <Field label="Status" htmlFor="status">
        <select
          id="status"
          className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"
          value={form.status}
          onChange={event => setForm({ ...form, status: event.target.value as CustomerStatus })}
        >
          {CUSTOMER_STATUSES.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Notes" htmlFor="notes">
        <Textarea
          id="notes"
          value={form.notes}
          onChange={event => setForm({ ...form, notes: event.target.value })}
        />
      </Field>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="sticky bottom-0 flex gap-2 bg-surface/90 py-3 backdrop-blur">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        {customer ? (
          <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
        ) : null}
      </div>
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogTitle>Delete this customer?</DialogTitle>
          <DialogDescription>This cannot be undone from the admin app.</DialogDescription>
          <div className="mt-4 flex gap-2">
            <Button type="button" variant="destructive" onClick={() => void remove()}>
              Delete
            </Button>
            <Button type="button" variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}
