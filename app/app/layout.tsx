import type { ReactNode } from 'react';
import { requireAuth } from '@/lib/auth';
import AppShell from './components/AppShell';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { user } = await requireAuth();

  return <AppShell user={user}>{children}</AppShell>;
}
