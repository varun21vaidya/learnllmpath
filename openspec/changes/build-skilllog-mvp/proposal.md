## Why

The repo holds a complete, high-quality LLM/Agentic-AI learning roadmap as a static markdown file. Markdown cannot track per-user progress, hold personal notes, or show completion stats, and resource references lack clickable exact links. A web app turns this asset into an interactive tracker with accounts and persistent progress.

## What Changes

- New Next.js (App Router, TypeScript) web app **skilllog** in `site/`, deployed to Vercel free tier.
- Roadmap content (10 pillars, ~45 items, [KEY] badges, gap-fill callouts, 17-week sequence, portfolio projects) converted from `LLM_Agentic_AI_Roadmap_Tracker.md` into structured data.
- Every resource gets a verified exact URL (YouTube video ID where applicable) opening in a new tab; Udemy courses link to course search/course page (exact video deep-link impossible) and are typed `course`.
- Auth: Google OAuth + email/password (bcrypt), secure HTTP-only cookie sessions via Auth.js v5; logout.
- Public read-only roadmap browsing without login; checking items, saving notes, dashboard, stats require login.
- Progress tracking: per-item completion persisted in Supabase Postgres (row-level security).
- Progress dashboard: % per pillar + overall completion bar.
- Notes per resource: private per-user markdown-lite text.
- Stats/streak view: completed counts, estimated hours remaining.
- Neobrutalism design system (bold borders, vivid accents, hard shadows, raw contrast).

## Capabilities

### New Capabilities
- `roadmap-content`: Structured roadmap data model (pillars, sections, items, resources, badges, callouts, sequence, portfolio) rendered publicly from the MD source with exact verified links.
- `user-auth`: Google OAuth + email/password sign-in/sign-up, logout, secure sessions, route protection for tracking actions.
- `progress-tracking`: Check/uncheck roadmap items per user, persisted server-side with row-level security.
- `notes`: Per-user private notes attached to any roadmap item.
- `dashboard-stats`: Progress dashboard (% per pillar, overall bar) + stats/streak view (completed counts, est. hours remaining) + best quiz scores.
- `quizzes`: Per-pillar generated MCQ quizzes with explanations, pass-gating of next pillar tracking, best-score persistence.
- `neobrutalism-ui`: Design system — layout, components, typography, colors, interactions.

### Modified Capabilities
(none — greenfield)

## Impact

- New code: `site/` Next.js app (all app code lives here).
- New external deps: next, react, auth.js (@auth/core, @auth/prisma-adapter or custom Supabase adapter), bcryptjs, Tailwind CSS v4.
- External systems: Supabase Postgres (new project), Google Cloud OAuth client (user-created), Vercel hosting.
- Source content `LLM_Agentic_AI_Roadmap_Tracker.md` remains untouched as the canonical source; content data file is generated from it.
