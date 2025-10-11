# StudyFlow

Quiz-driven learning MVP built with Next.js 14 (App Router), Supabase for authentication/data, Tailwind CSS styling, and Netlify deployment support.

## Tech Stack
- **Framework**: Next.js 14 (TypeScript, App Router)
- **Auth & Database**: Supabase (Row-Level Security enabled)
- **Styling**: Tailwind CSS with a dark/violet palette
- **Deployment**: Netlify (`@netlify/plugin-nextjs`)
- **State**: Supabase Auth helpers for browser/server components

## Features
- Landing page with marketing hero and quick access to login/dashboard.
- Email magic-link authentication via Supabase Auth UI.
- Auth-protected `/app` workspace with sidebar, top bar, and user menu.
- Supabase-driven role-based schema with RLS policies and seeded quiz questions.
- Netlify-ready configuration and build scripts.

## Getting Started

### Prerequisites
- Node.js 18+ and npm 9+ (recommended)
- Supabase account (https://supabase.com)

### 1. Clone & Install
```bash
git clone <repo-url>
cd exam-engine
npm install
```

### 2. Provision Supabase
1. Create a new Supabase project.
2. In the dashboard, open **SQL Editor**, paste the contents of `supabase_schema.sql`, and run it once.  
   This sets up tables, row-level security, policies, helper functions, and 20 seed questions.
3. In **Authentication → URL Configuration**, add:
   - `http://localhost:3000` (local development)
   - Your production domain (once deployed, e.g., `https://your-site.netlify.app`)

### 3. Configure Environment
Create or edit `.env.local` in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="public-anon-key"
```
Only public values are required; no server-side service keys are used.

### 4. Run Locally
```bash
npm run dev
```
Visit `http://localhost:3000`, click **Log in**, and request a magic link. After authentication, you’ll land on `/app/home`.

## Project Structure
```
app/
├─ page.tsx                # Marketing landing page
├─ login/page.tsx          # Supabase Auth UI (magic link)
└─ app/                    # Auth-protected workspace
   ├─ layout.tsx           # RLS guard + app shell
   ├─ page.tsx             # Redirects to /app/home
   ├─ home/page.tsx        # Dashboard placeholder
   └─ settings/page.tsx    # Settings placeholder
lib/
├─ supabaseBrowser.ts      # Client-side Supabase helper
├─ supabaseServer.ts       # Server component Supabase helper
└─ auth.ts                 # Auth guard
supabase_schema.sql        # Database schema + seed
```

## Scripts
- `npm run dev` – Start Next.js dev server
- `npm run build` – Production build
- `npm run start` – Run production build locally
- `npm run lint` – Lint using ESLint/Next.js rules

## Deployment
1. Push to GitHub (or your Git provider).
2. In Netlify, create a new site from the repo:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables in Netlify.
4. Deploy. Update Supabase auth redirect URLs with the Netlify domain if you haven’t yet.

## Supabase Schema Highlights
- `profiles` table references `auth.users` and enforces role-based security.
- `questions`, `quiz_sessions`, and `quiz_answers` include indices for common lookups.
- RLS policies ensure:
  - Users only access their own profile/sessions/answers.
  - Admins manage questions and view all submissions.
  - Anonymous users cannot read sensitive data.

## Troubleshooting
- **Missing Supabase env**: The helpers throw during build if `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` isn’t set.
- **Auth redirect errors**: Ensure Supabase → Authentication → URL configuration includes your local and production origins.
- **Stale dependencies**: Rerun `npm install` whenever `package.json` changes.

## License
MIT License – feel free to adapt for your own learning platform.
