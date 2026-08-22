## 1. Scaffold + Content Pipeline

- [x] 1.1 Create `site/` Next.js App Router TS app (Tailwind v4, ESLint), verify `npm run build` passes
- [x] 1.2 Write `site/scripts/build-roadmap.ts` parsing source MD → typed `src/data/roadmap.ts` (pillars, items, KEY flags, callouts, sequence, portfolio); verify output has 10 pillars, ~45 items, zero lost callouts
- [x] 1.3 Research exact URLs for all resources (web search per resource); record video IDs, course pages, docs/repo links in data; mark uncertain ones `unverified`
- [x] 1.4 Write `site/scripts/verify-links.ts` producing `link-report.json`; run until all URLs pass or flagged unverified

## 2. Database

- [x] 2.1 Write `site/schema.sql` (users, accounts, progress_items, notes) matching design D5
- [x] 2.2 Write `src/lib/db.ts` pooled postgres.js client + query helpers taking userId from session only; verify with local typecheck

## 3. Auth (user-auth spec)

- [x] 3.1 Configure Auth.js v5: Google provider + Credentials (bcryptjs), JWT strategy, secret from env; verify build without secrets degrades gracefully
- [x] 3.2 Build `/login` page: Google button, email/password sign-in + sign-up forms with validation; verify duplicate email and wrong password show generic errors
- [x] 3.3 Add logout action clearing cookie; verify session token rejected after logout
- [x] 3.4 Middleware protecting `/dashboard`; anonymous toggle/note attempts return 401; verify via curl/route test

## 4. Roadmap UI (roadmap-content + neobrutalism-ui specs)

- [x] 4.1 Define Tailwind `@theme` tokens + fonts per design D7; build component kit (Button, Card, Badge, Checkbox, Callout, ProgressBar, Nav, Modal, Input)
- [x] 4.2 Build homepage rendering pillars/sections/items from data with KEY badges, callout blocks, resource links (`target="_blank" rel="noopener noreferrer"`), type indicators for courses
- [x] 4.3 Build `/sequence` and `/portfolio` views; verify nav reaches both
- [x] 4.4 Responsive + a11y pass: 360px single column, keyboard focus rings, badge text labels; verify manually at 360px width

## 5. Progress + Notes (progress-tracking + notes specs)

- [x] 5.1 Server actions `toggle-item`, `save-note`, `delete-note` scoped to session user; verify optimistic UI rollback on failure
- [x] 5.2 Wire checkboxes into roadmap UI (auth-only controls), persisted state on reload; verify cross-user isolation by second account test

## 6. Quizzes (quizzes spec)

- [x] 6.1 Author `src/data/quizzes.ts`: 8–12 MCQs per pillar × 10 from KEY/gap-fill content with explanations referencing resource IDs; verify counts + every explanation maps to real resource
- [x] 6.2 Server actions `submit-answer` (server-side grading, no answerIndex in client bundle) + `quiz-attempt` persistence; verify crafted wrong-gate toggle rejected server-side
- [x] 6.3 Build `/quiz/[pillar]` page: one-question flow, instant right/wrong styling, explanation + resource link, score screen; verify retake keeps best score only
- [x] 6.4 Wire pass gate: next pillar checkboxes locked until ≥70% previous pillar; lock notice UI; verify gate in UI + server actions
- [x] 6.5 Dashboard shows best scores per pillar; verify alongside completion %

## 7. Dashboard + Stats (dashboard-stats spec)

- [x] 7.1 `/dashboard`: overall %, per-pillar % bars, counts, est. hours remaining (documented convention for untimed types)
- [x] 7.2 Streak view from distinct completion dates (current + longest); verify increment/break scenarios
- [x] 7.3 Empty-state and anonymous redirect behaviors verified

## 8. Hardening + Ship Prep

- [x] 8.1 Security review vs security-and-hardening skill: env handling, no secrets in logs, sanitized notes render, generic auth errors
- [x] 8.2 Full lint/typecheck/build green; manual E2E: sign up → check item → note → quiz pass gate → dashboard → logout → public view intact
- [x] 8.3 Write `site/.env.example`, README setup steps (Google OAuth console steps, Supabase SQL apply, Vercel deploy incl. root dir + callback URL)
- [x] 8.4 Update handoff doc; user deploys to Vercel
