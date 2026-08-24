# skilllog

Neobrutalist LLM / Agentic-AI learning roadmap + progress tracker. Next.js (App Router) + Auth.js v5 + Supabase Postgres, deployed on Vercel.

Roadmap content is public. Sign in to check off items, keep private notes, take pillar quizzes (≥70% unlocks the next pillar), and see your dashboard with streaks.

## Setup

### 1. Install and run locally

```bash
cd site
npm install
npm run dev        # http://localhost:3000
```

The site renders the public roadmap without any env vars; auth/tracking features degrade gracefully until you complete the steps below.

### 2. Supabase Postgres

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. Open **SQL Editor** → paste the contents of [`schema.sql`](./schema.sql) → **Run**.
3. Go to **Project Settings → Database → Connection string → URI** (use the **session pooler** port 5432 variant) and copy it.
4. Put it in `site/.env.local` as `DATABASE_URL` (replace `[YOUR-PASSWORD]`).

Note: free-tier Supabase projects pause after ~1 week of inactivity - restore from the dashboard if that happens.

### 3. Google OAuth client

1. [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials → Create credentials → OAuth client ID**.
2. Application type: **Web application**.
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://YOUR-APP.vercel.app/api/auth/callback/google` (prod - add after first deploy)
4. Copy client ID/secret into `.env.local` as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

Skip this to run email/password only - the Google button hides itself when the env vars are missing.

### 4. Auth secret

```bash
openssl rand -base64 32   # → AUTH_SECRET in .env.local
```

`.env.example` lists all four variables.

## Deploy to Vercel

1. Push this repo to GitHub, then **Add New Project** at [vercel.com/new](https://vercel.com/new).
2. Set **Root Directory** to `site`.
3. Add env vars: `AUTH_SECRET`, `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (same values as local; use the prod callback URI in Google Console).
4. Deploy, then add your `https://YOUR-APP.vercel.app/api/auth/callback/google` redirect URI in Google Cloud Console.

## Content pipeline (maintainers)

Source of truth is `../LLM_Agentic_AI_Roadmap_Tracker.md`. After editing it:

```bash
npx tsx scripts/build-roadmap.ts    # regenerate src/data/roadmap.ts
npx tsx scripts/build-quizzes.ts    # regenerate src/data/quizzes.ts
npx tsx scripts/verify-links.ts     # re-check all resource URLs → link-report.json
```

Commit regenerated data files together with the MD edit.

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build
npm run lint     # eslint
```
