import { Badge } from '@/components/ui/card';

const TONES: Record<string, 'neutral' | 'primary' | 'success' | 'danger' | 'muted'> = {
  Lead: 'muted',
  Draft: 'neutral',
  Sent: 'muted',
  Approved: 'primary',
  Signed: 'primary',
  Active: 'success',
  Completed: 'success',
  Rejected: 'danger',
  Cancelled: 'danger',
  Expired: 'muted',
  Inactive: 'muted'
};

export function StatusPill({ status }: { status: string }) {
  return <Badge tone={TONES[status] || 'neutral'}>{status}</Badge>;
}
