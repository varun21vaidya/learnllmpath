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
