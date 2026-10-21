'use client';

import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import type { DrawScheduleType, PaymentScheduleItem } from '@/lib/crm/types';
import { prefillPaymentSchedule } from '@/lib/crm/payment-schedule';
import { money } from '@/lib/utils';

export function PaymentScheduleEditor({
  value,
  onChange,
  scheduleType,
  totalAmount,
  depositAmount
}: {
  value: PaymentScheduleItem[];
  onChange: (items: PaymentScheduleItem[]) => void;
  scheduleType: DrawScheduleType;
  totalAmount: number;
  depositAmount: number;
}) {
  const items = value.length ? value : [{ title: '', description: '', amount: 0 }];

  function commit(next: PaymentScheduleItem[]) {
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-navy">Payment schedule</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => commit(prefillPaymentSchedule(scheduleType, totalAmount, depositAmount))}
          >
            Refresh from draw schedule
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => commit([...items, { title: '', description: '', amount: 0 }])}
          >
            Add milestone
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-[2fr_1fr_auto]">
            <div className="grid gap-2">
              <Input
                placeholder="Milestone title"
                value={item.title}
                onChange={event => {
                  const next = [...items];
                  next[index] = { ...item, title: event.target.value };
                  commit(next);
                }}
              />
              <Textarea
                className="min-h-16"
                placeholder="Description"
                value={item.description}
                onChange={event => {
                  const next = [...items];
                  next[index] = { ...item, description: event.target.value };
                  commit(next);
                }}
              />
            </div>
            <Input
              type="number"
              step="0.01"
              value={item.amount}
              onChange={event => {
                const next = [...items];
                next[index] = { ...item, amount: Number(event.target.value) || 0 };
                commit(next);
              }}
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => commit(items.filter((_, i) => i !== index))}>
              Remove
            </Button>
          </div>
        ))}
      </div>
      <p className="text-sm font-semibold text-navy">
        Scheduled total {money(items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0))}
      </p>
    </div>
  );
}
