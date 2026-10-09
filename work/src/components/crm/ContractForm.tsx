'use client';

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
import type { Contract, ContractStatus, Customer, Estimate, LineItem } from '@/lib/crm/types';
import { CONTRACT_STATUSES } from '@/lib/crm/types';

export function ContractForm({
  contract,
  customers,
  estimates
}: {
  contract?: Contract;
  customers: Customer[];
  estimates: Estimate[];
}) {
  const router = useRouter();
  const isExisting = Boolean(contract?.id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>(contract?.lineItems ?? []);
  const [form, setForm] = useState({
    title: contract?.title ?? '',
    description: contract?.description ?? '',
    propertyAddress: contract?.propertyAddress ?? '',
    customerId: contract?.customerId ?? '',
    estimateId: contract?.estimateId ?? '',
    status: (contract?.status ?? 'Draft') as ContractStatus,
    deposit: contract?.deposit ?? 0,
    startDate: contract?.startDate?.slice(0, 10) ?? '',
    endDate: contract?.endDate?.slice(0, 10) ?? '',
    terms: contract?.terms ?? '',
    notes: contract?.notes ?? ''
  });

  function applyEstimate(id: string) {
    const estimate = estimates.find(item => item.id === id);
    setForm(current => ({
      ...current,
      estimateId: id,
      customerId: estimate?.customerId || current.customerId,
      propertyAddress: estimate?.propertyAddress || current.propertyAddress,
      title: current.title || estimate?.title || ''
    }));
    if (estimate?.lineItems.length) setLineItems(estimate.lineItems);
  }

  async function save() {
    setSaving(true);
    setError('');
    setFields({});
    try {
      const response = await fetch(isExisting ? `/api/contracts/${contract?.id}` : '/api/contracts', {
        method: isExisting ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lineItems, contractNumber: contract?.contractNumber })
      });
      const data = (await response.json()) as {
        contract?: Contract;
        error?: string;
        fields?: Record<string, string>;
      };
      if (!response.ok) {
        setError(data.error || 'Unable to save');
        setFields(data.fields || {});
        return;
      }
      router.push(`/contracts/${data.contract?.id}`);
      router.refresh();
    } catch {
      setError('Unable to save');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!contract) return;
    await fetch(`/api/contracts/${contract.id}`, { method: 'DELETE' });
    router.push('/contracts');
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
      {contract ? (
        <p className="text-sm text-muted">Contract {contract?.contractNumber}</p>
      ) : null}
      <Field label="Title" htmlFor="title" error={fields.title}>
        <Input
          id="title"
          value={form.title}
          onChange={event => setForm({ ...form, title: event.target.value })}
        />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
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
        <Field label="Estimate" htmlFor="estimateId">
          <select
            id="estimateId"
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"
            value={form.estimateId}
            onChange={event => applyEstimate(event.target.value)}
          >
            <option value="">None</option>
            {estimates.map(estimate => (
              <option key={estimate.id} value={estimate.id}>
                {estimate.estimateNumber} · {estimate.title}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Property address" htmlFor="propertyAddress">
        <Input
          id="propertyAddress"
          value={form.propertyAddress}
          onChange={event => setForm({ ...form, propertyAddress: event.target.value })}
        />
      </Field>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Status" htmlFor="status">
          <select
            id="status"
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"
            value={form.status}
            onChange={event => setForm({ ...form, status: event.target.value as ContractStatus })}
          >
            {CONTRACT_STATUSES.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Start date" htmlFor="startDate">
          <Input
            id="startDate"
            type="date"
            value={form.startDate}
            onChange={event => setForm({ ...form, startDate: event.target.value })}
          />
        </Field>
        <Field label="End date" htmlFor="endDate">
          <Input
            id="endDate"
            type="date"
            value={form.endDate}
            onChange={event => setForm({ ...form, endDate: event.target.value })}
          />
        </Field>
      </div>
      <Field label="Deposit" htmlFor="deposit">
        <Input
          id="deposit"
          type="number"
          min="0"
          step="0.01"
          value={form.deposit}
          onChange={event => setForm({ ...form, deposit: Number(event.target.value) || 0 })}
        />
      </Field>
      <div>
        <p className="mb-2 text-sm font-semibold text-navy">Line items</p>
        <LineItemsEditor value={lineItems} onChange={setLineItems} />
      </div>
      <Field label="Terms" htmlFor="terms">
        <Textarea
          id="terms"
          value={form.terms}
          onChange={event => setForm({ ...form, terms: event.target.value })}
        />
      </Field>
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
          <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
        ) : null}
      </div>
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogTitle>Delete this contract?</DialogTitle>
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
