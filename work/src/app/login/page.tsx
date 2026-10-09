'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/crm/PageHeader';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function sendMagicLink() {
    setError('');
    setSent(false);
    setLoading(true);
    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = (await response.json()) as {
        error?: string;
        fields?: { email?: string };
      };
      if (!response.ok) {
        setError(data.fields?.email || data.error || 'Unable to send magic link');
        return;
      }
      setSent(true);
    } catch {
      setError('Unable to send magic link');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-white p-8 shadow-md">
        <Image
          src="/header-logo.webp"
          alt="Mr Demo Pro"
          width={180}
          height={54}
          className="mb-4 h-12 w-auto"
        />
        <h1 className="font-heading text-2xl font-semibold text-navy">Operator sign in</h1>
        <p className="mb-5 mt-2 text-sm text-muted">
          Enter an allowlisted email to receive a magic sign-in link.
        </p>
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void sendMagicLink();
              }
            }}
          />
        </Field>
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
        {sent ? (
          <p className="mt-3 text-sm text-primary">Check your inbox for the sign-in link.</p>
        ) : null}
        <Button
          className="mt-5 w-full"
          type="button"
          onClick={sendMagicLink}
          disabled={loading || !email.trim()}
        >
          {loading ? 'Sending…' : 'Send magic link'}
        </Button>
      </div>
    </div>
  );
}
