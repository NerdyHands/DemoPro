'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/input';
import { Field } from '@/components/crm/PageHeader';
import { LineItemsEditor } from '@/components/crm/LineItemsEditor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog';
import type { Customer, Estimate, EstimateStatus, LineItem } from '@/lib/crm/types';
import { ESTIMATE_STATUSES } from '@/lib/crm/types';

export function EstimateForm({
  estimate,
  customers,
  defaultCustomerId,
  defaultAddress
}: {
  estimate?: Estimate;
  customers: Customer[];
  defaultCustomerId?: string;
  defaultAddress?: string;
}) {
  const router = useRouter();
  const isExisting = Boolean(estimate?.id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>(estimate?.lineItems ?? []);
  const [form, setForm] = useState({
    title: estimate?.title ?? '',
    description: estimate?.description ?? '',
    propertyAddress: estimate?.propertyAddress ?? defaultAddress ?? '',
    customerId: estimate?.customerId ?? defaultCustomerId ?? '',
    status: (estimate?.status ?? 'Draft') as EstimateStatus,
    validUntil: estimate?.validUntil?.slice(0, 10) ?? '',
    notes: estimate?.notes ?? ''
  });

  async function save() {
    setSaving(true);
    setError('');
    setFields({});
    try {
      const response = await fetch(isExisting ? `/api/estimates/${estimate?.id}` : '/api/estimates', {
        method: isExisting ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lineItems, estimateNumber: estimate?.estimateNumber })
      });
      const data = (await response.json()) as {
        estimate?: Estimate;
        error?: string;
        fields?: Record<string, string>;
      };
      if (!response.ok) {
        setError(data.error || 'Unable to save');
        setFields(data.fields || {});
        return;
      }
      router.push(`/estimates/${data.estimate?.id}`);
      router.refresh();
    } catch {
      setError('Unable to save');
    } finally {
      setSaving(false);
    }
  }

  async function convertToContract() {
    if (!estimate) return;
    setSaving(true);
    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          propertyAddress: form.propertyAddress,
          customerId: form.customerId,
          estimateId: estimate.id,
          lineItems,
          notes: form.notes
        })
      });
      const data = (await response.json()) as { contract?: { id: string }; error?: string };
      if (!response.ok) {
        setError(data.error || 'Unable to create contract');
        return;
      }
      router.push(`/contracts/${data.contract?.id}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!estimate) return;
    await fetch(`/api/estimates/${estimate.id}`, { method: 'DELETE' });
    router.push('/estimates');
    router.refresh();
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={event => {
        event.preventDefault();
        void save();
      }}
    >
        {isExisting ? (
        <p className="text-sm text-muted">Estimate {estimate?.estimateNumber}</p>
      ) : null}
      <Field label="Title" htmlFor="title" error={fields.title}>
        <Input
          id="title"
          value={form.title}
          onChange={event => setForm({ ...form, title: event.target.value })}
        />
      </Field>
      <Field label="Customer" htmlFor="customerId" error={fields.customerId}>
        <select
          id="customerId"
          className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"
          value={form.customerId}
          onChange={event => setForm({ ...form, customerId: event.target.value })}
        >
          <option value="">Select a customer</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Property address" htmlFor="propertyAddress">
        <Input
          id="propertyAddress"
          value={form.propertyAddress}
          onChange={event => setForm({ ...form, propertyAddress: event.target.value })}
        />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Status" htmlFor="status">
          <select
            id="status"
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"
            value={form.status}
            onChange={event => setForm({ ...form, status: event.target.value as EstimateStatus })}
          >
            {ESTIMATE_STATUSES.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Valid until" htmlFor="validUntil">
          <Input
            id="validUntil"
            type="date"
            value={form.validUntil}
            onChange={event => setForm({ ...form, validUntil: event.target.value })}
          />
        </Field>
      </div>
      <Field label="Description" htmlFor="description">
        <Textarea
          id="description"
          value={form.description}
          onChange={event => setForm({ ...form, description: event.target.value })}
        />
      </Field>
      <div>
        <p className="mb-2 text-sm font-semibold text-navy">Line items</p>
        <LineItemsEditor value={lineItems} onChange={setLineItems} />
      </div>
      <Field label="Notes" htmlFor="notes">
        <Textarea
          id="notes"
          value={form.notes}
          onChange={event => setForm({ ...form, notes: event.target.value })}
        />
      </Field>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="sticky bottom-0 flex flex-wrap gap-2 bg-surface/90 py-3 backdrop-blur">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        {isExisting ? (
          <>
            <Button type="button" variant="outline" onClick={() => void convertToContract()}>
              Create contract
            </Button>
            <Button type="button" variant="ghost" asChild>
              <Link href={`/customers/${form.customerId}`}>View customer</Link>
            </Button>
            <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          </>
        ) : null}
      </div>
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogTitle>Delete this estimate?</DialogTitle>
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
