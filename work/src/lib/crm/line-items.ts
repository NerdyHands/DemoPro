import type { LineItem } from './types';

export function normalizeLineItems(value: unknown): LineItem[] {
  if (typeof value === 'string' && value.trim()) {
    try {
      return normalizeLineItems(JSON.parse(value));
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  return value.map(item => {
    const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
    const notes = Array.isArray(row.notes)
      ? row.notes.filter((note): note is string => typeof note === 'string')
      : typeof row.notes === 'string' && row.notes
        ? [row.notes]
        : [];
    return {
      description: typeof row.description === 'string' ? row.description : '',
      quantity: Number(row.quantity) || 0,
      unitPrice: Number(row.unitPrice ?? row.unit_price) || 0,
      notes
    };
  });
}

export function serializeLineItems(items: LineItem[]): string {
  return JSON.stringify(items);
}

export function lineItemTotal(item: LineItem): number {
  return roundMoney(item.quantity * item.unitPrice);
}

export function sumLineItems(items: LineItem[]): number {
  return roundMoney(items.reduce((sum, item) => sum + lineItemTotal(item), 0));
}

export function roundMoney(value: number): number {
  return Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
}
