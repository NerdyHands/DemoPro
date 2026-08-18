'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

function VerifyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Missing token');
      return;
    }

    let cancelled = false;
    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
      .then(async response => {
        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(data.error || 'Magic link is invalid or expired');
        }
        if (!cancelled) {
          router.replace('/');
          router.refresh();
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to verify');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-white p-8 shadow-md">
        <h1 className="font-heading text-2xl font-semibold text-navy">Signing you in</h1>
        {error ? (
          <>
            <p className="mt-3 text-sm text-danger">{error}</p>
            <Button className="mt-4" type="button" onClick={() => router.push('/login')}>
              Back to login
            </Button>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted">Verifying your magic link…</p>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface p-6">
          <div className="w-full max-w-md rounded-xl border border-border bg-white p-8 shadow-md">
            <h1 className="font-heading text-2xl font-semibold text-navy">Signing you in</h1>
            <p className="mt-3 text-sm text-muted">Verifying your magic link…</p>
          </div>
        </div>
      }
    >
      <VerifyInner />
    </Suspense>
  );
}
