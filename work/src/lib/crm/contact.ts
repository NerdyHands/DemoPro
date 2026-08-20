export const CONTACT_COLUMNS = [
  { key: '7-days', label: '7 Days' },
  { key: '14-days', label: '14 Days' },
  { key: '1-month', label: '1 Month' },
  { key: '3-months', label: '3 Months' },
  { key: 'older', label: 'Older' },
  { key: 'no-contact', label: 'No contact' }
] as const;

export type ContactBucket = (typeof CONTACT_COLUMNS)[number]['key'];

export function daysSince(value?: string | null): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return null;
  return Math.max(0, Math.floor((Date.now() - time) / 86_400_000));
}

export function contactBucket(lastContactAt?: string | null): ContactBucket {
  const days = daysSince(lastContactAt);
  if (days === null) return 'no-contact';
  if (days <= 7) return '7-days';
  if (days <= 14) return '14-days';
  if (days <= 30) return '1-month';
  if (days <= 90) return '3-months';
  return 'older';
}

export function contactMeta(lastContactAt?: string | null): string {
  const days = daysSince(lastContactAt);
  if (days === null) return 'No estimate or contract yet';
  if (days === 0) return 'Contacted today';
  if (days === 1) return '1 day since contact';
  return `${days} days since contact`;
}
