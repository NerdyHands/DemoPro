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
  Inactive: 'muted',
  Pending: 'muted',
  Assigned: 'primary',
  'In Progress': 'primary',
  'On Hold': 'muted',
  'Needs Review': 'danger',
  draft: 'neutral',
  sent: 'muted',
  approved: 'primary',
  rejected: 'danger',
  expired: 'muted',
  cancelled: 'danger',
  'Pending Approval': 'muted',
  'In Review': 'primary',
  'Sent to Client': 'success',
  Archived: 'muted'
};

export function StatusPill({ status }: { status: string }) {
  return <Badge tone={TONES[status] || 'neutral'}>{status}</Badge>;
}
