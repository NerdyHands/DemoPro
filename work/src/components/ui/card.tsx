import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-white p-5 shadow-sm', className)}
      {...props}
    />
  );
}

export function Badge({
  className,
  tone = 'neutral',
  ...props
}: React.ComponentProps<'span'> & {
  tone?: 'neutral' | 'primary' | 'success' | 'danger' | 'muted';
}) {
  const tones = {
    neutral: 'bg-surface text-muted',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-emerald-50 text-emerald-700',
    danger: 'bg-red-50 text-danger',
    muted: 'bg-slate-100 text-muted'
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide',
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
