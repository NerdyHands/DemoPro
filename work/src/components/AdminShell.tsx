'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

type MeResponse = {
  email?: string;
  name?: string;
};

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(async response => {
        if (!response.ok) return null;
        return (await response.json()) as MeResponse;
      })
      .then(data => {
        if (!cancelled) setMe(data);
      })
      .catch(() => {
        if (!cancelled) setMe(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', cache: 'no-store' });
    } finally {
      router.push('/login');
      router.refresh();
    }
  }

  return (
    <div>
      <header className="shell-header">
        <div className="shell-brand">Mr Demo Pro</div>
        <div className="shell-meta">
          {me?.email ? <span>{me.name || me.email}</span> : null}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </header>
      <main className="shell-main">{children}</main>
    </div>
  );
}
