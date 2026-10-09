import * as React from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:border-primary',
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'flex min-h-24 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:border-primary',
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      className={cn('text-sm font-semibold text-navy', className)}
      {...props}
    />
  );
}
