"use client";

import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserMenu from './UserMenu';

const sections = [
  { label: 'Quiz Set', href: '/app/home' },
  { label: 'Mathematics', href: '/app/quiz/mathematics' },
  { label: 'History', href: '/app/quiz/history' },
  { label: 'Science', href: '/app/quiz/science' },
  { label: 'Literature', href: '/app/quiz/literature' },
  { label: 'Geography', href: '/app/quiz/geography' },
  { label: 'My Results', href: '/app/results' }
];

type AppShellProps = {
  children: ReactNode;
  user: User;
};

export default function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-canvas text-zinc-100">
      <aside className="hidden w-64 border-r border-white/10 bg-surface/80 px-6 py-8 shadow-2xl shadow-black/30 backdrop-blur lg:flex lg:flex-col">
        <div className="mb-8 text-lg font-semibold tracking-tight">
          <span className="text-white">Study</span>
          <span className="text-accent">Flow</span>
        </div>
        <nav className="space-y-2 text-sm font-medium text-subtle">
          {sections.map((section) => {
            const isActive =
              pathname === section.href ||
              (section.href !== '/app/home' && pathname.startsWith(section.href));

            return (
              <Link
                key={section.href}
                href={section.href}
                className={`flex w-full items-center justify-start rounded-lg px-3 py-2 transition ${
                  isActive
                    ? 'bg-accent text-white shadow-lg shadow-accent/40'
                    : 'hover:bg-white/5 hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {section.label}
              </Link>
            );
          })}
          <Link
            href="/app/quiz/all"
            className={`flex w-full items-center justify-start rounded-lg px-3 py-2 transition ${
              pathname === '/app/quiz/all'
                ? 'bg-accent text-white shadow-lg shadow-accent/40'
                : 'hover:bg-white/5 hover:text-white'
            }`}
            aria-current={pathname === '/app/quiz/all' ? 'page' : undefined}
          >
            All Topics
          </Link>
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 backdrop-blur">
          <h1 className="text-xl font-semibold text-white">Quiz Set</h1>
          <UserMenu user={user} />
        </header>
        <main className="flex-1 bg-canvas px-6 py-10">
          <div className="mx-auto flex max-w-5xl flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
