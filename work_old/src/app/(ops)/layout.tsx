import { AdminShell } from '@/components/AdminShell';
import type { ReactNode } from 'react';

export default function OpsLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
