-- skilllog schema — apply in Supabase SQL Editor.
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  image text,
  password_hash text,
  created_at timestamptz not null default now()
);

create table if not exists accounts (
  provider text not null,
  provider_account_id text not null,
  user_id uuid not null references users(id) on delete cascade,
  primary key (provider, provider_account_id)
);

create table if not exists progress_items (
  user_id uuid not null references users(id) on delete cascade,
  item_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create table if not exists notes (
  user_id uuid not null references users(id) on delete cascade,
  item_id text not null,
  body text not null check (char_length(body) <= 5000),
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  pillar_n int not null check (pillar_n between 1 and 10),
  score_pct int not null check (score_pct between 0 and 100),
  passed boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists quiz_attempts_user_pillar on quiz_attempts (user_id, pillar_n);
create index if not exists progress_items_user on progress_items (user_id);

-- ---- migration: profiles, votes, spaced repetition ----

alter table users add column if not exists handle text;
alter table users add column if not exists is_public boolean not null default true;

create unique index if not exists users_handle_unique on users (handle) where handle is not null;

create table if not exists resource_votes (
  user_id uuid not null references users(id) on delete cascade,
  item_id text not null,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create index if not exists resource_votes_item on resource_votes (item_id);

-- Leitner boxes 0..5; box 0 = relearn. due_at drives the /review queue.
create table if not exists srs_cards (
  user_id uuid not null references users(id) on delete cascade,
  question_id text not null,
  box smallint not null default 0 check (box between 0 and 5),
  due_at date not null default current_date,
  last_result boolean,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index if not exists srs_cards_due on srs_cards (user_id, due_at);
