'use client';

import { useState } from 'react';

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
    <div className="auth-page">
      <div className="auth-card">
        <h1>Mr Demo Pro Admin</h1>
        <p>Enter an allowlisted email to receive a magic sign-in link.</p>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
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
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        {sent ? (
          <p className="success-text">Check your inbox for the sign-in link.</p>
        ) : null}
        <button
          type="button"
          className="btn btn-primary"
          onClick={sendMagicLink}
          disabled={loading || !email.trim()}
        >
          {loading ? 'Sending…' : 'Send magic link'}
        </button>
      </div>
    </div>
  );
}
