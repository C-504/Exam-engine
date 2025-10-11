import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'StudyFlow — Learn Smarter',
  description: 'Quiz-based learning MVP powered by Supabase and Next.js.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-canvas text-white">
      <body className={`${inter.variable} min-h-screen bg-canvas text-zinc-100 antialiased`}>
        <div className="flex min-h-screen flex-col bg-canvas">
          <header className="border-b border-white/10 backdrop-blur">
            <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
              <div className="text-lg font-semibold tracking-tight">
                <span className="text-white">Study</span>
                <span className="text-accent">Flow</span>
              </div>
              <Link
                href="/login"
                className="rounded-full border border-accent/40 bg-accent/10 px-5 py-2 text-sm font-medium text-white transition hover:border-accent hover:bg-accent"
              >
                Log in
              </Link>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/10">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 text-xs text-subtle">
              <p>&copy; {new Date().getFullYear()} StudyFlow. All rights reserved.</p>
              <p>Built with Next.js, Supabase, and Netlify.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
