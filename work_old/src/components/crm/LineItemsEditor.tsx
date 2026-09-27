'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { LineItem } from '@/lib/crm/types';
import { lineItemTotal, sumLineItems } from '@/lib/crm/line-items';
import { money } from '@/lib/utils';

export function LineItemsEditor({
  value,
  onChange
}: {
  value: LineItem[];
  onChange: (items: LineItem[]) => void;
}) {
  const [items, setItems] = useState(value.length ? value : emptyRow());

  function commit(next: LineItem[]) {
    setItems(next);
    onChange(next.filter(item => item.description.trim() || item.quantity || item.unitPrice));
  }

  function emptyRow(): LineItem[] {
    return [{ description: '', quantity: 1, unitPrice: 0, notes: [] }];
  }

  return (
    <div className="space-y-3">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="pb-2 font-medium">Description</th>
              <th className="w-24 pb-2 font-medium">Qty</th>
              <th className="w-32 pb-2 font-medium">Unit price</th>
              <th className="w-28 pb-2 font-medium">Total</th>
              <th className="w-16 pb-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-border/70">
                <td className="py-2 pr-2">
                  <Input
                    value={item.description}
                    onChange={event => {
                      const next = [...items];
                      next[index] = { ...item, description: event.target.value };
                      commit(next);
                    }}
                  />
                </td>
                <td className="py-2 pr-2">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantity}
                    onChange={event => {
                      const next = [...items];
                      next[index] = { ...item, quantity: Number(event.target.value) || 0 };
                      commit(next);
                    }}
                  />
                </td>
                <td className="py-2 pr-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={event => {
                      const next = [...items];
                      next[index] = { ...item, unitPrice: Number(event.target.value) || 0 };
                      commit(next);
                    }}
                  />
                </td>
                <td className="py-2 pr-2 font-medium">{money(lineItemTotal(item))}</td>
                <td className="py-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => commit(items.filter((_, i) => i !== index))}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border border-border p-3">
            <Input
              className="mb-2"
              placeholder="Description"
              value={item.description}
              onChange={event => {
                const next = [...items];
                next[index] = { ...item, description: event.target.value };
                commit(next);
              }}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={item.quantity}
                onChange={event => {
                  const next = [...items];
                  next[index] = { ...item, quantity: Number(event.target.value) || 0 };
                  commit(next);
                }}
              />
              <Input
                type="number"
                step="0.01"
                value={item.unitPrice}
                onChange={event => {
                  const next = [...items];
                  next[index] = { ...item, unitPrice: Number(event.target.value) || 0 };
                  commit(next);
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span>{money(lineItemTotal(item))}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => commit(items.filter((_, i) => i !== index))}>
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => commit([...items, { description: '', quantity: 1, unitPrice: 0, notes: [] }])}
        >
          Add line
        </Button>
        <p className="font-heading text-base font-semibold text-navy">
          Total {money(sumLineItems(items))}
        </p>
      </div>
    </div>
  );
}
