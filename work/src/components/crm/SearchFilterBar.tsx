'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function SearchFilterBar({ statuses }: { statuses: readonly string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const activeStatus = params.get('status') || 'all';

  function apply(next: { q?: string; status?: string }) {
    const search = new URLSearchParams(params.toString());
    const q = next.q ?? query;
    const status = next.status ?? activeStatus;
    if (q) search.set('q', q);
    else search.delete('q');
    if (status && status !== 'all') search.set('status', status);
    else search.delete('status');
    router.push(`?${search.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-col gap-3">
      <form
        className="flex gap-2"
        onSubmit={event => {
          event.preventDefault();
          apply({ q: query });
        }}
      >
        <Input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search name, email, phone, or number"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>
      <div className="flex flex-wrap gap-2">
        {['all', ...statuses].map(status => (
          <button
            key={status}
            type="button"
            onClick={() => apply({ status })}
            className={cn(
              'min-h-10 rounded-full border px-3 text-sm font-medium capitalize',
              activeStatus === status
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-white text-foreground hover:border-primary hover:text-primary'
            )}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
}
