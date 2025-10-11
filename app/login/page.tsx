'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';

export default function LoginPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/app/home');
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.replace('/app/home');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <section className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-surface/80 p-8 shadow-2xl shadow-black/30 backdrop-blur">
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-subtle">
            Sign in with a magic link. We&apos;ll send it straight to your inbox.
          </p>
          <div className="mt-8">
            <Auth
              supabaseClient={supabase}
              providers={[]}
              view="magic_link"
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#6d28d9',
                      brandAccent: '#8b5cf6',
                      inputBackground: '#18181b',
                      inputBorder: '#27272a',
                      inputBorderHover: '#3f3f46'
                    }
                  }
                }
              }}
              magicLink
            />
          </div>
        </div>
      </section>
    </div>
  );
}
