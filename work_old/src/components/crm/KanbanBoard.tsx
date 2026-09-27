'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { StatusPill } from '@/components/crm/StatusPill';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type KanbanCard = {
  id: string;
  status: string;
  badge?: string;
  title: string;
  subtitle?: string;
  value?: string;
  meta?: string;
  href?: string;
};

export type KanbanColumn = {
  key: string;
  label?: string;
};

export type KanbanCardAction = {
  label: string;
  whenStatus?: string;
  toStatus?: string;
  href?: string;
};

export function KanbanBoard({
  items,
  columns,
  separatorAfter,
  statusUrlPrefix,
  emptyLabel = 'No records',
  actions = [],
  disabled
}: {
  items: KanbanCard[];
  columns: KanbanColumn[];
  separatorAfter?: string;
  statusUrlPrefix: string;
  emptyLabel?: string;
  actions?: KanbanCardAction[];
  disabled?: boolean;
}) {
  const router = useRouter();
  const [records, setRecords] = useState(items);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setRecords(items);
  }, [items]);

  const grouped = useMemo(() => {
    const map = new Map<string, KanbanCard[]>();
    for (const column of columns) map.set(column.key, []);
    for (const record of records) {
      const list = map.get(record.status);
      if (list) list.push(record);
    }
    return map;
  }, [columns, records]);

  async function moveToStatus(id: string, status: string) {
    const current = records.find(record => record.id === id);
    if (!current || current.status === status || disabled) return;
    const previous = records;
    setBusyId(id);
    setError('');
    setRecords(prev => prev.map(record => (record.id === id ? { ...record, status } : record)));
    try {
      const response = await fetch(`${statusUrlPrefix}${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Could not update status');
      }
      router.refresh();
    } catch (err) {
      setRecords(previous);
      setError(err instanceof Error ? err.message : 'Could not update status');
    } finally {
      setBusyId(null);
      setDragId(null);
      setOverStatus(null);
    }
  }

  function actionHref(template: string, id: string) {
    return template.replaceAll('{{id}}', id);
  }

  return (
    <div>
      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column, index) => {
          const columnItems = grouped.get(column.key) || [];
          const showSeparator = Boolean(separatorAfter && columns[index - 1]?.key === separatorAfter);
          return (
            <div key={column.key} className="flex shrink-0 gap-4">
              {showSeparator ? <div className="w-px self-stretch bg-border" aria-hidden /> : null}
              <section
                className={cn(
                  'flex w-72 flex-col rounded-xl border border-border bg-white p-3',
                  overStatus === column.key && 'border-dashed border-primary bg-primary/5'
                )}
                onDragOver={event => {
                  event.preventDefault();
                  setOverStatus(column.key);
                }}
                onDragLeave={() => {
                  if (overStatus === column.key) setOverStatus(null);
                }}
                onDrop={event => {
                  event.preventDefault();
                  const id = event.dataTransfer.getData('text/plain') || dragId;
                  if (id) void moveToStatus(id, column.key);
                }}
              >
                <header className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-navy">{column.label || column.key}</h2>
                  <span className="text-xs text-muted">{columnItems.length}</span>
                </header>
                <div className="flex min-h-32 flex-col gap-3">
                  {columnItems.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted">
                      {emptyLabel}
                    </p>
                  ) : (
                    columnItems.map(item => (
                      <article
                        key={item.id}
                        draggable={!disabled}
                        onDragStart={event => {
                          setDragId(item.id);
                          event.dataTransfer.setData('text/plain', item.id);
                          event.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragEnd={() => {
                          setDragId(null);
                          setOverStatus(null);
                        }}
                        className={cn(
                          'rounded-lg border border-border bg-surface p-3 shadow-sm',
                          dragId === item.id && 'opacity-50',
                          !disabled && 'cursor-grab'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-navy">{item.title}</p>
                            {item.subtitle ? (
                              <p className="mt-0.5 truncate text-sm text-muted">{item.subtitle}</p>
                            ) : null}
                          </div>
                          <StatusPill status={item.badge || item.status} />
                        </div>
                        {item.value ? <p className="mt-2 text-sm font-semibold">{item.value}</p> : null}
                        {item.meta ? (
                          <p className="mt-1 text-xs uppercase tracking-wide text-muted">{item.meta}</p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.href ? (
                            <Button asChild size="sm" variant="outline">
                              <a href={item.href}>View</a>
                            </Button>
                          ) : null}
                          {actions
                            .filter(action => !action.whenStatus || action.whenStatus === item.status)
                            .map(action =>
                              action.href ? (
                                <Button asChild key={`${item.id}-${action.label}`} size="sm">
                                  <a href={actionHref(action.href, item.id)}>{action.label}</a>
                                </Button>
                              ) : action.toStatus ? (
                                <Button
                                  key={`${item.id}-${action.label}`}
                                  size="sm"
                                  type="button"
                                  disabled={busyId === item.id}
                                  onClick={() => void moveToStatus(item.id, action.toStatus as string)}
                                >
                                  {action.label}
                                </Button>
                              ) : null
                            )}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          );
        })}
      </div>
    </div>
  );
}
