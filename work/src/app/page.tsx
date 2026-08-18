import { AdminShell } from '@/components/AdminShell';
import { getConfigStatus } from '@/lib/env';

export const dynamic = 'force-dynamic';

const STATUS_ROWS: { key: keyof ReturnType<typeof getConfigStatus>; label: string }[] = [
  { key: 'airtableToken', label: 'AIRTABLE_TOKEN' },
  { key: 'adminsBase', label: 'AIRTABLE_ADMINS_BASE_ID' },
  { key: 'adminsTable', label: 'AIRTABLE_ADMINS_TABLE_ID' },
  { key: 'adminsView', label: 'AIRTABLE_ADMINS_VIEW_ID' },
  { key: 'sessionSecret', label: 'ADMIN_SESSION_SECRET' },
  { key: 'resend', label: 'RESEND_API_KEY' },
  { key: 'fromEmail', label: 'RESEND_FROM_EMAIL' },
  { key: 'appUrl', label: 'NEXT_PUBLIC_APP_URL' },
  { key: 'leadsBase', label: 'AIRTABLE_LEADS_BASE_ID' },
  { key: 'n8nWebhook', label: 'N8N_LEADS_WEBHOOK_URL' },
  { key: 'n8nSecret', label: 'N8N_WEBHOOK_SECRET' }
];

export default function HomePage() {
  const status = getConfigStatus();

  return (
    <AdminShell>
      <section className="panel">
        <h1>Lead gen not wired</h1>
        <p className="lede">
          Auth is ready. Outbound lead-gen (New Run, runs, leads drawer) waits
          on Airtable bases and an n8n webhook. Paste IDs into{' '}
          <code>.env.local</code> — values are never shown here.
        </p>
        <ul className="status-list">
          {STATUS_ROWS.map(row => {
            const ok = Boolean(status[row.key]);
            return (
              <li key={row.key}>
                <span>{row.label}</span>
                <span className={ok ? 'pill pill-ok' : 'pill pill-missing'}>
                  {ok ? 'Set' : 'Missing'}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </AdminShell>
  );
}
