'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

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
    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`, {
      cache: 'no-store'
    })
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
    <div className="auth-page">
      <div className="auth-card">
        <h1>Signing you in</h1>
        {error ? (
          <>
            <p className="error-text">{error}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => router.push('/login')}
            >
              Back to login
            </button>
          </>
        ) : (
          <p>Verifying your magic link…</p>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page">
          <div className="auth-card">
            <h1>Signing you in</h1>
            <p>Verifying your magic link…</p>
          </div>
        </div>
      }
    >
      <VerifyInner />
    </Suspense>
  );
}
