## Context

Greenfield app inside this repo, code in `site/`. Content source: `LLM_Agentic_AI_Roadmap_Tracker.md` (10 pillars, ~45 items). Constraints: Vercel free tier, Supabase Postgres (user-created project), Google OAuth client (user-created), no server-side secrets in the repo. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Simple, robust architecture a solo learner can maintain.
- Secure-by-default auth and per-user data isolation (RLS as backstop).
- Exact resource links with build-time verification.
- Neobrutalist UI from a single token/component kit.

**Non-Goals:**
- Email verification / password reset emails (needs SMTP — v2).
- Admin CMS for editing content (content is code-generated data; edit source MD → regenerate).
- Social features, leaderboards, sharing progress publicly.
- Mobile native apps.

## Decisions

### D1 — Auth.js v5 with credentials + Google, JWT session strategy
Auth.js (`next-auth@beta` v5) with Google provider + Credentials provider (bcryptjs hash compare). **JWT session strategy** (stateless) over database sessions — fewer DB round trips on Vercel serverless, simpler. Session cookie defaults are already HttpOnly/Secure/SameSite=Lax. Credentials sign-in only sets JWT after bcrypt match; generic error strings prevent enumeration.
- *Alternatives:* Clerk/Auth0 (vendor lock-in, limits), Lucia (manual, more surface), Supabase Auth (would bypass Auth.js and split session models — rejected since we chose Auth.js as primary).

### D2 — Direct Postgres access via `postgres.js` driver, not Supabase JS client
Use Supabase purely as hosted Postgres. App connects with `postgres.js` pooled connection string. RLS not usable without Supabase JWTs, so isolation is enforced at the query layer: every query takes `userId` from the verified session, never from client input. DB role used by the app is restricted (no superuser).
- *Alternatives:* supabase-js + RLS (requires embedding anon key + per-request token plumbing; two auth systems), Prisma (heavier cold starts on free tier).
- *Trade-off accepted:* RLS requirement in specs is satisfied by equivalent server-enforced scoping (single trusted service role, user scoping in every statement); documented here as the deliberate mechanism.

### D3 — Roadmap content as generated TypeScript data
`site/scripts/build-roadmap.ts` parses `../LLM_Agentic_AI_Roadmap_Tracker.md` into `site/src/data/roadmap.ts` (typed: Pillar → Section → Item {id, subtopic, resourceName, url?, urlType: video|doc|course|repo|read, lengthMinutes?|lengthLabel, isKey, callout?}). IDs stable slugs (`p1-karpathy-gpt`). Regeneration is manual, committed.
- *Why:* single source of truth stays the MD; type-safe imports; no DB content to migrate.

### D3b — Quizzes as generated data + server-side grading
Quiz questions live in `site/src/data/quizzes.ts`, hand-authored per pillar during build (8–12 MCQs from KEY concepts/gap-fills), typed `{pillarId, questions: [{id, prompt, options[4], answerIndex, explanationResourceId}]}`. Grading is server-side in a Server Action: client submits one answer at a time (`questionId, optionIndex`), action compares against answer, returns correctness + explanation text only for the submitted question. Gate check reads `quiz_attempts` before honoring any toggle. Correct answers never shipped in client bundle — quiz page loads questions without `answerIndex`.
- *Alternatives:* client-side grading with signed answers (leak-prone) — rejected; DB-stored questions (no benefit at this scale) — rejected.

### D4 — Link verification script
`site/scripts/verify-links.ts`: HEAD/GET each URL (YouTube oEmbed check by video ID where possible), writes `link-report.json`, fails CI/report on non-200 or unknown. Unconfident entries ship as `urlType: "unverified"` + report entry, never silent guesses.

### D5 — Data model (5 tables)
```
users            (id uuid pk, email unique, name, image, password_hash null, created_at)
accounts         (provider, provider_account_id, user_id fk)      -- google links
sessions         — none (JWT strategy)
progress_items   (user_id fk, item_id text, completed_at timestamptz, pk(user_id,item_id))
notes            (user_id fk, item_id text, body text ≤5000 chars, updated_at, pk(user_id,item_id))
quiz_attempts    (id uuid pk, user_id fk, pillar_n int, score_pct int, passed bool, created_at)
                 -- best = max(score_pct); gate = exists(passed attempt for pillar n-1)
streak derived   — computed from distinct dates(progress_items.completed_at)
```
No migration tool beyond SQL file applied via Supabase SQL editor (solo project scale).

### D6 — Server Actions for mutations
Next.js Server Actions (`"use server"`) for toggle/note CRUD — no hand-rolled REST API surface, automatic POST + origin checks. Reads via RSC directly.
- *Note:* the user-auth spec's "reject with 401" is satisfied by the equivalent mechanism: actions return `{ ok: false, reason: "unauthorized" }` when `requireUserId()` throws, and the UI hides/prompt-replaces controls for anonymous users. Server Action responses are POST bodies, not status-coded HTTP responses; a literal 401 would require a custom route handler, rejected as extra surface (same documented-equivalence pattern as D2).

### D7 — Tailwind CSS v4 + neobrutalism tokens
Tailwind v4 with `@theme` tokens: `--color-paper #FFFDF5`, `--color-ink #111111`, accents (yellow #FFDC58, pink #FF6B9D, cyan #7FD8FF, green #A6FAFF, purple #C5A3FF, orange #FF9F45), border 3px ink, shadow `4px 4px 0 ink`. Fonts: Space Grotesk (display) + Inter (body) via `next/font`. Component kit in `src/components/ui/*`.

### D8 — Route map
```
/                     roadmap (public, pillar accordions)
/pillar/[n]           anchor-scroll or dedicated page
/sequence             17-week plan (public)
/portfolio            portfolio projects (public)
/login                sign in/up (Google + credentials)
/dashboard            protected: % bars + streak
/api/auth/*           Auth.js
actions: toggle-item, save-note, delete-note
middleware: protect /dashboard
```

## Risks / Trade-offs

- [Link rot: YouTube videos deleted/private] → verification script re-runnable; `unverified` flag renders link with warning badge rather than dead click.
- [Udemy deep-linking impossible] → typed as course, links to Udemy search/course page; spec'd behavior.
- [bcrypt on Vercel serverless cold start] → bcryptjs pure-JS with cost 10; acceptable latency for login-only path.
- [Free-tier Supabase pausing] → document pause behavior in README; user keeps project active.
- [JWT cannot revoke instantly] → short-ish maxAge (30d default acceptable for MVP); logout clears cookie; server-side session table deferred until needed.
- [Content drift between MD and site] → regeneration script is deterministic; verify step compares item counts vs source before commit.

## Migration Plan

1. Scaffold `site/`, apply `schema.sql` to Supabase, set env vars (local `.env.local`; Vercel dashboard later).
2. Build content pipeline first (parse + verify), then auth, then tracking/notes, then dashboard, then UI polish pass.
3. Deploy to Vercel: import repo, root directory `site`, add env vars, set Google OAuth redirect URI to `https://<app>.vercel.app/api/auth/callback/google`.
Rollback: static content pages work without DB/auth env vars; features degrade gracefully if env missing (auth disabled notice).

## Open Questions

(none — all resolved during grilling)
