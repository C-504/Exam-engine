import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'StudyFlow - Learn Smarter',
  description: 'Quiz-based learning MVP powered by Supabase and Next.js.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-canvas text-white">
      <body className={`${inter.variable} min-h-screen bg-canvas text-zinc-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
