-- LangWeb baza jadvallari — Neon SQL Editor da bir marta ishga tushiring
-- https://console.neon.tech > SQL Editor > Paste > Run
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  avatar text NOT NULL DEFAULT 'M',
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  current_level text NOT NULL DEFAULT 'A1',
  target_level text NOT NULL DEFAULT 'B2',
  deadline_days integer NOT NULL DEFAULT 90,
  daily_minutes integer NOT NULL DEFAULT 25,
  days_per_week integer NOT NULL DEFAULT 5,
  purpose text NOT NULL DEFAULT 'ish',
  interests jsonb NOT NULL DEFAULT '[]',
  weak_areas jsonb NOT NULL DEFAULT '[]',
  streak_days integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  freeze_available integer NOT NULL DEFAULT 1,
  last_active_date date,
  total_xp integer NOT NULL DEFAULT 0,
  completed_count integer NOT NULL DEFAULT 0,
  start_date date,
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  level text NOT NULL DEFAULT 'A1',
  weak_areas jsonb NOT NULL DEFAULT '[]',
  writing_text text DEFAULT '',
  writing_score integer DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_days integer NOT NULL DEFAULT 90,
  start_date date NOT NULL,
  weeks jsonb NOT NULL DEFAULT '[]',
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS daily_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  kind text NOT NULL,
  title text NOT NULL,
  title_uz text NOT NULL DEFAULT '',
  minutes integer NOT NULL DEFAULT 6,
  status text NOT NULL DEFAULT 'ready',
  "order" integer NOT NULL DEFAULT 0,
  payload jsonb NOT NULL DEFAULT '{}',
  result jsonb NOT NULL DEFAULT '{}',
  xp integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS vocab_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word text NOT NULL,
  translation text NOT NULL,
  example text NOT NULL DEFAULT '',
  example_uz text NOT NULL DEFAULT '',
  ef double precision NOT NULL DEFAULT 2.5,
  interval integer NOT NULL DEFAULT 0,
  reps integer NOT NULL DEFAULT 0,
  lapses integer NOT NULL DEFAULT 0,
  next_review date NOT NULL,
  last_quality integer DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  xp integer NOT NULL DEFAULT 0,
  meta jsonb NOT NULL DEFAULT '{}',
  created_at timestamp NOT NULL DEFAULT now()
);
