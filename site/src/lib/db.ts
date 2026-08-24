import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

let client: postgres.Sql | null = null;

function db(): postgres.Sql {
  if (!client) {
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set. Apply schema.sql to your Supabase project and add DATABASE_URL to .env.local.");
    }
    client = postgres(connectionString, { max: 5, idle_timeout: 20, connect_timeout: 10 });
  }
  return client;
}

export interface ProgressRow {
  item_id: string;
}

export interface NoteRow {
  item_id: string;
  body: string;
  updated_at: Date;
}

export interface QuizBest {
  pillar_n: number;
  best_pct: number;
  passed: boolean;
}

export async function getProgress(userId: string): Promise<Set<string>> {
  const rows = await db()`select item_id from progress_items where user_id = ${userId}`;
  return new Set(rows.map((r) => r.item_id as string));
}

export async function toggleProgress(userId: string, itemId: string, complete: boolean) {
  if (complete) {
    await db()`
      insert into progress_items (user_id, item_id) values (${userId}, ${itemId})
      on conflict (user_id, item_id) do nothing
    `;
  } else {
    await db()`delete from progress_items where user_id = ${userId} and item_id = ${itemId}`;
  }
}

export async function getNotes(userId: string): Promise<Map<string, string>> {
  const rows = await db()`select item_id, body from notes where user_id = ${userId}`;
  return new Map(rows.map((r) => [r.item_id as string, r.body as string]));
}

export async function saveNote(userId: string, itemId: string, body: string) {
  const clean = body.slice(0, 5000);
  await db()`
    insert into notes (user_id, item_id, body) values (${userId}, ${itemId}, ${clean})
    on conflict (user_id, item_id) do update set body = ${clean}, updated_at = now()
  `;
}

export async function deleteNote(userId: string, itemId: string) {
  await db()`delete from notes where user_id = ${userId} and item_id = ${itemId}`;
}

export async function recordQuizAttempt(
  userId: string,
  pillarN: number,
  scorePct: number,
  passed: boolean
) {
  await db()`
    insert into quiz_attempts (user_id, pillar_n, score_pct, passed)
    values (${userId}, ${pillarN}, ${scorePct}, ${passed})
  `;
}

export async function getQuizBests(userId: string): Promise<Map<number, QuizBest>> {
  const rows = await db()`
    select pillar_n, max(score_pct)::int as best_pct, bool_or(passed) as passed
    from quiz_attempts where user_id = ${userId}
    group by pillar_n
  `;
  return new Map(rows.map((r) => [r.pillar_n as number, r as unknown as QuizBest]));
}

export async function hasPassedQuiz(userId: string, pillarN: number): Promise<boolean> {
  const rows = await db()`
    select 1 from quiz_attempts
    where user_id = ${userId} and pillar_n = ${pillarN} and passed = true
    limit 1
  `;
  return rows.length > 0;
}

export async function findUserByEmail(email: string) {
  const rows =
    await db()`select id, email, name, image, password_hash from users where lower(email) = lower(${email}) limit 1`;
  return rows[0] ?? null;
}

export async function createUser(email: string, name: string | null, passwordHash: string | null) {
  const rows = await db()`
    insert into users (email, name, password_hash) values (${email}, ${name}, ${passwordHash})
    returning id, email, name, image
  `;
  return rows[0];
}

export async function linkAccount(userId: string, provider: string, providerAccountId: string) {
  await db()`
    insert into accounts (provider, provider_account_id, user_id)
    values (${provider}, ${providerAccountId}, ${userId})
    on conflict do nothing
  `;
}

export async function getCompletionDates(userId: string): Promise<string[]> {
  const rows = await db()`
    select distinct completed_at::date::text as d from progress_items where user_id = ${userId}
  `;
  return rows.map((r) => r.d as string);
}

// ---- resource votes ----

export interface VoteInfo {
  score: number;
  mine: 0 | 1 | -1;
}

export async function voteResource(userId: string, itemId: string, value: 0 | 1 | -1) {
  if (value === 0) {
    await db()`delete from resource_votes where user_id = ${userId} and item_id = ${itemId}`;
  } else {
    await db()`
      insert into resource_votes (user_id, item_id, value) values (${userId}, ${itemId}, ${value})
      on conflict (user_id, item_id) do update set value = ${value}, created_at = now()
    `;
  }
}

/** Aggregate scores for item ids + the caller's own votes when userId given. */
export async function getVoteData(
  itemIds: string[],
  userId?: string | null
): Promise<Map<string, VoteInfo>> {
  const map = new Map<string, VoteInfo>();
  for (const id of itemIds) map.set(id, { score: 0, mine: 0 });
  if (itemIds.length === 0) return map;

  const rows = await db()`
    select item_id, sum(value)::int as score
    from resource_votes where item_id = any(${itemIds})
    group by item_id
  `;
  for (const r of rows) {
    const cur = map.get(r.item_id as string);
    if (cur) cur.score = Number(r.score ?? 0);
  }

  if (userId) {
    const mine = await db()`
      select item_id, value from resource_votes
      where user_id = ${userId} and item_id = any(${itemIds})
    `;
    for (const m of mine) {
      const cur = map.get(m.item_id as string);
      if (cur) cur.mine = (m.value as 1 | -1) ?? 0;
    }
  }
  return map;
}

// ---- spaced repetition ----


export async function seedSrsFromQuiz(userId: string, wrongQuestionIds: string[]) {
  if (wrongQuestionIds.length === 0) return;
  await db()`
    insert into srs_cards (user_id, question_id, box, due_at)
    select ${userId}, qid, 0, current_date + 1
    from unnest(${wrongQuestionIds}::text[]) as t(qid)
    on conflict (user_id, question_id) do update set box = 0, due_at = current_date + 1, updated_at = now()
  `;
}

export async function getSrsDueIds(userId: string): Promise<string[]> {
  const rows = await db()`
    select question_id from srs_cards
    where user_id = ${userId} and due_at <= current_date
    order by box asc, updated_at asc
    limit 30
  `;
  return rows.map((r) => r.question_id as string);
}

export async function getSrsStats(userId: string): Promise<{ due: number; scheduled: number }> {
  const rows = await db()`
    select
      count(*) filter (where due_at <= current_date)::int as due,
      count(*)::int as scheduled
    from srs_cards where user_id = ${userId}
  `;
  const r = rows[0];
  return { due: Number(r?.due ?? 0), scheduled: Number(r?.scheduled ?? 0) };
}

export async function reviewSrsCard(userId: string, questionId: string, correct: boolean) {
  if (correct) {
    await db()`
      update srs_cards set
        box = least(box + 1, 5),
        due_at = current_date + (case box when 0 then 1 when 1 then 2 when 2 then 4 when 3 then 8 when 4 then 16 end),
        last_result = true,
        updated_at = now()
      where user_id = ${userId} and question_id = ${questionId}
    `;
  } else {
    await db()`
      update srs_cards set box = 0, due_at = current_date + 1, last_result = false, updated_at = now()
      where user_id = ${userId} and question_id = ${questionId}
    `;
  }
}

export async function getAllSrsQuestions(userId: string): Promise<string[]> {
  const rows =
    await db()`select question_id from srs_cards where user_id = ${userId} order by question_id`;
  return rows.map((r) => r.question_id as string);
}

// ---- profiles / leaderboard ----

export interface ProfileRow {
  id: string;
  email: string;
  name: string | null;
  handle: string | null;
  is_public: boolean;
  created_at: Date;
}

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const rows = await db()`
    select id, email, name, handle, is_public, created_at
    from users where id = ${userId} limit 1
  `;
  return (rows[0] as unknown as ProfileRow) ?? null;
}

export async function getPublicProfileByHandle(handle: string): Promise<ProfileRow | null> {
  const rows = await db()`
    select id, email, name, handle, is_public, created_at
    from users where lower(handle) = lower(${handle}) and is_public = true limit 1
  `;
  return (rows[0] as unknown as ProfileRow) ?? null;
}

/** Diagnostics only; ignores the visibility flag. */
export async function getProfileByHandleAnyVisibility(handle: string): Promise<ProfileRow | null> {
  const rows = await db()`
    select id, email, name, handle, is_public, created_at
    from users where lower(handle) = lower(${handle}) limit 1
  `;
  return (rows[0] as unknown as ProfileRow) ?? null;
}

export async function setProfile(
  userId: string,
  handle: string | null,
  isPublic: boolean
): Promise<{ ok: boolean; reason?: "taken" }> {
  try {
    await db()`
      update users set handle = ${handle}, is_public = ${isPublic} where id = ${userId}
    `;
    return { ok: true };
  } catch (err) {
    const msg = String(err);
    if (msg.includes("users_handle_unique") || msg.includes("duplicate key")) {
      return { ok: false, reason: "taken" };
    }
    throw err;
  }
}

export interface LeaderboardRow {
  id: string;
  display_name: string;
  handle: string | null;
  done_count: number;
  pillars_passed: number;
  joined_month: string;
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardRow[]> {
  const rows = await db()`
    select
      u.id,
      coalesce(u.name, u.handle, 'learner') as display_name,
      u.handle,
      (select count(*)::int from progress_items pi where pi.user_id = u.id) as done_count,
      (select count(distinct pillar_n)::int from quiz_attempts qa where qa.user_id = u.id and qa.passed) as pillars_passed,
      to_char(u.created_at, 'Mon YYYY') as joined_month
    from users u
    where u.is_public = true
    order by done_count desc, pillars_passed desc, display_name asc
    limit ${limit}
  `;
  return rows as unknown as LeaderboardRow[];
}

export interface PublicUserStats {
  done_count: number;
  joined_month: string;
  pillars_passed: number;
}

export async function getPublicUserStats(userId: string): Promise<PublicUserStats> {
  const rows = await db()`
    select
      (select count(*)::int from progress_items pi where pi.user_id = ${userId}) as done_count,
      (select count(distinct pillar_n)::int from quiz_attempts qa where qa.user_id = ${userId} and qa.passed) as pillars_passed,
      to_char((select created_at from users where id = ${userId}), 'Mon YYYY') as joined_month
  `;
  const r = rows[0];
  return {
    done_count: Number(r?.done_count ?? 0),
    pillars_passed: Number(r?.pillars_passed ?? 0),
    joined_month: String(r?.joined_month ?? ""),
  };
}

export async function getCompletionCountsByWeek(userId: string): Promise<Map<string, number>> {
  const rows = await db()`
    select to_char(date_trunc('week', completed_at), 'YYYY-MM-DD') as week, count(*)::int as n
    from progress_items
    where user_id = ${userId} and completed_at >= now() - interval '12 weeks'
    group by 1 order by 1
  `;
  return new Map(rows.map((r) => [r.week as string, Number(r.n)]));
}
