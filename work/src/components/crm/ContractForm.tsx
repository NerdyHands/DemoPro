'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/input';
import { Field } from '@/components/crm/PageHeader';
import { LineItemsEditor } from '@/components/crm/LineItemsEditor';
import { PaymentScheduleEditor } from '@/components/crm/PaymentScheduleEditor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog';
import { DEFAULT_CONTRACT_TERMS } from '@/lib/crm/contract-defaults';
import { sumLineItems } from '@/lib/crm/line-items';
import { defaultDeposit, prefillPaymentSchedule } from '@/lib/crm/payment-schedule';
import type {
  Contract,
  ContractStatus,
  Customer,
  DrawScheduleType,
  Estimate,
  LineItem,
  PaymentScheduleItem
} from '@/lib/crm/types';
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
  const initialCustomer = customers.find(item => item.id === (contract?.customerId ?? ''));
  const [lineItems, setLineItems] = useState<LineItem[]>(contract?.lineItems ?? []);
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentScheduleItem[]>(
    contract?.paymentSchedule?.length
      ? contract.paymentSchedule
      : prefillPaymentSchedule(
          contract?.drawScheduleType ?? 'regular',
          contract?.total ?? sumLineItems(contract?.lineItems ?? []),
          contract?.deposit ?? 0
        )
  );
  const [form, setForm] = useState({
    title: contract?.title ?? '',
    description: contract?.description ?? '',
    propertyAddress: contract?.propertyAddress ?? '',
    customerId: contract?.customerId ?? '',
    estimateId: contract?.estimateId ?? '',
    status: (contract?.status ?? 'Draft') as ContractStatus,
    deposit: contract?.deposit ?? defaultDeposit(contract?.total ?? 0, 0),
    startDate: contract?.startDate?.slice(0, 10) ?? '',
    endDate: contract?.endDate?.slice(0, 10) ?? '',
    terms: contract?.terms || DEFAULT_CONTRACT_TERMS,
    notes: contract?.notes ?? '',
    clientName: contract?.clientName || initialCustomer?.name || '',
    clientAddress: contract?.clientAddress || initialCustomer?.address || '',
    drawScheduleType: (contract?.drawScheduleType ?? 'regular') as DrawScheduleType
  });

  function customerFields(customerId: string) {
    const customer = customers.find(item => item.id === customerId);
    return {
      clientName: customer?.name || '',
      clientAddress: customer?.address || ''
    };
  }

  function applyEstimate(id: string) {
    const estimate = estimates.find(item => item.id === id);
    const linkedCustomerId = estimate?.customerId || '';
    const fromCustomer = customerFields(linkedCustomerId);
    setForm(current => {
      const nextCustomerId = estimate?.customerId || current.customerId;
      const nextTotal = estimate?.lineItems.length ? sumLineItems(estimate.lineItems) : sumLineItems(lineItems);
      const nextDeposit = defaultDeposit(nextTotal, current.deposit);
      return {
        ...current,
        estimateId: id,
        customerId: nextCustomerId,
        propertyAddress: estimate?.propertyAddress || current.propertyAddress,
        title: current.title || estimate?.title || '',
        clientName: current.clientName || fromCustomer.clientName,
        clientAddress: current.clientAddress || fromCustomer.clientAddress,
        deposit: nextDeposit
      };
    });
    if (estimate?.lineItems.length) {
      setLineItems(estimate.lineItems);
      const total = sumLineItems(estimate.lineItems);
      setPaymentSchedule(prefillPaymentSchedule(form.drawScheduleType, total, defaultDeposit(total, form.deposit)));
    }
  }

  async function save() {
    setSaving(true);
    setError('');
    setFields({});
    try {
      const response = await fetch(isExisting ? `/api/contracts/${contract?.id}` : '/api/contracts', {
        method: isExisting ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          lineItems,
          paymentSchedule,
          contractNumber: contract?.contractNumber
        })
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
            onChange={event => {
              const customerId = event.target.value;
              const fromCustomer = customerFields(customerId);
              setForm(current => ({
                ...current,
                customerId,
                clientName: current.clientName || fromCustomer.clientName,
                clientAddress: current.clientAddress || fromCustomer.clientAddress
              }));
            }}
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
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Client name" htmlFor="clientName">
          <Input
            id="clientName"
            value={form.clientName}
            onChange={event => setForm({ ...form, clientName: event.target.value })}
          />
        </Field>
        <Field label="Client address" htmlFor="clientAddress">
          <Input
            id="clientAddress"
            value={form.clientAddress}
            onChange={event => setForm({ ...form, clientAddress: event.target.value })}
          />
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
        <p className="mb-2 text-sm font-semibold text-navy">Draw schedule type</p>
        <div className="flex flex-col gap-2 md:flex-row md:gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="drawScheduleType"
              checked={form.drawScheduleType === 'regular'}
              onChange={() => {
                setForm(current => ({ ...current, drawScheduleType: 'regular' }));
                setPaymentSchedule(prefillPaymentSchedule('regular', sumLineItems(lineItems), form.deposit));
              }}
            />
            Regular (deposit + final payment)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="drawScheduleType"
              checked={form.drawScheduleType === 'demolition'}
              onChange={() => {
                setForm(current => ({ ...current, drawScheduleType: 'demolition' }));
                setPaymentSchedule(prefillPaymentSchedule('demolition', sumLineItems(lineItems), form.deposit));
              }}
            />
            Demolition (multi-milestone)
          </label>
        </div>
        <p className="mt-2 text-xs text-muted">
          {form.drawScheduleType === 'regular'
            ? 'Payment schedule: deposit before work begins, then final payment upon completion.'
            : 'Payment schedule: deposit, disassembly, debris removal, and final clean.'}
        </p>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold text-navy">Line items</p>
        <LineItemsEditor value={lineItems} onChange={setLineItems} />
      </div>
      <PaymentScheduleEditor
        value={paymentSchedule}
        onChange={setPaymentSchedule}
        scheduleType={form.drawScheduleType}
        totalAmount={sumLineItems(lineItems)}
        depositAmount={form.deposit}
      />
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
