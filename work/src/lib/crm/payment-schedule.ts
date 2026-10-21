import type { DrawScheduleType, PaymentScheduleItem } from './types';
import { DRAW_SCHEDULE_TYPES } from './types';
import { roundMoney } from './line-items';

export function asDrawScheduleType(value?: string | null): DrawScheduleType {
  return DRAW_SCHEDULE_TYPES.includes(value as DrawScheduleType)
    ? (value as DrawScheduleType)
    : 'regular';
}

export function normalizePaymentSchedule(value: unknown): PaymentScheduleItem[] {
  if (typeof value === 'string' && value.trim()) {
    try {
      return normalizePaymentSchedule(JSON.parse(value));
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  return value
    .map(item => {
      const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      return {
        title: typeof row.title === 'string' ? row.title.trim() : '',
        description: typeof row.description === 'string' ? row.description.trim() : '',
        amount: Number(row.amount) || 0
      };
    })
    .filter(item => item.title);
}

export function serializePaymentSchedule(items: PaymentScheduleItem[]): string {
  return JSON.stringify(items.filter(item => item.title.trim()));
}

export function prefillPaymentSchedule(
  scheduleType: DrawScheduleType,
  totalAmount: number,
  depositAmount = 0
): PaymentScheduleItem[] {
  const total = Number.isFinite(totalAmount) ? totalAmount : 0;
  if (scheduleType === 'demolition') {
    return [
      {
        title: 'Deposit/ Before Work Begins',
        description: 'Initial deposit required before work begins',
        amount: roundMoney(total * 0.15)
      },
      {
        title: 'Structure Disassembly Completion',
        description: 'Primary demo complete - structure disassembly finished',
        amount: roundMoney(total * 0.45)
      },
      {
        title: 'Debris Removal and Disposal',
        description: 'All debris removed and disposed of',
        amount: roundMoney(total * 0.3)
      },
      {
        title: 'Final Site Clean and Client Sign-off',
        description: 'Final site clean completed and client approval received',
        amount: roundMoney(total * 0.1)
      }
    ];
  }

  const deposit = depositAmount || roundMoney(total * 0.3);
  return [
    {
      title: 'Deposit/ Before Work Begins',
      description: 'Deposit required before work begins',
      amount: deposit
    },
    {
      title: 'Final Payment Upon Completion',
      description: 'Final payment due upon project completion and client satisfaction',
      amount: roundMoney(total - deposit)
    }
  ];
}

export function defaultDeposit(totalAmount: number, existing?: number): number {
  if (existing != null && Number.isFinite(existing) && existing > 0) return existing;
  return roundMoney((Number.isFinite(totalAmount) ? totalAmount : 0) * 0.3);
}
