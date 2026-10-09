'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type DownloadAction = { label: string; href: string };
type JsonAction = { label: string; href: string; openUrl?: boolean; prompt?: string; promptField?: string };

export function DocumentActions({
  enabled,
  missingReason = 'Link a Mongo record (migrate or set MongoId) to export PDFs and send for signature.',
  downloads = [],
  posts = []
}: {
  enabled: boolean;
  missingReason?: string;
  downloads?: DownloadAction[];
  posts?: JsonAction[];
}) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  async function download(action: DownloadAction) {
    setBusy(action.label);
    setError('');
    try {
      const response = await fetch(action.href, { cache: 'no-store' });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Download failed');
      }
      const blob = await response.blob();
      const disposition = response.headers.get('content-disposition') || '';
      const match = disposition.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1] || `${action.label.toLowerCase().replace(/\s+/g, '-')}`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setBusy('');
    }
  }

  async function post(action: JsonAction) {
    setBusy(action.label);
    setError('');
    try {
      const payload: Record<string, string> = {};
      if (action.prompt && action.promptField) {
        const value = window.prompt(action.prompt);
        if (!value) return;
        payload[action.promptField] = value;
      }
      const response = await fetch(action.href, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Request failed');
      const url = body.url || body.embedUrl;
      if (action.openUrl && typeof url === 'string') {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setBusy('');
    }
  }

  if (!enabled) {
    return <p className="mb-4 text-sm text-muted">{missingReason}</p>;
  }

  return (
    <div className="mb-4">
      {error ? <p className="mb-2 text-sm text-danger">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        {downloads.map(action => (
          <Button
            key={action.href}
            type="button"
            size="sm"
            variant="outline"
            disabled={Boolean(busy)}
            onClick={() => void download(action)}
          >
            {busy === action.label ? 'Working…' : action.label}
          </Button>
        ))}
        {posts.map(action => (
          <Button
            key={action.href}
            type="button"
            size="sm"
            disabled={Boolean(busy)}
            onClick={() => void post(action)}
          >
            {busy === action.label ? 'Working…' : action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
