'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import type { Profile } from '@/lib/auth';

type UserMenuProps = {
  user: User;
  profile: Profile;
};

const getInitials = (user: User) => {
  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? '';
  const [first, second] = name.trim().split(' ');
  const initialA = first?.[0] ?? 'U';
  const initialB = second?.[0] ?? '';
  return `${initialA}${initialB}`.toUpperCase();
};

export default function UserMenu({ user, profile }: UserMenuProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const initials = getInitials(user);
  const isSuperuser = profile.role === 'superuser' || profile.role === 'admin';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    router.replace('/');
    router.refresh();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold text-white transition hover:border-accent hover:bg-accent/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {initials}
      </button>
      {open ? (
        <div
          className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-surface/95 shadow-xl shadow-black/40 backdrop-blur"
          role="menu"
        >
          {isSuperuser ? (
            <>
              <Link
                href="/app/user-management"
                className="block px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                User Management
              </Link>
              <Link
                href="/app/user-management"
                className="block px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                Admin Dashboard
              </Link>
            </>
          ) : null}
          <Link
            href="/app/settings"
            className="block px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <button
            type="button"
            className="block w-full px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/10"
            role="menuitem"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
